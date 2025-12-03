import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'compact';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default'
}: EmptyStateProps) {
  if (variant === 'compact') {
    return (
      <View className="items-center justify-center px-6 py-8">
        {icon && (
          <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-3">
            {icon}
          </View>
        )}
        <Text className="text-lg font-semibold text-slate-800 text-center mb-1">
          {title}
        </Text>
        {description && (
          <Text className="text-sm text-slate-500 text-center mb-4 leading-5">
            {description}
          </Text>
        )}
        {action && <View className="mt-2">{action}</View>}
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {icon && (
        <View className="w-20 h-20 bg-slate-100 rounded-2xl items-center justify-center mb-6">
          {icon}
        </View>
      )}
      <Text className="text-2xl font-bold text-slate-900 text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-base text-slate-600 text-center mb-8 leading-6 max-w-sm">
          {description}
        </Text>
      )}
      {action && <View>{action}</View>}
    </View>
  );
}
