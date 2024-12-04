import React, { useEffect } from 'react';
import { View } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { NavigationLocation } from '../types';
import { calculateDistance, getBearing, getCardinalDirection } from '../utils/Navigation';

interface NavigationAssistantProps {
  currentLocation: NavigationLocation | null;
  destination: NavigationLocation | null;
  isNavigating: boolean;
}

export const NavigationAssistant: React.FC<NavigationAssistantProps> = ({
  currentLocation,
  destination,
  isNavigating,
}) => {
  const lastAnnouncementRef = React.useRef<number>(0);
  const lastDistanceRef = React.useRef<number>(0);

  useEffect(() => {
    if (isNavigating && currentLocation && destination) {
      provideGuidance(currentLocation, destination);
    }
    
    return () => {
      Speech.stop();
    };
  }, [currentLocation, destination, isNavigating]);

  const provideGuidance = async (current: NavigationLocation, dest: NavigationLocation) => {
    const now = Date.now();
    const timeSinceLastAnnouncement = now - lastAnnouncementRef.current;
    
    const distance = calculateDistance(current, dest);
    const bearing = getBearing(current, dest);
    const direction = getCardinalDirection(bearing);

    const isGettingCloser = distance < lastDistanceRef.current;
    lastDistanceRef.current = distance;

    const minAnnouncementInterval = distance < 50 ? 3000 : 
                                   distance < 100 ? 5000 : 
                                   10000;

    if (timeSinceLastAnnouncement < minAnnouncementInterval) {
      return;
    }

    lastAnnouncementRef.current = now;

    let message = '';
    if (distance < 5) {
      message = 'You have arrived at your destination';
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (distance < 20) {
      message = `Your destination is ${Math.round(distance)} meters ahead. Head ${direction}`;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (distance < 50) {
      message = `Getting close. ${Math.round(distance)} meters to go. Continue ${direction}`;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      message = `Continue ${direction} for ${Math.round(distance)} meters`;
      if (isGettingCloser) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    await Speech.stop();
    await Speech.speak(message, {
      language: 'en',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  return null;
};