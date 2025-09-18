/**
 * Supabase Service Layer
 * 
 * This service provides high-level database operations for the HACCP application
 * All functions include proper error handling and data validation
 */

import { supabase, db, realtime, storage, TABLES, STORAGE_BUCKETS } from '../lib/supabase-config'
import { getCompanyId } from '../lib/clerk'

/**
 * Company Service
 */
export const companyService = {
  /**
   * Get current user's company
   */
  async getCurrent() {
    try {
      const { data, error } = await db.select(TABLES.COMPANIES)
      if (error) throw error
      return data?.[0] || null
    } catch (error) {
      console.error('Error fetching company:', error)
      throw error
    }
  },

  /**
   * Update company information
   */
  async update(companyData) {
    try {
      const { data, error } = await db.update(TABLES.COMPANIES, companyData.id, companyData)
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('Error updating company:', error)
      throw error
    }
  }
}

/**
 * User Service
 */
export const userService = {
  /**
   * Get all users in company
   */
  async getAll() {
    try {
      const { data, error } = await db.select(TABLES.USERS, `
        *,
        departments (
          id,
          name
        )
      `)
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  /**
   * Create or update user (for Clerk integration)
   */
  async upsert(userData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .upsert(userData, { onConflict: 'clerk_user_id' })
        .select()
      
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('Error upserting user:', error)
      throw error
    }
  },

  /**
   * Update user profile
   */
  async update(userId, userData) {
    try {
      const { data, error } = await db.update(TABLES.USERS, userId, userData)
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }
}

/**
 * Department Service
 */
export const departmentService = {
  /**
   * Get all departments
   */
  async getAll() {
    try {
      const { data, error } = await db.select(TABLES.DEPARTMENTS, `
        *,
        manager:manager_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching departments:', error)
      throw error
    }
  },

  /**
   * Create new department
   */
  async create(departmentData) {
    try {
      const { data, error } = await db.insert(TABLES.DEPARTMENTS, departmentData)
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('Error creating department:', error)
      throw error
    }
  },

  /**
   * Update department
   */
  async update(departmentId, departmentData) {
    try {
      const { data, error } = await db.update(TABLES.DEPARTMENTS, departmentId, departmentData)
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('Error updating department:', error)
      throw error
    }
  },

  /**
   * Delete department
   */
  async delete(departmentId) {
    try {
      const { error } = await db.delete(TABLES.DEPARTMENTS, departmentId)
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting department:', error)
      throw error
    }
  }
}

/**
 * Conservation Point Service
 */
export const conservationPointService = {
  /**
   * Get all conservation points
   */
  async getAll() {
    try {
      const { data, error } = await db.select(TABLES.CONSERVATION_POINTS, `
        *,
        department:department_id (
          id,
          name
        )
      `)
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching conservation points:', error)
      throw error
    }
  },

  /**
   * Create new conservation point
   */
  async create(pointData) {
    try {
      const { data, error } = await db.insert(TABLES.CONSERVATION_POINTS, pointData)
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('Error creating conservation point:', error)
      throw error
    }
  },

  /**
   * Update conservation point
   */
  async update(pointId, pointData) {
    try {
      const { data, error } = await db.update(TABLES.CONSERVATION_POINTS, pointId, pointData)
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('Error updating conservation point:', error)
      throw error
    }
  },

  /**
   * Delete conservation point
   */
  async delete(pointId) {
    try {
      const { error } = await db.delete(TABLES.CONSERVATION_POINTS, pointId)
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting conservation point:', error)
      throw error
    }
  }
}

/**
 * Product Service
 */
export const productService = {
  /**
   * Get all products
   */
  async getAll() {
    try {
      const { data, error } = await db.select(TABLES.PRODUCTS, `
        *,
        department:department_id (
          id,
          name
        ),
        conservation_point:conservation_point_id (
          id,
          name,
          type
        )
      `)
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  /**
   * Get products expiring soon
   */
  async getExpiringSoon(days = 7) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select(`
          *,
          department:department_id (
            id,
            name
          ),
          conservation_point:conservation_point_id (
            id,
            name,
            type
          )
        `)
        .lte('expiry_date', new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .eq('is_active', true)
        .order('expiry_date', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching expiring products:', error)
      throw error
    }
  },

  /**
   * Create new product
   */
  async create(productData) {
    try {
      const { data, error } = await db.insert(TABLES.PRODUCTS, productData)
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  },

  /**
   * Update product
   */
  async update(productId, productData) {
    try {
      const { data, error } = await db.update(TABLES.PRODUCTS, productId, productData)
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  /**
   * Delete product
   */
  async delete(productId) {
    try {
      const { error } = await db.delete(TABLES.PRODUCTS, productId)
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  },

  /**
   * Upload product image
   */
  async uploadImage(productId, file) {
    try {
      const fileName = `${productId}-${Date.now()}.${file.name.split('.').pop()}`
      const { data, error } = await storage.upload(STORAGE_BUCKETS.PRODUCT_IMAGES, fileName, file)
      
      if (error) throw error
      
      const imageUrl = storage.getPublicUrl(STORAGE_BUCKETS.PRODUCT_IMAGES, fileName)
      return imageUrl
    } catch (error) {
      console.error('Error uploading product image:', error)
      throw error
    }
  }
}

/**
 * Task Service
 */
export const taskService = {
  /**
   * Get all tasks
   */
  async getAll() {
    try {
      const { data, error } = await db.select(TABLES.TASKS, `
        *,
        conservation_point:conservation_point_id (
          id,
          name,
          type
        ),
        assigned_user:assigned_to_user_id (
          id,
          first_name,
          last_name
        ),
        assigned_department:assigned_to_department_id (
          id,
          name
        )
      `)
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  },

  /**
   * Get tasks due soon
   */
  async getDueSoon(hours = 24) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select(`
          *,
          conservation_point:conservation_point_id (
            id,
            name,
            type
          ),
          assigned_user:assigned_to_user_id (
            id,
            first_name,
            last_name
          )
        `)
        .lte('due_date', new Date(Date.now() + hours * 60 * 60 * 1000).toISOString())
        .eq('is_active', true)
        .order('due_date', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching due tasks:', error)
      throw error
    }
  },

  /**
   * Create new task
   */
  async create(taskData) {
    try {
      const { data, error } = await db.insert(TABLES.TASKS, taskData)
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  },

  /**
   * Update task
   */
  async update(taskId, taskData) {
    try {
      const { data, error } = await db.update(TABLES.TASKS, taskId, taskData)
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  },

  /**
   * Complete task
   */
  async complete(taskId, completionData) {
    try {
      const { data, error } = await db.insert(TABLES.TASK_COMPLETIONS, {
        task_id: taskId,
        ...completionData
      })
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('Error completing task:', error)
      throw error
    }
  }
}

/**
 * Temperature Reading Service
 */
export const temperatureService = {
  /**
   * Get temperature readings for a conservation point
   */
  async getByConservationPoint(conservationPointId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TEMPERATURE_READINGS)
        .select(`
          *,
          conservation_point:conservation_point_id (
            id,
            name,
            type
          ),
          recorded_user:recorded_by_user_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('conservation_point_id', conservationPointId)
        .order('recorded_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching temperature readings:', error)
      throw error
    }
  },

  /**
   * Record new temperature reading
   */
  async record(temperatureData) {
    try {
      const { data, error } = await db.insert(TABLES.TEMPERATURE_READINGS, temperatureData)
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('Error recording temperature:', error)
      throw error
    }
  },

  /**
   * Get temperature statistics
   */
  async getStats(conservationPointId, days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from(TABLES.TEMPERATURE_READINGS)
        .select('temperature, recorded_at, is_within_range')
        .eq('conservation_point_id', conservationPointId)
        .gte('recorded_at', startDate)
        .order('recorded_at', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching temperature stats:', error)
      throw error
    }
  }
}

/**
 * Real-time Subscriptions
 */
export const subscriptionService = {
  /**
   * Subscribe to conservation point changes
   */
  subscribeToConservationPoints(callback) {
    return realtime.subscribe(TABLES.CONSERVATION_POINTS, callback)
  },

  /**
   * Subscribe to task changes
   */
  subscribeToTasks(callback) {
    return realtime.subscribe(TABLES.TASKS, callback)
  },

  /**
   * Subscribe to temperature readings
   */
  subscribeToTemperatureReadings(callback) {
    return realtime.subscribe(TABLES.TEMPERATURE_READINGS, callback)
  },

  /**
   * Unsubscribe from channel
   */
  unsubscribe(channel) {
    return realtime.unsubscribe(channel)
  }
}

export default {
  companyService,
  userService,
  departmentService,
  conservationPointService,
  productService,
  taskService,
  temperatureService,
  subscriptionService
}