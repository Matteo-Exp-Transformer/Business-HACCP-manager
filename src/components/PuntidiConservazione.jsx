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
 * @version 2.0 - Foundation Pack v1 Consolidato
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Thermometer, Activity, BarChart3, Plus, Edit, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import CollapsibleCard from './CollapsibleCard'
import { useScrollToForm } from '../hooks/useScrollToForm'
import { useFormManager, FormGate } from './common/FormManager'
import { useDataStore } from '../store/dataStore'
import { 
  selectConservationStats, 
  selectGroupedRefrigerators, 
  selectConservationTypeConfig,
  selectTemperatureHistory,
  selectLastTemperature,
  selectTemperatureStatus
} from '../store/selectors/conservation'
import { validationService } from '../validation/validationService'
import { formLogger, haccpLogger } from '../utils/logger'
import { shallow } from 'zustand/shallow'

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
  // HOOKS E STATE - ANTI-LOOP PATCH
  // ============================================================================
  
  // 1) Selettori con shallow per evitare ricostruzioni continue
  const { refrigerators: storeRefrigerators, form, openCreate, openEdit, closeForm, updateDraft, commitForm } = useDataStore(s => ({
    refrigerators: s.entities?.refrigerators || {},
    form: s.meta?.forms?.refrigerators || { mode: 'idle' },
    openCreate: s.openCreateForm,
    openEdit: s.openEditForm,
    closeForm: s.closeForm,
    updateDraft: s.updateDraft,
    commitForm: s.commitForm
  }), shallow)
  
  // 2) FormManager per isFormOpen (non è nel store)
  const { isFormOpen } = useFormManager()
  
  // 3) Fallback logic con useMemo per evitare ricreazioni
  const refrigerators = useMemo(() => {
    return Object.keys(storeRefrigerators).length > 0 ? storeRefrigerators : 
      propRefrigerators.reduce((acc, ref, index) => {
        acc[ref.id || `ref-${index}`] = ref
        return acc
      }, {})
  }, [storeRefrigerators, propRefrigerators])
  
  // 2) Derivazioni solo con useMemo per evitare calcoli ad ogni render
  const stats = useMemo(() => {
    const refs = Object.values(refrigerators)
    return {
      totalRefrigerators: refs.length,
      activeRefrigerators: refs.filter(r => r.status === 'active').length,
      averageTemp: refs.length > 0 ? refs.reduce((sum, r) => sum + (r.temperature || 0), 0) / refs.length : 0,
      alerts: refs.filter(r => r.temperature && (r.temperature > 8 || r.temperature < 0)).length
    }
  }, [refrigerators])
  
  const groupedRefrigerators = useMemo(() => {
    const refs = Object.values(refrigerators)
    return {
      refrigerated: refs.filter(r => r.type === 'refrigerated'),
      frozen: refs.filter(r => r.type === 'frozen'),
      ambient: refs.filter(r => r.type === 'ambient')
    }
  }, [refrigerators])
  
  // 3) Hook per scroll automatico al form - con guardia
  const { formRef, scrollToForm } = useScrollToForm(isFormOpen('refrigerators'), 'conservation-point-form')
  
  // 4) Auto-open form UNA volta se lista vuota (con guardia idempotente)
  const openedRef = useRef(false)
  const refrigeratorsList = useMemo(() => Object.values(refrigerators), [refrigerators])
  
  useEffect(() => {
    const empty = refrigeratorsList.length === 0
    const idle = !form || form.mode === 'idle'
    if (empty && idle && !openedRef.current) {
      openCreate('refrigerators')
      openedRef.current = true // evita doppio trigger in StrictMode
    }
  }, [refrigeratorsList.length, form?.mode, openCreate])
  
  // 5) Controllo store inizializzato - DOPO tutti gli hooks
  if (!refrigerators || typeof refrigerators !== 'object') {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Sistema in fase di inizializzazione. Riprova tra qualche secondo.
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  // ============================================================================
  // CONFIGURAZIONE CATEGORIE
  // ============================================================================
  
  const productCategories = [
    { id: 'fresh_dairy', name: 'Latticini Freschi', tempRange: [2, 4] },
    { id: 'fresh_meat', name: 'Carni Fresche', tempRange: [0, 2] },
    { id: 'fresh_produce', name: 'Prodotti Freschi', tempRange: [2, 4] },
    { id: 'fresh_beverages', name: 'Bevande Fresche', tempRange: [4, 6] },
    { id: 'chilled_ready', name: 'Pronti al Consumo', tempRange: [2, 4] },
    { id: 'frozen', name: 'Congelati', tempRange: [-18, -15] },
    { id: 'deep_frozen', name: 'Surgelati', tempRange: [-22, -18] }
  ]

  // ============================================================================
  // FUNZIONI DI UTILITÀ
  // ============================================================================
  
  const getConservationType = (refrigerator) => {
    const temp = parseFloat(refrigerator.targetTemp)
    
    // Priorità 1: Abbattitore
    if (refrigerator.isAbbattitore) {
      return 'abbattitore'
    }
    
    // Priorità 2: Freezer (temperatura <= -15°C)
    if (temp <= -15) {
      return 'freezer'
    }
    
    // Priorità 3: Ambiente (temperatura > 0°C)
    if (temp > 0) {
      return 'ambiente'
    }
    
    // Default: Frigorifero (temperatura tra -15°C e 0°C)
    return 'frigorifero'
  }

  // ============================================================================
  // GESTIONE FORM
  // ============================================================================
  
  const handleOpenCreateForm = () => {
    formLogger.debug('Tentativo apertura form creazione frigorifero')
    
    if (openCreate('refrigerators')) {
      // Inizializza draft con valori default
      updateDraft('refrigerators', {
        name: '',
        location: '',
        targetTemp: 4,
        selectedCategories: [],
        isAbbattitore: false
      })
      
      // Scroll al form
      setTimeout(() => scrollToForm(), 100)
    }
  }

  const handleOpenEditForm = (refrigerator) => {
    formLogger.debug(`Tentativo apertura form modifica frigorifero ${refrigerator.id}`)
    
    if (openEdit('refrigerators', refrigerator.id)) {
      // Popola draft con dati esistenti
      updateDraft('refrigerators', {
        name: refrigerator.name,
        location: refrigerator.location,
        targetTemp: refrigerator.targetTemp,
        selectedCategories: refrigerator.selectedCategories || [],
        isAbbattitore: refrigerator.isAbbattitore || false
      })
      
      // Scroll al form
      setTimeout(() => scrollToForm(), 100)
    }
  }

  const handleCloseForm = () => {
    formLogger.debug('Chiusura form frigorifero')
    closeForm('refrigerators')
  }

  const handleUpdateDraft = (field, value) => {
    formLogger.debug(`Aggiornamento draft: ${field} = ${value}`)
    updateDraft('refrigerators', { [field]: value })
  }

  const handleCategoryToggle = (categoryId) => {
    const currentDraft = form?.draft || {}
    const currentCategories = currentDraft.selectedCategories || []
    
    const isSelected = currentCategories.includes(categoryId)
    
    if (isSelected) {
      // Rimuovi categoria
      const newCategories = currentCategories.filter(id => id !== categoryId)
      handleUpdateDraft('selectedCategories', newCategories)
    } else {
      // Aggiungi categoria (max 5)
      if (currentCategories.length < 5) {
        const newCategories = [...currentCategories, categoryId]
        handleUpdateDraft('selectedCategories', newCategories)
      } else {
        haccpLogger.warn('Limite massimo di 5 categorie raggiunto')
      }
    }
  }

  const handleSubmitForm = async () => {
    formLogger.debug('Tentativo submit form frigorifero')
    
    const formState = form
    if (!formState || formState.mode === 'idle') {
      haccpLogger.warn('Nessun form attivo per il submit')
      return
    }
    
    const draft = formState.draft
    const mode = formState.mode === 'create' ? 'create' : 'update'
    
    // Valida i dati
    const validation = validationService.validateForm('refrigerators', draft, mode)
    if (!validation.isValid) {
      haccpLogger.warn('Validazione fallita', validation.errors)
      return
    }
    
    // Esegui commit
    const success = await commitForm('refrigerators', mode)
    if (success) {
      haccpLogger.info('Frigorifero salvato con successo')
    } else {
      haccpLogger.error('Errore nel salvataggio del frigorifero')
    }
  }

  const handleDelete = (refrigeratorId) => {
    if (confirm('Sei sicuro di voler eliminare questo frigorifero?')) {
      haccpLogger.info(`Eliminazione frigorifero ${refrigeratorId}`)
      
      // Rimuovi frigorifero
      setRefrigerators(refrigerators.filter(ref => ref.id !== refrigeratorId))
      
      // Rimuovi temperature associate
      setTemperatures(temperatures.filter(temp => temp.refrigeratorId !== refrigeratorId))
      
      haccpLogger.info('Frigorifero eliminato con successo')
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="space-y-6">
      {/* Punti di Conservazione */}
      <CollapsibleCard
        title="Punti di Conservazione"
        subtitle="Gestione frigoriferi e temperature"
        icon={Thermometer}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
        count={stats.total}
        testId="pc-list"
        defaultExpanded={true}
      >
        {/* Layout a colonne dinamiche */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(groupedRefrigerators).map(([type, points]) => {
            const typeConfig = selectConservationTypeConfig(type)

            return (
              <div key={type} className="space-y-4">
                {/* Header Colonna */}
                <div className="text-center">
                  <h3 className={`text-lg font-semibold ${typeConfig.textColor}`}>
                    {typeConfig.label}
                  </h3>
                </div>

                {/* Contenuto Colonna con sfondo colorato */}
                <div className={`space-y-3 p-4 rounded-lg border-2 ${typeConfig.borderColor} ${typeConfig.bgColor}`}>
                  {points.length === 0 ? (
                    <div className={`text-center p-4 rounded-lg ${typeConfig.emptyBg}`}>
                      <p className={`text-sm ${typeConfig.emptyTextColor}`}>
                        {typeConfig.emptyMessage}
                      </p>
                    </div>
                  ) : (
                    points.map(point => {
                      const lastTemp = temperatures
                        .filter(t => t.refrigeratorId === point.id)
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
                      
                      const isCompliant = lastTemp ? 
                        Math.abs(parseFloat(lastTemp.temperature) - parseFloat(point.targetTemp)) <= 2 : false

                      return (
                        <Card key={point.id} className="border border-gray-200 rounded-lg shadow-sm">
                          <CardContent className="p-4">
                            {/* Header Scheda */}
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">{point.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {lastTemp ? `${lastTemp.temperature}°C` : 'Nessun dato'}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEditForm(point)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(point.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Dettagli Scheda */}
                            <div className="space-y-2">
                              {/* Posizione */}
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">📍 {point.location}</span>
                              </div>

                              {/* Temperatura */}
                              <div className="flex items-center gap-2">
                                <Thermometer className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-900">
                                  {point.targetTemp}°C
                                </span>
                                {lastTemp && (
                                  isCompliant ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                  )
                                )}
                              </div>

                              {/* Categorie */}
                              {point.selectedCategories && point.selectedCategories.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {point.selectedCategories.map(catId => {
                                    const category = productCategories.find(cat => cat.id === catId)
                                    return category ? (
                                      <span key={catId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {category.name}
                                      </span>
                                    ) : null
                                  })}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Pulsante aggiungi con FormGate */}
        <div className="mt-6">
          <FormGate entityType="refrigerators">
            <Button
              onClick={handleOpenCreateForm}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Frigorifero
            </Button>
          </FormGate>
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

      {/* Form aggiungi/modifica frigorifero */}
      {isFormOpen('refrigerators') && (
        <Card ref={formRef} id="conservation-point-form" className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {form?.mode === 'create' ? 'Aggiungi Nuovo Frigorifero' : 'Modifica Frigorifero'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitForm(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Frigorifero
                  </label>
                  <input
                    type="text"
                    value={form?.draft?.name || ''}
                    onChange={(e) => handleUpdateDraft('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posizione
                  </label>
                  <input
                    type="text"
                    value={form?.draft?.location || ''}
                    onChange={(e) => handleUpdateDraft('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperatura Target (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form?.draft?.targetTemp || 4}
                    onChange={(e) => handleUpdateDraft('targetTemp', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorie di Prodotti Supportate
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {productCategories.map(category => (
                    <label key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={form?.draft?.selectedCategories?.includes(category.id) || false}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {form?.mode === 'create' ? 'Aggiungi' : 'Aggiorna'} Frigorifero
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
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

export default PuntidiConservazione
