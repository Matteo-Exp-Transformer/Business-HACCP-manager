import { describe, it, expect } from 'vitest'
import {
  parseSetTemperature,
  getRefrigeratorType,
  getTemperatureStatus,
  getDisplayTemperature,
  isTemperatureCompatible
} from '../utils/temperatureHelpers'

describe('Temperature Helper Functions', () => {
  describe('parseSetTemperature', () => {
    it('should return ambient mode for empty temperature', () => {
      const result = parseSetTemperature({})
      expect(result.mode).toBe('ambient')
      expect(result.value).toBeUndefined()
      expect(result.range).toBeUndefined()
    })

    it('should return ambient mode for null temperature', () => {
      const result = parseSetTemperature({ targetTemp: null })
      expect(result.mode).toBe('ambient')
    })

    it('should return fixed mode for numeric temperature', () => {
      const result = parseSetTemperature({ targetTemp: 4 })
      expect(result.mode).toBe('fixed')
      expect(result.value).toBe(4)
    })

    it('should return fixed mode for setTemperature field', () => {
      const result = parseSetTemperature({ setTemperature: 2 })
      expect(result.mode).toBe('fixed')
      expect(result.value).toBe(2)
    })

    it('should return fixed mode for temperature field', () => {
      const result = parseSetTemperature({ temperature: 3 })
      expect(result.mode).toBe('fixed')
      expect(result.value).toBe(3)
    })

    it('should return fixed mode for temp field', () => {
      const result = parseSetTemperature({ temp: 1 })
      expect(result.mode).toBe('fixed')
      expect(result.value).toBe(1)
    })

    it('should return ambient mode for ambiente string', () => {
      const result = parseSetTemperature({ targetTemp: 'ambiente' })
      expect(result.mode).toBe('ambient')
    })

    it('should return ambient mode for ambient string', () => {
      const result = parseSetTemperature({ targetTemp: 'ambient' })
      expect(result.mode).toBe('ambient')
    })

    it('should return range mode for range string', () => {
      const result = parseSetTemperature({ targetTemp: '2-4°C' })
      expect(result.mode).toBe('range')
      expect(result.range).toEqual({ min: 2, max: 4 })
    })

    it('should return range mode for da-a range string', () => {
      const result = parseSetTemperature({ targetTemp: 'da 2 a 4°C' })
      expect(result.mode).toBe('range')
      expect(result.range).toEqual({ min: 2, max: 4 })
    })

    it('should return fixed mode for single temperature string', () => {
      const result = parseSetTemperature({ targetTemp: '4°C' })
      expect(result.mode).toBe('fixed')
      expect(result.value).toBe(4)
    })

    it('should return fixed mode for temperature without unit', () => {
      const result = parseSetTemperature({ targetTemp: '4' })
      expect(result.mode).toBe('fixed')
      expect(result.value).toBe(4)
    })

    it('should handle decimal temperatures', () => {
      const result = parseSetTemperature({ targetTemp: '3.5°C' })
      expect(result.mode).toBe('fixed')
      expect(result.value).toBe(3.5)
    })

    it('should handle decimal ranges', () => {
      const result = parseSetTemperature({ targetTemp: '2.5-4.5°C' })
      expect(result.mode).toBe('range')
      expect(result.range).toEqual({ min: 2.5, max: 4.5 })
    })
  })

  describe('getRefrigeratorType', () => {
    it('should return Ambiente for ambient mode', () => {
      const result = getRefrigeratorType({ setTempMode: 'ambient' })
      expect(result).toBe('Ambiente')
    })

    it('should return Freezer for temperature <= 0', () => {
      const result = getRefrigeratorType({ setTempMode: 'fixed', setTempC: 0 })
      expect(result).toBe('Freezer')
    })

    it('should return Frigorifero for temperature 0-4', () => {
      const result = getRefrigeratorType({ setTempMode: 'fixed', setTempC: 4 })
      expect(result).toBe('Frigorifero')
    })

    it('should return Frigorifero (zona calda) for temperature 4-8', () => {
      const result = getRefrigeratorType({ setTempMode: 'fixed', setTempC: 8 })
      expect(result).toBe('Frigorifero (zona calda)')
    })

    it('should return Ambiente controllato for temperature > 8', () => {
      const result = getRefrigeratorType({ setTempMode: 'fixed', setTempC: 15 })
      expect(result).toBe('Ambiente controllato')
    })

    it('should calculate average for range mode', () => {
      const result = getRefrigeratorType({ 
        setTempMode: 'range', 
        setTempRangeC: { min: 2, max: 4 } 
      })
      expect(result).toBe('Frigorifero')
    })

    it('should return Sconosciuto for invalid mode', () => {
      const result = getRefrigeratorType({ setTempMode: 'invalid' })
      expect(result).toBe('Sconosciuto')
    })
  })

  describe('getTemperatureStatus', () => {
    it('should return green for temperature within 1°C', () => {
      const result = getTemperatureStatus(4, { setTempMode: 'fixed', setTempC: 4 })
      expect(result.status).toBe('green')
      expect(result.difference).toBe(0)
    })

    it('should return orange for temperature within 1.5°C', () => {
      const result = getTemperatureStatus(5, { setTempMode: 'fixed', setTempC: 4 })
      expect(result.status).toBe('orange')
      expect(result.difference).toBe(1)
    })

    it('should return red for temperature beyond 2°C', () => {
      const result = getTemperatureStatus(7, { setTempMode: 'fixed', setTempC: 4 })
      expect(result.status).toBe('red')
      expect(result.difference).toBe(3)
    })

    it('should calculate average for range mode', () => {
      const result = getTemperatureStatus(3, { 
        setTempMode: 'range', 
        setTempRangeC: { min: 2, max: 4 } 
      })
      expect(result.status).toBe('green')
      expect(result.difference).toBe(0)
    })

    it('should use ambient range for ambient mode', () => {
      const result = getTemperatureStatus(20, { setTempMode: 'ambient' })
      expect(result.status).toBe('green')
      expect(result.difference).toBe(0)
    })
  })

  describe('getDisplayTemperature', () => {
    it('should return Ambiente for ambient mode', () => {
      const result = getDisplayTemperature({ setTempMode: 'ambient' })
      expect(result).toBe('Ambiente')
    })

    it('should return formatted temperature for fixed mode', () => {
      const result = getDisplayTemperature({ setTempMode: 'fixed', setTempC: 4 })
      expect(result).toBe('4°C')
    })

    it('should return formatted range for range mode', () => {
      const result = getDisplayTemperature({ 
        setTempMode: 'range', 
        setTempRangeC: { min: 2, max: 4 } 
      })
      expect(result).toBe('2°C - 4°C')
    })

    it('should return N/A for invalid mode', () => {
      const result = getDisplayTemperature({ setTempMode: 'invalid' })
      expect(result).toBe('N/A')
    })
  })

  describe('isTemperatureCompatible', () => {
    it('should return compatible for temperature in ambient range', () => {
      const result = isTemperatureCompatible(20, { setTempMode: 'ambient' })
      expect(result.compatible).toBe(true)
      expect(result.status).toBe('compatible')
    })

    it('should return incompatible for temperature outside ambient range', () => {
      const result = isTemperatureCompatible(30, { setTempMode: 'ambient' })
      expect(result.compatible).toBe(false)
      expect(result.status).toBe('incompatible')
    })

    it('should return compatible for temperature within fixed range', () => {
      const result = isTemperatureCompatible(4, { setTempMode: 'fixed', setTempC: 4 })
      expect(result.compatible).toBe(true)
      expect(result.status).toBe('compatible')
    })

    it('should return tolerance for temperature within HACCP tolerance', () => {
      const result = isTemperatureCompatible(5, { setTempMode: 'fixed', setTempC: 4 })
      expect(result.compatible).toBe(true)
      expect(result.status).toBe('tolerance')
    })

    it('should return incompatible for temperature outside tolerance', () => {
      const result = isTemperatureCompatible(10, { setTempMode: 'fixed', setTempC: 4 })
      expect(result.compatible).toBe(false)
      expect(result.status).toBe('incompatible')
    })

    it('should return compatible for temperature within range', () => {
      const result = isTemperatureCompatible(3, { 
        setTempMode: 'range', 
        setTempRangeC: { min: 2, max: 4 } 
      })
      expect(result.compatible).toBe(true)
      expect(result.status).toBe('compatible')
    })

    it('should return tolerance for temperature near range', () => {
      const result = isTemperatureCompatible(1, { 
        setTempMode: 'range', 
        setTempRangeC: { min: 2, max: 4 } 
      })
      expect(result.compatible).toBe(true)
      expect(result.status).toBe('tolerance')
    })

    it('should return incompatible for temperature far from range', () => {
      const result = isTemperatureCompatible(10, { 
        setTempMode: 'range', 
        setTempRangeC: { min: 2, max: 4 } 
      })
      expect(result.compatible).toBe(false)
      expect(result.status).toBe('incompatible')
    })
  })
})
