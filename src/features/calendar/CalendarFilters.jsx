/**
 * Calendar Filters Component - HACCP Business Manager
 * 
 * Advanced filtering for calendar events with HACCP-specific options
 */

import { useState } from 'react'
import { Filter, X, RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { CheckboxWithLabel } from '../../components/ui/Checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal, ModalFooter } from '../../components/ui/Modal'
import { FormSection } from '../../components/forms/FormField'

const CalendarFilters = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange,
  departments = [],
  users = []
}) => {
  const [localFilters, setLocalFilters] = useState(filters)

  // Task types with HACCP context
  const taskTypes = [
    { value: 'temperature', label: 'Controllo Temperature', icon: '🌡️', description: 'Monitoraggio CCP' },
    { value: 'cleaning', label: 'Pulizia e Sanificazione', icon: '🧽', description: 'Igiene e sicurezza' },
    { value: 'maintenance', label: 'Manutenzione', icon: '🔧', description: 'Attrezzature' },
    { value: 'general', label: 'Mansioni Generali', icon: '📋', description: 'Attività operative' }
  ]

  // Priority levels
  const priorities = [
    { value: 'critical', label: 'Critica', color: 'error', description: 'Richiede attenzione immediata' },
    { value: 'high', label: 'Alta', color: 'warning', description: 'Importante per la conformità' },
    { value: 'medium', label: 'Media', color: 'primary', description: 'Normale priorità' },
    { value: 'low', label: 'Bassa', color: 'secondary', description: 'Può essere posticipata' }
  ]

  // Handle checkbox change
  const handleCheckboxChange = (category, value, checked) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], value]
        : prev[category].filter(item => item !== value)
    }))
  }

  // Handle show completed toggle
  const handleShowCompletedChange = (checked) => {
    setLocalFilters(prev => ({
      ...prev,
      showCompleted: checked
    }))
  }

  // Apply filters
  const applyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  // Reset filters
  const resetFilters = () => {
    const emptyFilters = {
      departments: [],
      taskTypes: [],
      priorities: [],
      users: [],
      showCompleted: true
    }
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    return (
      localFilters.departments.length +
      localFilters.taskTypes.length +
      localFilters.priorities.length +
      localFilters.users.length +
      (localFilters.showCompleted ? 0 : 1)
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtri Calendario"
      size="lg"
    >
      <div className="space-y-6">
        {/* Active filters summary */}
        {getActiveFilterCount() > 0 && (
          <Card variant="primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-900">
                    {getActiveFilterCount()} filtri attivi
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Department Filters */}
        <FormSection
          title="Filtra per Reparto"
          description="Mostra solo le mansioni di specifici reparti"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {departments.map((department) => (
              <CheckboxWithLabel
                key={department.id}
                id={`dept-${department.id}`}
                label={department.name}
                description={department.description}
                checked={localFilters.departments.includes(department.id)}
                onChange={(checked) => handleCheckboxChange('departments', department.id, checked)}
              />
            ))}
          </div>
        </FormSection>

        {/* Task Type Filters */}
        <FormSection
          title="Filtra per Tipo di Mansione"
          description="Mostra solo specifici tipi di attività"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {taskTypes.map((type) => (
              <Card 
                key={type.value}
                className={`cursor-pointer transition-all ${
                  localFilters.taskTypes.includes(type.value) 
                    ? 'ring-2 ring-primary-300 bg-primary-50' 
                    : 'hover:bg-neutral-50'
                }`}
                onClick={() => handleCheckboxChange('taskTypes', type.value, !localFilters.taskTypes.includes(type.value))}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{type.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">
                        {type.label}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {type.description}
                      </div>
                    </div>
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center
                      ${localFilters.taskTypes.includes(type.value)
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-neutral-300'
                      }
                    `}>
                      {localFilters.taskTypes.includes(type.value) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </FormSection>

        {/* Priority Filters */}
        <FormSection
          title="Filtra per Priorità"
          description="Mostra solo mansioni con specifiche priorità"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {priorities.map((priority) => (
              <Card 
                key={priority.value}
                variant={localFilters.priorities.includes(priority.value) ? priority.color : 'default'}
                className={`cursor-pointer transition-all ${
                  localFilters.priorities.includes(priority.value) 
                    ? 'ring-2 ring-offset-2' 
                    : 'hover:shadow-medium'
                }`}
                onClick={() => handleCheckboxChange('priorities', priority.value, !localFilters.priorities.includes(priority.value))}
              >
                <CardContent className="p-3 text-center">
                  <div className="font-medium">
                    {priority.label}
                  </div>
                  <div className="text-xs mt-1 opacity-75">
                    {priority.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </FormSection>

        {/* User Filters */}
        {users.length > 0 && (
          <FormSection
            title="Filtra per Assegnatario"
            description="Mostra solo mansioni assegnate a specifici utenti"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {users.map((user) => (
                <CheckboxWithLabel
                  key={user.id}
                  id={`user-${user.id}`}
                  label={`${user.first_name} ${user.last_name}`}
                  description={user.role}
                  checked={localFilters.users.includes(user.id)}
                  onChange={(checked) => handleCheckboxChange('users', user.id, checked)}
                />
              ))}
            </div>
          </FormSection>
        )}

        {/* Display Options */}
        <FormSection
          title="Opzioni Visualizzazione"
          description="Personalizza cosa mostrare nel calendario"
        >
          <CheckboxWithLabel
            id="show-completed"
            label="Mostra mansioni completate"
            description="Include le mansioni già completate nel calendario"
            checked={localFilters.showCompleted}
            onChange={handleShowCompletedChange}
          />
        </FormSection>

        {/* Applied Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <FormSection
            title="Filtri Applicati"
            description="Riepilogo dei filtri attualmente attivi"
          >
            <div className="flex flex-wrap gap-2">
              {localFilters.departments.map(deptId => {
                const dept = departments.find(d => d.id === deptId)
                return dept ? (
                  <Badge key={deptId} variant="primary" size="sm">
                    {dept.name}
                  </Badge>
                ) : null
              })}
              
              {localFilters.taskTypes.map(type => {
                const typeConfig = taskTypes.find(t => t.value === type)
                return typeConfig ? (
                  <Badge key={type} variant="secondary" size="sm">
                    {typeConfig.icon} {typeConfig.label}
                  </Badge>
                ) : null
              })}
              
              {localFilters.priorities.map(priority => {
                const priorityConfig = priorities.find(p => p.value === priority)
                return priorityConfig ? (
                  <Badge key={priority} variant={priorityConfig.color} size="sm">
                    {priorityConfig.label}
                  </Badge>
                ) : null
              })}
              
              {!localFilters.showCompleted && (
                <Badge variant="warning" size="sm">
                  Solo pendenti
                </Badge>
              )}
            </div>
          </FormSection>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Annulla
        </Button>
        <Button variant="primary" onClick={applyFilters}>
          Applica Filtri
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default CalendarFilters