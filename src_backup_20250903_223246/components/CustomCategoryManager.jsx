/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo componente gestisce le CATEGORIE PERSONALIZZATE - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo componente gestisce categorie di prodotti con temperature critiche
 * ⚠️ Basato su normative EU/ASL vincolanti per la sicurezza alimentare
 * 
 * @fileoverview Componente Gestione Categorie Personalizzate HACCP
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Categorie Prodotti
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Plus, Edit, Trash2, Thermometer, AlertTriangle, CheckCircle } from 'lucide-react'
import TemperatureInput from './ui/TemperatureInput'

function CustomCategoryManager({ customCategories = [], setCustomCategories, currentUser }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    temperatureMin: '',
    temperatureMax: '',
    storageLocation: '',
    color: 'bg-blue-100 text-blue-800'
  })

  // Colori disponibili per le categorie
  const availableColors = [
    'bg-blue-100 text-blue-800',
    'bg-red-100 text-red-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-orange-100 text-orange-800',
    'bg-teal-100 text-teal-800',
    'bg-cyan-100 text-cyan-800'
  ]

  // Save custom categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('haccp-custom-categories', JSON.stringify(customCategories))
  }, [customCategories])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      temperatureMin: '',
      temperatureMax: '',
      storageLocation: '',
      color: 'bg-blue-100 text-blue-800'
    })
    setEditingCategory(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.temperatureMin.trim() || !formData.temperatureMax.trim()) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    const tempMin = parseFloat(formData.temperatureMin)
    const tempMax = parseFloat(formData.temperatureMax)
    
    if (isNaN(tempMin) || isNaN(tempMax)) {
      alert('Inserisci temperature valide')
      return
    }

    // Validazione: temperatura minima deve essere inferiore alla massima
    if (tempMin >= tempMax) {
      alert('La temperatura minima deve essere inferiore alla temperatura massima')
      return
    }

    if (editingCategory) {
      // Aggiorna categoria esistente
      const updatedCategories = customCategories.map(cat => 
        cat.id === editingCategory.id 
          ? {
              ...cat,
              name: formData.name.trim(),
              description: formData.description.trim(),
              temperatureMin: tempMin,
              temperatureMax: tempMax,
              temperature: `${tempMin}-${tempMax}°C`,
              storageLocation: formData.storageLocation.trim(),
              color: formData.color,
              updatedAt: new Date().toISOString(),
              updatedBy: currentUser?.id,
              updatedByName: currentUser?.name
            }
          : cat
      )
      setCustomCategories(updatedCategories)
    } else {
      // Aggiungi nuova categoria
      const newCategory = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        temperatureMin: tempMin,
        temperatureMax: tempMax,
        temperature: `${tempMin}-${tempMax}°C`,
        storageLocation: formData.storageLocation.trim(),
        color: formData.color,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id,
        createdByName: currentUser?.name,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.id,
        updatedByName: currentUser?.name
      }
      setCustomCategories([...customCategories, newCategory])
    }

    resetForm()
    setShowAddForm(false)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      temperatureMin: category.temperatureMin.toString(),
      temperatureMax: category.temperatureMax.toString(),
      storageLocation: category.storageLocation || '',
      color: category.color
    })
    setShowAddForm(true)
  }

  const handleDelete = (categoryId) => {
    if (confirm('Sei sicuro di voler eliminare questa categoria? Questa azione non può essere annullata.')) {
      setCustomCategories(customCategories.filter(cat => cat.id !== categoryId))
    }
  }

  const getTemperatureType = (tempMin, tempMax) => {
    const avgTemp = (tempMin + tempMax) / 2
    
    if (avgTemp <= -13.5) return 'Surgelato'
    if (avgTemp >= 15) return 'Temperatura Ambiente'
    return 'Refrigerato'
  }

  const getTemperatureStatus = (tempMin, tempMax) => {
    const avgTemp = (tempMin + tempMax) / 2
    
    if (avgTemp < 0 || avgTemp > 8) return 'danger'
    if (avgTemp >= 6 && avgTemp <= 8) return 'warning'
    return 'ok'
  }

  return (
    <div className="space-y-6">
      {/* Header con pulsante aggiungi */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorie Personalizzate</h2>
          <p className="text-gray-600">Gestisci categorie di prodotti con temperature specifiche</p>
        </div>
        <Button 
          onClick={() => {
            resetForm()
            setShowAddForm(true)
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuova Categoria
        </Button>
      </div>

      {/* Form per aggiungere/modificare categoria */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCategory ? 'Modifica Categoria' : 'Nuova Categoria Personalizzata'}
            </CardTitle>
            {currentUser && (
              <p className="text-sm text-gray-600">
                {editingCategory ? 'Modificando come: ' : 'Creando come: '}
                <span className="font-medium">{currentUser.name}</span> ({currentUser.department})
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Categoria *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="es. Prodotti Freschi, Specialità Regionali..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="color">Colore Identificativo</Label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableColors.map((color, index) => (
                      <option key={index} value={color}>
                        {color.replace('bg-', '').replace('-100 text-', ' - ').replace('-800', '')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrizione</Label>
                <Input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="es. Prodotti freschi di produzione locale..."
                />
              </div>

                            <div>
                <TemperatureInput
                  label="Range Temperatura (°C) *"
                  minValue={formData.temperatureMin}
                  maxValue={formData.temperatureMax}
                  onMinChange={(e) => setFormData({...formData, temperatureMin: e.target.value})}
                  onMaxChange={(e) => setFormData({...formData, temperatureMax: e.target.value})}
                  required={true}
                  showValidation={true}
                  showSuggestions={true}
                  className="w-full"
                  id="temperature-range"
                />
              </div>

              <div>
                <Label htmlFor="storageLocation">Posizione di Conservazione Suggerita</Label>
                <Input
                  id="storageLocation"
                  type="text"
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({...formData, storageLocation: e.target.value})}
                  placeholder="es. Ripiano superiore frigo, Scaffale dispensa..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCategory ? 'Aggiorna' : 'Crea'} Categoria
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

      {/* Lista categorie personalizzate */}
      {customCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customCategories.map(category => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                    {category.name}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {category.description && (
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Temperatura:</span>
                    <span className="font-medium">{category.temperature}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">
                      {getTemperatureType(category.temperatureMin, category.temperatureMax)}
                    </span>
                  </div>

                  {category.storageLocation && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Posizione:</span>
                      <span className="font-medium">{category.storageLocation}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <p>Creata da: {category.createdByName || 'N/A'}</p>
                  <p>Aggiornata: {new Date(category.updatedAt).toLocaleDateString('it-IT')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <Thermometer className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium mb-2">Nessuna categoria personalizzata</p>
            <p className="text-sm">Crea la tua prima categoria personalizzata per gestire prodotti specifici</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CustomCategoryManager
