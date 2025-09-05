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

  // Carica i reparti dall'onboarding se non sono già presenti
  useEffect(() => {
    if (departments.length === 0) {
      const savedOnboarding = localStorage.getItem('onboardingData')
      if (savedOnboarding) {
        try {
          const onboardingData = JSON.parse(savedOnboarding)
          if (onboardingData.departments && onboardingData.departments.length > 0) {
            // Converte i reparti dall'onboarding nel formato del componente
            const convertedDepartments = onboardingData.departments.map((dept, index) => ({
              id: `dept_${index}`,
              name: dept,
              description: `Reparto ${dept}`,
              location: '',
              manager: '',
              notes: '',
              createdAt: new Date().toISOString(),
              createdBy: currentUser?.name || 'Unknown'
            }))
            setDepartments(convertedDepartments)
          }
        } catch (error) {
          console.error('Errore nel caricamento reparti dall\'onboarding:', error)
        }
      }
    }
  }, [departments.length, setDepartments, currentUser])

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
              description: formData.description.trim(),
              location: formData.location.trim(),
              manager: formData.manager.trim(),
              notes: formData.notes.trim(),
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
        description: formData.description.trim(),
        location: formData.location.trim(),
        manager: formData.manager.trim(),
        notes: formData.notes.trim(),
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
            Organizza e gestisci i reparti della tua attività per la compliance HACCP
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
          Nuovo Reparto
        </Button>
      </div>

      {/* Statistiche rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Reparti Totali</p>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Con Manager</p>
                <p className="text-2xl font-bold text-gray-900">
                  {departments.filter(dept => dept.manager.trim()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Con Posizione</p>
                <p className="text-2xl font-bold text-gray-900">
                  {departments.filter(dept => dept.location.trim()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div>
                  <Label htmlFor="manager">Manager/Responsabile</Label>
                  <Input
                    id="manager"
                    value={formData.manager}
                    onChange={(e) => setFormData({...formData, manager: e.target.value})}
                    placeholder="Nome del responsabile"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrizione</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descrizione del reparto e delle sue funzioni"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Posizione/Localizzazione</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="es. Piano terra, Primo piano, Esterno..."
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Note Aggiuntive</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Note specifiche per il reparto"
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

      {/* Lista reparti */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Reparti Configurati ({departments.length})</h2>
        
        {departments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun reparto configurato</h3>
              <p className="text-gray-600 mb-4">
                Inizia aggiungendo i reparti della tua attività per organizzare meglio il lavoro HACCP.
              </p>
              <Button 
                onClick={() => {
                  resetForm()
                  setShowAddForm(true)
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Aggiungi Primo Reparto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((department) => (
              <Card key={department.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{department.name}</CardTitle>
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
                </CardHeader>
                <CardContent className="pt-0">
                  {department.description && (
                    <p className="text-sm text-gray-600 mb-3">{department.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {department.manager && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Manager:</span>
                        <span className="font-medium">{department.manager}</span>
                      </div>
                    )}
                    
                    {department.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Posizione:</span>
                        <span className="font-medium">{department.location}</span>
                      </div>
                    )}
                    
                    {department.notes && (
                      <div className="flex items-start gap-2">
                        <StickyNote className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-gray-600">Note:</span>
                          <p className="text-gray-700 mt-1">{department.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Creato: {new Date(department.createdAt).toLocaleDateString('it-IT')}</span>
                      <span>da {department.createdBy}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Departments