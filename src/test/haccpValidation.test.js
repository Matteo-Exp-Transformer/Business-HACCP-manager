import { describe, it, expect, beforeEach } from 'vitest'
import {
  checkHACCPCompliance,
  checkTemperatureCategoryConflicts,
  validateConservationPoint,
  validateProduct,
  validateTemperatureLog,
  checkTemperatureCompatibility,
  validateMaintenanceConfig
} from '../utils/haccpValidation'

describe('HACCP Validation Functions', () => {
  describe('checkHACCPCompliance', () => {
    it('should return error when no categories provided', () => {
      const result = checkHACCPCompliance({}, [])
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Seleziona almeno una categoria')
      expect(result.type).toBe('error')
      expect(result.color).toBe('red')
    })

    it('should return error when categories is null', () => {
      const result = checkHACCPCompliance({}, null)
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Seleziona almeno una categoria')
    })

    it('should return error for unknown temperature mode', () => {
      const result = checkHACCPCompliance({ unknownField: 'invalid' }, ['carne'])
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Temperatura non valida')
    })

    it('should return compliant for valid temperature and categories', () => {
      const result = checkHACCPCompliance({ setTempMode: 'fixed', setTempC: 4 }, ['carne'])
      expect(result.isValid).toBe(true)
      expect(result.message).toBe('Conformità HACCP verificata')
      expect(result.type).toBe('compliant')
      expect(result.color).toBe('green')
    })
  })

  describe('checkTemperatureCategoryConflicts', () => {
    it('should return empty array for no conflicts', () => {
      const conflicts = checkTemperatureCategoryConflicts({ setTempMode: 'fixed', setTempC: 4 }, ['carne'])
      expect(conflicts).toEqual([])
    })
  })

  describe('validateConservationPoint', () => {
    it('should return error when name is missing', () => {
      const result = validateConservationPoint({})
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Nome del punto di conservazione obbligatorio')
    })

    it('should return error when name is empty string', () => {
      const result = validateConservationPoint({ name: '' })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Nome del punto di conservazione obbligatorio')
    })

    it('should return error when departmentName is missing', () => {
      const result = validateConservationPoint({ name: 'Test Point' })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Reparto obbligatorio')
    })

    it('should return error when no storage categories selected', () => {
      const result = validateConservationPoint({ 
        name: 'Test Point', 
        departmentName: 'Cucina',
        storageCategoryIds: []
      })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Seleziona almeno una categoria di stoccaggio')
    })

    it('should return error for invalid fixed temperature', () => {
      const result = validateConservationPoint({ 
        name: 'Test Point', 
        departmentName: 'Cucina',
        storageCategoryIds: ['carne'],
        setTempMode: 'fixed',
        setTempC: 'invalid'
      })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Temperatura fissa non valida')
    })

    it('should return error for invalid temperature range', () => {
      const result = validateConservationPoint({ 
        name: 'Test Point', 
        departmentName: 'Cucina',
        storageCategoryIds: ['carne'],
        setTempMode: 'range',
        setTempRangeC: { min: 10, max: 5 } // min > max
      })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Range di temperatura non valido')
    })

    it('should return valid for correct fixed temperature', () => {
      const result = validateConservationPoint({ 
        name: 'Test Point', 
        departmentName: 'Cucina',
        storageCategoryIds: ['carne'],
        setTempMode: 'fixed',
        setTempC: 4
      })
      expect(result.isValid).toBe(true)
      expect(result.message).toBe('Punto di conservazione valido')
    })

    it('should return valid for correct temperature range', () => {
      const result = validateConservationPoint({ 
        name: 'Test Point', 
        departmentName: 'Cucina',
        storageCategoryIds: ['carne'],
        setTempMode: 'range',
        setTempRangeC: { min: 2, max: 4 }
      })
      expect(result.isValid).toBe(true)
      expect(result.message).toBe('Punto di conservazione valido')
    })

    it('should return valid for ambient temperature', () => {
      const result = validateConservationPoint({ 
        name: 'Test Point', 
        departmentName: 'Cucina',
        storageCategoryIds: ['pane'],
        setTempMode: 'ambient'
      })
      expect(result.isValid).toBe(true)
      expect(result.message).toBe('Punto di conservazione valido')
    })
  })

  describe('validateProduct', () => {
    it('should return error when name is missing', () => {
      const result = validateProduct({})
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Nome prodotto obbligatorio')
    })

    it('should return error when categoryId is missing', () => {
      const result = validateProduct({ name: 'Test Product' })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Categoria prodotto obbligatoria')
    })

    it('should return error when expiryDate is missing', () => {
      const result = validateProduct({ name: 'Test Product', categoryId: 'carne' })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Data di scadenza obbligatoria')
    })

    it('should return error for invalid expiry date', () => {
      const result = validateProduct({ 
        name: 'Test Product', 
        categoryId: 'carne',
        expiryDate: 'invalid-date'
      })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Data di scadenza non valida')
    })

    it('should return warning for past expiry date', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const result = validateProduct({ 
        name: 'Test Product', 
        categoryId: 'carne',
        expiryDate: yesterday.toISOString().split('T')[0]
      })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Data di scadenza già passata')
      expect(result.type).toBe('warning')
      expect(result.color).toBe('yellow')
    })

    it('should return valid for correct product', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const result = validateProduct({ 
        name: 'Test Product', 
        categoryId: 'carne',
        expiryDate: tomorrow.toISOString().split('T')[0]
      })
      expect(result.isValid).toBe(true)
      expect(result.message).toBe('Prodotto valido')
    })
  })

  describe('validateTemperatureLog', () => {
    it('should return error when conservationPointId is missing', () => {
      const result = validateTemperatureLog({})
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Punto di conservazione obbligatorio')
    })

    it('should return error when temperatureC is missing', () => {
      const result = validateTemperatureLog({ conservationPointId: 'point1' })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Temperatura obbligatoria e deve essere un numero')
    })

    it('should return error when temperatureC is not a number', () => {
      const result = validateTemperatureLog({ 
        conservationPointId: 'point1',
        temperatureC: 'invalid'
      })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Temperatura obbligatoria e deve essere un numero')
    })

    it('should return error when timestamp is missing', () => {
      const result = validateTemperatureLog({ 
        conservationPointId: 'point1',
        temperatureC: 4
      })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Timestamp obbligatorio')
    })

    it('should return error for temperature out of reasonable range', () => {
      const result = validateTemperatureLog({ 
        conservationPointId: 'point1',
        temperatureC: 150, // Too high
        timestamp: new Date().toISOString()
      })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Temperatura fuori range ragionevole (-50°C a 100°C)')
    })

    it('should return valid for correct temperature log', () => {
      const result = validateTemperatureLog({ 
        conservationPointId: 'point1',
        temperatureC: 4,
        timestamp: new Date().toISOString()
      })
      expect(result.isValid).toBe(true)
      expect(result.message).toBe('Log temperatura valido')
    })
  })

  describe('checkTemperatureCompatibility', () => {
    it('should return error for invalid temperature', () => {
      const result = checkTemperatureCompatibility('invalid', { setTempMode: 'fixed', setTempC: 4 })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Temperatura non valida')
    })

    it('should return error for unknown temperature mode', () => {
      const result = checkTemperatureCompatibility(4, { unknownField: 'invalid' })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Configurazione temperatura non valida')
    })

    it('should return compliant for temperature within fixed range', () => {
      const result = checkTemperatureCompatibility(4, { setTempMode: 'fixed', setTempC: 4 })
      expect(result.isValid).toBe(true)
      expect(result.message).toBe('Temperatura conforme')
    })

    it('should return warning for temperature within tolerance', () => {
      const result = checkTemperatureCompatibility(5, { setTempMode: 'fixed', setTempC: 4 })
      expect(result.isValid).toBe(true)
      expect(result.message).toBe('Temperatura in tolleranza')
      expect(result.type).toBe('warning')
      expect(result.color).toBe('yellow')
    })

    it('should return error for temperature outside tolerance', () => {
      const result = checkTemperatureCompatibility(10, { setTempMode: 'fixed', setTempC: 4 })
      expect(result.isValid).toBe(false)
      expect(result.message).toContain('Temperatura fuori range')
    })

    it('should return compliant for temperature within range', () => {
      const result = checkTemperatureCompatibility(3, { 
        setTempMode: 'range', 
        setTempRangeC: { min: 2, max: 4 } 
      })
      expect(result.isValid).toBe(true)
      expect(result.message).toBe('Temperatura conforme')
    })

    it('should return compliant for ambient temperature', () => {
      const result = checkTemperatureCompatibility(20, { setTempMode: 'ambient' })
      expect(result.isValid).toBe(true)
      expect(result.message).toBe('Temperatura conforme')
    })
  })

  describe('validateMaintenanceConfig', () => {
    it('should return error when taskData is missing', () => {
      const result = validateMaintenanceConfig('temperature_monitoring', null)
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Configurazione manutenzione mancante')
    })

    it('should return error when frequency is missing', () => {
      const result = validateMaintenanceConfig('temperature_monitoring', {})
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Frequenza manutenzione obbligatoria')
    })

    it('should return error when assigned_role is missing', () => {
      const result = validateMaintenanceConfig('temperature_monitoring', { frequency: 'daily' })
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Ruolo assegnato obbligatorio')
    })

    it('should return valid for correct maintenance config', () => {
      const result = validateMaintenanceConfig('temperature_monitoring', { 
        frequency: 'daily',
        assigned_role: 'responsabile'
      })
      expect(result.isValid).toBe(true)
      expect(result.message).toBe('Configurazione manutenzione valida')
    })
  })
})
