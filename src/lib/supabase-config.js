/**
 * Supabase Configuration and Client Setup
 * 
 * This file configures the Supabase client for the HACCP Business Manager
 * 
 * Features:
 * - PostgreSQL database connection
 * - Row Level Security (RLS) for multi-tenancy
 * - Real-time subscriptions
 * - File storage integration
 * - Edge functions support
 */

import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing Supabase URL. Please add VITE_SUPABASE_URL to your .env file")
}

if (!supabaseAnonKey) {
  throw new Error("Missing Supabase anon key. Please add VITE_SUPABASE_ANON_KEY to your .env file")
}

// Create Supabase client with configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Integration with Clerk authentication
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    // Real-time subscriptions configuration
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database table names
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

// Storage bucket names
export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
  COMPANY_LOGOS: 'company-logos',
  DOCUMENTS: 'documents'
}

// Real-time channel configurations
export const REALTIME_CHANNELS = {
  CONSERVATION_POINTS: 'conservation-points',
  TASKS: 'tasks',
  TEMPERATURE_READINGS: 'temperature-readings',
  NOTIFICATIONS: 'notifications'
}

/**
 * Initialize Supabase client with Clerk JWT token
 * @param {string} token - Clerk JWT token
 */
export const setSupabaseAuth = (token) => {
  if (token) {
    supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    })
  }
}

/**
 * Clear Supabase authentication
 */
export const clearSupabaseAuth = () => {
  supabase.auth.signOut()
}

/**
 * Get current user from Supabase auth
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

/**
 * Database query helpers with error handling
 */
export const db = {
  /**
   * Select data from a table with RLS filtering
   */
  select: async (table, columns = '*', filters = {}) => {
    try {
      let query = supabase.from(table).select(columns)
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
      
      const { data, error } = await query
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error(`Database select error for table ${table}:`, error)
      return { data: null, error }
    }
  },

  /**
   * Insert data into a table
   */
  insert: async (table, data) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
      
      if (error) throw error
      return { data: result, error: null }
    } catch (error) {
      console.error(`Database insert error for table ${table}:`, error)
      return { data: null, error }
    }
  },

  /**
   * Update data in a table
   */
  update: async (table, id, data) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
      
      if (error) throw error
      return { data: result, error: null }
    } catch (error) {
      console.error(`Database update error for table ${table}:`, error)
      return { data: null, error }
    }
  },

  /**
   * Delete data from a table
   */
  delete: async (table, id) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error(`Database delete error for table ${table}:`, error)
      return { error }
    }
  }
}

/**
 * Real-time subscription helpers
 */
export const realtime = {
  /**
   * Subscribe to table changes
   */
  subscribe: (table, callback, filters = {}) => {
    let channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          ...filters
        }, 
        callback
      )
      .subscribe()
    
    return channel
  },

  /**
   * Unsubscribe from a channel
   */
  unsubscribe: (channel) => {
    if (channel) {
      supabase.removeChannel(channel)
    }
  }
}

/**
 * Storage helpers
 */
export const storage = {
  /**
   * Upload a file to storage
   */
  upload: async (bucket, path, file, options = {}) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: false,
          ...options
        })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error(`Storage upload error for bucket ${bucket}:`, error)
      return { data: null, error }
    }
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  },

  /**
   * Delete a file from storage
   */
  delete: async (bucket, paths) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(Array.isArray(paths) ? paths : [paths])
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error(`Storage delete error for bucket ${bucket}:`, error)
      return { data: null, error }
    }
  }
}

export default supabase