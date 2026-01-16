import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AffirmationRecorder } from '../modules/affirmation-flow/AffirmationRecorder';
import { AffirmationService } from '../modules/affirmation-flow/AffirmationService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AffirmationRecord'>;

// In a real app, this would come from an environment variable or a central service file
const affirmationService = new AffirmationService('https://your-api-url.com');

const AffirmationRecordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleSuccess = (affirmationText: string) => {
    // Navigate to the next part of the flow (Loop Board)
    navigation.navigate('LoopBoard', { affirmationText });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AffirmationRecorder
        service={affirmationService}
        onSuccess={handleSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default AffirmationRecordScreen;
