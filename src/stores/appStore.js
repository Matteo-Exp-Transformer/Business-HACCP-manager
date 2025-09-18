/**
 * Application Store - HACCP Business Manager
 * 
 * Main Zustand store for application state management
 * Integrates with Supabase for data persistence and real-time updates
 */

import { create } from 'zustand'
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Initial state
const initialState = {
  // UI State
  activeTab: 'home',
  isMobileMenuOpen: false,
  sidebarCollapsed: false,
  
  // User preferences
  preferences: {
    theme: 'light',
    language: 'it',
    notifications: {
      temperature: true,
      tasks: true,
      maintenance: true,
      expiry: true
    },
    dashboard: {
      showWelcome: true,
      compactMode: false
    }
  },

  // Application data (synced with Supabase)
  company: null,
  departments: [],
  conservationPoints: [],
  products: [],
  tasks: [],
  temperatureReadings: [],
  
  // Loading states
  loading: {
    company: false,
    departments: false,
    conservationPoints: false,
    products: false,
    tasks: false,
    temperatures: false
  },

  // Error states
  errors: {
    company: null,
    departments: null,
    conservationPoints: null,
    products: null,
    tasks: null,
    temperatures: null
  },

  // Sync status
  sync: {
    lastSyncTime: null,
    isOnline: navigator.onLine,
    pendingChanges: [],
    syncInProgress: false
  },

  // Onboarding state
  onboarding: {
    isCompleted: false,
    currentStep: 1,
    stepsCompleted: [],
    formData: {}
  }
}

