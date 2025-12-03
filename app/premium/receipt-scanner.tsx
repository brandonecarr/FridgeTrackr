import React, { useState } from 'react';
import { View, Text, SafeAreaView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Camera, Image as ImageIcon, Scan, ArrowRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '@/store';
import { usePremium } from '@/hooks/usePremium';
import { Card } from '@/components/ui/Card';
import { PremiumFeatureLock } from '@/components/premium/PremiumFeatureLock';
import { processReceiptImage } from '@/utils/receiptOCR';

export default function ReceiptScannerScreen() {
  const router = useRouter();
  const { isPremium } = usePremium();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isPremium) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Scan Receipt',
            headerBackTitle: 'Premium',
          }}
        />
        <SafeAreaView className="flex-1 bg-gray-50">
          <PremiumFeatureLock
            featureName="Receipt Scanning"
            description="Take a photo of your grocery receipt and automatically add all items to your inventory with prices and expiration dates."
          />
        </SafeAreaView>
      </>
    );
  }

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access to scan receipts.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    setIsProcessing(true);

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await processReceipt(imageUri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChoosePhoto = async () => {
    setIsProcessing(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await processReceipt(imageUri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processReceipt = async (imageUri: string) => {
    try {
      // Process image with OCR
      const ocrResult = await processReceiptImage(imageUri);

      // Navigate to review screen with OCR results
      router.push({
        pathname: '/premium/receipt-review',
        params: {
          imageUri,
          receiptData: JSON.stringify(ocrResult),
        },
      });
    } catch (error) {
      console.error('OCR processing error:', error);
      Alert.alert(
        'Processing Failed',
        'Could not extract items from receipt. Please try again with a clearer photo.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Scan Receipt',
          headerBackTitle: 'Premium',
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 px-6 pt-6">
          {/* Header */}
          <View className="mb-6">
            <View className="w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center mb-4">
              <Scan size={32} color="#3b82f6" strokeWidth={2} />
            </View>
            <Text className="text-slate-900 text-2xl font-bold mb-2">Scan Your Receipt</Text>
            <Text className="text-slate-600 text-base leading-6">
              Take a photo of your grocery receipt and we'll automatically extract all items with
              prices and suggested expiration dates.
            </Text>
          </View>

          {/* Instructions */}
          <Card variant="elevated" className="p-4 mb-6">
            <Text className="text-slate-900 text-sm font-semibold mb-3">For best results:</Text>
            <View className="space-y-2">
              <TipRow text="Ensure receipt is well-lit and in focus" />
              <TipRow text="Capture the entire receipt in the frame" />
              <TipRow text="Avoid shadows or glare on the receipt" />
              <TipRow text="Place receipt on a flat surface" />
            </View>
          </Card>

          {/* Action Buttons */}
          <View className="gap-4">
            <Pressable
              onPress={handleTakePhoto}
              disabled={isProcessing}
              className="bg-blue-500 rounded-xl p-5 flex-row items-center justify-between active:bg-blue-600 disabled:opacity-50"
            >
              <View className="flex-row items-center">
                <Camera size={24} color="white" strokeWidth={2.5} />
                <Text className="text-white text-lg font-semibold ml-3">Take Photo</Text>
              </View>
              {isProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <ArrowRight size={24} color="white" />
              )}
            </Pressable>

            <Pressable
              onPress={handleChoosePhoto}
              disabled={isProcessing}
              className="bg-slate-100 rounded-xl p-5 flex-row items-center justify-between active:bg-slate-200 disabled:opacity-50"
            >
              <View className="flex-row items-center">
                <ImageIcon size={24} color="#475569" strokeWidth={2.5} />
                <Text className="text-slate-700 text-lg font-semibold ml-3">Choose from Gallery</Text>
              </View>
              {isProcessing ? (
                <ActivityIndicator color="#475569" />
              ) : (
                <ArrowRight size={24} color="#475569" />
              )}
            </Pressable>
          </View>

          {/* Processing Indicator */}
          {isProcessing && (
            <View className="mt-6 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-slate-600 text-sm mt-3">Processing receipt...</Text>
              <Text className="text-slate-500 text-xs mt-1">This may take a few seconds</Text>
            </View>
          )}

          {/* Demo Note */}
          <Card variant="outlined" className="mt-auto mb-6 p-4 bg-amber-50 border-amber-200">
            <Text className="text-amber-900 text-xs font-semibold mb-1">Demo Mode</Text>
            <Text className="text-amber-700 text-xs leading-5">
              This is a simulated OCR demonstration. In production, this would use Google Cloud
              Vision, AWS Textract, or similar OCR service to extract real receipt data.
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    </>
  );
}

function TipRow({ text }: { text: string }) {
  return (
    <View className="flex-row items-start">
      <View className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3" />
      <Text className="text-slate-600 text-sm flex-1 leading-5">{text}</Text>
    </View>
  );
}
