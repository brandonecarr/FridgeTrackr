import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Share } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Share2,
  MessageCircle,
  Mail,
  Copy,
  CheckCircle,
  ShoppingCart,
  Package,
  Users,
  Download,
  ArrowLeft,
} from 'lucide-react-native';
import { useStore } from '@/store';
import * as haptics from '@/utils/haptics';
import * as Clipboard from 'expo-clipboard';

type ShareFormat = 'text' | 'markdown' | 'csv';

export default function ShareListsScreen() {
  const { items, shoppingList, household } = useStore();
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const generateShoppingListText = (format: ShareFormat = 'text'): string => {
    if (shoppingList.length === 0) {
      return 'Your shopping list is empty.';
    }

    if (format === 'csv') {
      let csv = 'Item,Quantity,Unit,Category\n';
      shoppingList.forEach(item => {
        csv += `"${item.name}",${item.quantity},"${item.unit || 'item'}","${item.category || 'Uncategorized'}"\n`;
      });
      return csv;
    }

    if (format === 'markdown') {
      let md = '# Shopping List\n\n';
      const categories = [...new Set(shoppingList.map(item => item.category || 'Uncategorized'))];
      categories.forEach(category => {
        const categoryItems = shoppingList.filter(item => (item.category || 'Uncategorized') === category);
        md += `## ${category}\n`;
        categoryItems.forEach(item => {
          const checkbox = item.isCompleted ? '[x]' : '[ ]';
          md += `- ${checkbox} ${item.name} (${item.quantity} ${item.unit || 'item'})\n`;
        });
        md += '\n';
      });
      return md;
    }

    // Text format
    let text = '📝 Shopping List\n\n';
    const categories = [...new Set(shoppingList.map(item => item.category || 'Uncategorized'))];
    categories.forEach(category => {
      const categoryItems = shoppingList.filter(item => (item.category || 'Uncategorized') === category);
      text += `${category}:\n`;
      categoryItems.forEach(item => {
        const checkbox = item.isCompleted ? '✓' : '○';
        text += `${checkbox} ${item.name} - ${item.quantity} ${item.unit || 'item'}\n`;
      });
      text += '\n';
    });
    text += `Total: ${shoppingList.length} items\n`;
    text += `\nShared from Fridge & Pantry Tracker`;
    return text;
  };

  const generateInventorySnapshot = (format: ShareFormat = 'text'): string => {
    if (items.length === 0) {
      return 'Your inventory is empty.';
    }

    if (format === 'csv') {
      let csv = 'Item,Quantity,Unit,Storage Area,Expiry Date\n';
      items.forEach(item => {
        const expiryDate = item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A';
        csv += `"${item.name}",${item.quantity},"${item.unit || 'item'}","${item.storageArea}","${expiryDate}"\n`;
      });
      return csv;
    }

    if (format === 'markdown') {
      let md = '# Inventory Snapshot\n\n';
      const storageAreas = [...new Set(items.map(item => item.storageArea))];
      storageAreas.forEach(area => {
        const areaItems = items.filter(item => item.storageArea === area);
        md += `## ${area}\n`;
        areaItems.forEach(item => {
          const expiry = item.expiryDate ? ` (exp: ${new Date(item.expiryDate).toLocaleDateString()})` : '';
          md += `- ${item.name} - ${item.quantity} ${item.unit || 'item'}${expiry}\n`;
        });
        md += '\n';
      });
      return md;
    }

    // Text format
    let text = '📦 Inventory Snapshot\n\n';
    const storageAreas = [...new Set(items.map(item => item.storageArea))];
    storageAreas.forEach(area => {
      const areaItems = items.filter(item => item.storageArea === area);
      text += `${area} (${areaItems.length} items):\n`;
      areaItems.slice(0, 10).forEach(item => {
        const expiry = item.expiryDate ? ` [exp: ${new Date(item.expiryDate).toLocaleDateString()}]` : '';
        text += `• ${item.name} - ${item.quantity} ${item.unit || 'item'}${expiry}\n`;
      });
      if (areaItems.length > 10) {
        text += `... and ${areaItems.length - 10} more\n`;
      }
      text += '\n';
    });
    text += `Total: ${items.length} items\n`;
    text += `\nShared from Fridge & Pantry Tracker`;
    return text;
  };

  const handleShareShoppingList = async (format: ShareFormat = 'text') => {
    try {
      haptics.light();
      const message = generateShoppingListText(format);
      await Share.share({
        message,
        title: 'Shopping List',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleShareInventory = async (format: ShareFormat = 'text') => {
    try {
      haptics.light();
      const message = generateInventorySnapshot(format);
      await Share.share({
        message,
        title: 'Inventory Snapshot',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyToClipboard = async (type: 'shopping' | 'inventory', format: ShareFormat = 'text') => {
    try {
      haptics.success();
      const text = type === 'shopping'
        ? generateShoppingListText(format)
        : generateInventorySnapshot(format);

      await Clipboard.setStringAsync(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleShareWithHousehold = async () => {
    if (!household) {
      Alert.alert(
        'No Household',
        'Create or join a household to share lists with family members.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Household', onPress: () => router.push('/premium/household') },
        ]
      );
      return;
    }

    haptics.success();
    Alert.alert(
      'Shared with Household',
      `Your shopping list has been synced with "${household.name}". All members can now see and edit the list.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: 'Share Lists',
          headerStyle: { backgroundColor: '#3B82F6' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="mr-4">
              <ArrowLeft size={24} color="#fff" />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-blue-600 px-6 pt-6 pb-8">
          <Text className="text-white text-2xl font-bold mb-2">
            Share Your Lists
          </Text>
          <Text className="text-blue-100 text-sm">
            Share shopping lists and inventory with family and friends
          </Text>
        </View>

        {/* Shopping List Section */}
        <View className="px-5 py-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <ShoppingCart size={20} color="#10B981" />
              <Text className="text-lg font-bold text-gray-900 ml-2">
                Shopping List
              </Text>
            </View>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 font-semibold text-xs">
                {shoppingList.length} items
              </Text>
            </View>
          </View>

          {/* Share Options */}
          <View className="gap-3">
            <Pressable
              onPress={() => handleShareShoppingList('text')}
              disabled={shoppingList.length === 0}
              className={`rounded-xl p-4 border flex-row items-center ${
                shoppingList.length === 0
                  ? 'bg-gray-100 border-gray-200'
                  : 'bg-white border-gray-200 active:bg-gray-50'
              }`}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                shoppingList.length === 0 ? 'bg-gray-200' : 'bg-blue-100'
              }`}>
                <Share2 size={20} color={shoppingList.length === 0 ? '#9CA3AF' : '#3B82F6'} />
              </View>
              <View className="flex-1">
                <Text className={`text-base font-semibold ${
                  shoppingList.length === 0 ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  Share via Apps
                </Text>
                <Text className={`text-sm ${
                  shoppingList.length === 0 ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Text, WhatsApp, Email, etc.
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => handleCopyToClipboard('shopping', 'text')}
              disabled={shoppingList.length === 0}
              className={`rounded-xl p-4 border flex-row items-center ${
                shoppingList.length === 0
                  ? 'bg-gray-100 border-gray-200'
                  : 'bg-white border-gray-200 active:bg-gray-50'
              }`}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                shoppingList.length === 0 ? 'bg-gray-200' : 'bg-purple-100'
              }`}>
                {copiedType === 'shopping' ? (
                  <CheckCircle size={20} color="#10B981" />
                ) : (
                  <Copy size={20} color={shoppingList.length === 0 ? '#9CA3AF' : '#8B5CF6'} />
                )}
              </View>
              <View className="flex-1">
                <Text className={`text-base font-semibold ${
                  shoppingList.length === 0 ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {copiedType === 'shopping' ? 'Copied!' : 'Copy to Clipboard'}
                </Text>
                <Text className={`text-sm ${
                  shoppingList.length === 0 ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Plain text format
                </Text>
              </View>
            </Pressable>

            {household && (
              <Pressable
                onPress={handleShareWithHousehold}
                disabled={shoppingList.length === 0}
                className={`rounded-xl p-4 border flex-row items-center ${
                  shoppingList.length === 0
                    ? 'bg-gray-100 border-gray-200'
                    : 'bg-green-50 border-green-200 active:bg-green-100'
                }`}
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  shoppingList.length === 0 ? 'bg-gray-200' : 'bg-green-100'
                }`}>
                  <Users size={20} color={shoppingList.length === 0 ? '#9CA3AF' : '#10B981'} />
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-semibold ${
                    shoppingList.length === 0 ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    Share with Household
                  </Text>
                  <Text className={`text-sm ${
                    shoppingList.length === 0 ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {household.name} • {household.members.length} members
                  </Text>
                </View>
              </Pressable>
            )}

            {/* Format Options */}
            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-2">
              <Text className="text-sm font-semibold text-blue-900 mb-3">
                Export Formats
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleCopyToClipboard('shopping', 'text')}
                  disabled={shoppingList.length === 0}
                  className={`flex-1 py-2 px-3 rounded-lg ${
                    shoppingList.length === 0 ? 'bg-gray-200' : 'bg-white active:bg-gray-100'
                  }`}
                >
                  <Text className={`text-xs font-semibold text-center ${
                    shoppingList.length === 0 ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Text
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleCopyToClipboard('shopping', 'markdown')}
                  disabled={shoppingList.length === 0}
                  className={`flex-1 py-2 px-3 rounded-lg ${
                    shoppingList.length === 0 ? 'bg-gray-200' : 'bg-white active:bg-gray-100'
                  }`}
                >
                  <Text className={`text-xs font-semibold text-center ${
                    shoppingList.length === 0 ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Markdown
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleCopyToClipboard('shopping', 'csv')}
                  disabled={shoppingList.length === 0}
                  className={`flex-1 py-2 px-3 rounded-lg ${
                    shoppingList.length === 0 ? 'bg-gray-200' : 'bg-white active:bg-gray-100'
                  }`}
                >
                  <Text className={`text-xs font-semibold text-center ${
                    shoppingList.length === 0 ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    CSV
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Inventory Section */}
        <View className="px-5 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Package size={20} color="#3B82F6" />
              <Text className="text-lg font-bold text-gray-900 ml-2">
                Inventory Snapshot
              </Text>
            </View>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 font-semibold text-xs">
                {items.length} items
              </Text>
            </View>
          </View>

          {/* Share Options */}
          <View className="gap-3">
            <Pressable
              onPress={() => handleShareInventory('text')}
              disabled={items.length === 0}
              className={`rounded-xl p-4 border flex-row items-center ${
                items.length === 0
                  ? 'bg-gray-100 border-gray-200'
                  : 'bg-white border-gray-200 active:bg-gray-50'
              }`}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                items.length === 0 ? 'bg-gray-200' : 'bg-blue-100'
              }`}>
                <Share2 size={20} color={items.length === 0 ? '#9CA3AF' : '#3B82F6'} />
              </View>
              <View className="flex-1">
                <Text className={`text-base font-semibold ${
                  items.length === 0 ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  Share Snapshot
                </Text>
                <Text className={`text-sm ${
                  items.length === 0 ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Share what you have in stock
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => handleCopyToClipboard('inventory', 'text')}
              disabled={items.length === 0}
              className={`rounded-xl p-4 border flex-row items-center ${
                items.length === 0
                  ? 'bg-gray-100 border-gray-200'
                  : 'bg-white border-gray-200 active:bg-gray-50'
              }`}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                items.length === 0 ? 'bg-gray-200' : 'bg-purple-100'
              }`}>
                {copiedType === 'inventory' ? (
                  <CheckCircle size={20} color="#10B981" />
                ) : (
                  <Copy size={20} color={items.length === 0 ? '#9CA3AF' : '#8B5CF6'} />
                )}
              </View>
              <View className="flex-1">
                <Text className={`text-base font-semibold ${
                  items.length === 0 ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {copiedType === 'inventory' ? 'Copied!' : 'Copy to Clipboard'}
                </Text>
                <Text className={`text-sm ${
                  items.length === 0 ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Plain text format
                </Text>
              </View>
            </Pressable>

            {/* Format Options */}
            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-2">
              <Text className="text-sm font-semibold text-blue-900 mb-3">
                Export Formats
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleCopyToClipboard('inventory', 'text')}
                  disabled={items.length === 0}
                  className={`flex-1 py-2 px-3 rounded-lg ${
                    items.length === 0 ? 'bg-gray-200' : 'bg-white active:bg-gray-100'
                  }`}
                >
                  <Text className={`text-xs font-semibold text-center ${
                    items.length === 0 ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Text
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleCopyToClipboard('inventory', 'markdown')}
                  disabled={items.length === 0}
                  className={`flex-1 py-2 px-3 rounded-lg ${
                    items.length === 0 ? 'bg-gray-200' : 'bg-white active:bg-gray-100'
                  }`}
                >
                  <Text className={`text-xs font-semibold text-center ${
                    items.length === 0 ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Markdown
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleCopyToClipboard('inventory', 'csv')}
                  disabled={items.length === 0}
                  className={`flex-1 py-2 px-3 rounded-lg ${
                    items.length === 0 ? 'bg-gray-200' : 'bg-white active:bg-gray-100'
                  }`}
                >
                  <Text className={`text-xs font-semibold text-center ${
                    items.length === 0 ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    CSV
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Sharing Tips
          </Text>
          <View className="bg-white rounded-xl p-5 border border-gray-200">
            <View className="flex-row items-start mb-4">
              <MessageCircle size={16} color="#3B82F6" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Share your shopping list with family members before going to the store
              </Text>
            </View>
            <View className="flex-row items-start mb-4">
              <Mail size={16} color="#3B82F6" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Email your inventory snapshot to yourself as a backup
              </Text>
            </View>
            <View className="flex-row items-start mb-4">
              <Users size={16} color="#3B82F6" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Use Household sharing for automatic real-time sync across devices
              </Text>
            </View>
            <View className="flex-row items-start">
              <Download size={16} color="#3B82F6" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                CSV format can be opened in Excel or Google Sheets
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
