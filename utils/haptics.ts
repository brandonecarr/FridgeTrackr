import * as Haptics from 'expo-haptics';

/**
 * Haptic Feedback Utility
 * Provides consistent haptic feedback across the app
 */

/**
 * Light impact - for subtle interactions
 * Use for: button taps, toggles, minor actions
 */
export const light = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/**
 * Medium impact - for standard interactions
 * Use for: adding items, completing tasks, navigation
 */
export const medium = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Heavy impact - for important interactions
 * Use for: deletions, confirmations, major actions
 */
export const heavy = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

/**
 * Success notification - for positive outcomes
 * Use for: item added successfully, task completed, premium unlocked
 */
export const success = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/**
 * Warning notification - for cautionary actions
 * Use for: low stock alerts, expiring items
 */
export const warning = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

/**
 * Error notification - for failures
 * Use for: validation errors, failed operations
 */
export const error = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

/**
 * Selection changed - for picker/selector changes
 * Use for: tab switches, filter changes, dropdown selections
 */
export const selection = () => {
  Haptics.selectionAsync();
};

/**
 * Composed haptic patterns for complex interactions
 */

/**
 * Item deleted - heavy impact + warning notification
 */
export const itemDeleted = async () => {
  await heavy();
  setTimeout(() => warning(), 100);
};

/**
 * Item completed - medium impact + success notification
 */
export const itemCompleted = async () => {
  await medium();
  setTimeout(() => success(), 50);
};

/**
 * Premium unlocked - success + medium + success pattern
 */
export const premiumUnlocked = async () => {
  await success();
  setTimeout(() => medium(), 100);
  setTimeout(() => success(), 200);
};

/**
 * Long press detected - light + medium pattern
 */
export const longPress = async () => {
  await light();
  setTimeout(() => medium(), 50);
};
