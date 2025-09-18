/**
 * Tasks Step - Onboarding Wizard
 * 
 * Configure basic tasks and maintenance schedules
 */

import { useState } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { CheckSquare, Plus, Trash2, Clock, Users, Wrench, Thermometer } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { FormSection } from '../../../components/forms/FormField'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'

const TasksStep = () => {
  const { control, formState: { errors }, watch } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks'
  })

  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    type: 'general',
    frequency: 'daily',
    priority: 'medium',
    assignedToRole: 'employee',
    assignedToDepartmentId: '',
    conservationPointId: ''
  })

  // Watch form data for dependencies
  const departments = watch('departments') || []
  const conservationPoints = watch('conservationPoints') || []

  // Task types with HACCP context
  const taskTypes = [
    {
      value: 'general',
      label: 'Mansione Generale',
      icon: CheckSquare,
      description: 'Attività operative standard',
      color: 'text-neutral-600'
    },
    {
      value: 'cleaning',
      label: 'Pulizia e Sanificazione',
      icon: '🧽',
      description: 'Attività di igiene e pulizia',
      color: 'text-blue-600'
    },
    {
      value: 'maintenance',
      label: 'Manutenzione',
      icon: Wrench,
      description: 'Manutenzione attrezzature',
      color: 'text-orange-600'
    },
    {
      value: 'temperature',
      label: 'Controllo Temperature',
      icon: Thermometer,
      description: 'Monitoraggio CCP temperatura',
      color: 'text-red-600'
    }
  ]

  const frequencies = [
    { value: 'daily', label: 'Giornaliera', description: 'Ogni giorno' },
    { value: 'weekly', label: 'Settimanale', description: 'Una volta a settimana' },
    { value: 'monthly', label: 'Mensile', description: 'Una volta al mese' },
    { value: 'yearly', label: 'Annuale', description: 'Una volta all\'anno' }
  ]

  const priorities = [
    { value: 'low', label: 'Bassa', color: 'text-neutral-600' },
    { value: 'medium', label: 'Media', color: 'text-primary-600' },
    { value: 'high', label: 'Alta', color: 'text-warning-600' },
    { value: 'critical', label: 'Critica', color: 'text-error-600' }
  ]

  // Preset tasks based on HACCP requirements
  const presetTasks = [
    {
      name: 'Controllo temperature frigoriferi',
      description: 'Verifica e registrazione temperature punti di conservazione',
      type: 'temperature',
      frequency: 'daily',
      priority: 'critical',
      assignedToRole: 'employee'
    },
    {
      name: 'Pulizia e sanificazione superfici',
      description: 'Pulizia approfondita di tutte le superfici di lavoro',
      type: 'cleaning',
      frequency: 'daily',
      priority: 'high',
      assignedToRole: 'employee'
    },
    {
      name: 'Controllo scadenze prodotti',
      description: 'Verifica date di scadenza e rotazione stock',
      type: 'general',
      frequency: 'daily',
      priority: 'high',
      assignedToRole: 'employee'
    },
    {
      name: 'Manutenzione attrezzature',
      description: 'Controllo e manutenzione periodica delle attrezzature',
      type: 'maintenance',
      frequency: 'weekly',
      priority: 'medium',
      assignedToRole: 'manager'
    }
  ]

  // Add preset task
  const addPresetTask = (preset) => {
    const exists = fields.some(field => field.name === preset.name)
    if (!exists) {
      append({
        ...preset,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isActive: true,
        createdAt: new Date().toISOString()
      })
    }
  }

  // Add custom task
  const addCustomTask = () => {
    if (newTask.name.trim()) {
      const nameExists = fields.some(field => 
        field.name.toLowerCase() === newTask.name.toLowerCase()
      )
      
      if (nameExists) {
        alert('Una mansione con questo nome esiste già')
        return
      }

      append({
        ...newTask,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isActive: true,
        createdAt: new Date().toISOString()
      })
      
      setNewTask({
        name: '',
        description: '',
        type: 'general',
        frequency: 'daily',
        priority: 'medium',
        assignedToRole: 'employee',
        assignedToDepartmentId: '',
        conservationPointId: ''
      })
    }
  }

  // Remove task
  const removeTask = (index) => {
    if (fields.length > 1) {
      remove(index)
    } else {
      alert('Deve rimanere almeno una mansione configurata')
    }
  }

  // Get type configuration
  const getTypeConfig = (type) => {
    return taskTypes.find(t => t.value === type)
  }

  // Get frequency label
  const getFrequencyLabel = (freq) => {
    return frequencies.find(f => f.value === freq)?.label || freq
  }

  // Get priority configuration
  const getPriorityConfig = (priority) => {
    return priorities.find(p => p.value === priority)
  }

  return (
    <div className="space-y-8">
      {/* Preset Tasks */}
      <FormSection
        title="Mansioni HACCP Essenziali"
        description="Mansioni fondamentali per la conformità alle normative"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presetTasks.map((preset) => {
            const isAdded = fields.some(field => field.name === preset.name)
            const typeConfig = getTypeConfig(preset.type)
            const priorityConfig = getPriorityConfig(preset.priority)
            
            return (
              <Card 
                key={preset.name}
                hover={!isAdded}
                variant={isAdded ? 'success' : 'default'}
                className={`cursor-pointer transition-all ${isAdded ? 'ring-2 ring-success-200' : ''}`}
                onClick={() => !isAdded && addPresetTask(preset)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {typeof typeConfig?.icon === 'string' ? (
                          <span className="text-lg">{typeConfig.icon}</span>
                        ) : (
                          <typeConfig?.icon className={`w-5 h-5 ${typeConfig?.color}`} />
                        )}
                        <span className="font-medium text-neutral-900">
                          {preset.name}
                        </span>
                      </div>
                      {isAdded ? (
                        <Badge variant="success" size="sm">
                          Aggiunta
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Plus className="w-3 h-3" />
                          Aggiungi
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-sm text-neutral-600">
                      {preset.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="secondary" size="sm">
                        <Clock className="w-3 h-3" />
                        {getFrequencyLabel(preset.frequency)}
                      </Badge>
                      <Badge 
                        variant={preset.priority === 'critical' ? 'error' : preset.priority === 'high' ? 'warning' : 'secondary'} 
                        size="sm"
                      >
                        Priorità {priorityConfig?.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </FormSection>

      {/* Custom Task Form */}
      <FormSection
        title="Mansione Personalizzata"
        description="Crea una mansione specifica per le tue esigenze"
      >
        <Card>
          <CardHeader>
            <CardTitle size="sm">
              <CheckSquare className="w-5 h-5 text-primary-600" />
              Nuova Mansione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome mansione *"
                value={newTask.name}
                onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                required
              />
              
              <textarea
                placeholder="Descrizione dettagliata (opzionale)"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                className="form-input"
                rows="3"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={newTask.type}
                  onChange={(e) => setNewTask(prev => ({ ...prev, type: e.target.value }))}
                  className="form-input"
                >
                  {taskTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <select
                  value={newTask.frequency}
                  onChange={(e) => setNewTask(prev => ({ ...prev, frequency: e.target.value }))}
                  className="form-input"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label} - {freq.description}
                    </option>
                  ))}
                </select>

                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                  className="form-input"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      Priorità {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={newTask.assignedToRole}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignedToRole: e.target.value }))}
                  className="form-input"
                >
                  <option value="employee">Assegna a: Dipendenti</option>
                  <option value="manager">Assegna a: Responsabili</option>
                  <option value="admin">Assegna a: Amministratori</option>
                  <option value="collaborator">Assegna a: Collaboratori</option>
                </select>

                <select
                  value={newTask.assignedToDepartmentId}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignedToDepartmentId: e.target.value }))}
                  className="form-input"
                >
                  <option value="">Tutti i reparti</option>
                  {departments.map(dept => (
                    <option key={dept.id || dept.name} value={dept.id || dept.name}>
                      Solo {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conservation Point Assignment (for temperature tasks) */}
              {newTask.type === 'temperature' && conservationPoints.length > 0 && (
                <select
                  value={newTask.conservationPointId}
                  onChange={(e) => setNewTask(prev => ({ ...prev, conservationPointId: e.target.value }))}
                  className="form-input"
                >
                  <option value="">Seleziona punto di conservazione</option>
                  {conservationPoints.map(point => (
                    <option key={point.id || point.name} value={point.id || point.name}>
                      {point.name} ({point.type})
                    </option>
                  ))}
                </select>
              )}

              <Button
                type="button"
                onClick={addCustomTask}
                disabled={!newTask.name.trim()}
                className="w-full"
              >
                <Plus className="w-4 h-4" />
                Aggiungi Mansione
              </Button>
            </div>
          </CardContent>
        </Card>
      </FormSection>

      {/* Tasks List */}
      {fields.length > 0 && (
        <FormSection
          title={`Mansioni Configurate (${fields.length})`}
          description="Mansioni che verranno utilizzate per il controllo HACCP"
        >
          <div className="space-y-3">
            {fields.map((field, index) => {
              const typeConfig = getTypeConfig(field.type)
              const priorityConfig = getPriorityConfig(field.priority)
              
              return (
                <Card key={field.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          {typeof typeConfig?.icon === 'string' ? (
                            <span className="text-lg">{typeConfig.icon}</span>
                          ) : (
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-neutral-900">
                              {field.name}
                            </span>
                            <Badge 
                              variant={
                                field.priority === 'critical' ? 'error' : 
                                field.priority === 'high' ? 'warning' : 
                                'secondary'
                              } 
                              size="sm"
                            >
                              {priorityConfig?.label}
                            </Badge>
                          </div>
                          
                          {field.description && (
                            <p className="text-sm text-neutral-600 mb-2">
                              {field.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="primary" size="sm">
                              <Clock className="w-3 h-3" />
                              {getFrequencyLabel(field.frequency)}
                            </Badge>
                            
                            <Badge variant="secondary" size="sm">
                              <Users className="w-3 h-3" />
                              {field.assignedToRole}
                            </Badge>
                            
                            {field.assignedToDepartmentId && (
                              <Badge variant="secondary" size="sm">
                                {getDepartmentName(field.assignedToDepartmentId)}
                              </Badge>
                            )}
                            
                            {field.conservationPointId && (
                              <Badge variant="warning" size="sm">
                                <Thermometer className="w-3 h-3" />
                                CCP: {getConservationPointName(field.conservationPointId)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {fields.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeTask(index)}
                          className="text-error-600 hover:text-error-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Validation error */}
          {errors.tasks && (
            <div className="text-error-600 text-sm mt-2">
              {errors.tasks.message}
            </div>
          )}
        </FormSection>
      )}

      {/* HACCP Task Requirements */}
      <FormSection
        title="Requisiti HACCP per le Mansioni"
        description="Importanza delle mansioni nella gestione della sicurezza alimentare"
      >
        <Card variant="success">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-success-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-success-900">
                  Sistema di Mansioni HACCP
                </h4>
                <p className="text-sm text-success-800">
                  Le mansioni configurate garantiscono:
                </p>
                <ul className="text-sm text-success-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-success-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Controllo sistematico:</strong> Monitoraggio regolare dei CCP
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-success-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Tracciabilità:</strong> Registro completo delle attività svolte
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-success-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Responsabilità:</strong> Assegnazione chiara per ogni attività
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-success-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Compliance:</strong> Conformità automatica alle normative
                    </div>
                  </li>
                </ul>
                <div className="pt-3 border-t border-success-200">
                  <p className="text-xs text-success-600 font-medium">
                    ✅ Minimo 1 mansione richiesta per attivare il sistema HACCP
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FormSection>

      {/* Task Statistics */}
      {fields.length > 0 && (
        <FormSection
          title="Riepilogo Mansioni"
          description="Statistiche delle mansioni configurate"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {fields.length}
                </div>
                <div className="text-sm text-neutral-600">
                  Totale Mansioni
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-error-600">
                  {fields.filter(f => f.priority === 'critical').length}
                </div>
                <div className="text-sm text-neutral-600">
                  Critiche
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success-600">
                  {fields.filter(f => f.frequency === 'daily').length}
                </div>
                <div className="text-sm text-neutral-600">
                  Giornaliere
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning-600">
                  {fields.filter(f => f.type === 'temperature').length}
                </div>
                <div className="text-sm text-neutral-600">
                  Controllo CCP
                </div>
              </CardContent>
            </Card>
          </div>
        </FormSection>
      )}
    </div>
  )

  // Helper functions
  function getDepartmentName(departmentId) {
    const dept = departments.find(d => d.id === departmentId || d.name === departmentId)
    return dept?.name || 'Tutti i reparti'
  }

  function getConservationPointName(pointId) {
    const point = conservationPoints.find(p => p.id === pointId || p.name === pointId)
    return point?.name || 'Punto non specificato'
  }
}

export default TasksStep