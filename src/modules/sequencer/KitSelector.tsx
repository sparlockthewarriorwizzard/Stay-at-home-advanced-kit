import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, FlatList } from 'react-native';
import { SoundKit } from '../../types/MusicTypes';
import { Ionicons } from '@expo/vector-icons';

interface KitSelectorProps {
  currentKit: SoundKit;
  kits: SoundKit[];
  onSelectKit: (kit: SoundKit) => void;
}

export const KitSelector: React.FC<KitSelectorProps> = ({
  currentKit,
  kits,
  onSelectKit,
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="musical-notes" size={20} color="#FFD700" />
        <Text style={styles.selectorText}>{currentKit.name}</Text>
        <Ionicons name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Drum Kit</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={kits}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.kitItem,
                    item.id === currentKit.id && styles.activeKitItem,
                  ]}
                  onPress={() => {
                    onSelectKit(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.kitName,
                    item.id === currentKit.id && styles.activeKitName,
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={styles.kitDesc}>{item.description}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    gap: 8,
  },
  selectorText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '50%',
    borderTopWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  kitItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  activeKitItem: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)', // Gold tint
    borderRadius: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0,
  },
  kitName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  activeKitName: {
    color: '#FFD700',
  },
  kitDesc: {
    color: '#888',
    fontSize: 14,
  },
});
