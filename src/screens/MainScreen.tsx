import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import * as ExpoLocation from 'expo-location';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { 
  NavigationState, 
  NavigationLocation,
  AccessibilityPreferences 
} from '../types';
import { NavigationMap } from '../component/NavigationMap';
import { SearchBar } from '../component/SearchBar';
import { NavigationAssistant } from '../component/NavigationAssistant';
import { AccessibilityPreferencesModal } from '../component/AccessibiltyPrefrenceModel';
import { AccessibilityRoutingService } from '../services/AccessibilityroutingService';
import { calculateDistance, getBearing, getCardinalDirection } from '../utils/Navigation';

export const MainScreen: React.FC = () => {
  // Initialize our core navigation state to track the user's journey
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentLocation: null,
    destination: null,
    route: [],
    isNavigating: false,
  });

  // Manage accessibility preferences visibility and settings
  const [showPreferences, setShowPreferences] = useState(false);
  const [accessibilityPreferences, setAccessibilityPreferences] = useState<AccessibilityPreferences>({
    requiresWheelchairAccess: false,
    preferWellLit: false,
    needsRestStops: false,
  });

  // Create an instance of our routing service
  const routingService = new AccessibilityRoutingService();

  // Convert Expo's location to our NavigationLocation type
  const convertToNavigationLocation = (expoLocation: ExpoLocation.LocationObject): NavigationLocation => {
    return {
      latitude: expoLocation.coords.latitude,
      longitude: expoLocation.coords.longitude,
      altitude: expoLocation.coords.altitude || undefined,
      heading: expoLocation.coords.heading || undefined,
      accuracy: expoLocation.coords.accuracy || undefined,
    };
  };

  // Set up location tracking when the component mounts
  useEffect(() => {
    let locationSubscription: ExpoLocation.LocationSubscription | null = null;

    const requestLocationPermissions = async () => {
      try {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'This app needs location access to provide navigation.'
          );
          return;
        }

        locationSubscription = await startLocationTracking();
      } catch (error) {
        console.error('Error requesting permissions:', error);
        Alert.alert('Error', 'Unable to access location services');
      }
    };

    requestLocationPermissions();

    // Clean up location tracking when component unmounts
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Start tracking the user's location with high accuracy
  const startLocationTracking = async () => {
    try {
      return await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          const navigationLocation = convertToNavigationLocation(location);
          setNavigationState(prev => ({
            ...prev,
            currentLocation: navigationLocation,
          }));
        }
      );
    } catch (error) {
      console.error('Error tracking location:', error);
      Alert.alert('Error', 'Unable to track location');
      return null;
    }
  };

  // Handle when accessibility preferences are saved
  const handlePreferencesSave = async (preferences: AccessibilityPreferences) => {
    setAccessibilityPreferences(preferences);
    
    // If we're already navigating, recalculate the route with new preferences
    if (navigationState.destination && navigationState.currentLocation) {
      try {
        const newRoute = await routingService.findAccessibleRoute(
          navigationState.currentLocation,
          navigationState.destination,
          preferences
        );
        
        setNavigationState(prev => ({
          ...prev,
          route: newRoute
        }));

        // Provide feedback about the route update
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await Speech.speak('Route updated based on your accessibility preferences');
      } catch (error) {
        console.error('Error updating route:', error);
        Alert.alert('Error', 'Unable to find an accessible route with these preferences');
      }
    }
  };

  // Start navigation with accessibility guidance
  const startNavigation = async (destination: NavigationLocation, accessibleRoute: NavigationLocation[]) => {
    if (!navigationState.currentLocation) {
      Alert.alert('Error', 'Unable to start navigation without current location');
      return;
    }

    try {
      // Provide initial feedback that navigation is starting
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      await Speech.speak(
        'Starting accessible navigation. Please hold your device in front of you.',
        {
          language: 'en',
          pitch: 1.0,
          rate: 0.9,
        }
      );

      // Calculate and announce initial route information
      const distance = calculateDistance(navigationState.currentLocation, destination);
      const bearing = getBearing(navigationState.currentLocation, destination);
      const direction = getCardinalDirection(bearing);

      await Speech.speak(
        `Your destination is ${Math.round(distance)} meters away. I'll guide you along an accessible route. Head ${direction}`,
        {
          language: 'en',
          pitch: 1.0,
          rate: 0.9,
        }
      );

      // Announce accessibility features along the route
      const features = await routingService.getAccessibleFeaturesOnRoute(accessibleRoute);
      if (features.length > 0) {
        const featureDescription = features
          .map(f => f.description)
          .join('. ');
        
        await Speech.speak(
          `Along this route, you'll find: ${featureDescription}`,
          {
            language: 'en',
            pitch: 1.0,
            rate: 0.9,
          }
        );
      }
    } catch (error) {
      console.error('Error starting navigation:', error);
      Alert.alert('Error', 'Unable to start navigation');
    }
  };

  // Handle when a destination is selected
  const handleDestinationSelect = async (location: NavigationLocation) => {
    try {
      if (!navigationState.currentLocation) {
        throw new Error('Current location not available');
      }

      // Find an accessible route based on user preferences
      const accessibleRoute = await routingService.findAccessibleRoute(
        navigationState.currentLocation,
        location,
        accessibilityPreferences
      );

      setNavigationState(prev => ({
        ...prev,
        destination: location,
        route: accessibleRoute,
        isNavigating: true,
      }));

      startNavigation(location, accessibleRoute);
    } catch (error) {
      console.error('Error finding accessible route:', error);
      Alert.alert(
        'Navigation Error',
        'Unable to find an accessible route to this destination. Please try another destination or adjust your accessibility preferences.'
      );
    }
  };

  // Render our navigation interface
  return (
    <View style={styles.container}>
      <NavigationMap
        currentLocation={navigationState.currentLocation}
        destination={navigationState.destination}
        onDestinationSelect={handleDestinationSelect}
        accessibleRoute={navigationState.route}
      />
      <SearchBar
        onLocationSelect={handleDestinationSelect}
        isLoading={!navigationState.currentLocation}
      />
      <NavigationAssistant
        currentLocation={navigationState.currentLocation}
        destination={navigationState.destination}
        isNavigating={navigationState.isNavigating}
      />
      <AccessibilityPreferencesModal
        visible={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={handlePreferencesSave}
        initialPreferences={accessibilityPreferences}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});