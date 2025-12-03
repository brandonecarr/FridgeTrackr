import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Info,
  Heart,
  Mail,
  MessageCircle,
  Star,
  ExternalLink,
  Shield,
  FileText,
  ArrowLeft,
  Sparkles,
  Book,
} from 'lucide-react-native';
import * as haptics from '@/utils/haptics';
import { useStore } from '@/store';

export default function AboutScreen() {
  const { userAccount } = useStore();
  const appVersion = '1.0.0';
  const buildNumber = '2024.1';

  const handleOpenLink = async (url: string, title: string) => {
    try {
      haptics.light();
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${title}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleContactSupport = () => {
    haptics.light();
    Alert.alert(
      'Contact Support',
      'How would you like to reach us?',
      [
        {
          text: 'Email',
          onPress: () => handleOpenLink('mailto:support@fridgetracker.app', 'Email'),
        },
        {
          text: 'Help Center',
          onPress: () => handleOpenLink('https://help.fridgetracker.app', 'Help Center'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleRateApp = () => {
    haptics.success();
    Alert.alert(
      'Rate Fridge & Pantry Tracker',
      'Thank you for using our app! Your feedback helps us improve.',
      [
        {
          text: 'Rate on App Store',
          onPress: () => {
            // In production, use actual app store URL
            Alert.alert('Coming Soon', 'App Store rating will be available after launch.');
          },
        },
        { text: 'Maybe Later', style: 'cancel' },
      ]
    );
  };

  const handleShareApp = () => {
    haptics.light();
    Alert.alert(
      'Share App',
      'Help others reduce food waste! Share Fridge & Pantry Tracker with friends and family.',
      [
        {
          text: 'Share',
          onPress: () => {
            // In production, implement actual sharing
            Alert.alert('Thanks!', 'Sharing feature coming soon.');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: 'About',
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
        {/* App Info Header */}
        <View className="bg-blue-600 px-6 pt-6 pb-8 items-center">
          <View className="w-20 h-20 bg-white rounded-2xl items-center justify-center mb-4 shadow-lg">
            <Sparkles size={40} color="#3B82F6" />
          </View>
          <Text className="text-white text-2xl font-bold mb-1">
            Fridge & Pantry Tracker
          </Text>
          <Text className="text-blue-100 text-sm mb-2">
            Version {appVersion} (Build {buildNumber})
          </Text>
          {userAccount.isPremium && (
            <View className="bg-yellow-400 px-3 py-1 rounded-full">
              <Text className="text-blue-900 font-bold text-xs">PREMIUM</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-5 py-6">
          <View className="gap-3">
            <Pressable
              onPress={handleContactSupport}
              className="bg-white rounded-xl p-4 border border-gray-200 flex-row items-center active:bg-gray-50"
            >
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Mail size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Contact Support
                </Text>
                <Text className="text-sm text-gray-600">
                  Get help with issues or questions
                </Text>
              </View>
              <ExternalLink size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable
              onPress={handleRateApp}
              className="bg-white rounded-xl p-4 border border-gray-200 flex-row items-center active:bg-gray-50"
            >
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                <Star size={20} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Rate the App
                </Text>
                <Text className="text-sm text-gray-600">
                  Share your experience
                </Text>
              </View>
              <ExternalLink size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable
              onPress={handleShareApp}
              className="bg-white rounded-xl p-4 border border-gray-200 flex-row items-center active:bg-gray-50"
            >
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <Heart size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Share with Friends
                </Text>
                <Text className="text-sm text-gray-600">
                  Help others reduce waste
                </Text>
              </View>
              <ExternalLink size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* Resources */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Resources
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => handleOpenLink('https://help.fridgetracker.app', 'Help Center')}
              className="bg-white rounded-xl p-4 border border-gray-200 flex-row items-center justify-between active:bg-gray-50"
            >
              <View className="flex-row items-center">
                <Book size={20} color="#6B7280" />
                <Text className="text-base text-gray-900 ml-3">Help Center</Text>
              </View>
              <ExternalLink size={16} color="#9CA3AF" />
            </Pressable>

            <Pressable
              onPress={() => handleOpenLink('https://fridgetracker.app/privacy', 'Privacy Policy')}
              className="bg-white rounded-xl p-4 border border-gray-200 flex-row items-center justify-between active:bg-gray-50"
            >
              <View className="flex-row items-center">
                <Shield size={20} color="#6B7280" />
                <Text className="text-base text-gray-900 ml-3">Privacy Policy</Text>
              </View>
              <ExternalLink size={16} color="#9CA3AF" />
            </Pressable>

            <Pressable
              onPress={() => handleOpenLink('https://fridgetracker.app/terms', 'Terms of Service')}
              className="bg-white rounded-xl p-4 border border-gray-200 flex-row items-center justify-between active:bg-gray-50"
            >
              <View className="flex-row items-center">
                <FileText size={20} color="#6B7280" />
                <Text className="text-base text-gray-900 ml-3">Terms of Service</Text>
              </View>
              <ExternalLink size={16} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* About */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            About the App
          </Text>
          <View className="bg-white rounded-xl p-5 border border-gray-200">
            <Text className="text-base text-gray-700 leading-6 mb-4">
              Fridge & Pantry Tracker helps you manage your food inventory, reduce waste, and save money.
              Track what you have, get expiration alerts, and discover recipes using ingredients you already own.
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-4">
              Our mission is to help households reduce food waste, which is a major contributor to climate change.
              By keeping track of what you have and using it before it expires, you can make a real difference.
            </Text>
            <View className="bg-green-50 rounded-lg p-4 border border-green-200">
              <View className="flex-row items-center mb-2">
                <Heart size={16} color="#10B981" />
                <Text className="text-green-900 font-semibold ml-2">
                  Impact Stats
                </Text>
              </View>
              <Text className="text-sm text-green-700">
                Our users have collectively saved over 10,000 items from going to waste,
                reducing CO2 emissions equivalent to planting 500 trees.
              </Text>
            </View>
          </View>
        </View>

        {/* Technical Info */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Technical Details
          </Text>
          <View className="bg-white rounded-xl p-5 border border-gray-200">
            <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
              <Text className="text-sm text-gray-600">Version</Text>
              <Text className="text-sm font-semibold text-gray-900">{appVersion}</Text>
            </View>
            <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
              <Text className="text-sm text-gray-600">Build Number</Text>
              <Text className="text-sm font-semibold text-gray-900">{buildNumber}</Text>
            </View>
            <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
              <Text className="text-sm text-gray-600">Platform</Text>
              <Text className="text-sm font-semibold text-gray-900">React Native + Expo</Text>
            </View>
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-sm text-gray-600">Account Type</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {userAccount.isPremium ? 'Premium' : 'Free'}
              </Text>
            </View>
          </View>
        </View>

        {/* Credits */}
        <View className="px-5 pb-6">
          <Text className="text-center text-sm text-gray-500 mb-2">
            Made with ❤️ for a sustainable future
          </Text>
          <Text className="text-center text-xs text-gray-400">
            © 2024 Fridge & Pantry Tracker. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
