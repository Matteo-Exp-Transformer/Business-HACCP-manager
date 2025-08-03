import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Download, X, Smartphone, Info, CheckCircle } from 'lucide-react'

function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showManualInstructions, setShowManualInstructions] = useState(false)
  const [pwaStatus, setPwaStatus] = useState({
    isStandalone: false,
    hasServiceWorker: false,
    hasManifest: false,
    isInstallable: false
  })

  useEffect(() => {
    // Controlla se l'app è già installata
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return true
      }
      return false
    }

    // Controlla lo stato PWA
    const checkPWAStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const hasServiceWorker = 'serviceWorker' in navigator
      const hasManifest = document.querySelector('link[rel="manifest"]') !== null
      const isInstallable = 'beforeinstallprompt' in window || isStandalone
      
      setPwaStatus({
        isStandalone,
        hasServiceWorker,
        hasManifest,
        isInstallable
      })
    }

    checkPWAStatus()

    // Controlla se l'utente ha già rifiutato l'installazione
    const hasUserRejected = localStorage.getItem('pwa-install-rejected')
    
    if (!checkIfInstalled() && !hasUserRejected) {
      // Ascolta l'evento beforeinstallprompt
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('beforeinstallprompt event fired')
        e.preventDefault()
        setDeferredPrompt(e)
        setShowInstallPrompt(true)
      })

      // Ascolta l'evento appinstalled
      window.addEventListener('appinstalled', () => {
        console.log('App installed successfully')
        setIsInstalled(true)
        setShowInstallPrompt(false)
        setDeferredPrompt(null)
      })

      // Mostra istruzioni manuali se dopo 2 secondi non appare il prompt
      setTimeout(() => {
        if (!showInstallPrompt && !isInstalled) {
          setShowManualInstructions(true)
        }
      }, 2000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {})
      window.removeEventListener('appinstalled', () => {})
    }
  }, [showInstallPrompt, isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available')
      setShowManualInstructions(true)
      return
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('PWA installata con successo!')
        setIsInstalled(true)
      } else {
        console.log('Installazione PWA rifiutata')
        localStorage.setItem('pwa-install-rejected', 'true')
        setShowManualInstructions(true)
      }
    } catch (error) {
      console.error('Errore durante l\'installazione:', error)
      setShowManualInstructions(true)
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    setShowManualInstructions(false)
    localStorage.setItem('pwa-install-rejected', 'true')
  }

  const handleManualInstall = () => {
    setShowManualInstructions(true)
    setShowInstallPrompt(false)
  }

  const handleDebugInfo = () => {
    console.log('PWA Status:', pwaStatus)
    console.log('Deferred Prompt:', deferredPrompt)
    console.log('Is Installed:', isInstalled)
    alert(`PWA Status:\nStandalone: ${pwaStatus.isStandalone}\nService Worker: ${pwaStatus.hasServiceWorker}\nManifest: ${pwaStatus.hasManifest}\nInstallable: ${pwaStatus.isInstallable}`)
  }

  if (isInstalled) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">App installata con successo!</span>
        </div>
      </div>
    )
  }

  if (showManualInstructions) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Installa Manualmente</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Il tuo dispositivo non supporta l'installazione PWA automatica. Prova questi metodi:
            </p>
            <div className="text-sm text-gray-700 space-y-2 mb-3">
              <p><strong>Metodo 1:</strong> Menu (⋮) → Cerca "Installa" o "Aggiungi"</p>
              <p><strong>Metodo 2:</strong> Condividi → Cerca "Aggiungi alla schermata Home"</p>
              <p><strong>Metodo 3:</strong> Impostazioni → Siti web → Installa</p>
              <p><strong>Metodo 4:</strong> Prova con Chrome o Firefox</p>
              <p><strong>Metodo 5:</strong> Crea un bookmark nella home</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleDebugInfo}
                variant="outline"
                size="sm"
              >
                <Info className="h-4 w-4" />
                Debug Info
              </Button>
              <Button 
                onClick={handleDismiss}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
                Chiudi
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Installa l'App</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Installa HACCP Manager sul tuo dispositivo per un accesso più veloce e funzionalità offline.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleInstallClick}
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Installa
            </Button>
            <Button 
              onClick={handleManualInstall}
              variant="outline"
              size="sm"
            >
              <Smartphone className="h-4 w-4" />
              Istruzioni Manuali
            </Button>
            <Button 
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4" />
              Non ora
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallPrompt 