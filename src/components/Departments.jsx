/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo componente gestisce i REPARTI - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo componente gestisce l'organizzazione dei reparti HACCP
 * ⚠️ Coordina la struttura organizzativa per la sicurezza alimentare
 * 
 * @fileoverview Componente Reparti HACCP - Sistema Critico di Gestione Reparti
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Organizzazione Reparti
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Plus, Edit, Trash2, Building2, Users, MapPin, AlertCircle } from 'lucide-react'
import { useModals } from '../hooks/useModals'
import AlertModal from './ui/AlertModal'
import ConfirmModal from './ui/ConfirmModal'
import PromptModal from './ui/PromptModal'
import { debugLog, warnLog, haccpLog } from '../utils/debug'

// Funzione per creare i reparti standard
const createStandardDepartments = () => {
  return [
    {
      id: 'cucina',
      name: 'Cucina',
      description: 'Area di preparazione e cottura',
      location: '',
      manager: '',
      notes: '',
      enabled: true,
      createdAt: new Date().toISOString(),
      createdBy: 'Sistema'
    },
    {
      id: 'bancone',
      name: 'Bancone',
      description: 'Area di servizio e preparazione',
      location: '',
      manager: '',
      notes: '',
      enabled: true,
      createdAt: new Date().toISOString(),
      createdBy: 'Sistema'
    },
    {
      id: 'sala',
      name: 'Sala',
      description: 'Area di servizio clienti',
      location: '',
      manager: '',
      notes: '',
      enabled: true,
      createdAt: new Date().toISOString(),
      createdBy: 'Sistema'
    },
    {
      id: 'magazzino',
      name: 'Magazzino',
      description: 'Area di stoccaggio e conservazione',
      location: '',
      manager: '',
      notes: '',
      enabled: true,
      createdAt: new Date().toISOString(),
      createdBy: 'Sistema'
    }
  ]
}

