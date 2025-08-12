/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo componente gestisce le NOTIFICHE INTELLIGENTI - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo componente gestisce allarmi e notifiche critiche in tempo reale
 * ⚠️ Coordina alert automatici per compliance HACCP
 * 
 * @fileoverview Sistema Notifiche Intelligenti HACCP - Sistema Critico di Allerta
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Sistema Allerta
 * @version 1.0
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Thermometer, 
  Sparkles, 
  Package,
  X,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react'

function NotificationSystem({ 
  temperatures = [], 
  cleaning = [], 
  products = [], 
  currentUser,
  onNotificationAction 
}) {
  const [notifications, setNotifications] = useState([])
  const [isEnabled, setIsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    temperatureAlerts: true,
    expiryAlerts: true,
    cleaningAlerts: true,
    criticalThresholds: true,
    autoArchive: true
  })
  
  const audioRef = useRef(null)
  const checkIntervalRef = useRef(null)

  // Carica impostazioni notifiche
  useEffect(() => {
    const saved = localStorage.getItem('haccp-notification-settings')
    if (saved) {
      setNotificationSettings(JSON.parse(saved))
    }
    
    const enabled = localStorage.getItem('haccp-notifications-enabled')
    if (enabled !== null) {
      setIsEnabled(JSON.parse(enabled))
    }
    
    const sound = localStorage.getItem('haccp-notification-sound')
    if (sound !== null) {
      setSoundEnabled(JSON.parse(sound))
    }
  }, [])

  // Salva impostazioni
  useEffect(() => {
    localStorage.setItem('haccp-notification-settings', JSON.stringify(notificationSettings))
  }, [notificationSettings])

  useEffect(() => {
    localStorage.setItem('haccp-notifications-enabled', JSON.stringify(isEnabled))
  }, [isEnabled])

  useEffect(() => {
    localStorage.setItem('haccp-notification-sound', JSON.stringify(soundEnabled))
  }, [soundEnabled])

  // Sistema di controllo automatico
  useEffect(() => {
    if (!isEnabled) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
      return
    }

    // Controllo ogni 30 secondi
    checkIntervalRef.current = setInterval(() => {
      checkForNewNotifications()
    }, 30000)

    // Controllo immediato all'avvio
    checkForNewNotifications()

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [isEnabled, temperatures, cleaning, products, notificationSettings])

  // Controlla per nuove notifiche
  const checkForNewNotifications = () => {
    const newNotifications = []
    
    // Controllo temperature critiche
    if (notificationSettings.temperatureAlerts) {
      const criticalTemps = temperatures.filter(temp => {
        const avgTemp = (temp.temperatureMin + temp.temperatureMax) / 2
        return avgTemp < 0 || avgTemp > 8
      })
      
      criticalTemps.forEach(temp => {
        const existing = notifications.find(n => 
          n.type === 'temperature' && n.dataId === temp.id
        )
        
        if (!existing) {
          newNotifications.push({
            id: `temp_${temp.id}`,
            type: 'temperature',
            dataId: temp.id,
            title: 'Temperatura Critica',
            message: `${temp.location || temp.refrigeratorName}: ${temp.temperatureMin}-${temp.temperatureMax}°C`,
            severity: 'critical',
            timestamp: new Date().toISOString(),
            read: false,
            action: 'view_temperature'
          })
        }
      })
    }

    // Controllo scadenze prodotti
    if (notificationSettings.expiryAlerts) {
      const today = new Date()
      const expiringProducts = products.filter(product => {
        if (!product.expiryDate) return false
        const expiryDate = new Date(product.expiryDate)
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 3 && daysUntilExpiry > 0
      })
      
      expiringProducts.forEach(product => {
        const existing = notifications.find(n => 
          n.type === 'expiry' && n.dataId === product.id
        )
        
        if (!existing) {
          const daysLeft = Math.ceil((new Date(product.expiryDate) - today) / (1000 * 60 * 60 * 24))
          newNotifications.push({
            id: `expiry_${product.id}`,
            type: 'expiry',
            dataId: product.id,
            title: 'Prodotto in Scadenza',
            message: `${product.name} scade tra ${daysLeft} giorno${daysLeft > 1 ? 'i' : ''}`,
            severity: daysLeft === 1 ? 'critical' : 'warning',
            timestamp: new Date().toISOString(),
            read: false,
            action: 'view_product'
          })
        }
      })
    }

    // Controllo pulizie mancate
    if (notificationSettings.cleaningAlerts) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      const missedCleaning = cleaning.filter(task => {
        if (task.completed) return false
        
        const taskCreationDate = new Date(task.date.split('/').reverse().join('-'))
        
        switch (task.frequency) {
          case 'daily':
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            return taskCreationDate <= yesterday
          case 'weekly':
            const oneWeekAgo = new Date(today)
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
            return taskCreationDate <= oneWeekAgo
          case 'monthly':
            const oneMonthAgo = new Date(today)
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
            return taskCreationDate <= oneMonthAgo
          default:
            return false
        }
      })
      
      missedCleaning.forEach(task => {
        const existing = notifications.find(n => 
          n.type === 'cleaning' && n.dataId === task.id
        )
        
        if (!existing) {
          newNotifications.push({
            id: `cleaning_${task.id}`,
            type: 'cleaning',
            dataId: task.id,
            title: 'Pulizia Mancata',
            message: `${task.task} (${task.frequency}) - Assegnato a: ${task.assignee}`,
            severity: 'warning',
            timestamp: new Date().toISOString(),
            read: false,
            action: 'view_cleaning'
          })
        }
      })
    }

    // Aggiungi nuove notifiche
    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev])
      
      // Riproduci suono se abilitato
      if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch(() => {})
      }
      
      // Mostra notifica browser se supportata
      if ('Notification' in window && Notification.permission === 'granted') {
        newNotifications.forEach(notif => {
          new Notification(notif.title, {
            body: notif.message,
            icon: '/icons/icon-192x192.png',
            tag: notif.id
          })
        })
      }
    }
  }

  // Gestisci azione notifica
  const handleNotificationAction = (notification) => {
    // Marca come letta
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    )
    
    // Esegui azione
    if (onNotificationAction) {
      onNotificationAction(notification)
    }
  }

  // Elimina notifica
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Archivia notifiche lette
  const archiveReadNotifications = () => {
    setNotifications(prev => prev.filter(n => !n.read))
  }

  // Conta notifiche non lette
  const unreadCount = notifications.filter(n => !n.read).length

  // Ottieni icona per tipo notifica
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'temperature': return <Thermometer className="h-5 w-5" />
      case 'expiry': return <Package className="h-5 w-5" />
      case 'cleaning': return <Sparkles className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  // Ottieni colore per severità
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'warning': return 'border-yellow-500 bg-yellow-50'
      case 'info': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  // Formatta timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const notifTime = new Date(timestamp)
    const diffMs = now - notifTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ora'
    if (diffMins < 60) return `${diffMins}m fa`
    if (diffHours < 24) return `${diffHours}h fa`
    if (diffDays < 7) return `${diffDays}g fa`
    return notifTime.toLocaleDateString('it-IT')
  }

  if (!isEnabled) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsEnabled(true)}
          className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg"
          title="Riabilita Notifiche"
        >
          <BellOff className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Audio per notifiche */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
      </audio>

      {/* Pulsante notifiche */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`relative rounded-full p-3 shadow-lg transition-all ${
            unreadCount > 0 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          title={`Notifiche (${unreadCount} non lette)`}
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Pannello notifiche */}
      {showNotifications && (
        <div className="fixed bottom-20 left-6 z-50 w-96 max-h-96 overflow-hidden">
          <Card className="shadow-2xl border-2 border-blue-200">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Notifiche HACCP
                  {unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2"
                    title={soundEnabled ? 'Disabilita Suono' : 'Abilita Suono'}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNotifications(false)}
                    className="p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
                  <p>Nessuna notifica</p>
                  <p className="text-sm">Tutto sotto controllo!</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 ${getSeverityColor(notification.severity)} ${
                        !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                      } hover:bg-opacity-75 transition-all cursor-pointer`}
                      onClick={() => handleNotificationAction(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`font-medium text-sm ${
                              !notification.read ? 'font-semibold' : ''
                            }`}>
                              {notification.title}
                            </h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="p-1 h-6 w-6 text-gray-400 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {notifications.length > 0 && (
                <div className="p-3 bg-gray-50 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {notifications.filter(n => n.read).length} lette, {unreadCount} non lette
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={archiveReadNotifications}
                      className="text-xs"
                    >
                      Archivia Lette
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export default NotificationSystem
