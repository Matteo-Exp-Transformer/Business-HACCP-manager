/**
 * Departments Step - Onboarding Wizard
 * 
 * Configure business departments with presets and custom options
 */

import { useState } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Building2, Plus, Trash2, Check } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { InputField, CheckboxField, FormSection } from '../../../components/forms/FormField'
import { Card, CardContent } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'

const DepartmentsStep = () => {
  const { control, register, formState: { errors } } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'departments'
  })

  // Preset departments
  const presetDepartments = [
    {
      name: 'Cucina',
      description: 'Reparto di preparazione e cottura',
      isCustom: false
    },
    {
      name: 'Sala',
      description: 'Servizio clienti e sala da pranzo',
      isCustom: false
    },
    {
      name: 'Magazzino',
      description: 'Deposito e stoccaggio merci',
      isCustom: false
    },
    {
      name: 'Bancone',
      description: 'Servizio al banco e cassa',
      isCustom: false
    }
  ]

  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' })

  // Add preset department
  const addPresetDepartment = (preset) => {
    const exists = fields.some(field => field.name === preset.name)
    if (!exists) {
      append({
        ...preset,
        isActive: true
      })
    }
  }

  // Add custom department
  const addCustomDepartment = () => {
    if (newDepartment.name.trim()) {
      const exists = fields.some(field => field.name === newDepartment.name)
      if (!exists) {
        append({
          ...newDepartment,
          isCustom: true,
          isActive: true
        })
        setNewDepartment({ name: '', description: '' })
      }
    }
  }

  // Remove department
  const removeDepartment = (index) => {
    remove(index)
  }

  return (
    <div className="space-y-6">
      <FormSection
        title="Reparti Aziendali"
        description="Configura i reparti della tua attività per organizzare staff e mansioni"
      >
        {/* Preset departments */}
        <div>
          <h4 className="font-medium text-neutral-900 mb-3">
            Reparti Consigliati
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {presetDepartments.map((preset) => {
              const isAdded = fields.some(field => field.name === preset.name)
              
              return (
                <Card 
                  key={preset.name}
                  hover={!isAdded}
                  className={`cursor-pointer transition-all ${isAdded ? 'bg-success-50 border-success-200' : ''}`}
                  onClick={() => !isAdded && addPresetDepartment(preset)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-primary-600" />
                        <div>
                          <div className="font-medium text-neutral-900">
                            {preset.name}
                          </div>
                          <div className="text-sm text-neutral-600">
                            {preset.description}
                          </div>
                        </div>
                      </div>
                      {isAdded ? (
                        <Badge variant="success">
                          <Check className="w-3 h-3" />
                          Aggiunto
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Plus className="w-3 h-3" />
                          Aggiungi
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Custom department form */}
        <div>
          <h4 className="font-medium text-neutral-900 mb-3">
            Aggiungi Reparto Personalizzato
          </h4>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nome reparto"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Descrizione (opzionale)"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                  className="form-input"
                />
                <Button
                  type="button"
                  onClick={addCustomDepartment}
                  disabled={!newDepartment.name.trim()}
                  className="w-full md:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected departments */}
        {fields.length > 0 && (
          <div>
            <h4 className="font-medium text-neutral-900 mb-3">
              Reparti Configurati ({fields.length})
            </h4>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-primary-600" />
                        <div>
                          <div className="font-medium text-neutral-900">
                            {field.name}
                          </div>
                          {field.description && (
                            <div className="text-sm text-neutral-600">
                              {field.description}
                            </div>
                          )}
                        </div>
                        {field.isCustom && (
                          <Badge variant="secondary" size="sm">
                            Personalizzato
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeDepartment(index)}
                        className="text-error-600 hover:text-error-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Validation error */}
        {errors.departments && (
          <div className="text-error-600 text-sm">
            {errors.departments.message}
          </div>
        )}
      </FormSection>

      {/* HACCP Requirements */}
      <FormSection
        title="Requisiti HACCP"
        description="Informazioni importanti per la conformità"
      >
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-warning-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-warning-900 mb-1">
                Organizzazione per la Sicurezza Alimentare
              </h4>
              <p className="text-sm text-warning-700">
                I reparti configurati verranno utilizzati per:
              </p>
              <ul className="text-sm text-warning-700 mt-2 space-y-1">
                <li>• Assegnazione responsabilità HACCP</li>
                <li>• Organizzazione mansioni di pulizia e manutenzione</li>
                <li>• Tracciabilità delle attività per reparto</li>
                <li>• Gestione punti di controllo critici</li>
              </ul>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  )
}

export default DepartmentsStep