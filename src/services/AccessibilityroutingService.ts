// src/services/AccessibilityRoutingService.ts
import { 
    Location, 
    AccessibilityFeature, 
    AccessibilityObstacle, 
    AccessibilityPreferences 
  } from '../types';
  
  export class AccessibilityRoutingService {
    // We store accessibility features and obstacles as private class members
    // so they can be managed and updated throughout the navigation experience
    private features: AccessibilityFeature[] = [];
    private obstacles: AccessibilityObstacle[] = [];
    private userPreferences: AccessibilityPreferences | null = null;
  
    constructor(
      initialFeatures: AccessibilityFeature[] = [],
      initialObstacles: AccessibilityObstacle[] = []
    ) {
      this.features = initialFeatures;
      this.obstacles = initialObstacles;
    }
  
    // This method allows updating user preferences which affects route calculations
    public setUserPreferences(preferences: AccessibilityPreferences): void {
      this.userPreferences = preferences;
    }
  
    // Method to add new accessibility features discovered or reported
    public addFeature(feature: AccessibilityFeature): void {
      this.features.push(feature);
    }
  
    // Method to add new obstacles that may affect navigation
    public addObstacle(obstacle: AccessibilityObstacle): void {
      this.obstacles.push(obstacle);
    }
  
    // Remove obstacles that are no longer relevant
    public removeObstacle(location: Location): void {
      this.obstacles = this.obstacles.filter(obs => 
        this.calculateBaseDistance(obs.location, location) > 1
      );
    }
  
    // The main method for finding an accessible route between two points
    public async findAccessibleRoute(
      start: Location,
      end: Location,
      preferences: AccessibilityPreferences
    ): Promise<Location[]> {
      const openSet = new Set([start]);
      const cameFrom = new Map<string, Location>();
      const gScore = new Map<string, number>();
      const fScore = new Map<string, number>();
      
      gScore.set(this.locationToKey(start), 0);
      fScore.set(this.locationToKey(start), this.estimateDistance(start, end));
  
      while (openSet.size > 0) {
        const current = this.getLowestFScore(openSet, fScore);
        
        if (this.isAtDestination(current, end)) {
          return this.reconstructPath(cameFrom, current);
        }
  
        openSet.delete(current);
        
        for (const neighbor of this.getAccessibleNeighbors(current, preferences)) {
          const tentativeGScore = gScore.get(this.locationToKey(current))! + 
                                this.calculatePathWeight(current, neighbor, preferences);
  
          if (tentativeGScore < (gScore.get(this.locationToKey(neighbor)) ?? Infinity)) {
            cameFrom.set(this.locationToKey(neighbor), current);
            gScore.set(this.locationToKey(neighbor), tentativeGScore);
            fScore.set(
              this.locationToKey(neighbor),
              tentativeGScore + this.estimateDistance(neighbor, end)
            );
            openSet.add(neighbor);
          }
        }
      }
  
      throw new Error('No accessible route found');
    }
  
    // Get accessibility features along a specific route
    public async getAccessibleFeaturesOnRoute(route: Location[]): Promise<AccessibilityFeature[]> {
      const relevantFeatures: AccessibilityFeature[] = [];
  
      if (route.length < 2) {
        return [];
      }
  
      for (let i = 0; i < route.length - 1; i++) {
        const startPoint = route[i];
        const endPoint = route[i + 1];
  
        const featuresOnSegment = this.features.filter(feature => {
          if (!feature.isActive) {
            return false;
          }
  
          return this.isPointNearLine(
            feature.location,
            startPoint,
            endPoint,
            20
          );
        });
  
        featuresOnSegment.forEach(feature => {
          if (!relevantFeatures.some(f => 
            f.location.latitude === feature.location.latitude && 
            f.location.longitude === feature.location.longitude
          )) {
            relevantFeatures.push(feature);
          }
        });
      }
  
      relevantFeatures.sort((a, b) => {
        const distanceA = this.calculateBaseDistance(route[0], a.location);
        const distanceB = this.calculateBaseDistance(route[0], b.location);
        return distanceA - distanceB;
      });
  
      return relevantFeatures;
    }
  
    // Calculate how difficult a path segment is based on accessibility requirements
    private calculatePathWeight(
      start: Location,
      end: Location,
      preferences: AccessibilityPreferences
    ): number {
      let weight = this.calculateBaseDistance(start, end);
      
      const obstaclesOnPath = this.findObstaclesOnPath(start, end);
      
      for (const obstacle of obstaclesOnPath) {
        if (preferences.requiresWheelchairAccess && 
            (obstacle.type === 'stairs' || obstacle.type === 'narrow_path')) {
          return Infinity;
        }
        
        if (preferences.preferWellLit && obstacle.type === 'poor_lighting') {
          weight *= 1.5;
        }
      }
  
      const featuresOnPath = this.findFeaturesOnPath(start, end);
      
      for (const feature of featuresOnPath) {
        if (preferences.requiresWheelchairAccess && 
            (feature.type === 'ramp' || feature.type === 'elevator')) {
          weight *= 0.8;
        }
        
        if (preferences.needsRestStops && feature.type === 'rest_area') {
          weight *= 0.9;
        }
      }
  
      return weight;
    }
  
    // Calculate the base distance between two points using the Haversine formula
    private calculateBaseDistance(start: Location, end: Location): number {
      const R = 6371e3;
      const φ1 = (start.latitude * Math.PI) / 180;
      const φ2 = (end.latitude * Math.PI) / 180;
      const Δφ = ((end.latitude - start.latitude) * Math.PI) / 180;
      const Δλ = ((end.longitude - start.longitude) * Math.PI) / 180;
  
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
      return R * c;
    }
  
    private getLowestFScore(
      openSet: Set<Location>, 
      fScore: Map<string, number>
    ): Location {
      let lowest = Infinity;
      let lowestNode: Location | null = null;
  
      openSet.forEach(node => {
        const score = fScore.get(this.locationToKey(node)) ?? Infinity;
        if (score < lowest) {
          lowest = score;
          lowestNode = node;
        }
      });
  
      if (!lowestNode) {
        throw new Error('No nodes in open set');
      }
  
      return lowestNode;
    }
  
    private isAtDestination(current: Location, end: Location): boolean {
      return this.calculateBaseDistance(current, end) < 5;
    }
  
    private getAccessibleNeighbors(
      current: Location, 
      preferences: AccessibilityPreferences
    ): Location[] {
      const neighbors: Location[] = [];
      const gridSize = 0.0001;
  
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
  
          const neighbor: Location = {
            latitude: current.latitude + (i * gridSize),
            longitude: current.longitude + (j * gridSize)
          };
  
          if (this.isLocationAccessible(neighbor, preferences)) {
            neighbors.push(neighbor);
          }
        }
      }
  
      return neighbors;
    }
  
    private locationToKey(location: Location): string {
      return `${location.latitude},${location.longitude}`;
    }
  
    private estimateDistance(a: Location, b: Location): number {
      return this.calculateBaseDistance(a, b);
    }
  
    private findFeaturesOnPath(start: Location, end: Location): AccessibilityFeature[] {
      return this.features.filter(feature => 
        this.isPointNearLine(feature.location, start, end, 20)
      );
    }
  
    private findObstaclesOnPath(start: Location, end: Location): AccessibilityObstacle[] {
      return this.obstacles.filter(obstacle =>
        this.isPointNearLine(obstacle.location, start, end, 20)
      );
    }
  
    private isPointNearLine(
      point: Location, 
      lineStart: Location, 
      lineEnd: Location, 
      threshold: number
    ): boolean {
      const d1 = this.calculateBaseDistance(point, lineStart);
      const d2 = this.calculateBaseDistance(point, lineEnd);
      const lineLength = this.calculateBaseDistance(lineStart, lineEnd);
  
      return (d1 + d2) < (lineLength + threshold);
    }
  
    private isLocationAccessible(
      location: Location, 
      preferences: AccessibilityPreferences
    ): boolean {
      const nearbyObstacles = this.obstacles.filter(obstacle => 
        this.calculateBaseDistance(location, obstacle.location) < 20
      );
  
      for (const obstacle of nearbyObstacles) {
        if (preferences.requiresWheelchairAccess && 
            (obstacle.type === 'stairs' || obstacle.type === 'narrow_path')) {
          return false;
        }
      }
  
      return true;
    }
  
    private reconstructPath(
      cameFrom: Map<string, Location>, 
      current: Location
    ): Location[] {
      const path = [current];
      let currentKey = this.locationToKey(current);
  
      while (cameFrom.has(currentKey)) {
        current = cameFrom.get(currentKey)!;
        currentKey = this.locationToKey(current);
        path.unshift(current);
      }
  
      return path;
    }
  }