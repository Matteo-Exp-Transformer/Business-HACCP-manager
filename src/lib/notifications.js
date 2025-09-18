/**
 * Web Push Notifications - HACCP Business Manager
 * 
 * Web Push API integration for HACCP notifications
 */

// VAPID public key (should be stored in environment variables in production)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'demo-key'

// Notification types
export const NOTIFICATION_TYPES = {
  TASK_DUE: 'task_due',
  TASK_OVERDUE: 'task_overdue',
  TEMPERATURE_ALERT: 'temperature_alert',
  MAINTENANCE_DUE: 'maintenance_due',
  PRODUCT_EXPIRING: 'product_expiring',
  NON_CONFORMITY: 'non_conformity',
  GENERAL: 'general'
}

// Check if notifications are supported
export const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
}

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    return { granted: false, reason: 'not_supported' }
  }

  try {
    const permission = await Notification.requestPermission()
    return { 
      granted: permission === 'granted', 
      permission,
      reason: permission !== 'granted' ? 'denied' : null
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return { granted: false, reason: 'error', error }
  }
}

// Get current notification permission
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return 'not_supported'
  }
  return Notification.permission
}

// Subscribe to push notifications
export const subscribeToPush = async () => {
  if (!isNotificationSupported()) {
    throw new Error('Push notifications not supported')
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })

    return subscription
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    throw error
  }
}

// Unsubscribe from push notifications
export const unsubscribeFromPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      return true
    }
    return false
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
    throw error
  }
}

// Show local notification
export const showLocalNotification = (title, options = {}) => {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Notification permission not granted')
    return null
  }

  const defaultOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'haccp-notification',
    renotify: true,
    requireInteraction: false,
    silent: false,
    ...options
  }

  try {
    return new Notification(title, defaultOptions)
  } catch (error) {
    console.error('Error showing notification:', error)
    return null
  }
}

// HACCP-specific notification functions
export const haccpNotifications = {
  // Task due notification
  taskDue: (taskName, dueTime) => {
    return showLocalNotification(
      '📋 Mansione in scadenza',
      {
        body: `${taskName} deve essere completata entro ${dueTime}`,
        tag: 'task-due',
        icon: '/icons/icon-192x192.png',
        data: { type: NOTIFICATION_TYPES.TASK_DUE, taskName }
      }
    )
  },

  // Task overdue notification
  taskOverdue: (taskName) => {
    return showLocalNotification(
      '🚨 Mansione scaduta',
      {
        body: `${taskName} è scaduta e richiede attenzione immediata`,
        tag: 'task-overdue',
        requireInteraction: true,
        data: { type: NOTIFICATION_TYPES.TASK_OVERDUE, taskName }
      }
    )
  },

  // Temperature alert
  temperatureAlert: (pointName, temperature, range) => {
    return showLocalNotification(
      '🌡️ Allerta temperatura',
      {
        body: `${pointName}: ${temperature}°C (range: ${range.min}°C - ${range.max}°C)`,
        tag: 'temperature-alert',
        requireInteraction: true,
        data: { type: NOTIFICATION_TYPES.TEMPERATURE_ALERT, pointName, temperature }
      }
    )
  },

  // Maintenance due
  maintenanceDue: (equipmentName) => {
    return showLocalNotification(
      '🔧 Manutenzione richiesta',
      {
        body: `${equipmentName} richiede manutenzione programmata`,
        tag: 'maintenance-due',
        data: { type: NOTIFICATION_TYPES.MAINTENANCE_DUE, equipmentName }
      }
    )
  },

  // Product expiring
  productExpiring: (productName, expiryDate) => {
    return showLocalNotification(
      '📦 Prodotto in scadenza',
      {
        body: `${productName} scade il ${expiryDate}`,
        tag: 'product-expiring',
        data: { type: NOTIFICATION_TYPES.PRODUCT_EXPIRING, productName, expiryDate }
      }
    )
  },

  // Non-conformity detected
  nonConformity: (title, severity) => {
    return showLocalNotification(
      '⚠️ Non-conformità rilevata',
      {
        body: `${title} (Gravità: ${severity})`,
        tag: 'non-conformity',
        requireInteraction: severity === 'critical',
        data: { type: NOTIFICATION_TYPES.NON_CONFORMITY, title, severity }
      }
    )
  }
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Notification scheduling (for recurring checks)
export const notificationScheduler = {
  // Schedule task reminders
  scheduleTaskReminders: async (tasks) => {
    if (!isNotificationSupported()) return

    // Clear existing scheduled notifications
    const registration = await navigator.serviceWorker.ready
    const notifications = await registration.getNotifications()
    notifications.forEach(notification => {
      if (notification.tag?.startsWith('task-reminder-')) {
        notification.close()
      }
    })

    // Schedule new reminders
    tasks.forEach(task => {
      if (task.due_date) {
        const dueTime = new Date(task.due_date)
        const now = new Date()
        const timeDiff = dueTime.getTime() - now.getTime()
        
        // Schedule reminder 1 hour before due time
        if (timeDiff > 60 * 60 * 1000) { // More than 1 hour away
          setTimeout(() => {
            haccpNotifications.taskDue(task.name, dueTime.toLocaleTimeString())
          }, timeDiff - 60 * 60 * 1000)
        }
      }
    })
  },

  // Schedule temperature checks
  scheduleTemperatureChecks: (conservationPoints) => {
    // This would integrate with background sync for temperature monitoring
    console.log('Temperature check scheduling:', conservationPoints.length, 'points')
  }
}

export default {
  isNotificationSupported,
  requestNotificationPermission,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  showLocalNotification,
  haccpNotifications,
  notificationScheduler,
  NOTIFICATION_TYPES
}