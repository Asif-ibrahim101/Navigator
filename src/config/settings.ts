// src/config/settings.ts
export const APP_SETTINGS = {
    LOCATION_UPDATE_INTERVAL: 1000,  // How often to update location (in ms)
    MINIMUM_DISTANCE_CHANGE: 1,      // Minimum distance (meters) for location updates
    ARRIVAL_THRESHOLD: 5,            // Distance (meters) to consider arrived
    GUIDANCE_UPDATE_INTERVALS: {
      CLOSE: 3000,     // Update interval when close to destination
      MEDIUM: 5000,    // Update interval when at medium distance
      FAR: 10000,      // Update interval when far from destination
    },
    FEATURE_DETECTION_RADIUS: 20,    // Radius (meters) to detect accessibility features
  };