import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Pressable, StyleSheet, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import { X, Flashlight, FlashlightOff, Package } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/store';
import { Button } from '@/components/ui/Button';

export default function ScannerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    storageAreaId?: string;
    returnTo?: string;
  }>();

  const { getBarcodeCatalogEntry } = useStore();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scannedData, setScannedData] = useState<{ barcode: string; name?: string } | null>(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  // Reset scanner state when screen comes back into focus
  useFocusEffect(
    React.useCallback(() => {
      setScanned(false);
      setShowModal(false);
      setScannedData(null);
    }, [])
  );

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Check if barcode exists in catalog
    const catalogEntry = getBarcodeCatalogEntry(data);

    if (catalogEntry) {
      // Product found in catalog
      setScannedData({ barcode: data, name: catalogEntry.name });
      setShowModal(true);
    } else {
      // New product
      setScannedData({ barcode: data });
      setShowModal(true);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setScannedData(null);
    setScanned(false);
  };

  const handleAddItem = () => {
    setShowModal(false);
    setScanned(false);

    if (scannedData) {
      router.push({
        pathname: '/add-item',
        params: {
          barcode: scannedData.barcode,
          ...(scannedData.name && { name: scannedData.name }),
          storageAreaId: params.storageAreaId,
        },
      });
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-lg">Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center p-8">
        <Text className="text-white text-lg text-center mb-4">
          Camera permission is required to scan barcodes
        </Text>
        <Pressable
          onPress={handleClose}
          className="px-6 py-3 bg-white rounded-xl"
        >
          <Text className="text-slate-800 font-semibold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <View className="flex-1 bg-black">
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={flashOn}
          barcodeScannerSettings={{
            barcodeTypes: [
              'ean13',
              'ean8',
              'upc_a',
              'upc_e',
              'code128',
              'code39',
              'code93',
              'codabar',
              'itf14',
              'pdf417',
              'qr',
            ],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />

        {/* Overlay */}
        <View className="flex-1" pointerEvents="box-none">
          {/* Top bar */}
          <SafeAreaView>
            <View className="flex-row justify-between items-center px-4 pt-4">
              <Pressable
                onPress={handleClose}
                className="w-12 h-12 rounded-full bg-black/50 items-center justify-center"
              >
                <X size={24} color="white" />
              </Pressable>

              <Text className="text-white text-lg font-semibold">Scan Barcode</Text>

              <Pressable
                onPress={() => setFlashOn(!flashOn)}
                className="w-12 h-12 rounded-full bg-black/50 items-center justify-center"
              >
                {flashOn ? (
                  <FlashlightOff size={24} color="white" />
                ) : (
                  <Flashlight size={24} color="white" />
                )}
              </Pressable>
            </View>
          </SafeAreaView>

          {/* Center guide frame */}
          <View className="flex-1 items-center justify-center">
            <View className="w-72 h-40 border-2 border-white rounded-2xl">
              {/* Corner accents */}
              <View className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
              <View className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
              <View className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
              <View className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
            </View>

            <Text className="text-white text-center mt-6 px-8">
              Position the barcode within the frame
            </Text>
          </View>

          {/* Bottom info */}
          <SafeAreaView>
            <View className="px-8 pb-8">
              <View className="bg-black/50 rounded-2xl p-4">
                <Text className="text-white text-center text-sm">
                  Point your camera at any product barcode.{'\n'}
                  The scanner will automatically detect it.
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>

      {/* Barcode Scanned Modal */}
      <Modal
        visible={showModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View className="flex-1 bg-black/70 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            {/* Icon */}
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center">
                <Package size={32} color="#3B82F6" />
              </View>
            </View>

            {/* Title */}
            <Text className="text-xl font-bold text-slate-800 text-center mb-2">
              {scannedData?.name ? 'Product Found' : 'New Product'}
            </Text>

            {/* Message */}
            <Text className="text-base text-slate-600 text-center mb-6">
              {scannedData?.name ? (
                <>
                  <Text className="font-semibold">{scannedData.name}</Text>
                  {'\n\n'}Add this item to your inventory?
                </>
              ) : (
                'This barcode is not in your catalog. Would you like to add it?'
              )}
            </Text>

            {/* Buttons */}
            <View className="gap-3">
              <Button onPress={handleAddItem}>
                Add Item
              </Button>
              <Button variant="secondary" onPress={handleCancel}>
                Cancel
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
