/**
 * PresetSelector - Selezione preset attività
 * 
 * Questo componente permette all'utente di scegliere tra preset predefiniti:
 * - Pizzeria (minimal)
 * - Bar (minimal)
 * 
 * @version 1.0
 * @critical Onboarding - Configurazione iniziale
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Pizza, Coffee, CheckCircle, Info, Thermometer, Building2, Users, HelpCircle, X } from 'lucide-react'

const PRESETS = {
  pizzeria: {
    name: 'Pizzeria',
    description: 'Ristorante con cucina, pizzeria e servizio al tavolo',
    icon: Pizza,
    iconColor: 'text-red-600',
    features: [
      'Frigo A: Verdure, Salumi, Formaggi, Latticini (2-4°C)',
      'Frigo B: Surgelati (-19 a -16°C)',
      'Dipartimenti: Cucina, Pizzeria',
      'Ruoli: Pizzaiolo, Cameriere, Cassiere'
    ],
    // Categorie specifiche per ogni punto di conservazione
    conservationPoints: {
      'Frigo A': {
        temperature: { min: 2, max: 4 },
        allowedCategories: ['verdure', 'carni', 'formaggi', 'latticini'],
        description: 'Conservazione prodotti freschi per pizza e cucina'
      },
      'Frigo B': {
        temperature: { min: -19, max: -16 },
        allowedCategories: ['surgelati', 'pesce_surgelato', 'gelati'],
        description: 'Conservazione surgelati e gelati'
      }
    },
    whyMatters: 'Configura automaticamente i punti di conservazione e la struttura organizzativa specifica per pizzerie, garantendo la conformità HACCP fin dall\'inizio.'
  },
  bar: {
    name: 'Bar',
    description: 'Bar con servizio bevande e snack',
    icon: Coffee,
    iconColor: 'text-amber-600',
    features: [
      'Frigo A: Latticini (2-4°C)',
      'Frigo B: Surgelati (-19 a -16°C)',
      'Dipartimenti: Banco Bar, Magazzino',
      'Ruoli: Cameriere, Cassiere'
    ],
    // Categorie specifiche per ogni punto di conservazione
    conservationPoints: {
      'Frigo A': {
        temperature: { min: 2, max: 4 },
        allowedCategories: ['latticini', 'formaggi', 'verdure'],
        description: 'Conservazione latticini e ingredienti freschi per cocktail'
      },
      'Frigo B': {
        temperature: { min: -19, max: -16 },
        allowedCategories: ['surgelati', 'gelati', 'frutta_congelata'],
        description: 'Conservazione gelati e frutta congelata per cocktail'
      }
    },
    whyMatters: 'Configura automaticamente i punti di conservazione e la struttura organizzativa specifica per bar, garantendo la conformità HACCP fin dall\'inizio.'
  }
}

function PresetSelector({ onPresetSelect, currentPreset = null }) {
  const [selectedPreset, setSelectedPreset] = useState(currentPreset)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    if (currentPreset) {
      setSelectedPreset(currentPreset)
    }
  }, [currentPreset])

  const handlePresetSelect = (presetKey) => {
    setSelectedPreset(presetKey)
  }

  const handleConfirm = () => {
    if (selectedPreset) {
      onPresetSelect(selectedPreset)
    }
  }

  const isPresetApplied = (presetKey) => {
    try {
      const presets = localStorage.getItem('haccp-presets')
      if (presets) {
        const parsed = JSON.parse(presets)
        return parsed.selected === presetKey && parsed.applied === true
      }
    } catch (error) {
      console.warn('Errore nel parsing preset:', error)
    }
    return false
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Seleziona il Tipo di Attività
        </h2>
        <p className="text-gray-600">
          Scegli il preset più adatto per configurare automaticamente le impostazioni base
        </p>
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(PRESETS).map(([key, preset]) => {
          const Icon = preset.icon
          const isApplied = isPresetApplied(key)
          const isSelected = selectedPreset === key
          
          return (
            <Card 
              key={key}
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-200 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${isApplied ? 'bg-green-50 border-green-200' : ''}`}
              onClick={() => handlePresetSelect(key)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-8 w-8 ${preset.iconColor}`} />
                    <div>
                      <CardTitle className="text-lg">{preset.name}</CardTitle>
                      <p className="text-sm text-gray-600">{preset.description}</p>
                    </div>
                  </div>
                  
                  {/* Overlay informativo con simbolo "?" */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowInfo(true)
                    }}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                  
                  {isApplied && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Applicato</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <h4 className="font-medium mb-2">Include automaticamente:</h4>
                    <ul className="space-y-1">
                      {preset.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-xs">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-900 text-xs mb-1">
                          Perché è importante?
                        </p>
                        <p className="text-xs text-blue-800">
                          {preset.whyMatters}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Panel */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-gray-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900 mb-1">
              Cosa succede dopo la selezione?
            </p>
            <p className="text-sm text-gray-700">
              Il preset selezionato creerà automaticamente i punti di conservazione, 
              i dipartimenti e i ruoli base. Potrai sempre modificarli o aggiungerne 
              di nuovi in seguito.
            </p>
          </div>
        </div>
      </div>

      {/* Overlay informativo dettagliato */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Dettagli Preset HACCP
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfo(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <preset.icon className={`h-6 w-6 ${preset.iconColor}`} />
                      <h4 className="text-lg font-semibold text-gray-900">{preset.name}</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Punti di Conservazione:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(preset.conservationPoints || {}).map(([pointName, config]) => (
                            <div key={pointName} className="bg-gray-50 p-3 rounded border">
                              <h6 className="font-medium text-gray-800 mb-1">{pointName}</h6>
                              <p className="text-sm text-gray-600 mb-2">
                                Temperatura: {config.temperature.min}°C a {config.temperature.max}°C
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                Categorie consentite: {config.allowedCategories.join(', ')}
                              </p>
                              <p className="text-xs text-gray-500">{config.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Caratteristiche:</h5>
                        <ul className="space-y-1">
                          {preset.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Questi preset sono progettati secondo gli standard HACCP per garantire 
                  la sicurezza alimentare e la conformità normativa.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleConfirm}
          disabled={!selectedPreset}
          className="px-8 py-3"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Conferma Selezione
        </Button>
      </div>
    </div>
  )
}

export default PresetSelector
