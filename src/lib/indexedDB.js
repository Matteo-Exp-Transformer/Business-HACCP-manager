/**
 * IndexedDB Utilities - HACCP Business Manager
 * 
 * IndexedDB wrapper for offline data storage with HACCP-specific schemas
 */

// Database configuration
const DB_NAME = 'haccp-business-manager'
const DB_VERSION = 1

// Object store names
export const STORES = {
  COMPANIES: 'companies',
  DEPARTMENTS: 'departments', 
  CONSERVATION_POINTS: 'conservationPoints',
  PRODUCTS: 'products',
  TASKS: 'tasks',
  TASK_COMPLETIONS: 'taskCompletions',
  TEMPERATURE_READINGS: 'temperatureReadings',
  NOTES: 'notes',
  PENDING_CHANGES: 'pendingChanges',
  APP_STATE: 'appState'
}

// Initialize IndexedDB
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Companies store
      if (!db.objectStoreNames.contains(STORES.COMPANIES)) {
        const store = db.createObjectStore(STORES.COMPANIES, { keyPath: 'id' })
        store.createIndex('name', 'name', { unique: false })
      }

      // Departments store
      if (!db.objectStoreNames.contains(STORES.DEPARTMENTS)) {
        const store = db.createObjectStore(STORES.DEPARTMENTS, { keyPath: 'id' })
        store.createIndex('company_id', 'company_id', { unique: false })
        store.createIndex('name', 'name', { unique: false })
      }

      // Conservation points store
      if (!db.objectStoreNames.contains(STORES.CONSERVATION_POINTS)) {
        const store = db.createObjectStore(STORES.CONSERVATION_POINTS, { keyPath: 'id' })
        store.createIndex('company_id', 'company_id', { unique: false })
        store.createIndex('department_id', 'department_id', { unique: false })
        store.createIndex('type', 'type', { unique: false })
      }

      // Products store
      if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
        const store = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' })
        store.createIndex('company_id', 'company_id', { unique: false })
        store.createIndex('expiry_date', 'expiry_date', { unique: false })
        store.createIndex('category', 'category', { unique: false })
      }

      // Tasks store
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        const store = db.createObjectStore(STORES.TASKS, { keyPath: 'id' })
        store.createIndex('company_id', 'company_id', { unique: false })
        store.createIndex('due_date', 'due_date', { unique: false })
        store.createIndex('type', 'type', { unique: false })
      }

      // Task completions store
      if (!db.objectStoreNames.contains(STORES.TASK_COMPLETIONS)) {
        const store = db.createObjectStore(STORES.TASK_COMPLETIONS, { keyPath: 'id' })
        store.createIndex('company_id', 'company_id', { unique: false })
        store.createIndex('task_id', 'task_id', { unique: false })
        store.createIndex('completed_at', 'completed_at', { unique: false })
      }

      // Temperature readings store
      if (!db.objectStoreNames.contains(STORES.TEMPERATURE_READINGS)) {
        const store = db.createObjectStore(STORES.TEMPERATURE_READINGS, { keyPath: 'id' })
        store.createIndex('company_id', 'company_id', { unique: false })
        store.createIndex('conservation_point_id', 'conservation_point_id', { unique: false })
        store.createIndex('recorded_at', 'recorded_at', { unique: false })
      }

      // Notes store
      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        const store = db.createObjectStore(STORES.NOTES, { keyPath: 'id' })
        store.createIndex('company_id', 'company_id', { unique: false })
        store.createIndex('type', 'type', { unique: false })
        store.createIndex('created_at', 'created_at', { unique: false })
      }

      // Pending changes store (for offline sync)
      if (!db.objectStoreNames.contains(STORES.PENDING_CHANGES)) {
        const store = db.createObjectStore(STORES.PENDING_CHANGES, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('type', 'type', { unique: false })
      }

      // App state store
      if (!db.objectStoreNames.contains(STORES.APP_STATE)) {
        db.createObjectStore(STORES.APP_STATE, { keyPath: 'key' })
      }
    }
  })
}