// Create the store
export const useAppStore = create(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...initialState,

        // UI Actions
        setActiveTab: (tab) => set((state) => {
          state.activeTab = tab
        }),

        setMobileMenuOpen: (isOpen) => set((state) => {
          state.isMobileMenuOpen = isOpen
        }),

        toggleSidebar: () => set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed
        }),

        // Preferences Actions
        updatePreferences: (preferences) => set((state) => {
          state.preferences = { ...state.preferences, ...preferences }
        }),

        setTheme: (theme) => set((state) => {
          state.preferences.theme = theme
        }),

        setLanguage: (language) => set((state) => {
          state.preferences.language = language
        }),

        // Data Actions
        setCompany: (company) => set((state) => {
          state.company = company
        }),

        setDepartments: (departments) => set((state) => {
          state.departments = departments
        }),

        addDepartment: (department) => set((state) => {
          state.departments.push(department)
        }),

        updateDepartment: (id, updates) => set((state) => {
          const index = state.departments.findIndex(d => d.id === id)
          if (index !== -1) {
            state.departments[index] = { ...state.departments[index], ...updates }
          }
        }),

        removeDepartment: (id) => set((state) => {
          state.departments = state.departments.filter(d => d.id !== id)
        }),

        setConservationPoints: (points) => set((state) => {
          state.conservationPoints = points
        }),

        addConservationPoint: (point) => set((state) => {
          state.conservationPoints.push(point)
        }),

        updateConservationPoint: (id, updates) => set((state) => {
          const index = state.conservationPoints.findIndex(p => p.id === id)
          if (index !== -1) {
            state.conservationPoints[index] = { ...state.conservationPoints[index], ...updates }
          }
        }),

        removeConservationPoint: (id) => set((state) => {
          state.conservationPoints = state.conservationPoints.filter(p => p.id !== id)
        }),

        setProducts: (products) => set((state) => {
          state.products = products
        }),

        addProduct: (product) => set((state) => {
          state.products.push(product)
        }),

        updateProduct: (id, updates) => set((state) => {
          const index = state.products.findIndex(p => p.id === id)
          if (index !== -1) {
            state.products[index] = { ...state.products[index], ...updates }
          }
        }),

        removeProduct: (id) => set((state) => {
          state.products = state.products.filter(p => p.id !== id)
        }),

        setTasks: (tasks) => set((state) => {
          state.tasks = tasks
        }),

        addTask: (task) => set((state) => {
          state.tasks.push(task)
        }),

        updateTask: (id, updates) => set((state) => {
          const index = state.tasks.findIndex(t => t.id === id)
          if (index !== -1) {
            state.tasks[index] = { ...state.tasks[index], ...updates }
          }
        }),

        removeTask: (id) => set((state) => {
          state.tasks = state.tasks.filter(t => t.id !== id)
        }),

        // Loading Actions
        setLoading: (key, isLoading) => set((state) => {
          state.loading[key] = isLoading
        }),

        // Error Actions
        setError: (key, error) => set((state) => {
          state.errors[key] = error
        }),

        clearError: (key) => set((state) => {
          state.errors[key] = null
        }),

        clearAllErrors: () => set((state) => {
          Object.keys(state.errors).forEach(key => {
            state.errors[key] = null
          })
        }),

        // Sync Actions
        setOnlineStatus: (isOnline) => set((state) => {
          state.sync.isOnline = isOnline
        }),

        setLastSyncTime: (time) => set((state) => {
          state.sync.lastSyncTime = time
        }),

        addPendingChange: (change) => set((state) => {
          state.sync.pendingChanges.push(change)
        }),

        removePendingChange: (changeId) => set((state) => {
          state.sync.pendingChanges = state.sync.pendingChanges.filter(
            change => change.id !== changeId
          )
        }),

        clearPendingChanges: () => set((state) => {
          state.sync.pendingChanges = []
        }),

        setSyncInProgress: (inProgress) => set((state) => {
          state.sync.syncInProgress = inProgress
        }),

        // Onboarding Actions
        setOnboardingCompleted: (completed) => set((state) => {
          state.onboarding.isCompleted = completed
        }),

        setOnboardingStep: (step) => set((state) => {
          state.onboarding.currentStep = step
        }),

        markStepCompleted: (step) => set((state) => {
          if (!state.onboarding.stepsCompleted.includes(step)) {
            state.onboarding.stepsCompleted.push(step)
          }
        }),

        updateOnboardingFormData: (data) => set((state) => {
          state.onboarding.formData = { ...state.onboarding.formData, ...data }
        }),

        resetOnboarding: () => set((state) => {
          state.onboarding = {
            isCompleted: false,
            currentStep: 1,
            stepsCompleted: [],
            formData: {}
          }
        }),

        // Utility Actions
        reset: () => set(() => ({ ...initialState })),

        // Computed getters
        getActiveConservationPoints: () => {
          const state = get()
          return state.conservationPoints.filter(point => point.is_active)
        },

        getActiveTasks: () => {
          const state = get()
          return state.tasks.filter(task => task.is_active)
        },

        getTasksDueSoon: (hours = 24) => {
          const state = get()
          const now = new Date()
          const threshold = new Date(now.getTime() + hours * 60 * 60 * 1000)
          
          return state.tasks.filter(task => 
            task.is_active && 
            task.due_date && 
            new Date(task.due_date) <= threshold
          )
        },

        getProductsExpiringSoon: (days = 7) => {
          const state = get()
          const now = new Date()
          const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
          
          return state.products.filter(product => 
            product.is_active && 
            product.expiry_date && 
            new Date(product.expiry_date) <= threshold
          )
        },

        getComplianceScore: () => {
          const state = get()
          const activeTasks = state.tasks.filter(task => task.is_active)
          const completedTasks = activeTasks.filter(task => task.completed_at)
          
          if (activeTasks.length === 0) return 100
          return Math.round((completedTasks.length / activeTasks.length) * 100)
        }
      })),
      {
        name: 'haccp-app-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist user preferences and onboarding state
          preferences: state.preferences,
          onboarding: state.onboarding,
          activeTab: state.activeTab
        })
      }
    )
  )
)

// Selectors for common data access patterns
export const useActiveTab = () => useAppStore((state) => state.activeTab)
export const usePreferences = () => useAppStore((state) => state.preferences)
export const useOnboarding = () => useAppStore((state) => state.onboarding)
export const useCompany = () => useAppStore((state) => state.company)
export const useDepartments = () => useAppStore((state) => state.departments)
export const useConservationPoints = () => useAppStore((state) => state.conservationPoints)
export const useProducts = () => useAppStore((state) => state.products)
export const useTasks = () => useAppStore((state) => state.tasks)
export const useLoading = () => useAppStore((state) => state.loading)
export const useErrors = () => useAppStore((state) => state.errors)
export const useSyncStatus = () => useAppStore((state) => state.sync)

export default useAppStore