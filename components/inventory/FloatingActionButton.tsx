import React from 'react';
import { View, Pressable } from 'react-native';
import { Plus, Scan } from 'lucide-react-native';

interface FloatingActionButtonProps {
  onAddPress: () => void;
  onScanPress: () => void;
}

export function FloatingActionButton({ onAddPress, onScanPress }: FloatingActionButtonProps) {
  return (
    <View
      className="absolute bottom-24 right-6 flex-row gap-3"
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onScanPress}
        className="w-14 h-14 rounded-full bg-slate-800 items-center justify-center shadow-lg active:opacity-90"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Scan size={24} color="#FFFFFF" strokeWidth={2} />
      </Pressable>
      <Pressable
        onPress={onAddPress}
        className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center shadow-lg active:opacity-90"
        style={{
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
