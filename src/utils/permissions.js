/**
 * Permissions System - Sistema di permessi e ruoli HACCP
 * 
 * Questo file definisce:
 * 1. Modello di permessi basato su capacità
 * 2. Mapping ruoli → permessi
 * 3. Controlli di accesso per funzionalità critiche
 * 4. Messaggi educativi per l'utente
 * 
 * @version 1.0
 * @critical Sicurezza - Controllo accessi e permessi
 */

// Definizione delle capacità del sistema
export const CAPABILITIES = {
  // Gestione completa dell'applicazione
  MANAGE_APP: 'manage_app',
  
  // Gestione punti di conservazione (frigoriferi, temperature)
  MANAGE_CONSERVATION_POINTS: 'manage_conservation_points',
  
  // Gestione mansioni e attività
  MANAGE_TASKS: 'manage_tasks',
  
  // Utilizzo funzionalità core (inventario, temperature, mansioni)
  USE_CORE: 'use_core',
  
  // Visualizzazione struttura organizzativa (solo lettura)
  VIEW_ORG: 'view_org'
}

// Mapping ruoli → capacità
export const ROLE_PERMISSIONS = {
  'amministratore': [
    CAPABILITIES.MANAGE_APP,
    CAPABILITIES.MANAGE_CONSERVATION_POINTS,
    CAPABILITIES.MANAGE_TASKS,
    CAPABILITIES.USE_CORE,
    CAPABILITIES.VIEW_ORG
  ],
  
  'responsabile': [
    CAPABILITIES.MANAGE_CONSERVATION_POINTS,
    CAPABILITIES.MANAGE_TASKS,
    CAPABILITIES.USE_CORE,
    CAPABILITIES.VIEW_ORG
  ],
  
  'dipendente': [
    CAPABILITIES.USE_CORE,
    CAPABILITIES.VIEW_ORG
  ],
  
  'collaboratore': [
    CAPABILITIES.USE_CORE,
    CAPABILITIES.VIEW_ORG
  ]
}

// Ruoli disponibili nel sistema
export const AVAILABLE_ROLES = [
  {
    key: 'amministratore',
    name: 'Amministratore',
    description: 'Accesso completo a tutte le funzionalità',
    capabilities: ROLE_PERMISSIONS.amministratore,
    whyMatters: 'Gestisce la configurazione completa del sistema HACCP e ha responsabilità di compliance'
  },
  {
    key: 'responsabile',
    name: 'Responsabile',
    description: 'Gestisce punti di conservazione e mansioni',
    capabilities: ROLE_PERMISSIONS.responsabile,
    whyMatters: 'Coordina le attività operative e garantisce la conformità HACCP quotidiana'
  },
  {
    key: 'dipendente',
    name: 'Dipendente',
    description: 'Utilizza le funzionalità core del sistema',
    capabilities: ROLE_PERMISSIONS.dipendente,
    whyMatters: 'Esegue le attività operative e registra i dati per la tracciabilità HACCP'
  },
  {
    key: 'collaboratore',
    name: 'Collaboratore Occasionale',
    description: 'Accesso limitato alle funzionalità essenziali',
    capabilities: ROLE_PERMISSIONS.collaboratore,
    whyMatters: 'Supporta le attività operative con accesso controllato per la sicurezza'
  }
]

// Funzione per verificare se un ruolo ha una specifica capacità
export const hasCapability = (role, capability) => {
  if (!role || !ROLE_PERMISSIONS[role]) {
    return false
  }
  
  return ROLE_PERMISSIONS[role].includes(capability)
}

// Funzione per ottenere tutte le capacità di un ruolo
export const getRoleCapabilities = (role) => {
  return ROLE_PERMISSIONS[role] || []
}

// Funzione per ottenere il ruolo predefinito
export const getDefaultRole = () => 'dipendente'

// Funzione per verificare se un ruolo può essere modificato
export const canModifyRole = (currentUserRole, targetRole) => {
  // Solo amministratori possono modificare ruoli
  if (currentUserRole !== 'amministratore') {
    return false
  }
  
  // Non si può modificare il proprio ruolo
  if (currentUserRole === targetRole) {
    return false
  }
  
  return true
}

// Funzione per ottenere i permessi di un utente
export const getUserPermissions = (user) => {
  if (!user || !user.role) {
    return []
  }
  
  return getRoleCapabilities(user.role)
}

// Funzione per verificare se un utente può accedere a una sezione
export const canAccessSection = (user, section) => {
  const permissions = getUserPermissions(user)
  
  // Mappatura sezioni → capacità richieste
  // Note: i nomi delle sezioni sono mantenuti per compatibilità interna
  // UI mostra: Home, Punti di Conservazione, Attività e Mansioni, Inventario, Gestione Etichette, IA Assistant, Impostazioni e Dati, Gestione
  const sectionRequirements = {
    'dashboard': [CAPABILITIES.VIEW_ORG],           // ex Dashboard → Home
    'refrigerators': [CAPABILITIES.USE_CORE],       // ex Frigoriferi → Punti di Conservazione
    'cleaning': [CAPABILITIES.USE_CORE],            // ex Cleaning → Attività e Mansioni
    'inventory': [CAPABILITIES.USE_CORE],           // ex Inventory → Inventario
    'labels': [CAPABILITIES.USE_CORE],              // ex ProductLabels → Gestione Etichette
    'ai-assistant': [CAPABILITIES.USE_CORE],        // ex AIAssistant → IA Assistant
    'data-settings': [CAPABILITIES.MANAGE_APP],     // ex DataSettings → Impostazioni e Dati
    'staff': [CAPABILITIES.MANAGE_APP]              // ex Staff → Gestione
  }
  
  const requiredCapabilities = sectionRequirements[section] || []
  
  return requiredCapabilities.every(capability => 
    permissions.includes(capability)
  )
}

// Funzione per ottenere messaggio educativo sui permessi
export const getPermissionMessage = (capability) => {
  const messages = {
    [CAPABILITIES.MANAGE_APP]: 'Gestisce tutte le configurazioni del sistema HACCP',
    [CAPABILITIES.MANAGE_CONSERVATION_POINTS]: 'Configura frigoriferi e range temperature',
    [CAPABILITIES.MANAGE_TASKS]: 'Assegna e gestisce mansioni del personale',
    [CAPABILITIES.USE_CORE]: 'Utilizza le funzionalità operative quotidiane',
    [CAPABILITIES.VIEW_ORG]: 'Visualizza la struttura organizzativa'
  }
  
  return messages[capability] || 'Capacità non definita'
}

// Funzione per ottenere suggerimenti di upgrade ruolo
export const getRoleUpgradeSuggestions = (currentRole, requiredCapability) => {
  const suggestions = {
    'collaboratore': {
      [CAPABILITIES.MANAGE_TASKS]: 'Richiedi promozione a Dipendente per gestire mansioni',
      [CAPABILITIES.MANAGE_CONSERVATION_POINTS]: 'Richiedi promozione a Responsabile per configurare punti di conservazione'
    },
    'dipendente': {
      [CAPABILITIES.MANAGE_TASKS]: 'Richiedi promozione a Responsabile per gestire mansioni',
      [CAPABILITIES.MANAGE_CONSERVATION_POINTS]: 'Richiedi promozione a Responsabile per configurare punti di conservazione'
    },
    'responsabile': {
      [CAPABILITIES.MANAGE_APP]: 'Richiedi promozione ad Amministratore per accesso completo'
    }
  }
  
  return suggestions[currentRole]?.[requiredCapability] || 'Contatta l\'amministratore per maggiori permessi'
}
