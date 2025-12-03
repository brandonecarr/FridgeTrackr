import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Plus,
  Camera,
  Search,
  Zap,
  ShoppingCart,
  Share2,
} from 'lucide-react-native';
import * as haptics from '@/utils/haptics';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  route?: string;
  onPress?: () => void;
}

interface QuickActionsProps {
  onAddItem?: () => void;
  onScanBarcode?: () => void;
  onSearch?: () => void;
}

export function QuickActions({ onAddItem, onScanBarcode, onSearch }: QuickActionsProps) {
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      id: 'add',
      label: 'Add Item',
      icon: <Plus size={20} color="#3B82F6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onPress: onAddItem,
    },
    {
      id: 'scan',
      label: 'Scan',
      icon: <Camera size={20} color="#10B981" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onPress: onScanBarcode,
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search size={20} color="#8B5CF6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onPress: onSearch,
    },
    {
      id: 'shopping',
      label: 'Shopping',
      icon: <ShoppingCart size={20} color="#F59E0B" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      route: '/(tabs)/shopping',
    },
    {
      id: 'share',
      label: 'Share',
      icon: <Share2 size={20} color="#F97316" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      route: '/premium/share-lists',
    },
    {
      id: 'automate',
      label: 'Automate',
      icon: <Zap size={20} color="#14B8A6" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      route: '/premium/automation-rules',
    },
  ];

  const handleActionPress = (action: QuickAction) => {
    haptics.light();
    if (action.onPress) {
      action.onPress();
    } else if (action.route) {
      router.push(action.route as any);
    }
  };

  return (
    <View className="px-5 py-4 bg-white border-b border-gray-100">
      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Quick Actions
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {actions.map(action => (
          <Pressable
            key={action.id}
            onPress={() => handleActionPress(action)}
            className={`${action.bgColor} rounded-xl px-4 py-3 flex-row items-center active:opacity-70`}
          >
            {action.icon}
            <Text className={`${action.color} font-semibold text-sm ml-2`}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