// Generic database operations
export const dbOperations = {
  // Get all records from a store
  getAll: async (storeName) => {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  // Get record by ID
  getById: async (storeName, id) => {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  // Add or update record
  put: async (storeName, data) => {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.put(data)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  // Delete record
  delete: async (storeName, id) => {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  // Clear all records from store
  clear: async (storeName) => {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  // Get records by index
  getByIndex: async (storeName, indexName, value) => {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(value)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}

// HACCP-specific database operations
export const haccpDB = {
  // Conservation points
  conservationPoints: {
    getAll: () => dbOperations.getAll(STORES.CONSERVATION_POINTS),
    getById: (id) => dbOperations.getById(STORES.CONSERVATION_POINTS, id),
    save: (point) => dbOperations.put(STORES.CONSERVATION_POINTS, point),
    delete: (id) => dbOperations.delete(STORES.CONSERVATION_POINTS, id),
    getByDepartment: (departmentId) => 
      dbOperations.getByIndex(STORES.CONSERVATION_POINTS, 'department_id', departmentId)
  },

  // Products
  products: {
    getAll: () => dbOperations.getAll(STORES.PRODUCTS),
    getById: (id) => dbOperations.getById(STORES.PRODUCTS, id),
    save: (product) => dbOperations.put(STORES.PRODUCTS, product),
    delete: (id) => dbOperations.delete(STORES.PRODUCTS, id),
    getExpiring: async (days = 7) => {
      const allProducts = await dbOperations.getAll(STORES.PRODUCTS)
      const threshold = new Date()
      threshold.setDate(threshold.getDate() + days)
      
      return allProducts.filter(product => 
        product.expiry_date && 
        new Date(product.expiry_date) <= threshold
      )
    }
  },

  // Tasks
  tasks: {
    getAll: () => dbOperations.getAll(STORES.TASKS),
    getById: (id) => dbOperations.getById(STORES.TASKS, id),
    save: (task) => dbOperations.put(STORES.TASKS, task),
    delete: (id) => dbOperations.delete(STORES.TASKS, id),
    getDue: async (hours = 24) => {
      const allTasks = await dbOperations.getAll(STORES.TASKS)
      const threshold = new Date()
      threshold.setHours(threshold.getHours() + hours)
      
      return allTasks.filter(task => 
        task.due_date && 
        new Date(task.due_date) <= threshold
      )
    }
  },

  // Temperature readings
  temperatures: {
    getAll: () => dbOperations.getAll(STORES.TEMPERATURE_READINGS),
    getById: (id) => dbOperations.getById(STORES.TEMPERATURE_READINGS, id),
    save: (reading) => dbOperations.put(STORES.TEMPERATURE_READINGS, reading),
    delete: (id) => dbOperations.delete(STORES.TEMPERATURE_READINGS, id),
    getByConservationPoint: (pointId) => 
      dbOperations.getByIndex(STORES.TEMPERATURE_READINGS, 'conservation_point_id', pointId)
  },

  // Pending changes (for offline sync)
  pendingChanges: {
    getAll: () => dbOperations.getAll(STORES.PENDING_CHANGES),
    add: (change) => {
      const changeWithId = {
        ...change,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      }
      return dbOperations.put(STORES.PENDING_CHANGES, changeWithId)
    },
    remove: (id) => dbOperations.delete(STORES.PENDING_CHANGES, id),
    clear: () => dbOperations.clear(STORES.PENDING_CHANGES)
  },

  // App state
  appState: {
    get: (key) => dbOperations.getById(STORES.APP_STATE, key),
    set: (key, value) => dbOperations.put(STORES.APP_STATE, { key, value, timestamp: Date.now() }),
    remove: (key) => dbOperations.delete(STORES.APP_STATE, key)
  }
}

// Sync utilities
export const syncUtils = {
  // Check if data needs sync
  needsSync: async () => {
    const pendingChanges = await haccpDB.pendingChanges.getAll()
    return pendingChanges.length > 0
  },

  // Get sync status
  getSyncStatus: async () => {
    const pendingChanges = await haccpDB.pendingChanges.getAll()
    const lastSync = await haccpDB.appState.get('lastSyncTime')
    
    return {
      pendingChanges: pendingChanges.length,
      lastSyncTime: lastSync?.value || null,
      needsSync: pendingChanges.length > 0
    }
  },

  // Clear all offline data
  clearOfflineData: async () => {
    await Promise.all([
      haccpDB.pendingChanges.clear(),
      dbOperations.clear(STORES.CONSERVATION_POINTS),
      dbOperations.clear(STORES.PRODUCTS),
      dbOperations.clear(STORES.TASKS),
      dbOperations.clear(STORES.TEMPERATURE_READINGS),
      dbOperations.clear(STORES.NOTES)
    ])
  }
}

// Initialize database on app start
export const initializeOfflineDB = async () => {
  try {
    await initDB()
    console.log('IndexedDB initialized successfully')
    return true
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error)
    return false
  }
}

export default haccpDB