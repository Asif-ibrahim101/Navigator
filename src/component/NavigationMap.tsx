// src/components/NavigationMap.tsx
import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region, Polyline } from 'react-native-maps';
import { NavigationLocation } from '../types';
import { MapControls } from './MapControls';

interface NavigationMapProps {
  currentLocation: NavigationLocation | null;
  destination: NavigationLocation | null;
  onDestinationSelect: (location: NavigationLocation) => void;
  accessibleRoute: NavigationLocation[];
}

export const NavigationMap: React.FC<NavigationMapProps> = ({
  currentLocation,
  destination,
  onDestinationSelect,
  accessibleRoute
}) => {
  const mapRef = useRef<MapView | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(15);
  const DEFAULT_ZOOM_DELTA = 0.01;

  const createRegion = (location: NavigationLocation, zoomDelta: number): Region => ({
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: zoomDelta,
    longitudeDelta: zoomDelta * (Dimensions.get('window').width / Dimensions.get('window').height),
  });

  const centerOnLocation = () => {
    if (currentLocation && mapRef.current) {
      const region = createRegion(currentLocation, DEFAULT_ZOOM_DELTA);
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current && currentLocation) {
      setZoomLevel(prev => {
        const newZoom = prev + 1;
        const newDelta = DEFAULT_ZOOM_DELTA / Math.pow(2, newZoom - 15);
        const region = createRegion(currentLocation, newDelta);
        mapRef.current?.animateToRegion(region, 500);
        return newZoom;
      });
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current && currentLocation) {
      setZoomLevel(prev => {
        const newZoom = prev - 1;
        const newDelta = DEFAULT_ZOOM_DELTA / Math.pow(2, newZoom - 15);
        const region = createRegion(currentLocation, newDelta);
        mapRef.current?.animateToRegion(region, 500);
        return newZoom;
      });
    }
  };

  const handleResetBearing = () => {
    if (mapRef.current && currentLocation) {
      const region = createRegion(currentLocation, DEFAULT_ZOOM_DELTA / Math.pow(2, zoomLevel - 15));
      mapRef.current.animateToRegion({
        ...region,
        latitude: region.latitude + 0.000001,
      }, 0);
      mapRef.current.animateToRegion(region, 500);
    }
  };

  useEffect(() => {
    if (currentLocation) {
      const region = createRegion(currentLocation, DEFAULT_ZOOM_DELTA / Math.pow(2, zoomLevel - 15));
      mapRef.current?.animateToRegion(region, 1000);
    }
  }, [currentLocation]);

  return (
    <>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={true}
        rotateEnabled={true}
        loadingEnabled={true}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: DEFAULT_ZOOM_DELTA,
          longitudeDelta: DEFAULT_ZOOM_DELTA * (Dimensions.get('window').width / Dimensions.get('window').height),
        }}
        onLongPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          onDestinationSelect({ latitude, longitude });
        }}
      >
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destination"
            description="Your selected destination"
            pinColor="red"
          />
        )}
        {accessibleRoute.length > 0 && (
          <Polyline
            coordinates={accessibleRoute}
            strokeWidth={3}
            strokeColor="#4CAF50"
          />
        )}
      </MapView>
      
      <MapControls
        onCenterLocation={centerOnLocation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetBearing={handleResetBearing}
      />
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});