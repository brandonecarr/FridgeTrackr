import React from 'react';
import { View, Text } from 'react-native';
import { Crown } from 'lucide-react-native';

interface PremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
}

export function PremiumBadge({ size = 'medium' }: PremiumBadgeProps) {
  const sizeClasses = {
    small: 'px-2 py-0.5',
    medium: 'px-2.5 py-1',
    large: 'px-3 py-1.5',
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  const iconSizes = {
    small: 10,
    medium: 12,
    large: 14,
  };

  return (
    <View className={`flex-row items-center bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full ${sizeClasses[size]}`}>
      <Crown size={iconSizes[size]} color="white" strokeWidth={2.5} />
      <Text className={`text-white font-bold ml-1 ${textSizes[size]}`}>PREMIUM</Text>
    </View>
  );
}
