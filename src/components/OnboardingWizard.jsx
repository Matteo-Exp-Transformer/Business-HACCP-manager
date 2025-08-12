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
 * @version 2.0 - Aggiornato con validazioni e moduli integrati
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
  Info,
  Plus,
  Edit,
  Trash2
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
    manual: false,
    manualVersion: '',
    manualDate: '',
    manualNotes: ''
  })
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)

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
    
    // Salva i dati nel localStorage per sincronizzazione
    localStorage.setItem('haccp-departments', JSON.stringify(formData.departments))
    localStorage.setItem('haccp-refrigerators', JSON.stringify(formData.refrigerators))
    localStorage.setItem('haccp-staff', JSON.stringify(formData.staff))
    localStorage.setItem('haccp-suppliers', JSON.stringify(formData.suppliers))
    localStorage.setItem('haccp-manual', JSON.stringify({
      version: formData.manualVersion,
      date: formData.manualDate,
      notes: formData.manualNotes
    }))
    
    // Mostra schermata di successo con pulsanti guida
    setShowSuccessScreen(true)
  }

  // Aggiorna i dati del form
  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    saveProgress()
  }

  // Aggiunge un elemento e aggiorna i dati
  const addItem = (key, item) => {
    const newItems = [...formData[key], item]
    updateFormData(key, newItems)
  }

  // Rimuove un elemento
  const removeItem = (key, index) => {
    const newItems = formData[key].filter((_, i) => i !== index)
    updateFormData(key, newItems)
  }

  // Aggiorna un elemento specifico
  const updateItem = (key, index, updatedItem) => {
    const newItems = [...formData[key]]
    newItems[index] = updatedItem
    updateFormData(key, newItems)
  }

  // Renderizza lo step corrente
  const renderCurrentStep = () => {
    if (showSuccessScreen) {
      return renderSuccessScreen()
    }
    
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

  // Schermata di successo con pulsanti guida
  const renderSuccessScreen = () => (
    <div className="text-center space-y-8 py-8">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Configurazione Completata!</h3>
        <p className="text-gray-600 mb-6">
          La tua configurazione HACCP è stata salvata. Ora puoi iniziare a utilizzare l'app o continuare con la configurazione.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <Button
          onClick={() => {
            // Naviga alla sezione Staff
            window.location.hash = '#staff'
            onComplete && onComplete(formData)
          }}
          className="h-auto p-4 flex flex-col items-center space-y-2"
        >
          <Users className="h-6 w-6" />
          <span>Aggiungi Membro Personale</span>
        </Button>

        <Button
          onClick={() => {
            // Naviga alla sezione Inventario
            window.location.hash = '#inventory'
            onComplete && onComplete(formData)
          }}
          className="h-auto p-4 flex flex-col items-center space-y-2"
        >
          <Plus className="h-6 w-6" />
          <span>Aggiungi Prodotto a Inventario</span>
        </Button>

        <Button
          onClick={() => {
            // Naviga alla sezione Mansioni
            window.location.hash = '#departments'
            onComplete && onComplete(formData)
          }}
          className="h-auto p-4 flex flex-col items-center space-y-2"
        >
          <Building2 className="h-6 w-6" />
          <span>Crea Mansione</span>
        </Button>
      </div>

      <div className="pt-6">
        <Button
          onClick={() => onComplete && onComplete(formData)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Vai alla Dashboard
        </Button>
      </div>
    </div>
  )

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
              onChange={(e) => updateItem('departments', index, e.target.value)}
              placeholder="Nome dipartimento"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeItem('departments', index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button
          variant="outline"
          onClick={() => {
            // Aggiungi direttamente nelle sezioni appropriate dell'app
            const newDept = { name: '', description: '', location: '' }
            const currentDepts = JSON.parse(localStorage.getItem('departments') || '[]')
            currentDepts.push(newDept)
            localStorage.setItem('departments', JSON.stringify(currentDepts))
            
            // Aggiorna anche il form locale
            addItem('departments', '')
            
            // Mostra messaggio di conferma
            alert('Dipartimento aggiunto! Ora puoi compilarlo e salvarlo.')
          }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          + Aggiungi Dipartimento
        </Button>
        
        <Button
          variant="outline"
          onClick={() => addItem('departments', '')}
          className="w-full bg-blue-50 hover:bg-blue-100"
        >
          <Plus className="h-4 w-4 mr-2" />
          + Aggiungi Nuovo
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
                onChange={(e) => updateItem('refrigerators', index, { ...fridge, name: e.target.value })}
                placeholder="Nome (es. Frigo A)"
              />
              <Input
                type="number"
                value={fridge.tempMin}
                onChange={(e) => updateItem('refrigerators', index, { ...fridge, tempMin: e.target.value })}
                placeholder="Temp. min (°C)"
              />
              <Input
                type="number"
                value={fridge.tempMax}
                onChange={(e) => updateItem('refrigerators', index, { ...fridge, tempMax: e.target.value })}
                placeholder="Temp. max (°C)"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeItem('refrigerators', index)}
              className="mt-3"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Rimuovi
            </Button>
          </Card>
        ))}
        
        <Button
          variant="outline"
          onClick={() => {
            // Aggiungi direttamente nelle sezioni appropriate dell'app
            const newRefrigerator = { 
              name: '', 
              setTemperatureMin: '', 
              setTemperatureMax: '', 
              location: '',
              dedicatedTo: '',
              nextMaintenance: ''
            }
            const currentRefrigerators = JSON.parse(localStorage.getItem('refrigerators') || '[]')
            currentRefrigerators.push(newRefrigerator)
            localStorage.setItem('refrigerators', JSON.stringify(currentRefrigerators))
            
            // Aggiorna anche il form locale
            addItem('refrigerators', { name: '', tempMin: '', tempMax: '' })
            
            // Mostra messaggio di conferma
            alert('Punto di conservazione aggiunto! Ora puoi compilarlo e salvarlo.')
          }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          + Aggiungi Punto di Conservazione
        </Button>
        
        <Button
          variant="outline"
          onClick={() => addItem('refrigerators', { name: '', tempMin: '', tempMax: '' })}
          className="w-full bg-blue-50 hover:bg-blue-100"
        >
          <Plus className="h-4 w-4 mr-2" />
          + Aggiungi Nuovo
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
                onChange={(e) => updateItem('staff', index, { ...member, name: e.target.value })}
                placeholder="Nome completo"
              />
              <select
                value={member.role}
                onChange={(e) => updateItem('staff', index, { ...member, role: e.target.value })}
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
              onClick={() => removeItem('staff', index)}
              className="mt-3"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Rimuovi
            </Button>
          </Card>
        ))}
        
        <Button
          variant="outline"
          onClick={() => {
            // Aggiungi direttamente nelle sezioni appropriate dell'app
            const newStaff = { 
              name: '', 
              role: '', 
              department: '',
              email: '',
              phone: '',
              trainingDate: ''
            }
            const currentStaff = JSON.parse(localStorage.getItem('staff') || '[]')
            currentStaff.push(newStaff)
            localStorage.setItem('staff', JSON.stringify(currentStaff))
            
            // Aggiorna anche il form locale
            addItem('staff', { name: '', role: '' })
            
            // Mostra messaggio di conferma
            alert('Membro staff aggiunto! Ora puoi compilarlo e salvarlo.')
          }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          + Aggiungi Membro Staff
        </Button>
        
        <Button
          variant="outline"
          onClick={() => addItem('staff', { name: '', role: '' })}
          className="w-full bg-blue-50 hover:bg-blue-100"
        >
          <Plus className="h-4 w-4 mr-2" />
          + Aggiungi Nuovo
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

  // Step fornitori (opzionale) - MODULO INTEGRATO
  const renderSuppliersStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Gestione Fornitori (Opzionale)</h3>
        <p className="text-gray-600">I fornitori qualificati garantiscono materie prime sicure e conformi</p>
      </div>
      
      <div className="space-y-4">
        {formData.suppliers.map((supplier, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={supplier.name}
                onChange={(e) => updateItem('suppliers', index, { ...supplier, name: e.target.value })}
                placeholder="Nome fornitore"
              />
              <Input
                value={supplier.contact}
                onChange={(e) => updateItem('suppliers', index, { ...supplier, contact: e.target.value })}
                placeholder="Contatto (email/telefono)"
              />
            </div>
            <div className="mt-3">
              <Input
                value={supplier.products}
                onChange={(e) => updateItem('suppliers', index, { ...supplier, products: e.target.value })}
                placeholder="Prodotti forniti (es. carne, verdure, latticini)"
                className="w-full"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeItem('suppliers', index)}
              className="mt-3"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Rimuovi
            </Button>
          </Card>
        ))}
        
        <Button
          variant="outline"
          onClick={() => addItem('suppliers', { name: '', contact: '', products: '' })}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          + Aggiungi Fornitore
        </Button>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <p className="font-medium text-orange-900">Perché è importante?</p>
            <p className="text-sm text-orange-800 mt-1">
              I fornitori qualificati garantiscono la tracciabilità e la sicurezza delle materie prime. 
              Questa sezione è opzionale e può essere configurata successivamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Step manuale (opzionale) - MODULO INTEGRATO
  const renderManualStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Manuale HACCP (Opzionale)</h3>
        <p className="text-gray-600">Consulta la guida operativa per le procedure HACCP</p>
      </div>
      
      <div className="space-y-4">
        <Card className="p-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="manual-version">Versione Manuale</Label>
              <Input
                id="manual-version"
                value={formData.manualVersion || ''}
                onChange={(e) => updateFormData('manualVersion', e.target.value)}
                placeholder="Versione (es. 1.0 - 2024)"
              />
            </div>
            <div>
              <Label htmlFor="manual-date">Data Revisione</Label>
              <Input
                id="manual-date"
                type="date"
                value={formData.manualDate || ''}
                onChange={(e) => updateFormData('manualDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="manual-notes">Note Aggiuntive</Label>
              <textarea
                id="manual-notes"
                value={formData.manualNotes || ''}
                onChange={(e) => updateFormData('manualNotes', e.target.value)}
                placeholder="Note specifiche per la tua attività..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Manuale HACCP</p>
            <p className="text-sm text-blue-800 mt-1">
              Il manuale HACCP è sempre disponibile nella sezione Impostazioni e Dati. 
              Qui puoi configurare le impostazioni base del tuo manuale personalizzato.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Calcola il progresso
  const progress = Math.round((completedSteps.size / ONBOARDING_STEPS.length) * 100)
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
  
  // VALIDAZIONE MIGLIORATA: non si può andare avanti senza aver aggiunto elementi
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

        {/* Footer - solo se non siamo nella schermata di successo */}
        {!showSuccessScreen && (
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
        )}
      </div>
    </div>
  )
}

export default OnboardingWizard
