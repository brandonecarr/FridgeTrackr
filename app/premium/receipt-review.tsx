import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import {
  Check,
  X,
  Edit2,
  ShoppingCart,
  Trash2,
  ChevronDown,
  DollarSign,
  Package,
} from 'lucide-react-native';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ScannedReceiptItem } from '@/types';
import { suggestStorageArea, suggestCategory } from '@/utils/receiptOCR';
import { format, addDays } from 'date-fns';

export default function ReceiptReviewScreen() {
  const router = useRouter();
  const { imageUri, receiptData } = useLocalSearchParams<{
    imageUri: string;
    receiptData: string;
  }>();

  const { storageAreas, addItem } = useStore();

  // Parse receipt data
  const parsedData = useMemo(() => {
    if (!receiptData) return null;
    try {
      return JSON.parse(receiptData);
    } catch (error) {
      console.error('Failed to parse receipt data:', error);
      return null;
    }
  }, [receiptData]);

  const [items, setItems] = useState<ScannedReceiptItem[]>(
    parsedData?.items || []
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Get storage area IDs for suggestions
  const storageAreaIds = useMemo(() => {
    return {
      fridge: storageAreas.find(a => a.type === 'fridge')?.id,
      freezer: storageAreas.find(a => a.type === 'freezer')?.id,
      pantry: storageAreas.find(a => a.type === 'pantry')?.id,
    };
  }, [storageAreas]);

  if (!parsedData) {
    return (
      <>
        <Stack.Screen options={{ title: 'Review Receipt' }} />
        <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
          <Text className="text-slate-600">Invalid receipt data</Text>
        </SafeAreaView>
      </>
    );
  }

  const handleToggleItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems[index].isConfirmed = !updatedItems[index].isConfirmed;
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedItems = items.filter((_, i) => i !== index);
            setItems(updatedItems);
          },
        },
      ]
    );
  };

  const handleEditItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...items];
    (updatedItems[index] as any)[field] = value;
    setItems(updatedItems);
  };

  const handleAddToInventory = () => {
    const confirmedItems = items.filter(item => item.isConfirmed);

    if (confirmedItems.length === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to add.');
      return;
    }

    // Add each item to inventory
    confirmedItems.forEach(item => {
      const suggestedStorage = suggestStorageArea(item.suggestedName, storageAreaIds);
      const category = suggestCategory(item.suggestedName);

      addItem({
        name: item.suggestedName,
        quantity: item.quantity,
        unit: item.unit,
        expirationDate: format(
          addDays(new Date(), item.suggestedExpirationDays || 14),
          'yyyy-MM-dd'
        ),
        storageAreaId: suggestedStorage || storageAreas[0]?.id || '',
        approximateCost: item.price,
        category,
      });
    });

    Alert.alert(
      'Success',
      `Added ${confirmedItems.length} item${confirmedItems.length > 1 ? 's' : ''} to your inventory!`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const selectedCount = items.filter(item => item.isConfirmed).length;
  const totalValue = items
    .filter(item => item.isConfirmed)
    .reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Review Receipt',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Receipt Image */}
          {imageUri && (
            <View className="px-6 pt-4 pb-2">
              <Card variant="elevated" className="overflow-hidden">
                <Image
                  source={{ uri: imageUri }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
              </Card>
            </View>
          )}

          {/* Store Info */}
          <View className="px-6 pt-2 pb-4">
            <Card variant="elevated" className="p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-slate-500 text-xs mb-1">Store</Text>
                  <Text className="text-slate-900 text-lg font-bold">
                    {parsedData.storeName || 'Unknown Store'}
                  </Text>
                </View>
                {parsedData.totalAmount && (
                  <View className="items-end">
                    <Text className="text-slate-500 text-xs mb-1">Total</Text>
                    <Text className="text-slate-900 text-lg font-bold">
                      ${parsedData.totalAmount.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          </View>

          {/* Instructions */}
          <View className="px-6 pb-4">
            <Text className="text-slate-600 text-sm">
              Review and confirm items to add to your inventory. Tap items to select/deselect.
            </Text>
          </View>

          {/* Items List */}
          <View className="px-6 pb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-slate-900 text-lg font-bold">Items ({items.length})</Text>
              <Pressable
                onPress={() => {
                  const allSelected = items.every(item => item.isConfirmed);
                  setItems(items.map(item => ({ ...item, isConfirmed: !allSelected })));
                }}
              >
                <Text className="text-blue-500 font-semibold">
                  {items.every(item => item.isConfirmed) ? 'Deselect All' : 'Select All'}
                </Text>
              </Pressable>
            </View>

            {items.map((item, index) => (
              <Card
                key={index}
                variant="elevated"
                className={`mb-3 overflow-hidden ${
                  item.isConfirmed ? 'border-2 border-blue-500' : ''
                }`}
              >
                <Pressable onPress={() => handleToggleItem(index)}>
                  <View className="p-4">
                    <View className="flex-row items-start justify-between mb-2">
                      {/* Checkbox */}
                      <View
                        className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                          item.isConfirmed
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-slate-300'
                        }`}
                      >
                        {item.isConfirmed && <Check size={16} color="white" strokeWidth={3} />}
                      </View>

                      {/* Item Details */}
                      <View className="flex-1">
                        <Text className="text-slate-900 text-base font-semibold mb-1">
                          {item.suggestedName}
                        </Text>
                        <Text className="text-slate-500 text-xs mb-2">{item.text}</Text>

                        <View className="flex-row items-center gap-4">
                          <View className="flex-row items-center">
                            <Package size={14} color="#64748b" />
                            <Text className="text-slate-600 text-sm ml-1">
                              {item.quantity} {item.unit}
                            </Text>
                          </View>
                          {item.price && (
                            <View className="flex-row items-center">
                              <DollarSign size={14} color="#64748b" />
                              <Text className="text-slate-600 text-sm">
                                {item.price.toFixed(2)}
                              </Text>
                            </View>
                          )}
                          {item.suggestedExpirationDays && (
                            <Text className="text-slate-500 text-xs">
                              Exp: +{item.suggestedExpirationDays}d
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Actions */}
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            setEditingIndex(editingIndex === index ? null : index);
                          }}
                          className="w-8 h-8 bg-slate-100 rounded-lg items-center justify-center"
                        >
                          <Edit2 size={16} color="#475569" />
                        </Pressable>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(index);
                          }}
                          className="w-8 h-8 bg-red-50 rounded-lg items-center justify-center"
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </Pressable>
                      </View>
                    </View>

                    {/* Edit Form */}
                    {editingIndex === index && (
                      <View className="mt-3 pt-3 border-t border-slate-200">
                        <View className="flex-row gap-2 mb-2">
                          <View className="flex-1">
                            <Text className="text-slate-600 text-xs mb-1">Name</Text>
                            <TextInput
                              value={item.suggestedName}
                              onChangeText={(text) =>
                                handleEditItem(index, 'suggestedName', text)
                              }
                              className="bg-slate-50 rounded-lg px-3 py-2 text-slate-900"
                            />
                          </View>
                        </View>
                        <View className="flex-row gap-2">
                          <View className="flex-1">
                            <Text className="text-slate-600 text-xs mb-1">Quantity</Text>
                            <TextInput
                              value={String(item.quantity)}
                              onChangeText={(text) =>
                                handleEditItem(index, 'quantity', parseFloat(text) || 1)
                              }
                              keyboardType="decimal-pad"
                              className="bg-slate-50 rounded-lg px-3 py-2 text-slate-900"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-slate-600 text-xs mb-1">Unit</Text>
                            <TextInput
                              value={item.unit}
                              onChangeText={(text) => handleEditItem(index, 'unit', text)}
                              className="bg-slate-50 rounded-lg px-3 py-2 text-slate-900"
                            />
                          </View>
                          {item.price !== undefined && (
                            <View className="flex-1">
                              <Text className="text-slate-600 text-xs mb-1">Price</Text>
                              <TextInput
                                value={String(item.price)}
                                onChangeText={(text) =>
                                  handleEditItem(index, 'price', parseFloat(text) || 0)
                                }
                                keyboardType="decimal-pad"
                                className="bg-slate-50 rounded-lg px-3 py-2 text-slate-900"
                              />
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                </Pressable>
              </Card>
            ))}
          </View>

          {/* Summary */}
          <View className="px-6 pb-6">
            <Card variant="elevated" className="p-4 bg-blue-50">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-slate-700 text-sm">Selected Items</Text>
                <Text className="text-blue-600 text-lg font-bold">{selectedCount}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-700 text-sm">Total Value</Text>
                <Text className="text-blue-600 text-lg font-bold">
                  ${totalValue.toFixed(2)}
                </Text>
              </View>
            </Card>
          </View>

          {/* Add to Inventory Button */}
          <View className="px-6 pb-8">
            <Button
              onPress={handleAddToInventory}
              disabled={selectedCount === 0}
              size="lg"
              className="w-full"
            >
              <View className="flex-row items-center justify-center">
                <ShoppingCart size={20} color="white" strokeWidth={2.5} />
                <Text className="text-white text-lg font-semibold ml-2">
                  Add {selectedCount} Item{selectedCount !== 1 ? 's' : ''} to Inventory
                </Text>
              </View>
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
