import { useEffect, useState } from 'react';
import RevenueCatService from '../services/RevenueCat';
import Purchases, { CustomerInfo } from 'react-native-purchases';

export const useSubscription = () => {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check initial status
    const checkStatus = async () => {
      const status = await RevenueCatService.getCustomerStatus();
      setIsPro(status);
      setLoading(false);
    };

    checkStatus();

    // 2. Listen for real-time updates
    // (e.g., if a subscription expires while the app is open)
    const updateListener = (customerInfo: CustomerInfo) => {
      setIsPro(RevenueCatService.isUserPro(customerInfo));
    };

    Purchases.addCustomerInfoUpdateListener(updateListener);

    // Cleanup listener on unmount
    return () => {
      Purchases.removeCustomerInfoUpdateListener(updateListener);
    };
  }, []);

  return { isPro, loading };
};
