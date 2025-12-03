import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trash2,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
  ChevronRight,
} from 'lucide-react-native';
import { useStore } from '@/store';
import { usePremium } from '@/hooks/usePremium';
import { Card } from '@/components/ui/Card';
import { PremiumFeatureLock } from '@/components/premium/PremiumFeatureLock';
import {
  calculateWasteAnalytics,
  calculateWastePercentage,
  calculateEfficiencyScore,
  getCategoryBreakdown,
} from '@/utils/analyticsCalculator';
import { format } from 'date-fns';

type AnalyticsPeriod = 'week' | 'month';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { isPremium } = usePremium();
  const { items } = useStore();
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('month');

  // Calculate analytics for selected period
  const analytics = useMemo(() => {
    return calculateWasteAnalytics(items, selectedPeriod);
  }, [items, selectedPeriod]);

  const wastePercentage = useMemo(() => calculateWastePercentage(analytics), [analytics]);
  const efficiencyScore = useMemo(() => calculateEfficiencyScore(analytics), [analytics]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(analytics), [analytics]);

  if (!isPremium) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Analytics',
            headerBackTitle: 'Premium',
          }}
        />
        <SafeAreaView className="flex-1 bg-gray-50">
          <PremiumFeatureLock
            featureName="Food Waste & Savings Analytics"
            description="Track your food waste patterns, savings, and get personalized insights to reduce waste and save money."
          />
        </SafeAreaView>
      </>
    );
  }

  // Determine score color and message
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent! Keep it up!';
    if (score >= 60) return 'Good, but room to improve';
    return 'Let\'s reduce waste together';
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Analytics',
          headerBackTitle: 'Premium',
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Period Selector */}
          <View className="px-6 pt-4 pb-2">
            <View className="flex-row bg-white rounded-xl p-1 shadow-sm">
              <Pressable
                onPress={() => setSelectedPeriod('week')}
                className={`flex-1 py-3 rounded-lg ${
                  selectedPeriod === 'week' ? 'bg-blue-500' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    selectedPeriod === 'week' ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  This Week
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedPeriod('month')}
                className={`flex-1 py-3 rounded-lg ${
                  selectedPeriod === 'month' ? 'bg-blue-500' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    selectedPeriod === 'month' ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  This Month
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Date Range */}
          <View className="px-6 pt-2 pb-4">
            <View className="flex-row items-center justify-center">
              <Calendar size={14} color="#64748b" />
              <Text className="text-slate-500 text-sm ml-1">
                {format(new Date(analytics.startDate), 'MMM d')} -{' '}
                {format(new Date(analytics.endDate), 'MMM d, yyyy')}
              </Text>
            </View>
          </View>

          {/* Efficiency Score Card */}
          <View className="px-6 pb-4">
            <Card variant="elevated" className="p-6 items-center bg-gradient-to-br from-blue-50 to-indigo-50">
              <Text className="text-slate-600 text-sm font-medium mb-2">Efficiency Score</Text>
              <Text className={`text-6xl font-bold ${getScoreColor(efficiencyScore)}`}>
                {efficiencyScore}
              </Text>
              <Text className="text-slate-500 text-sm mt-1">{getScoreMessage(efficiencyScore)}</Text>

              {/* Waste Percentage */}
              <View className="mt-4 pt-4 border-t border-slate-200 w-full">
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-600 text-sm">Waste Rate</Text>
                  <Text className={`text-lg font-bold ${wastePercentage > 20 ? 'text-red-600' : 'text-green-600'}`}>
                    {wastePercentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Financial Overview */}
          <View className="px-6 pb-4">
            <Text className="text-slate-900 text-lg font-bold mb-3">Financial Impact</Text>
            <View className="flex-row gap-3">
              {/* Savings */}
              <Card variant="elevated" className="flex-1 p-4 bg-green-50">
                <View className="flex-row items-center mb-2">
                  <DollarSign size={18} color="#22c55e" strokeWidth={2.5} />
                  <Text className="text-green-700 text-xs font-semibold ml-1">SAVED</Text>
                </View>
                <Text className="text-green-900 text-2xl font-bold">
                  ${analytics.estimatedSavings.toFixed(2)}
                </Text>
                <Text className="text-green-600 text-xs mt-1">
                  {analytics.itemsUsed} items used
                </Text>
              </Card>

              {/* Waste */}
              <Card variant="elevated" className="flex-1 p-4 bg-red-50">
                <View className="flex-row items-center mb-2">
                  <Trash2 size={18} color="#ef4444" strokeWidth={2.5} />
                  <Text className="text-red-700 text-xs font-semibold ml-1">WASTED</Text>
                </View>
                <Text className="text-red-900 text-2xl font-bold">
                  ${analytics.estimatedWaste.toFixed(2)}
                </Text>
                <Text className="text-red-600 text-xs mt-1">
                  {analytics.itemsExpired + analytics.itemsThrown} items lost
                </Text>
              </Card>
            </View>
          </View>

          {/* Item Breakdown */}
          <View className="px-6 pb-4">
            <Text className="text-slate-900 text-lg font-bold mb-3">Item Breakdown</Text>
            <Card variant="elevated" className="p-4">
              {/* Added Items */}
              <View className="flex-row items-center justify-between py-3 border-b border-slate-100">
                <View className="flex-row items-center">
                  <ShoppingBag size={20} color="#3b82f6" />
                  <Text className="text-slate-700 text-base ml-3">Items Added</Text>
                </View>
                <Text className="text-slate-900 text-lg font-bold">
                  {analytics.totalItemsAdded}
                </Text>
              </View>

              {/* Used Items */}
              <View className="flex-row items-center justify-between py-3 border-b border-slate-100">
                <View className="flex-row items-center">
                  <CheckCircle2 size={20} color="#22c55e" />
                  <Text className="text-slate-700 text-base ml-3">Items Used</Text>
                </View>
                <Text className="text-green-600 text-lg font-bold">
                  {analytics.itemsUsed}
                </Text>
              </View>

              {/* Expired Items */}
              <View className="flex-row items-center justify-between py-3 border-b border-slate-100">
                <View className="flex-row items-center">
                  <AlertCircle size={20} color="#f97316" />
                  <Text className="text-slate-700 text-base ml-3">Items Expired</Text>
                </View>
                <Text className="text-orange-600 text-lg font-bold">
                  {analytics.itemsExpired}
                </Text>
              </View>

              {/* Thrown Away */}
              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center">
                  <Trash2 size={20} color="#ef4444" />
                  <Text className="text-slate-700 text-base ml-3">Items Thrown Away</Text>
                </View>
                <Text className="text-red-600 text-lg font-bold">
                  {analytics.itemsThrown}
                </Text>
              </View>
            </Card>
          </View>

          {/* Top Wasted Items */}
          {analytics.topWastedItems.length > 0 && (
            <View className="px-6 pb-4">
              <Text className="text-slate-900 text-lg font-bold mb-3">Most Wasted Items</Text>
              <Card variant="elevated" className="p-4">
                {analytics.topWastedItems.map((item, index) => (
                  <View
                    key={item.name}
                    className={`flex-row items-center justify-between py-3 ${
                      index < analytics.topWastedItems.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <View className="flex-1">
                      <Text className="text-slate-900 text-base font-medium">{item.name}</Text>
                      <Text className="text-slate-500 text-sm">{item.count} times</Text>
                    </View>
                    <Text className="text-red-600 text-lg font-bold">
                      ${item.value.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* Waste by Category */}
          {categoryBreakdown.length > 0 && (
            <View className="px-6 pb-4">
              <Text className="text-slate-900 text-lg font-bold mb-3">Waste by Category</Text>
              <Card variant="elevated" className="p-4">
                {categoryBreakdown.map((cat, index) => (
                  <View
                    key={cat.category}
                    className={`py-3 ${
                      index < categoryBreakdown.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-slate-900 text-base font-medium">{cat.category}</Text>
                      <Text className="text-slate-900 text-base font-bold">
                        ${cat.value.toFixed(2)}
                      </Text>
                    </View>
                    {/* Progress bar */}
                    <View className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                      />
                    </View>
                    <Text className="text-slate-500 text-xs mt-1">
                      {cat.percentage.toFixed(1)}% of total waste
                    </Text>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* View Trends Button */}
          <View className="px-6 pb-4">
            <Pressable
              onPress={() => router.push('/premium/analytics-trends')}
              className="bg-blue-500 rounded-xl p-4 flex-row items-center justify-center active:bg-blue-600"
            >
              <TrendingUp size={20} color="white" strokeWidth={2.5} />
              <Text className="text-white text-base font-semibold ml-2">View Trends & History</Text>
              <ChevronRight size={20} color="white" className="ml-auto" />
            </Pressable>
          </View>

          {/* Export Button */}
          <View className="px-6 pb-8">
            <Pressable
              onPress={() => {
                // TODO: Implement export functionality
                alert('Export feature coming soon!');
              }}
              className="bg-slate-100 rounded-xl p-4 flex-row items-center justify-center active:bg-slate-200"
            >
              <Download size={20} color="#475569" strokeWidth={2.5} />
              <Text className="text-slate-700 text-base font-semibold ml-2">Export Report</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
