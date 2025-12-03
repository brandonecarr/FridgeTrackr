import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useNavigation } from 'expo-router';
import { Camera, X, Scan, Calendar, ChevronDown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addDays, parse } from 'date-fns';
import { useStore } from '@/store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function AddItemScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    storageAreaId?: string;
    barcode?: string;
    name?: string;
    itemId?: string;
  }>();

  const { storageAreas, stores, items, addItem, updateItem, getBarcodeCatalogEntry, updateBarcodeCatalogEntry, settings } =
    useStore();

  const existingItem = params.itemId ? items.find((i) => i.id === params.itemId) : undefined;
  const isEditing = Boolean(existingItem);

  // Form state
  const [name, setName] = useState(existingItem?.name || params.name || '');
  const [barcode, setBarcode] = useState(existingItem?.barcode || params.barcode || '');
  const [quantity, setQuantity] = useState(String(existingItem?.quantity || 1));
  const [unit, setUnit] = useState(existingItem?.unit || 'item');
  const [photoUri, setPhotoUri] = useState(existingItem?.photoUri || '');
  const [expirationDate, setExpirationDate] = useState(
    existingItem?.expirationDate || format(addDays(new Date(), settings.defaultExpirationDays), 'yyyy-MM-dd')
  );
  const [storageAreaId, setStorageAreaId] = useState(
    existingItem?.storageAreaId || params.storageAreaId || storageAreas[0]?.id || ''
  );
  const [locationZoneId, setLocationZoneId] = useState(existingItem?.locationZoneId || '');
  const [defaultStoreId, setDefaultStoreId] = useState(existingItem?.defaultStoreId || stores[0]?.id || '');

  // Initialize aisle from item first, then fallback to barcode catalog
  const initialAisle = existingItem?.aisle ||
    (existingItem?.barcode ? getBarcodeCatalogEntry(existingItem.barcode)?.aisle || '' : '');
  const [aisle, setAisle] = useState(initialAisle);
  const [notes, setNotes] = useState(existingItem?.notes || '');
  const [approximateCost, setApproximateCost] = useState(
    existingItem?.approximateCost ? String(existingItem.approximateCost) : ''
  );
  const [category, setCategory] = useState(existingItem?.category || '');

  // UI state
  const [showStoragePicker, setShowStoragePicker] = useState(false);
  const [showZonePicker, setShowZonePicker] = useState(false);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const selectedStorageArea = storageAreas.find((a) => a.id === storageAreaId);
  const selectedZone = selectedStorageArea?.locationZones.find((z) => z.id === locationZoneId);
  const selectedStore = stores.find((s) => s.id === defaultStoreId);

  // Auto-fill from barcode catalog
  useEffect(() => {
    if (params.barcode && !isEditing) {
      const catalogEntry = getBarcodeCatalogEntry(params.barcode);
      if (catalogEntry) {
        setName(catalogEntry.name);
        setUnit(catalogEntry.defaultUnit);
        setQuantity(String(catalogEntry.defaultQuantity));
        if (catalogEntry.photoUri) {
          setPhotoUri(catalogEntry.photoUri);
        }
        if (catalogEntry.aisle) {
          setAisle(catalogEntry.aisle);
        }
      }
    }
  }, [params.barcode]);

  // Intercept back navigation to warn about unsaved changes
  useEffect(() => {
    const beforeRemove = (e: any) => {
      if (!hasUnsavedChanges()) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    };

    navigation.addListener('beforeRemove', beforeRemove);

    return () => navigation.removeListener('beforeRemove', beforeRemove);
  }, [navigation, hasUnsavedChanges]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleScanBarcode = () => {
    router.push({
      pathname: '/scanner',
      params: { returnTo: 'add-item' },
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setExpirationDate(format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  const handleDatePickerDone = () => {
    setShowDatePicker(false);
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (isEditing && existingItem) {
      // Check if anything has changed from the existing item
      return (
        name.trim() !== existingItem.name ||
        quantity !== String(existingItem.quantity) ||
        unit !== existingItem.unit ||
        storageAreaId !== existingItem.storageAreaId ||
        locationZoneId !== (existingItem.locationZoneId || '') ||
        defaultStoreId !== (existingItem.defaultStoreId || '') ||
        aisle !== (existingItem.aisle || '') ||
        notes !== (existingItem.notes || '') ||
        photoUri !== (existingItem.photoUri || '')
      );
    } else {
      // For new items, check if any field has been filled
      return name.trim() !== '' || photoUri !== '' || notes.trim() !== '' || aisle.trim() !== '';
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter an item name');
      return;
    }

    if (!storageAreaId) {
      alert('Please select a storage area');
      return;
    }

    const itemData = {
      name: name.trim(),
      barcode: barcode || undefined,
      quantity: parseInt(quantity) || 1,
      unit,
      photoUri: photoUri || undefined,
      expirationDate,
      storageAreaId,
      locationZoneId: locationZoneId || undefined,
      defaultStoreId: defaultStoreId || undefined,
      aisle: aisle.trim() || undefined,
      notes: notes.trim() || undefined,
      approximateCost: approximateCost ? parseFloat(approximateCost) : undefined,
      category: category.trim() || undefined,
    };

    if (isEditing && existingItem) {
      updateItem(existingItem.id, itemData);
    } else {
      addItem(itemData);
    }

    // Update barcode catalog with aisle if provided
    if (barcode && aisle.trim()) {
      updateBarcodeCatalogEntry(barcode, { aisle: aisle.trim() });
    }

    router.back();
  };

  const units = ['item', 'pack', 'bottle', 'can', 'box', 'bag', 'lb', 'oz', 'kg', 'g', 'L', 'ml'];

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit Item' : 'Add Item',
          headerBackTitle: 'Cancel',
          presentation: 'modal',
          gestureEnabled: !hasUnsavedChanges(),
          headerLeft: () => (
            <Pressable
              onPress={handleCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ paddingHorizontal: 12, paddingVertical: 4 }}
            >
              <Text className="text-blue-500 font-medium text-base">Cancel</Text>
            </Pressable>
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View className="p-5">
              {/* Photo Section */}
              <Card variant="elevated" className="mb-4">
                <View className="items-center py-4">
                  {photoUri ? (
                    <View className="relative">
                      <Image
                        source={{ uri: photoUri }}
                        className="w-32 h-32 rounded-xl"
                        resizeMode="cover"
                      />
                      <Pressable
                        onPress={() => setPhotoUri('')}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
                      >
                        <X size={16} color="white" />
                      </Pressable>
                    </View>
                  ) : (
                    <View className="w-32 h-32 rounded-xl bg-gray-100 items-center justify-center">
                      <Camera size={32} color="#9CA3AF" />
                    </View>
                  )}
                  <View className="flex-row gap-3 mt-4">
                    <Button variant="outline" size="sm" onPress={handleTakePhoto}>
                      Take Photo
                    </Button>
                    <Button variant="outline" size="sm" onPress={handlePickImage}>
                      Choose Photo
                    </Button>
                  </View>
                </View>
              </Card>

              {/* Item Details */}
              <Card variant="elevated" className="mb-4">
                <View className="gap-4">
                  <Input
                    label="Item Name"
                    placeholder="Enter item name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />

                  <View className="flex-row items-end gap-3">
                    <View className="flex-1">
                      <Input
                        label="Barcode"
                        placeholder="Scan or enter barcode"
                        value={barcode}
                        onChangeText={setBarcode}
                        keyboardType="number-pad"
                      />
                    </View>
                    <Button
                      variant="secondary"
                      size="md"
                      onPress={handleScanBarcode}
                      leftIcon={<Scan size={18} color="#374151" />}
                    >
                      Scan
                    </Button>
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Input
                        label="Quantity"
                        placeholder="1"
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-slate-700 mb-1.5">Unit</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="h-12"
                      >
                        {units.map((u) => (
                          <Pressable
                            key={u}
                            onPress={() => setUnit(u)}
                            className={`px-4 h-full justify-center rounded-xl mr-2 ${
                              unit === u ? 'bg-blue-500' : 'bg-gray-100'
                            }`}
                          >
                            <Text
                              className={`font-medium ${
                                unit === u ? 'text-white' : 'text-slate-600'
                              }`}
                            >
                              {u}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              </Card>

              {/* Expiration Date */}
              <Card variant="elevated" className="mb-4">
                <Text className="text-sm font-medium text-slate-700 mb-2">Expiration Date</Text>
                <View className="flex-row gap-2 mb-3">
                  {[0, 3, 7, 14, 30].map((days) => (
                    <Pressable
                      key={days}
                      onPress={() =>
                        setExpirationDate(format(addDays(new Date(), days), 'yyyy-MM-dd'))
                      }
                      className={`flex-1 py-2 rounded-lg items-center ${
                        expirationDate === format(addDays(new Date(), days), 'yyyy-MM-dd')
                          ? 'bg-blue-500'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          expirationDate === format(addDays(new Date(), days), 'yyyy-MM-dd')
                            ? 'text-white'
                            : 'text-slate-600'
                        }`}
                      >
                        {days === 0 ? 'Today' : `+${days}d`}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <View className="flex-row items-center">
                    <Calendar size={20} color="#64748B" className="mr-2" />
                    <Text className="text-base text-slate-800 ml-2">
                      {expirationDate ? format(parse(expirationDate, 'yyyy-MM-dd', new Date()), 'MMM dd, yyyy') : 'Select date'}
                    </Text>
                  </View>
                  <ChevronDown size={20} color="#64748B" />
                </Pressable>
              </Card>

              {/* Location */}
              <Card variant="elevated" className="mb-4">
                <Text className="text-sm font-medium text-slate-700 mb-2">Storage Location</Text>

                {/* Storage Area Selector */}
                <Pressable
                  onPress={() => setShowStoragePicker(!showStoragePicker)}
                  className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl mb-2"
                >
                  <Text className="text-base text-slate-800">
                    {selectedStorageArea?.name || 'Select Storage Area'}
                  </Text>
                  <ChevronDown size={20} color="#64748B" />
                </Pressable>

                {showStoragePicker && (
                  <View className="mb-3 bg-gray-50 rounded-xl p-2">
                    {storageAreas.map((area) => (
                      <Pressable
                        key={area.id}
                        onPress={() => {
                          setStorageAreaId(area.id);
                          setLocationZoneId('');
                          setShowStoragePicker(false);
                        }}
                        className={`p-3 rounded-lg ${
                          storageAreaId === area.id ? 'bg-blue-100' : ''
                        }`}
                      >
                        <Text
                          className={`font-medium ${
                            storageAreaId === area.id ? 'text-blue-600' : 'text-slate-700'
                          }`}
                        >
                          {area.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Zone Selector */}
                {selectedStorageArea && selectedStorageArea.locationZones.length > 0 && (
                  <>
                    <Pressable
                      onPress={() => setShowZonePicker(!showZonePicker)}
                      className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <Text className="text-base text-slate-800">
                        {selectedZone?.name || 'Select Zone (Optional)'}
                      </Text>
                      <ChevronDown size={20} color="#64748B" />
                    </Pressable>

                    {showZonePicker && (
                      <View className="mt-2 bg-gray-50 rounded-xl p-2">
                        <Pressable
                          onPress={() => {
                            setLocationZoneId('');
                            setShowZonePicker(false);
                          }}
                          className={`p-3 rounded-lg ${!locationZoneId ? 'bg-blue-100' : ''}`}
                        >
                          <Text
                            className={`font-medium ${
                              !locationZoneId ? 'text-blue-600' : 'text-slate-700'
                            }`}
                          >
                            No specific zone
                          </Text>
                        </Pressable>
                        {selectedStorageArea.locationZones.map((zone) => (
                          <Pressable
                            key={zone.id}
                            onPress={() => {
                              setLocationZoneId(zone.id);
                              setShowZonePicker(false);
                            }}
                            className={`p-3 rounded-lg ${
                              locationZoneId === zone.id ? 'bg-blue-100' : ''
                            }`}
                          >
                            <Text
                              className={`font-medium ${
                                locationZoneId === zone.id ? 'text-blue-600' : 'text-slate-700'
                              }`}
                            >
                              {zone.name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </Card>

              {/* Default Store */}
              <Card variant="elevated" className="mb-4">
                <Text className="text-sm font-medium text-slate-700 mb-2">
                  Default Store (for shopping list)
                </Text>
                <Pressable
                  onPress={() => setShowStorePicker(!showStorePicker)}
                  className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <Text className="text-base text-slate-800">
                    {selectedStore?.name || 'Select Store'}
                  </Text>
                  <ChevronDown size={20} color="#64748B" />
                </Pressable>

                {showStorePicker && (
                  <View className="mt-2 bg-gray-50 rounded-xl p-2">
                    {stores.map((store) => (
                      <Pressable
                        key={store.id}
                        onPress={() => {
                          setDefaultStoreId(store.id);
                          setShowStorePicker(false);
                        }}
                        className={`p-3 rounded-lg ${
                          defaultStoreId === store.id ? 'bg-blue-100' : ''
                        }`}
                      >
                        <Text
                          className={`font-medium ${
                            defaultStoreId === store.id ? 'text-blue-600' : 'text-slate-700'
                          }`}
                        >
                          {store.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </Card>

              {/* Aisle */}
              <Card variant="elevated" className="mb-4">
                <Input
                  label="Aisle (Optional)"
                  placeholder="e.g., A5, Dairy, 12"
                  value={aisle}
                  onChangeText={setAisle}
                />
                <Text className="text-xs text-slate-500 mt-1">
                  Store aisle location for shopping list
                </Text>
              </Card>

              {/* Category */}
              <Card variant="elevated" className="mb-4">
                <Input
                  label="Category (Optional)"
                  placeholder="e.g., Produce, Dairy, Meat"
                  value={category}
                  onChangeText={setCategory}
                />
                <Text className="text-xs text-slate-500 mt-1">
                  Used for waste analytics grouping
                </Text>
              </Card>

              {/* Approximate Cost */}
              <Card variant="elevated" className="mb-4">
                <Input
                  label="Approximate Cost (Optional)"
                  placeholder="0.00"
                  value={approximateCost}
                  onChangeText={setApproximateCost}
                  keyboardType="decimal-pad"
                />
                <Text className="text-xs text-slate-500 mt-1">
                  Helps track savings and waste analytics
                </Text>
              </Card>

              {/* Notes */}
              <Card variant="elevated" className="mb-6">
                <Input
                  label="Notes (Optional)"
                  placeholder="Add any notes about this item..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  className="h-20"
                />
              </Card>

              {/* Save Button */}
              <Button onPress={handleSave} size="lg" className="w-full">
                {isEditing ? 'Save Changes' : 'Add Item'}
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Date Picker */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl" style={{ transform: [{ translateY: 0 }] }}>
              <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ paddingHorizontal: 12, paddingVertical: 4 }}
                >
                  <Text className="text-blue-500 font-medium text-base">Cancel</Text>
                </Pressable>
                <Text className="text-lg font-semibold text-slate-800">Select Date</Text>
                <Pressable
                  onPress={handleDatePickerDone}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ paddingHorizontal: 12, paddingVertical: 4 }}
                >
                  <Text className="text-blue-500 font-semibold text-base">Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={expirationDate ? parse(expirationDate, 'yyyy-MM-dd', new Date()) : new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                textColor="#000000"
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={expirationDate ? parse(expirationDate, 'yyyy-MM-dd', new Date()) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )
      )}
    </>
  );
}
