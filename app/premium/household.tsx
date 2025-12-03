import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  Users,
  UserPlus,
  Crown,
  Mail,
  Calendar,
  LogOut,
  Trash2,
  Copy,
  Share2,
  Settings,
  ChevronRight,
} from 'lucide-react-native';
import { useStore } from '@/store';
import { usePremium } from '@/hooks/usePremium';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PremiumFeatureLock } from '@/components/premium/PremiumFeatureLock';
import { format } from 'date-fns';

export default function HouseholdScreen() {
  const router = useRouter();
  const { isPremium } = usePremium();
  const {
    household,
    userAccount,
    createHousehold,
    updateHousehold,
    addHouseholdMember,
    removeHouseholdMember,
    leaveHousehold,
  } = useStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  if (!isPremium) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Household',
            headerBackTitle: 'Premium',
          }}
        />
        <SafeAreaView className="flex-1 bg-gray-50">
          <PremiumFeatureLock
            featureName="Household Sharing"
            description="Share your inventory with family members and sync across all devices. Everyone stays updated in real-time."
          />
        </SafeAreaView>
      </>
    );
  }

  const isOwner = household?.ownerId === userAccount.id;
  const currentMember = household?.members.find((m) => m.userId === userAccount.id);

  const handleCreateHousehold = () => {
    if (!householdName.trim()) {
      Alert.alert('Error', 'Please enter a household name');
      return;
    }

    createHousehold(householdName.trim());
    setHouseholdName('');
    setShowCreateForm(false);
  };

  const handleInviteMember = () => {
    if (!inviteName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    // In production, this would send an email invite or generate a unique join link
    // For demo, we'll simulate adding a member
    addHouseholdMember({
      userId: `user-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim() || undefined,
      role: 'member',
    });

    Alert.alert(
      'Invite Sent',
      `An invite has been sent to ${inviteName}. They will appear here once they accept.`
    );

    setInviteName('');
    setInviteEmail('');
    setShowInviteForm(false);
  };

  const handleShareInviteLink = async () => {
    if (!household) return;

    // In production, this would be a real invite link
    const inviteLink = `fridge-app://join/${household.id}`;
    const inviteCode = household.id.substring(0, 8).toUpperCase();

    try {
      await Share.share({
        message: `Join my household "${household.name}" on Fridge & Pantry Tracker!\n\nInvite Code: ${inviteCode}\n\nLink: ${inviteLink}`,
        title: 'Join My Household',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleRemoveMember = (userId: string, memberName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from your household?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeHouseholdMember(userId);
          },
        },
      ]
    );
  };

  const handleLeaveHousehold = () => {
    if (isOwner) {
      Alert.alert(
        'Cannot Leave',
        'As the household owner, you cannot leave. You can delete the household or transfer ownership to another member.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Leave Household',
      `Are you sure you want to leave "${household?.name}"? You will lose access to the shared inventory.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveHousehold();
          },
        },
      ]
    );
  };

  // No household yet
  if (!household) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Household',
            headerBackTitle: 'Premium',
          }}
        />
        <SafeAreaView className="flex-1 bg-gray-50">
          <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="mb-6">
              <View className="w-16 h-16 bg-purple-100 rounded-2xl items-center justify-center mb-4">
                <Users size={32} color="#8b5cf6" strokeWidth={2} />
              </View>
              <Text className="text-slate-900 text-2xl font-bold mb-2">
                Create Your Household
              </Text>
              <Text className="text-slate-600 text-base leading-6">
                Share your inventory with family members and keep everyone in sync across all devices.
              </Text>
            </View>

            {/* Benefits */}
            <Card variant="elevated" className="p-4 mb-6">
              <Text className="text-slate-900 text-sm font-semibold mb-3">
                What you'll get:
              </Text>
              <View className="space-y-3">
                <BenefitRow text="Share inventory with family members" />
                <BenefitRow text="Real-time sync across all devices" />
                <BenefitRow text="See who added or used items" />
                <BenefitRow text="Collaborative shopping lists" />
              </View>
            </Card>

            {/* Create Form */}
            {!showCreateForm ? (
              <Button onPress={() => setShowCreateForm(true)} size="lg">
                Create Household
              </Button>
            ) : (
              <Card variant="elevated" className="p-4">
                <Text className="text-slate-900 text-base font-semibold mb-4">
                  Create Your Household
                </Text>
                <Input
                  label="Household Name"
                  placeholder="e.g., Smith Family, Our Home"
                  value={householdName}
                  onChangeText={setHouseholdName}
                  autoFocus
                />
                <View className="flex-row gap-3 mt-4">
                  <Button
                    variant="outline"
                    onPress={() => {
                      setShowCreateForm(false);
                      setHouseholdName('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onPress={handleCreateHousehold} className="flex-1">
                    Create
                  </Button>
                </View>
              </Card>
            )}

            {/* Join Option */}
            <View className="mt-6">
              <View className="flex-row items-center mb-3">
                <View className="flex-1 h-px bg-slate-200" />
                <Text className="text-slate-500 text-sm mx-3">OR</Text>
                <View className="flex-1 h-px bg-slate-200" />
              </View>
              <Pressable
                onPress={() => router.push('/premium/household-join')}
                className="bg-slate-100 rounded-xl p-4 flex-row items-center justify-between active:bg-slate-200"
              >
                <View className="flex-row items-center">
                  <UserPlus size={20} color="#475569" strokeWidth={2.5} />
                  <Text className="text-slate-700 text-base font-semibold ml-3">
                    Join Existing Household
                  </Text>
                </View>
                <ChevronRight size={20} color="#475569" />
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  // Has household
  return (
    <>
      <Stack.Screen
        options={{
          title: household.name,
          headerBackTitle: 'Premium',
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Household Info */}
          <View className="px-6 pt-4 pb-4">
            <Card variant="elevated" className="p-4">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-slate-900 text-xl font-bold mb-1">
                    {household.name}
                  </Text>
                  <Text className="text-slate-500 text-sm">
                    {household.members.length} member{household.members.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                {isOwner && (
                  <Pressable
                    onPress={() => {
                      Alert.prompt(
                        'Rename Household',
                        'Enter new household name',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Save',
                            onPress: (name?: string) => {
                              if (name?.trim()) {
                                updateHousehold({ name: name.trim() });
                              }
                            },
                          },
                        ],
                        'plain-text',
                        household.name
                      );
                    }}
                    className="w-8 h-8 bg-slate-100 rounded-lg items-center justify-center"
                  >
                    <Settings size={16} color="#475569" />
                  </Pressable>
                )}
              </View>

              <View className="flex-row items-center">
                <Calendar size={14} color="#64748b" />
                <Text className="text-slate-500 text-xs ml-1">
                  Created {format(new Date(household.createdAt), 'MMM d, yyyy')}
                </Text>
              </View>
            </Card>
          </View>

          {/* Sync Status */}
          <View className="px-6 pb-4">
            <Card variant="elevated" className="p-4 bg-green-50 border border-green-200">
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-green-800 text-sm font-medium">
                  Synced across all devices
                </Text>
              </View>
              <Text className="text-green-600 text-xs mt-1">
                All members see real-time updates
              </Text>
            </Card>
          </View>

          {/* Members */}
          <View className="px-6 pb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-slate-900 text-lg font-bold">Members</Text>
              {isOwner && (
                <Pressable
                  onPress={() => setShowInviteForm(!showInviteForm)}
                  className="flex-row items-center"
                >
                  <UserPlus size={18} color="#3b82f6" strokeWidth={2.5} />
                  <Text className="text-blue-500 font-semibold ml-1">Invite</Text>
                </Pressable>
              )}
            </View>

            {/* Invite Form */}
            {showInviteForm && (
              <Card variant="elevated" className="p-4 mb-3">
                <Text className="text-slate-900 text-base font-semibold mb-3">
                  Invite Member
                </Text>
                <Input
                  label="Name"
                  placeholder="Family member's name"
                  value={inviteName}
                  onChangeText={setInviteName}
                  className="mb-3"
                />
                <Input
                  label="Email (Optional)"
                  placeholder="email@example.com"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="mb-4"
                />
                <View className="flex-row gap-2 mb-3">
                  <Button
                    variant="outline"
                    onPress={() => {
                      setShowInviteForm(false);
                      setInviteName('');
                      setInviteEmail('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onPress={handleInviteMember} className="flex-1">
                    Send Invite
                  </Button>
                </View>
                <Pressable
                  onPress={handleShareInviteLink}
                  className="flex-row items-center justify-center p-2"
                >
                  <Share2 size={16} color="#3b82f6" />
                  <Text className="text-blue-500 text-sm font-medium ml-1">
                    Share Invite Link
                  </Text>
                </Pressable>
              </Card>
            )}

            {/* Member List */}
            {household.members.map((member) => (
              <Card key={member.userId} variant="elevated" className="mb-3 p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-slate-900 text-base font-semibold">
                        {member.name}
                      </Text>
                      {member.role === 'owner' && (
                        <View className="ml-2 flex-row items-center bg-yellow-100 px-2 py-0.5 rounded-full">
                          <Crown size={12} color="#f59e0b" strokeWidth={2.5} />
                          <Text className="text-yellow-700 text-xs font-semibold ml-1">
                            Owner
                          </Text>
                        </View>
                      )}
                      {member.userId === userAccount.id && (
                        <Text className="text-blue-500 text-sm ml-2">(You)</Text>
                      )}
                    </View>
                    {member.email && (
                      <View className="flex-row items-center">
                        <Mail size={12} color="#64748b" />
                        <Text className="text-slate-500 text-xs ml-1">{member.email}</Text>
                      </View>
                    )}
                    <View className="flex-row items-center mt-1">
                      <Calendar size={12} color="#64748b" />
                      <Text className="text-slate-500 text-xs ml-1">
                        Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                      </Text>
                    </View>
                  </View>

                  {/* Remove Button (only for owner, can't remove self) */}
                  {isOwner &&
                    member.userId !== userAccount.id &&
                    member.role !== 'owner' && (
                      <Pressable
                        onPress={() => handleRemoveMember(member.userId, member.name)}
                        className="w-8 h-8 bg-red-50 rounded-lg items-center justify-center ml-2"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </Pressable>
                    )}
                </View>
              </Card>
            ))}
          </View>

          {/* Leave Household */}
          {!isOwner && (
            <View className="px-6 pb-8">
              <Pressable
                onPress={handleLeaveHousehold}
                className="bg-red-50 rounded-xl p-4 flex-row items-center justify-center border border-red-200 active:bg-red-100"
              >
                <LogOut size={20} color="#ef4444" strokeWidth={2.5} />
                <Text className="text-red-600 text-base font-semibold ml-2">
                  Leave Household
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function BenefitRow({ text }: { text: string }) {
  return (
    <View className="flex-row items-start">
      <View className="w-5 h-5 bg-purple-100 rounded-full items-center justify-center mr-3 mt-0.5">
        <Users size={12} color="#8b5cf6" strokeWidth={2.5} />
      </View>
      <Text className="text-slate-600 text-sm flex-1 leading-5">{text}</Text>
    </View>
  );
}
