// Statistics Screen for tracking delivery metrics
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import DatabaseService from '../services/database';
import AuthService from '../services/auth';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../constants/theme';
import { createStatistics, ROUTE_TYPES } from '../types';

const StatisticsScreen = ({ navigation }) => {
  const [todayStats, setTodayStats] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(ROUTE_TYPES.A);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    loadTodayStats();
    loadAddresses();
  }, [selectedRoute]);

  const loadTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stats = await DatabaseService.getStatisticsByDate(today);
      const routeStats = stats.find(s => s.routeType === selectedRoute);
      setTodayStats(routeStats);
      
      // Check if tracking is active
      if (routeStats && routeStats.startTime && !routeStats.endTime) {
        setIsTracking(true);
        setStartTime(new Date(routeStats.startTime));
      }
    } catch (error) {
      console.error('Error loading today stats:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      const routeAddresses = await DatabaseService.getAddressesByRoute(selectedRoute);
      setAddresses(routeAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleStartTracking = async () => {
    try {
      const user = AuthService.getCurrentUser();
      const now = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0];

      const newStats = createStatistics({
        date: today,
        startTime: now,
        routeType: selectedRoute,
        userId: user?.id,
      });

      await DatabaseService.createStatistics(newStats);
      setIsTracking(true);
      setStartTime(new Date(now));
      
      Alert.alert('Tracking Avviato', 'Il monitoraggio del percorso è iniziato!');
    } catch (error) {
      console.error('Error starting tracking:', error);
      Alert.alert('Errore', 'Errore durante l\'avvio del tracking');
    }
  };

  const handleStopTracking = async () => {
    if (!todayStats) return;

    try {
      const endTime = new Date().toISOString();
      const completedAddresses = addresses.filter(addr => addr.isCompleted);
      
      // Mock distance calculation (in a real app, you'd track actual GPS distance)
      const mockDistance = completedAddresses.length * 0.5; // 500m per address average

      await DatabaseService.updateStatistics(todayStats.id, {
        endTime,
        totalStops: completedAddresses.length,
        totalDistance: mockDistance,
      });

      setIsTracking(false);
      await loadTodayStats();
      
      Alert.alert(
        'Tracking Completato',
        `Percorso terminato!\nFermate: ${completedAddresses.length}\nDistanza: ${mockDistance.toFixed(2)} km`
      );
    } catch (error) {
      console.error('Error stopping tracking:', error);
      Alert.alert('Errore', 'Errore durante l\'arresto del tracking');
    }
  };

  const formatDuration = (startTime, endTime = null) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getCompletionStats = () => {
    const completed = addresses.filter(addr => addr.isCompleted).length;
    const total = addresses.length;
    const percentage = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
    return { completed, total, percentage };
  };

  const stats = getCompletionStats();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistiche</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Route Selection */}
        <View style={styles.routeSelector}>
          <Button
            title="Percorso A"
            onPress={() => setSelectedRoute(ROUTE_TYPES.A)}
            variant={selectedRoute === ROUTE_TYPES.A ? 'primary' : 'outline'}
            size="small"
            style={styles.routeButton}
          />
          <Button
            title="Percorso B"
            onPress={() => setSelectedRoute(ROUTE_TYPES.B)}
            variant={selectedRoute === ROUTE_TYPES.B ? 'primary' : 'outline'}
            size="small"
            style={styles.routeButton}
          />
        </View>

        {/* Tracking Controls */}
        <View style={styles.trackingCard}>
          <Text style={styles.cardTitle}>🎯 Tracking Percorso {selectedRoute}</Text>
          
          {!isTracking ? (
            <Button
              title="▶️ Inizia Tracking"
              onPress={handleStartTracking}
              size="large"
              style={styles.trackingButton}
            />
          ) : (
            <View>
              <Text style={styles.trackingStatus}>
                ⏱️ Tracking attivo da: {formatDuration(startTime)}
              </Text>
              <Button
                title="⏹️ Termina Tracking"
                onPress={handleStopTracking}
                variant="secondary"
                size="large"
                style={styles.trackingButton}
              />
            </View>
          )}
        </View>

        {/* Current Session Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>📊 Sessione Corrente</Text>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completati</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Totali</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.percentage}%</Text>
              <Text style={styles.statLabel}>Progresso</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${stats.percentage}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Today's Stats */}
        {todayStats && (
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>📈 Statistiche Odierne</Text>
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {todayStats.endTime ? formatDuration(todayStats.startTime, todayStats.endTime) : 'In corso'}
                </Text>
                <Text style={styles.statLabel}>Durata</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{todayStats.totalStops || 0}</Text>
                <Text style={styles.statLabel}>Fermate</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {(todayStats.totalDistance || 0).toFixed(1)} km
                </Text>
                <Text style={styles.statLabel}>Distanza</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>🚀 Azioni Rapide</Text>
          
          <Button
            title="🗺️ Vai alla Mappa"
            onPress={() => navigation.navigate('Map', { routeType: selectedRoute })}
            variant="secondary"
            style={styles.actionButton}
          />
          
          <Button
            title="📋 Gestisci Indirizzi"
            onPress={() => navigation.navigate('Addresses')}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  routeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  routeButton: {
    flex: 0.4,
  },
  trackingCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  statsCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  actionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  trackingButton: {
    marginTop: SPACING.md,
  },
  trackingStatus: {
    fontSize: FONTS.sizes.md,
    color: COLORS.info,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: SPACING.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.sm,
  },
  actionButton: {
    marginBottom: SPACING.md,
  },
});

export default StatisticsScreen;