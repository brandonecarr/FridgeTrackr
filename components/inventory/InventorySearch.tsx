import React, { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Search, X, Filter } from 'lucide-react-native';
import * as haptics from '@/utils/haptics';

interface InventorySearchProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
}

export function InventorySearch({
  value,
  onChangeText,
  onFilterPress,
  placeholder = 'Search items...',
}: InventorySearchProps) {
  const handleClear = () => {
    haptics.light();
    onChangeText('');
  };

  const handleFilterPress = () => {
    haptics.light();
    onFilterPress?.();
  };

  return (
    <View className="bg-white rounded-xl flex-row items-center px-4 py-3 border border-gray-200 shadow-sm">
      <Search size={20} color="#9CA3AF" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className="flex-1 ml-3 text-base text-slate-900"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear} className="mr-2" hitSlop={8}>
          <X size={20} color="#9CA3AF" />
        </Pressable>
      )}
      {onFilterPress && (
        <Pressable onPress={handleFilterPress} hitSlop={8}>
          <Filter size={20} color="#3B82F6" />
        </Pressable>
      )}
    </View>
  );
}
