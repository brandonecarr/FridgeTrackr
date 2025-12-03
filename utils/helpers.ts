import { differenceInDays, parseISO, format, isValid } from 'date-fns';
import { ExpirationStatus, Item, ItemWithStatus } from '@/types';

// Get expiration status based on days until expiration
export function getExpirationStatus(
  expirationDate: string | undefined,
  warningDays: number = 3
): { status: ExpirationStatus; daysUntilExpiration: number | null } {
  if (!expirationDate) {
    return { status: 'safe', daysUntilExpiration: null };
  }

  const expDate = parseISO(expirationDate);
  if (!isValid(expDate)) {
    return { status: 'safe', daysUntilExpiration: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysUntilExpiration = differenceInDays(expDate, today);

  if (daysUntilExpiration < 0) {
    return { status: 'expired', daysUntilExpiration };
  } else if (daysUntilExpiration <= warningDays) {
    return { status: 'expiring', daysUntilExpiration };
  }

  return { status: 'safe', daysUntilExpiration };
}

// Enhance item with expiration status
export function enhanceItemWithStatus(
  item: Item,
  warningDays: number = 3
): ItemWithStatus {
  const { status, daysUntilExpiration } = getExpirationStatus(
    item.expirationDate,
    warningDays
  );

  return {
    ...item,
    expirationStatus: status,
    daysUntilExpiration,
  };
}

// Format expiration text
export function formatExpirationText(daysUntilExpiration: number | null): string {
  if (daysUntilExpiration === null) {
    return 'No expiration';
  }

  if (daysUntilExpiration < 0) {
    const days = Math.abs(daysUntilExpiration);
    return `Expired ${days} day${days === 1 ? '' : 's'} ago`;
  } else if (daysUntilExpiration === 0) {
    return 'Expires today';
  } else if (daysUntilExpiration === 1) {
    return 'Expires tomorrow';
  } else {
    return `Expires in ${daysUntilExpiration} days`;
  }
}

// Format date for display
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'No date';

  const date = parseISO(dateString);
  if (!isValid(date)) return 'Invalid date';

  return format(date, 'MMM d, yyyy');
}

// Get color for expiration status
export function getExpirationColor(status: ExpirationStatus): string {
  switch (status) {
    case 'expired':
      return '#EF4444'; // red-500
    case 'expiring':
      return '#F59E0B'; // amber-500
    case 'safe':
      return '#10B981'; // emerald-500
    default:
      return '#6B7280'; // gray-500
  }
}

// Get background color for expiration status
export function getExpirationBgColor(status: ExpirationStatus): string {
  switch (status) {
    case 'expired':
      return '#FEE2E2'; // red-100
    case 'expiring':
      return '#FEF3C7'; // amber-100
    case 'safe':
      return '#D1FAE5'; // emerald-100
    default:
      return '#F3F4F6'; // gray-100
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get icon for storage area type
export function getStorageAreaIcon(type: string): string {
  switch (type) {
    case 'fridge':
      return 'refrigerator';
    case 'freezer':
      return 'snowflake';
    case 'pantry':
      return 'warehouse';
    case 'cabinet':
      return 'archive';
    default:
      return 'box';
  }
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
