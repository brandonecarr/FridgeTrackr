import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', size = 'md', children }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100',
    success: 'bg-emerald-100',
    warning: 'bg-amber-100',
    error: 'bg-red-100',
    info: 'bg-blue-100',
  };

  const textVariantStyles = {
    default: 'text-slate-700',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    error: 'text-red-700',
    info: 'text-blue-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-2.5 py-1',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-xs',
  };

  return (
    <View className={`rounded-full ${variantStyles[variant]} ${sizeStyles[size]}`}>
      <Text
        className={`font-medium ${textVariantStyles[variant]} ${textSizeStyles[size]}`}
      >
        {children}
      </Text>
    </View>
  );
}
