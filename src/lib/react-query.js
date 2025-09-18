/**
 * React Query Configuration - HACCP Business Manager
 * 
 * Configures React Query for server state management with Supabase integration
 */

import { QueryClient } from '@tanstack/react-query'

// Create React Query client with HACCP-specific configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes for most data
      
      // Cache time - how long data stays in cache when unused
      cacheTime: 10 * 60 * 1000, // 10 minutes
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      
      // Refetch configuration
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Error handling
      onError: (error) => {
        console.error('Query error:', error)
        // TODO: Send to error monitoring service
      }
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      
      // Error handling for mutations
      onError: (error) => {
        console.error('Mutation error:', error)
        // TODO: Send to error monitoring service
      }
    }
  }
})

// Query keys for consistent caching
export const queryKeys = {
  // Company data
  company: ['company'],
  
  // User data
  users: ['users'],
  user: (id) => ['users', id],
  
  // Department data
  departments: ['departments'],
  department: (id) => ['departments', id],
  
  // Conservation point data
  conservationPoints: ['conservation-points'],
  conservationPoint: (id) => ['conservation-points', id],
  conservationPointTasks: (id) => ['conservation-points', id, 'tasks'],
  conservationPointTemperatures: (id) => ['conservation-points', id, 'temperatures'],
  
  // Product data
  products: ['products'],
  product: (id) => ['products', id],
  productsExpiring: (days) => ['products', 'expiring', days],
  productsByCategory: (category) => ['products', 'category', category],
  productsByDepartment: (departmentId) => ['products', 'department', departmentId],
  
  // Task data
  tasks: ['tasks'],
  task: (id) => ['tasks', id],
  tasksDue: (hours) => ['tasks', 'due', hours],
  tasksByUser: (userId) => ['tasks', 'user', userId],
  tasksByDepartment: (departmentId) => ['tasks', 'department', departmentId],
  taskCompletions: (taskId) => ['tasks', taskId, 'completions'],
  
  // Temperature data
  temperatures: ['temperatures'],
  temperaturesByPoint: (pointId) => ['temperatures', 'point', pointId],
  temperatureStats: (pointId, days) => ['temperatures', 'stats', pointId, days],
  
  // Notes data
  notes: ['notes'],
  notesByType: (type) => ['notes', 'type', type],
  notesByEntity: (entityType, entityId) => ['notes', entityType, entityId],
  
  // Reports and analytics
  complianceScore: ['analytics', 'compliance-score'],
  dashboardStats: ['analytics', 'dashboard'],
  temperatureTrends: (pointId, period) => ['analytics', 'temperature-trends', pointId, period],
  taskMetrics: (period) => ['analytics', 'task-metrics', period],
  
  // Audit logs
  auditLogs: ['audit-logs'],
  auditLogsByEntity: (entityType, entityId) => ['audit-logs', entityType, entityId]
}

// Query invalidation helpers
export const invalidateQueries = {
  company: () => queryClient.invalidateQueries({ queryKey: queryKeys.company }),
  departments: () => queryClient.invalidateQueries({ queryKey: queryKeys.departments }),
  conservationPoints: () => queryClient.invalidateQueries({ queryKey: queryKeys.conservationPoints }),
  products: () => queryClient.invalidateQueries({ queryKey: queryKeys.products }),
  tasks: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
  temperatures: () => queryClient.invalidateQueries({ queryKey: queryKeys.temperatures }),
  
  // Invalidate all data (for major changes)
  all: () => queryClient.invalidateQueries(),
  
  // Invalidate analytics (when underlying data changes)
  analytics: () => queryClient.invalidateQueries({ queryKey: ['analytics'] })
}

// Prefetch helpers for performance optimization
export const prefetchQueries = {
  dashboardData: async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.conservationPoints,
        staleTime: 2 * 60 * 1000 // 2 minutes for dashboard
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.tasksDue(24),
        staleTime: 1 * 60 * 1000 // 1 minute for due tasks
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.productsExpiring(7),
        staleTime: 5 * 60 * 1000 // 5 minutes for expiring products
      })
    ])
  },

  conservationData: async () => {
    await Promise.all([
      queryClient.prefetchQuery({ queryKey: queryKeys.conservationPoints }),
      queryClient.prefetchQuery({ queryKey: queryKeys.departments }),
      queryClient.prefetchQuery({ queryKey: queryKeys.temperatures })
    ])
  },

  taskData: async () => {
    await Promise.all([
      queryClient.prefetchQuery({ queryKey: queryKeys.tasks }),
      queryClient.prefetchQuery({ queryKey: queryKeys.conservationPoints }),
      queryClient.prefetchQuery({ queryKey: queryKeys.users })
    ])
  }
}

// Cache management
export const cacheUtils = {
  // Clear all cached data
  clearAll: () => queryClient.clear(),
  
  // Remove specific query from cache
  remove: (queryKey) => queryClient.removeQueries({ queryKey }),
  
  // Get cached data without triggering fetch
  get: (queryKey) => queryClient.getQueryData(queryKey),
  
  // Set cached data manually
  set: (queryKey, data) => queryClient.setQueryData(queryKey, data),
  
  // Check if query is loading
  isLoading: (queryKey) => {
    const query = queryClient.getQueryState(queryKey)
    return query?.isFetching || false
  }
}

export default queryClient