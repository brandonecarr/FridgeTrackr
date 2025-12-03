import React from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable } from 'react-native';
import {
  Crown,
  ChefHat,
  Camera,
  TrendingDown,
  Users,
  Truck,
  Sparkles,
  Check,
  Calendar,
  Database,
  Bell,
  Share2,
  Zap,
} from 'lucide-react-native';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import * as haptics from '@/utils/haptics';

export default function PremiumScreen() {
  const { userAccount, togglePremium } = useStore();
  const isPremium = userAccount.isPremium;

  const handleTogglePremium = () => {
    if (!isPremium) {
      haptics.premiumUnlocked();
    } else {
      haptics.light();
    }
    togglePremium();
  };

  if (!isPremium) {
    // Show upgrade screen for free users
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View className="px-6 pt-8 pb-6 items-center">
            <View className="w-20 h-20 bg-yellow-400 rounded-full items-center justify-center mb-4">
              <Crown size={40} color="white" strokeWidth={2.5} />
            </View>
            <Text className="text-3xl font-bold text-slate-900 mb-2">
              Upgrade to Premium
            </Text>
            <Text className="text-lg text-slate-600 text-center">
              Unlock powerful features to reduce waste and save money
            </Text>
          </View>

          {/* Premium Features */}
          <View className="px-6 mb-6">
            <FeatureCard
              icon={<ChefHat size={24} color="#3B82F6" />}
              title="AI Recipe Suggestions"
              description="Get personalized recipes using ingredients you already have, prioritizing items expiring soon"
              gradient="from-blue-100 to-blue-50"
            />

            <FeatureCard
              icon={<Camera size={24} color="#10B981" />}
              title="Receipt Scanning"
              description="Scan receipts to instantly add items to your inventory with smart categorization"
              gradient="from-emerald-100 to-emerald-50"
            />

            <FeatureCard
              icon={<TrendingDown size={24} color="#F59E0B" />}
              title="Waste Analytics"
              description="Track your food waste, see savings, and get insights to reduce waste over time"
              gradient="from-amber-100 to-amber-50"
            />

            <FeatureCard
              icon={<Users size={24} color="#8B5CF6" />}
              title="Household Sharing"
              description="Share your inventory across devices with family members in real-time"
              gradient="from-purple-100 to-purple-50"
            />

            <FeatureCard
              icon={<Truck size={24} color="#EC4899" />}
              title="Delivery Integration"
              description="Export shopping lists directly to Instacart, Walmart, and more"
              gradient="from-pink-100 to-pink-50"
            />

            <FeatureCard
              icon={<Calendar size={24} color="#14B8A6" />}
              title="Meal Planning"
              description="Plan weekly meals with recipes and auto-generate shopping lists"
              gradient="from-teal-100 to-teal-50"
            />

            <FeatureCard
              icon={<Database size={24} color="#6366F1" />}
              title="Backup & Restore"
              description="Export and import your data to never lose your inventory"
              gradient="from-indigo-100 to-indigo-50"
            />
          </View>

          {/* Pricing */}
          <View className="px-6 mb-6">
            <View className="bg-blue-600 rounded-2xl p-6 shadow-lg">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-white text-2xl font-bold">$4.99/month</Text>
                  <Text className="text-blue-100 text-sm">7-day free trial</Text>
                </View>
                <View className="bg-yellow-400 px-3 py-1 rounded-full">
                  <Text className="text-blue-900 font-bold text-xs">SAVE 60%</Text>
                </View>
              </View>

              <View className="space-y-2 mb-6">
                <BenefitRow text="Unlimited recipe suggestions" />
                <BenefitRow text="Unlimited receipt scans" />
                <BenefitRow text="Detailed analytics & insights" />
                <BenefitRow text="Up to 5 household members" />
                <BenefitRow text="Priority customer support" />
              </View>
            </View>
          </View>

          {/* CTA Buttons */}
          <View className="px-6">
            <Pressable
              onPress={handleTogglePremium}
              className="bg-green-500 py-3 rounded-xl items-center shadow-lg active:bg-green-600"
            >
              <Text className="text-white text-lg font-bold leading-tight">Start Free Trial</Text>
              <Text className="text-green-50 text-sm leading-tight">Cancel anytime</Text>
            </Pressable>

            <Pressable className="mt-4 py-4 rounded-xl items-center border-2 border-slate-300 active:bg-slate-50">
              <Text className="text-slate-600 text-base font-semibold">
                Restore Purchase
              </Text>
            </Pressable>
          </View>

          {/* Fine Print */}
          <Text className="text-xs text-slate-500 text-center px-6 mt-6">
            Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Premium Dashboard for subscribed users
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Premium Header */}
        <View className="bg-blue-600 px-6 pt-8 pb-12">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-yellow-400 rounded-full items-center justify-center mr-3">
                <Crown size={24} color="#1E40AF" />
              </View>
              <View>
                <Text className="text-white text-xl font-bold">Premium Active</Text>
                <Text className="text-blue-100 text-sm">You're saving money & food!</Text>
              </View>
            </View>
            <Pressable
              onPress={handleTogglePremium}
              className="bg-white/20 px-3 py-1.5 rounded-lg active:bg-white/30"
            >
              <Text className="text-white text-xs font-medium">Manage</Text>
            </Pressable>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-3">
            <StatCard value="$24" label="Saved this month" color="from-emerald-500 to-emerald-600" />
            <StatCard value="12" label="Items rescued" color="from-blue-500 to-blue-600" />
            <StatCard value="85%" label="Waste reduction" color="from-purple-500 to-purple-600" />
          </View>
        </View>

        {/* Premium Features */}
        <View className="px-6 -mt-6">
          <Text className="text-sm font-semibold text-white uppercase tracking-wide mb-3">
            Premium Features
          </Text>

          <PremiumFeatureCard
            icon={<ChefHat size={28} color="#3B82F6" />}
            title="AI Recipes"
            description="What's for dinner tonight?"
            badge="NEW"
            route="/premium/recipes"
          />

          <PremiumFeatureCard
            icon={<Camera size={28} color="#10B981" />}
            title="Scan Receipt"
            description="Add items from your receipt"
            badge="NEW"
            route="/premium/receipt-scanner"
          />

          <PremiumFeatureCard
            icon={<TrendingDown size={28} color="#F59E0B" />}
            title="Waste Analytics"
            description="See your savings & insights"
            route="/premium/analytics"
          />

          <PremiumFeatureCard
            icon={<Users size={28} color="#8B5CF6" />}
            title="My Household"
            description="Manage family members"
            route="/premium/household"
          />

          <PremiumFeatureCard
            icon={<Truck size={28} color="#EC4899" />}
            title="Delivery Services"
            description="Connect to Instacart & more"
            route="/premium/delivery"
          />

          <PremiumFeatureCard
            icon={<Calendar size={28} color="#14B8A6" />}
            title="Meal Planner"
            description="Plan meals & generate shopping lists"
            badge="NEW"
            route="/premium/meal-planner"
          />

          <PremiumFeatureCard
            icon={<Database size={28} color="#6366F1" />}
            title="Backup & Restore"
            description="Export and import your data"
            route="/premium/data-management"
          />

          <PremiumFeatureCard
            icon={<Bell size={28} color="#F59E0B" />}
            title="Smart Notifications"
            description="Customize alerts and reminders"
            route="/premium/notification-settings"
          />

          <PremiumFeatureCard
            icon={<Share2 size={28} color="#F97316" />}
            title="Share Lists"
            description="Share shopping & inventory lists"
            route="/premium/share-lists"
          />

          <PremiumFeatureCard
            icon={<Zap size={28} color="#10B981" />}
            title="Automation Rules"
            description="Smart auto-add & notifications"
            badge="NEW"
            route="/premium/automation-rules"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  // Map gradient strings to solid colors
  const bgColor = gradient.includes('blue') ? 'bg-blue-100' :
                  gradient.includes('emerald') ? 'bg-emerald-100' :
                  gradient.includes('amber') ? 'bg-amber-100' :
                  gradient.includes('purple') ? 'bg-purple-100' :
                  gradient.includes('pink') ? 'bg-pink-100' :
                  gradient.includes('teal') ? 'bg-teal-100' :
                  gradient.includes('indigo') ? 'bg-indigo-100' : 'bg-blue-100';

  return (
    <View className={`${bgColor} rounded-2xl p-4 mb-3 border border-white`}>
      <View className="flex-row items-start">
        <View className="w-12 h-12 bg-white rounded-xl items-center justify-center mr-4">
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-slate-900 text-lg font-bold mb-1">{title}</Text>
          <Text className="text-slate-600 text-sm leading-5">{description}</Text>
        </View>
      </View>
    </View>
  );
}

