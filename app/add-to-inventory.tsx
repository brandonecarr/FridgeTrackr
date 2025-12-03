import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, Modal, Platform } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { format, addDays, parse } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Package, Refrigerator, Calendar, ChevronDown } from 'lucide-react-native';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';

export default function AddToInventoryScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams<{ itemId: string }>();

  const {
    shoppingList,
    storageAreas,
    settings,
    addCompletedItemToInventory,
  } = useStore();

  const selectedItem = itemId ? shoppingList.find((i) => i.id === itemId) : null;

  const [selectedStorageAreaId, setSelectedStorageAreaId] = useState('');
  const [selectedLocationZoneId, setSelectedLocationZoneId] = useState('');
  const [expirationDate, setExpirationDate] = useState(format(addDays(new Date(), settings.defaultExpirationDays), 'yyyy-MM-dd'));
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Refs for auto-scrolling to selected zone
  const zoneScrollViewRefs = useRef<{ [key: string]: ScrollView | null }>({});

  // Initialize storage location from last known location or defaults
  useEffect(() => {
    if (selectedItem) {
      // Use the last storage location if available, otherwise use first storage area
      const defaultStorageAreaId = selectedItem.lastStorageAreaId || storageAreas[0]?.id || '';
      const defaultLocationZoneId = selectedItem.lastLocationZoneId || '';

      // Verify the storage area still exists
      const storageAreaExists = storageAreas.find((a) => a.id === defaultStorageAreaId);

      setSelectedStorageAreaId(storageAreaExists ? defaultStorageAreaId : storageAreas[0]?.id || '');
      setSelectedLocationZoneId(storageAreaExists ? defaultLocationZoneId : '');
    }
  }, [selectedItem, storageAreas]);

  // Auto-scroll to selected zone when modal opens
  useEffect(() => {
    if (selectedLocationZoneId && selectedStorageAreaId) {
      // Small delay to ensure the ScrollView is rendered
      setTimeout(() => {
        const scrollView = zoneScrollViewRefs.current[selectedStorageAreaId];
        const selectedStorageArea = storageAreas.find((a) => a.id === selectedStorageAreaId);

        if (scrollView && selectedStorageArea) {
          const zoneIndex = selectedStorageArea.locationZones.findIndex((z) => z.id === selectedLocationZoneId);
          if (zoneIndex > 0) {
            // Scroll to make the selected zone visible (approximate calculation)
            scrollView.scrollTo({ x: zoneIndex * 80, animated: true });
          }
        }
      }, 100);
    }
  }, [selectedLocationZoneId, selectedStorageAreaId]);

  const handleCancel = () => {
    router.back();
  };

  const handleAdd = () => {
    if (itemId && selectedStorageAreaId) {
      addCompletedItemToInventory(itemId, selectedStorageAreaId, selectedLocationZoneId || undefined, expirationDate);
      router.back();
    }
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

  if (!selectedItem) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add to Inventory',
          headerBackTitle: 'Cancel',
          presentation: 'modal',
          headerLeft: () => (
            <Pressable
              onPress={handleCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ paddingHorizontal: 12, paddingVertical: 4 }}
            >
              <Text className="text-blue-500 font-medium text-base">Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={handleAdd}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ paddingHorizontal: 12, paddingVertical: 4 }}
            >
              <Text className="text-blue-500 font-semibold text-base">Add</Text>
            </Pressable>
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 p-5" keyboardShouldPersistTaps="handled">
          {/* Item Preview */}
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-xl bg-emerald-100 items-center justify-center mr-3">
                <Package size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-slate-800">
                  {selectedItem.name}
                </Text>
                <Text className="text-sm text-slate-500">
                  {selectedItem.quantity} {selectedItem.unit}
                </Text>
              </View>
            </View>
          </Card>

          {/* Storage Location */}
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center mb-3">
              <Refrigerator size={18} color="#3B82F6" />
              <Text className="text-sm font-medium text-slate-700 ml-2">Storage Location</Text>
            </View>
            {storageAreas.map((area) => (
              <View key={area.id}>
                <Pressable
                  onPress={() => {
                    setSelectedStorageAreaId(area.id);
                    setSelectedLocationZoneId('');
                  }}
                  className={`p-4 rounded-lg mb-2 ${
                    selectedStorageAreaId === area.id ? 'bg-blue-100' : 'bg-gray-50'
                  }`}
                >
                  <Text
                    className={`font-medium text-lg ${
                      selectedStorageAreaId === area.id ? 'text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    {area.name}
                  </Text>
                  <Text className="text-sm text-slate-500 capitalize">
                    {area.type === 'custom' && area.customTypeLabel ? area.customTypeLabel : area.type}
                  </Text>
                </Pressable>

                {/* Zone Selection for selected storage area */}
                {selectedStorageAreaId === area.id && area.locationZones.length > 0 && (
                  <View className="ml-4 mb-2">
                    <Text className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                      Zone (optional)
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      ref={(ref) => {
                        if (ref) {
                          zoneScrollViewRefs.current[area.id] = ref;
                        }
                      }}
                    >
                      <Pressable
                        onPress={() => setSelectedLocationZoneId('')}
                        className={`px-3 py-2 rounded-lg mr-2 ${
                          !selectedLocationZoneId ? 'bg-blue-500' : 'bg-gray-100'
                        }`}
                      >
                        <Text
                          className={`font-medium ${
                            !selectedLocationZoneId ? 'text-white' : 'text-slate-600'
                          }`}
                        >
                          Any
                        </Text>
                      </Pressable>
                      {area.locationZones.map((zone) => (
                        <Pressable
                          key={zone.id}
                          onPress={() => setSelectedLocationZoneId(zone.id)}
                          className={`px-3 py-2 rounded-lg mr-2 ${
                            selectedLocationZoneId === zone.id ? 'bg-blue-500' : 'bg-gray-100'
                          }`}
                        >
                          <Text
                            className={`font-medium ${
                              selectedLocationZoneId === zone.id ? 'text-white' : 'text-slate-600'
                            }`}
                          >
                            {zone.name}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ))}
          </Card>

          {/* Expiration Date */}
          <Card variant="elevated">
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
        </ScrollView>

        {/* Date Picker for iOS */}
        {Platform.OS === 'ios' && showDatePicker && (
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
        )}

        {/* Date Picker for Android */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={expirationDate ? parse(expirationDate, 'yyyy-MM-dd', new Date()) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </SafeAreaView>
    </>
  );
}
