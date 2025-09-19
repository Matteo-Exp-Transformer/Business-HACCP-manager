// Clerk configuration without direct instantiation
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPublishableKey) {
  console.warn('Clerk Publishable Key not found. Authentication will be disabled.')
}

export const clerk = null // We'll use hooks instead of direct instantiation

// Clerk configuration
export const clerkConfig = {
  appearance: {
    theme: {
      primaryColor: '#3b82f6', // Blue-500
      primaryColorShade: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
    },
    elements: {
      formButtonPrimary: 
        'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
      card: 'shadow-lg',
      headerTitle: 'text-xl font-semibold text-gray-900',
      headerSubtitle: 'text-gray-600',
      socialButtonsIconButton: 'border border-gray-200 hover:border-gray-300',
      formFieldInput: 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      footerActionLink: 'text-blue-600 hover:text-blue-700',
    },
    layout: {
      socialButtonsPlacement: 'bottom',
      socialButtonsVariant: 'iconButton',
    },
  },
  localization: {
    locale: 'it-IT',
    // Custom translations for HACCP context
    signIn: {
      start: {
        title: 'Accedi al Sistema HACCP',
        subtitle: 'Inserisci le tue credenziali per continuare',
      },
    },
    signUp: {
      start: {
        title: 'Registrazione Sistema HACCP',
        subtitle: 'Crea il tuo account per la gestione HACCP',
      },
    },
  },
}

// Role definitions for HACCP system
export const HACCPRoles = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  EMPLOYEE: 'employee',
  COLLABORATOR: 'collaborator',
} as const

export type HACCPRole = typeof HACCPRoles[keyof typeof HACCPRoles]

// Permission definitions
export const HACCPPermissions = {
  // System administration
  MANAGE_USERS: 'manage_users',
  MANAGE_DEPARTMENTS: 'manage_departments',
  MANAGE_SETTINGS: 'manage_settings',
  
  // Data management
  MANAGE_CONSERVATION_POINTS: 'manage_conservation_points',
  MANAGE_TASKS: 'manage_tasks',
  MANAGE_INVENTORY: 'manage_inventory',
  
  // Operations
  LOG_TEMPERATURES: 'log_temperatures',
  COMPLETE_TASKS: 'complete_tasks',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  
  // Compliance
  VIEW_AUDIT_TRAIL: 'view_audit_trail',
  MANAGE_COMPLIANCE: 'manage_compliance',
} as const

export type HACCPPermission = typeof HACCPPermissions[keyof typeof HACCPPermissions]

// Role-Permission mapping
export const rolePermissions: Record<HACCPRole, HACCPPermission[]> = {
  [HACCPRoles.ADMIN]: [
    HACCPPermissions.MANAGE_USERS,
    HACCPPermissions.MANAGE_DEPARTMENTS,
    HACCPPermissions.MANAGE_SETTINGS,
    HACCPPermissions.MANAGE_CONSERVATION_POINTS,
    HACCPPermissions.MANAGE_TASKS,
    HACCPPermissions.MANAGE_INVENTORY,
    HACCPPermissions.LOG_TEMPERATURES,
    HACCPPermissions.COMPLETE_TASKS,
    HACCPPermissions.VIEW_REPORTS,
    HACCPPermissions.EXPORT_DATA,
    HACCPPermissions.VIEW_AUDIT_TRAIL,
    HACCPPermissions.MANAGE_COMPLIANCE,
  ],
  [HACCPRoles.MANAGER]: [
    HACCPPermissions.MANAGE_CONSERVATION_POINTS,
    HACCPPermissions.MANAGE_TASKS,
    HACCPPermissions.MANAGE_INVENTORY,
    HACCPPermissions.LOG_TEMPERATURES,
    HACCPPermissions.COMPLETE_TASKS,
    HACCPPermissions.VIEW_REPORTS,
    HACCPPermissions.EXPORT_DATA,
    HACCPPermissions.VIEW_AUDIT_TRAIL,
  ],
  [HACCPRoles.EMPLOYEE]: [
    HACCPPermissions.LOG_TEMPERATURES,
    HACCPPermissions.COMPLETE_TASKS,
    HACCPPermissions.VIEW_REPORTS,
  ],
  [HACCPRoles.COLLABORATOR]: [
    HACCPPermissions.LOG_TEMPERATURES,
    HACCPPermissions.COMPLETE_TASKS,
  ],
}

// Helper functions
export const hasPermission = (userRole: HACCPRole, permission: HACCPPermission): boolean => {
  return rolePermissions[userRole]?.includes(permission) ?? false
}

export const getUserPermissions = (userRole: HACCPRole): HACCPPermission[] => {
  return rolePermissions[userRole] ?? []
}

// User metadata interface for HACCP context
export interface HACCPUserMetadata {
  role: HACCPRole
  department?: string
  haccpCertification?: {
    certified: boolean
    expiryDate?: string
    certificationLevel?: 'basic' | 'advanced'
  }
  lastLogin?: string
  preferences?: {
    language: 'it' | 'en'
    notifications: boolean
    theme: 'light' | 'dark'
  }
}

export { clerkPublishableKey }