import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Item, ShoppingListItem } from '@/types';
import { differenceInDays, format, isAfter, isBefore } from 'date-fns';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Notification types
export enum NotificationType {
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
  LOW_STOCK = 'LOW_STOCK',
  SHOPPING_REMINDER = 'SHOPPING_REMINDER',
  DAILY_SUMMARY = 'DAILY_SUMMARY',
}

// Request permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });

      await Notifications.setNotificationChannelAsync('expiration', {
        name: 'Expiration Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#EF4444',
      });

      await Notifications.setNotificationChannelAsync('shopping', {
        name: 'Shopping Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#10B981',
      });

      await Notifications.setNotificationChannelAsync('low-stock', {
        name: 'Low Stock Alerts',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#F59E0B',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Cancel specific notification type
export async function cancelNotificationsByType(type: NotificationType): Promise<void> {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const notificationsToCancel = scheduledNotifications.filter(
    (notification) => notification.content.data?.type === type
  );

  for (const notification of notificationsToCancel) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
}

// Schedule expiration notification for a specific item
export async function scheduleExpirationNotification(
  item: Item,
  daysBeforeExpiration: number
): Promise<void> {
  if (!item.expirationDate) {
    console.log(`[Notifications] No expiration date for ${item.name}, skipping`);
    return;
  }

  // Parse the expiration date (YYYY-MM-DD format)
  const dateParts = item.expirationDate.split('-');
  if (dateParts.length !== 3) {
    console.log(`[Notifications] Invalid date format for ${item.name}: ${item.expirationDate}`);
    return;
  }

  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
  const day = parseInt(dateParts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    console.log(`[Notifications] Could not parse date for ${item.name}: ${item.expirationDate}`);
    return;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expirationDay = new Date(year, month, day);

  // Calculate days until expiration
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilExpiration = Math.round((expirationDay.getTime() - today.getTime()) / msPerDay);

  console.log(`[Notifications] ${item.name}: expires ${item.expirationDate}, days until: ${daysUntilExpiration}`);

  // Cancel any existing notifications for this item first
  await cancelItemNotifications(item.id);

  // Don't schedule if already expired or expires today
  if (daysUntilExpiration <= 0) {
    console.log(`[Notifications] ${item.name} already expired or expires today, not scheduling`);
    return;
  }

  // Only schedule "expiring soon" if within warning period but not expiring tomorrow
  if (daysUntilExpiration >= 2 && daysUntilExpiration <= daysBeforeExpiration) {
    // Calculate seconds until 9 AM tomorrow
    const tomorrow9am = new Date(now);
    tomorrow9am.setDate(tomorrow9am.getDate() + 1);
    tomorrow9am.setHours(9, 0, 0, 0);

    const secondsUntil = Math.floor((tomorrow9am.getTime() - now.getTime()) / 1000);

    if (secondsUntil > 60) {
      console.log(`[Notifications] Scheduling "expiring soon" for ${item.name} in ${secondsUntil}s`);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Item Expiring Soon',
          body: `${item.name} expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}`,
          data: {
            type: NotificationType.EXPIRING_SOON,
            itemId: item.id,
            itemName: item.name,
          },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntil,
        },
      });
    }
  }

  // Schedule "expired" notification for expiration day at 9 AM
  // Only if more than 1 day away
  if (daysUntilExpiration >= 2) {
    const expirationDay9am = new Date(year, month, day, 9, 0, 0);
    const secondsUntilExpired = Math.floor((expirationDay9am.getTime() - now.getTime()) / 1000);

    if (secondsUntilExpired > 60) {
      console.log(`[Notifications] Scheduling "expired" for ${item.name} in ${secondsUntilExpired}s`);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Item Expired',
          body: `${item.name} has expired today. Time to check your storage!`,
          data: {
            type: NotificationType.EXPIRED,
            itemId: item.id,
            itemName: item.name,
          },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilExpired,
        },
      });
    }
  }
}

// Cancel notifications for a specific item
export async function cancelItemNotifications(itemId: string): Promise<void> {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const notificationsToCancel = scheduledNotifications.filter(
    (notification) => notification.content.data?.itemId === itemId
  );

  for (const notification of notificationsToCancel) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
}

