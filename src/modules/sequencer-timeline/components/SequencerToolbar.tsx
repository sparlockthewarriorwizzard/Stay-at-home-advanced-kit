import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../constants/Theme';

interface SequencerToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onToggleAutomation?: () => void;
}

export const SequencerToolbar: React.FC<SequencerToolbarProps> = ({
  onUndo,
  onRedo,
  onToggleAutomation,
}) => {
  return (
    <View style={styles.container}>
      {/* History Controls */}
      <View style={styles.group}>
        <TouchableOpacity style={styles.button} onPress={onUndo}>
          <Ionicons name="arrow-undo" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onRedo}>
          <Ionicons name="arrow-redo" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Mode Controls */}
      <View style={styles.group}>
        <TouchableOpacity style={[styles.button, styles.activeButton]} onPress={onToggleAutomation}>
            {/* Using a curve icon to represent automation/curves */}
           <MaterialCommunityIcons name="vector-curve" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    height: 40,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  group: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
      backgroundColor: '#444', // Slightly lighter to imply specific functionality or toggle state
  }
});
