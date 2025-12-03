import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { StorageAreaType } from '@/types';
import { StorageAreaManager } from '@/components/settings/StorageAreaManager';
import { AddStorageBottomSheet } from '@/components/settings/AddStorageBottomSheet';
import { NotificationSettings } from '@/components/settings/NotificationSettings';

export default function SettingsScreen() {
  const router = useRouter();

  const {
    settings,
    storageAreas,
    stores,
    updateSettings,
    updateNotificationSettings,
    addStorageArea,
    updateStorageArea,
    deleteStorageArea,
    addLocationZone,
    deleteLocationZone,
    deleteStore,
  } = useStore();

  // Modal states
  const [showStorageBottomSheet, setShowStorageBottomSheet] = useState(false);

  const ZONE_PRESETS: { [key in StorageAreaType]: string[] } = {
    fridge: ['Top Shelf', 'Middle Shelf', 'Bottom Shelf', 'Door', 'Crisper Drawer', 'Meat Drawer'],
    freezer: ['Top Shelf', 'Middle Shelf', 'Bottom Shelf', 'Door', 'Ice Drawer'],
    pantry: ['Top Shelf', 'Eye Level', 'Bottom Shelf', 'Deep Storage', 'Snacks', 'Canned Goods'],
    cabinet: ['Top Shelf', 'Middle Shelf', 'Bottom Shelf'],
    custom: [],
  };

  const handleAddStorage = (name: string, type: StorageAreaType, addPresetZones: boolean, customTypeLabel?: string) => {
    addStorageArea({
      name,
      type,
      customTypeLabel,
      icon: type,
    });

    if (addPresetZones && type !== 'custom') {
      // Get the newly added storage area
      setTimeout(() => {
        const newArea = storageAreas[storageAreas.length - 1];
        if (newArea) {
          const presets = ZONE_PRESETS[type];
          if (presets) {
            presets.forEach((zoneName) => {
              addLocationZone(newArea.id, zoneName);
            });
          }
        }
      }, 100);
    }

    setShowStorageBottomSheet(false);
  };

  const handleOpenStoreModal = (storeId?: string) => {
    if (storeId) {
      router.push(`/edit-store?storeId=${storeId}`);
    } else {
      router.push('/edit-store');
    }
  };

  const handleDeleteStore = (id: string) => {
    Alert.alert(
      'Delete Store',
      'This will also remove shopping list items for this store. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteStore(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 py-4 bg-white border-b border-gray-100">
          <Text className="text-2xl font-bold text-slate-800">Settings</Text>
        </View>

        {/* Notifications Section */}
        <View className="px-5 py-4">
          <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Notifications
          </Text>
          <NotificationSettings />
        </View>

        {/* Storage Areas Section */}
        <View className="px-5 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Storage Areas
            </Text>
            <Pressable
              onPress={() => setShowStorageBottomSheet(true)}
              className="flex-row items-center"
            >
              <Plus size={18} color="#3B82F6" />
              <Text className="text-blue-500 font-medium ml-1">Add</Text>
            </Pressable>
          </View>

          <StorageAreaManager
            storageAreas={storageAreas}
            onAddStorageArea={addStorageArea}
            onUpdateStorageArea={updateStorageArea}
            onDeleteStorageArea={deleteStorageArea}
            onAddZone={addLocationZone}
            onDeleteZone={deleteLocationZone}
          />
        </View>

        {/* Stores Section */}
        <View className="px-5 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Stores
            </Text>
            <Pressable
              onPress={() => handleOpenStoreModal()}
              className="flex-row items-center"
            >
              <Plus size={18} color="#3B82F6" />
              <Text className="text-blue-500 font-medium ml-1">Add</Text>
            </Pressable>
          </View>

          <Card variant="elevated" padding="none">
            {stores.map((store, index) => (
              <View
                key={store.id}
                className={`flex-row items-center justify-between p-4 ${
                  index < stores.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-6 h-6 rounded-full mr-3"
                    style={{ backgroundColor: store.color }}
                  />
                  <Text className="text-base text-slate-800">{store.name}</Text>
                </View>
                <View className="flex-row gap-2">
                  <Pressable onPress={() => handleOpenStoreModal(store.id)}>
                    <Edit2 size={18} color="#64748B" />
                  </Pressable>
                  <Pressable onPress={() => handleDeleteStore(store.id)}>
                    <Trash2 size={18} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Default Settings */}
        <View className="px-5 py-4">
          <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Defaults
          </Text>
          <Card variant="elevated">
            <View className="py-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base text-slate-800">Default Expiration Days</Text>
                <Text className="text-base font-semibold text-blue-500">
                  {settings.defaultExpirationDays} days
                </Text>
              </View>
              <View className="flex-row gap-2">
                {[3, 5, 7, 14, 30].map((days) => (
                  <Pressable
                    key={days}
                    onPress={() => updateSettings({ defaultExpirationDays: days })}
                    className={`flex-1 py-2 rounded-lg items-center ${
                      settings.defaultExpirationDays === days ? 'bg-blue-500' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        settings.defaultExpirationDays === days ? 'text-white' : 'text-slate-600'
                      }`}
                    >
                      {days}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Card>
        </View>

        {/* App Info */}
        <View className="px-5 py-4">
          <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            About
          </Text>
          <Pressable
            onPress={() => router.push('/about')}
            className="bg-white rounded-xl p-4 border border-gray-200 flex-row items-center justify-between active:bg-gray-50"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Info size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-800">
                  About & Help
                </Text>
                <Text className="text-sm text-slate-500">
                  Version 1.0.0 • Support & Resources
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Add Storage Bottom Sheet */}
      <AddStorageBottomSheet
        visible={showStorageBottomSheet}
        onClose={() => setShowStorageBottomSheet(false)}
        onAdd={handleAddStorage}
      />
    </SafeAreaView>
  );
}
