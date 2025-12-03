import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function AddShoppingItemScreen() {
  const router = useRouter();
  const { stores, addShoppingListItem } = useStore();

  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('item');
  const [newItemStoreId, setNewItemStoreId] = useState(stores[0]?.id || '');
  const [newItemAisle, setNewItemAisle] = useState('');

  const units = ['item', 'pack', 'bottle', 'can', 'box', 'bag', 'lb', 'oz', 'kg', 'g', 'L', 'ml'];

  const handleCancel = () => {
    router.back();
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Missing Name', 'Please enter an item name');
      return;
    }

    if (!newItemStoreId) {
      Alert.alert('Missing Store', 'Please select a store');
      return;
    }

    addShoppingListItem({
      name: newItemName.trim(),
      quantity: parseInt(newItemQuantity) || 1,
      unit: newItemUnit,
      storeId: newItemStoreId,
      aisle: newItemAisle.trim() || undefined,
    });

    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add to Shopping List',
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
              onPress={handleAddItem}
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
          <Card variant="elevated" className="mb-4">
            <View className="gap-4">
              <Input
                label="Item Name"
                placeholder="What do you need to buy?"
                value={newItemName}
                onChangeText={setNewItemName}
                autoFocus
                autoCapitalize="words"
              />

              <Input
                label="Aisle (Optional)"
                placeholder="e.g., A5, Dairy, 12"
                value={newItemAisle}
                onChangeText={setNewItemAisle}
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Quantity"
                    placeholder="1"
                    value={newItemQuantity}
                    onChangeText={setNewItemQuantity}
                    keyboardType="number-pad"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-slate-700 mb-1.5">Unit</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {units.map((u) => (
                      <Pressable
                        key={u}
                        onPress={() => setNewItemUnit(u)}
                        className={`px-3 py-3 rounded-lg mr-2 ${
                          newItemUnit === u ? 'bg-blue-500' : 'bg-gray-100'
                        }`}
                      >
                        <Text
                          className={`font-medium ${
                            newItemUnit === u ? 'text-white' : 'text-slate-600'
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

          <Card variant="elevated">
            <Text className="text-sm font-medium text-slate-700 mb-3">Store</Text>
            {stores.length === 0 ? (
              <View className="p-4 bg-amber-50 rounded-lg">
                <Text className="text-sm text-amber-800">
                  No stores available. Please add a store in Settings first.
                </Text>
              </View>
            ) : (
              stores.map((store) => (
                <Pressable
                  key={store.id}
                  onPress={() => setNewItemStoreId(store.id)}
                  className={`p-4 rounded-lg mb-2 ${
                    newItemStoreId === store.id ? 'bg-blue-100' : 'bg-gray-50'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      newItemStoreId === store.id ? 'text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    {store.name}
                  </Text>
                </Pressable>
              ))
            )}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
