/**
 * Componente per l'input della temperatura con modalità normalizzate
 * Gestisce fixed, range e ambient modes
 */

import React from 'react'
import { Input } from './Input'
import { Label } from './Label'
import { TEMP_MODES } from '../../utils/haccpConstants'

const TemperatureModeInput = ({ 
  value, 
  onChange, 
  className = '', 
  placeholder = '',
  showValidation = false,
  selectedCategories = [],
  onValidationChange = null
}) => {
  const { setTempMode, setTempC, setTempRangeC } = value

  const handleModeChange = (mode) => {
    const newValue = {
      setTempMode: mode,
      setTempC: undefined,
      setTempRangeC: undefined
    }
    
    // Imposta valori di default per il modo selezionato
    if (mode === TEMP_MODES.FIXED) {
      newValue.setTempC = 4
    } else if (mode === TEMP_MODES.RANGE) {
      newValue.setTempRangeC = { min: 2, max: 8 }
    }
    
    onChange(newValue)
  }

  const handleFixedTempChange = (temp) => {
    const newValue = {
      ...value,
      setTempC: parseFloat(temp) || undefined
    }
    onChange(newValue)
  }

  const handleRangeMinChange = (min) => {
    const newValue = {
      ...value,
      setTempRangeC: {
        ...setTempRangeC,
        min: parseFloat(min) || 0
      }
    }
    onChange(newValue)
  }

  const handleRangeMaxChange = (max) => {
    const newValue = {
      ...value,
      setTempRangeC: {
        ...setTempRangeC,
        max: parseFloat(max) || 0
      }
    }
    onChange(newValue)
  }

  // Calcola la validazione HACCP se richiesta
  const getValidationStyle = () => {
    if (!showValidation || !selectedCategories.length) {
      return 'border-gray-300'
    }

    // Crea un oggetto temporaneo per la validazione
    const tempPoint = { setTempMode, setTempC, setTempRangeC }
    
    // Qui potresti implementare la logica di validazione HACCP
    // Per ora restituisce uno stile neutro
    return 'border-gray-300'
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selezione modalità */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Modalità Temperatura *</Label>
        <div className="mt-2 space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="tempMode"
              value={TEMP_MODES.FIXED}
              checked={setTempMode === TEMP_MODES.FIXED}
              onChange={(e) => handleModeChange(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Temperatura fissa</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="tempMode"
              value={TEMP_MODES.RANGE}
              checked={setTempMode === TEMP_MODES.RANGE}
              onChange={(e) => handleModeChange(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Range di temperatura</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="tempMode"
              value={TEMP_MODES.AMBIENT}
              checked={setTempMode === TEMP_MODES.AMBIENT}
              onChange={(e) => handleModeChange(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Temperatura ambiente</span>
          </label>
        </div>
      </div>

      {/* Input temperatura fissa */}
      {setTempMode === TEMP_MODES.FIXED && (
        <div>
          <Label htmlFor="setTempC" className="text-sm font-medium text-gray-700">
            Temperatura (°C) *
          </Label>
          <Input
            id="setTempC"
            type="number"
            step="0.1"
            value={setTempC || ''}
            onChange={(e) => handleFixedTempChange(e.target.value)}
            placeholder="es. 4, -18, 2.5"
            className={`mt-1 ${getValidationStyle()}`}
            required
          />
        </div>
      )}

      {/* Input range temperatura */}
      {setTempMode === TEMP_MODES.RANGE && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="setTempMin" className="text-sm font-medium text-gray-700">
              Temperatura Min (°C) *
            </Label>
            <Input
              id="setTempMin"
              type="number"
              step="0.1"
              value={setTempRangeC?.min || ''}
              onChange={(e) => handleRangeMinChange(e.target.value)}
              placeholder="es. 2"
              className={`mt-1 ${getValidationStyle()}`}
              required
            />
          </div>
          <div>
            <Label htmlFor="setTempMax" className="text-sm font-medium text-gray-700">
              Temperatura Max (°C) *
            </Label>
            <Input
              id="setTempMax"
              type="number"
              step="0.1"
              value={setTempRangeC?.max || ''}
              onChange={(e) => handleRangeMaxChange(e.target.value)}
              placeholder="es. 8"
              className={`mt-1 ${getValidationStyle()}`}
              required
            />
          </div>
        </div>
      )}

      {/* Display temperatura ambiente */}
      {setTempMode === TEMP_MODES.AMBIENT && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Temperatura ambiente: 15°C - 25°C
          </p>
        </div>
      )}
    </div>
  )
}

export default TemperatureModeInput