function Departments({ currentUser, departments, setDepartments }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    manager: '',
    notes: ''
  })
  
  // Initialize modals
  const {
    alertModal, confirmModal, promptModal,
    closeAlert, closeConfirm, closePrompt,
    alertSuccess, alertError, alertWarning,
    confirmDelete, confirmAction
  } = useModals()

  // Carica i reparti esistenti dal localStorage
  useEffect(() => {
    // Controlla se l'onboarding è completato
    const onboardingCompleted = localStorage.getItem('haccp-onboarding')
    let isOnboardingComplete = false
    
    if (onboardingCompleted) {
      try {
        const onboarding = JSON.parse(onboardingCompleted)
        isOnboardingComplete = onboarding && onboarding.completed === true
      } catch (error) {
        warnLog('Errore nel parsing dati onboarding:', error)
        isOnboardingComplete = false
      }
    }

    if (isOnboardingComplete) {
      // Onboarding completato - carica i reparti dall'onboarding
      debugLog('✅ Onboarding completato, caricamento reparti...')
      loadDepartmentsFromOnboarding()
    } else {
      // Onboarding non completato - sezione vuota
      debugLog('⏳ Onboarding in corso, sezione reparti vuota')
      setDepartments([])
    }
  }, []) // Array vuoto per eseguire solo al mount

  // Funzione per caricare i reparti dall'onboarding
  const loadDepartmentsFromOnboarding = () => {
    const onboardingData = localStorage.getItem('haccp-onboarding')
    if (onboardingData) {
      try {
        const onboarding = JSON.parse(onboardingData)
        if (onboarding.departments?.list) {
          const departmentsFromOnboarding = onboarding.departments.list
            .filter(dept => dept && dept.enabled)
            .map(dept => ({
              id: dept.id || Date.now() + Math.random(),
              name: dept.name || 'Reparto non disponibile',
              description: dept.description || '',
              location: dept.location || '',
              manager: dept.manager || '',
              notes: dept.notes || '',
              enabled: true,
              isCustom: dept.isCustom || false,
              createdAt: new Date().toISOString(),
              createdBy: 'Onboarding'
            }))
          
          if (departmentsFromOnboarding.length > 0) {
            haccpLog('✅ Reparti caricati dall\'onboarding:', departmentsFromOnboarding)
            setDepartments(departmentsFromOnboarding)
            // Salva i reparti caricati dall'onboarding
            localStorage.setItem('haccp-departments', JSON.stringify(departmentsFromOnboarding))
            return
          }
        }
      } catch (error) {
        warnLog('Errore nel caricamento reparti dall\'onboarding:', error)
      }
    }
    
    // Se non ci sono reparti dall'onboarding, crea quelli standard
    debugLog('⚠️ Nessun reparto dall\'onboarding, creando reparti standard')
    setDepartments(createStandardDepartments())
  }

  // Funzione per pulire e ricaricare i reparti
  const clearAndReloadDepartments = () => {
    debugLog('🧹 Pulizia reparti corrotti...')
    // Rimuovi i dati corrotti
    localStorage.removeItem('haccp-departments')
    // Ricarica dall'onboarding
    loadDepartmentsFromOnboarding()
  }


  // Salva i reparti nel localStorage
  useEffect(() => {
    localStorage.setItem('haccp-departments', JSON.stringify(departments))
  }, [departments])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      manager: '',
      notes: ''
    })
    setEditingDepartment(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alertError('Il nome del reparto è obbligatorio')
      return
    }

    // Controlla se esiste già un reparto con lo stesso nome
    const existingDept = departments.find(dept => 
      dept.name.toLowerCase() === formData.name.trim().toLowerCase()
    )
    
    if (existingDept && (!editingDepartment || existingDept.id !== editingDepartment.id)) {
      alertError('Un reparto con questo nome esiste già')
      return
    }

    if (editingDepartment) {
      // Aggiorna reparto esistente
      const updatedDepartments = departments.map(dept => 
        dept.id === editingDepartment.id 
          ? {
              ...dept,
              name: formData.name.trim(),
              updatedAt: new Date().toISOString(),
              updatedBy: currentUser?.name || 'Unknown'
            }
          : dept
      )
      setDepartments(updatedDepartments)
    } else {
      // Aggiungi nuovo reparto
      const newDepartment = {
        id: `dept_${Date.now()}`,
        name: formData.name.trim(),
        description: '',
        location: '',
        manager: '',
        notes: '',
        enabled: true,
        isCustom: true,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'Unknown'
      }
      setDepartments([...departments, newDepartment])
    }

    resetForm()
    setShowAddForm(false)
  }

  const handleEdit = (department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      description: department.description || '',
      location: department.location || '',
      manager: department.manager || '',
      notes: department.notes || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = (departmentId) => {
    confirmDelete(
      'Sei sicuro di voler eliminare questo reparto? Questa azione non può essere annullata.',
      () => {
        setDepartments(departments.filter(dept => dept.id !== departmentId))
      }
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Gestione Reparti
          </h1>
          <p className="text-gray-600">
            Visualizza e gestisci i reparti configurati durante l'onboarding
          </p>
        </div>
        <Button 
          onClick={() => {
            resetForm()
            setShowAddForm(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Aggiungi Reparto
        </Button>
      </div>

      {/* Lista Reparti */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Reparti Attivi ({departments.length})
          </h2>
          <Button 
            onClick={clearAndReloadDepartments}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            <AlertCircle className="h-4 w-4" />
            Ricarica dall'Onboarding
          </Button>
        </div>
        
        {departments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun reparto configurato</h3>
              <p className="text-gray-600 mb-4">
                I reparti vengono configurati durante l'onboarding dell'applicazione.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.filter(dept => dept && dept.id && dept.name && typeof dept.name === 'string').map((department) => (
              <Card key={department.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">{department.name || 'Nome non disponibile'}</p>
                        <p className="text-lg font-bold text-gray-900">Attivo</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(department)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(department.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form per aggiungere/modificare reparto */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {editingDepartment ? 'Modifica Reparto' : 'Nuovo Reparto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Reparto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="es. Cucina, Sala, Magazzino..."
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingDepartment ? 'Aggiorna Reparto' : 'Aggiungi Reparto'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false)
                    resetForm()
                  }}
                  className="flex-1"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Modal Components */}
      <AlertModal 
        isOpen={alertModal.isOpen} 
        onClose={closeAlert} 
        title={alertModal.title} 
        message={alertModal.message} 
        type={alertModal.type} 
        confirmText={alertModal.confirmText} 
        onConfirm={alertModal.onConfirm} 
      />
      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        onClose={closeConfirm} 
        title={confirmModal.title} 
        message={confirmModal.message} 
        type={confirmModal.type} 
        confirmText={confirmModal.confirmText} 
        cancelText={confirmModal.cancelText} 
        onConfirm={confirmModal.onConfirm} 
        onCancel={confirmModal.onCancel} 
      />
      <PromptModal 
        isOpen={promptModal.isOpen} 
        onClose={closePrompt} 
        title={promptModal.title} 
        message={promptModal.message} 
        placeholder={promptModal.placeholder} 
        defaultValue={promptModal.defaultValue} 
        type={promptModal.type} 
        confirmText={promptModal.confirmText} 
        cancelText={promptModal.cancelText} 
        validation={promptModal.validation} 
        onConfirm={promptModal.onConfirm} 
        onCancel={promptModal.onCancel} 
      />
    </div>
  )
}

export default Departments