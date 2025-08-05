import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { 
  Cloud, 
  CloudOff, 
  Upload, 
  Download, 
  Wifi, 
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Database
} from 'lucide-react'

function SyncManager({ 
  currentUser, 
  companyId,
  onDataSync,
  pendingChanges = [],
  lastSyncTime 
}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle', 'uploading', 'downloading', 'error'
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSyncStatus, setLastSyncStatus] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Update pending changes count
  useEffect(() => {
    setPendingCount(pendingChanges.length)
  }, [pendingChanges])

  // Simulate sync operations (to be replaced with actual Firebase calls)
  const handleUploadChanges = async () => {
    if (!isOnline) {
      setLastSyncStatus({ type: 'error', message: 'Nessuna connessione internet' })
      return
    }

    if (pendingCount === 0) {
      setLastSyncStatus({ type: 'info', message: 'Nessuna modifica da caricare' })
      return
    }

    setSyncStatus('uploading')
    setSyncProgress(0)

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 20) {
        setSyncProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Here we'll implement actual Firebase upload
      console.log('🔄 Uploading changes to Firebase...', pendingChanges)
      
      // Simulate successful upload
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSyncStatus('idle')
      setLastSyncStatus({ 
        type: 'success', 
        message: `${pendingCount} modifiche caricate con successo` 
      })
      
      // Clear pending changes
      onDataSync?.('upload', pendingChanges)
      
    } catch (error) {
      setSyncStatus('error')
      setLastSyncStatus({ 
        type: 'error', 
        message: `Errore durante il caricamento: ${error.message}` 
      })
    }
  }

  const handleDownloadUpdates = async () => {
    if (!isOnline) {
      setLastSyncStatus({ type: 'error', message: 'Nessuna connessione internet' })
      return
    }

    setSyncStatus('downloading')
    setSyncProgress(0)

    try {
      // Simulate download progress
      for (let i = 0; i <= 100; i += 25) {
        setSyncProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Here we'll implement actual Firebase download
      console.log('📥 Downloading updates from Firebase...')
      
      // Simulate successful download
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSyncStatus('idle')
      setLastSyncStatus({ 
        type: 'success', 
        message: 'Aggiornamenti scaricati con successo' 
      })
      
      // Notify parent component
      onDataSync?.('download', [])
      
    } catch (error) {
      setSyncStatus('error')
      setLastSyncStatus({ 
        type: 'error', 
        message: `Errore durante il download: ${error.message}` 
      })
    }
  }

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Mai sincronizzato'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Appena ora'
    if (diffMins < 60) return `${diffMins} min fa`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ore fa`
    return date.toLocaleDateString('it-IT')
  }

  const getStatusIcon = () => {
    if (syncStatus === 'uploading') return <Upload className="h-4 w-4 animate-pulse" />
    if (syncStatus === 'downloading') return <Download className="h-4 w-4 animate-pulse" />
    if (syncStatus === 'error') return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (lastSyncStatus?.type === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />
    return <RefreshCw className="h-4 w-4" />
  }

  const getStatusColor = () => {
    if (syncStatus === 'error' || lastSyncStatus?.type === 'error') return 'text-red-600'
    if (lastSyncStatus?.type === 'success') return 'text-green-600'
    if (syncStatus === 'uploading' || syncStatus === 'downloading') return 'text-blue-600'
    return 'text-gray-600'
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" />
            Sincronizzazione Cloud
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status Banner */}
        {!isOnline && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Modalità Offline</p>
              <p className="text-xs text-yellow-600">Le modifiche verranno salvate localmente</p>
            </div>
          </div>
        )}

        {/* Sync Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={handleUploadChanges}
            disabled={!isOnline || syncStatus !== 'idle' || pendingCount === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            Carica Modifiche
            {pendingCount > 0 && (
              <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </Button>

          <Button
            onClick={handleDownloadUpdates}
            disabled={!isOnline || syncStatus !== 'idle'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Scarica Aggiornamenti
          </Button>
        </div>

        {/* Progress Bar */}
        {syncStatus !== 'idle' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={getStatusColor()}>
                {syncStatus === 'uploading' ? 'Caricamento...' : 'Download...'}
              </span>
              <span className="text-gray-500">{syncProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Info */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Ultimo sync:</span>
            <span className="font-medium">{formatLastSync(lastSyncTime)}</span>
          </div>
          
          {lastSyncStatus && (
            <div className={`flex items-center gap-2 p-2 rounded ${
              lastSyncStatus.type === 'success' ? 'bg-green-50 text-green-700' :
              lastSyncStatus.type === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {getStatusIcon()}
              <span>{lastSyncStatus.message}</span>
            </div>
          )}
        </div>

        {/* Company Info */}
        <div className="pt-2 border-t border-blue-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Azienda:</span>
            <span className="font-medium">{companyId || 'Non configurata'}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Utente:</span>
            <span className="font-medium">{currentUser?.name || 'Sconosciuto'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SyncManager