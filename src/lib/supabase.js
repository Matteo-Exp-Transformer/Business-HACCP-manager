/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo file gestisce la CONFIGURAZIONE SUPABASE - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo file gestisce sincronizzazione cloud e persistenza dati
 * ⚠️ Coordina multi-tenancy e backup critici per compliance HACCP
 * 
 * @fileoverview Configurazione Supabase HACCP - Sistema Critico di Sincronizzazione
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Sincronizzazione e Backup
 * @version 1.0
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema for HACCP Manager
export const TABLES = {
  COMPANIES: 'companies',
  USERS: 'users',
  DEPARTMENTS: 'departments',
  CONSERVATION_POINTS: 'conservation_points',
  PRODUCTS: 'products',
  TASKS: 'tasks',
  TASK_COMPLETIONS: 'task_completions',
  TEMPERATURE_READINGS: 'temperature_readings',
  NON_CONFORMITIES: 'non_conformities',
  NOTES: 'notes',
  AUDIT_LOGS: 'audit_logs',
  EXPORTS: 'exports'
}

// Company data structure
export const createCompanyStructure = (companyId) => ({
  id: companyId,
  name: '',
  type: '', // 'pizzeria', 'ristorante', 'bar', etc.
  address: '',
  email: '',
  phone: '',
  vat_number: '',
  settings: {
    allow_photo_storage: true,
    max_users: 25,
    plan: 'free', // 'free', 'pro', 'enterprise'
    features: {
      inventory_sync: true,
      temperature_sync: true,
      staff_sync: true,
      label_sync: false // Only for paid plans
    }
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_sync: null
})

// User permission levels
export const USER_ROLES = {
  ADMIN: 'admin', // Full access to company data and settings
  MANAGER: 'manager', // Can manage operations and view reports
  EMPLOYEE: 'employee', // Can complete tasks and log data
  COLLABORATOR: 'collaborator' // Limited access for external staff
}

// Connection status
export const getConnectionStatus = () => {
  return navigator.onLine
}

// Initialize Supabase connection
export const initializeSupabase = async () => {
  try {
    // Test connection
    const { data, error } = await supabase.from(TABLES.COMPANIES).select('count').limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error)
      return false
    }
    
    console.log('✅ Supabase connected successfully')
    return true
  } catch (error) {
    console.error('❌ Supabase initialization error:', error)
    return false
  }
}

export default supabase
