import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function EditStoreScreen() {
  const router = useRouter();
  const { storeId } = useLocalSearchParams<{ storeId?: string }>();

  const { stores, addStore, updateStore } = useStore();

  const [storeName, setStoreName] = useState('');
  const [storeColor, setStoreColor] = useState('#3B82F6');

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  ];

  const isEditing = !!storeId;

  useEffect(() => {
    if (storeId) {
      const store = stores.find((s) => s.id === storeId);
      if (store) {
        setStoreName(store.name);
        setStoreColor(store.color || '#3B82F6');
      }
    }
  }, [storeId, stores]);

  const handleCancel = () => {
    router.back();
  };

  const handleSave = () => {
    if (!storeName.trim()) {
      alert('Please enter a name');
      return;
    }

    if (storeId) {
      updateStore(storeId, {
        name: storeName.trim(),
        color: storeColor,
      });
    } else {
      addStore({
        name: storeName.trim(),
        color: storeColor,
      });
    }

    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit Store' : 'Add Store',
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
              onPress={handleSave}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ paddingHorizontal: 12, paddingVertical: 4 }}
            >
              <Text className="text-blue-500 font-semibold text-base">Save</Text>
            </Pressable>
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 p-5" keyboardShouldPersistTaps="handled">
          <Card variant="elevated" className="mb-4">
            <Input
              label="Store Name"
              placeholder="e.g., Whole Foods"
              value={storeName}
              onChangeText={setStoreName}
              autoCapitalize="words"
            />
          </Card>

          <Card variant="elevated">
            <Text className="text-sm font-medium text-slate-700 mb-3">Color</Text>
            <View className="flex-row flex-wrap gap-3">
              {colorOptions.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setStoreColor(color)}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    storeColor === color ? 'border-4 border-slate-800' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
