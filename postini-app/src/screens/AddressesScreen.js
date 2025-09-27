// Addresses management screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import DatabaseService from '../services/database';
import LocationService from '../services/location';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../constants/theme';
import { ROUTE_TYPES } from '../types';

const AddressesScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(ROUTE_TYPES.A);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, [selectedRoute]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const routeAddresses = await DatabaseService.getAddressesByRoute(selectedRoute);
      setAddresses(routeAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Errore', 'Errore durante il caricamento degli indirizzi');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  };

  const handleToggleComplete = async (address) => {
    try {
      await DatabaseService.updateAddress(address.id, {
        isCompleted: !address.isCompleted,
        completedAt: !address.isCompleted ? new Date().toISOString() : null,
      });
      await loadAddresses();
    } catch (error) {
      console.error('Error toggling address completion:', error);
      Alert.alert('Errore', 'Errore durante l\'aggiornamento');
    }
  };

  const handleDeleteAddress = (address) => {
    Alert.alert(
      'Conferma Eliminazione',
      `Vuoi eliminare l'indirizzo "${address.street} ${address.number || ''}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              // Note: We would need a delete method in DatabaseService
              Alert.alert('Info', 'Funzione di eliminazione da implementare');
            } catch (error) {
              Alert.alert('Errore', 'Errore durante l\'eliminazione');
            }
          },
        },
      ]
    );
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
        <Text style={styles.routeType}>
          {address.routeType}
        </Text>
      </View>
      
      <Text style={[styles.addressCity, address.isCompleted && styles.completedText]}>
        {address.city} {address.postalCode || ''}
      </Text>
      
      {address.notes && (
        <Text style={[styles.addressNotes, address.isCompleted && styles.completedText]}>
          📝 {address.notes}
        </Text>
      )}
      
      <View style={styles.addressActions}>
        <TouchableOpacity
          style={[
            styles.statusButton,
            address.isCompleted ? styles.completedButton : styles.pendingButton
          ]}
          onPress={() => handleToggleComplete(address)}
        >
          <Text style={styles.statusButtonText}>
            {address.isCompleted ? '✓ Completato' : '○ Da completare'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAddress(address)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Indirizzi</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddAddress')}>
          <Text style={styles.addButton}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* Route Filter */}
      <View style={styles.filterContainer}>
        <Button
          title="Percorso A"
          onPress={() => setSelectedRoute(ROUTE_TYPES.A)}
          variant={selectedRoute === ROUTE_TYPES.A ? 'primary' : 'outline'}
          size="small"
          style={styles.filterButton}
        />
        <Button
          title="Percorso B"
          onPress={() => setSelectedRoute(ROUTE_TYPES.B)}
          variant={selectedRoute === ROUTE_TYPES.B ? 'primary' : 'outline'}
          size="small"
          style={styles.filterButton}
        />
      </View>

      {/* Addresses List */}
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAddressItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              📭 Nessun indirizzo nel percorso {selectedRoute}
            </Text>
            <Button
              title="Aggiungi primo indirizzo"
              onPress={() => navigation.navigate('AddAddress', { routeType: selectedRoute })}
              variant="secondary"
              style={styles.emptyButton}
            />
          </View>
        }
      />

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Totale: {addresses.length} indirizzi | 
          Completati: {addresses.filter(a => a.isCompleted).length}
        </Text>
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
  addButton: {
    fontSize: 20,
    color: COLORS.secondary,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  filterButton: {
    flex: 0.4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
  addressItem: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  completedItem: {
    backgroundColor: COLORS.surface,
    opacity: 0.8,
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
  routeType: {
    backgroundColor: COLORS.primary,
    color: COLORS.secondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  addressCity: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  addressNotes: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.info,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  completedButton: {
    backgroundColor: COLORS.success,
  },
  pendingButton: {
    backgroundColor: COLORS.warning,
  },
  statusButtonText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    padding: SPACING.sm,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  summary: {
    backgroundColor: COLORS.buttonTint,
    padding: SPACING.md,
    ...SHADOWS.light,
  },
  summaryText: {
    textAlign: 'center',
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    marginTop: SPACING.md,
  },
});

export default AddressesScreen;