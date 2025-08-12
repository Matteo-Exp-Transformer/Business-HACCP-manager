/**
 * OnboardingWizard - Wizard per configurazione iniziale HACCP
 * 
 * Questo componente guida l'utente attraverso:
 * 1. Selezione preset attività
 * 2. Creazione dipartimenti
 * 3. Configurazione punti di conservazione
 * 4. Registrazione personale
 * 5. Configurazioni opzionali
 * 
 * @version 1.0
 * @critical Onboarding - Configurazione iniziale
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  Building2, 
  Thermometer, 
  Users, 
  Truck, 
  BookOpen,
  Sparkles,
  Info
} from 'lucide-react'
import { shouldBypassOnboarding } from '../utils/devMode'
import PresetSelector from './PresetSelector'
import { applyPreset } from '../utils/presetService'

const ONBOARDING_STEPS = [
  {
    id: 'preset',
    title: 'Selezione Attività',
    description: 'Scegli il tipo di attività per configurare automaticamente le impostazioni base',
    icon: Building2,
    required: true
  },
  {
    id: 'departments',
    title: 'Dipartimenti',
    description: 'Organizza la struttura operativa della tua azienda',
    icon: Building2,
    required: true
  },
  {
    id: 'refrigerators',
    title: 'Punti di Conservazione',
    description: 'Configura frigoriferi e freezer per il controllo temperature',
    icon: Thermometer,
    required: true
  },
  {
    id: 'staff',
    title: 'Personale e Ruoli',
    description: 'Registra il personale e assegna responsabilità',
    icon: Users,
    required: true
  },
  {
    id: 'suppliers',
    title: 'Fornitori (Opzionale)',
    description: 'Gestisci i fornitori per la tracciabilità dei prodotti',
    icon: Truck,
    required: false
  },
  {
    id: 'manual',
    title: 'Manuale HACCP (Opzionale)',
    description: 'Consulta la guida operativa per le procedure HACCP',
    icon: BookOpen,
    required: false
  }
]

function OnboardingWizard({ isOpen, onClose, onComplete, currentData = {} }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [formData, setFormData] = useState({
    preset: '',
    departments: [],
    refrigerators: [],
    staff: [],
    suppliers: [],
    manual: false
  })

  // Controlla se l'onboarding è bypassato in modalità dev
  useEffect(() => {
    if (shouldBypassOnboarding()) {
      onComplete && onComplete()
      return
    }
  }, [onComplete])

  // Carica progresso salvato
  useEffect(() => {
    const savedProgress = localStorage.getItem('haccp-onboarding')
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        setCurrentStep(progress.currentStep || 0)
        setCompletedSteps(new Set(progress.completedSteps || []))
        setFormData(progress.formData || formData)
      } catch (error) {
        console.warn('Errore nel caricamento progresso onboarding:', error)
      }
    }
  }, [])

  // Salva progresso
  const saveProgress = () => {
    const progress = {
      currentStep,
      completedSteps: Array.from(completedSteps),
      formData,
      lastActivity: new Date().toISOString()
    }
    localStorage.setItem('haccp-onboarding', JSON.stringify(progress))
  }

  // Avanza al prossimo step
  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      setCompletedSteps(prev => new Set([...prev, ONBOARDING_STEPS[currentStep].id]))
      saveProgress()
    }
  }

  // Torna allo step precedente
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      saveProgress()
    }
  }

  // Completa l'onboarding
  const completeOnboarding = async () => {
    setCompletedSteps(prev => new Set([...prev, ONBOARDING_STEPS[currentStep].id]))
    saveProgress()
    
    // Applica il preset selezionato
    if (formData.preset) {
      try {
        const result = await applyPreset(formData.preset)
        if (result.success) {
          console.log(`✅ Preset ${formData.preset} applicato con successo:`, result.created)
        } else {
          console.warn(`⚠️ Preset ${formData.preset} applicato con errori:`, result.errors)
        }
      } catch (error) {
        console.error(`❌ Errore nell'applicazione preset ${formData.preset}:`, error)
      }
    }
    
    onComplete && onComplete(formData)
  }

  // Aggiorna i dati del form
  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    saveProgress()
  }

  // Renderizza lo step corrente
  const renderCurrentStep = () => {
    const step = ONBOARDING_STEPS[currentStep]
    
    switch (step.id) {
      case 'preset':
        return renderPresetStep()
      case 'departments':
        return renderDepartmentsStep()
      case 'refrigerators':
        return renderRefrigeratorsStep()
      case 'staff':
        return renderStaffStep()
      case 'suppliers':
        return renderSuppliersStep()
      case 'manual':
        return renderManualStep()
      default:
        return null
    }
  }

  // Step selezione preset
  const renderPresetStep = () => (
    <div className="space-y-6">
      <PresetSelector
        onPresetSelect={(preset) => updateFormData('preset', preset)}
        currentPreset={formData.preset}
      />
    </div>
  )

  // Step dipartimenti
  const renderDepartmentsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Organizza i tuoi dipartimenti</h3>
        <p className="text-gray-600">I dipartimenti organizzano la struttura operativa e facilitano la gestione HACCP</p>
      </div>
      
      <div className="space-y-4">
        {formData.departments.map((dept, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Input
              value={dept}
              onChange={(e) => {
                const newDepts = [...formData.departments]
                newDepts[index] = e.target.value
                updateFormData('departments', newDepts)
              }}
              placeholder="Nome dipartimento"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDepts = formData.departments.filter((_, i) => i !== index)
                updateFormData('departments', newDepts)
              }}
            >
              Rimuovi
            </Button>
          </div>
        ))}
        
        <Button
          variant="outline"
          onClick={() => {
            const newDepts = [...formData.departments, '']
            updateFormData('departments', newDepts)
          }}
          className="w-full"
        >
          + Aggiungi Dipartimento
        </Button>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Perché è importante?</p>
            <p className="text-sm text-green-800 mt-1">
              I dipartimenti organizzano le responsabilità, facilitano la gestione HACCP 
              e garantiscono che ogni area abbia procedure specifiche per la sicurezza alimentare.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Step punti di conservazione (ex frigoriferi)
  const renderRefrigeratorsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Configura i punti di conservazione</h3>
        <p className="text-gray-600">I punti di conservazione (frigoriferi e freezer) sono punti di controllo critici per la sicurezza alimentare HACCP</p>
      </div>
      
      <div className="space-y-4">
        {formData.refrigerators.map((fridge, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                value={fridge.name}
                onChange={(e) => {
                  const newFridges = [...formData.refrigerators]
                  newFridges[index] = { ...fridge, name: e.target.value }
                  updateFormData('refrigerators', newFridges)
                }}
                placeholder="Nome (es. Frigo A)"
              />
              <Input
                type="number"
                value={fridge.tempMin}
                onChange={(e) => {
                  const newFridges = [...formData.refrigerators]
                  newFridges[index] = { ...fridge, tempMin: e.target.value }
                  updateFormData('refrigerators', newFridges)
                }}
                placeholder="Temp. min (°C)"
              />
              <Input
                type="number"
                value={fridge.tempMax}
                onChange={(e) => {
                  const newFridges = [...formData.refrigerators]
                  newFridges[index] = { ...fridge, tempMax: e.target.value }
                  updateFormData('refrigerators', newFridges)
                }}
                placeholder="Temp. max (°C)"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newFridges = formData.refrigerators.filter((_, i) => i !== index)
                updateFormData('refrigerators', newFridges)
              }}
              className="mt-3"
            >
              Rimuovi
            </Button>
          </Card>
        ))}
        
        <Button
          variant="outline"
          onClick={() => {
            const newFridges = [...formData.refrigerators, { name: '', tempMin: '', tempMax: '' }]
            updateFormData('refrigerators', newFridges)
          }}
          className="w-full"
        >
          + Aggiungi Punto di Conservazione
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Standard HACCP per punti di conservazione</p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Frigo A (Freschi):</strong> 2-4°C per latticini, salumi, verdure<br/>
              <strong>Frigo B (Surgelati):</strong> -19 a -16°C per surgelati e gelati<br/>
              <strong>Banco ingredienti:</strong> 0-8°C per ingredienti freschi
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Step personale
  const renderStaffStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Registra il personale</h3>
        <p className="text-gray-600">Il personale formato è responsabile dell'applicazione delle procedure HACCP</p>
      </div>
      
      <div className="space-y-4">
        {formData.staff.map((member, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={member.name}
                onChange={(e) => {
                  const newStaff = [...formData.staff]
                  newStaff[index] = { ...member, name: e.target.value }
                  updateFormData('staff', newStaff)
                }}
                placeholder="Nome completo"
              />
              <select
                value={member.role}
                onChange={(e) => {
                  const newStaff = [...formData.staff]
                  newStaff[index] = { ...member, role: e.target.value }
                  updateFormData('staff', newStaff)
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleziona ruolo</option>
                <option value="amministratore">Amministratore</option>
                <option value="responsabile">Responsabile</option>
                <option value="dipendente">Dipendente</option>
                <option value="collaboratore">Collaboratore Occasionale</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newStaff = formData.staff.filter((_, i) => i !== index)
                updateFormData('staff', newStaff)
              }}
              className="mt-3"
            >
              Rimuovi
            </Button>
          </Card>
        ))}
        
        <Button
          variant="outline"
          onClick={() => {
            const newStaff = [...formData.staff, { name: '', role: '' }]
            updateFormData('staff', newStaff)
          }}
          className="w-full"
        >
          + Aggiungi Membro Staff
        </Button>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-medium text-purple-900">Perché è importante?</p>
            <p className="text-sm text-purple-800 mt-1">
              Il personale formato e responsabilizzato garantisce l'applicazione corretta delle procedure HACCP. 
              Ogni ruolo ha responsabilità specifiche per la sicurezza alimentare.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Step fornitori (opzionale)
  const renderSuppliersStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Gestione Fornitori (Opzionale)</h3>
        <p className="text-gray-600">I fornitori qualificati garantiscono materie prime sicure e conformi</p>
      </div>
      
      <div className="text-center py-8">
        <Truck className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-4">
          Questa sezione è opzionale e può essere configurata successivamente.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            updateFormData('suppliers', [])
            nextStep()
          }}
        >
          Salta per ora
        </Button>
      </div>
    </div>
  )

  // Step manuale (opzionale)
  const renderManualStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Manuale HACCP (Opzionale)</h3>
        <p className="text-gray-600">Consulta la guida operativa per le procedure HACCP</p>
      </div>
      
      <div className="text-center py-8">
        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-4">
          Il manuale HACCP è sempre disponibile nella sezione Impostazioni e Dati.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            updateFormData('manual', true)
            nextStep()
          }}
        >
          Salta per ora
        </Button>
      </div>
    </div>
  )

  // Calcola il progresso
  const progress = Math.round((completedSteps.size / ONBOARDING_STEPS.length) * 100)
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
  const canProceed = () => {
    const step = ONBOARDING_STEPS[currentStep]
    if (!step.required) return true
    
    switch (step.id) {
      case 'preset':
        return formData.preset
      case 'departments':
        return formData.departments.length > 0 && formData.departments.every(d => d.trim())
      case 'refrigerators':
        return formData.refrigerators.length > 0 && formData.refrigerators.every(f => f.name && f.tempMin && f.tempMax)
      case 'staff':
        return formData.staff.length > 0 && formData.staff.every(s => s.name && s.role)
      default:
        return true
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Configurazione Iniziale HACCP</h2>
            <Button variant="outline" onClick={onClose}>
              Chiudi
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progresso: {progress}%</span>
              <span>Step {currentStep + 1} di {ONBOARDING_STEPS.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {index > 0 && <div className="w-8 h-px bg-gray-300 mx-2"></div>}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  completedSteps.has(step.id) 
                    ? 'bg-green-500 text-white' 
                    : index === currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {completedSteps.has(step.id) ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderCurrentStep()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Precedente
          </Button>
          
          <div className="flex gap-2">
            {isLastStep ? (
              <Button
                onClick={completeOnboarding}
                disabled={!canProceed()}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Completa Configurazione
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
              >
                Avanti
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingWizard
