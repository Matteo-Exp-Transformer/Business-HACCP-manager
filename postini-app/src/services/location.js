// Location Service for GPS tracking and nearby address detection
import * as Location from 'expo-location';

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.locationSubscription = null;
    this.watchPositionAsync = null;
  }

  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      return this.currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async startLocationTracking(callback) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      this.watchPositionAsync = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          this.currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          if (callback) {
            callback(this.currentLocation);
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  stopLocationTracking() {
    if (this.watchPositionAsync) {
      this.watchPositionAsync.remove();
      this.watchPositionAsync = null;
    }
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Find nearby addresses within specified radius (meters)
  findNearbyAddresses(addresses, radius = 500) {
    if (!this.currentLocation) return [];

    return addresses
      .map(address => {
        if (!address.latitude || !address.longitude) return null;
        
        const distance = this.calculateDistance(
          this.currentLocation.latitude,
          this.currentLocation.longitude,
          address.latitude,
          address.longitude
        );
        
        return { ...address, distance };
      })
      .filter(address => address && address.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  // Get formatted address string
  formatAddress(address) {
    const parts = [
      address.street,
      address.number,
      address.city,
      address.postalCode
    ].filter(Boolean);
    return parts.join(', ');
  }

  // Convert address to coordinates (mock implementation - would use geocoding service)
  async geocodeAddress(address) {
    // This would typically use a geocoding service like Google Maps API
    // For now, return random coordinates within Italy for testing
    return {
      latitude: 41.9028 + (Math.random() - 0.5) * 0.1,
      longitude: 12.4964 + (Math.random() - 0.5) * 0.1,
    };
  }

  // Calculate optimal route through multiple addresses
  calculateOptimalRoute(addresses) {
    if (!this.currentLocation || addresses.length === 0) return addresses;

    // Simple nearest neighbor algorithm for route optimization
    const unvisited = [...addresses];
    const route = [];
    let currentPos = this.currentLocation;

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      unvisited.forEach((address, index) => {
        if (!address.latitude || !address.longitude) return;
        
        const distance = this.calculateDistance(
          currentPos.latitude,
          currentPos.longitude,
          address.latitude,
          address.longitude
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      const nearestAddress = unvisited.splice(nearestIndex, 1)[0];
      route.push({ ...nearestAddress, distance: nearestDistance });
      currentPos = {
        latitude: nearestAddress.latitude,
        longitude: nearestAddress.longitude,
      };
    }

    return route;
  }
}

export default new LocationService();