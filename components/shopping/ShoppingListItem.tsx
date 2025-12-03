import React, { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Check, RotateCcw, Package, ArrowRight, Trash2 } from 'lucide-react-native';
import { ShoppingListItem as ShoppingListItemType } from '@/types';
import * as haptics from '@/utils/haptics';

interface ShoppingListItemProps {
  item: ShoppingListItemType;
  onToggle: () => void;
  onDelete: () => void;
  onAddToInventory: () => void;
  onChangeStore?: () => void;
}

export function ShoppingListItem({
  item,
  onToggle,
  onDelete,
  onAddToInventory,
  onChangeStore,
}: ShoppingListItemProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleToggle = (e?: any) => {
    e?.stopPropagation?.();
    haptics.itemCompleted();
    onToggle();
  };

  const handleDelete = () => {
    haptics.itemDeleted();
    swipeableRef.current?.close();
    onDelete();
  };

  const handleChangeStore = () => {
    haptics.success();
    swipeableRef.current?.close();
    if (onChangeStore) {
      onChangeStore();
    }
  };

  const handleAddToInventory = (e?: any) => {
    e?.stopPropagation?.();
    haptics.success();
    onAddToInventory();
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (!onChangeStore) return null;

    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });

    return (
      <RectButton
        style={{
          backgroundColor: '#3B82F6',
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
        }}
        onPress={handleChangeStore}
      >
        <Animated.View
          style={{
            transform: [{ translateX: trans }],
            alignItems: 'center',
          }}
        >
          <ArrowRight size={24} color="white" />
          <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>Move</Text>
        </Animated.View>
      </RectButton>
    );
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
        onPress={handleDelete}
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
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
      renderLeftActions={onChangeStore ? renderLeftActions : undefined}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
    >
      <View
        className={`flex-row items-center py-3 px-4 border-b border-gray-100 ${
          item.isCompleted ? 'bg-gray-50' : 'bg-white'
        }`}
      >
        {/* Checkbox */}
        <Pressable
          onPress={handleToggle}
          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
            item.isCompleted
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-gray-300 bg-white'
          }`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {item.isCompleted && <Check size={14} color="white" strokeWidth={3} />}
        </Pressable>

        {/* Item Details */}
        <Pressable onPress={handleToggle} className="flex-1">
          <Text
            className={`text-base font-medium ${
              item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
            }`}
          >
            {item.name}
          </Text>
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text
              className={`text-sm ${
                item.isCompleted ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {item.quantity} {item.unit}
            </Text>
            {item.aisle ? (
              <>
                <Text className="text-xs text-slate-400">•</Text>
                <Text className="text-xs text-blue-600 font-medium">Aisle {item.aisle}</Text>
              </>
            ) : null}
            {item.barcode && (
              <>
                <Text className="text-xs text-slate-400">•</Text>
                <View className="flex-row items-center">
                  <Package size={12} color="#94a3b8" />
                  <Text className="text-xs text-slate-400 ml-1">Barcode</Text>
                </View>
              </>
            )}
          </View>
        </Pressable>

        {/* Actions */}
        {item.isCompleted && (
          <Pressable
            onPress={handleAddToInventory}
            className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center active:bg-indigo-200"
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <RotateCcw size={16} color="#4F46E5" />
          </Pressable>
        )}
      </View>
    </Swipeable>
  );
}
