/**
 * Hook React per gestione dati HACCP
 * 
 * Integra DataService con React per gestione stato unificata
 * 
 * @version 1.0
 */

import { useState, useEffect, useCallback } from 'react'
import DataService from '../services/dataService'

export const useHaccpData = (key, defaultValue = []) => {
  const [data, setData] = useState(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [key])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await DataService.load(key, defaultValue)
      setData(result)
    } catch (err) {
      setError(err.message)
      setData(defaultValue)
    } finally {
      setLoading(false)
    }
  }, [key, defaultValue])

  const saveData = useCallback(async (newData) => {
    try {
      const result = await DataService.save(key, newData)
      if (result.success) {
        setData(newData)
        setError(null)
      } else {
        setError(result.error)
      }
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [key])

  const updateData = useCallback(async (updater) => {
    const newData = typeof updater === 'function' ? updater(data) : updater
    return await saveData(newData)
  }, [data, saveData])

  const addItem = useCallback(async (item) => {
    const newItem = {
      ...item,
      id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: item.createdAt || new Date().toISOString()
    }
    return await updateData(prev => [...prev, newItem])
  }, [updateData])

  const updateItem = useCallback(async (id, updates) => {
    return await updateData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    )
  }, [updateData])

  const removeItem = useCallback(async (id) => {
    return await updateData(prev => prev.filter(item => item.id !== id))
  }, [updateData])

  const clearData = useCallback(async () => {
    return await saveData([])
  }, [saveData])

  return { 
    data, 
    saveData, 
    updateData,
    addItem,
    updateItem,
    removeItem,
    clearData,
    loading, 
    error, 
    reload: loadData 
  }
}

export default useHaccpData
