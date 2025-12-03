import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { UserPlus, Users } from 'lucide-react-native';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Household } from '@/types';

export default function HouseholdJoinScreen() {
  const router = useRouter();
  const { joinHousehold, userAccount } = useStore();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinHousehold = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    setIsLoading(true);

    // In production, this would:
    // 1. Validate invite code with backend
    // 2. Fetch household data
    // 3. Add user to household
    // 4. Start syncing data

    // For demo, simulate API call
    setTimeout(() => {
      // Simulated household data
      const mockHousehold: Household = {
        id: inviteCode.toLowerCase(),
        name: 'Demo Household',
        ownerId: 'other-user-id',
        members: [
          {
            userId: 'other-user-id',
            name: 'Demo Owner',
            email: 'owner@example.com',
            role: 'owner',
            joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      joinHousehold(mockHousehold);

      Alert.alert(
        'Success!',
        `You've joined "${mockHousehold.name}". You can now see and manage the shared inventory.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

      setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Join Household',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 px-6 pt-6">
          {/* Header */}
          <View className="mb-6">
            <View className="w-16 h-16 bg-purple-100 rounded-2xl items-center justify-center mb-4">
              <UserPlus size={32} color="#8b5cf6" strokeWidth={2} />
            </View>
            <Text className="text-slate-900 text-2xl font-bold mb-2">
              Join a Household
            </Text>
            <Text className="text-slate-600 text-base leading-6">
              Enter the invite code shared by your household owner to join and sync your inventory.
            </Text>
          </View>

          {/* Instructions */}
          <Card variant="elevated" className="p-4 mb-6">
            <Text className="text-slate-900 text-sm font-semibold mb-3">How it works:</Text>
            <View className="space-y-2">
              <InstructionRow number="1" text="Get the invite code from your household owner" />
              <InstructionRow number="2" text="Enter the code below" />
              <InstructionRow number="3" text="Access the shared inventory instantly" />
            </View>
          </Card>

          {/* Join Form */}
          <Card variant="elevated" className="p-4 mb-6">
            <Input
              label="Invite Code"
              placeholder="Enter 8-character code"
              value={inviteCode}
              onChangeText={(text) => setInviteCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={8}
              autoFocus
            />
            <Text className="text-slate-500 text-xs mt-2">
              Ask your household owner to share the invite code
            </Text>
          </Card>

          {/* Join Button */}
          <Button
            onPress={handleJoinHousehold}
            disabled={isLoading || inviteCode.length < 6}
            size="lg"
          >
            {isLoading ? 'Joining...' : 'Join Household'}
          </Button>

          {/* Demo Note */}
          <Card variant="outlined" className="mt-auto mb-6 p-4 bg-amber-50 border-amber-200">
            <Text className="text-amber-900 text-xs font-semibold mb-1">Demo Mode</Text>
            <Text className="text-amber-700 text-xs leading-5">
              In production, this would validate the invite code with a backend server and sync
              data across devices. For demo, enter any code to simulate joining.
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    </>
  );
}

function InstructionRow({ number, text }: { number: string; text: string }) {
  return (
    <View className="flex-row items-start">
      <View className="w-6 h-6 bg-purple-500 rounded-full items-center justify-center mr-3">
        <Text className="text-white text-xs font-bold">{number}</Text>
      </View>
      <Text className="text-slate-600 text-sm flex-1 leading-5 mt-0.5">{text}</Text>
    </View>
  );
}
