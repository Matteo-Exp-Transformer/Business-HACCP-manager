/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo è il COMPONENTE PUNTI DI CONSERVAZIONE - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo componente gestisce la gestione dei frigoriferi e temperature
 * ⚠️ Coordina il monitoraggio critico della conservazione alimentare
 * 
 * @fileoverview Componente Punti di Conservazione HACCP - Sistema Critico di Monitoraggio
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Gestione Frigoriferi
 * @version 3.0 - Compliance HACCP Ripristinata
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Thermometer, Activity, BarChart3, Plus, Edit, Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import CollapsibleCard from './CollapsibleCard'
import { useScrollToForm } from '../hooks/useScrollToForm'
import { useDataStore } from '../store/dataStore'
import { 
  selectConservationStats, 
  selectGroupedRefrigerators, 
  selectConservationTypeConfig,
  selectConservationPointsList,
  selectConservationPointsFromOnboarding
} from '../store/selectors/conservation'
import { validationService } from '../validation/validationService'
import { CONSERVATION_POINT_HELPERS, CONSERVATION_POINT_RULES } from '../utils/haccpRules'
import { formLogger, haccpLogger } from '../utils/logger'

// ============================================================================
// COMPONENTE PUNTI DI CONSERVAZIONE - COMPLIANCE HACCP RIPRISTINATA
// ============================================================================