// Schedule daily summary notification
export async function scheduleDailySummary(
  time: string, // Format: "HH:mm"
  items: Item[]
): Promise<void> {
  // Cancel existing daily summaries
  await cancelNotificationsByType(NotificationType.DAILY_SUMMARY);

  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);

  // Count expiring and expired items
  const expiringItems = items.filter((item) => {
    if (!item.expirationDate) return false;
    const daysUntil = differenceInDays(new Date(item.expirationDate), now);
    return daysUntil >= 0 && daysUntil <= 3;
  });

  const expiredItems = items.filter((item) => {
    if (!item.expirationDate) return false;
    const daysUntil = differenceInDays(new Date(item.expirationDate), now);
    return daysUntil < 0;
  });

  // Only schedule if there are items to report
  if (expiringItems.length === 0 && expiredItems.length === 0) {
    return;
  }

  // Create notification message
  let body = '';
  if (expiredItems.length > 0) {
    body += `${expiredItems.length} expired item${expiredItems.length !== 1 ? 's' : ''}`;
  }
  if (expiringItems.length > 0) {
    if (body) body += ', ';
    body += `${expiringItems.length} expiring soon`;
  }

  // Schedule for next occurrence of the specified time
  const triggerDate = new Date();
  triggerDate.setHours(hours, minutes, 0, 0);

  if (isBefore(triggerDate, now)) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }

  // Calculate seconds until the trigger time
  const secondsUntil = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);

  if (secondsUntil > 60) {
    console.log(`[Notifications] Scheduling daily summary in ${secondsUntil}s`);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Daily Food Summary',
        body,
        data: {
          type: NotificationType.DAILY_SUMMARY,
          expiringCount: expiringItems.length,
          expiredCount: expiredItems.length,
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
  }
}

// Schedule low stock notification
export async function scheduleLowStockNotification(item: Item): Promise<void> {
  if (item.quantity > 0) return;

  console.log(`[Notifications] Scheduling low stock alert for ${item.name}`);

  // Use a 5 second delay to avoid immediate notification issues
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📉 Low Stock Alert',
      body: `${item.name} is out of stock. Add to shopping list?`,
      data: {
        type: NotificationType.LOW_STOCK,
        itemId: item.id,
        itemName: item.name,
      },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
    },
  });
}

// Schedule shopping list reminder
export async function scheduleShoppingListReminder(
  shoppingList: ShoppingListItem[],
  reminderTime: string // Format: "HH:mm"
): Promise<void> {
  // Cancel existing shopping reminders
  await cancelNotificationsByType(NotificationType.SHOPPING_REMINDER);

  const incompleteItems = shoppingList.filter((item) => !item.isCompleted);

  if (incompleteItems.length === 0) {
    return; // No need to remind if list is empty
  }

  const now = new Date();
  const [hours, minutes] = reminderTime.split(':').map(Number);

  const triggerDate = new Date();
  triggerDate.setHours(hours, minutes, 0, 0);

  if (isBefore(triggerDate, now)) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }

  const secondsUntil = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);

  if (secondsUntil > 60) {
    console.log(`[Notifications] Scheduling shopping reminder in ${secondsUntil}s`);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🛒 Shopping List Reminder',
        body: `You have ${incompleteItems.length} item${incompleteItems.length !== 1 ? 's' : ''} on your shopping list`,
        data: {
          type: NotificationType.SHOPPING_REMINDER,
          itemCount: incompleteItems.length,
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
  }
}

// Reschedule all notifications
export async function rescheduleAllNotifications(
  items: Item[],
  shoppingList: ShoppingListItem[],
  settings: {
    expirationEnabled: boolean;
    daysBeforeExpiration: number;
    dailySummaryEnabled: boolean;
    dailySummaryTime: string;
    shoppingReminderEnabled: boolean;
    shoppingReminderTime: string;
    lowStockEnabled: boolean;
  }
): Promise<void> {
  try {
    // Cancel all existing notifications
    await cancelAllNotifications();

    // Schedule expiration notifications
    if (settings.expirationEnabled && items && items.length > 0) {
      for (const item of items) {
        if (item.expirationDate) {
          try {
            await scheduleExpirationNotification(item, settings.daysBeforeExpiration);
          } catch (error) {
            console.error(`Failed to schedule notification for item ${item.id}:`, error);
          }
        }
      }

      // Schedule daily summary
      if (settings.dailySummaryEnabled) {
        try {
          await scheduleDailySummary(settings.dailySummaryTime, items);
        } catch (error) {
          console.error('Failed to schedule daily summary:', error);
        }
      }
    }

    // Schedule shopping list reminder
    if (settings.shoppingReminderEnabled && shoppingList && shoppingList.length > 0) {
      try {
        await scheduleShoppingListReminder(shoppingList, settings.shoppingReminderTime);
      } catch (error) {
        console.error('Failed to schedule shopping reminder:', error);
      }
    }
  } catch (error) {
    console.error('Failed to reschedule notifications:', error);
  }
}

// Get notification badge count
export async function getNotificationBadgeCount(): Promise<number> {
  const count = await Notifications.getBadgeCountAsync();
  return count;
}

// Set notification badge count
export async function setNotificationBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// Clear badge
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
