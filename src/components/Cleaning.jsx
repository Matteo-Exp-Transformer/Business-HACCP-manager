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
    localStorage.setItem('haccp-cleaning', JSON.stringify(cleaning))
  }, [cleaning])

  // Save temperatures to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('haccp-temperatures', JSON.stringify(temperatures))
  }, [temperatures])

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
      alert('Compila tutti i campi richiesti')
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

    const updatedCleaning = [...(cleaning || []), newTask]
    setCleaning(updatedCleaning)
    localStorage.setItem('haccp-cleaning', JSON.stringify(updatedCleaning))
    
    setFormData({
      task: '',
      assignee: '',
      frequency: ''
    })
  }

  const addTemperature = (e) => {
    e.preventDefault()
    
    if (!tempFormData.temperature || !tempFormData.refrigeratorId) {
      alert('Compila tutti i campi richiesti')
      return
    }

    const temp = parseFloat(tempFormData.temperature)
    const tempMin = parseFloat(tempFormData.temperatureMin)
    const tempMax = parseFloat(tempFormData.temperatureMax)
    
    if (isNaN(temp) || isNaN(tempMin) || isNaN(tempMax)) {
      alert('Inserisci valori numerici validi per le temperature')
      return
    }

    const newTemperature = {
      id: Date.now().toString(),
      temperature: temp,
      temperatureMin: tempMin,
      temperatureMax: tempMax,
      refrigeratorId: tempFormData.refrigeratorId,
      refrigeratorName: refrigerators.find(r => r.id === tempFormData.refrigeratorId)?.name || 'Sconosciuto',
      date: new Date().toLocaleString('it-IT'),
      status: getTemperatureStatus(tempMin, tempMax),
      recordedBy: currentUser?.name || 'Unknown'
    }

    const updatedTemperatures = [...(temperatures || []), newTemperature]
    setTemperatures(updatedTemperatures)
    localStorage.setItem('haccp-temperatures', JSON.stringify(updatedTemperatures))
    
    setTempFormData({
      temperature: '',
      refrigeratorId: '',
      temperatureMin: '',
      temperatureMax: ''
    })
  }

  const toggleTaskCompletion = (id) => {
    if (!cleaning || !Array.isArray(cleaning)) return
    
    const updatedCleaning = cleaning.map(task =>
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
    if (!cleaning || !Array.isArray(cleaning)) return
    
    const updatedCleaning = cleaning.filter(task => task.id !== id)
    setCleaning(updatedCleaning)
    localStorage.setItem('haccp-cleaning', JSON.stringify(updatedCleaning))
  }

  const deleteTemperature = (id) => {
    if (!temperatures || !Array.isArray(temperatures)) return
    
    const updatedTemperatures = temperatures.filter(temp => temp.id !== id)
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
  const pendingTasks = (cleaning || []).filter(task => !task.completed)
  const completedTasks = (cleaning || []).filter(task => task.completed)
  
  // Calcola mansioni mancate in base alla frequenza
  const getMissedTasks = () => {
    if (!cleaning || !Array.isArray(cleaning)) return []
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return cleaning.filter(task => {
      if (task.completed) return false // Escludi quelle completate
      
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
  const dailyTasks = pendingTasks.filter(task => task.frequency === 'daily')
  const weeklyTasks = pendingTasks.filter(task => task.frequency === 'weekly')
  const monthlyTasks = pendingTasks.filter(task => task.frequency === 'monthly')
  const yearlyTasks = pendingTasks.filter(task => task.frequency === 'yearly')

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin'

  const clearCompletedTasks = () => {
    if (!cleaning || !Array.isArray(cleaning)) return
    
    const updatedCleaning = cleaning.filter(task => !task.completed)
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
        </CardHeader>
        <CardContent>
          <form onSubmit={addCleaningTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task">Attività</Label>
                <Input
                  id="task"
                  placeholder="Es: Pulizia frigorifero, Sanificazione piano lavoro..."
                  value={formData.task}
                  onChange={(e) => setFormData({...formData, task: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee">Assegnato a</Label>
                <Input
                  id="assignee"
                  placeholder="Nome del responsabile"
                  value={formData.assignee}
                  onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequenza</Label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Seleziona Frequenza --</option>
                  <option value="daily">Giornalmente</option>
                  <option value="weekly">Settimanalmente</option>
                  <option value="monthly">Mensilmente</option>
                  <option value="yearly">Annualmente</option>
                  {currentUser?.role === 'admin' && (
                    <option value="all">Tutti</option>
                  )}
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Aggiungi Attività
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending Tasks with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Attività da Svolgere ({pendingTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Nessuna attività da svolgere</p>
              <p className="text-sm">Tutte le attività sono completate!</p>
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
                  Giornaliere ({dailyTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'weekly' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Settimanali ({weeklyTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'monthly' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mensili ({monthlyTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'yearly' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Annuali ({yearlyTasks.length})
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
                    Tutti ({pendingTasks.length})
                  </button>
                )}
              </div>

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
              Attività Completate ({completedTasks.length})
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Sei sicuro di voler eliminare tutte le attività completate? Questa azione non può essere annullata.')) {
                      setCleaning(cleaning.filter(task => !task.completed))
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina Tutte
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                  <div className="flex-1">
                    <h3 className="font-medium line-through">{task.task}</h3>
                    <p className="text-sm text-gray-600">
                      Assegnato a: {task.assignee} • Completata: {task.completedAt}
                      {task.completedBy && (
                        <span className="ml-2 text-blue-600">
                          • Completata da: {task.completedBy}
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
          {currentUser && (
            <p className="text-sm text-gray-600">
              Registrando come: <span className="font-medium">{currentUser.name}</span> ({currentUser.department})
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={addTemperature} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temp-location">Frigorifero / Freezer</Label>
                {refrigerators.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Nessun punto di conservazione registrato. Aggiungi prima un punto di conservazione nella sezione "Punti di Conservazione".
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
              </div>
              <div>
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
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={refrigerators.length === 0}
            >
              <Thermometer className="mr-2 h-4 w-4" />
              Registra Temperatura
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
                  {temperatures.filter(t => t.status === 'danger' || t.status === 'warning').length}
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