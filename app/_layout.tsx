import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { requestNotificationPermissions, rescheduleAllNotifications } from "@/utils/notifications";
import { useStore } from "@/store";
import { useNotificationHandler } from "@/hooks/useNotificationHandler";

// Ignore specific warnings that don't affect functionality
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'No native splash screen registered for given view controller',
]);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Suppress splash screen errors in development
});

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { settings, items, shoppingList } = useStore();

  // Handle notification taps
  useNotificationHandler();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Initialize notifications on app start - only request permissions, don't schedule
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        if (settings?.notifications?.enabled) {
          await requestNotificationPermissions();
          // Don't automatically reschedule - notifications are scheduled when items are added/updated
        }
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    // Delay initialization slightly to ensure store is loaded
    const timer = setTimeout(() => {
      initializeNotifications();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack
          screenOptions={({ route }) => ({
            headerShown: !route.name.startsWith("tempobook"),
            animation: 'default',
          })}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add-item" options={{ presentation: 'modal', headerShown: true }} />
          <Stack.Screen name="add-shopping-item" options={{ presentation: 'modal', headerShown: true }} />
          <Stack.Screen name="add-to-inventory" options={{ presentation: 'modal', headerShown: true }} />
          <Stack.Screen name="change-store" options={{ presentation: 'modal', headerShown: true }} />
          <Stack.Screen name="edit-store" options={{ presentation: 'modal', headerShown: true }} />
          <Stack.Screen name="scanner" options={{ presentation: 'fullScreenModal', headerShown: false }} />
          <Stack.Screen name="storage/[id]" options={{ headerBackTitle: 'Back', headerShown: true }} />
          <Stack.Screen name="item/[id]" options={{ headerBackTitle: 'Back', headerShown: true }} />
        </Stack>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
