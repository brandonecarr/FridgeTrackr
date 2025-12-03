import React from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Package } from 'lucide-react-native';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';

export default function ChangeStoreScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams<{ itemId: string }>();

  const {
    shoppingList,
    stores,
    updateShoppingListItem,
  } = useStore();

  const selectedItem = itemId ? shoppingList.find((i) => i.id === itemId) : null;

  const handleStoreSelection = (storeId: string) => {
    if (itemId) {
      updateShoppingListItem(itemId, { storeId });
      router.back();
    }
  };

  if (!selectedItem) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Change Store',
          headerBackTitle: 'Cancel',
          presentation: 'modal',
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ paddingHorizontal: 12, paddingVertical: 4 }}
            >
              <Text className="text-blue-500 font-medium text-base">Cancel</Text>
            </Pressable>
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 p-5" keyboardShouldPersistTaps="handled">
          {/* Item Preview */}
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center mr-3">
                <Package size={24} color="#3B82F6" />
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

          {/* Store Selection */}
          <Text className="text-sm text-slate-600 mb-4">
            Select a store for this item:
          </Text>

          {stores.length === 0 ? (
            <View className="p-4 bg-amber-50 rounded-lg">
              <Text className="text-sm text-amber-800">
                No stores available. Please add a store in Settings first.
              </Text>
            </View>
          ) : (
            stores.map((storeItem) => {
              const isCurrentStore = selectedItem.storeId === storeItem.id;
              return (
                <Pressable
                  key={storeItem.id}
                  onPress={() => handleStoreSelection(storeItem.id)}
                  className={`flex-row items-center p-4 mb-3 rounded-xl border ${
                    isCurrentStore
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 active:bg-gray-50'
                  }`}
                >
                  <View
                    className="w-12 h-12 rounded-full mr-4 items-center justify-center"
                    style={{ backgroundColor: storeItem.color ? `${storeItem.color}20` : '#F3F4F6' }}
                  >
                    <View
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: storeItem.color || '#64748B' }}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-lg font-semibold ${
                        isCurrentStore ? 'text-blue-600' : 'text-slate-800'
                      }`}
                    >
                      {storeItem.name}
                    </Text>
                    {isCurrentStore && (
                      <Text className="text-sm text-blue-600">Current store</Text>
                    )}
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
