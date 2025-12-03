import { ShoppingListItem, DeliveryProvider } from '@/types';
import { Linking } from 'react-native';

/**
 * Delivery Service Integration Utility
 *
 * NOTE: This is a SIMULATED integration for demonstration purposes.
 * In production, you would integrate with real APIs:
 * - Instacart API: https://www.instacart.com/developer
 * - Walmart API: https://developer.walmart.com
 * - Amazon Product Advertising API
 *
 * Most services use OAuth for authentication and REST APIs for cart management.
 */

interface DeliveryServiceInfo {
  name: string;
  icon: string;
  color: string;
  description: string;
  authUrl?: string;
  supportsDirectExport: boolean;
}

export const DELIVERY_SERVICES: Record<DeliveryProvider, DeliveryServiceInfo> = {
  instacart: {
    name: 'Instacart',
    icon: '🛒',
    color: '#43B02A',
    description: 'Same-day delivery from local stores',
    authUrl: 'https://www.instacart.com/oauth/authorize',
    supportsDirectExport: true,
  },
  walmart: {
    name: 'Walmart Grocery',
    icon: '🏪',
    color: '#0071CE',
    description: 'Free pickup and delivery',
    authUrl: 'https://www.walmart.com/account/api/oauth',
    supportsDirectExport: true,
  },
  amazon_fresh: {
    name: 'Amazon Fresh',
    icon: '📦',
    color: '#FF9900',
    description: 'Fresh groceries from Amazon',
    authUrl: 'https://www.amazon.com/ap/oauth',
    supportsDirectExport: false, // Amazon doesn't have public cart API
  },
  other: {
    name: 'Other Service',
    icon: '🚚',
    color: '#6B7280',
    description: 'Generic delivery service',
    supportsDirectExport: false,
  },
};

/**
 * Export shopping list to delivery service
 * In production, this would call the service's API to add items to cart
 */
export async function exportToDeliveryService(
  provider: DeliveryProvider,
  items: ShoppingListItem[],
  accessToken?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const service = DELIVERY_SERVICES[provider];

    if (!service.supportsDirectExport) {
      // For services without API, copy to clipboard and open website
      return {
        success: false,
        error: `${service.name} doesn't support direct export. Items have been copied to clipboard.`,
      };
    }

    // In production, make API call:
    // const response = await fetch(`${service.apiUrl}/cart/add`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     items: items.map(item => ({
    //       name: item.name,
    //       quantity: item.quantity,
    //       unit: item.unit,
    //     })),
    //   }),
    // });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return success with deep link to service
    const deepLink = getDeliveryServiceDeepLink(provider, items);

    return {
      success: true,
      url: deepLink,
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: 'Failed to export items. Please try again.',
    };
  }
}

/**
 * Get deep link to delivery service
 * In production, this would be a real deep link or web URL
 */
function getDeliveryServiceDeepLink(
  provider: DeliveryProvider,
  items: ShoppingListItem[]
): string {
  const itemNames = items.map(item => `${item.quantity} ${item.unit} ${item.name}`).join(', ');

  switch (provider) {
    case 'instacart':
      // Real Instacart might use: instacart://cart/add?items=...
      return `https://www.instacart.com/store`;
    case 'walmart':
      // Real Walmart might use: walmart://grocery/cart
      return `https://www.walmart.com/grocery`;
    case 'amazon_fresh':
      return `https://www.amazon.com/alm/storefront`;
    default:
      return '#';
  }
}

/**
 * Format shopping list as text for copying
 */
export function formatShoppingListAsText(items: ShoppingListItem[]): string {
  let text = 'Shopping List\n\n';

  // Group by store
  const byStore = items.reduce((acc, item) => {
    const storeName = item.storeId || 'Other';
    if (!acc[storeName]) acc[storeName] = [];
    acc[storeName].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  Object.entries(byStore).forEach(([store, storeItems]) => {
    text += `${store}:\n`;
    storeItems.forEach(item => {
      text += `  • ${item.quantity} ${item.unit} ${item.name}`;
      if (item.aisle) text += ` (Aisle ${item.aisle})`;
      text += '\n';
    });
    text += '\n';
  });

  return text;
}

/**
 * Open delivery service OAuth flow
 * In production, this would handle OAuth authentication
 */
export async function connectDeliveryService(
  provider: DeliveryProvider
): Promise<{ success: boolean; accessToken?: string; error?: string }> {
  const service = DELIVERY_SERVICES[provider];

  if (!service.authUrl) {
    return {
      success: false,
      error: 'This service does not support direct connection.',
    };
  }

  try {
    // In production, this would:
    // 1. Open OAuth URL in browser or in-app browser
    // 2. Handle redirect with auth code
    // 3. Exchange auth code for access token
    // 4. Store encrypted access token

    // For demo, simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate getting access token
    const mockToken = `${provider}_token_${Date.now()}`;

    return {
      success: true,
      accessToken: mockToken,
    };
  } catch (error) {
    console.error('OAuth error:', error);
    return {
      success: false,
      error: 'Failed to connect. Please try again.',
    };
  }
}

/**
 * Open delivery service app or website
 */
export async function openDeliveryService(provider: DeliveryProvider): Promise<void> {
  const url = getDeliveryServiceDeepLink(provider, []);

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.warn(`Cannot open URL: ${url}`);
    }
  } catch (error) {
    console.error('Failed to open URL:', error);
  }
}

/**
 * Estimate delivery fee based on provider
 * In production, this would call the service's API for real pricing
 */
export function estimateDeliveryFee(provider: DeliveryProvider, orderTotal: number): number {
  switch (provider) {
    case 'instacart':
      // Instacart: $3.99 base + variable based on order size
      return orderTotal > 35 ? 3.99 : 5.99;
    case 'walmart':
      // Walmart: Free delivery on $35+, else $7.95
      return orderTotal >= 35 ? 0 : 7.95;
    case 'amazon_fresh':
      // Amazon Fresh: Free for Prime members on $35+
      return orderTotal >= 35 ? 0 : 9.99;
    default:
      return 0;
  }
}

/**
 * Get recommended delivery times
 */
export function getDeliveryTimeOptions(provider: DeliveryProvider): string[] {
  switch (provider) {
    case 'instacart':
      return ['ASAP (1-2 hours)', 'Today 4-6 PM', 'Tomorrow 10-12 AM'];
    case 'walmart':
      return ['Today 2-4 PM', 'Tomorrow 8-10 AM', 'Tomorrow 4-6 PM'];
    case 'amazon_fresh':
      return ['Today 6-8 PM', 'Tomorrow Morning', 'Tomorrow Evening'];
    default:
      return ['Standard Delivery'];
  }
}
