/**
 * Calendar Hook - HACCP Business Manager
 * 
 * Custom hook for calendar data management and real-time updates
 */

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/react-query'
import { taskService } from '../../services/supabaseService'
import { useAppStore } from '../../stores/appStore'
import { showToast } from '../../components/ui/Toast'

export const useCalendar = (initialView = 'dayGridMonth') => {
  const [currentView, setCurrentView] = useState(initialView)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filters, setFilters] = useState({
    departments: [],
    taskTypes: [],
    priorities: [],
    users: [],
    showCompleted: true
  })

  const queryClient = useQueryClient()
  const { departments, conservationPoints } = useAppStore()

  // Fetch tasks for calendar
  const { 
    data: tasks = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: taskService.getAll,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  })

  // Task completion mutation
  const completeTaskMutation = useMutation({
    mutationFn: ({ taskId, completionData }) => taskService.complete(taskId, completionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
      showToast.success('Mansione completata', 'La mansione è stata segnata come completata')
    },
    onError: (error) => {
      showToast.error('Errore', 'Impossibile completare la mansione')
      console.error('Error completing task:', error)
    }
  })

  // Transform tasks to calendar events
  const calendarEvents = useMemo(() => {
    if (!tasks) return []

    return tasks
      .filter(task => {
        // Apply filters
        if (filters.departments.length > 0 && !filters.departments.includes(task.assigned_department?.id)) {
          return false
        }
        if (filters.taskTypes.length > 0 && !filters.taskTypes.includes(task.type)) {
          return false
        }
        if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
          return false
        }
        if (!filters.showCompleted && task.completed_at) {
          return false
        }
        return true
      })
      .map(task => ({
        id: task.id,
        title: task.name,
        start: task.due_date,
        allDay: !task.due_date?.includes('T'),
        extendedProps: {
          description: task.description,
          type: task.type,
          priority: task.priority,
          assignedUser: task.assigned_user,
          assignedDepartment: task.assigned_department,
          conservationPoint: task.conservation_point,
          status: task.completed_at ? 'completed' : 'pending',
          completedAt: task.completed_at,
          createdAt: task.created_at,
          originalTask: task
        },
        backgroundColor: getEventColor(task),
        borderColor: getEventBorderColor(task),
        textColor: '#ffffff',
        classNames: getEventClassNames(task)
      }))
  }, [tasks, filters])

  // Get event color based on task type and priority
  const getEventColor = (task) => {
    if (task.completed_at) return '#16a34a' // Green for completed

    const colors = {
      temperature: {
        critical: '#dc2626', // Red
        high: '#ea580c',     // Orange-red
        medium: '#f59e0b',   // Orange
        low: '#eab308'       // Yellow
      },
      maintenance: {
        critical: '#7c2d12', // Brown
        high: '#a16207',     // Dark yellow
        medium: '#ca8a04',   // Yellow
        low: '#eab308'       // Light yellow
      },
      cleaning: {
        critical: '#1e40af', // Dark blue
        high: '#2563eb',     // Blue
        medium: '#3b82f6',   // Light blue
        low: '#60a5fa'       // Very light blue
      },
      general: {
        critical: '#4338ca', // Purple
        high: '#6366f1',     // Light purple
        medium: '#8b5cf6',   // Lighter purple
        low: '#a78bfa'       // Very light purple
      }
    }

    return colors[task.type]?.[task.priority] || colors.general.medium
  }

  // Get event border color
  const getEventBorderColor = (task) => {
    if (task.completed_at) return '#15803d'

    const borderColors = {
      temperature: {
        critical: '#b91c1c',
        high: '#c2410c',
        medium: '#d97706',
        low: '#ca8a04'
      },
      maintenance: {
        critical: '#651b0e',
        high: '#854d0e',
        medium: '#a16207',
        low: '#ca8a04'
      },
      cleaning: {
        critical: '#1e3a8a',
        high: '#1d4ed8',
        medium: '#2563eb',
        low: '#3b82f6'
      },
      general: {
        critical: '#3730a3',
        high: '#4f46e5',
        medium: '#6366f1',
        low: '#8b5cf6'
      }
    }

    return borderColors[task.type]?.[task.priority] || borderColors.general.medium
  }

  // Get event CSS classes
  const getEventClassNames = (task) => {
    const classes = ['calendar-event', `haccp-${task.type}`]
    
    if (task.priority === 'critical') {
      classes.push('event-critical')
    }
    
    if (task.completed_at) {
      classes.push('event-completed', 'haccp-completed')
    }
    
    // Add overdue class if task is past due
    if (!task.completed_at && task.due_date && new Date(task.due_date) < new Date()) {
      classes.push('event-overdue')
    }
    
    return classes
  }

  // Complete task function
  const completeTask = async (taskId, notes = '', photoUrls = []) => {
    try {
      await completeTaskMutation.mutateAsync({
        taskId,
        completionData: {
          notes,
          photo_urls: photoUrls,
          completed_at: new Date().toISOString()
        }
      })
    } catch (error) {
      throw error
    }
  }

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      departments: [],
      taskTypes: [],
      priorities: [],
      users: [],
      showCompleted: true
    })
  }

  // Get filtered statistics
  const getStatistics = () => {
    const stats = {
      total: calendarEvents.length,
      completed: calendarEvents.filter(e => e.extendedProps.status === 'completed').length,
      pending: calendarEvents.filter(e => e.extendedProps.status === 'pending').length,
      critical: calendarEvents.filter(e => e.extendedProps.priority === 'critical').length,
      overdue: calendarEvents.filter(e => 
        e.extendedProps.status === 'pending' && 
        new Date(e.start) < new Date()
      ).length,
      dueSoon: calendarEvents.filter(e => 
        e.extendedProps.status === 'pending' && 
        new Date(e.start) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
      ).length
    }

    stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

    return stats
  }

  // Get events for specific date
  const getEventsForDate = (date) => {
    const targetDate = new Date(date).toDateString()
    return calendarEvents.filter(event => 
      new Date(event.start).toDateString() === targetDate
    )
  }

  // Get upcoming events
  const getUpcomingEvents = (days = 7) => {
    const now = new Date()
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate >= now && eventDate <= future && event.extendedProps.status === 'pending'
    }).sort((a, b) => new Date(a.start) - new Date(b.start))
  }

  // Export calendar data
  const exportCalendarData = (format = 'json', dateRange = null) => {
    const eventsToExport = dateRange 
      ? calendarEvents.filter(event => {
          const eventDate = new Date(event.start)
          return eventDate >= dateRange.start && eventDate <= dateRange.end
        })
      : calendarEvents

    if (format === 'json') {
      return JSON.stringify(eventsToExport, null, 2)
    }
    
    if (format === 'csv') {
      const headers = ['ID', 'Titolo', 'Data', 'Tipo', 'Priorità', 'Stato', 'Assegnato a', 'Reparto']
      const rows = eventsToExport.map(event => [
        event.id,
        event.title,
        new Date(event.start).toLocaleDateString('it-IT'),
        event.extendedProps.type,
        event.extendedProps.priority,
        event.extendedProps.status,
        event.extendedProps.assignedUser?.first_name + ' ' + event.extendedProps.assignedUser?.last_name || '',
        event.extendedProps.assignedDepartment?.name || ''
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }

    return eventsToExport
  }

  return {
    // Data
    events: calendarEvents,
    tasks,
    departments,
    conservationPoints,
    
    // Loading states
    isLoading,
    error,
    
    // View state
    currentView,
    setCurrentView,
    selectedDate,
    setSelectedDate,
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    
    // Actions
    completeTask,
    refetch,
    
    // Utilities
    getStatistics,
    getEventsForDate,
    getUpcomingEvents,
    exportCalendarData,
    
    // Mutation states
    isCompletingTask: completeTaskMutation.isPending
  }
}

export default useCalendar