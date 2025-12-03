import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Package, Minus, Trash2 } from 'lucide-react-native';
import { ItemWithStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { ExpirationBadge } from './ExpirationBadge';
import { IconButton } from '@/components/ui/IconButton';

interface ItemCardProps {
  item: ItemWithStatus;
  locationZoneName?: string;
  onPress: () => void;
  onDecrement: () => void;
  onMarkAsGone: () => void;
}

export function ItemCard({
  item,
  locationZoneName,
  onPress,
  onDecrement,
  onMarkAsGone,
}: ItemCardProps) {
  const getStatusBorderColor = () => {
    switch (item.expirationStatus) {
      case 'expired':
        return 'border-l-red-500';
      case 'expiring':
        return 'border-l-amber-500';
      case 'safe':
        return 'border-l-emerald-500';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <Pressable onPress={onPress}>
      <Card variant="elevated" className={`mb-3 border-l-4 ${getStatusBorderColor()}`}>
        <View className="flex-row items-center">
          {/* Item Image or Placeholder */}
          <View className="w-16 h-16 rounded-xl bg-slate-100 items-center justify-center mr-4 overflow-hidden">
            {item.photoUri ? (
              <Image
                source={{ uri: item.photoUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Package size={24} color="#94A3B8" />
            )}
          </View>

          {/* Item Details */}
          <View className="flex-1">
            <Text className="text-base font-semibold text-slate-800 mb-1" numberOfLines={1}>
              {item.name}
            </Text>
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-sm text-slate-500">
                {item.quantity} {item.unit}
              </Text>
              {locationZoneName && (
                <>
                  <Text className="text-slate-300">"</Text>
                  <Text className="text-sm text-slate-500" numberOfLines={1}>
                    {locationZoneName}
                  </Text>
                </>
              )}
            </View>
            {item.expirationDate && (
              <ExpirationBadge
                status={item.expirationStatus}
                daysUntilExpiration={item.daysUntilExpiration}
                size="sm"
              />
            )}
          </View>

          {/* Quick Actions */}
          <View className="flex-row gap-2">
            <IconButton
              size="sm"
              variant="default"
              onPress={(e) => {
                e.stopPropagation();
                onDecrement();
              }}
            >
              <Minus size={16} color="#64748B" />
            </IconButton>
            <IconButton
              size="sm"
              variant="ghost"
              onPress={(e) => {
                e.stopPropagation();
                onMarkAsGone();
              }}
            >
              <Trash2 size={16} color="#EF4444" />
            </IconButton>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
