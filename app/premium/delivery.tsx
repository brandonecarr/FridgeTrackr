import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  Truck,
  ShoppingCart,
  ExternalLink,
  Check,
  X,
  Copy,
  ChevronRight,
  Clock,
  DollarSign,
} from 'lucide-react-native';
import { useStore } from '@/store';
import { usePremium } from '@/hooks/usePremium';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PremiumFeatureLock } from '@/components/premium/PremiumFeatureLock';
import { DeliveryProvider } from '@/types';
import {
  DELIVERY_SERVICES,
  connectDeliveryService,
  exportToDeliveryService,
  formatShoppingListAsText,
  openDeliveryService,
  estimateDeliveryFee,
  getDeliveryTimeOptions,
} from '@/utils/deliveryExport';
import { format } from 'date-fns';

export default function DeliveryServicesScreen() {
  const router = useRouter();
  const { isPremium } = usePremium();
  const {
    deliveryServices,
    shoppingList,
    connectDeliveryService: connectService,
    disconnectDeliveryService,
  } = useStore();

  const [connectingService, setConnectingService] = useState<DeliveryProvider | null>(null);
  const [exportingTo, setExportingTo] = useState<DeliveryProvider | null>(null);

  if (!isPremium) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Delivery Services',
            headerBackTitle: 'Premium',
          }}
        />
        <SafeAreaView className="flex-1 bg-gray-50">
          <PremiumFeatureLock
            featureName="Delivery Services Integration"
            description="Connect to Instacart, Walmart Grocery, and Amazon Fresh to automatically add your shopping list items for delivery or pickup."
          />
        </SafeAreaView>
      </>
    );
  }

  const activeItems = shoppingList.filter(item => !item.isCompleted);

  const handleConnect = async (provider: DeliveryProvider) => {
    setConnectingService(provider);

    try {
      const result = await connectDeliveryService(provider);

      if (result.success && result.accessToken) {
        connectService({
          provider,
          isConnected: true,
          accountName: 'My Account',
        });

        Alert.alert(
          'Connected!',
          `Successfully connected to ${DELIVERY_SERVICES[provider].name}. You can now export your shopping list.`
        );
      } else {
        Alert.alert('Connection Failed', result.error || 'Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect. Please try again.');
    } finally {
      setConnectingService(null);
    }
  };

  const handleDisconnect = (provider: DeliveryProvider) => {
    Alert.alert(
      'Disconnect Service',
      `Are you sure you want to disconnect from ${DELIVERY_SERVICES[provider].name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => disconnectDeliveryService(provider),
        },
      ]
    );
  };

  const handleExport = async (provider: DeliveryProvider) => {
    if (activeItems.length === 0) {
      Alert.alert('Empty List', 'Add items to your shopping list first.');
      return;
    }

    const service = deliveryServices.find(s => s.provider === provider);
    if (!service?.isConnected) {
      Alert.alert(
        'Not Connected',
        `Please connect to ${DELIVERY_SERVICES[provider].name} first.`
      );
      return;
    }

    setExportingTo(provider);

    try {
      const result = await exportToDeliveryService(provider, activeItems);

      if (result.success) {
        Alert.alert(
          'Exported!',
          `${activeItems.length} items added to ${DELIVERY_SERVICES[provider].name}. Opening service...`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (result.url) {
                  openDeliveryService(provider);
                }
              },
            },
          ]
        );
      } else {
        // Copy to clipboard as fallback
        const text = formatShoppingListAsText(activeItems);
        Clipboard.setString(text);
        Alert.alert(
          'Copied to Clipboard',
          `${DELIVERY_SERVICES[provider].name} doesn't support direct export. Your shopping list has been copied.`
        );
      }
    } catch (error) {
      Alert.alert('Export Failed', 'Please try again.');
    } finally {
      setExportingTo(null);
    }
  };

  const handleCopyToClipboard = () => {
    if (activeItems.length === 0) {
      Alert.alert('Empty List', 'Add items to your shopping list first.');
      return;
    }

    const text = formatShoppingListAsText(activeItems);
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Shopping list copied to clipboard.');
  };

  const estimatedTotal = activeItems.reduce((sum, item) => {
    // Very rough estimate: $3 per item average
    return sum + item.quantity * 3;
  }, 0);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Delivery Services',
          headerBackTitle: 'Premium',
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-4 pb-4">
            <View className="w-16 h-16 bg-pink-100 rounded-2xl items-center justify-center mb-4">
              <Truck size={32} color="#ec4899" strokeWidth={2} />
            </View>
            <Text className="text-slate-900 text-2xl font-bold mb-2">
              Delivery Services
            </Text>
            <Text className="text-slate-600 text-base leading-6">
              Connect your favorite delivery services and export your shopping list with one tap.
            </Text>
          </View>

          {/* Shopping List Summary */}
          {activeItems.length > 0 && (
            <View className="px-6 pb-4">
              <Card variant="elevated" className="p-4 bg-blue-50">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <ShoppingCart size={20} color="#3b82f6" strokeWidth={2.5} />
                    <Text className="text-blue-900 font-semibold ml-2">
                      {activeItems.length} item{activeItems.length !== 1 ? 's' : ''} ready to export
                    </Text>
                  </View>
                  <Pressable onPress={handleCopyToClipboard}>
                    <Copy size={20} color="#3b82f6" strokeWidth={2.5} />
                  </Pressable>
                </View>
                <View className="flex-row items-center">
                  <DollarSign size={16} color="#60a5fa" />
                  <Text className="text-blue-700 text-sm">
                    Est. ${estimatedTotal.toFixed(2)}
                  </Text>
                </View>
              </Card>
            </View>
          )}

          {/* Available Services */}
          <View className="px-6 pb-4">
            <Text className="text-slate-900 text-lg font-bold mb-3">Available Services</Text>

            {/* Instacart */}
            <ServiceCard
              provider="instacart"
              isConnected={deliveryServices.find(s => s.provider === 'instacart')?.isConnected}
              isConnecting={connectingService === 'instacart'}
              isExporting={exportingTo === 'instacart'}
              onConnect={() => handleConnect('instacart')}
              onDisconnect={() => handleDisconnect('instacart')}
              onExport={() => handleExport('instacart')}
              estimatedFee={estimateDeliveryFee('instacart', estimatedTotal)}
              deliveryTimes={getDeliveryTimeOptions('instacart')}
            />

            {/* Walmart */}
            <ServiceCard
              provider="walmart"
              isConnected={deliveryServices.find(s => s.provider === 'walmart')?.isConnected}
              isConnecting={connectingService === 'walmart'}
              isExporting={exportingTo === 'walmart'}
              onConnect={() => handleConnect('walmart')}
              onDisconnect={() => handleDisconnect('walmart')}
              onExport={() => handleExport('walmart')}
              estimatedFee={estimateDeliveryFee('walmart', estimatedTotal)}
              deliveryTimes={getDeliveryTimeOptions('walmart')}
            />

            {/* Amazon Fresh */}
            <ServiceCard
              provider="amazon_fresh"
              isConnected={deliveryServices.find(s => s.provider === 'amazon_fresh')?.isConnected}
              isConnecting={connectingService === 'amazon_fresh'}
              isExporting={exportingTo === 'amazon_fresh'}
              onConnect={() => handleConnect('amazon_fresh')}
              onDisconnect={() => handleDisconnect('amazon_fresh')}
              onExport={() => handleExport('amazon_fresh')}
              estimatedFee={estimateDeliveryFee('amazon_fresh', estimatedTotal)}
              deliveryTimes={getDeliveryTimeOptions('amazon_fresh')}
            />
          </View>

          {/* How It Works */}
          <View className="px-6 pb-8">
            <Card variant="elevated" className="p-4">
              <Text className="text-slate-900 text-base font-semibold mb-3">
                How it works
              </Text>
              <View className="space-y-3">
                <StepRow
                  number="1"
                  text="Connect your delivery service account"
                />
                <StepRow
                  number="2"
                  text="Add items to your shopping list"
                />
                <StepRow
                  number="3"
                  text="Tap 'Export' to send items to the service"
                />
                <StepRow
                  number="4"
                  text="Complete checkout in the delivery app"
                />
              </View>
            </Card>
          </View>

          {/* Demo Note */}
          <View className="px-6 pb-8">
            <Card variant="outlined" className="p-4 bg-amber-50 border-amber-200">
              <Text className="text-amber-900 text-xs font-semibold mb-1">Demo Mode</Text>
              <Text className="text-amber-700 text-xs leading-5">
                This is a simulated integration. In production, this would use OAuth
                authentication and official APIs from Instacart, Walmart, and Amazon to
                automatically add items to your cart.
              </Text>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

