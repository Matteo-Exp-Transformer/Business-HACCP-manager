/**
 * Supabase React Hook
 * 
 * Custom hook that integrates Supabase with React state management
 * Provides real-time data synchronization and caching
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../features/auth'
import { setSupabaseAuth, clearSupabaseAuth } from '../lib/supabase-config'
import {
  companyService,
  userService,
  departmentService,
  conservationPointService,
  productService,
  taskService,
  temperatureService,
  subscriptionService
} from '../services/supabaseService'

/**
 * Main Supabase hook
 */
export const useSupabase = () => {
  const { getToken, isSignedIn } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize Supabase with Clerk token
  useEffect(() => {
    const initializeSupabase = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken()
          if (token) {
            setSupabaseAuth(token)
            setIsInitialized(true)
          }
        } catch (error) {
          console.error('Error initializing Supabase:', error)
        }
      } else {
        clearSupabaseAuth()
        setIsInitialized(false)
      }
    }

    initializeSupabase()
  }, [isSignedIn, getToken])

  return {
    isInitialized,
    services: {
      company: companyService,
      user: userService,
      department: departmentService,
      conservationPoint: conservationPointService,
      product: productService,
      task: taskService,
      temperature: temperatureService,
      subscription: subscriptionService
    }
  }
}

/**
 * Hook for company data
 */
