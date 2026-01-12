import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
// Screens
import PaywallScreen from '../screens/PaywallScreen';
import AffirmationRecordScreen from '../screens/AffirmationRecordScreen';
import HomeScreen from '../screens/HomeScreen';

// @AI-NOTE: REGISTER NEW SCREENS HERE
// 1. Import the screen component.
// 2. Add it to the Stack or Tab Navigator below.
// 3. Define the param type in RootStackParamList.

// Placeholders for your actual app screens (AI can replace these easily)
const SettingsScreen = () => <></>;

// --------------------------------------------------------
// TYPESCRIPT DEFINITIONS (Lead Engineer Standard)
// --------------------------------------------------------
export type RootStackParamList = {
  MainTabs: undefined;
  Paywall: undefined;
  AffirmationRecord: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Settings: undefined;
};

// --------------------------------------------------------
// NAVIGATORS
// --------------------------------------------------------
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // We usually build custom headers or use the screen's header
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#e0e0e0' },
        tabBarActiveTintColor: '#007AFF',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// --------------------------------------------------------
// ROOT COMPONENT
// --------------------------------------------------------
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

                {/* The Main App (Tabs) */}
                <Stack.Screen name="MainTabs" component={MainTabs} />
        
                {/* Affirmation Flow */}
                <Stack.Screen name="AffirmationRecord" component={AffirmationRecordScreen} />
        
                {/* The Paywall (Modal)  */}        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ presentation: 'modal' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
