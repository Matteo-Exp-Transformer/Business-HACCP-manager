import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Trash2, Sparkles, CheckCircle, Clock, Building2, Users } from 'lucide-react'

function CleaningDepartments({ cleaning, setCleaning, departments = [] }) {
  const [formData, setFormData] = useState({
    task: '',
    departmentId: ''
  })

  // Persist to localStorage whenever cleaning data changes
  useEffect(() => {
    localStorage.setItem('haccp-cleaning', JSON.stringify(cleaning))
  }, [cleaning])

  const addCleaningTask = (e) => {
    e.preventDefault()
    if (!formData.task.trim() || !formData.departmentId.trim()) return

    const selectedDepartment = departments.find(dept => dept.id === formData.departmentId)
    if (!selectedDepartment) return

    const newTask = {
      id: Date.now(),
      task: formData.task.trim(),
      departmentId: formData.departmentId,
      departmentName: selectedDepartment.name,
      completed: false,
      date: new Date().toLocaleDateString('it-IT'),
      createdAt: new Date().toLocaleString('it-IT')
    }

    setCleaning([...cleaning, newTask])
    setFormData({ task: '', departmentId: '' })
  }

  const toggleTaskCompletion = (id) => {
    setCleaning(cleaning.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toLocaleString('it-IT') : null }
        : task
    ))
  }

  const deleteTask = (id) => {
    if (confirm('Sei sicuro di voler eliminare questa attività?')) {
      setCleaning(cleaning.filter(task => task.id !== id))
    }
  }

  // Separate completed and pending tasks
  const pendingTasks = cleaning.filter(task => !task.completed)
  const completedTasks = cleaning.filter(task => task.completed)

  // Calcola statistiche per reparto
  const departmentStats = departments.map(dept => {
    const deptTasks = cleaning.filter(task => task.departmentId === dept.id)
    const deptPending = deptTasks.filter(task => !task.completed)
    const deptCompleted = deptTasks.filter(task => task.completed)
    
    return {
      department: dept,
      total: deptTasks.length,
      pending: deptPending.length,
      completed: deptCompleted.length,
      completionRate: deptTasks.length > 0 ? Math.round((deptCompleted.length / deptTasks.length) * 100) : 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            Pulizia e Sanificazione
          </h1>
          <p className="text-gray-600 mt-1">
            Business HACCP Manager - Gestione attività di pulizia per reparti
          </p>
        </div>
      </div>

      {/* Add Cleaning Task Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Nuova Attività di Pulizia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addCleaningTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task">Attività *</Label>
                <Input
                  id="task"
                  placeholder="Es: Pulizia frigorifero, Sanificazione piano lavoro..."
                  value={formData.task}
                  onChange={(e) => setFormData({...formData, task: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Reparto Assegnato *</Label>
                <select
                  id="department"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                  required
                >
                  <option value="">Seleziona reparto...</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Aggiungi Attività
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Totale Attività</p>
                <p className="text-2xl font-bold text-gray-900">{cleaning.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Sospeso</p>
                <p className="text-2xl font-bold text-orange-600">{pendingTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completate</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiche per Reparto */}
      {departmentStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Statistiche per Reparto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentStats.map(stat => (
                <div key={stat.department.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">{stat.department.name}</h4>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Totale:</span>
                      <span className="font-medium">{stat.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-600">In sospeso:</span>
                      <span className="font-medium text-orange-600">{stat.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Completate:</span>
                      <span className="font-medium text-green-600">{stat.completed}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="text-gray-600">Completamento:</span>
                      <span className={`font-medium ${stat.completionRate >= 80 ? 'text-green-600' : stat.completionRate >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                        {stat.completionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Attività in Sospeso ({pendingTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{task.task}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        Reparto: <span className="font-medium">{task.departmentName}</span>
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Creato: {task.createdAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Attività Completate ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 line-through">{task.task}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        Reparto: <span className="font-medium">{task.departmentName}</span>
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Completato: {task.completedAt} • Creato: {task.createdAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleTaskCompletion(task.id)}
                    >
                      Riapri
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {cleaning.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna attività di pulizia</h3>
            <p className="text-gray-600 mb-4">
              Inizia aggiungendo la prima attività di pulizia per i tuoi reparti
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informazioni sistema */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Sistema di Assegnazione per Reparti</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Le attività di pulizia sono ora assegnate ai reparti, non ai singoli utenti</li>
                <li>• Tutti i membri del reparto possono visualizzare e completare le attività assegnate</li>
                <li>• Le statistiche mostrano il carico di lavoro per ogni reparto</li>
                <li>• Usa la gestione reparti per configurare i reparti disponibili</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CleaningDepartments