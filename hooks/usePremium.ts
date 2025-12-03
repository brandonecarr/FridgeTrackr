import { useStore } from '@/store';
import { useRouter } from 'expo-router';

/**
 * Hook to check Premium status and provide navigation to upgrade
 */
export function usePremium() {
  const { userAccount } = useStore();
  const router = useRouter();

  const isPremium = userAccount.isPremium;

  const requirePremium = (callback: () => void) => {
    if (isPremium) {
      callback();
    } else {
      // Navigate to Premium tab to show upgrade screen
      router.push('/(tabs)/premium');
    }
  };

  return {
    isPremium,
    requirePremium,
    premiumExpiresAt: userAccount.premiumExpiresAt,
  };
}
