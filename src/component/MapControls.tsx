// src/components/MapControls.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MapControlsProps {
  onCenterLocation: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetBearing: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onCenterLocation,
  onZoomIn,
  onZoomOut,
  onResetBearing,
}) => {
  return (
    <View style={styles.container}>
      {/* Right side controls for location and compass */}
      <View style={styles.rightControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onCenterLocation}
          accessibilityLabel="Center on my location"
          accessibilityRole="button"
        >
          <Ionicons name="locate" size={24} color="#000000" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onResetBearing}
          accessibilityLabel="Reset map rotation"
          accessibilityRole="button"
        >
          <Ionicons name="compass" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Left side controls for zoom */}
      <View style={styles.leftControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onZoomIn}
          accessibilityLabel="Zoom in"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color="#000000" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onZoomOut}
          accessibilityLabel="Zoom out"
          accessibilityRole="button"
        >
          <Ionicons name="remove" size={24} color="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    width: '100%',
  },
  rightControls: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    gap: 8,
  },
  leftControls: {
    position: 'absolute',
    left: 24,
    bottom: 0,
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 8,
  },
});