// Login Screen for Postini App
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import AuthService from '../services/auth';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../constants/theme';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    if (AuthService.isAuthenticated()) {
      navigation.replace('Home');
    }
  }, []);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Errore', 'Inserisci un nome utente');
      return;
    }

    setLoading(true);
    try {
      await AuthService.login(username.trim());
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Errore', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickUsername) => {
    setLoading(true);
    try {
      await AuthService.login(quickUsername);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Errore', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>📮</Text>
            <Text style={styles.title}>Postini App</Text>
            <Text style={styles.subtitle}>Gestione Percorsi Postali</Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Nome Utente</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Inserisci il tuo nome utente"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <Button
              title={loading ? 'Accesso in corso...' : 'Accedi'}
              onPress={handleLogin}
              disabled={loading || !username.trim()}
              size="large"
              style={styles.loginButton}
            />
          </View>

          {/* Quick Login Options */}
          <View style={styles.quickLogin}>
            <Text style={styles.quickLoginTitle}>Accesso rapido per test:</Text>
            
            <Button
              title="👤 Postino (Utente)"
              onPress={() => handleQuickLogin('postino')}
              variant="secondary"
              disabled={loading}
              style={styles.quickButton}
            />
            
            <Button
              title="⚙️ Admin"
              onPress={() => handleQuickLogin('admin')}
              variant="outline"
              disabled={loading}
              style={styles.quickButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              App per la gestione ottimizzata dei percorsi postali
            </Text>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.title,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.buttonTint,
  },
  loginButton: {
    marginTop: SPACING.md,
  },
  quickLogin: {
    backgroundColor: COLORS.buttonTint,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.light,
  },
  quickLoginTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  quickButton: {
    marginBottom: SPACING.sm,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default LoginScreen;