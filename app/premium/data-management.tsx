import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Share } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Download,
  Upload,
  FileText,
  Trash2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Package,
  ShoppingCart,
  Database,
} from 'lucide-react-native';
import { useStore } from '@/store';
import * as haptics from '@/utils/haptics';
import { format } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export default function DataManagementScreen() {
  const {
    items,
    deleteItem,
    addItem,
    shoppingList,
    deleteShoppingListItem,
    addShoppingListItem,
  } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      haptics.light();

      // Prepare export data
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        inventory: {
          items: items,
          itemCount: items.length,
        },
        shopping: {
          items: shoppingList,
          itemCount: shoppingList.length,
        },
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `fridge-tracker-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Write file
      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Inventory Data',
        });
        haptics.success();
        Alert.alert(
          'Export Successful!',
          `Your data has been exported to ${fileName}`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      haptics.warning();
      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'Failed to export data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      setIsImporting(true);
      haptics.light();

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsImporting(false);
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const importData = JSON.parse(fileContent);

      // Validate import data structure
      if (!importData.version || !importData.inventory || !importData.shopping) {
        throw new Error('Invalid backup file format');
      }

      // Show confirmation dialog
      Alert.alert(
        'Import Data',
        `This will replace your current data with:\n\n` +
        `• ${importData.inventory.itemCount} inventory items\n` +
        `• ${importData.shopping.itemCount} shopping items\n\n` +
        `Exported on: ${format(new Date(importData.exportDate), 'MMM d, yyyy h:mm a')}\n\n` +
        `This action cannot be undone. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: () => performImport(importData),
          },
        ]
      );
    } catch (error) {
      haptics.warning();
      Alert.alert(
        'Import Failed',
        error instanceof Error ? error.message : 'Failed to import data. Please check the file and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsImporting(false);
    }
  };

  const performImport = (importData: any) => {
    try {
      // Clear existing data
      items.forEach(item => {
        deleteItem(item.id);
      });
      shoppingList.forEach(item => {
        deleteShoppingListItem(item.id);
      });

      // Import inventory items
      importData.inventory.items.forEach((item: any) => {
        addItem(item);
      });

      // Import shopping items
      importData.shopping.items.forEach((item: any) => {
        addShoppingListItem(item);
      });

      haptics.success();
      Alert.alert(
        'Import Successful!',
        `Imported ${importData.inventory.itemCount} inventory items and ${importData.shopping.itemCount} shopping items.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      haptics.warning();
      Alert.alert(
        'Import Failed',
        error instanceof Error ? error.message : 'Failed to import data. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all inventory and shopping list items. This action cannot be undone.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            // Clear inventory
            items.forEach(item => {
              deleteItem(item.id);
            });
            // Clear shopping list
            shoppingList.forEach(item => {
              deleteShoppingListItem(item.id);
            });
            haptics.heavy();
            Alert.alert('Data Cleared', 'All data has been deleted.', [{ text: 'OK' }]);
          },
        },
      ]
    );
  };

  const stats = {
    inventoryItems: items.length,
    shoppingItems: shoppingList.length,
    totalItems: items.length + shoppingList.length,
    storageAreas: [...new Set(items.map(item => item.storageArea))].length,
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: 'Data Management',
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
            Backup & Restore
          </Text>
          <Text className="text-blue-100 text-sm">
            Export, import, and manage your data
          </Text>
        </View>

        {/* Current Data Stats */}
        <View className="px-5 py-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Current Data
          </Text>
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <Package size={20} color="#3B82F6" />
                <Text className="text-gray-700 ml-3">Inventory Items</Text>
              </View>
              <Text className="text-gray-900 font-bold text-lg">
                {stats.inventoryItems}
              </Text>
            </View>
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <ShoppingCart size={20} color="#10B981" />
                <Text className="text-gray-700 ml-3">Shopping Items</Text>
              </View>
              <Text className="text-gray-900 font-bold text-lg">
                {stats.shoppingItems}
              </Text>
            </View>
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <Database size={20} color="#8B5CF6" />
                <Text className="text-gray-700 ml-3">Total Items</Text>
              </View>
              <Text className="text-gray-900 font-bold text-lg">
                {stats.totalItems}
              </Text>
            </View>
          </View>
        </View>

        {/* Export Section */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Export Data
          </Text>
          <Pressable
            onPress={handleExportData}
            disabled={isExporting || stats.totalItems === 0}
            className={`rounded-xl p-5 border ${
              stats.totalItems === 0
                ? 'bg-gray-100 border-gray-200'
                : 'bg-green-50 border-green-200 active:bg-green-100'
            }`}
          >
            <View className="flex-row items-start">
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                stats.totalItems === 0 ? 'bg-gray-200' : 'bg-green-100'
              }`}>
                <Download size={24} color={stats.totalItems === 0 ? '#9CA3AF' : '#10B981'} />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-bold mb-2 ${
                  stats.totalItems === 0 ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  Export Backup
                </Text>
                <Text className={`text-sm leading-5 ${
                  stats.totalItems === 0 ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stats.totalItems === 0
                    ? 'No data to export. Add items first.'
                    : 'Save a backup of all your inventory and shopping list data to a JSON file.'}
                </Text>
              </View>
            </View>
            {isExporting && (
              <View className="mt-4 pt-4 border-t border-green-200">
                <Text className="text-green-700 text-sm font-medium text-center">
                  Preparing export...
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Import Section */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Import Data
          </Text>
          <Pressable
            onPress={handleImportData}
            disabled={isImporting}
            className="bg-blue-50 rounded-xl p-5 border border-blue-200 active:bg-blue-100"
          >
            <View className="flex-row items-start">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                <Upload size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  Import Backup
                </Text>
                <Text className="text-sm text-gray-600 leading-5">
                  Restore your data from a previously exported backup file.
                </Text>
              </View>
            </View>
            {isImporting && (
              <View className="mt-4 pt-4 border-t border-blue-200">
                <Text className="text-blue-700 text-sm font-medium text-center">
                  Processing import...
                </Text>
              </View>
            )}
          </Pressable>

          {/* Warning */}
          <View className="bg-yellow-50 rounded-xl p-4 mt-3 border border-yellow-200">
            <View className="flex-row items-start">
              <AlertCircle size={20} color="#F59E0B" />
              <Text className="text-yellow-800 text-xs ml-2 flex-1">
                Importing will replace all current data. Export a backup first if you want to keep your current data.
              </Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            About Backups
          </Text>
          <View className="bg-white rounded-xl p-5 border border-gray-200">
            <View className="flex-row items-start mb-4">
              <CheckCircle size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Exports include all inventory items, shopping lists, and settings
              </Text>
            </View>
            <View className="flex-row items-start mb-4">
              <CheckCircle size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Backup files are saved as JSON and can be stored anywhere
              </Text>
            </View>
            <View className="flex-row items-start mb-4">
              <CheckCircle size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Import from any device with the same app version
              </Text>
            </View>
            <View className="flex-row items-start">
              <CheckCircle size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Your data stays private and is never uploaded to our servers
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-red-600 mb-4">
            Danger Zone
          </Text>
          <Pressable
            onPress={handleClearAllData}
            disabled={stats.totalItems === 0}
            className={`rounded-xl p-5 border ${
              stats.totalItems === 0
                ? 'bg-gray-100 border-gray-200'
                : 'bg-red-50 border-red-200 active:bg-red-100'
            }`}
          >
            <View className="flex-row items-start">
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                stats.totalItems === 0 ? 'bg-gray-200' : 'bg-red-100'
              }`}>
                <Trash2 size={24} color={stats.totalItems === 0 ? '#9CA3AF' : '#EF4444'} />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-bold mb-2 ${
                  stats.totalItems === 0 ? 'text-gray-400' : 'text-red-600'
                }`}>
                  Clear All Data
                </Text>
                <Text className={`text-sm leading-5 ${
                  stats.totalItems === 0 ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stats.totalItems === 0
                    ? 'No data to clear.'
                    : 'Permanently delete all inventory and shopping list data. This cannot be undone.'}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
