// src/components/AccessibilityPreferencesModal.tsx
import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  Switch, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Platform 
} from 'react-native';
import { AccessibilityPreferences } from '../types';
import { Ionicons } from '@expo/vector-icons';

// Define the props our modal component will accept
interface AccessibilityPreferencesModalProps {
  visible: boolean;                          // Controls modal visibility
  onClose: () => void;                      // Function to call when modal closes
  onSave: (preferences: AccessibilityPreferences) => void;  // Function to save preferences
  initialPreferences?: AccessibilityPreferences;  // Any existing preferences
}

export const AccessibilityPreferencesModal: React.FC<AccessibilityPreferencesModalProps> = ({
  visible,
  onClose,
  onSave,
  initialPreferences
}) => {
  // Initialize state with provided preferences or defaults
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(
    initialPreferences || {
      requiresWheelchairAccess: false,
      preferWellLit: false,
      needsRestStops: false,
      maximumSlope: undefined,
      minimumPathWidth: undefined
    }
  );

  // Save preferences and close the modal
  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  // Helper function to create preference toggle items
  const PreferenceToggle = ({ 
    label, 
    value, 
    onChange,
    icon,
    description 
  }: {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    icon: string;
    description: string;
  }) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceHeader}>
        <Ionicons name={icon as any} size={24} color="#007AFF" />
        <View style={styles.preferenceTextContainer}>
          <Text style={styles.preferenceLabel}>{label}</Text>
          <Text style={styles.preferenceDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        ios_backgroundColor="#ddd"
        trackColor={{ false: '#ddd', true: '#81b0ff' }}
        thumbColor={value ? '#007AFF' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Accessibility Preferences</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              accessibilityLabel="Close preferences modal"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Preferences List */}
          <ScrollView style={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Navigation Settings</Text>
            
            <PreferenceToggle
              label="Wheelchair Access Required"
              value={preferences.requiresWheelchairAccess}
              onChange={(value) => 
                setPreferences(prev => ({
                  ...prev,
                  requiresWheelchairAccess: value
                }))
              }
              icon="wheelchair-outline"
              description="Routes will avoid stairs and ensure adequate path width"
            />

            <PreferenceToggle
              label="Prefer Well-Lit Routes"
              value={preferences.preferWellLit}
              onChange={(value) => 
                setPreferences(prev => ({
                  ...prev,
                  preferWellLit: value
                }))
              }
              icon="sunny-outline"
              description="Prioritize routes with good lighting conditions"
            />

            <PreferenceToggle
              label="Need Rest Stops"
              value={preferences.needsRestStops}
              onChange={(value) => 
                setPreferences(prev => ({
                  ...prev,
                  needsRestStops: value
                }))
              }
              icon="bed-outline"
              description="Include routes with benches or resting areas"
            />
          </ScrollView>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              accessibilityLabel="Save accessibility preferences"
              accessibilityRole="button"
            >
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Styles for our modal and its components
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  scrollContent: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    padding: 20,
    paddingBottom: 10,
  },
  preferenceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  preferenceTextContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});