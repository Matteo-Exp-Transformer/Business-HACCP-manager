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
  Save,
  Smartphone
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

  // Save changes to shared space (simplified Firebase upload)
  const handleSaveToShared = async () => {
    if (!isOnline) {
      setLastSyncStatus({ type: 'error', message: 'Devi essere connesso a Internet per salvare' })
      return
    }

    if (pendingCount === 0) {
      setLastSyncStatus({ type: 'info', message: 'Non hai ancora fatto modifiche da salvare' })
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
      console.log('💾 Salvando le tue modifiche per tutti...', pendingChanges)
      
      // Simulate successful upload
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSyncStatus('idle')
      setLastSyncStatus({ 
        type: 'success', 
        message: `✅ Ho salvato ${pendingCount} modifiche. Ora tutti possono vederle!` 
      })
      
      // Clear pending changes
      onDataSync?.('upload', pendingChanges)
      
    } catch (error) {
      setSyncStatus('error')
      setLastSyncStatus({ 
        type: 'error', 
        message: `❌ Non sono riuscito a salvare. Riprova tra poco.` 
      })
    }
  }

  const handleGetUpdates = async () => {
    if (!isOnline) {
      setLastSyncStatus({ type: 'error', message: 'Devi essere connesso a Internet per ricevere aggiornamenti' })
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
      console.log('📱 Scaricando le novità dai tuoi colleghi...')
      
      // Simulate successful download
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSyncStatus('idle')
      setLastSyncStatus({ 
        type: 'success', 
        message: '✅ Perfetto! Hai ricevuto tutte le novità' 
      })
      
      // Notify parent component
      onDataSync?.('download', [])
      
    } catch (error) {
      setSyncStatus('error')
      setLastSyncStatus({ 
        type: 'error', 
        message: `❌ Non sono riuscito a scaricare gli aggiornamenti. Riprova.` 
      })
    }
  }

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Non hai mai sincronizzato'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Proprio adesso'
    if (diffMins < 60) return `${diffMins} minuti fa`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ore fa`
    return `Il ${date.toLocaleDateString('it-IT')}`
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
            <Save className="h-4 w-4 text-blue-600" />
            Condividi con i Colleghi
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? 'Connesso' : 'Niente Internet'}
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
              <p className="text-sm font-medium text-yellow-800">📴 Niente Internet</p>
              <p className="text-xs text-yellow-600">Salvo tutto sul tuo telefono per ora</p>
            </div>
          </div>
        )}

        {/* Sync Actions */}
        <div className="space-y-3">
          {/* Save Button */}
          <Button
            onClick={handleSaveToShared}
            disabled={!isOnline || syncStatus !== 'idle' || pendingCount === 0}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-3"
          >
            <Upload className="h-4 w-4" />
            <span className="font-medium">
              {pendingCount > 0 ? `Condividi ${pendingCount} Modifiche` : 'Nessuna Modifica da Condividere'}
            </span>
            {pendingCount > 0 && (
              <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </Button>

          {/* Download Button */}
          <Button
            onClick={handleGetUpdates}
            disabled={!isOnline || syncStatus !== 'idle'}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-3"
          >
            <Download className="h-4 w-4" />
            <span className="font-medium">Ricevi Novità dai Colleghi</span>
          </Button>
        </div>

        {/* Simple Explanation */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-700 text-center">
            💡 <strong>Come funziona:</strong> Le tue modifiche rimangono sul tuo telefono finché non clicchi "Condividi". 
            Quando condividi, tutti i tuoi colleghi possono vedere i tuoi aggiornamenti.
          </p>
        </div>

        {/* Progress Bar */}
        {syncStatus !== 'idle' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={getStatusColor()}>
                {syncStatus === 'uploading' ? '📤 Sto condividendo...' : '📥 Sto scaricando...'}
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
            <span className="text-gray-600">Ultima condivisione:</span>
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
            <span>🏪 Locale:</span>
            <span className="font-medium">{companyId || 'Non configurato'}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>👤 Il tuo nome:</span>
            <span className="font-medium">{currentUser?.name || 'Non inserito'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SyncManager