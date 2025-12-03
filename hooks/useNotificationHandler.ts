import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { NotificationType } from '@/utils/notifications';

export function useNotificationHandler() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Listen for notifications while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Listen for user tapping on notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      switch (data.type) {
        case NotificationType.EXPIRING_SOON:
        case NotificationType.EXPIRED:
          // Navigate to inventory tab
          router.replace('/');
          break;

        case NotificationType.LOW_STOCK:
          // Navigate to inventory tab and could open item details
          router.replace('/');
          if (data.itemId) {
            setTimeout(() => {
              router.push(`/item/${data.itemId}` as any);
            }, 300);
          }
          break;

        case NotificationType.SHOPPING_REMINDER:
        case NotificationType.DAILY_SUMMARY:
          // Navigate to shopping tab (index 1)
          router.replace('/');
          break;

        default:
          // Default to inventory tab
          router.replace('/');
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);
}
