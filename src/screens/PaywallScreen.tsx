import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PurchasesPackage } from 'react-native-purchases';
import RevenueCatService from '../services/RevenueCat';
import { useNavigation } from '@react-navigation/native';

export default function PaywallScreen() {
  const navigation = useNavigation();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    const offerings = await RevenueCatService.getOfferings();
    if (offerings) {
      setPackages(offerings);
    }
  };

  const onPurchase = async (pack: PurchasesPackage) => {
    setIsPurchasing(true);
    const success = await RevenueCatService.purchasePackage(pack);
    setIsPurchasing(false);

    if (success) {
      navigation.goBack(); // Or navigate to a 'Success' screen
    }
  };

  const onRestore = async () => {
    setIsPurchasing(true);
    const success = await RevenueCatService.restorePurchases();
    setIsPurchasing(false);

    if (success) {
      Alert.alert('Success', 'Your purchases have been restored.');
      navigation.goBack();
    } else {
      Alert.alert('Notice', 'No active subscriptions found to restore.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Unlock Full Access</Text>
          <Text style={styles.subtitle}>
            Get unlimited access to all features and remove ads.
          </Text>
        </View>

        {/* Packages List */}
        <View style={styles.packagesContainer}>
          {packages.length === 0 ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            packages.map((pack) => (
              <TouchableOpacity
                key={pack.identifier}
                style={styles.packageButton}
                onPress={() => onPurchase(pack)}
                disabled={isPurchasing}
              >
                <View>
                  <Text style={styles.packageTitle}>{pack.product.title}</Text>
                  <Text style={styles.packageDesc}>{pack.product.description}</Text>
                </View>
                <Text style={styles.packagePrice}>{pack.product.priceString}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Loading Overlay for Actions */}
        {isPurchasing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#fff" />
          </View>
        )}

        {/* Footer - COMPLIANCE LINKS (Required by Apple) */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={onRestore} style={styles.restoreButton}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>

          <View style={styles.legalLinks}>
            <Text style={styles.legalText}>Terms of Service</Text>
            <Text style={styles.legalText}> • </Text>
            <Text style={styles.legalText}>Privacy Policy</Text>
          </View>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeText}>Not Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --------------------------------------------------------
// STYLES (Clean, minimal, ready for customization)
// --------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  packagesContainer: {
    marginBottom: 40,
  },
  packageButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  packageDesc: {
    fontSize: 12,
    color: '#666',
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  restoreButton: {
    marginBottom: 16,
  },
  restoreText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  legalLinks: {
    flexDirection: 'row',
    opacity: 0.5,
  },
  legalText: {
    fontSize: 12,
    color: '#000',
  },
  closeButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  closeText: {
    color: '#999',
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});
