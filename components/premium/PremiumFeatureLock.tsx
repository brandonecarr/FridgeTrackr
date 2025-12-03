import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Lock, Crown } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface PremiumFeatureLockProps {
  featureName: string;
  description: string;
  children?: React.ReactNode;
}

/**
 * Component to display a locked premium feature with upgrade CTA
 */
export function PremiumFeatureLock({
  featureName,
  description,
  children,
}: PremiumFeatureLockProps) {
  const router = useRouter();

  return (
    <View className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
      <View className="items-center mb-4">
        <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center mb-3">
          <Lock size={32} color="white" />
        </View>
        <Text className="text-xl font-bold text-slate-900 mb-2">{featureName}</Text>
        <Text className="text-sm text-slate-600 text-center mb-4">{description}</Text>
      </View>

      {children}

      <Pressable
        onPress={() => router.push('/(tabs)/premium')}
        className="bg-gradient-to-r from-blue-600 to-blue-700 py-4 rounded-xl items-center shadow-md active:opacity-80 mt-4"
      >
        <View className="flex-row items-center">
          <Crown size={20} color="white" strokeWidth={2.5} />
          <Text className="text-white text-lg font-bold ml-2">Upgrade to Premium</Text>
        </View>
        <Text className="text-blue-100 text-sm mt-1">7-day free trial • Cancel anytime</Text>
      </Pressable>
    </View>
  );
}