function PuntidiConservazione({ 
  temperatures = [], 
  setTemperatures, 
  currentUser, 
  refrigerators: propRefrigerators = [], 
  setRefrigerators,
  departments = [],
  setDepartments 
}) {
  // ============================================================================
  // HOOKS E STATE - NUOVA ARCHITETTURA CON CONSERVATION POINT
  // ============================================================================
  
  const store = useDataStore()
  
  // Selettori per ConservationPoint
  const conservationPoints = selectConservationPointsList(store)
  const stats = selectConservationStats(store)
  const groupedRefrigerators = selectGroupedRefrigerators(store)
  const onboardingPoints = selectConservationPointsFromOnboarding(store)
  
  // State per form management
  const [openFormId, setOpenFormId] = useState(null)
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Hook per scroll automatico al form
  const { formRef, scrollToForm } = useScrollToForm(openFormId !== null, 'conservation-point-form')
  
  // ============================================================================
  // CONFIGURAZIONE CATEGORIE HACCP
  // ============================================================================
  
  const productCategories = CONSERVATION_POINT_RULES.categories
  
  // ============================================================================
  // FUNZIONI DI UTILITÀ
  // ============================================================================
  
  const getConservationType = (point) => {
    if (point.type) {
      const typeMap = {
        'FRIGO': 'frigorifero',
        'FREEZER': 'freezer',
        'ABBATTITORE': 'abbattitore',
        'AMBIENTE': 'ambiente'
      }
      return typeMap[point.type] || 'frigorifero'
    }
    
    // Fallback per dati legacy
    const temp = parseFloat(point.targetTemp) || parseFloat(point.temperature) || 4
    if (point.isAbbattitore) return 'abbattitore'
    if (temp <= -15) return 'freezer'
    if (temp > 0) return 'ambiente'
    return 'frigorifero'
  }
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'OK': return 'bg-green-500'
      case 'ATTENZIONE': return 'bg-yellow-500'
      case 'FUORI_RANGE': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }
  
  const getStatusText = (status) => {
    switch (status) {
      case 'OK': return 'OK'
      case 'ATTENZIONE': return 'Attenzione'
      case 'FUORI_RANGE': return 'Fuori Range'
      default: return 'Nessun dato'
    }
  }
  
  // ============================================================================
  // GESTIONE FORM E VALIDAZIONE
  // ============================================================================
  
  const handleOpenCreateForm = (type) => {
    formLogger.debug(`Apertura form creazione per tipo: ${type}`)
    
    const defaultData = {
      name: '',
      type: type,
      location: '',
      categories: [],
      targetTemp: type === 'FREEZER' ? -18 : type === 'ABBATTITORE' ? -40 : 4,
      isAbbattitore: type === 'ABBATTITORE'
    }
    
    setFormData(defaultData)
    setFormErrors({})
    setOpenFormId(`create-${type.toLowerCase()}`)
    
    setTimeout(() => scrollToForm(), 100)
  }
  
  const handleOpenEditForm = (point) => {
    formLogger.debug(`Apertura form modifica per punto: ${point.id}`)
    
    const editData = {
      id: point.id,
      name: point.name || '',
      type: point.type || 'FRIGO',
      location: point.location || '',
      categories: point.categories || [],
      targetTemp: point.tempRange ? point.tempRange[0] : 4,
      isAbbattitore: point.type === 'ABBATTITORE'
    }
    
    setFormData(editData)
    setFormErrors({})
    setOpenFormId(point.id)
    
    setTimeout(() => scrollToForm(), 100)
  }
  
  const handleCloseForm = () => {
    formLogger.debug('Chiusura form')
    setOpenFormId(null)
    setFormData({})
    setFormErrors({})
  }
  
  const handleFormFieldChange = (field, value) => {
    formLogger.debug(`Aggiornamento campo: ${field} = ${value}`)
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error per questo campo
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }
  
  const handleCategoryToggle = (categoryId) => {
    const currentCategories = formData.categories || []
    const isSelected = currentCategories.includes(categoryId)
    
    let newCategories
    if (isSelected) {
      newCategories = currentCategories.filter(id => id !== categoryId)
    } else {
      // Limite massimo di 5 categorie
      if (currentCategories.length < 5) {
        newCategories = [...currentCategories, categoryId]
      } else {
        haccpLogger.warn('Limite massimo di 5 categorie raggiunto')
        return
      }
    }
    
    handleFormFieldChange('categories', newCategories)
  }
  
  const validateForm = () => {
    const errors = {}
    
    // Validazione nome
    if (!formData.name?.trim()) {
      errors.name = 'Nome obbligatorio'
    }
    
    // Validazione location
    if (!formData.location?.trim()) {
      errors.location = 'Posizione obbligatoria'
    }
    
    // Validazione temperature
    if (formData.targetTemp === undefined || formData.targetTemp === null) {
      errors.targetTemp = 'Temperatura obbligatoria'
    } else {
      const temp = parseFloat(formData.targetTemp)
      if (isNaN(temp)) {
        errors.targetTemp = 'Temperatura non valida'
      }
    }
    
    // Validazione categorie con regole HACCP
    if (formData.categories && formData.categories.length > 0) {
      const allowedCategories = CONSERVATION_POINT_HELPERS.getAllowedCategoriesByType(formData.type)
      const invalidCategories = formData.categories.filter(cat => !allowedCategories.includes(cat))
      
      if (invalidCategories.length > 0) {
        errors.categories = `Categorie non valide per ${formData.type}: ${invalidCategories.join(', ')}`
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleSubmitForm = async () => {
    if (!validateForm()) {
      haccpLogger.warn('Validazione form fallita')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Validazione con regole HACCP
      const validation = validationService.validateConservationPoint(formData, {
        existing: conservationPoints,
        rules: CONSERVATION_POINT_RULES
      })
      
      if (!validation.success) {
        setFormErrors(validation.errors.reduce((acc, error, index) => {
          acc[`field_${index}`] = error
          return acc
        }, {}))
        haccpLogger.warn('Validazione HACCP fallita', validation.errors)
        return
      }
      
      const conservationPoint = validation.data
      
      // Salva nel store
      if (openFormId.startsWith('create-')) {
        store.addEntity('conservationPoints', conservationPoint)
        haccpLogger.info('ConservationPoint creato con successo')
      } else {
        store.updateEntity('conservationPoints', conservationPoint.id, conservationPoint)
        haccpLogger.info('ConservationPoint aggiornato con successo')
      }
      
      handleCloseForm()
      
    } catch (error) {
      haccpLogger.error('Errore nel salvataggio', error)
      setFormErrors({ submit: 'Errore nel salvataggio' })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDelete = (pointId) => {
    if (confirm('Sei sicuro di voler eliminare questo punto di conservazione?')) {
      haccpLogger.info(`Eliminazione ConservationPoint ${pointId}`)
      store.removeEntity('conservationPoints', pointId)
      haccpLogger.info('ConservationPoint eliminato con successo')
    }
  }

  // ============================================================================
  // COMPONENTE FORM CONSERVATION POINT
  // ============================================================================
  
  const ConservationPointForm = () => {
    if (!openFormId) return null
    
    const isCreate = openFormId.startsWith('create-')
    const allowedCategories = CONSERVATION_POINT_HELPERS.getAllowedCategoriesByType(formData.type)
    const tempSuggestions = CONSERVATION_POINT_HELPERS.getOptimalTemperatureSuggestions(formData.type, formData.categories)
    
    return (
      <Card ref={formRef} id="conservation-point-form" className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {isCreate ? 'Aggiungi Nuovo Punto di Conservazione' : 'Modifica Punto di Conservazione'}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseForm}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitForm(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Punto di Conservazione *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleFormFieldChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posizione *
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleFormFieldChange('location', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.location && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.type || 'FRIGO'}
                  onChange={(e) => handleFormFieldChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FRIGO">Frigorifero</option>
                  <option value="FREEZER">Freezer</option>
                  <option value="ABBATTITORE">Abbattitore</option>
                  <option value="AMBIENTE">Ambiente</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura Target (°C) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.targetTemp || ''}
                  onChange={(e) => handleFormFieldChange('targetTemp', parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.targetTemp ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={tempSuggestions ? `${tempSuggestions.range[0]} - ${tempSuggestions.range[1]}` : ''}
                  required
                />
                {tempSuggestions && (
                  <p className="text-blue-600 text-xs mt-1">{tempSuggestions.message}</p>
                )}
                {formErrors.targetTemp && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.targetTemp}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorie di Prodotti Supportate
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {productCategories
                  .filter(cat => allowedCategories.includes(cat.id))
                  .map(category => (
                    <label key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.categories?.includes(category.id) || false}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
              </div>
              {formErrors.categories && (
                <p className="text-red-500 text-xs mt-1">{formErrors.categories}</p>
              )}
            </div>
            
            {formErrors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{formErrors.submit}</p>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvataggio...' : (isCreate ? 'Aggiungi' : 'Aggiorna')} Punto
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseForm}
                disabled={isSubmitting}
              >
                Annulla
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  
  // Controllo di sicurezza per il rendering
  if (!groupedRefrigerators) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento punti di conservazione...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Punti di Conservazione - UI Ripristinata con Compliance HACCP */}
      <CollapsibleCard
        title="Punti di Conservazione"
        subtitle="Gestione frigoriferi e temperature con validazione HACCP"
        icon={Thermometer}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
        count={stats.total}
        testId="pc-list"
        defaultExpanded={true}
        openFormId={openFormId}
        formComponent={<ConservationPointForm />}
      >
        {/* Pulsanti Aggiungi per ogni tipo */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={() => handleOpenCreateForm('FRIGO')}
            className="bg-blue-500 text-white hover:bg-blue-600 h-10 px-4 py-2 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Aggiungi Frigorifero
          </Button>
          <Button
            onClick={() => handleOpenCreateForm('FREEZER')}
            className="bg-purple-500 text-white hover:bg-purple-600 h-10 px-4 py-2 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Aggiungi Freezer
          </Button>
          <Button
            onClick={() => handleOpenCreateForm('ABBATTITORE')}
            className="bg-red-500 text-white hover:bg-red-600 h-10 px-4 py-2 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Aggiungi Abbattitore
          </Button>
          <Button
            onClick={() => handleOpenCreateForm('AMBIENTE')}
            className="bg-green-500 text-white hover:bg-green-600 h-10 px-4 py-2 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Aggiungi Punto Ambiente
          </Button>
        </div>

        {/* Layout a 4 colonne fisse - UI Ripristinata con Validazione HACCP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* COLONNA FRIGORIFERI - Colore blu */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Frigoriferi
              <button className="text-blue-600 hover:text-blue-800 transition-colors" title="Guida posizionamento prodotti">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <path d="M12 17h.01"></path>
                </svg>
              </button>
            </h3>
            <div className="space-y-2">
              {groupedRefrigerators.frigorifero.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">Nessun frigorifero</p>
              ) : (
                groupedRefrigerators.frigorifero.map(point => (
                  <div key={point.id} className="p-3 border rounded-lg bg-white border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(point.status)}`}></div>
                        <div>
                          <h4 className="font-medium text-sm">{point.name}</h4>
                          <p className="text-xs text-gray-600">{getStatusText(point.status)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditForm(point)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(point.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-gray-500">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span className="text-gray-600">{point.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-gray-500" />
                        <span className="font-medium">
                          {point.tempRange ? `${point.tempRange[0]}°C - ${point.tempRange[1]}°C` : `${point.targetTemp}°C`}
                        </span>
                      </div>
                    </div>
                    {point.categories && point.categories.length > 0 && (
                      <div className="mt-2 text-xs">
                        <span className="text-gray-500">Categorie: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {point.categories.map(catId => {
                            const category = productCategories.find(cat => cat.id === catId)
                            return category ? (
                              <span key={catId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {category.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLONNA FREEZER - Colore viola */}
          <div className="border rounded-lg p-4 bg-purple-50">
            <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Freezer
              <button className="text-purple-600 hover:text-purple-800 transition-colors" title="Guida posizionamento prodotti">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <path d="M12 17h.01"></path>
                </svg>
              </button>
            </h3>
            <div className="space-y-2">
              {groupedRefrigerators.freezer.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">Nessun freezer</p>
              ) : (
                groupedRefrigerators.freezer.map(point => (
                  <div key={point.id} className="p-3 border rounded-lg bg-white border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(point.status)}`}></div>
                        <div>
                          <h4 className="font-medium text-sm">{point.name}</h4>
                          <p className="text-xs text-gray-600">{getStatusText(point.status)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditForm(point)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(point.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-gray-500">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span className="text-gray-600">{point.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-gray-500" />
                        <span className="font-medium">
                          {point.tempRange ? `${point.tempRange[0]}°C - ${point.tempRange[1]}°C` : `${point.targetTemp}°C`}
                        </span>
                      </div>
                    </div>
                    {point.categories && point.categories.length > 0 && (
                      <div className="mt-2 text-xs">
                        <span className="text-gray-500">Categorie: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {point.categories.map(catId => {
                            const category = productCategories.find(cat => cat.id === catId)
                            return category ? (
                              <span key={catId} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                {category.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLONNA ABBATTITORE - Colore rosso */}
          <div className="border rounded-lg p-4 bg-red-50">
            <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Abbattitore
              <button className="text-red-600 hover:text-red-800 transition-colors" title="Guida posizionamento prodotti">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <path d="M12 17h.01"></path>
                </svg>
              </button>
            </h3>
            <div className="space-y-2">
              {groupedRefrigerators.abbattitore.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">Nessun abbattitore</p>
              ) : (
                groupedRefrigerators.abbattitore.map(point => (
                  <div key={point.id} className="p-3 border rounded-lg bg-white border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(point.status)}`}></div>
                        <div>
                          <h4 className="font-medium text-sm">{point.name}</h4>
                          <p className="text-xs text-gray-600">{getStatusText(point.status)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditForm(point)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(point.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-gray-500">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span className="text-gray-600">{point.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-gray-500" />
                        <span className="font-medium">
                          {point.tempRange ? `${point.tempRange[0]}°C - ${point.tempRange[1]}°C` : `${point.targetTemp}°C`}
                        </span>
                      </div>
                    </div>
                    {point.categories && point.categories.length > 0 && (
                      <div className="mt-2 text-xs">
                        <span className="text-gray-500">Categorie: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {point.categories.map(catId => {
                            const category = productCategories.find(cat => cat.id === catId)
                            return category ? (
                              <span key={catId} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                {category.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLONNA AMBIENTE - Colore verde */}
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Ambiente
              <button className="text-green-600 hover:text-green-800 transition-colors" title="Guida posizionamento prodotti">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <path d="M12 17h.01"></path>
                </svg>
              </button>
            </h3>
            <div className="space-y-2">
              {groupedRefrigerators.ambiente.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">Nessun punto ambiente</p>
              ) : (
                groupedRefrigerators.ambiente.map(point => (
                  <div key={point.id} className="p-3 border rounded-lg bg-white border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(point.status)}`}></div>
                        <div>
                          <h4 className="font-medium text-sm">{point.name}</h4>
                          <p className="text-xs text-gray-600">{getStatusText(point.status)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditForm(point)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(point.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-gray-500">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span className="text-gray-600">{point.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-gray-500" />
                        <span className="font-medium">
                          {point.tempRange ? `${point.tempRange[0]}°C - ${point.tempRange[1]}°C` : `${point.targetTemp}°C`}
                        </span>
                      </div>
                    </div>
                    {point.categories && point.categories.length > 0 && (
                      <div className="mt-2 text-xs">
                        <span className="text-gray-500">Categorie: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {point.categories.map(catId => {
                            const category = productCategories.find(cat => cat.id === catId)
                            return category ? (
                              <span key={catId} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {category.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* Attività Registro Temperature */}
      <CollapsibleCard
        title="Attività Registro Temperature"
        subtitle="Monitoraggio e registrazione temperature"
        icon={Activity}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
        count={stats.recent}
        testId="pc-registro"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Registra le temperature dei frigoriferi per mantenere la compliance HACCP.
          </p>
          
          {/* Lista temperature recenti */}
          <div className="space-y-2">
            {temperatures.slice(0, 5).map(temp => {
              const refrigerator = refrigerators.find(ref => ref.id === temp.refrigeratorId)
              return (
                <div key={temp.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{refrigerator?.name || 'Frigorifero sconosciuto'}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(temp.timestamp).toLocaleString('it-IT')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      temp.status === 'danger' ? 'text-red-600' : 
                      temp.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {temp.temperature}°C
                    </p>
                    <p className="text-xs text-gray-500">{temp.status}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CollapsibleCard>

      {/* Stato Punti di Conservazione */}
      <CollapsibleCard
        title="Stato Punti di Conservazione"
        subtitle="Overview compliance e statistiche"
        icon={BarChart3}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100"
        count={stats.compliant}
        testId="pc-stato"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-blue-700">Totale Frigoriferi</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
            <p className="text-sm text-green-700">Compliant</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            <p className="text-sm text-red-700">Critici</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats.recent}</p>
            <p className="text-sm text-yellow-700">Ultime 24h</p>
          </div>
        </div>
      </CollapsibleCard>

      {/* Riferimenti Normativi EU/ASL */}
      <CollapsibleCard
        title="Riferimenti Normativi EU/ASL"
        subtitle="Normative europee e linee guida ASL"
        icon={AlertTriangle}
        iconColor="text-orange-600"
        iconBgColor="bg-orange-100"
        count={3}
        testId="pc-normative"
      >
        <div className="space-y-4">
          <div className="grid gap-4">
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Regolamento UE 852/2004</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Normativa europea per l'igiene dei prodotti alimentari
                </p>
                <div className="text-xs text-gray-500">
                  <p>• Requisiti generali per l'igiene alimentare</p>
                  <p>• Obblighi per gli operatori del settore alimentare</p>
                  <p>• Procedure basate sui principi HACCP</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Regolamento UE 853/2004</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Norme specifiche per prodotti di origine animale
                </p>
                <div className="text-xs text-gray-500">
                  <p>• Requisiti specifici per carni e prodotti derivati</p>
                  <p>• Temperature di conservazione obbligatorie</p>
                  <p>• Tracciabilità e etichettatura</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Linee Guida ASL</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Indicazioni operative per il controllo ufficiale
                </p>
                <div className="text-xs text-gray-500">
                  <p>• Controlli ispettivi programmati</p>
                  <p>• Verifica documentazione HACCP</p>
                  <p>• Sanzioni e provvedimenti</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CollapsibleCard>

    </div>
  )
}

export default PuntidiConservazione
