import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { AffirmationRecorder } from '../modules/affirmation-flow/AffirmationRecorder';
import { AffirmationService } from '../modules/affirmation-flow/AffirmationService';
import { useNavigation } from '@react-navigation/native';

// In a real app, this would come from an environment variable or a central service file
const affirmationService = new AffirmationService('https://your-api-url.com');

const AffirmationRecordScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleSuccess = (audioUri: string) => {
    // Navigate to the next part of the flow (Step Sequencer)
    navigation.navigate('Sequencer', { audioUri });
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

// Import Alert from react-native since it's used in handleSuccess
import { Alert } from 'react-native';
