/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo componente gestisce l'INPUT DELLE TEMPERATURE - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo componente standardizza l'inserimento temperature in tutta l'app
 * ⚠️ Basato su normative EU/ASL vincolanti per la sicurezza alimentare
 * 
 * @fileoverview Componente Input Temperature HACCP - Sistema Standardizzato
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Input Temperature Uniforme
 * @version 1.0
 */

import React from 'react'
import { Input } from './Input'
import { Label } from './Label'
import { CheckCircle, AlertTriangle } from 'lucide-react'

function TemperatureInput({
  label = "Range Temperatura (°C)",
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = "min",
  maxPlaceholder = "max",
  required = false,
  showValidation = true,
  showSuggestions = true,
  className = "",
  id = "temperature-range"
}) {
  const tempMin = parseFloat(minValue)
  const tempMax = parseFloat(maxValue)
  const hasValidInputs = minValue && maxValue && !isNaN(tempMin) && !isNaN(tempMax)
  const hasValidRange = hasValidInputs && tempMin < tempMax

  // Funzione per determinare il tipo di conservazione
  const getTemperatureType = (min, max) => {
    const avgTemp = (min + max) / 2
    if (avgTemp <= -13.5) return 'Surgelato'
    if (avgTemp >= 15) return 'Temperatura Ambiente'
    return 'Refrigerato'
  }

  // Funzione per determinare lo stato della temperatura
  const getTemperatureStatus = (min, max) => {
    const avgTemp = (min + max) / 2
    if (avgTemp < 0 || avgTemp > 8) return 'danger'
    if (avgTemp >= 6 && avgTemp <= 8) return 'warning'
    return 'ok'
  }

  return (
    <div className={className}>
      <Label htmlFor={id}>{label} {required && "*"}</Label>
      
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
        <span className="text-gray-700 font-medium text-sm whitespace-nowrap">da</span>
        <Input
          id={`${id}-min`}
          type="number"
          step="0.1"
          value={minValue || ''}
          onChange={onMinChange}
          placeholder={minPlaceholder}
          className="w-24 text-center font-medium"
          required={required}
        />
        <span className="text-gray-700 font-medium text-sm whitespace-nowrap">°C</span>
        <span className="text-gray-700 font-medium text-sm whitespace-nowrap">a</span>
        <Input
          id={`${id}-max`}
          type="number"
          step="0.1"
          value={maxValue || ''}
          onChange={onMaxChange}
          placeholder={maxPlaceholder}
          className="w-24 text-center font-medium"
          required={required}
        />
        <span className="text-gray-700 font-medium text-sm whitespace-nowrap">°C</span>
      </div>
      
      {/* Validazione e suggerimenti */}
      {showValidation && hasValidInputs && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Informazioni temperatura</span>
          </div>
          <div className="text-sm text-blue-700 space-y-2">
            <div>
              <span className="font-medium">Tipo di conservazione: </span>
              <span>{getTemperatureType(tempMin, tempMax)}</span>
            </div>
            <div>
              <span className="font-medium">Stato: </span>
              <span>
                {getTemperatureStatus(tempMin, tempMax) === 'ok' ? '✅ Normale' : 
                 getTemperatureStatus(tempMin, tempMax) === 'warning' ? '⚠️ Attenzione' : '🚨 Critica'}
              </span>
            </div>
            {!hasValidRange && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                ⚠️ La temperatura minima deve essere inferiore alla massima
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Suggerimenti per temperature comuni */}
      {showSuggestions && (
        <div className="mt-2 text-xs text-gray-500">
          💡 Suggerimenti: Carne fresca (2-4°C), Pesce (0-2°C), Surgelati (-18°C), Ambiente (15-25°C)
        </div>
      )}
    </div>
  )
}

export default TemperatureInput
