import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Package } from 'lucide-react-native';
import { useStore } from '@/store';
import { StorageAreaCard } from '@/components/inventory/StorageAreaCard';
import { FloatingActionButton } from '@/components/inventory/FloatingActionButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { InventorySearch } from '@/components/inventory/InventorySearch';
import { QuickActions } from '@/components/inventory/QuickActions';
import { enhanceItemWithStatus } from '@/utils/helpers';

export default function InventoryScreen() {
  const router = useRouter();
  const { storageAreas, items, settings } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.notes?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Calculate stats for each storage area
  const storageAreaStats = useMemo(() => {
    const warningDays = settings.notifications.daysBeforeExpiration;

    return storageAreas.map((area) => {
      const areaItems = filteredItems.filter((item) => item.storageAreaId === area.id);
      const enhancedItems = areaItems.map((item) =>
        enhanceItemWithStatus(item, warningDays)
      );

      return {
        storageArea: area,
        itemCount: areaItems.length,
        expiringCount: enhancedItems.filter((i) => i.expirationStatus === 'expiring').length,
        expiredCount: enhancedItems.filter((i) => i.expirationStatus === 'expired').length,
      };
    });
  }, [storageAreas, filteredItems, settings.notifications.daysBeforeExpiration]);

  // Overall stats
  const totalItems = items.length;
  const enhancedItems = useMemo(
    () => items.map((item) => enhanceItemWithStatus(item, settings.notifications.daysBeforeExpiration)),
    [items, settings.notifications.daysBeforeExpiration]
  );
  const totalExpiring = enhancedItems.filter((i) => i.expirationStatus === 'expiring').length;
  const totalExpired = enhancedItems.filter((i) => i.expirationStatus === 'expired').length;

  const handleAddItem = () => {
    router.push('/add-item');
  };

  const handleScan = () => {
    router.push('/scanner');
  };

  const handleStorageAreaPress = (areaId: string) => {
    router.push(`/storage/${areaId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Header */}
        <View className="px-5 py-4 bg-white border-b border-gray-100">
          <Text className="text-2xl font-bold text-slate-800 mb-4">My Inventory</Text>

          {/* Stats Cards */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-slate-50 rounded-xl p-4">
              <Text className="text-3xl font-bold text-slate-800">{totalItems}</Text>
              <Text className="text-sm text-slate-500">Total Items</Text>
            </View>
            {totalExpiring > 0 && (
              <View className="flex-1 bg-amber-50 rounded-xl p-4">
                <Text className="text-3xl font-bold text-amber-600">{totalExpiring}</Text>
                <Text className="text-sm text-amber-600">Expiring Soon</Text>
              </View>
            )}
            {totalExpired > 0 && (
              <View className="flex-1 bg-red-50 rounded-xl p-4">
                <Text className="text-3xl font-bold text-red-600">{totalExpired}</Text>
                <Text className="text-sm text-red-600">Expired</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        {totalItems > 0 && (
          <QuickActions
            onAddItem={handleAddItem}
            onScanBarcode={handleScan}
            onSearch={() => {
              // Search is already visible, just focus would be ideal
              // For now, this is a placeholder
            }}
          />
        )}

        {/* Search Bar */}
        {totalItems > 0 && (
          <View className="px-5 py-4 bg-white">
            <InventorySearch
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search your inventory..."
            />
          </View>
        )}

        {/* Storage Areas List */}
        <View className="px-5 py-4">
          {storageAreaStats.length === 0 ? (
            <EmptyState
              icon={<Package size={48} color="#9CA3AF" />}
              title="No Storage Areas"
              description="Add a storage area in Settings to start tracking your items"
              action={
                <Button onPress={() => router.push('/settings')}>
                  Go to Settings
                </Button>
              }
            />
          ) : totalItems === 0 ? (
            <EmptyState
              icon={<Package size={48} color="#9CA3AF" />}
              title="Your Inventory is Empty"
              description="Start adding items to track what you have and reduce food waste"
              action={
                <View className="gap-2">
                  <Button onPress={handleAddItem}>Add Your First Item</Button>
                  <Button variant="outline" onPress={handleScan}>Scan Barcode</Button>
                </View>
              }
            />
          ) : (
            <>
              <Text className="text-lg font-semibold text-slate-700 mb-3">Storage Areas</Text>
              {storageAreaStats.map((stat) => (
                <StorageAreaCard
                  key={stat.storageArea.id}
                  storageArea={stat.storageArea}
                  itemCount={stat.itemCount}
                  expiringCount={stat.expiringCount}
                  expiredCount={stat.expiredCount}
                  onPress={() => handleStorageAreaPress(stat.storageArea.id)}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <FloatingActionButton onAddPress={handleAddItem} onScanPress={handleScan} />
    </SafeAreaView>
  );
}
