import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';
import RevenueCatService from './services/RevenueCat';

export default function App() {
    useEffect(() => {
        RevenueCatService.configure();
    }, []);

    return (
        <SafeAreaProvider>
            <RootNavigator />
        </SafeAreaProvider>
    );
}
