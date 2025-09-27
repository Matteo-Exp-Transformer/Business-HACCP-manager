// Search Screen for finding addresses and calculating optimal routes
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import DatabaseService from '../services/database';
import LocationService from '../services/location';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../constants/theme';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allAddresses, setAllAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nearbyAddresses, setNearbyAddresses] = useState([]);

  useEffect(() => {
    loadAllAddresses();
    loadNearbyAddresses();
  }, []);

  const loadAllAddresses = async () => {
    try {
      const addresses = await DatabaseService.getAllAddresses();
      setAllAddresses(addresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const loadNearbyAddresses = async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        const addresses = await DatabaseService.getAllAddresses();
        const nearby = LocationService.findNearbyAddresses(addresses, 1000); // 1km radius
        setNearbyAddresses(nearby);
      }
    } catch (error) {
      console.error('Error loading nearby addresses:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await DatabaseService.searchAddresses(searchQuery.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching addresses:', error);
      Alert.alert('Errore', 'Errore durante la ricerca');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeRoute = () => {
    if (searchResults.length === 0) {
      Alert.alert('Info', 'Effettua prima una ricerca per ottimizzare il percorso');
      return;
    }

    const incompleteAddresses = searchResults.filter(addr => !addr.isCompleted);
    if (incompleteAddresses.length === 0) {
      Alert.alert('Info', 'Tutti gli indirizzi trovati sono già completati');
      return;
    }

    const optimizedRoute = LocationService.calculateOptimalRoute(incompleteAddresses);
    
    Alert.alert(
      'Percorso Ottimizzato',
      `Percorso calcolato per ${optimizedRoute.length} indirizzi.\nDistanza totale stimata: ${calculateTotalDistance(optimizedRoute)} km`,
      [
        { text: 'OK' },
        { 
          text: 'Vai alla Mappa', 
          onPress: () => navigation.navigate('Map', { routeType: optimizedRoute[0]?.routeType || 'A' })
        }
      ]
    );
  };

  const calculateTotalDistance = (route) => {
    const totalMeters = route.reduce((total, address) => total + (address.distance || 0), 0);
    return (totalMeters / 1000).toFixed(2);
  };

  const renderAddressItem = ({ item: address }) => (
    <TouchableOpacity
      style={[
        styles.addressItem,
        address.isCompleted && styles.completedItem
      ]}
      onPress={() => navigation.navigate('AddressDetail', { address })}
    >
      <View style={styles.addressHeader}>
        <Text style={[styles.addressTitle, address.isCompleted && styles.completedText]}>
          {address.street} {address.number || ''}
        </Text>
        <View style={styles.addressBadges}>
          <Text style={styles.routeBadge}>{address.routeType}</Text>
          {address.distance && (
            <Text style={styles.distanceBadge}>
              {(address.distance / 1000).toFixed(2)} km
            </Text>
          )}
        </View>
      </View>
      
      <Text style={[styles.addressCity, address.isCompleted && styles.completedText]}>
        {address.city}
      </Text>
      
      {address.notes && (
        <Text style={[styles.addressNotes, address.isCompleted && styles.completedText]}>
          📝 {address.notes}
        </Text>
      )}
      
      <Text style={styles.statusText}>
        {address.isCompleted ? '✅ Completato' : '⏳ Da completare'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ricerca Indirizzi</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cerca per via, città o note..."
          placeholderTextColor={COLORS.textSecondary}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Button
          title="🔍"
          onPress={handleSearch}
          disabled={loading}
          size="small"
          style={styles.searchButton}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="🎯 Ottimizza Percorso"
          onPress={handleOptimizeRoute}
          variant="secondary"
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="📍 Vicini a me"
          onPress={() => setSearchResults(nearbyAddresses)}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
      </View>

      {/* Results */}
      <View style={styles.resultsContainer}>
        {searchQuery && (
          <Text style={styles.resultsHeader}>
            {loading ? 'Ricerca in corso...' : `${searchResults.length} risultati per "${searchQuery}"`}
          </Text>
        )}
        
        {!searchQuery && nearbyAddresses.length > 0 && (
          <View style={styles.nearbySection}>
            <Text style={styles.nearbyTitle}>📍 Indirizzi vicini (entro 1 km)</Text>
            <FlatList
              data={nearbyAddresses.slice(0, 3)}
              keyExtractor={(item) => `nearby-${item.id}`}
              renderItem={renderAddressItem}
              scrollEnabled={false}
            />
            {nearbyAddresses.length > 3 && (
              <Button
                title={`Vedi tutti i ${nearbyAddresses.length} indirizzi vicini`}
                onPress={() => setSearchResults(nearbyAddresses)}
                variant="ghost"
                size="small"
              />
            )}
          </View>
        )}

        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAddressItem}
          style={styles.resultsList}
          ListEmptyComponent={
            searchQuery && !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  🔍 Nessun risultato trovato
                </Text>
                <Text style={styles.emptySubtext}>
                  Prova con termini di ricerca diversi
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.buttonTint,
    padding: SPACING.lg,
    ...SHADOWS.light,
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
  searchContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.buttonTint,
  },
  searchButton: {
    paddingHorizontal: SPACING.lg,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  resultsHeader: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.secondary,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  nearbySection: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  nearbyTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.info,
    marginBottom: SPACING.md,
  },
  resultsList: {
    flex: 1,
  },
  addressItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    ...SHADOWS.light,
  },
  completedItem: {
    opacity: 0.7,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  addressTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  addressBadges: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  routeBadge: {
    backgroundColor: COLORS.primary,
    color: COLORS.secondary,
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  distanceBadge: {
    backgroundColor: COLORS.info,
    color: COLORS.background,
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  addressCity: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  addressNotes: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.info,
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  statusText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default SearchScreen;