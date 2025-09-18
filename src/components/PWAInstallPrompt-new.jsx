/**
 * PWA Install Prompt Component - HACCP Design System
 * 
 * Professional install prompt for PWA with improved UX
 */

import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import usePWA from '../hooks/usePWA'

const PWAInstallPrompt = () => {
  const { 
    isInstallable, 
    isInstalled, 
    installApp, 
    isMobile, 
    isIOS, 
    isAndroid 
  } = usePWA()
  
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Show prompt after delay if installable and not dismissed
  useEffect(() => {
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000) // Show after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [isInstallable, isInstalled, dismissed])

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed || !isInstallable || !showPrompt) {
    return null
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    setShowPrompt(false)
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Check if already dismissed this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [])

  const getInstallInstructions = () => {
    if (isIOS) {
      return {
        title: 'Installa su iPhone/iPad',
        steps: [
          'Tocca il pulsante Condividi in Safari',
          'Scorri e tocca "Aggiungi alla schermata Home"',
          'Tocca "Aggiungi" per completare l\'installazione'
        ]
      }
    }
    
    if (isAndroid) {
      return {
        title: 'Installa su Android',
        steps: [
          'Tocca il pulsante "Installa" qui sotto',
          'Conferma l\'installazione nel popup',
          'L\'app verrà aggiunta alla schermata Home'
        ]
      }
    }
    
    return {
      title: 'Installa su Desktop',
      steps: [
        'Clicca il pulsante "Installa" qui sotto',
        'Conferma l\'installazione nel popup del browser',
        'L\'app verrà aggiunta al desktop'
      ]
    }
  }

  const instructions = getInstallInstructions()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile ? (
                <Smartphone className="w-8 h-8 text-primary-600" />
              ) : (
                <Monitor className="w-8 h-8 text-primary-600" />
              )}
              <CardTitle size="sm">
                Installa HACCP Manager
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDismiss}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <p className="text-neutral-600">
              Installa l&apos;app per un accesso più rapido e funzionalità offline complete.
            </p>

            <div className="space-y-3">
              <h4 className="font-medium text-neutral-900">
                {instructions.title}
              </h4>
              <ol className="space-y-2 text-sm text-neutral-600">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1"
              >
                Non ora
              </Button>
              {!isIOS && (
                <Button
                  variant="primary"
                  onClick={handleInstall}
                  className="flex-1"
                >
                  <Download className="w-4 h-4" />
                  Installa
                </Button>
              )}
            </div>

            {isIOS && (
              <div className="text-center pt-2">
                <p className="text-xs text-neutral-500">
                  Su iOS, usa il menu Condividi di Safari per installare
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PWAInstallPrompt