import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Instrument } from '../../types/MusicTypes';

interface InstrumentSelectorProps {
  instruments: Instrument[];
  activeInstrumentId: string;
  onSelectInstrument: (id: string) => void;
  voiceUri?: string;
}

export const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  instruments,
  activeInstrumentId,
  onSelectInstrument,
  voiceUri,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Voice Track */}
        {voiceUri && (
            <TouchableOpacity
            style={[styles.trackBtn, activeInstrumentId === voiceUri && styles.activeTrackBtn]}
            onPress={() => onSelectInstrument(voiceUri)}
            >
            <Text style={[styles.trackBtnText, activeInstrumentId === voiceUri && styles.activeTrackBtnText]}>
                My Voice
            </Text>
            </TouchableOpacity>
        )}

        {/* Kit Instruments */}
        {instruments.map((inst) => (
          <TouchableOpacity
            key={inst.id}
            style={[styles.trackBtn, activeInstrumentId === inst.id && styles.activeTrackBtn]}
            onPress={() => onSelectInstrument(inst.id)}
          >
            <Text style={[styles.trackBtnText, activeInstrumentId === inst.id && styles.activeTrackBtnText]}>
              {inst.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    marginTop: 20,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'center',
  },
  trackBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#444',
    minWidth: 80,
    alignItems: 'center',
  },
  activeTrackBtn: {
    backgroundColor: '#FFD700', // Gold
    borderColor: '#FFD700',
  },
  trackBtnText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTrackBtnText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
