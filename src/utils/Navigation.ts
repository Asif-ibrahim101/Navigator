// src/utils/navigation.ts
// This file contains utility functions for calculating distances and directions
import { NavigationLocation } from '../types';

export const calculateDistance = (
  start: NavigationLocation,
  end: NavigationLocation
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (start.latitude * Math.PI) / 180;
  const φ2 = (end.latitude * Math.PI) / 180;
  const Δφ = ((end.latitude - start.latitude) * Math.PI) / 180;
  const Δλ = ((end.longitude - start.longitude) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const getBearing = (
  start: NavigationLocation,
  end: NavigationLocation
): number => {
  const λ1 = (start.longitude * Math.PI) / 180;
  const λ2 = (end.longitude * Math.PI) / 180;
  const φ1 = (start.latitude * Math.PI) / 180;
  const φ2 = (end.latitude * Math.PI) / 180;

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);

  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
};

export const getCardinalDirection = (bearing: number): string => {
  const directions = [
    'north',
    'northeast',
    'east',
    'southeast',
    'south',
    'southwest',
    'west',
    'northwest'
  ];
  return directions[Math.round(bearing / 45) % 8];
};