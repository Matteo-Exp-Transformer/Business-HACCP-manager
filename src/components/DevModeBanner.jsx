/**
 * DevModeBanner - Banner per modalità sviluppo
 * 
 * Questo componente mostra un banner "DEV MODE" quando la modalità sviluppo è attiva
 * e fornisce controlli per gestire la modalità dev
 * 
 * @version 1.0
 * @critical Sviluppo - Indicatore modalità testing
 */

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Settings, X, Info, Trash2, RefreshCw } from 'lucide-react'
import { isDevMode, toggleDevMode, getDevModeSettings, clearDevData, getDebugInfo } from '../utils/devMode'

function DevModeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [devSettings, setDevSettings] = useState(null)

  useEffect(() => {
    // Controlla se la modalità dev è attiva
    const checkDevMode = () => {
      const devMode = isDevMode()
      setIsVisible(devMode)
      
      if (devMode) {
        setDevSettings(getDevModeSettings())
      }
    }

    checkDevMode()
    
    // Listener per cambiamenti localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'haccp-dev-mode') {
        checkDevMode()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Non mostrare nulla se la modalità dev non è attiva
  if (!isVisible) return null

  const handleToggleDevMode = () => {
    toggleDevMode(false, 'Disattivato via banner')
  }

  const handleClearDevData = async () => {
    if (confirm('⚠️ ATTENZIONE: Stai per rimuovere tutti i dati di sviluppo.\n\nQuesto rimuoverà:\n• Modalità dev\n• Onboarding\n• Preset\n\nI dati HACCP (temperature, pulizie, inventario) NON verranno toccati.\n\nProcedere?')) {
      const success = clearDevData()
      if (success) {
        alert('✅ Dati di sviluppo rimossi con successo!\n\nLa modalità dev è stata disattivata.')
        window.location.reload()
      } else {
        alert('❌ Errore nella rimozione dei dati di sviluppo')
      }
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const debugInfo = getDebugInfo()

  return (
    <>
      {/* Banner principale */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-bold">DEV MODE ATTIVO</span>
            <span className="text-sm opacity-75">
              • Onboarding bypassato • Debug info • Testing features
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="p-1 hover:bg-yellow-400 rounded transition-colors"
              title="Mostra info debug"
            >
              <Info className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 hover:bg-yellow-400 rounded transition-colors"
              title="Impostazioni dev"
            >
              <Settings className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleRefresh}
              className="p-1 hover:bg-yellow-400 rounded transition-colors"
              title="Ricarica pagina"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleToggleDevMode}
              className="p-1 hover:bg-yellow-400 rounded transition-colors"
              title="Disattiva dev mode"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Info debug espandibili */}
      {showDebugInfo && debugInfo && (
        <div className="fixed top-16 left-4 right-4 z-40 bg-white border border-yellow-300 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-yellow-800 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Debug Info
            </h3>
            <button
              onClick={() => setShowDebugInfo(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <strong>Timestamp:</strong> {debugInfo.timestamp}
            </div>
            <div>
              <strong>URL:</strong> {debugInfo.url}
            </div>
            <div>
              <strong>User Agent:</strong> {debugInfo.userAgent}
            </div>
            <div>
              <strong>LocalStorage:</strong> {debugInfo.localStorage.keys.length} chiavi, {Math.round(debugInfo.localStorage.size / 1024)} KB
            </div>
            <div>
              <strong>SessionStorage:</strong> {debugInfo.sessionStorage.keys.length} chiavi, {Math.round(debugInfo.sessionStorage.size / 1024)} KB
            </div>
            <div>
              <strong>Dev Mode Settings:</strong>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                {JSON.stringify(debugInfo.devMode, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Impostazioni dev espandibili */}
      {showSettings && (
        <div className="fixed top-16 left-4 right-4 z-40 bg-white border border-yellow-300 rounded-lg shadow-xl p-4 max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-yellow-800 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Impostazioni Dev Mode
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {devSettings && (
            <div className="space-y-3 text-sm">
              <div>
                <strong>Stato:</strong> 
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  ATTIVO
                </span>
              </div>
              <div>
                <strong>Attivato il:</strong> {new Date(devSettings.lastToggled).toLocaleString('it-IT')}
              </div>
              <div>
                <strong>Motivo:</strong> {devSettings.reason}
              </div>
              <div>
                <strong>Features:</strong>
                <div className="mt-1 space-y-1">
                  {devSettings.features.map(feature => (
                    <div key={feature} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <button
                  onClick={handleClearDevData}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Rimuovi Dati Dev
                </button>
                <p className="text-xs text-gray-600 mt-1 text-center">
                  Rimuove solo i dati di sviluppo, mantiene i dati HACCP
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Spazio per il banner */}
      <div className="h-16"></div>
    </>
  )
}

export default DevModeBanner
