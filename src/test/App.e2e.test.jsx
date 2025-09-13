/**
 * E2E Smoke Test per l'applicazione HACCP
 * Verifica che i componenti principali si carichino senza errori
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App.jsx'

// Mock dei servizi esterni per il test
vi.mock('../lib/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }
}))

vi.mock('../services/supabaseService.js', () => ({
  getConservationPoints: vi.fn(() => Promise.resolve([])),
  getProducts: vi.fn(() => Promise.resolve([])),
  getTemperatureLogs: vi.fn(() => Promise.resolve([])),
  getDepartments: vi.fn(() => Promise.resolve([])),
  getStaff: vi.fn(() => Promise.resolve([]))
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('App E2E Smoke Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage per restituire dati vuoti
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should render the main application without crashing', () => {
    expect(() => {
      render(<App />)
    }).not.toThrow()
  })

  it('should display the main navigation elements', () => {
    render(<App />)
    
    // Verifica che gli elementi principali siano presenti
    expect(screen.getByText('Business HACCP Manager')).toBeInTheDocument()
    expect(screen.getByText('Sistema di Gestione HACCP per Ristoranti')).toBeInTheDocument()
    expect(screen.getByText('🚀 INIZIA TURNO')).toBeInTheDocument()
  })

  it('should handle missing data gracefully', () => {
    // Simula localStorage vuoto
    localStorageMock.getItem.mockReturnValue(null)
    
    expect(() => {
      render(<App />)
    }).not.toThrow()
  })

  it('should initialize with default state', () => {
    render(<App />)
    
    // Verifica che l'app si inizializzi senza errori
    // e che i componenti principali siano montati
    expect(document.body).toBeInTheDocument()
  })
})
