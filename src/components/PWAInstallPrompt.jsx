import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Download, X } from 'lucide-react'

function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Controlla se l'app è già installata
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return true
      }
      return false
    }

    // Controlla se l'utente ha già rifiutato l'installazione
    const hasUserRejected = localStorage.getItem('pwa-install-rejected')
    
    if (!checkIfInstalled() && !hasUserRejected) {
      // Ascolta l'evento beforeinstallprompt
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setShowInstallPrompt(true)
      })

      // Ascolta l'evento appinstalled
      window.addEventListener('appinstalled', () => {
        setIsInstalled(true)
        setShowInstallPrompt(false)
        setDeferredPrompt(null)
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {})
      window.removeEventListener('appinstalled', () => {})
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA installata con successo!')
      setIsInstalled(true)
    } else {
      console.log('Installazione PWA rifiutata')
      localStorage.setItem('pwa-install-rejected', 'true')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-rejected', 'true')
  }

  if (isInstalled || !showInstallPrompt) {
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
            Installa Mini-ePackPro sul tuo dispositivo per un accesso più veloce e funzionalità offline.
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