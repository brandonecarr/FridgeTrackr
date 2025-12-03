import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Switch } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Zap,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingCart,
  Clock,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Settings,
} from 'lucide-react-native';
import * as haptics from '@/utils/haptics';

interface AutomationRule {
  id: string;
  name: string;
  type: 'low_stock' | 'expiring_soon' | 'out_of_stock' | 'recurring';
  enabled: boolean;
  condition: {
    threshold?: number;
    days?: number;
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
  action: {
    type: 'add_to_shopping_list' | 'send_notification';
    category?: string;
  };
  icon: React.ReactNode;
  color: string;
}

export default function AutomationRulesScreen() {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Low Stock Alert',
      type: 'low_stock',
      enabled: true,
      condition: { threshold: 2 },
      action: { type: 'add_to_shopping_list' },
      icon: <TrendingDown size={20} color="#F59E0B" />,
      color: 'bg-amber-50',
    },
    {
      id: '2',
      name: 'Auto-Restock Essentials',
      type: 'out_of_stock',
      enabled: true,
      condition: { threshold: 0 },
      action: { type: 'add_to_shopping_list', category: 'Essentials' },
      icon: <ShoppingCart size={20} color="#EF4444" />,
      color: 'bg-red-50',
    },
    {
      id: '3',
      name: 'Expiring Soon Reminder',
      type: 'expiring_soon',
      enabled: false,
      condition: { days: 3 },
      action: { type: 'send_notification' },
      icon: <Clock size={20} color="#3B82F6" />,
      color: 'bg-blue-50',
    },
    {
      id: '4',
      name: 'Weekly Grocery Check',
      type: 'recurring',
      enabled: false,
      condition: { frequency: 'weekly' },
      action: { type: 'send_notification' },
      icon: <AlertCircle size={20} color="#8B5CF6" />,
      color: 'bg-purple-50',
    },
  ]);

  const handleToggleRule = (ruleId: string) => {
    haptics.light();
    setRules(
      rules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const handleEditRule = (ruleId: string) => {
    haptics.light();
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    let options: string[] = [];
    let currentValue = '';

    if (rule.type === 'low_stock' || rule.type === 'out_of_stock') {
      options = ['1 item', '2 items', '3 items', '5 items'];
      currentValue = `${rule.condition.threshold} item${rule.condition.threshold !== 1 ? 's' : ''}`;
    } else if (rule.type === 'expiring_soon') {
      options = ['1 day', '2 days', '3 days', '5 days', '7 days'];
      currentValue = `${rule.condition.days} day${rule.condition.days !== 1 ? 's' : ''}`;
    } else if (rule.type === 'recurring') {
      options = ['Daily', 'Weekly', 'Monthly'];
      currentValue = rule.condition.frequency || 'weekly';
    }

    Alert.alert(
      `Edit ${rule.name}`,
      `Current: ${currentValue}\n\nChoose new threshold:`,
      [
        ...options.map(option => ({
          text: option,
          onPress: () => {
            haptics.success();
            const value = parseInt(option);
            setRules(
              rules.map(r =>
                r.id === ruleId
                  ? {
                      ...r,
                      condition: {
                        ...r.condition,
                        threshold: !isNaN(value) ? value : r.condition.threshold,
                        days: !isNaN(value) ? value : r.condition.days,
                        frequency: option.toLowerCase() as any,
                      },
                    }
                  : r
              )
            );
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    Alert.alert(
      'Delete Rule',
      'Are you sure you want to delete this automation rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            haptics.heavy();
            setRules(rules.filter(r => r.id !== ruleId));
          },
        },
      ]
    );
  };

  const handleTestRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    haptics.success();
    Alert.alert(
      'Test Automation',
      `"${rule.name}" would trigger when:\n\n${getConditionDescription(rule)}\n\nAction: ${getActionDescription(rule)}`,
      [{ text: 'OK' }]
    );
  };

  const getConditionDescription = (rule: AutomationRule): string => {
    switch (rule.type) {
      case 'low_stock':
        return `Items drop to ${rule.condition.threshold} or fewer`;
      case 'out_of_stock':
        return `Items reach 0 quantity`;
      case 'expiring_soon':
        return `Items expiring within ${rule.condition.days} days`;
      case 'recurring':
        return `${rule.condition.frequency} schedule`;
      default:
        return '';
    }
  };

  const getActionDescription = (rule: AutomationRule): string => {
    if (rule.action.type === 'add_to_shopping_list') {
      return `Add to shopping list${rule.action.category ? ` (${rule.action.category})` : ''}`;
    }
    return 'Send notification';
  };

  const enabledCount = rules.filter(r => r.enabled).length;

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: 'Automation Rules',
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
            Smart Automation
          </Text>
          <Text className="text-blue-100 text-sm">
            Let the app handle routine tasks automatically
          </Text>
        </View>

        {/* Stats */}
        <View className="px-5 py-6">
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
                  <Zap size={24} color="#10B981" />
                </View>
                <View>
                  <Text className="text-2xl font-bold text-gray-900">
                    {enabledCount}/{rules.length}
                  </Text>
                  <Text className="text-sm text-gray-600">Active Rules</Text>
                </View>
              </View>
              <View className="bg-green-50 px-3 py-1.5 rounded-full">
                <Text className="text-green-700 font-semibold text-xs">
                  AUTOMATED
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rules */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Your Rules
          </Text>
          <View className="gap-3">
            {rules.map(rule => (
              <View
                key={rule.id}
                className={`rounded-xl p-4 border ${
                  rule.enabled
                    ? `${rule.color} border-gray-200`
                    : 'bg-gray-100 border-gray-200'
                }`}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-start flex-1">
                    <View
                      className={`mt-1 mr-3 ${
                        !rule.enabled ? 'opacity-40' : ''
                      }`}
                    >
                      {rule.icon}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-base font-bold mb-1 ${
                          rule.enabled ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {rule.name}
                      </Text>
                      <Text
                        className={`text-sm mb-2 ${
                          rule.enabled ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        {getConditionDescription(rule)}
                      </Text>
                      <View className="flex-row items-center">
                        <CheckCircle
                          size={12}
                          color={rule.enabled ? '#10B981' : '#9CA3AF'}
                        />
                        <Text
                          className={`text-xs ml-1 ${
                            rule.enabled ? 'text-gray-600' : 'text-gray-400'
                          }`}
                        >
                          {getActionDescription(rule)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Switch
                    value={rule.enabled}
                    onValueChange={() => handleToggleRule(rule.id)}
                    trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                    thumbColor="#fff"
                  />
                </View>

                {rule.enabled && (
                  <View className="flex-row gap-2 pt-3 border-t border-gray-200">
                    <Pressable
                      onPress={() => handleEditRule(rule.id)}
                      className="flex-1 bg-white rounded-lg py-2 px-3 border border-gray-300 active:bg-gray-50"
                    >
                      <View className="flex-row items-center justify-center">
                        <Settings size={14} color="#6B7280" />
                        <Text className="text-xs font-semibold text-gray-700 ml-1">
                          Configure
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => handleTestRule(rule.id)}
                      className="flex-1 bg-white rounded-lg py-2 px-3 border border-gray-300 active:bg-gray-50"
                    >
                      <View className="flex-row items-center justify-center">
                        <Zap size={14} color="#6B7280" />
                        <Text className="text-xs font-semibold text-gray-700 ml-1">
                          Test
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteRule(rule.id)}
                      className="bg-white rounded-lg py-2 px-3 border border-red-300 active:bg-red-50"
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Add New Rule */}
        <View className="px-5 pb-6">
          <Pressable
            onPress={() => {
              haptics.light();
              Alert.alert(
                'Coming Soon',
                'Custom automation rules will be available in a future update. For now, configure the existing rules to match your needs.',
                [{ text: 'OK' }]
              );
            }}
            className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex-row items-center justify-center active:bg-blue-100"
          >
            <Plus size={20} color="#3B82F6" />
            <Text className="text-blue-600 font-semibold ml-2">
              Create Custom Rule
            </Text>
          </Pressable>
        </View>

        {/* How It Works */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            How Automation Works
          </Text>
          <View className="bg-white rounded-xl p-5 border border-gray-200">
            <View className="flex-row items-start mb-4">
              <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-blue-600 font-bold text-xs">1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  Monitor Conditions
                </Text>
                <Text className="text-sm text-gray-600">
                  The app continuously checks your inventory against rule conditions
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mb-4">
              <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-blue-600 font-bold text-xs">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  Trigger Actions
                </Text>
                <Text className="text-sm text-gray-600">
                  When conditions are met, the rule automatically performs the specified action
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-blue-600 font-bold text-xs">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  Stay Informed
                </Text>
                <Text className="text-sm text-gray-600">
                  You'll get notifications when automation takes action on your behalf
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Automation Tips
          </Text>
          <View className="bg-white rounded-xl p-5 border border-gray-200">
            <View className="flex-row items-start mb-4">
              <CheckCircle size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Enable "Low Stock Alert" to never run out of essentials
              </Text>
            </View>
            <View className="flex-row items-start mb-4">
              <CheckCircle size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Set up recurring checks for weekly grocery planning
              </Text>
            </View>
            <View className="flex-row items-start mb-4">
              <CheckCircle size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Configure thresholds based on your consumption patterns
              </Text>
            </View>
            <View className="flex-row items-start">
              <CheckCircle size={16} color="#10B981" className="mt-0.5" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                Test rules to see how they work before relying on them
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
