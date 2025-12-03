import { Item, WasteAnalytics } from '@/types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

/**
 * Calculate waste analytics for a given time period
 */
export function calculateWasteAnalytics(
  items: Item[],
  period: 'week' | 'month' | 'custom' = 'month',
  customStartDate?: string,
  customEndDate?: string
): WasteAnalytics {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  // Determine date range based on period
  if (period === 'week') {
    startDate = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
    endDate = endOfWeek(now, { weekStartsOn: 0 });
  } else if (period === 'month') {
    startDate = startOfMonth(now);
    endDate = endOfMonth(now);
  } else if (period === 'custom' && customStartDate && customEndDate) {
    startDate = parseISO(customStartDate);
    endDate = parseISO(customEndDate);
  } else {
    // Default to current month
    startDate = startOfMonth(now);
    endDate = endOfMonth(now);
  }

  // Filter items added in this period
  const itemsInPeriod = items.filter(item => {
    const createdDate = parseISO(item.createdAt);
    return isWithinInterval(createdDate, { start: startDate, end: endDate });
  });

  // Filter items disposed in this period
  const disposedInPeriod = items.filter(item => {
    if (!item.goneAt) return false;
    const goneDate = parseISO(item.goneAt);
    return isWithinInterval(goneDate, { start: startDate, end: endDate });
  });

  // Calculate metrics
  const totalItemsAdded = itemsInPeriod.length;
  const itemsUsed = disposedInPeriod.filter(item => item.disposalReason === 'used').length;
  const itemsExpired = disposedInPeriod.filter(item => item.disposalReason === 'expired').length;
  const itemsThrown = disposedInPeriod.filter(
    item => item.disposalReason === 'thrown_away' || item.disposalReason === 'unknown'
  ).length;

  // Calculate savings (items used properly)
  const estimatedSavings = disposedInPeriod
    .filter(item => item.disposalReason === 'used')
    .reduce((sum, item) => sum + (item.approximateCost || 0), 0);

  // Calculate waste (expired or thrown away items)
  const estimatedWaste = disposedInPeriod
    .filter(item => item.disposalReason === 'expired' || item.disposalReason === 'thrown_away')
    .reduce((sum, item) => sum + (item.approximateCost || 0), 0);

  // Calculate waste by category
  const wasteByCategory: { [category: string]: number } = {};
  disposedInPeriod
    .filter(item => item.disposalReason === 'expired' || item.disposalReason === 'thrown_away')
    .forEach(item => {
      const category = item.category || 'Uncategorized';
      wasteByCategory[category] = (wasteByCategory[category] || 0) + (item.approximateCost || 0);
    });

  // Calculate top wasted items
  const wasteItemMap = new Map<string, { count: number; value: number }>();
  disposedInPeriod
    .filter(item => item.disposalReason === 'expired' || item.disposalReason === 'thrown_away')
    .forEach(item => {
      const existing = wasteItemMap.get(item.name) || { count: 0, value: 0 };
      wasteItemMap.set(item.name, {
        count: existing.count + 1,
        value: existing.value + (item.approximateCost || 0),
      });
    });

  const topWastedItems = Array.from(wasteItemMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  return {
    period,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    totalItemsAdded,
    itemsUsed,
    itemsExpired,
    itemsThrown,
    estimatedSavings,
    estimatedWaste,
    wasteByCategory,
    topWastedItems,
  };
}

/**
 * Calculate waste percentage
 */
export function calculateWastePercentage(analytics: WasteAnalytics): number {
  const totalDisposed = analytics.itemsUsed + analytics.itemsExpired + analytics.itemsThrown;
  if (totalDisposed === 0) return 0;
  return ((analytics.itemsExpired + analytics.itemsThrown) / totalDisposed) * 100;
}

/**
 * Calculate efficiency score (0-100)
 * Based on: waste percentage, items used, and savings
 */
export function calculateEfficiencyScore(analytics: WasteAnalytics): number {
  const wastePercentage = calculateWastePercentage(analytics);
  const totalDisposed = analytics.itemsUsed + analytics.itemsExpired + analytics.itemsThrown;

  if (totalDisposed === 0) return 100; // No waste if nothing disposed

  // Score calculation:
  // - Lower waste percentage = higher score (up to 60 points)
  // - Higher usage rate = higher score (up to 40 points)
  const wasteScore = Math.max(0, 60 - (wastePercentage * 0.6));
  const usageScore = totalDisposed > 0 ? (analytics.itemsUsed / totalDisposed) * 40 : 0;

  return Math.round(wasteScore + usageScore);
}

/**
 * Get historical analytics for charting
 */
export function getHistoricalAnalytics(
  items: Item[],
  months: number = 6
): WasteAnalytics[] {
  const analytics: WasteAnalytics[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    // Filter items for this month
    const monthlyItems = items.filter(item => {
      const createdDate = parseISO(item.createdAt);
      return isWithinInterval(createdDate, { start, end });
    });

    const monthlyDisposed = items.filter(item => {
      if (!item.goneAt) return false;
      const goneDate = parseISO(item.goneAt);
      return isWithinInterval(goneDate, { start, end });
    });

    const monthlyAnalytics = calculateMonthlyStats(monthlyItems, monthlyDisposed, start, end);
    analytics.push(monthlyAnalytics);
  }

  return analytics;
}

/**
 * Helper to calculate monthly stats
 */
function calculateMonthlyStats(
  addedItems: Item[],
  disposedItems: Item[],
  startDate: Date,
  endDate: Date
): WasteAnalytics {
  const itemsUsed = disposedItems.filter(item => item.disposalReason === 'used').length;
  const itemsExpired = disposedItems.filter(item => item.disposalReason === 'expired').length;
  const itemsThrown = disposedItems.filter(
    item => item.disposalReason === 'thrown_away' || item.disposalReason === 'unknown'
  ).length;

  const estimatedSavings = disposedItems
    .filter(item => item.disposalReason === 'used')
    .reduce((sum, item) => sum + (item.approximateCost || 0), 0);

  const estimatedWaste = disposedItems
    .filter(item => item.disposalReason === 'expired' || item.disposalReason === 'thrown_away')
    .reduce((sum, item) => sum + (item.approximateCost || 0), 0);

  const wasteByCategory: { [category: string]: number } = {};
  disposedItems
    .filter(item => item.disposalReason === 'expired' || item.disposalReason === 'thrown_away')
    .forEach(item => {
      const category = item.category || 'Uncategorized';
      wasteByCategory[category] = (wasteByCategory[category] || 0) + (item.approximateCost || 0);
    });

  return {
    period: 'month',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    totalItemsAdded: addedItems.length,
    itemsUsed,
    itemsExpired,
    itemsThrown,
    estimatedSavings,
    estimatedWaste,
    wasteByCategory,
    topWastedItems: [],
  };
}

/**
 * Get category breakdown for pie chart
 */
export function getCategoryBreakdown(analytics: WasteAnalytics): {
  category: string;
  value: number;
  percentage: number;
  color: string;
}[] {
  const total = Object.values(analytics.wasteByCategory).reduce((sum, val) => sum + val, 0);

  if (total === 0) return [];

  // Color palette for categories
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#d946ef', // fuchsia
  ];

  return Object.entries(analytics.wasteByCategory)
    .map(([category, value], index) => ({
      category,
      value,
      percentage: (value / total) * 100,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.value - a.value);
}
