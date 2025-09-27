// Home Screen with route selection and main navigation
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import AuthService from '../services/auth';
import DatabaseService from '../services/database';
import LocationService from '../services/location';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../constants/theme';
import { ROUTE_TYPES } from '../types';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const initializeScreen = async () => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        navigation.replace('Login');
        return;
      }
      
      setUser(currentUser);
      
      // Initialize location tracking
      const hasPermission = await LocationService.requestPermissions();
      if (hasPermission) {
        const location = await LocationService.getCurrentLocation();
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('Error initializing home screen:', error);
      Alert.alert('Errore', 'Errore durante l\'inizializzazione');
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelection = (routeType) => {
    navigation.navigate('Map', { routeType });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: async () => {
            await AuthService.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Benvenuto, {user?.username}!
          </Text>
          <Text style={styles.roleText}>
            Ruolo: {user?.role === 'admin' ? 'Amministratore' : 'Postino'}
          </Text>
          {currentLocation && (
            <Text style={styles.locationText}>
              📍 GPS attivo
            </Text>
          )}
        </View>

        {/* Route Selection */}
        <View style={styles.routeSection}>
          <Text style={styles.sectionTitle}>Seleziona Percorso</Text>
          
          <Button
            title="🗺️ Percorso A"
            onPress={() => handleRouteSelection(ROUTE_TYPES.A)}
            size="large"
            style={styles.routeButton}
          />
          
          <Button
            title="🗺️ Percorso B"
            onPress={() => handleRouteSelection(ROUTE_TYPES.B)}
            variant="secondary"
            size="large"
            style={styles.routeButton}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Azioni Rapide</Text>
          
          <View style={styles.actionRow}>
            <Button
              title="📍 Indirizzi"
              onPress={() => navigation.navigate('Addresses')}
              variant="outline"
              style={styles.actionButton}
            />
            
            <Button
              title="🔍 Ricerca"
              onPress={() => navigation.navigate('Search')}
              variant="outline"
              style={styles.actionButton}
            />
          </View>

          <View style={styles.actionRow}>
            <Button
              title="📊 Statistiche"
              onPress={() => navigation.navigate('Statistics')}
              variant="ghost"
              style={styles.actionButton}
            />
            
            {user?.role === 'admin' && (
              <Button
                title="⚙️ Admin"
                onPress={() => navigation.navigate('Admin')}
                variant="ghost"
                style={styles.actionButton}
              />
            )}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <Button
            title="🚪 Esci"
            onPress={handleLogout}
            variant="outline"
            size="small"
          />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    backgroundColor: COLORS.buttonTint,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  welcomeText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  roleText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  locationText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
    fontWeight: '600',
  },
  routeSection: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  routeButton: {
    marginBottom: SPACING.md,
  },
  actionsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.light,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 0.48,
  },
  logoutSection: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
});

export default HomeScreen;