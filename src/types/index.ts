// src/types/index.ts
// This file defines all the core types used throughout our application

export interface NavigationLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  heading?: number;
  accuracy?: number;
}

export interface NavigationState {
  currentLocation: NavigationLocation | null;
  destination: NavigationLocation | null;
  route: NavigationLocation[];
  isNavigating: boolean;
}

export interface AccessibilityFeature {
  type: 'ramp' | 'elevator' | 'wide_pathway' | 'rest_area' | 'well_lit' | 'tactile_paving';
  location: NavigationLocation;
  description: string;
  isActive: boolean;
}

export interface AccessibilityObstacle {
  type: 'stairs' | 'construction' | 'narrow_path' | 'poor_lighting' | 'uneven_surface';
  location: NavigationLocation;
  description: string;
  temporaryUntil?: Date;
}

export interface AccessibilityPreferences {
  requiresWheelchairAccess: boolean;
  preferWellLit: boolean;
  needsRestStops: boolean;
  maximumSlope?: number;
  minimumPathWidth?: number;
}