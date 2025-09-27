// Add Address Screen with manual input form
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import DatabaseService from '../services/database';
import LocationService from '../services/location';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../constants/theme';
import { createAddress, ROUTE_TYPES } from '../types';

const AddAddressScreen = ({ navigation, route }) => {
  const { routeType = ROUTE_TYPES.A } = route.params || {};
  
  const [formData, setFormData] = useState({
    street: '',
    number: '',
    city: '',
    postalCode: '',
    notes: '',
    routeType: routeType,
  });
  const [loading, setLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setUseCurrentLocation(true);
        Alert.alert(
          'Posizione Acquisita',
          `Lat: ${location.latitude.toFixed(6)}\nLon: ${location.longitude.toFixed(6)}`
        );
      } else {
        Alert.alert('Errore', 'Impossibile ottenere la posizione corrente');
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore durante l\'acquisizione della posizione');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.street.trim()) {
      Alert.alert('Errore', 'Il campo Via è obbligatorio');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Errore', 'Il campo Città è obbligatorio');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let coordinates = null;
      
      if (useCurrentLocation) {
        coordinates = await LocationService.getCurrentLocation();
      } else {
        // Try to geocode the address
        coordinates = await LocationService.geocodeAddress(formData);
      }

      const newAddress = createAddress({
        ...formData,
        latitude: coordinates?.latitude || null,
        longitude: coordinates?.longitude || null,
      });

      await DatabaseService.createAddress(newAddress);
      
      Alert.alert(
        'Successo',
        'Indirizzo aggiunto con successo!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Errore', 'Errore durante il salvataggio dell\'indirizzo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuovo Indirizzo</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            {/* Route Type Selection */}
            <Text style={styles.label}>Percorso</Text>
            <View style={styles.routeSelector}>
              <TouchableOpacity
                style={[
                  styles.routeOption,
                  formData.routeType === ROUTE_TYPES.A && styles.selectedRoute
                ]}
                onPress={() => handleInputChange('routeType', ROUTE_TYPES.A)}
              >
                <Text style={[
                  styles.routeText,
                  formData.routeType === ROUTE_TYPES.A && styles.selectedRouteText
                ]}>
                  Percorso A
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.routeOption,
                  formData.routeType === ROUTE_TYPES.B && styles.selectedRoute
                ]}
                onPress={() => handleInputChange('routeType', ROUTE_TYPES.B)}
              >
                <Text style={[
                  styles.routeText,
                  formData.routeType === ROUTE_TYPES.B && styles.selectedRouteText
                ]}>
                  Percorso B
                </Text>
              </TouchableOpacity>
            </View>

            {/* Address Fields */}
            <Text style={styles.label}>Via *</Text>
            <TextInput
              style={styles.input}
              value={formData.street}
              onChangeText={(value) => handleInputChange('street', value)}
              placeholder="es. Via Roma"
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.label}>Numero Civico</Text>
            <TextInput
              style={styles.input}
              value={formData.number}
              onChangeText={(value) => handleInputChange('number', value)}
              placeholder="es. 123"
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.label}>Città *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              placeholder="es. Roma"
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.label}>CAP</Text>
            <TextInput
              style={styles.input}
              value={formData.postalCode}
              onChangeText={(value) => handleInputChange('postalCode', value)}
              placeholder="es. 00100"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Note</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              placeholder="Note aggiuntive (es. citofono, istruzioni speciali)"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={3}
            />

            {/* Location Options */}
            <View style={styles.locationSection}>
              <Text style={styles.label}>Posizione</Text>
              <Button
                title={useCurrentLocation ? '📍 Posizione corrente acquisita' : '📍 Usa posizione corrente'}
                onPress={handleUseCurrentLocation}
                variant={useCurrentLocation ? 'secondary' : 'outline'}
                disabled={loading}
                style={styles.locationButton}
              />
            </View>

            {/* Save Button */}
            <Button
              title={loading ? 'Salvataggio...' : 'Salva Indirizzo'}
              onPress={handleSave}
              disabled={loading || !formData.street.trim() || !formData.city.trim()}
              size="large"
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  form: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.medium,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.buttonTint,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  routeSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  routeOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.buttonTint,
    alignItems: 'center',
  },
  selectedRoute: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  routeText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  selectedRouteText: {
    color: COLORS.secondary,
  },
  locationSection: {
    marginTop: SPACING.md,
  },
  locationButton: {
    marginTop: SPACING.sm,
  },
  saveButton: {
    marginTop: SPACING.xl,
  },
});

export default AddAddressScreen;