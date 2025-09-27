// Map Screen with full-screen map, GPS tracking and nearby addresses
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import Button from '../components/Button';
import LocationService from '../services/location';
import DatabaseService from '../services/database';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation, route }) => {
  const { routeType } = route.params;
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [nearbyAddresses, setNearbyAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    initializeMap();
    return () => {
      LocationService.stopLocationTracking();
    };
  }, []);

  useEffect(() => {
    if (currentLocation && addresses.length > 0) {
      updateNearbyAddresses();
    }
  }, [currentLocation, addresses]);

  const initializeMap = async () => {
    try {
      setLoading(true);
      
      // Load addresses for the selected route
      const routeAddresses = await DatabaseService.getAddressesByRoute(routeType);
      setAddresses(routeAddresses);

      // Start location tracking
      const hasPermission = await LocationService.requestPermissions();
      if (hasPermission) {
        const location = await LocationService.getCurrentLocation();
        setCurrentLocation(location);

        // Start real-time tracking
        LocationService.startLocationTracking((newLocation) => {
          setCurrentLocation(newLocation);
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      Alert.alert('Errore', 'Errore durante l\'inizializzazione della mappa');
    } finally {
      setLoading(false);
    }
  };

  const updateNearbyAddresses = () => {
    const nearby = LocationService.findNearbyAddresses(addresses, 500); // 500 meters radius
    setNearbyAddresses(nearby);
  };

  const handleMapPress = () => {
    setShowSearchOptions(!showSearchOptions);
    
    Animated.timing(slideAnim, {
      toValue: showSearchOptions ? -100 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleMarkComplete = async (addressId) => {
    try {
      await DatabaseService.updateAddress(addressId, {
        isCompleted: true,
        completedAt: new Date().toISOString(),
      });
      
      // Refresh addresses
      const updatedAddresses = await DatabaseService.getAddressesByRoute(routeType);
      setAddresses(updatedAddresses);
      
      Alert.alert('Successo', 'Indirizzo completato!');
    } catch (error) {
      console.error('Error marking address as complete:', error);
      Alert.alert('Errore', 'Errore durante l\'aggiornamento');
    }
  };

  const getMarkerColor = (address) => {
    if (address.isCompleted) return '#28A745'; // Green for completed
    if (nearbyAddresses.some(nearby => nearby.id === address.id)) {
      return '#FF6B6B'; // Red for nearby
    }
    return '#FFD800'; // Yellow for regular
  };

  const centerMapOnUser = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const optimizeRoute = () => {
    const incompleteAddresses = addresses.filter(addr => !addr.isCompleted && addr.latitude && addr.longitude);
    const optimizedRoute = LocationService.calculateOptimalRoute(incompleteAddresses);
    
    Alert.alert(
      'Percorso Ottimizzato',
      `Percorso calcolato per ${optimizedRoute.length} indirizzi`,
      [
        { text: 'OK', onPress: () => setShowSearchOptions(false) }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento mappa...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full Screen Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={true}
        showsMyLocationButton={false}
        followsUserLocation={true}
        initialRegion={{
          latitude: currentLocation?.latitude || 41.9028,
          longitude: currentLocation?.longitude || 12.4964,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
      >
        {/* Address Markers */}
        {addresses
          .filter(addr => addr.latitude && addr.longitude)
          .map(address => (
            <Marker
              key={address.id}
              coordinate={{
                latitude: address.latitude,
                longitude: address.longitude,
              }}
              pinColor={getMarkerColor(address)}
              title={`${address.street} ${address.number || ''}`}
              description={address.notes || address.city}
              onCalloutPress={() => {
                Alert.alert(
                  'Azione',
                  `Cosa vuoi fare con questo indirizzo?`,
                  [
                    { text: 'Annulla', style: 'cancel' },
                    { 
                      text: 'Completa', 
                      onPress: () => handleMarkComplete(address.id),
                      style: address.isCompleted ? 'default' : 'destructive'
                    },
                    { 
                      text: 'Note', 
                      onPress: () => navigation.navigate('AddressDetail', { address })
                    },
                  ]
                );
              }}
            />
          ))}
      </MapView>

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Percorso {routeType}</Text>
          <TouchableOpacity onPress={centerMapOnUser}>
            <Text style={styles.centerButton}>📍</Text>
          </TouchableOpacity>
        </View>
        
        {/* Nearby Addresses Counter */}
        <View style={styles.nearbyCounter}>
          <Text style={styles.nearbyText}>
            {nearbyAddresses.length} indirizzi vicini
          </Text>
        </View>
      </SafeAreaView>

      {/* Search Options Panel */}
      <Animated.View 
        style={[
          styles.searchPanel,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Text style={styles.searchTitle}>Opzioni Ricerca</Text>
        
        <View style={styles.searchActions}>
          <Button
            title="🔍 Ricerca"
            onPress={() => {
              setShowSearchOptions(false);
              navigation.navigate('Search');
            }}
            variant="secondary"
            size="small"
            style={styles.searchButton}
          />
          
          <Button
            title="➕ Aggiungi"
            onPress={() => {
              setShowSearchOptions(false);
              navigation.navigate('AddAddress', { routeType });
            }}
            variant="outline"
            size="small"
            style={styles.searchButton}
          />
          
          <Button
            title="🎯 Ottimizza"
            onPress={optimizeRoute}
            variant="ghost"
            size="small"
            style={styles.searchButton}
          />
        </View>
      </Animated.View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('Addresses')}
        >
          <Text style={styles.fabText}>📋</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('Statistics')}
        >
          <Text style={styles.fabText}>📊</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.secondary,
  },
  map: {
    width: width,
    height: height,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.buttonTint,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  backButton: {
    fontSize: 24,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  centerButton: {
    fontSize: 20,
  },
  nearbyCounter: {
    backgroundColor: COLORS.info,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignSelf: 'center',
  },
  nearbyText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  searchPanel: {
    position: 'absolute',
    top: 140,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.heavy,
  },
  searchTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  searchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchButton: {
    flex: 0.3,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
  },
  fab: {
    backgroundColor: COLORS.buttonTint,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  fabText: {
    fontSize: 20,
  },
});

export default MapScreen;