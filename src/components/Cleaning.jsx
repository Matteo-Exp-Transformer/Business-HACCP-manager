/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo componente gestisce le PULIZIE E SANIFICAZIONE - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo componente gestisce workflow di pulizia e sanificazione critici
 * ⚠️ Coordina attività di igiene e compliance HACCP
 * 
 * @fileoverview Componente Cleaning HACCP - Sistema Critico di Igiene
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Pulizie e Sanificazione
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Trash2, Sparkles, CheckCircle, Clock, Thermometer, AlertTriangle, User } from 'lucide-react'
import TemperatureInput from './ui/TemperatureInput'

function Cleaning({ cleaning, setCleaning, temperatures, setTemperatures, currentUser, refrigerators = [], setRefrigerators }) {
  // Controlli di sicurezza per le props
  const safeCleaning = cleaning || []
  const safeTemperatures = temperatures || []
  
  // Data migration: ensure all cleaning tasks have required fields
  useEffect(() => {
    const needsMigration = safeCleaning.some(task => !task.date || !task.frequency)
    if (needsMigration) {
      const migratedCleaning = safeCleaning.map(task => ({
        ...task,
        date: task.date || new Date().toLocaleDateString('it-IT'),
        frequency: task.frequency || 'daily',
        completed: task.completed || false,
        completedAt: task.completedAt || null,
        completedBy: task.completedBy || null
      }))
      setCleaning(migratedCleaning)
    }
  }, [])
  
  const [formData, setFormData] = useState({
    task: '',
    assignee: '',
    frequency: ''
  })
  
  const [tempFormData, setTempFormData] = useState({
    location: '',
    temperatureMin: '',
    temperatureMax: ''
  })

  const [activeTab, setActiveTab] = useState('daily')

  // Persist to localStorage whenever cleaning data changes
  useEffect(() => {
    localStorage.setItem('haccp-cleaning', JSON.stringify(safeCleaning))
  }, [safeCleaning])

  // Save temperatures to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('haccp-temperatures', JSON.stringify(safeTemperatures))
  }, [safeTemperatures])

  const getTemperatureStatus = (tempMin, tempMax) => {
    // Calcola la temperatura media per la valutazione
    const avgTemp = (tempMin + tempMax) / 2
    
    if (avgTemp < 0 || avgTemp > 8) return 'danger'
    if (avgTemp >= 6 && avgTemp <= 8) return 'warning'
    return 'ok'
  }

  const addCleaningTask = (e) => {
    e.preventDefault()
    
    if (!formData.task || !formData.assignee || !formData.frequency) {
      alert('⚠️ Attenzione: Per aggiungere una nuova attività devi compilare tutti i campi richiesti.\n\n• Attività: descrivi cosa fare\n• Assegnato a: chi è responsabile\n• Frequenza: ogni quanto ripetere')
      return
    }

    const newTask = {
      id: Date.now().toString(),
      task: formData.task,
      assignee: formData.assignee,
      frequency: formData.frequency,
      date: new Date().toLocaleDateString('it-IT'),
      completed: false,
      completedAt: null,
      completedBy: null
    }

    const updatedCleaning = [...safeCleaning, newTask]
    setCleaning(updatedCleaning)
    localStorage.setItem('haccp-cleaning', JSON.stringify(updatedCleaning))
    
    // Reset form con feedback positivo
    setFormData({
      task: '',
      assignee: '',
      frequency: ''
    })
    
    // Mostra conferma positiva
    alert('✅ Perfetto! La nuova attività è stata aggiunta con successo.\n\nOra apparirà nella lista delle attività da svolgere e potrai monitorarne il progresso.')
  }

  const addTemperature = (e) => {
    e.preventDefault()
    
    if (!tempFormData.location || !tempFormData.temperatureMin || !tempFormData.temperatureMax) {
      alert('🌡️ Attenzione: Per registrare una temperatura devi compilare tutti i campi richiesti.\n\n• Frigorifero/Freezer: seleziona il punto di conservazione\n• Range Temperatura: inserisci i valori minimo e massimo')
      return
    }

    const tempMin = parseFloat(tempFormData.temperatureMin)
    const tempMax = parseFloat(tempFormData.temperatureMax)
    
    if (isNaN(tempMin) || isNaN(tempMax)) {
      alert('❌ Errore: I valori delle temperature devono essere numeri validi.\n\nEsempi corretti:\n• Min: -2, Max: 4\n• Min: 0, Max: 8\n• Min: -18, Max: -15')
      return
    }

    // Validazione logica delle temperature
    if (tempMin > tempMax) {
      alert('⚠️ Attenzione: La temperatura minima non può essere maggiore della massima.\n\nCorreggi i valori:\n• Min: deve essere inferiore o uguale a Max\n• Esempio: Min: -2, Max: 4')
      return
    }

    const newTemperature = {
      id: Date.now().toString(),
      temperature: (tempMin + tempMax) / 2, // Temperatura media
      temperatureMin: tempMin,
      temperatureMax: tempMax,
      refrigeratorId: tempFormData.location,
      refrigeratorName: tempFormData.location,
      date: new Date().toLocaleString('it-IT'),
      status: getTemperatureStatus(tempMin, tempMax),
      recordedBy: currentUser?.name || 'Unknown'
    }

    const updatedTemperatures = [...safeTemperatures, newTemperature]
    setTemperatures(updatedTemperatures)
    localStorage.setItem('haccp-temperatures', JSON.stringify(updatedTemperatures))
    
    // Reset form con feedback positivo
    setTempFormData({
      location: '',
      temperatureMin: '',
      temperatureMax: ''
    })
    
    // Mostra conferma positiva con informazioni utili
    const statusMessage = newTemperature.status === 'ok' 
      ? '✅ Temperatura nella norma' 
      : newTemperature.status === 'warning' 
        ? '⚠️ Attenzione: temperatura al limite' 
        : '🚨 Attenzione: temperatura critica'
    
    alert(`🌡️ Temperatura registrata con successo!\n\n${statusMessage}\n\n• Frigorifero: ${newTemperature.refrigeratorName}\n• Range: ${tempMin}°C - ${tempMax}°C\n• Data: ${newTemperature.date}`)
  }

  const toggleTaskCompletion = (id) => {
    const updatedCleaning = safeCleaning.map(task =>
      task.id === id
        ? {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toLocaleString('it-IT') : null,
            completedBy: !task.completed ? currentUser?.name || 'Unknown' : null
          }
        : task
    )
    
    setCleaning(updatedCleaning)
    localStorage.setItem('haccp-cleaning', JSON.stringify(updatedCleaning))
  }

  const deleteTask = (id) => {
    const updatedCleaning = safeCleaning.filter(task => task.id !== id)
    setCleaning(updatedCleaning)
    localStorage.setItem('haccp-cleaning', JSON.stringify(updatedCleaning))
  }

  const deleteTemperature = (id) => {
    const updatedTemperatures = safeTemperatures.filter(temp => temp.id !== id)
    setTemperatures(updatedTemperatures)
    localStorage.setItem('haccp-temperatures', JSON.stringify(updatedTemperatures))
  }

  const getStatusBadge = (status) => {
    const badges = {
      ok: <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">OK</span>,
      warning: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Attenzione</span>,
      danger: <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Critica</span>
    }
    return badges[status]
  }

  const getStatusDot = (status) => {
    const colors = {
      ok: 'bg-green-500',
      warning: 'bg-orange-500',
      danger: 'bg-red-500'
    }
    return <div className={`w-4 h-4 rounded-full ${colors[status]} shadow-sm`}></div>
  }

  // Separate completed and pending tasks
  const pendingTasks = safeCleaning.filter(task => !task.completed)
  const completedTasks = safeCleaning.filter(task => task.completed)
  
  // Calcola mansioni mancate in base alla frequenza
  const getMissedTasks = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return safeCleaning.filter(task => {
      if (task.completed) return false // Escludi quelle completate
      
      // Safety check: se task.date non esiste, considera il task come non mancato
      if (!task.date || typeof task.date !== 'string') {
        return false
      }
      
      // Calcola quando il task doveva essere completato in base alla frequenza
      const taskCreationDate = new Date(task.date.split('/').reverse().join('-'))
      
      switch (task.frequency) {
        case 'daily':
          // Task giornaliero è "mancato" se non completato oggi
          // Ma solo se è stato creato almeno ieri
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          return taskCreationDate <= yesterday
          
        case 'weekly':
          // Task settimanale è "mancato" se non completato da più di una settimana
          const oneWeekAgo = new Date(today)
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          return taskCreationDate <= oneWeekAgo
          
        case 'monthly':
          // Task mensile è "mancato" se non completato da più di un mese
          const oneMonthAgo = new Date(today)
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
          return taskCreationDate <= oneMonthAgo
          
        case 'yearly':
          // Task annuale è "mancato" se non completato da più di un anno
          const oneYearAgo = new Date(today)
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
          return taskCreationDate <= oneYearAgo
          
        default:
          // Per frequenze sconosciute, usa la logica di una settimana
          const defaultWeekAgo = new Date(today)
          defaultWeekAgo.setDate(defaultWeekAgo.getDate() - 7)
          return taskCreationDate <= defaultWeekAgo
      }
    })
  }
  
  const missedTasks = getMissedTasks()

  // Filter tasks by frequency
  const dailyTasks = (pendingTasks || []).filter(task => task.frequency === 'daily')
  const weeklyTasks = (pendingTasks || []).filter(task => task.frequency === 'weekly')
  const monthlyTasks = (pendingTasks || []).filter(task => task.frequency === 'monthly')
  const yearlyTasks = (pendingTasks || []).filter(task => task.frequency === 'yearly')

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin'

  const clearCompletedTasks = () => {
    const updatedCleaning = safeCleaning.filter(task => !task.completed)
    setCleaning(updatedCleaning)
    localStorage.setItem('haccp-cleaning', JSON.stringify(updatedCleaning))
  }

  return (
    <div className="space-y-6">
      {/* Add Cleaning Task Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Nuove Attività / Mansioni
          </CardTitle>
          <p className="text-sm text-gray-600">
            📋 Crea nuove attività di pulizia e sanificazione per mantenere la conformità HACCP
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={addCleaningTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task" className="flex items-center gap-2">
                  Attività
                  <span className="text-xs text-gray-500" title="Descrivi in modo chiaro e specifico l'attività da svolgere">
                    ℹ️
                  </span>
                </Label>
                <Input
                  id="task"
                  placeholder="Es: Pulizia frigorifero, Sanificazione piano lavoro..."
                  value={formData.task}
                  onChange={(e) => setFormData({...formData, task: e.target.value})}
                  required
                />
                <p className="text-xs text-gray-500">
                  💡 Suggerimento: Sii specifico (es. "Pulizia mensile frigorifero principale" invece di solo "Pulizia")
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee" className="flex items-center gap-2">
                  Assegnato a
                  <span className="text-xs text-gray-500" title="Specifica chi è responsabile dell'esecuzione dell'attività">
                    ℹ️
                  </span>
                </Label>
                <Input
                  id="assignee"
                  placeholder="Nome del responsabile"
                  value={formData.assignee}
                  onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                  required
                />
                <p className="text-xs text-gray-500">
                  👤 Esempio: "Mario Rossi" o "Team Cucina"
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency" className="flex items-center gap-2">
                  Frequenza
                  <span className="text-xs text-gray-500" title="Seleziona con quale frequenza l'attività deve essere ripetuta">
                    ℹ️
                  </span>
                </Label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Seleziona Frequenza --</option>
                  <option value="daily">🔄 Giornalmente</option>
                  <option value="weekly">📅 Settimanalmente</option>
                  <option value="monthly">📆 Mensilmente</option>
                  <option value="yearly">📅 Annualmente</option>
                  {currentUser?.role === 'admin' && (
                    <option value="all">🔧 Tutti</option>
                  )}
                </select>
                <p className="text-xs text-gray-500">
                  📊 La frequenza aiuta a pianificare e monitorare le attività
                </p>
              </div>
            </div>
            <Button type="submit" className="w-full">
              ✨ Aggiungi Attività
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending Tasks with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Attività da Svolgere ({pendingTasks.length})
          </CardTitle>
          <p className="text-sm text-gray-600">
            📋 Organizza e monitora le attività di pulizia e sanificazione per mantenere la conformità HACCP
          </p>
        </CardHeader>
        <CardContent>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">🎉 Nessuna attività da svolgere</p>
              <p className="text-sm">Tutte le attività sono completate! Ottimo lavoro nel mantenere la conformità HACCP.</p>
              <p className="text-xs text-gray-400 mt-2">
                💡 Suggerimento: Crea nuove attività per mantenere sempre aggiornato il piano di pulizia
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Frequency Tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('daily')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'daily' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔄 Giornaliere ({dailyTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'weekly' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📅 Settimanali ({weeklyTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'monthly' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📆 Mensili ({monthlyTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'yearly' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📅 Annuali ({yearlyTasks.length})
                </button>
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'all' 
                        ? 'bg-white text-gray-700 border-2 border-blue-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🔧 Tutti ({pendingTasks.length})
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                💡 Clicca sulle schede per filtrare le attività per frequenza e organizzare meglio il lavoro
              </p>

              {/* Tasks List */}
              <div className="space-y-3">
                {(() => {
                  let tasksToShow = []
                  switch(activeTab) {
                    case 'daily':
                      tasksToShow = dailyTasks
                      break
                    case 'weekly':
                      tasksToShow = weeklyTasks
                      break
                    case 'monthly':
                      tasksToShow = monthlyTasks
                      break
                    case 'yearly':
                      tasksToShow = yearlyTasks
                      break
                    case 'all':
                      tasksToShow = pendingTasks
                      break
                    default:
                      tasksToShow = dailyTasks
                  }
                  
                  return tasksToShow.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{task.task}</h3>
                        <p className="text-sm text-gray-600">
                          Assegnato a: {task.assignee} • {task.date}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => toggleTaskCompletion(task.id)}
                          className="bg-green-600 hover:bg-green-700 p-2 md:p-1"
                        >
                          <CheckCircle className="h-6 w-6 md:h-4 md:w-4 mr-1" />
                          <span className="hidden sm:inline">Completata</span>
                        </Button>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-700 p-2 md:p-1"
                          >
                            <Trash2 className="h-6 w-6 md:h-4 md:w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Attività Completate ({completedTasks.length})
              </span>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('⚠️ Attenzione: Sei sicuro di voler eliminare tutte le attività completate?\n\nQuesta azione non può essere annullata e rimuoverà la cronologia delle attività svolte.')) {
                      setCleaning(safeCleaning.filter(task => !task.completed))
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina Tutte
                </Button>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600">
              📊 Storico delle attività completate - Mantiene traccia di tutto il lavoro svolto per la conformità HACCP
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                  <div className="flex-1">
                    <h3 className="font-medium line-through">{task.task}</h3>
                    <p className="text-sm text-gray-600">
                      👤 Assegnato a: {task.assignee} • 📅 Completata: {task.completedAt}
                      {task.completedBy && (
                        <span className="ml-2 text-blue-600">
                          • ✅ Completata da: {task.completedBy}
                        </span>
                      )}
                    </p>
                  </div>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTask(task.id)}
                      className="text-red-600 hover:text-red-700 p-2 md:p-1"
                    >
                      <Trash2 className="h-6 w-6 md:h-4 md:w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Temperature Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Registra Temperatura Frigorifero/Freezer
          </CardTitle>
          <p className="text-sm text-gray-600">
            🌡️ Monitora le temperature per garantire la sicurezza alimentare e la conformità HACCP
          </p>
          {currentUser && (
            <p className="text-sm text-gray-600">
              📝 Registrando come: <span className="font-medium">{currentUser.name}</span> ({currentUser.department})
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={addTemperature} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temp-location" className="flex items-center gap-2">
                  Frigorifero / Freezer
                  <span className="text-xs text-gray-500" title="Seleziona il punto di conservazione dove hai misurato la temperatura">
                    ℹ️
                  </span>
                </Label>
                {refrigerators.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Nessun punto di conservazione registrato. 
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      💡 Per registrare le temperature, devi prima aggiungere un frigorifero o freezer nella sezione "Punti di Conservazione".
                    </p>
                  </div>
                ) : (
                  <select
                    id="temp-location"
                    value={tempFormData.location}
                    onChange={(e) => setTempFormData({...tempFormData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Seleziona Frigorifero/Freezer --</option>
                    {refrigerators.map(refrigerator => (
                      <option key={refrigerator.id} value={refrigerator.name}>
                        {refrigerator.name} ({refrigerator.location || 'Posizione non specificata'})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  🏷️ Seleziona il frigorifero o freezer dove hai misurato la temperatura
                </p>
              </div>
              <div>
                <Label htmlFor="temp-temperature-range" className="flex items-center gap-2">
                  Range Temperatura (°C)
                  <span className="text-xs text-gray-500" title="Inserisci la temperatura minima e massima rilevata nel punto di conservazione">
                    ℹ️
                  </span>
                </Label>
                <TemperatureInput
                  label="Range Temperatura (°C)"
                  minValue={tempFormData.temperatureMin}
                  maxValue={tempFormData.temperatureMax}
                  onMinChange={(e) => setTempFormData({...tempFormData, temperatureMin: e.target.value})}
                  onMaxChange={(e) => setTempFormData({...tempFormData, temperatureMax: e.target.value})}
                  required={true}
                  showValidation={true}
                  showSuggestions={true}
                  className="w-full"
                  id="temp-temperature-range"
                />
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <p>🌡️ <strong>Frigoriferi:</strong> 0°C - 8°C (ideale: 2°C - 6°C)</p>
                  <p>❄️ <strong>Freezer:</strong> -18°C o inferiore</p>
                  <p>💡 <strong>Suggerimento:</strong> Misura in diversi punti per avere un range completo</p>
                </div>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={refrigerators.length === 0}
            >
              <Thermometer className="mr-2 h-4 w-4" />
              📊 Registra Temperatura
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mansioni da Svolgere</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {pendingTasks.length === 0 ? '🎉 Tutto sotto controllo!' : '⏰ Richiedono la tua attenzione'}
                </p>
              </div>
              <Clock className="h-10 w-10 md:h-8 md:w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mansioni Completate</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {completedTasks.length === 0 ? '🚀 Inizia con la prima attività!' : '✅ Buon lavoro!'}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 md:h-8 md:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mansioni Mancate</p>
                <p className={`text-2xl font-bold ${
                  missedTasks.length > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {missedTasks.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {missedTasks.length === 0 
                    ? '🎯 Perfetto! Nessuna scadenza mancata' 
                    : '⚠️ Richiedono attenzione immediata'
                  }
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  (ultimi 7 giorni)
                </p>
              </div>
              {missedTasks.length > 0 ? (
                <AlertTriangle className="h-10 w-10 md:h-8 md:w-8 text-red-500" />
              ) : (
                <CheckCircle className="h-10 w-10 md:h-8 md:w-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temperature da Monitorare</p>
                <p className="text-2xl font-bold text-red-600">
                  {safeTemperatures.filter(t => t.status === 'danger' || t.status === 'warning').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {safeTemperatures.filter(t => t.status === 'danger' || t.status === 'warning').length === 0 
                    ? '🌡️ Temperature nella norma' 
                    : '🚨 Richiedono verifica'
                  }
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 md:h-8 md:w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  )
}

export default Cleaning