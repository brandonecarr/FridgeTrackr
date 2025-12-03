import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Alert, Platform, TouchableOpacity } from 'react-native';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Bell, Clock, ShoppingCart, AlertCircle, Volume2, Vibrate } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { requestNotificationPermissions, rescheduleAllNotifications } from '@/utils/notifications';

export function NotificationSettings() {
  const { settings, updateNotificationSettings, items, shoppingList } = useStore();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showDailySummaryPicker, setShowDailySummaryPicker] = useState(false);
  const [showShoppingReminderPicker, setShowShoppingReminderPicker] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value && !permissionGranted) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }
      setPermissionGranted(true);
    }

    updateNotificationSettings({ enabled: value });

    if (value) {
      await rescheduleAllNotifications(items, shoppingList, settings.notifications);
    }
  };

  const handleToggleSetting = async (key: keyof typeof settings.notifications, value: boolean) => {
    updateNotificationSettings({ [key]: value });

    if (settings.notifications.enabled) {
      await rescheduleAllNotifications(items, shoppingList, settings.notifications);
    }
  };

  const handleUpdateDaysBeforeExpiration = (days: number) => {
    updateNotificationSettings({ daysBeforeExpiration: days });

    if (settings.notifications.enabled && settings.notifications.expirationEnabled) {
      rescheduleAllNotifications(items, shoppingList, settings.notifications);
    }
  };

  const handleUpdateLowStockThreshold = (threshold: number) => {
    updateNotificationSettings({ lowStockThreshold: threshold });
  };

  const handleTimeChange = async (
    type: 'dailySummary' | 'shoppingReminder',
    event: any,
    selectedDate?: Date
  ) => {
    if (Platform.OS === 'android') {
      setShowDailySummaryPicker(false);
      setShowShoppingReminderPicker(false);
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      if (type === 'dailySummary') {
        updateNotificationSettings({ dailySummaryTime: timeString });
        if (settings.notifications.enabled && settings.notifications.dailySummaryEnabled) {
          await rescheduleAllNotifications(items, shoppingList, settings.notifications);
        }
      } else {
        updateNotificationSettings({ shoppingReminderTime: timeString });
        if (settings.notifications.enabled && settings.notifications.shoppingReminderEnabled) {
          await rescheduleAllNotifications(items, shoppingList, settings.notifications);
        }
      }
    }
  };

  const parseTime = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (!permissionGranted && !settings.notifications.enabled) {
    return (
      <Card variant="elevated" className="mb-6">
        <View className="flex-row items-center mb-3">
          <Bell size={20} color="#3B82F6" />
          <Text className="text-lg font-semibold ml-2">Notifications</Text>
        </View>

        <View className="bg-blue-50 p-4 rounded-lg mb-4">
          <Text className="text-sm text-blue-900 mb-3">
            Enable notifications to get alerts about expiring food, low stock, and shopping reminders.
          </Text>
          <TouchableOpacity
            onPress={() => handleToggleNotifications(true)}
            className="bg-blue-600 p-3 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Enable Notifications</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Bell size={20} color="#3B82F6" />
          <Text className="text-lg font-semibold ml-2">Notifications</Text>
        </View>
        <Switch
          value={settings.notifications.enabled}
          onValueChange={handleToggleNotifications}
          trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
          thumbColor={settings.notifications.enabled ? '#3B82F6' : '#F3F4F6'}
        />
      </View>

      {settings.notifications.enabled && (
        <>
          {/* General Settings */}
          <View className="border-t border-gray-200 pt-4 mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-3">General</Text>

            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <Volume2 size={16} color="#6B7280" />
                <Text className="text-sm text-gray-700 ml-2">Sound</Text>
              </View>
              <Switch
                value={settings.notifications.soundEnabled}
                onValueChange={(value) => handleToggleSetting('soundEnabled', value)}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={settings.notifications.soundEnabled ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Vibrate size={16} color="#6B7280" />
                <Text className="text-sm text-gray-700 ml-2">Vibration</Text>
              </View>
              <Switch
                value={settings.notifications.vibrationEnabled}
                onValueChange={(value) => handleToggleSetting('vibrationEnabled', value)}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={settings.notifications.vibrationEnabled ? '#3B82F6' : '#F3F4F6'}
              />
            </View>
          </View>

          {/* Expiration Notifications */}
          <View className="border-t border-gray-200 pt-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <AlertCircle size={16} color="#EF4444" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">Expiration Alerts</Text>
              </View>
              <Switch
                value={settings.notifications.expirationEnabled}
                onValueChange={(value) => handleToggleSetting('expirationEnabled', value)}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={settings.notifications.expirationEnabled ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            {settings.notifications.expirationEnabled && (
              <>
                <View className="mb-3">
                  <Text className="text-xs text-gray-600 mb-2">Days before expiration</Text>
                  <View className="flex-row gap-2">
                    {[1, 2, 3, 5, 7].map((days) => (
                      <TouchableOpacity
                        key={days}
                        onPress={() => handleUpdateDaysBeforeExpiration(days)}
                        className={`px-4 py-2 rounded-lg ${
                          settings.notifications.daysBeforeExpiration === days
                            ? 'bg-blue-600'
                            : 'bg-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            settings.notifications.daysBeforeExpiration === days
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        >
                          {days}d
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Clock size={16} color="#6B7280" />
                    <Text className="text-sm text-gray-700 ml-2">Daily Summary</Text>
                  </View>
                  <Switch
                    value={settings.notifications.dailySummaryEnabled}
                    onValueChange={(value) => handleToggleSetting('dailySummaryEnabled', value)}
                    trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                    thumbColor={settings.notifications.dailySummaryEnabled ? '#3B82F6' : '#F3F4F6'}
                  />
                </View>

                {settings.notifications.dailySummaryEnabled && (
                  <TouchableOpacity
                    onPress={() => setShowDailySummaryPicker(true)}
                    className="mt-2 bg-gray-100 p-3 rounded-lg"
                  >
                    <Text className="text-sm text-gray-700">
                      Time: <Text className="font-semibold">{formatTime(settings.notifications.dailySummaryTime)}</Text>
                    </Text>
                  </TouchableOpacity>
                )}

                {showDailySummaryPicker && (
                  <DateTimePicker
                    value={parseTime(settings.notifications.dailySummaryTime)}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => handleTimeChange('dailySummary', event, date)}
                  />
                )}
              </>
            )}
          </View>

          {/* Shopping List Reminders */}
          <View className="border-t border-gray-200 pt-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <ShoppingCart size={16} color="#10B981" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">Shopping Reminders</Text>
              </View>
              <Switch
                value={settings.notifications.shoppingReminderEnabled}
                onValueChange={(value) => handleToggleSetting('shoppingReminderEnabled', value)}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={settings.notifications.shoppingReminderEnabled ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            {settings.notifications.shoppingReminderEnabled && (
              <>
                <Text className="text-xs text-gray-600 mb-2">Daily reminder time</Text>
                <TouchableOpacity
                  onPress={() => setShowShoppingReminderPicker(true)}
                  className="bg-gray-100 p-3 rounded-lg"
                >
                  <Text className="text-sm text-gray-700">
                    Time: <Text className="font-semibold">{formatTime(settings.notifications.shoppingReminderTime)}</Text>
                  </Text>
                </TouchableOpacity>

                {showShoppingReminderPicker && (
                  <DateTimePicker
                    value={parseTime(settings.notifications.shoppingReminderTime)}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => handleTimeChange('shoppingReminder', event, date)}
                  />
                )}
              </>
            )}
          </View>

          {/* Low Stock Alerts */}
          <View className="border-t border-gray-200 pt-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <AlertCircle size={16} color="#F59E0B" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">Low Stock Alerts</Text>
              </View>
              <Switch
                value={settings.notifications.lowStockEnabled}
                onValueChange={(value) => handleToggleSetting('lowStockEnabled', value)}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={settings.notifications.lowStockEnabled ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            {settings.notifications.lowStockEnabled && (
              <View>
                <Text className="text-xs text-gray-600 mb-2">Alert when quantity reaches</Text>
                <View className="flex-row gap-2">
                  {[0, 1, 2, 3].map((threshold) => (
                    <TouchableOpacity
                      key={threshold}
                      onPress={() => handleUpdateLowStockThreshold(threshold)}
                      className={`px-4 py-2 rounded-lg ${
                        settings.notifications.lowStockThreshold === threshold
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          settings.notifications.lowStockThreshold === threshold
                            ? 'text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        {threshold}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </>
      )}
    </Card>
  );
}