function BenefitRow({ text }: { text: string }) {
  return (
    <View className="flex-row items-center">
      <View className="w-5 h-5 bg-green-400 rounded-full items-center justify-center mr-3">
        <Check size={14} color="#1E40AF" strokeWidth={3} />
      </View>
      <Text className="text-white text-sm flex-1">{text}</Text>
    </View>
  );
}

function StatCard({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  // Extract the first color from the gradient string for solid color
  const bgColor = color.includes('emerald') ? 'bg-emerald-500' :
                  color.includes('blue') ? 'bg-blue-500' :
                  color.includes('purple') ? 'bg-purple-500' : 'bg-blue-500';

  return (
    <View className={`flex-1 ${bgColor} rounded-xl p-4`}>
      <Text className="text-white text-2xl font-bold mb-1">{value}</Text>
      <Text className="text-white/90 text-xs">{label}</Text>
    </View>
  );
}

function PremiumFeatureCard({
  icon,
  title,
  description,
  badge,
  route,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  route: string;
}) {
  const router = require('expo-router').useRouter();

  return (
    <Pressable
      onPress={() => router.push(route)}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 active:bg-gray-50 shadow-sm"
    >
      <View className="flex-row items-center">
        <View className="w-14 h-14 bg-gray-100 rounded-xl items-center justify-center mr-4">
          {icon}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-slate-900 text-lg font-bold">{title}</Text>
            {badge && (
              <View className="bg-blue-500 px-2 py-0.5 rounded-full ml-2">
                <Text className="text-white text-xs font-bold">{badge}</Text>
              </View>
            )}
          </View>
          <Text className="text-slate-500 text-sm">{description}</Text>
        </View>
        <Sparkles size={20} color="#3B82F6" />
      </View>
    </Pressable>
  );
}