interface ServiceCardProps {
  provider: DeliveryProvider;
  isConnected?: boolean;
  isConnecting: boolean;
  isExporting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onExport: () => void;
  estimatedFee: number;
  deliveryTimes: string[];
}

function ServiceCard({
  provider,
  isConnected,
  isConnecting,
  isExporting,
  onConnect,
  onDisconnect,
  onExport,
  estimatedFee,
  deliveryTimes,
}: ServiceCardProps) {
  const service = DELIVERY_SERVICES[provider];

  return (
    <Card variant="elevated" className="mb-3 overflow-hidden">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-2xl mr-2">{service.icon}</Text>
              <Text className="text-slate-900 text-lg font-bold">{service.name}</Text>
            </View>
            <Text className="text-slate-600 text-sm">{service.description}</Text>
          </View>

          {isConnected && (
            <View className="bg-green-100 px-2 py-1 rounded-full flex-row items-center">
              <Check size={12} color="#22c55e" strokeWidth={3} />
              <Text className="text-green-700 text-xs font-semibold ml-1">Connected</Text>
            </View>
          )}
        </View>

        {/* Delivery Info */}
        {isConnected && (
          <View className="mb-3 p-3 bg-slate-50 rounded-lg">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Clock size={14} color="#64748b" />
                <Text className="text-slate-600 text-xs ml-1">Fastest:</Text>
              </View>
              <Text className="text-slate-900 text-xs font-semibold">
                {deliveryTimes[0]}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <DollarSign size={14} color="#64748b" />
                <Text className="text-slate-600 text-xs ml-1">Delivery Fee:</Text>
              </View>
              <Text className="text-slate-900 text-xs font-semibold">
                {estimatedFee === 0 ? 'FREE' : `$${estimatedFee.toFixed(2)}`}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View className="flex-row gap-2">
          {!isConnected ? (
            <Pressable
              onPress={onConnect}
              disabled={isConnecting}
              className="flex-1 bg-blue-500 rounded-lg p-3 flex-row items-center justify-center active:bg-blue-600 disabled:opacity-50"
            >
              {isConnecting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <ExternalLink size={16} color="white" strokeWidth={2.5} />
                  <Text className="text-white font-semibold ml-2">Connect</Text>
                </>
              )}
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={onExport}
                disabled={isExporting}
                className="flex-1 bg-blue-500 rounded-lg p-3 flex-row items-center justify-center active:bg-blue-600 disabled:opacity-50"
              >
                {isExporting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <ShoppingCart size={16} color="white" strokeWidth={2.5} />
                    <Text className="text-white font-semibold ml-2">Export List</Text>
                  </>
                )}
              </Pressable>
              <Pressable
                onPress={onDisconnect}
                className="bg-slate-100 rounded-lg p-3 items-center justify-center active:bg-slate-200"
              >
                <X size={20} color="#475569" strokeWidth={2.5} />
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Card>
  );
}

function StepRow({ number, text }: { number: string; text: string }) {
  return (
    <View className="flex-row items-start">
      <View className="w-6 h-6 bg-pink-500 rounded-full items-center justify-center mr-3">
        <Text className="text-white text-xs font-bold">{number}</Text>
      </View>
      <Text className="text-slate-600 text-sm flex-1 leading-5 mt-0.5">{text}</Text>
    </View>
  );
}
