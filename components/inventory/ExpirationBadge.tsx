import React from 'react';
import { View, Text } from 'react-native';
import { ExpirationStatus } from '@/types';
import { formatExpirationText } from '@/utils/helpers';

interface ExpirationBadgeProps {
  status: ExpirationStatus;
  daysUntilExpiration: number | null;
  size?: 'sm' | 'md';
}

export function ExpirationBadge({
  status,
  daysUntilExpiration,
  size = 'md'
}: ExpirationBadgeProps) {
  const getStatusColors = () => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 border-red-200';
      case 'expiring':
        return 'bg-amber-100 border-amber-200';
      case 'safe':
        return 'bg-emerald-100 border-emerald-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'expired':
        return 'text-red-700';
      case 'expiring':
        return 'text-amber-700';
      case 'safe':
        return 'text-emerald-700';
      default:
        return 'text-gray-700';
    }
  };

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5'
    : 'px-3 py-1';

  const textSizeClasses = size === 'sm'
    ? 'text-xs'
    : 'text-sm';

  return (
    <View className={`rounded-full border ${getStatusColors()} ${sizeClasses}`}>
      <Text className={`font-medium ${getTextColor()} ${textSizeClasses}`}>
        {formatExpirationText(daysUntilExpiration)}
      </Text>
    </View>
  );
}
