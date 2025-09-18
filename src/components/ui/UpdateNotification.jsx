/**
 * Update Notification Component - HACCP Design System
 * 
 * Notifies users when app updates are available
 */

import { RefreshCw, X } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import usePWA from '../../hooks/usePWA'

export const UpdateNotification = () => {
  const { needRefresh, updateApp, closeUpdateNotification } = usePWA()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="animate-slide-up shadow-strong">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-neutral-900 mb-1">
                Aggiornamento Disponibile
              </h4>
              <p className="text-sm text-neutral-600 mb-3">
                Una nuova versione dell&apos;app è disponibile con miglioramenti e correzioni.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={updateApp}
                >
                  <RefreshCw className="w-3 h-3" />
                  Aggiorna
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeUpdateNotification}
                >
                  <X className="w-3 h-3" />
                  Chiudi
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default UpdateNotification