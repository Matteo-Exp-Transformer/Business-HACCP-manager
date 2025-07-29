import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Trash2, Sparkles, CheckCircle, Clock } from 'lucide-react'

function Cleaning({ cleaning, setCleaning }) {
  const [formData, setFormData] = useState({
    task: '',
    assignee: ''
  })

  // Persist to localStorage whenever cleaning data changes
  useEffect(() => {
    localStorage.setItem('haccp-cleaning', JSON.stringify(cleaning))
  }, [cleaning])

  const addCleaningTask = (e) => {
    e.preventDefault()
    if (!formData.task.trim() || !formData.assignee.trim()) return

    const newTask = {
      id: Date.now(),
      task: formData.task.trim(),
      assignee: formData.assignee.trim(),
      completed: false,
      date: new Date().toLocaleDateString('it-IT'),
      createdAt: new Date().toLocaleString('it-IT')
    }

    setCleaning([...cleaning, newTask])
    setFormData({ task: '', assignee: '' })
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

  return (
    <div className="space-y-6">
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
            </div>
            <Button type="submit" className="w-full">
              Aggiungi Attività
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totale Attività</p>
                <p className="text-2xl font-bold">{cleaning.length}</p>
              </div>
              <Sparkles className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Sospeso</p>
                <p className="text-2xl font-bold text-orange-600">{pendingTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completate</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                <div key={task.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{task.task}</div>
                    <div className="text-sm text-gray-600">
                      Assegnato a: <span className="font-medium">{task.assignee}</span>
                    </div>
                    <div className="text-xs text-gray-500">{task.createdAt}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => toggleTaskCompletion(task.id)}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completa
                    </Button>
                    <Button
                      onClick={() => deleteTask(task.id)}
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
              {completedTasks.slice().reverse().map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-green-800">{task.task}</div>
                    <div className="text-sm text-green-700">
                      Completato da: <span className="font-medium">{task.assignee}</span>
                    </div>
                    <div className="text-xs text-green-600">
                      {task.completedAt && `Completato: ${task.completedAt}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => toggleTaskCompletion(task.id)}
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Riapri
                    </Button>
                    <Button
                      onClick={() => deleteTask(task.id)}
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
          <CardContent className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Nessuna attività di pulizia registrata</p>
            <p className="text-sm text-gray-500">
              Aggiungi la prima attività per iniziare a tracciare le pulizie HACCP
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Cleaning