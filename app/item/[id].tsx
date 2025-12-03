import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, Alert, Modal, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  Package,
  MapPin,
  Calendar,
  Barcode,
  Store,
  Edit2,
  Minus,
  Trash2,
  FileText,
} from 'lucide-react-native';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExpirationBadge } from '@/components/inventory/ExpirationBadge';
import { enhanceItemWithStatus, formatDate } from '@/utils/helpers';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    items,
    storageAreas,
    stores,
    settings,
    decrementItemQuantity,
    markItemAsGone,
    deleteItem,
  } = useStore();

  const [showStoreSelectionModal, setShowStoreSelectionModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'markGone' | 'lastItem' | null>(null);

  const item = items.find((i) => i.id === id);

  const enhancedItem = useMemo(() => {
    if (!item) return null;
    return enhanceItemWithStatus(item, settings.notifications.daysBeforeExpiration);
  }, [item, settings.notifications.daysBeforeExpiration]);

  const storageArea = storageAreas.find((a) => a.id === item?.storageAreaId);
  const locationZone = storageArea?.locationZones.find((z) => z.id === item?.locationZoneId);
  const store = stores.find((s) => s.id === item?.defaultStoreId);

  if (!item || !enhancedItem) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-slate-500">Item not found</Text>
      </SafeAreaView>
    );
  }

  const handleEdit = () => {
    router.push({
      pathname: '/add-item',
      params: { itemId: id },
    });
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      decrementItemQuantity(id);
    } else {
      Alert.alert(
        'Last Item',
        'This is the last one. Would you like to add it to your shopping list?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Mark as Gone',
            onPress: () => {
              setPendingAction('lastItem');
              setShowStoreSelectionModal(true);
            },
          },
        ]
      );
    }
  };

  const handleMarkAsGone = () => {
    Alert.alert(
      'Mark as Gone',
      'This will remove the item and add it to your shopping list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setPendingAction('markGone');
            setShowStoreSelectionModal(true);
          },
        },
      ]
    );
  };

  const handleStoreSelection = (storeId: string) => {
    setShowStoreSelectionModal(false);
    markItemAsGone(id, storeId);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? It will not be added to your shopping list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteItem(id);
            router.back();
          },
        },
      ]
    );
  };

  const getStatusBgColor = () => {
    switch (enhancedItem.expirationStatus) {
      case 'expired':
        return 'bg-red-50';
      case 'expiring':
        return 'bg-amber-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Item Details',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Button variant="ghost" size="sm" onPress={handleEdit}>
              <Edit2 size={20} color="#3B82F6" />
            </Button>
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View className={`items-center py-8 ${getStatusBgColor()}`}>
            {item.photoUri ? (
              <Image
                source={{ uri: item.photoUri }}
                className="w-40 h-40 rounded-2xl mb-4"
                resizeMode="cover"
              />
            ) : (
              <View className="w-40 h-40 rounded-2xl bg-gray-200 items-center justify-center mb-4">
                <Package size={48} color="#9CA3AF" />
              </View>
            )}

            <Text className="text-2xl font-bold text-slate-800 text-center mb-2">
              {item.name}
            </Text>

            <View className="flex-row items-center gap-2 mb-3">
              <Text className="text-lg text-slate-600">
                {item.quantity} {item.unit}
              </Text>
            </View>

            {item.expirationDate && (
              <ExpirationBadge
                status={enhancedItem.expirationStatus}
                daysUntilExpiration={enhancedItem.daysUntilExpiration}
                size="md"
              />
            )}
          </View>

          {/* Quick Actions */}
          <View className="px-5 py-4">
            <View className="flex-row gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onPress={handleDecrement}
                leftIcon={<Minus size={18} color="#374151" />}
              >
                Use One
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onPress={handleMarkAsGone}
                leftIcon={<Trash2 size={18} color="white" />}
              >
                Mark as Gone
              </Button>
            </View>
          </View>

          {/* Details */}
          <View className="px-5">
            <Card variant="elevated" className="mb-4">
              <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Details
              </Text>

              {/* Location */}
              {storageArea && (
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                    <MapPin size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-slate-500">Location</Text>
                    <Text className="text-base text-slate-800 font-medium">
                      {storageArea.name}
                      {locationZone && ` " ${locationZone.name}`}
                    </Text>
                  </View>
                </View>
              )}

              {/* Expiration Date */}
              {item.expirationDate && (
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center mr-3">
                    <Calendar size={20} color="#F59E0B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-slate-500">Expiration Date</Text>
                    <Text className="text-base text-slate-800 font-medium">
                      {formatDate(item.expirationDate)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Barcode */}
              {item.barcode && (
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
                    <Barcode size={20} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-slate-500">Barcode</Text>
                    <Text className="text-base text-slate-800 font-medium font-mono">
                      {item.barcode}
                    </Text>
                  </View>
                </View>
              )}

              {/* Default Store */}
              {store && (
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-3">
                    <Store size={20} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-slate-500">Default Store</Text>
                    <Text className="text-base text-slate-800 font-medium">{store.name}</Text>
                  </View>
                </View>
              )}

              {/* Notes */}
              {item.notes && (
                <View className="flex-row items-start">
                  <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3">
                    <FileText size={20} color="#64748B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-slate-500">Notes</Text>
                    <Text className="text-base text-slate-800">{item.notes}</Text>
                  </View>
                </View>
              )}
            </Card>

            {/* Timestamps */}
            <Card variant="outlined" className="mb-4">
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs text-slate-400">Added</Text>
                  <Text className="text-sm text-slate-600">{formatDate(item.createdAt)}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-slate-400">Last Updated</Text>
                  <Text className="text-sm text-slate-600">{formatDate(item.updatedAt)}</Text>
                </View>
              </View>
            </Card>

            {/* Delete Button */}
            <Button
              variant="ghost"
              onPress={handleDelete}
              className="mt-2"
            >
              <Text className="text-red-500 font-medium">Delete Item Permanently</Text>
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Store Selection Modal */}
      <Modal
        visible={showStoreSelectionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStoreSelectionModal(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
            <Pressable onPress={() => setShowStoreSelectionModal(false)}>
              <Text className="text-blue-500 font-medium">Cancel</Text>
            </Pressable>
            <Text className="text-lg font-semibold text-slate-800">Select Store</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView className="flex-1 p-5">
            <Text className="text-sm text-slate-600 mb-4">
              Which store would you like to add this item to?
            </Text>

            {stores.length === 0 ? (
              <View className="p-4 bg-amber-50 rounded-lg">
                <Text className="text-sm text-amber-800">
                  No stores available. Please add a store in Settings first.
                </Text>
              </View>
            ) : (
              stores.map((storeItem) => (
                <Pressable
                  key={storeItem.id}
                  onPress={() => handleStoreSelection(storeItem.id)}
                  className="flex-row items-center p-4 mb-3 bg-white rounded-xl border border-gray-200 active:bg-gray-50"
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
                    <Text className="text-lg font-semibold text-slate-800">
                      {storeItem.name}
                    </Text>
                    {item.defaultStoreId === storeItem.id && (
                      <Text className="text-sm text-blue-600">Default store for this item</Text>
                    )}
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
