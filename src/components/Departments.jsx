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

  // Carica i reparti esistenti dal localStorage
  useEffect(() => {
    const savedDepartments = localStorage.getItem('haccp-departments')
    if (savedDepartments) {
      try {
        const existingDepartments = JSON.parse(savedDepartments)
        if (existingDepartments.length > 0) {
          setDepartments(existingDepartments)
        } else {
          // Se non ci sono reparti, crea quelli standard
          setDepartments(createStandardDepartments())
        }
      } catch (error) {
        console.error('Errore nel caricamento reparti:', error)
        setDepartments(createStandardDepartments())
      }
    } else {
      // Se non ci sono dati salvati, crea quelli standard
      setDepartments(createStandardDepartments())
    }
  }, []) // Array vuoto per eseguire solo al mount


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
      alert('Il nome del reparto è obbligatorio')
      return
    }

    // Controlla se esiste già un reparto con lo stesso nome
    const existingDept = departments.find(dept => 
      dept.name.toLowerCase() === formData.name.trim().toLowerCase()
    )
    
    if (existingDept && (!editingDepartment || existingDept.id !== editingDepartment.id)) {
      alert('Un reparto con questo nome esiste già')
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
    if (confirm('Sei sicuro di voler eliminare questo reparto? Questa azione non può essere annullata.')) {
      setDepartments(departments.filter(dept => dept.id !== departmentId))
    }
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
            {departments.map((department) => (
              <Card key={department.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">{department.name}</p>
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

    </div>
  )
}

export default Departments