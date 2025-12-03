import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Filter, SortAsc, Plus, Scan } from 'lucide-react-native';
import { useStore } from '@/store';
import { ItemCard } from '@/components/inventory/ItemCard';
import { FloatingActionButton } from '@/components/inventory/FloatingActionButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { enhanceItemWithStatus } from '@/utils/helpers';
import { ItemWithStatus } from '@/types';

type SortOption = 'expiration' | 'name' | 'recent' | 'location';
type FilterOption = 'all' | 'expiring' | 'expired' | 'safe';

export default function StorageAreaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { storageAreas, items, stores, settings, decrementItemQuantity, markItemAsGone } = useStore();

  const [sortBy, setSortBy] = useState<SortOption>('expiration');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [showStoreSelectionModal, setShowStoreSelectionModal] = useState(false);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'markGone' | 'lastItem' | null>(null);

  const storageArea = storageAreas.find((a) => a.id === id);

  // Get and process items for this storage area
  const areaItems = useMemo(() => {
    const warningDays = settings.notifications.daysBeforeExpiration;

    let filteredItems = items
      .filter((item) => item.storageAreaId === id)
      .map((item) => enhanceItemWithStatus(item, warningDays));

    // Filter by zone
    if (selectedZoneId) {
      filteredItems = filteredItems.filter((item) => item.locationZoneId === selectedZoneId);
    }

    // Filter by status
    if (filterBy !== 'all') {
      filteredItems = filteredItems.filter((item) => {
        switch (filterBy) {
          case 'expired':
            return item.expirationStatus === 'expired';
          case 'expiring':
            return item.expirationStatus === 'expiring';
          case 'safe':
            return item.expirationStatus === 'safe';
          default:
            return true;
        }
      });
    }

    // Sort items
    return filteredItems.sort((a, b) => {
      switch (sortBy) {
        case 'expiration':
          if (a.daysUntilExpiration === null && b.daysUntilExpiration === null) return 0;
          if (a.daysUntilExpiration === null) return 1;
          if (b.daysUntilExpiration === null) return -1;
          return a.daysUntilExpiration - b.daysUntilExpiration;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'location':
          return (a.locationZoneId || '').localeCompare(b.locationZoneId || '');
        default:
          return 0;
      }
    });
  }, [items, id, sortBy, filterBy, selectedZoneId, settings.notifications.daysBeforeExpiration]);

  const getZoneName = (zoneId: string | undefined) => {
    if (!zoneId || !storageArea) return undefined;
    return storageArea.locationZones.find((z) => z.id === zoneId)?.name;
  };

  const handleAddItem = () => {
    router.push({
      pathname: '/add-item',
      params: { storageAreaId: id },
    });
  };

  const handleScan = () => {
    router.push({
      pathname: '/scanner',
      params: { storageAreaId: id },
    });
  };

  const handleItemPress = (itemId: string) => {
    router.push(`/item/${itemId}`);
  };

  const handleDecrement = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.quantity > 1) {
      decrementItemQuantity(itemId);
    } else {
      Alert.alert(
        'Last Item',
        'This is the last one. Would you like to add it to your shopping list?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Mark as Gone',
            onPress: () => {
              setPendingItemId(itemId);
              setPendingAction('lastItem');
              setShowStoreSelectionModal(true);
            },
          },
        ]
      );
    }
  };

  const handleMarkAsGone = (itemId: string) => {
    Alert.alert(
      'Mark as Gone',
      'This will remove the item and add it to your shopping list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setPendingItemId(itemId);
            setPendingAction('markGone');
            setShowStoreSelectionModal(true);
          },
        },
      ]
    );
  };

  const handleStoreSelection = (storeId: string) => {
    if (pendingItemId) {
      setShowStoreSelectionModal(false);
      markItemAsGone(pendingItemId, storeId);
      setPendingItemId(null);
      setPendingAction(null);
    }
  };

  if (!storageArea) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-slate-500">Storage area not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: storageArea.name,
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Zone Filter Tabs */}
          {storageArea.locationZones.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="bg-white border-b border-gray-100"
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <Pressable
                onPress={() => setSelectedZoneId(null)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedZoneId === null
                    ? 'bg-blue-500'
                    : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedZoneId === null ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  All
                </Text>
              </Pressable>
              {storageArea.locationZones.map((zone) => (
                <Pressable
                  key={zone.id}
                  onPress={() => setSelectedZoneId(zone.id)}
                  className={`px-4 py-2 rounded-full mr-2 ${
                    selectedZoneId === zone.id
                      ? 'bg-blue-500'
                      : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      selectedZoneId === zone.id ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    {zone.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Sort and Filter Controls */}
          <View className="flex-row items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
            <Text className="text-sm text-slate-500">
              {areaItems.length} {areaItems.length === 1 ? 'item' : 'items'}
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                className="flex-row items-center px-3 py-1.5 bg-gray-100 rounded-lg"
                onPress={() => {
                  const options: SortOption[] = ['expiration', 'name', 'recent', 'location'];
                  const currentIndex = options.indexOf(sortBy);
                  setSortBy(options[(currentIndex + 1) % options.length]);
                }}
              >
                <SortAsc size={16} color="#64748B" />
                <Text className="text-sm text-slate-600 ml-1 capitalize">{sortBy}</Text>
              </Pressable>
              <Pressable
                className={`flex-row items-center px-3 py-1.5 rounded-lg ${
                  filterBy !== 'all' ? 'bg-blue-100' : 'bg-gray-100'
                }`}
                onPress={() => {
                  const options: FilterOption[] = ['all', 'expiring', 'expired', 'safe'];
                  const currentIndex = options.indexOf(filterBy);
                  setFilterBy(options[(currentIndex + 1) % options.length]);
                }}
              >
                <Filter size={16} color={filterBy !== 'all' ? '#3B82F6' : '#64748B'} />
                <Text
                  className={`text-sm ml-1 capitalize ${
                    filterBy !== 'all' ? 'text-blue-600' : 'text-slate-600'
                  }`}
                >
                  {filterBy}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Items List */}
          <View className="px-5 py-4">
            {areaItems.length === 0 ? (
              <EmptyState
                title="No Items"
                description={
                  filterBy !== 'all' || selectedZoneId
                    ? 'No items match the current filters'
                    : 'Add items to this storage area'
                }
                action={
                  filterBy === 'all' && !selectedZoneId ? (
                    <Button onPress={handleAddItem} leftIcon={<Plus size={18} color="white" />}>
                      Add Item
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              areaItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  locationZoneName={getZoneName(item.locationZoneId)}
                  onPress={() => handleItemPress(item.id)}
                  onDecrement={() => handleDecrement(item.id)}
                  onMarkAsGone={() => handleMarkAsGone(item.id)}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Floating Action Buttons */}
        <FloatingActionButton onAddPress={handleAddItem} onScanPress={handleScan} />
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
              stores.map((storeItem) => {
                const pendingItem = pendingItemId ? items.find((i) => i.id === pendingItemId) : null;
                return (
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
                      {pendingItem?.defaultStoreId === storeItem.id && (
                        <Text className="text-sm text-blue-600">Default store for this item</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
