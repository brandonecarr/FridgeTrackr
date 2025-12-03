import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronDown, ChevronUp, Store as StoreIcon } from 'lucide-react-native';
import { Store, ShoppingListItem as ShoppingListItemType } from '@/types';
import { ShoppingListItem } from './ShoppingListItem';
import { Card } from '@/components/ui/Card';

interface StoreGroupProps {
  store: Store;
  items: ShoppingListItemType[];
  onToggleItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddToInventory: (itemId: string) => void;
  onChangeStore?: (itemId: string) => void;
}

export function StoreGroup({
  store,
  items,
  onToggleItem,
  onDeleteItem,
  onAddToInventory,
  onChangeStore,
}: StoreGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = items.filter((i) => i.isCompleted).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (items.length === 0) {
    return null;
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card variant="elevated" className="mb-4 overflow-hidden" padding="none">
      {/* Store Header */}
      <Pressable
        onPress={handleToggleExpand}
        className="flex-row items-center p-4 bg-white"
        accessibilityRole="button"
        accessibilityLabel={`${store.name}, ${completedCount} of ${totalCount} items completed`}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: store.color ? `${store.color}20` : '#F3F4F6' }}
        >
          <StoreIcon size={20} color={store.color || '#64748B'} />
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-slate-800" numberOfLines={1}>
            {store.name}
          </Text>
          <Text className="text-sm text-slate-500">
            {completedCount}/{totalCount} {totalCount === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Progress */}
        <View className="w-20 h-2 rounded-full bg-gray-200 mr-3 overflow-hidden">
          {progressPercentage > 0 && (
            <View
              className="h-full bg-emerald-500"
              style={{ width: `${progressPercentage}%` }}
            />
          )}
        </View>

        <View className="w-6 h-6 items-center justify-center">
          {isExpanded ? (
            <ChevronUp size={24} color="#64748B" />
          ) : (
            <ChevronDown size={24} color="#64748B" />
          )}
        </View>
      </Pressable>

      {/* Items List */}
      {isExpanded && (
        <View>
          {items.map((item) => (
            <ShoppingListItem
              key={item.id}
              item={item}
              onToggle={() => onToggleItem(item.id)}
              onDelete={() => onDeleteItem(item.id)}
              onAddToInventory={() => onAddToInventory(item.id)}
              onChangeStore={onChangeStore ? () => onChangeStore(item.id) : undefined}
            />
          ))}
        </View>
      )}
    </Card>
  );
}
