// Main App component with navigation setup
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';

// Services
import DatabaseService from './src/services/database';
import AuthService from './src/services/auth';
import OfflineService from './src/services/offline';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import AddressesScreen from './src/screens/AddressesScreen';
import AddAddressScreen from './src/screens/AddAddressScreen';
import SearchScreen from './src/screens/SearchScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';

// Theme
import { COLORS } from './src/constants/theme';

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await DatabaseService.init();
      console.log('Database initialized');

      // Initialize auth service
      await AuthService.init();
      console.log('Auth service initialized');

      // Initialize offline service with sample data
      await OfflineService.init();
      console.log('Offline service initialized');

      // Check if user is already logged in
      if (AuthService.isAuthenticated()) {
        setInitialRoute('Home');
      }

      setIsReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsReady(true); // Continue anyway
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>📮</Text>
        <Text style={styles.loadingSubtext}>Inizializzazione...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor={COLORS.primary} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: COLORS.primary },
            animationEnabled: true,
            animationTypeForReplace: 'push',
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              animationEnabled: false,
            }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="Map" 
            component={MapScreen}
            options={{
              presentation: 'fullScreenModal',
            }}
          />
          <Stack.Screen 
            name="Addresses" 
            component={AddressesScreen}
          />
          <Stack.Screen 
            name="AddAddress" 
            component={AddAddressScreen}
          />
          <Stack.Screen 
            name="Search" 
            component={SearchScreen}
          />
          <Stack.Screen 
            name="Statistics" 
            component={StatisticsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingSubtext: {
    fontSize: 18,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});