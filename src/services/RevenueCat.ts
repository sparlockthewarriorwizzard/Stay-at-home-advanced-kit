import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';

// --------------------------------------------------------
// CONFIGURATION
// --------------------------------------------------------

// Ideally, pull these from your .env file
const API_KEYS = {
  apple: 'appl_YOUR_IOS_API_KEY',
  google: 'goog_YOUR_ANDROID_API_KEY',
};

// The ID of the entitlement created in the RevenueCat dashboard
// This is what unlocks the "Pro" content.
export const ENTITLEMENT_ID = 'pro';

// --------------------------------------------------------
// SERVICE METHODS
// --------------------------------------------------------

class RevenueCatService {
  /**
   * Initialize the SDK. Call this in App.tsx (useEffect).
   */
  async configure() {
    // 1. Enable debug logs for easier development
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    // 2. Select the correct key based on platform
    if (Platform.OS === 'ios') {
      await Purchases.configure({ apiKey: API_KEYS.apple });
    } else if (Platform.OS === 'android') {
      await Purchases.configure({ apiKey: API_KEYS.google });
    }
  }

  /**
   * Fetch the "Current Offering".
   * In RevenueCat, you configure an "Offering" (e.g., Default) that contains your packages (Monthly, Annual).
   */
  async getOfferings(): Promise<PurchasesPackage[] | null> {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        return offerings.current.availablePackages;
      }
      return null;
    } catch (e) {
      console.error('Error fetching offerings:', e);
      return null;
    }
  }

  /**
   * Purchase a specific package.
   */
  async purchasePackage(pack: PurchasesPackage): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      return this.isUserPro(customerInfo);
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('Purchase error:', e);
        // Alert.alert('Error', e.message); // Optional: Show UI alert
      }
      return false;
    }
  }

  /**
   * Restore Purchases (Required by Apple/Google).
   * Checks if the user bought Pro on another device.
   */
  async restorePurchases(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return this.isUserPro(customerInfo);
    } catch (e) {
      console.error('Restore error:', e);
      return false;
    }
  }

  /**
   * Helper: Check if the user has the active entitlement.
   */
  isUserPro(customerInfo: CustomerInfo): boolean {
    if (
      customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined
    ) {
      return true;
    }
    return false;
  }

  /**
   * Get the latest status without making a purchase.
   */
  async getCustomerStatus(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return this.isUserPro(customerInfo);
    } catch (e) {
      return false;
    }
  }
}

export default new RevenueCatService();
