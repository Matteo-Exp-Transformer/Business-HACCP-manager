// Offline Service for data caching and sync management
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from './database';
import { createAddress, createPOI } from '../types';

class OfflineService {
  constructor() {
    this.isOnline = true;
    this.pendingSync = [];
  }

  async init() {
    try {
      await this.loadPendingSync();
      await this.preloadSampleData();
      console.log('Offline service initialized');
    } catch (error) {
      console.error('Error initializing offline service:', error);
    }
  }

  async preloadSampleData() {
    try {
      // Check if sample data already exists
      const addresses = await DatabaseService.getAllAddresses();
      if (addresses.length > 0) return;

      // Create sample addresses for testing
      const sampleAddresses = [
        createAddress({
          street: 'Via Roma',
          number: '10',
          city: 'Roma',
          postalCode: '00100',
          latitude: 41.9028,
          longitude: 12.4964,
          notes: 'Appartamento 3°piano, citofono Rossi',
          routeType: 'A',
        }),
        createAddress({
          street: 'Via Milano',
          number: '25',
          city: 'Roma',
          postalCode: '00100',
          latitude: 41.9048,
          longitude: 12.4984,
          notes: 'Negozio al piano terra',
          routeType: 'A',
        }),
        createAddress({
          street: 'Via Napoli',
          number: '15',
          city: 'Roma',
          postalCode: '00100',
          latitude: 41.9008,
          longitude: 12.4944,
          notes: 'Consegna solo mattino',
          routeType: 'B',
        }),
        createAddress({
          street: 'Via Firenze',
          number: '42',
          city: 'Roma',
          postalCode: '00100',
          latitude: 41.9068,
          longitude: 12.5004,
          routeType: 'B',
        }),
        createAddress({
          street: 'Via Torino',
          number: '8',
          city: 'Roma',
          postalCode: '00100',
          latitude: 41.8988,
          longitude: 12.4924,
          notes: 'Suonare forte, citofono rotto',
          routeType: 'A',
        }),
      ];

      for (const address of sampleAddresses) {
        await DatabaseService.createAddress(address);
      }

      // Create sample POIs
      const samplePOIs = [
        createPOI({
          name: 'Benzinaio ENI',
          type: 'benzinaio',
          latitude: 41.9020,
          longitude: 12.4970,
          address: 'Via del Corso, 100',
        }),
        createPOI({
          name: 'Alimentari da Mario',
          type: 'alimentari',
          latitude: 41.9040,
          longitude: 12.4990,
          address: 'Via Milano, 30',
        }),
        createPOI({
          name: 'Tabaccheria Centrale',
          type: 'negozi',
          latitude: 41.9010,
          longitude: 12.4950,
          address: 'Piazza Venezia, 5',
        }),
      ];

      for (const poi of samplePOIs) {
        await DatabaseService.createPOI(poi);
      }

      console.log('Sample data loaded successfully');
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  }

  async cacheRouteData(routeType) {
    try {
      const addresses = await DatabaseService.getAddressesByRoute(routeType);
      const pois = await DatabaseService.getAllPOIs();
      
      const cacheData = {
        addresses,
        pois,
        timestamp: new Date().toISOString(),
        routeType,
      };

      await AsyncStorage.setItem(`cache_route_${routeType}`, JSON.stringify(cacheData));
      console.log(`Route ${routeType} data cached successfully`);
    } catch (error) {
      console.error('Error caching route data:', error);
    }
  }

  async getCachedRouteData(routeType) {
    try {
      const cachedData = await AsyncStorage.getItem(`cache_route_${routeType}`);
      if (cachedData) {
        const data = JSON.parse(cachedData);
        const cacheAge = new Date() - new Date(data.timestamp);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (cacheAge < maxAge) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached route data:', error);
      return null;
    }
  }

  async addPendingSync(action) {
    try {
      this.pendingSync.push({
        id: Date.now().toString(),
        action,
        timestamp: new Date().toISOString(),
      });
      await this.savePendingSync();
    } catch (error) {
      console.error('Error adding pending sync:', error);
    }
  }

  async loadPendingSync() {
    try {
      const pendingData = await AsyncStorage.getItem('pendingSync');
      if (pendingData) {
        this.pendingSync = JSON.parse(pendingData);
      }
    } catch (error) {
      console.error('Error loading pending sync:', error);
      this.pendingSync = [];
    }
  }

  async savePendingSync() {
    try {
      await AsyncStorage.setItem('pendingSync', JSON.stringify(this.pendingSync));
    } catch (error) {
      console.error('Error saving pending sync:', error);
    }
  }

  async clearPendingSync() {
    try {
      this.pendingSync = [];
      await AsyncStorage.removeItem('pendingSync');
    } catch (error) {
      console.error('Error clearing pending sync:', error);
    }
  }

  async exportData() {
    try {
      const addresses = await DatabaseService.getAllAddresses();
      const users = await DatabaseService.getAllUsers();
      const today = new Date().toISOString().split('T')[0];
      const stats = await DatabaseService.getStatisticsByDate(today);
      
      const exportData = {
        addresses,
        users,
        statistics: stats,
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      // Import addresses
      if (data.addresses) {
        for (const address of data.addresses) {
          await DatabaseService.createAddress(address);
        }
      }

      // Import POIs
      if (data.pois) {
        for (const poi of data.pois) {
          await DatabaseService.createPOI(poi);
        }
      }

      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  setOnlineStatus(isOnline) {
    this.isOnline = isOnline;
    if (isOnline && this.pendingSync.length > 0) {
      this.processPendingSync();
    }
  }

  async processPendingSync() {
    // This would sync with a remote server when available
    console.log('Processing pending sync actions:', this.pendingSync.length);
    
    // For now, just clear pending sync as we're working locally
    await this.clearPendingSync();
  }

  isOfflineMode() {
    return !this.isOnline;
  }

  getPendingSyncCount() {
    return this.pendingSync.length;
  }
}

export default new OfflineService();