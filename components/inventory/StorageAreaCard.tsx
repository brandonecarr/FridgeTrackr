import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Refrigerator, Snowflake, Warehouse, Archive, ChevronRight } from 'lucide-react-native';
import { StorageArea, ItemWithStatus } from '@/types';
import { Card } from '@/components/ui/Card';

interface StorageAreaCardProps {
  storageArea: StorageArea;
  itemCount: number;
  expiringCount: number;
  expiredCount: number;
  onPress: () => void;
}

export function StorageAreaCard({
  storageArea,
  itemCount,
  expiringCount,
  expiredCount,
  onPress,
}: StorageAreaCardProps) {
  const getIcon = () => {
    const iconProps = { size: 28, strokeWidth: 1.5 };
    switch (storageArea.type) {
      case 'fridge':
        return <Refrigerator {...iconProps} color="#3B82F6" />;
      case 'freezer':
        return <Snowflake {...iconProps} color="#06B6D4" />;
      case 'pantry':
        return <Warehouse {...iconProps} color="#F59E0B" />;
      case 'cabinet':
        return <Archive {...iconProps} color="#8B5CF6" />;
      default:
        return <Warehouse {...iconProps} color="#6B7280" />;
    }
  };

  const getIconBgColor = () => {
    switch (storageArea.type) {
      case 'fridge':
        return 'bg-blue-50';
      case 'freezer':
        return 'bg-cyan-50';
      case 'pantry':
        return 'bg-amber-50';
      case 'cabinet':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <Pressable onPress={onPress}>
      <Card variant="elevated" className="mb-3">
        <View className="flex-row items-center">
          <View className={`w-14 h-14 rounded-xl ${getIconBgColor()} items-center justify-center mr-4`}>
            {getIcon()}
          </View>

          <View className="flex-1">
            <Text className="text-lg font-semibold text-slate-800 mb-1">
              {storageArea.name}
            </Text>
            <View className="flex-row items-center gap-3">
              <Text className="text-sm text-slate-500">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </Text>
              {expiredCount > 0 && (
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-red-500 mr-1" />
                  <Text className="text-sm text-red-600 font-medium">
                    {expiredCount} expired
                  </Text>
                </View>
              )}
              {expiringCount > 0 && (
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-amber-500 mr-1" />
                  <Text className="text-sm text-amber-600 font-medium">
                    {expiringCount} expiring
                  </Text>
                </View>
              )}
            </View>
          </View>

          <ChevronRight size={24} color="#9CA3AF" />
        </View>
      </Card>
    </Pressable>
  );
}
