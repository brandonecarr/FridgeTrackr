import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Refrigerator,
  Snowflake,
  Warehouse,
  Archive,
  Box,
  GripVertical,
  Check,
  X,
} from 'lucide-react-native';
import { StorageArea, StorageAreaType } from '@/types';
import { Card } from '@/components/ui/Card';

interface StorageAreaManagerProps {
  storageAreas: StorageArea[];
  onAddStorageArea: (area: Omit<StorageArea, 'id' | 'createdAt' | 'updatedAt' | 'locationZones'>) => void;
  onUpdateStorageArea: (id: string, updates: Partial<StorageArea>) => void;
  onDeleteStorageArea: (id: string) => void;
  onAddZone: (storageAreaId: string, name: string) => void;
  onDeleteZone: (storageAreaId: string, zoneId: string) => void;
}

const ZONE_PRESETS: { [key in StorageAreaType]?: string[] } = {
  fridge: ['Top Shelf', 'Middle Shelf', 'Bottom Shelf', 'Door', 'Crisper Drawer', 'Meat Drawer'],
  freezer: ['Top Shelf', 'Middle Shelf', 'Bottom Shelf', 'Door', 'Ice Drawer'],
  pantry: ['Top Shelf', 'Eye Level', 'Bottom Shelf', 'Deep Storage', 'Snacks', 'Canned Goods'],
  cabinet: ['Top Shelf', 'Middle Shelf', 'Bottom Shelf'],
  custom: [], // No presets for custom types
};

const STORAGE_ICONS = {
  fridge: Refrigerator,
  freezer: Snowflake,
  pantry: Warehouse,
  cabinet: Archive,
  custom: Box,
};

const STORAGE_COLORS = {
  fridge: '#3B82F6',
  freezer: '#06B6D4',
  pantry: '#F59E0B',
  cabinet: '#8B5CF6',
  custom: '#64748B',
};