export const useCompany = () => {
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { services, isInitialized } = useSupabase()

  const fetchCompany = useCallback(async () => {
    if (!isInitialized) return

    try {
      setLoading(true)
      setError(null)
      const data = await services.company.getCurrent()
      setCompany(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching company:', err)
    } finally {
      setLoading(false)
    }
  }, [isInitialized, services.company])

  const updateCompany = useCallback(async (companyData) => {
    try {
      const updatedCompany = await services.company.update(companyData)
      setCompany(updatedCompany)
      return updatedCompany
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.company])

  useEffect(() => {
    fetchCompany()
  }, [fetchCompany])

  return {
    company,
    loading,
    error,
    refetch: fetchCompany,
    updateCompany
  }
}

/**
 * Hook for departments data
 */
export const useDepartments = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { services, isInitialized } = useSupabase()

  const fetchDepartments = useCallback(async () => {
    if (!isInitialized) return

    try {
      setLoading(true)
      setError(null)
      const data = await services.department.getAll()
      setDepartments(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching departments:', err)
    } finally {
      setLoading(false)
    }
  }, [isInitialized, services.department])

  const createDepartment = useCallback(async (departmentData) => {
    try {
      const newDepartment = await services.department.create(departmentData)
      setDepartments(prev => [...prev, newDepartment])
      return newDepartment
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.department])

  const updateDepartment = useCallback(async (departmentId, departmentData) => {
    try {
      const updatedDepartment = await services.department.update(departmentId, departmentData)
      setDepartments(prev => 
        prev.map(dept => dept.id === departmentId ? updatedDepartment : dept)
      )
      return updatedDepartment
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.department])

  const deleteDepartment = useCallback(async (departmentId) => {
    try {
      await services.department.delete(departmentId)
      setDepartments(prev => prev.filter(dept => dept.id !== departmentId))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.department])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  return {
    departments,
    loading,
    error,
    refetch: fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
  }
}

/**
 * Hook for conservation points data
 */
export const useConservationPoints = () => {
  const [conservationPoints, setConservationPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { services, isInitialized } = useSupabase()

  const fetchConservationPoints = useCallback(async () => {
    if (!isInitialized) return

    try {
      setLoading(true)
      setError(null)
      const data = await services.conservationPoint.getAll()
      setConservationPoints(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching conservation points:', err)
    } finally {
      setLoading(false)
    }
  }, [isInitialized, services.conservationPoint])

  const createConservationPoint = useCallback(async (pointData) => {
    try {
      const newPoint = await services.conservationPoint.create(pointData)
      setConservationPoints(prev => [...prev, newPoint])
      return newPoint
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.conservationPoint])

  const updateConservationPoint = useCallback(async (pointId, pointData) => {
    try {
      const updatedPoint = await services.conservationPoint.update(pointId, pointData)
      setConservationPoints(prev => 
        prev.map(point => point.id === pointId ? updatedPoint : point)
      )
      return updatedPoint
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.conservationPoint])

  const deleteConservationPoint = useCallback(async (pointId) => {
    try {
      await services.conservationPoint.delete(pointId)
      setConservationPoints(prev => prev.filter(point => point.id !== pointId))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.conservationPoint])

  // Set up real-time subscription
  useEffect(() => {
    if (!isInitialized) return

    const channel = services.subscription.subscribeToConservationPoints((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload
      
      switch (eventType) {
        case 'INSERT':
          setConservationPoints(prev => [...prev, newRecord])
          break
        case 'UPDATE':
          setConservationPoints(prev => 
            prev.map(point => point.id === newRecord.id ? newRecord : point)
          )
          break
        case 'DELETE':
          setConservationPoints(prev => prev.filter(point => point.id !== oldRecord.id))
          break
      }
    })

    return () => {
      services.subscription.unsubscribe(channel)
    }
  }, [isInitialized, services.subscription])

  useEffect(() => {
    fetchConservationPoints()
  }, [fetchConservationPoints])

  return {
    conservationPoints,
    loading,
    error,
    refetch: fetchConservationPoints,
    createConservationPoint,
    updateConservationPoint,
    deleteConservationPoint
  }
}

/**
 * Hook for products data
 */
export const useProducts = () => {
  const [products, setProducts] = useState([])
  const [expiringSoon, setExpiringSoon] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { services, isInitialized } = useSupabase()

  const fetchProducts = useCallback(async () => {
    if (!isInitialized) return

    try {
      setLoading(true)
      setError(null)
      const [allProducts, expiringProducts] = await Promise.all([
        services.product.getAll(),
        services.product.getExpiringSoon(7)
      ])
      setProducts(allProducts)
      setExpiringSoon(expiringProducts)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }, [isInitialized, services.product])

  const createProduct = useCallback(async (productData) => {
    try {
      const newProduct = await services.product.create(productData)
      setProducts(prev => [...prev, newProduct])
      return newProduct
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.product])

  const updateProduct = useCallback(async (productId, productData) => {
    try {
      const updatedProduct = await services.product.update(productId, productData)
      setProducts(prev => 
        prev.map(product => product.id === productId ? updatedProduct : product)
      )
      return updatedProduct
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.product])

  const deleteProduct = useCallback(async (productId) => {
    try {
      await services.product.delete(productId)
      setProducts(prev => prev.filter(product => product.id !== productId))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.product])

  const uploadProductImage = useCallback(async (productId, file) => {
    try {
      const imageUrl = await services.product.uploadImage(productId, file)
      return imageUrl
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.product])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    expiringSoon,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage
  }
}

/**
 * Hook for tasks data
 */
export const useTasks = () => {
  const [tasks, setTasks] = useState([])
  const [dueSoon, setDueSoon] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { services, isInitialized } = useSupabase()

  const fetchTasks = useCallback(async () => {
    if (!isInitialized) return

    try {
      setLoading(true)
      setError(null)
      const [allTasks, dueTasks] = await Promise.all([
        services.task.getAll(),
        services.task.getDueSoon(24)
      ])
      setTasks(allTasks)
      setDueSoon(dueTasks)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [isInitialized, services.task])

  const createTask = useCallback(async (taskData) => {
    try {
      const newTask = await services.task.create(taskData)
      setTasks(prev => [...prev, newTask])
      return newTask
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.task])

  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      const updatedTask = await services.task.update(taskId, taskData)
      setTasks(prev => 
        prev.map(task => task.id === taskId ? updatedTask : task)
      )
      return updatedTask
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.task])

  const completeTask = useCallback(async (taskId, completionData) => {
    try {
      const completion = await services.task.complete(taskId, completionData)
      // Refresh tasks to update completion status
      await fetchTasks()
      return completion
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [services.task, fetchTasks])

  // Set up real-time subscription
  useEffect(() => {
    if (!isInitialized) return

    const channel = services.subscription.subscribeToTasks((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload
      
      switch (eventType) {
        case 'INSERT':
          setTasks(prev => [...prev, newRecord])
          break
        case 'UPDATE':
          setTasks(prev => 
            prev.map(task => task.id === newRecord.id ? newRecord : task)
          )
          break
        case 'DELETE':
          setTasks(prev => prev.filter(task => task.id !== oldRecord.id))
          break
      }
    })

    return () => {
      services.subscription.unsubscribe(channel)
    }
  }, [isInitialized, services.subscription])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    dueSoon,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    completeTask
  }
}

/**
 * Hook for temperature readings
 */
export const useTemperatureReadings = (conservationPointId) => {
  const [readings, setReadings] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { services, isInitialized } = useSupabase()

  const fetchReadings = useCallback(async () => {
    if (!isInitialized || !conservationPointId) return

    try {
      setLoading(true)
      setError(null)
      const [readingsData, statsData] = await Promise.all([
        services.temperature.getByConservationPoint(conservationPointId, 50),
        services.temperature.getStats(conservationPointId, 30)
      ])
      setReadings(readingsData)
      setStats(statsData)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching temperature readings:', err)
    } finally {
      setLoading(false)
    }
  }, [isInitialized, conservationPointId, services.temperature])

  const recordTemperature = useCallback(async (temperatureData) => {
    try {
      const newReading = await services.temperature.record({
        conservation_point_id: conservationPointId,
        ...temperatureData
      })
      setReadings(prev => [newReading, ...prev.slice(0, 49)]) // Keep last 50 readings
      return newReading
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [conservationPointId, services.temperature])

  // Set up real-time subscription
  useEffect(() => {
    if (!isInitialized) return

    const channel = services.subscription.subscribeToTemperatureReadings((payload) => {
      const { eventType, new: newRecord } = payload
      
      if (eventType === 'INSERT' && newRecord.conservation_point_id === conservationPointId) {
        setReadings(prev => [newRecord, ...prev.slice(0, 49)])
      }
    })

    return () => {
      services.subscription.unsubscribe(channel)
    }
  }, [isInitialized, conservationPointId, services.subscription])

  useEffect(() => {
    fetchReadings()
  }, [fetchReadings])

  return {
    readings,
    stats,
    loading,
    error,
    refetch: fetchReadings,
    recordTemperature
  }
}