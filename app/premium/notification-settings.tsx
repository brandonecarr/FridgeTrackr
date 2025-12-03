import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Bell,
  BellOff,
  Clock,
  AlertCircle,
  Trash2,
  Package,
  ArrowLeft,
  Check,
} from 'lucide-react-native';
import * as haptics from '@/utils/haptics';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
  options?: {
    timing?: string;
    priority?: 'high' | 'normal' | 'low';
  };
}

export default function NotificationSettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'expiring-soon',
      title: 'Items Expiring Soon',
      description: 'Get notified 3 days before items expire',
      enabled: true,
      icon: <Clock size={20} color="#F59E0B" />,
      options: { timing: '3 days before', priority: 'high' },
    },
    {
      id: 'expired',
      title: 'Expired Items',
      description: 'Daily reminder of expired items',
      enabled: true,
      icon: <AlertCircle size={20} color="#EF4444" />,
      options: { timing: 'Daily at 9 AM', priority: 'high' },
    },
    {
      id: 'low-stock',
      title: 'Low Stock Alert',
      description: 'When items reach minimum quantity',
      enabled: false,
      icon: <Package size={20} color="#3B82F6" />,
      options: { priority: 'normal' },
    },
    {
      id: 'waste-report',
      title: 'Weekly Waste Report',
      description: 'Summary of waste and savings',
      enabled: true,
      icon: <Trash2 size={20} color="#8B5CF6" />,
      options: { timing: 'Sundays at 8 PM', priority: 'low' },
    },
    {
      id: 'shopping-reminder',
      title: 'Shopping List Reminder',
      description: 'Remind me to check shopping list',
      enabled: false,
      icon: <Bell size={20} color="#10B981" />,
      options: { timing: 'Before shopping hours', priority: 'normal' },
    },
  ]);

  const handleToggleMain = (value: boolean) => {
    haptics.light();
    setNotificationsEnabled(value);
    if (!value) {
      Alert.alert(
        'Disable Notifications',
        'This will turn off all notifications. You can enable them again anytime.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setNotificationsEnabled(true) },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              haptics.warning();
            },
          },
        ]
      );
    }
  };

  const handleToggleSetting = (id: string, value: boolean) => {
    haptics.light();
    setSettings(
      settings.map(setting =>
        setting.id === id ? { ...setting, enabled: value } : setting
      )
    );
  };

  const handleCustomizeTiming = (id: string) => {
    haptics.light();
    const setting = settings.find(s => s.id === id);
    if (!setting) return;

    const timingOptions: Record<string, string[]> = {
      'expiring-soon': ['1 day before', '2 days before', '3 days before', '5 days before', '7 days before'],
      'expired': ['Daily at 9 AM', 'Daily at 6 PM', 'Every 12 hours', 'Custom time'],
      'waste-report': ['Sundays at 8 PM', 'Mondays at 9 AM', 'End of month', 'Custom'],
      'shopping-reminder': ['Before shopping hours', 'Fridays at 5 PM', 'Saturdays at 10 AM', 'Custom'],
    };

    const options = timingOptions[id];
    if (options) {
      Alert.alert(
        'Customize Timing',
        `Choose when to receive "${setting.title}" notifications`,
        [
          ...options.map(option => ({
            text: option,
            onPress: () => {
              setSettings(
                settings.map(s =>
                  s.id === id && s.options
                    ? { ...s, options: { ...s.options, timing: option } }
                    : s
                )
              );
              haptics.success();
            },
          })),
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleTestNotification = () => {
    haptics.success();
    Alert.alert(
      'Test Notification',
      'This is a sample notification from Fridge & Pantry Tracker. Your notifications are working!',
      [{ text: 'OK' }]
    );
  };

  const enabledCount = settings.filter(s => s.enabled).length;

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: 'Notification Settings',
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
            Smart Notifications
          </Text>
          <Text className="text-blue-100 text-sm">
            Stay on top of your inventory with intelligent alerts
          </Text>
        </View>

        {/* Master Toggle */}
        <View className="px-5 py-6">
          <View className={`rounded-2xl p-5 border ${
            notificationsEnabled ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200'
          }`}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                {notificationsEnabled ? (
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                    <Bell size={24} color="#3B82F6" />
                  </View>
                ) : (
                  <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-4">
                    <BellOff size={24} color="#9CA3AF" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className={`text-lg font-bold mb-1 ${
                    notificationsEnabled ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    All Notifications
                  </Text>
                  <Text className={`text-sm ${
                    notificationsEnabled ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {notificationsEnabled
                      ? `${enabledCount} notification${enabledCount !== 1 ? 's' : ''} active`
                      : 'Currently disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleMain}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Notification Types
          </Text>
          <View className="gap-3">
            {settings.map(setting => (
              <View
                key={setting.id}
                className={`rounded-xl p-4 border ${
                  notificationsEnabled && setting.enabled
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-row items-start flex-1">
                    <View className={`mt-1 mr-3 ${
                      !notificationsEnabled || !setting.enabled ? 'opacity-40' : ''
                    }`}>
                      {setting.icon}
                    </View>
                    <View className="flex-1">
                      <Text className={`text-base font-bold mb-1 ${
                        notificationsEnabled && setting.enabled ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {setting.title}
                      </Text>
                      <Text className={`text-sm ${
                        notificationsEnabled && setting.enabled ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {setting.description}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={setting.enabled}
                    onValueChange={value => handleToggleSetting(setting.id, value)}
                    disabled={!notificationsEnabled}
                    trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                    thumbColor="#fff"
                  />
                </View>

                {notificationsEnabled && setting.enabled && setting.options?.timing && (
                  <Pressable
                    onPress={() => handleCustomizeTiming(setting.id)}
                    className="mt-3 pt-3 border-t border-gray-100 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center">
                      <Clock size={14} color="#6B7280" />
                      <Text className="text-sm text-gray-600 ml-2">
                        {setting.options.timing}
                      </Text>
                    </View>
                    <Text className="text-xs text-blue-600 font-semibold">Customize</Text>
                  </Pressable>
                )}

                {notificationsEnabled && setting.enabled && setting.options?.priority && (
                  <View className="mt-2">
                    <View className={`self-start px-2 py-1 rounded-full ${
                      setting.options.priority === 'high'
                        ? 'bg-red-100'
                        : setting.options.priority === 'normal'
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}>
                      <Text className={`text-xs font-semibold ${
                        setting.options.priority === 'high'
                          ? 'text-red-700'
                          : setting.options.priority === 'normal'
                          ? 'text-blue-700'
                          : 'text-gray-700'
                      }`}>
                        {setting.options.priority.toUpperCase()} PRIORITY
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Test Button */}
        {notificationsEnabled && (
          <View className="px-5 pb-6">
            <Pressable
              onPress={handleTestNotification}
              className="bg-blue-50 rounded-xl p-4 border border-blue-200 items-center active:bg-blue-100"
            >
              <Text className="text-blue-600 font-semibold">Send Test Notification</Text>
            </Pressable>
          </View>
        )}

        {/* Tips */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Notification Tips
          </Text>
          <View className="bg-white rounded-xl p-5 border border-gray-200">
            <View className="flex-row items-start mb-4">
              <Check size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Enable "Items Expiring Soon" to reduce food waste
              </Text>
            </View>
            <View className="flex-row items-start mb-4">
              <Check size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Customize notification timing to match your schedule
              </Text>
            </View>
            <View className="flex-row items-start mb-4">
              <Check size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Weekly reports help track your progress over time
              </Text>
            </View>
            <View className="flex-row items-start">
              <Check size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                You can always adjust settings from this screen
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
