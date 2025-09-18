/**
 * Offline Indicator Component - HACCP Design System
 * 
 * Shows connection status and offline capabilities
 */

import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react'
import { Badge } from './Badge'
import usePWA from '../../hooks/usePWA'

export const OfflineIndicator = ({ className = '' }) => {
  const { isOnline, offlineReady } = usePWA()

  if (isOnline && !offlineReady) return null

  return (
    <div className={`fixed top-20 right-4 z-40 ${className}`}>
      {!isOnline ? (
        <Badge variant="warning" className="animate-pulse">
          <WifiOff className="w-3 h-3" />
          Offline
        </Badge>
      ) : offlineReady ? (
        <Badge variant="success">
          <CloudOff className="w-3 h-3" />
          Pronto Offline
        </Badge>
      ) : null}
    </div>
  )
}

// Connection status component for detailed info
export const ConnectionStatus = ({ className = '' }) => {
  const { isOnline, offlineReady } = usePWA()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isOnline ? (
        <div className="flex items-center gap-2 text-success-600">
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Online</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-warning-600">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Offline</span>
        </div>
      )}
      
      {offlineReady && (
        <div className="flex items-center gap-2 text-primary-600">
          <Cloud className="w-4 h-4" />
          <span className="text-sm">Sync disponibile</span>
        </div>
      )}
    </div>
  )
}

export default OfflineIndicator