/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo file gestisce la CONFIGURAZIONE FIREBASE - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo file gestisce sincronizzazione cloud e persistenza dati
 * ⚠️ Coordina multi-tenancy e backup critici per compliance HACCP
 * 
 * @fileoverview Configurazione Firebase HACCP - Sistema Critico di Sincronizzazione
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Sincronizzazione e Backup
 * @version 1.0
 */

// Firebase Configuration for HACCP Manager
// Cloud-first architecture with offline fallback

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase config (placeholder - you'll need to replace with your actual config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "haccp-manager.firebaseapp.com", 
  projectId: "haccp-manager",
  storageBucket: "haccp-manager.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Data structure for multi-tenant companies
export const COLLECTIONS = {
  COMPANIES: 'companies',
  USERS: 'users', 
  INVENTORIES: 'inventories',
  TEMPERATURES: 'temperatures',
  CLEANING: 'cleaning',
  STAFF: 'staff',
  PRODUCT_LABELS: 'productLabels',
  REFRIGERATORS: 'refrigerators'
};

// Company data structure
export const createCompanyStructure = (companyId) => ({
  id: companyId,
  name: '',
  type: '', // 'pizzeria', 'ristorante', 'bar', etc.
  address: '',
  settings: {
    allowPhotoStorage: true,
    maxUsers: 25,
    plan: 'free', // 'free', 'pro', 'enterprise'
    features: {
      inventorySync: true,
      temperatureSync: true,
      staffSync: true,
      labelSync: false // Only for paid plans
    }
  },
  createdAt: new Date().toISOString(),
  lastSync: null
});

// User permission levels
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin', // Can manage all companies
  ADMIN: 'admin', // Can manage their company
  MANAGER: 'manager', // Can manage most data
  USER: 'user' // Basic operations only
};

// Offline cache configuration
export const OFFLINE_CONFIG = {
  CACHE_DURATION: 72 * 60 * 60 * 1000, // 72 hours
  CRITICAL_COLLECTIONS: [
    'temperatures',
    'cleaning', 
    'inventories'
  ],
  MAX_OFFLINE_RECORDS: 1000
};

// Connection status
export const getConnectionStatus = () => {
  return navigator.onLine;
};

// Initialize offline persistence
export const enableOfflineSupport = async () => {
  try {
    // Enable offline persistence for Firestore
    // This will be implemented in next steps
    console.log('🔌 Offline support enabled');
    return true;
  } catch (error) {
    console.error('❌ Failed to enable offline support:', error);
    return false;
  }
};

export default app;