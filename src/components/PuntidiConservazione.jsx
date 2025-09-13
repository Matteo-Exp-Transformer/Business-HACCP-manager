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
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import { Thermometer, Activity, BarChart3, Plus, Edit, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import CollapsibleCard from './CollapsibleCard'
import { useScrollToForm } from '../hooks/useScrollToForm'

function PuntidiConservazione({ 
  temperatures = [], 
  setTemperatures, 
  currentUser, 
  refrigerators = [], 
  setRefrigerators,
  departments = [],
  setDepartments 
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRefrigerator, setEditingRefrigerator] = useState(null)

  // Hook per scroll automatico al form
  const { formRef, scrollToForm } = useScrollToForm(showAddForm, 'conservation-point-form')
  const [newRefrigerator, setNewRefrigerator] = useState({
    name: '',
    location: '',
    targetTemp: 4,
    selectedCategories: []
  })

  // Effetto per scroll automatico quando il form si apre
  useEffect(() => {
    if (showAddForm) {
      scrollToForm()
    }
  }, [showAddForm, scrollToForm])

  // Categorie di prodotti HACCP
  const productCategories = [
    { id: 'fresh_dairy', name: 'Latticini Freschi', tempRange: [2, 4] },
    { id: 'fresh_meat', name: 'Carni Fresche', tempRange: [0, 2] },
    { id: 'fresh_produce', name: 'Prodotti Freschi', tempRange: [2, 4] },
    { id: 'fresh_beverages', name: 'Bevande Fresche', tempRange: [4, 6] },
    { id: 'chilled_ready', name: 'Pronti al Consumo', tempRange: [2, 4] },
    { id: 'frozen', name: 'Congelati', tempRange: [-18, -15] },
    { id: 'deep_frozen', name: 'Surgelati', tempRange: [-22, -18] }
  ]

  // Calcola statistiche
  const getStats = () => {
    const totalRefrigerators = refrigerators.length
    const compliantRefrigerators = refrigerators.filter(ref => {
      const lastTemp = temperatures
        .filter(t => t.refrigeratorId === ref.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
      
      if (!lastTemp) return false
      
      const temp = parseFloat(lastTemp.temperature)
      const targetTemp = parseFloat(ref.targetTemp)
      const tolerance = 2 // ±2°C di tolleranza
      
      return Math.abs(temp - targetTemp) <= tolerance
    }).length

    const criticalTemps = temperatures.filter(t => t.status === 'danger').length
    const recentTemps = temperatures.filter(t => {
      const tempDate = new Date(t.timestamp)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return tempDate > oneDayAgo
    }).length

    return {
      total: totalRefrigerators,
      compliant: compliantRefrigerators,
      critical: criticalTemps,
      recent: recentTemps
    }
  }

  const stats = getStats()

  // Funzione per determinare il tipo di conservazione basata sulle regole HACCP
  const getConservationType = (refrigerator) => {
    const temp = parseFloat(refrigerator.targetTemp)
    
    // Priorità 1: Abbattitore (proprietà isAbbattitore = true)
    if (refrigerator.isAbbattitore) {
      return 'abbattitore'
    }
    
    // Priorità 2: Freezer (temperatura tra -25°C e -16°C)
    if (temp >= -25 && temp <= -16) {
      return 'freezer'
    }
    
    // Priorità 3: Ambiente (temperatura tra 15°C e 25°C - dispensa secca)
    if (temp >= 15 && temp <= 25) {
      return 'ambiente'
    }
    
    // Default: Frigorifero (temperatura tra 0°C e 8°C - prodotti freschi)
    if (temp >= 0 && temp <= 8) {
      return 'frigorifero'
    }
    
    // Fallback: se la temperatura non rientra in nessun range standard
    // Usa la logica precedente come fallback
    if (temp <= -15) {
      return 'freezer'
    } else if (temp > 8) {
      return 'ambiente'
    } else {
      return 'frigorifero'
    }
  }

  // Funzione per raggruppare per tipo di conservazione
  const groupByConservationType = (refrigerators) => {
    const groups = {
      'frigorifero': [],
      'freezer': [],
      'abbattitore': [],
      'ambiente': []
    }

    refrigerators.forEach(refrigerator => {
      const type = getConservationType(refrigerator)
      groups[type].push(refrigerator)
    })

    return groups
  }

  // Configurazione colori per tipo
  const getTypeConfig = (type) => {
    const configs = {
      'frigorifero': {
        label: 'Frigoriferi',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        emptyBg: 'bg-blue-50',
        emptyTextColor: 'text-blue-600',
        emptyMessage: 'Nessun frigorifero configurato'
      },
      'freezer': {
        label: 'Freezer',
        textColor: 'text-cyan-600',
        bgColor: 'bg-cyan-100',
        borderColor: 'border-cyan-300',
        emptyBg: 'bg-cyan-50',
        emptyTextColor: 'text-cyan-600',
        emptyMessage: 'Nessun freezer configurato'
      },
      'abbattitore': {
        label: 'Abbattitori',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300',
        emptyBg: 'bg-orange-50',
        emptyTextColor: 'text-orange-600',
        emptyMessage: 'Nessun abbattitore configurato'
      },
      'ambiente': {
        label: 'Ambiente',
        textColor: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        emptyBg: 'bg-green-50',
        emptyTextColor: 'text-green-600',
        emptyMessage: 'Nessun punto ambiente configurato'
      }
    }

    return configs[type] || configs['frigorifero']
  }

  // Utilizzo nel componente
  const groupedRefrigerators = groupByConservationType(refrigerators)

  // Gestione form
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingRefrigerator) {
      // Modifica frigorifero esistente
      const updatedRefrigerators = refrigerators.map(ref => 
        ref.id === editingRefrigerator.id 
          ? { ...ref, ...newRefrigerator }
          : ref
      )
      setRefrigerators(updatedRefrigerators)
      setEditingRefrigerator(null)
    } else {
      // Aggiungi nuovo frigorifero
      const newRef = {
        ...newRefrigerator,
        id: `ref_${Date.now()}`,
        createdAt: new Date().toISOString()
      }
      setRefrigerators([...refrigerators, newRef])
    }
    
    setNewRefrigerator({
      name: '',
      location: '',
      targetTemp: 4,
      selectedCategories: []
    })
    setShowAddForm(false)
  }

  const handleEdit = (refrigerator) => {
    setEditingRefrigerator(refrigerator)
    setNewRefrigerator({
      name: refrigerator.name,
      location: refrigerator.location,
      targetTemp: refrigerator.targetTemp,
      selectedCategories: refrigerator.selectedCategories || []
    })
    setShowAddForm(true)
  }

  const handleDelete = (refrigeratorId) => {
    if (confirm('Sei sicuro di voler eliminare questo frigorifero?')) {
      setRefrigerators(refrigerators.filter(ref => ref.id !== refrigeratorId))
      // Rimuovi anche le temperature associate
      setTemperatures(temperatures.filter(temp => temp.refrigeratorId !== refrigeratorId))
    }
  }

  const handleCategoryToggle = (categoryId) => {
    setNewRefrigerator(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }))
  }

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
            const typeConfig = getTypeConfig(type)

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
                                  onClick={() => handleEdit(point)}
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

        {/* Pulsante aggiungi */}
        <div className="mt-6">
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Frigorifero
          </Button>
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
      {showAddForm && (
        <Card ref={formRef} id="conservation-point-form" className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {editingRefrigerator ? 'Modifica Frigorifero' : 'Aggiungi Nuovo Frigorifero'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Frigorifero
                  </label>
                  <input
                    type="text"
                    value={newRefrigerator.name}
                    onChange={(e) => setNewRefrigerator(prev => ({ ...prev, name: e.target.value }))}
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
                    value={newRefrigerator.location}
                    onChange={(e) => setNewRefrigerator(prev => ({ ...prev, location: e.target.value }))}
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
                    value={newRefrigerator.targetTemp}
                    onChange={(e) => setNewRefrigerator(prev => ({ ...prev, targetTemp: parseFloat(e.target.value) }))}
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
                        checked={newRefrigerator.selectedCategories.includes(category.id)}
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
                  {editingRefrigerator ? 'Aggiorna' : 'Aggiungi'} Frigorifero
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingRefrigerator(null)
                    setNewRefrigerator({
                      name: '',
                      location: '',
                      targetTemp: 4,
                      selectedCategories: []
                    })
                  }}
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
