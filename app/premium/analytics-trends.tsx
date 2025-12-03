import React, { useMemo } from 'react';
import { View, Text, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { TrendingUp, DollarSign, Percent } from 'lucide-react-native';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { getHistoricalAnalytics, calculateWastePercentage } from '@/utils/analyticsCalculator';
import { format, parseISO } from 'date-fns';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 48; // Account for padding
const CHART_HEIGHT = 200;

export default function AnalyticsTrendsScreen() {
  const { items } = useStore();

  // Get last 6 months of data
  const historicalData = useMemo(() => {
    return getHistoricalAnalytics(items, 6);
  }, [items]);

  // Calculate chart data
  const chartData = useMemo(() => {
    const maxWaste = Math.max(...historicalData.map(d => d.estimatedWaste), 1);
    const maxSavings = Math.max(...historicalData.map(d => d.estimatedSavings), 1);
    const maxItems = Math.max(...historicalData.map(d => d.totalItemsAdded), 1);

    return {
      waste: historicalData.map(d => ({
        value: d.estimatedWaste,
        normalized: (d.estimatedWaste / maxWaste) * (CHART_HEIGHT - 40),
        label: format(parseISO(d.startDate), 'MMM'),
      })),
      savings: historicalData.map(d => ({
        value: d.estimatedSavings,
        normalized: (d.estimatedSavings / maxSavings) * (CHART_HEIGHT - 40),
        label: format(parseISO(d.startDate), 'MMM'),
      })),
      items: historicalData.map(d => ({
        value: d.totalItemsAdded,
        normalized: (d.totalItemsAdded / maxItems) * (CHART_HEIGHT - 40),
        label: format(parseISO(d.startDate), 'MMM'),
      })),
      wastePercentage: historicalData.map(d => ({
        value: calculateWastePercentage(d),
        label: format(parseISO(d.startDate), 'MMM'),
      })),
    };
  }, [historicalData]);

  // Calculate trends
  const trends = useMemo(() => {
    if (historicalData.length < 2) {
      return { waste: 0, savings: 0, efficiency: 0 };
    }

    const recent = historicalData[historicalData.length - 1];
    const previous = historicalData[historicalData.length - 2];

    const wasteChange =
      previous.estimatedWaste > 0
        ? ((recent.estimatedWaste - previous.estimatedWaste) / previous.estimatedWaste) * 100
        : 0;

    const savingsChange =
      previous.estimatedSavings > 0
        ? ((recent.estimatedSavings - previous.estimatedSavings) / previous.estimatedSavings) * 100
        : 0;

    const recentWastePercentage = calculateWastePercentage(recent);
    const previousWastePercentage = calculateWastePercentage(previous);
    const efficiencyChange = previousWastePercentage - recentWastePercentage; // Lower waste = better

    return { waste: wasteChange, savings: savingsChange, efficiency: efficiencyChange };
  }, [historicalData]);

  const getTrendColor = (value: number, inverse: boolean = false) => {
    if (value === 0) return 'text-slate-600';
    const isPositive = inverse ? value < 0 : value > 0;
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (value: number, inverse: boolean = false) => {
    if (value === 0) return null;
    const isPositive = inverse ? value < 0 : value > 0;
    return isPositive ? '↗' : '↘';
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Trends & History',
          headerBackTitle: 'Analytics',
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Trend Summary */}
          <View className="px-6 pt-4 pb-4">
            <Text className="text-slate-900 text-lg font-bold mb-3">Month-over-Month Trends</Text>
            <View className="flex-row gap-3">
              {/* Waste Trend */}
              <Card variant="elevated" className="flex-1 p-4">
                <Text className="text-slate-600 text-xs font-medium mb-1">Waste</Text>
                <View className="flex-row items-center">
                  <Text className={`text-xl font-bold ${getTrendColor(trends.waste, true)}`}>
                    {trends.waste > 0 ? '+' : ''}
                    {trends.waste.toFixed(1)}%
                  </Text>
                  {getTrendIcon(trends.waste, true) && (
                    <Text className={`text-xl ml-1 ${getTrendColor(trends.waste, true)}`}>
                      {getTrendIcon(trends.waste, true)}
                    </Text>
                  )}
                </View>
              </Card>

              {/* Savings Trend */}
              <Card variant="elevated" className="flex-1 p-4">
                <Text className="text-slate-600 text-xs font-medium mb-1">Savings</Text>
                <View className="flex-row items-center">
                  <Text className={`text-xl font-bold ${getTrendColor(trends.savings)}`}>
                    {trends.savings > 0 ? '+' : ''}
                    {trends.savings.toFixed(1)}%
                  </Text>
                  {getTrendIcon(trends.savings) && (
                    <Text className={`text-xl ml-1 ${getTrendColor(trends.savings)}`}>
                      {getTrendIcon(trends.savings)}
                    </Text>
                  )}
                </View>
              </Card>
            </View>
          </View>

          {/* Waste Trend Chart */}
          <View className="px-6 pb-4">
            <Text className="text-slate-900 text-lg font-bold mb-3">Waste Over Time</Text>
            <Card variant="elevated" className="p-4">
              <View className="flex-row items-center mb-2">
                <DollarSign size={16} color="#ef4444" />
                <Text className="text-red-600 text-sm font-semibold ml-1">Money Wasted</Text>
              </View>

              {/* Chart */}
              <View className="mt-4">
                <View
                  className="border-l border-b border-slate-200"
                  style={{ height: CHART_HEIGHT, width: CHART_WIDTH - 32 }}
                >
                  <View className="flex-row items-end justify-around h-full pb-8 pl-2">
                    {chartData.waste.map((dataPoint, index) => (
                      <View key={index} className="items-center flex-1">
                        {/* Bar */}
                        <View className="w-full items-center mb-2">
                          <Text className="text-red-600 text-xs font-semibold mb-1">
                            ${dataPoint.value.toFixed(0)}
                          </Text>
                          <View
                            className="w-3/4 bg-red-500 rounded-t"
                            style={{ height: Math.max(dataPoint.normalized, 4) }}
                          />
                        </View>
                        {/* Label */}
                        <Text className="text-slate-500 text-xs">{dataPoint.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Savings Trend Chart */}
          <View className="px-6 pb-4">
            <Text className="text-slate-900 text-lg font-bold mb-3">Savings Over Time</Text>
            <Card variant="elevated" className="p-4">
              <View className="flex-row items-center mb-2">
                <DollarSign size={16} color="#22c55e" />
                <Text className="text-green-600 text-sm font-semibold ml-1">Money Saved</Text>
              </View>

              {/* Chart */}
              <View className="mt-4">
                <View
                  className="border-l border-b border-slate-200"
                  style={{ height: CHART_HEIGHT, width: CHART_WIDTH - 32 }}
                >
                  <View className="flex-row items-end justify-around h-full pb-8 pl-2">
                    {chartData.savings.map((dataPoint, index) => (
                      <View key={index} className="items-center flex-1">
                        {/* Bar */}
                        <View className="w-full items-center mb-2">
                          <Text className="text-green-600 text-xs font-semibold mb-1">
                            ${dataPoint.value.toFixed(0)}
                          </Text>
                          <View
                            className="w-3/4 bg-green-500 rounded-t"
                            style={{ height: Math.max(dataPoint.normalized, 4) }}
                          />
                        </View>
                        {/* Label */}
                        <Text className="text-slate-500 text-xs">{dataPoint.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Waste Percentage Line Chart */}
          <View className="px-6 pb-4">
            <Text className="text-slate-900 text-lg font-bold mb-3">Waste Rate Trend</Text>
            <Card variant="elevated" className="p-4">
              <View className="flex-row items-center mb-2">
                <Percent size={16} color="#f97316" />
                <Text className="text-orange-600 text-sm font-semibold ml-1">Waste Percentage</Text>
              </View>

              {/* Chart */}
              <View className="mt-4">
                <View
                  className="border-l border-b border-slate-200"
                  style={{ height: CHART_HEIGHT, width: CHART_WIDTH - 32 }}
                >
                  <View className="flex-row items-end justify-around h-full pb-8 pl-2">
                    {chartData.wastePercentage.map((dataPoint, index) => (
                      <View key={index} className="items-center flex-1">
                        {/* Bar */}
                        <View className="w-full items-center mb-2">
                          <Text className="text-orange-600 text-xs font-semibold mb-1">
                            {dataPoint.value.toFixed(0)}%
                          </Text>
                          <View
                            className="w-3/4 bg-orange-500 rounded-t"
                            style={{ height: Math.max((dataPoint.value / 100) * (CHART_HEIGHT - 40), 4) }}
                          />
                        </View>
                        {/* Label */}
                        <Text className="text-slate-500 text-xs">{dataPoint.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Items Activity Chart */}
          <View className="px-6 pb-8">
            <Text className="text-slate-900 text-lg font-bold mb-3">Inventory Activity</Text>
            <Card variant="elevated" className="p-4">
              <View className="flex-row items-center mb-2">
                <TrendingUp size={16} color="#3b82f6" />
                <Text className="text-blue-600 text-sm font-semibold ml-1">Items Added</Text>
              </View>

              {/* Chart */}
              <View className="mt-4">
                <View
                  className="border-l border-b border-slate-200"
                  style={{ height: CHART_HEIGHT, width: CHART_WIDTH - 32 }}
                >
                  <View className="flex-row items-end justify-around h-full pb-8 pl-2">
                    {chartData.items.map((dataPoint, index) => (
                      <View key={index} className="items-center flex-1">
                        {/* Bar */}
                        <View className="w-full items-center mb-2">
                          <Text className="text-blue-600 text-xs font-semibold mb-1">
                            {dataPoint.value}
                          </Text>
                          <View
                            className="w-3/4 bg-blue-500 rounded-t"
                            style={{ height: Math.max(dataPoint.normalized, 4) }}
                          />
                        </View>
                        {/* Label */}
                        <Text className="text-slate-500 text-xs">{dataPoint.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
