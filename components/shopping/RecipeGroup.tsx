import React, { useMemo } from 'react';
import { View, Text, Pressable, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ChevronDown, ChevronRight, Check, Trash2, ChefHat } from 'lucide-react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { ShoppingListRecipeGroup, ShoppingListItem as ShoppingListItemType } from '@/types';
import { ShoppingListItem } from './ShoppingListItem';
import * as haptics from '@/utils/haptics';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface RecipeGroupProps {
  group: ShoppingListRecipeGroup;
  items: ShoppingListItemType[];
  onToggleExpanded: () => void;
  onToggleItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddToInventory: (itemId: string) => void;
  onChangeStore: (itemId: string) => void;
  onDeleteGroup: () => void;
}

export function RecipeGroup({
  group,
  items,
  onToggleExpanded,
  onToggleItem,
  onDeleteItem,
  onAddToInventory,
  onChangeStore,
  onDeleteGroup,
}: RecipeGroupProps) {
  const completedCount = useMemo(() => items.filter(item => item.isCompleted).length, [items]);
  const totalCount = items.length;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  const handleToggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggleExpanded();
  };

  const handleDeleteGroup = () => {
    haptics.itemDeleted();
    onDeleteGroup();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <RectButton
        style={{
          backgroundColor: '#EF4444',
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
        }}
        onPress={handleDeleteGroup}
      >
        <Animated.View
          style={{
            transform: [{ translateX: trans }],
            alignItems: 'center',
          }}
        >
          <Trash2 size={24} color="white" />
          <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>Delete</Text>
        </Animated.View>
      </RectButton>
    );
  };

  return (
    <View className="mb-4 bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Recipe Group Header */}
      <Swipeable
        friction={2}
        rightThreshold={40}
        renderRightActions={renderRightActions}
        overshootRight={false}
      >
        <Pressable
          onPress={handleToggleExpanded}
          className={`flex-row items-center p-4 ${allCompleted ? 'bg-emerald-50' : 'bg-white'}`}
        >
          {/* Expand/Collapse Icon */}
          <View className="mr-3">
            {group.isExpanded ? (
              <ChevronDown size={20} color="#64748B" />
            ) : (
              <ChevronRight size={20} color="#64748B" />
            )}
          </View>

          {/* Recipe Icon */}
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            allCompleted ? 'bg-emerald-500' : 'bg-blue-100'
          }`}>
            {allCompleted ? (
              <Check size={20} color="white" strokeWidth={3} />
            ) : (
              <ChefHat size={20} color="#3B82F6" />
            )}
          </View>

          {/* Recipe Title and Progress */}
          <View className="flex-1">
            <Text className={`text-base font-semibold ${
              allCompleted ? 'text-emerald-700' : 'text-slate-800'
            }`}>
              {group.recipeTitle}
            </Text>
            <Text className={`text-sm ${
              allCompleted ? 'text-emerald-600' : 'text-slate-500'
            }`}>
              {completedCount}/{totalCount} items {allCompleted ? '- Complete!' : ''}
            </Text>
          </View>

          {/* Progress Indicator */}
          <View className="w-12 h-12 items-center justify-center">
            <View className="w-10 h-10 rounded-full border-2 border-gray-200 items-center justify-center">
              <Text className={`text-xs font-bold ${
                allCompleted ? 'text-emerald-600' : 'text-slate-600'
              }`}>
                {Math.round((completedCount / totalCount) * 100)}%
              </Text>
            </View>
          </View>
        </Pressable>
      </Swipeable>

      {/* Items List (Collapsible) */}
      {group.isExpanded && (
        <View className="border-t border-gray-100">
          {items.map((item) => (
            <ShoppingListItem
              key={item.id}
              item={item}
              onToggle={() => onToggleItem(item.id)}
              onDelete={() => onDeleteItem(item.id)}
              onAddToInventory={() => onAddToInventory(item.id)}
              onChangeStore={() => onChangeStore(item.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