export function StorageAreaManager({
  storageAreas,
  onAddStorageArea,
  onUpdateStorageArea,
  onDeleteStorageArea,
  onAddZone,
  onDeleteZone,
}: StorageAreaManagerProps) {
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editingAreaName, setEditingAreaName] = useState('');
  const [addingZoneToArea, setAddingZoneToArea] = useState<string | null>(null);
  const [newZoneName, setNewZoneName] = useState('');

  const handleToggleExpand = (areaId: string) => {
    setExpandedAreaId(expandedAreaId === areaId ? null : areaId);
  };

  const handleStartEdit = (area: StorageArea) => {
    setEditingAreaId(area.id);
    setEditingAreaName(area.name);
  };

  const handleSaveEdit = () => {
    if (editingAreaId && editingAreaName.trim()) {
      onUpdateStorageArea(editingAreaId, { name: editingAreaName.trim() });
      setEditingAreaId(null);
      setEditingAreaName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingAreaId(null);
    setEditingAreaName('');
  };

  const handleDelete = (area: StorageArea) => {
    Alert.alert(
      'Delete Storage Area',
      `Delete "${area.name}" and all items inside?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteStorageArea(area.id),
        },
      ]
    );
  };

  const handleAddZone = (storageAreaId: string, zoneName: string) => {
    if (zoneName.trim()) {
      onAddZone(storageAreaId, zoneName.trim());
      setNewZoneName('');
      setAddingZoneToArea(null);
    }
  };

  const handleAddPresetZones = (storageAreaId: string, type: StorageAreaType) => {
    const presets = ZONE_PRESETS[type];
    Alert.alert(
      'Add Preset Zones',
      `Add ${presets.length} common zones for ${type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add All',
          onPress: () => {
            presets.forEach((zoneName) => {
              onAddZone(storageAreaId, zoneName);
            });
          },
        },
      ]
    );
  };

  const handleDeleteZone = (storageAreaId: string, zoneId: string, zoneName: string) => {
    Alert.alert(
      'Delete Zone',
      `Delete zone "${zoneName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteZone(storageAreaId, zoneId),
        },
      ]
    );
  };

  return (
    <View className="gap-3">
      {storageAreas.map((area) => {
        const Icon = STORAGE_ICONS[area.type];
        const color = STORAGE_COLORS[area.type];
        const isExpanded = expandedAreaId === area.id;
        const isEditing = editingAreaId === area.id;

        return (
          <Card key={area.id} variant="elevated" padding="none">
            {/* Header */}
            <Pressable
              onPress={() => handleToggleExpand(area.id)}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: color + '20' }}
                >
                  <Icon size={20} color={color} />
                </View>

                {isEditing ? (
                  <View className="flex-1 flex-row items-center gap-2">
                    <TextInput
                      value={editingAreaName}
                      onChangeText={setEditingAreaName}
                      autoFocus
                      className="flex-1 text-base font-semibold text-slate-800 bg-gray-100 px-3 py-2 rounded-lg"
                      placeholder="Storage area name"
                    />
                    <Pressable
                      onPress={handleSaveEdit}
                      className="w-8 h-8 bg-green-500 rounded-lg items-center justify-center"
                    >
                      <Check size={16} color="white" />
                    </Pressable>
                    <Pressable
                      onPress={handleCancelEdit}
                      className="w-8 h-8 bg-gray-300 rounded-lg items-center justify-center"
                    >
                      <X size={16} color="white" />
                    </Pressable>
                  </View>
                ) : (
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-800">
                      {area.name}
                    </Text>
                    <Text className="text-sm text-slate-500 capitalize">
                      {area.type === 'custom' && area.customTypeLabel ? area.customTypeLabel : area.type} • {area.locationZones.length} zones
                    </Text>
                  </View>
                )}
              </View>

              {!isEditing && (
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleStartEdit(area);
                    }}
                    className="p-2"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Edit2 size={18} color="#64748B" />
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDelete(area);
                    }}
                    className="p-2"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </Pressable>
                </View>
              )}
            </Pressable>

            {/* Expanded Zone Management */}
            {isExpanded && (
              <View className="px-4 pb-4 border-t border-gray-100">
                {/* Zones List */}
                {area.locationZones.length > 0 ? (
                  <View className="mb-3">
                    <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 mt-3">
                      Zones
                    </Text>
                    {area.locationZones.map((zone) => (
                      <View
                        key={zone.id}
                        className="flex-row items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg mb-2"
                      >
                        <View className="flex-row items-center flex-1">
                          <GripVertical size={16} color="#9CA3AF" className="mr-2" />
                          <Text className="text-base text-slate-700 ml-2">{zone.name}</Text>
                        </View>
                        <Pressable
                          onPress={() => handleDeleteZone(area.id, zone.id, zone.name)}
                          className="p-2"
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-sm text-slate-500 text-center py-4">
                    No zones yet. Add zones to organize items better.
                  </Text>
                )}

                {/* Quick Add Zone */}
                {addingZoneToArea === area.id ? (
                  <View className="mb-3">
                    <View className="flex-row gap-2">
                      <TextInput
                        value={newZoneName}
                        onChangeText={setNewZoneName}
                        placeholder="Zone name..."
                        autoFocus
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-base"
                        onSubmitEditing={() => handleAddZone(area.id, newZoneName)}
                      />
                      <Pressable
                        onPress={() => handleAddZone(area.id, newZoneName)}
                        className="bg-blue-500 rounded-lg px-4 items-center justify-center"
                      >
                        <Text className="text-white font-semibold">Add</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          setAddingZoneToArea(null);
                          setNewZoneName('');
                        }}
                        className="bg-gray-300 rounded-lg px-4 items-center justify-center"
                      >
                        <Text className="text-slate-700 font-semibold">Cancel</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setAddingZoneToArea(area.id)}
                      className="flex-1 py-2.5 bg-blue-500 rounded-lg flex-row items-center justify-center"
                    >
                      <Plus size={16} color="white" />
                      <Text className="text-white font-medium ml-1">Add Zone</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleAddPresetZones(area.id, area.type)}
                      className="flex-1 py-2.5 bg-gray-100 rounded-lg items-center justify-center"
                    >
                      <Text className="text-slate-700 font-medium">Use Presets</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </Card>
        );
      })}
    </View>
  );
}
