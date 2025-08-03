import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Trash2, Sparkles, CheckCircle, Clock, Thermometer, AlertTriangle, User } from 'lucide-react'

function Cleaning({ cleaning, setCleaning, temperatures, setTemperatures, currentUser, refrigerators = [], setRefrigerators, staff = [] }) {
  const [formData, setFormData] = useState({
    task: '',
    assignee: '',
    frequency: ''
  })
  
  const [tempFormData, setTempFormData] = useState({
    location: '',
    temperature: ''
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

  const getTemperatureStatus = (temp) => {
    if (temp < 0 || temp > 8) return 'danger'
    if (temp >= 6 && temp <= 8) return 'warning'
    return 'ok'
  }

  const addCleaningTask = (e) => {
    e.preventDefault()
    if (!formData.task.trim() || !formData.assignee.trim() || !formData.frequency) return

    const newTask = {
      id: Date.now(),
      task: formData.task.trim(),
      assignee: formData.assignee.trim(),
      frequency: formData.frequency,
      completed: false,
      date: new Date().toLocaleDateString('it-IT'),
      createdAt: new Date().toLocaleString('it-IT'),
      createdBy: currentUser?.name || 'Unknown'
    }

    setCleaning([...cleaning, newTask])
    setFormData({ task: '', assignee: '', frequency: '' })
  }

  const addTemperature = (e) => {
    e.preventDefault()
    
    if (!tempFormData.location.trim() || !tempFormData.temperature.trim()) {
      return
    }

    const tempValue = parseFloat(tempFormData.temperature)
    if (isNaN(tempValue)) {
      return
    }

    const newTemperature = {
      id: Date.now(),
      location: tempFormData.location.trim(),
      temperature: tempValue,
      status: getTemperatureStatus(tempValue),
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleString('it-IT'),
      user: currentUser?.id,
      userName: currentUser?.name,
      userDepartment: currentUser?.department
    }

    setTemperatures([...temperatures, newTemperature])
    
    // Registra l'azione nel log
    const action = {
      id: Date.now() + 1,
      timestamp: new Date().toISOString(),
      user: currentUser?.id,
      userName: currentUser?.name,
      type: 'temperature_check',
      description: `Controllo temperatura ${tempFormData.location}: ${tempValue}°C`,
      location: tempFormData.location,
      value: tempValue,
      status: getTemperatureStatus(tempValue)
    }
    
    const actions = JSON.parse(localStorage.getItem('haccp-actions') || '[]')
    actions.push(action)
    localStorage.setItem('haccp-actions', JSON.stringify(actions))

    setTempFormData({ location: '', temperature: '' })
  }

  const toggleTaskCompletion = (id) => {
    setCleaning(cleaning.map(task => 
      task.id === id 
        ? { 
            ...task, 
            completed: !task.completed, 
            completedAt: !task.completed ? new Date().toLocaleString('it-IT') : null,
            completedBy: !task.completed ? currentUser?.name || 'Unknown' : null
          }
        : task
    ))
  }

  const deleteTask = (id) => {
    if (confirm('Sei sicuro di voler eliminare questa attività?')) {
      setCleaning(cleaning.filter(task => task.id !== id))
    }
  }

  const deleteTemperature = (id) => {
    setTemperatures(temperatures.filter(temp => temp.id !== id))
    
    // Registra l'azione di cancellazione
    const action = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: currentUser?.id,
      userName: currentUser?.name,
      type: 'temperature_delete',
      description: `Eliminato controllo temperatura`
    }
    
    const actions = JSON.parse(localStorage.getItem('haccp-actions') || '[]')
    actions.push(action)
    localStorage.setItem('haccp-actions', JSON.stringify(actions))
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
  const pendingTasks = cleaning.filter(task => !task.completed)
  const completedTasks = cleaning.filter(task => task.completed)
  
  // Calcola attività mancate (non completate entro la scadenza)
  const getOverdueTasks = () => {
    const now = new Date()
    return cleaning.filter(task => {
      if (task.completed) return false
      
      const taskDate = new Date(task.date)
      let dueDate
      
      switch(task.frequency) {
        case 'daily':
          dueDate = new Date(taskDate.getTime() + 24 * 60 * 60 * 1000) // +1 giorno
          break
        case 'weekly':
          dueDate = new Date(taskDate.getTime() + 7 * 24 * 60 * 60 * 1000) // +7 giorni
          break
        case 'monthly':
          dueDate = new Date(taskDate.getFullYear(), taskDate.getMonth() + 1, taskDate.getDate())
          break
        case 'yearly':
          dueDate = new Date(taskDate.getFullYear() + 1, taskDate.getMonth(), taskDate.getDate())
          break
        default:
          dueDate = new Date(taskDate.getTime() + 24 * 60 * 60 * 1000) // Default: +1 giorno
      }
      
      return now > dueDate
    })
  }
  
  const overdueTasks = getOverdueTasks()

  // Filter tasks by frequency
  const dailyTasks = pendingTasks.filter(task => task.frequency === 'daily')
  const weeklyTasks = pendingTasks.filter(task => task.frequency === 'weekly')
  const monthlyTasks = pendingTasks.filter(task => task.frequency === 'monthly')
  const yearlyTasks = pendingTasks.filter(task => task.frequency === 'yearly')
  
  // Calcola il colore delle schede basato sulle attività
  const getTabColor = (tasks) => {
    if (tasks.length === 0) return 'bg-green-100 text-green-700 border-green-300'
    return 'bg-yellow-100 text-yellow-700 border-yellow-300'
  }

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin'

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
                <select
                  id="assignee"
                  value={formData.assignee}
                  onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Seleziona Utente/Ruolo --</option>
                  {staff.map(member => (
                    <option key={member.id} value={member.name}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                  {/* Aggiungi categorie di ruoli */}
                  {Array.from(new Set(staff.map(s => s.role))).map(role => (
                    <option key={`role-${role}`} value={`Categoria: ${role}`}>
                      Categoria: {role}
                    </option>
                  ))}
                </select>
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
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : getTabColor(pendingTasks)
                  }`}
                >
                  Tutte ({pendingTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('daily')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'daily' 
                      ? 'bg-blue-600 text-white' 
                      : getTabColor(dailyTasks)
                  }`}
                >
                  Giornaliere ({dailyTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'weekly' 
                      ? 'bg-blue-600 text-white' 
                      : getTabColor(weeklyTasks)
                  }`}
                >
                  Settimanali ({weeklyTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'monthly' 
                      ? 'bg-blue-600 text-white' 
                      : getTabColor(monthlyTasks)
                  }`}
                >
                  Mensili ({monthlyTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'yearly' 
                      ? 'bg-blue-600 text-white' 
                      : getTabColor(yearlyTasks)
                  }`}
                >
                  Annuali ({yearlyTasks.length})
                </button>
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
                  
                  return tasksToShow.map(task => {
                    // Calcola se l'attività è nuova (creata oggi)
                    const taskDate = new Date(task.createdAt || task.date)
                    const today = new Date()
                    const isNew = taskDate.toDateString() === today.toDateString()
                    
                    return (
                      <div key={task.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                        isNew ? 'bg-yellow-50 border-yellow-200' : ''
                      }`}>
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
                              title="Elimina"
                            >
                              <Trash2 className="h-6 w-6 md:h-4 md:w-4" />
                              <span className="ml-1 text-xs hidden sm:inline">Elimina</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Attività Mancate ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueTasks.map(task => {
                const taskDate = new Date(task.date)
                let dueDate
                
                switch(task.frequency) {
                  case 'daily':
                    dueDate = new Date(taskDate.getTime() + 24 * 60 * 60 * 1000)
                    break
                  case 'weekly':
                    dueDate = new Date(taskDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                    break
                  case 'monthly':
                    dueDate = new Date(taskDate.getFullYear(), taskDate.getMonth() + 1, taskDate.getDate())
                    break
                  case 'yearly':
                    dueDate = new Date(taskDate.getFullYear() + 1, taskDate.getMonth(), taskDate.getDate())
                    break
                  default:
                    dueDate = new Date(taskDate.getTime() + 24 * 60 * 60 * 1000)
                }
                
                const daysOverdue = Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24))
                
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <h3 className="font-medium">{task.task}</h3>
                        <p className="text-sm text-gray-600">Assegnato a: {task.assignee}</p>
                        <p className="text-sm text-gray-600">Frequenza: {task.frequency}</p>
                        <p className="text-sm text-red-600">Scaduto da {daysOverdue} giorni</p>
                        <p className="text-sm text-gray-600">Data creazione: {task.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTask(task.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
                <p className="text-sm text-gray-600">Temperature OK</p>
                <p className="text-2xl font-bold text-green-600">
                  {temperatures.filter(t => t.status === 'ok').length}
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