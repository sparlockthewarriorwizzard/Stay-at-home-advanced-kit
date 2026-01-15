import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import PaywallScreen from '../screens/PaywallScreen';
import AffirmationRecordScreen from '../screens/AffirmationRecordScreen';
import HomeScreen from '../screens/HomeScreen';
import SequencerScreen from '../screens/SequencerScreen';
import VocalOverdubScreen from '../screens/VocalOverdubScreen';
import LoopBoardScreen from '../screens/LoopBoardScreen';

// Placeholders
const SettingsScreen = () => <></>;

// --------------------------------------------------------
// TYPESCRIPT DEFINITIONS
// --------------------------------------------------------
export type RootStackParamList = {
  MainTabs: undefined;
  Paywall: undefined;
  AffirmationRecord: undefined;
  Sequencer: { audioUri: string }; // Keeping for archive/backward compat
  LoopBoard: { affirmationText: string };
  VocalOverdub: { affirmationText: string; activeLoops?: any };
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
        headerShown: false,
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#333', backgroundColor: '#000' },
        tabBarActiveTintColor: '#FFD700',
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
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="AffirmationRecord" component={AffirmationRecordScreen} />
        <Stack.Screen name="LoopBoard" component={LoopBoardScreen} />
        <Stack.Screen name="Sequencer" component={SequencerScreen} />
        <Stack.Screen name="VocalOverdub" component={VocalOverdubScreen} />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}