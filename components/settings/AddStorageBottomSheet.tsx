import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import {
  Refrigerator,
  Snowflake,
  Warehouse,
  Archive,
  Box,
  X,
} from 'lucide-react-native';
import { StorageAreaType } from '@/types';
import { Card } from '@/components/ui/Card';

interface AddStorageBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, type: StorageAreaType, addPresetZones: boolean, customTypeLabel?: string) => void;
}

const STORAGE_OPTIONS = [
  {
    type: 'fridge' as StorageAreaType,
    label: 'Refrigerator',
    icon: Refrigerator,
    color: '#3B82F6',
    description: 'For perishable foods kept cold',
    presetCount: 6,
  },
  {
    type: 'freezer' as StorageAreaType,
    label: 'Freezer',
    icon: Snowflake,
    color: '#06B6D4',
    description: 'For frozen items and long-term storage',
    presetCount: 5,
  },
  {
    type: 'pantry' as StorageAreaType,
    label: 'Pantry',
    icon: Warehouse,
    color: '#F59E0B',
    description: 'For dry goods and non-perishables',
    presetCount: 6,
  },
  {
    type: 'cabinet' as StorageAreaType,
    label: 'Cabinet',
    icon: Archive,
    color: '#8B5CF6',
    description: 'For kitchen cabinets and cupboards',
    presetCount: 3,
  },
  {
    type: 'custom' as StorageAreaType,
    label: 'Custom',
    icon: Box,
    color: '#64748B',
    description: 'Create your own custom storage type',
    presetCount: 0,
  },
];

export function AddStorageBottomSheet({ visible, onClose, onAdd }: AddStorageBottomSheetProps) {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<StorageAreaType>('fridge');
  const [customTypeLabel, setCustomTypeLabel] = useState('');
  const [addPresetZones, setAddPresetZones] = useState(true);
  const slideAnim = useRef(new Animated.Value(1000)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 1000,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleAdd = () => {
    if (!name.trim()) {
      return;
    }
    if (selectedType === 'custom' && !customTypeLabel.trim()) {
      return;
    }
    onAdd(name.trim(), selectedType, addPresetZones, selectedType === 'custom' ? customTypeLabel.trim() : undefined);
    setName('');
    setSelectedType('fridge');
    setCustomTypeLabel('');
    setAddPresetZones(true);
  };

  const handleClose = () => {
    setName('');
    setSelectedType('fridge');
    setCustomTypeLabel('');
    setAddPresetZones(true);
    onClose();
  };

  const selectedOption = STORAGE_OPTIONS.find((opt) => opt.type === selectedType);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/50"
        onPress={handleClose}
      >
        <View className="flex-1" />

        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-t-3xl">
              {/* Header */}
              <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
                <Text className="text-xl font-bold text-slate-800">Add Storage Area</Text>
                <Pressable
                  onPress={handleClose}
                  className="w-8 h-8 items-center justify-center"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={24} color="#64748B" />
                </Pressable>
              </View>

              <ScrollView
                className="max-h-[80vh]"
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
              >
                <View className="p-5">
                  {/* Name Input */}
                  <View className="mb-5">
                    <Text className="text-sm font-semibold text-slate-700 mb-2">Name</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g., Kitchen Fridge, Garage Freezer"
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-slate-800"
                    />
                  </View>

                  {/* Type Selection */}
                  <View className="mb-5">
                    <Text className="text-sm font-semibold text-slate-700 mb-3">Type</Text>
                    <View className="gap-2">
                      {STORAGE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedType === option.type;

                        return (
                          <Pressable
                            key={option.type}
                            onPress={() => setSelectedType(option.type)}
                            className={`flex-row items-center p-4 rounded-xl border-2 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <View
                              className="w-12 h-12 rounded-full items-center justify-center mr-3"
                              style={{
                                backgroundColor: isSelected ? option.color + '20' : '#F3F4F6',
                              }}
                            >
                              <Icon
                                size={24}
                                color={isSelected ? option.color : '#9CA3AF'}
                              />
                            </View>
                            <View className="flex-1">
                              <Text
                                className={`text-base font-semibold mb-0.5 ${
                                  isSelected ? 'text-blue-600' : 'text-slate-800'
                                }`}
                              >
                                {option.label}
                              </Text>
                              <Text className="text-sm text-slate-500">
                                {option.description}
                              </Text>
                            </View>
                            {isSelected && (
                              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                                <Text className="text-white font-bold text-xs">✓</Text>
                              </View>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Custom Type Label Input */}
                  {selectedType === 'custom' && (
                    <View className="mb-5">
                      <Text className="text-sm font-semibold text-slate-700 mb-2">
                        Custom Type Name
                      </Text>
                      <TextInput
                        value={customTypeLabel}
                        onChangeText={setCustomTypeLabel}
                        placeholder="e.g., Wine Rack, Root Cellar, Garage Shelf"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-slate-800"
                        autoCapitalize="words"
                      />
                      <Text className="text-xs text-slate-500 mt-1.5">
                        This will be displayed as the type for this storage area
                      </Text>
                    </View>
                  )}

                  {/* Preset Zones Option */}
                  {selectedOption && selectedOption.presetCount > 0 && (
                    <Pressable
                      onPress={() => setAddPresetZones(!addPresetZones)}
                      className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl mb-5"
                    >
                      <View className="flex-1">
                        <Text className="text-base font-medium text-slate-800 mb-1">
                          Add Common Zones
                        </Text>
                        <Text className="text-sm text-slate-500">
                          Automatically add {selectedOption.presetCount} typical zones for{' '}
                          {selectedOption.label.toLowerCase()}
                        </Text>
                      </View>
                      <View
                        className={`w-12 h-7 rounded-full p-1 ${
                          addPresetZones ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <View
                          className={`w-5 h-5 rounded-full bg-white ${
                            addPresetZones ? 'ml-auto' : ''
                          }`}
                        />
                      </View>
                    </Pressable>
                  )}

                  {/* Action Buttons */}
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={handleClose}
                      className="flex-1 py-3.5 bg-gray-100 rounded-xl items-center justify-center"
                    >
                      <Text className="text-slate-700 font-semibold text-base">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleAdd}
                      disabled={!name.trim() || (selectedType === 'custom' && !customTypeLabel.trim())}
                      className={`flex-1 py-3.5 rounded-xl items-center justify-center ${
                        name.trim() && (selectedType !== 'custom' || customTypeLabel.trim()) ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <Text
                        className={`font-semibold text-base ${
                          name.trim() && (selectedType !== 'custom' || customTypeLabel.trim()) ? 'text-white' : 'text-gray-500'
                        }`}
                      >
                        Add Storage Area
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
