/**
 * useCan - Hook per controllo permessi e capacità utente
 * 
 * Questo hook fornisce:
 * 1. Controllo permessi in tempo reale
 * 2. Verifica accesso alle sezioni
 * 3. Controllo azioni specifiche
 * 4. Messaggi educativi sui permessi
 * 
 * @version 1.0
 * @critical Sicurezza - Controllo accessi UI
 */

import { useMemo } from 'react'
import { 
  hasCapability, 
  getUserPermissions, 
  canAccessSection,
  getPermissionMessage,
  getRoleUpgradeSuggestions,
  CAPABILITIES
} from '../utils/permissions'

/**
 * Hook per controllo permessi e capacità utente
 * @param {Object} user - Utente corrente
 * @returns {Object} Oggetto con controlli di permessi e messaggi educativi
 */
export const useCan = (user) => {
  // Calcola i permessi dell'utente
  const userPermissions = useMemo(() => {
    return getUserPermissions(user)
  }, [user])

  // Verifica se l'utente ha una specifica capacità
  const can = useMemo(() => ({
    // Gestione completa dell'applicazione
    manageApp: () => hasCapability(user?.role, CAPABILITIES.MANAGE_APP),
    
    // Gestione punti di conservazione
    manageConservationPoints: () => hasCapability(user?.role, CAPABILITIES.MANAGE_CONSERVATION_POINTS),
    
    // Gestione mansioni e attività
    manageTasks: () => hasCapability(user?.role, CAPABILITIES.MANAGE_TASKS),
    
    // Utilizzo funzionalità core
    useCore: () => hasCapability(user?.role, CAPABILITIES.USE_CORE),
    
    // Visualizzazione struttura organizzativa
    viewOrg: () => hasCapability(user?.role, CAPABILITIES.VIEW_ORG),
    
    // Controlli specifici per azioni
    createRefrigerator: () => hasCapability(user?.role, CAPABILITIES.MANAGE_CONSERVATION_POINTS),
    editRefrigerator: () => hasCapability(user?.role, CAPABILITIES.MANAGE_CONSERVATION_POINTS),
    deleteRefrigerator: () => hasCapability(user?.role, CAPABILITIES.MANAGE_CONSERVATION_POINTS),
    
    createTask: () => hasCapability(user?.role, CAPABILITIES.MANAGE_TASKS),
    editTask: () => hasCapability(user?.role, CAPABILITIES.MANAGE_TASKS),
    deleteTask: () => hasCapability(user?.role, CAPABILITIES.MANAGE_TASKS),
    
    createStaff: () => hasCapability(user?.role, CAPABILITIES.MANAGE_APP),
    editStaff: () => hasCapability(user?.role, CAPABILITIES.MANAGE_APP),
    deleteStaff: () => hasCapability(user?.role, CAPABILITIES.MANAGE_APP),
    
    exportData: () => hasCapability(user?.role, CAPABILITIES.MANAGE_APP),
    importData: () => hasCapability(user?.role, CAPABILITIES.MANAGE_APP),
    backupData: () => hasCapability(user?.role, CAPABILITIES.MANAGE_APP)
  }), [userPermissions])

  // Verifica accesso alle sezioni
  // Note: i nomi delle sezioni sono mantenuti per compatibilità interna
  // UI mostra: Home, Punti di Conservazione, Attività e Mansioni, Inventario, Gestione Etichette, IA Assistant, Impostazioni e Dati, Gestione
  const canAccess = useMemo(() => ({
    dashboard: () => canAccessSection(user, 'dashboard'),           // ex Dashboard → Home
    refrigerators: () => canAccessSection(user, 'refrigerators'),   // ex Frigoriferi → Punti di Conservazione
    cleaning: () => canAccessSection(user, 'cleaning'),             // ex Cleaning → Attività e Mansioni
    inventory: () => canAccessSection(user, 'inventory'),           // ex Inventory → Inventario
    labels: () => canAccessSection(user, 'labels'),                 // ex ProductLabels → Gestione Etichette
    aiAssistant: () => canAccessSection(user, 'ai-assistant'),      // ex AIAssistant → IA Assistant
    dataSettings: () => canAccessSection(user, 'data-settings'),    // ex DataSettings → Impostazioni e Dati
    staff: () => canAccessSection(user, 'staff')                    // ex Staff → Gestione
  }), [user])

  // Ottiene messaggi educativi sui permessi
  const getMessage = useMemo(() => ({
    // Messaggio per capacità specifica
    forCapability: (capability) => getPermissionMessage(capability),
    
    // Suggerimento di upgrade per capacità mancante
    upgradeSuggestion: (requiredCapability) => {
      if (!user?.role) return 'Effettua il login per accedere alle funzionalità'
      return getRoleUpgradeSuggestions(user.role, requiredCapability)
    },
    
    // Messaggio per azione negata
    forAction: (actionName, requiredCapability) => {
      const canPerform = can[actionName]?.() || false
      
      if (canPerform) {
        return null // Azione permessa
      }
      
      return {
        denied: true,
        message: `Non hai i permessi per ${actionName}`,
        requiredCapability,
        suggestion: getRoleUpgradeSuggestions(user?.role, requiredCapability),
        whyMatters: getPermissionMessage(requiredCapability)
      }
    }
  }), [user, can])

  // Stato generale dei permessi
  const permissions = useMemo(() => ({
    // Ruolo corrente
    role: user?.role || 'guest',
    
    // Permessi disponibili
    capabilities: userPermissions,
    
    // Se l'utente è amministratore
    isAdmin: can.manageApp(),
    
    // Se l'utente è responsabile
    isManager: can.manageConservationPoints() || can.manageTasks(),
    
    // Se l'utente può gestire mansioni
    canManageTasks: can.manageTasks(),
    
    // Se l'utente può gestire punti di conservazione
    canManageConservationPoints: can.manageConservationPoints(),
    
    // Se l'utente può utilizzare funzionalità core
    canUseCore: can.useCore(),
    
    // Se l'utente può visualizzare struttura organizzativa
    canViewOrg: can.viewOrg()
  }), [user, userPermissions, can])

  return {
    // Controlli di permessi
    can,
    
    // Controlli accesso sezioni
    canAccess,
    
    // Messaggi educativi
    getMessage,
    
    // Stato permessi
    permissions,
    
    // Utilità
    hasCapability: (capability) => userPermissions.includes(capability),
    getUserPermissions: () => userPermissions
  }
}

export default useCan
