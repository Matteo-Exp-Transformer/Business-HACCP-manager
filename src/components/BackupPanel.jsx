/**
 * BackupPanel - Gestione backup, export e import dati HACCP
 * 
 * Questo componente gestisce:
 * 1. Export JSON completo di tutti i dati
 * 2. Import JSON con validazione schema
 * 3. Backup automatico settimanale
 * 4. Gestione versioni e compatibilità
 * 
 * @version 1.0
 * @critical Sicurezza - Backup e ripristino dati
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { 
  Download, 
  Upload, 
  HardDrive, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  FileText,
  Database,
  RefreshCw,
  Settings
} from 'lucide-react'

// Chiavi localStorage da includere nel backup
const BACKUP_KEYS = [
  'haccp-temperatures',
  'haccp-refrigerators', 
  'haccp-staff',
  'haccp-cleaning',
  'haccp-products',
  'haccp-departments',
  'haccp-users',
  'haccp-actions',
  'haccp-roles',
  'haccp-suppliers',
  'haccp-onboarding',
  'haccp-presets',
  'haccp-dev-mode'
]

function BackupPanel({ currentUser, isAdmin = false }) {
  const [backupSettings, setBackupSettings] = useState({
    autoBackupEnabled: false,
    autoBackupFrequency: 'weekly', // weekly, monthly
    lastBackupDate: null,
    nextBackupDate: null
  })
  
  const [backupHistory, setBackupHistory] = useState([])
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Carica impostazioni backup
  useEffect(() => {
    const saved = localStorage.getItem('haccp-backup-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setBackupSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Errore nel caricamento impostazioni backup:', error)
      }
    }

    // Carica cronologia backup
    const history = localStorage.getItem('haccp-backup-history')
    if (history) {
      try {
        setBackupHistory(JSON.parse(history))
      } catch (error) {
        console.error('Errore nel caricamento cronologia backup:', error)
      }
    }
  }, [])

  // Salva impostazioni backup
  useEffect(() => {
    localStorage.setItem('haccp-backup-settings', JSON.stringify(backupSettings))
  }, [backupSettings])

  // Calcola prossimo backup
  useEffect(() => {
    if (backupSettings.autoBackupEnabled && backupSettings.lastBackupDate) {
      const lastBackup = new Date(backupSettings.lastBackupDate)
      const nextBackup = new Date(lastBackup)
      
      if (backupSettings.autoBackupFrequency === 'weekly') {
        nextBackup.setDate(nextBackup.getDate() + 7)
      } else if (backupSettings.autoBackupFrequency === 'monthly') {
        nextBackup.setMonth(nextBackup.getMonth() + 1)
      }
      
      setBackupSettings(prev => ({ ...prev, nextBackupDate: nextBackup.toISOString() }))
    }
  }, [backupSettings.autoBackupEnabled, backupSettings.lastBackupDate, backupSettings.autoBackupFrequency])

  // Export completo dei dati
  const exportAllData = async () => {
    setIsExporting(true)
    
    try {
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        exportedBy: currentUser?.name || 'unknown',
        data: {}
      }

      // Esporta tutti i dati HACCP
      for (const key of BACKUP_KEYS) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            exportData.data[key] = JSON.parse(data)
          } catch (error) {
            console.warn(`Errore nel parsing ${key}:`, error)
            exportData.data[key] = data // Salva come stringa se non è JSON valido
          }
        }
      }

      // Crea file di download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `haccp-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Registra backup nella cronologia
      const backupRecord = {
        id: Date.now().toString(),
        type: 'manual',
        timestamp: new Date().toISOString(),
        user: currentUser?.name || 'unknown',
        size: blob.size,
        success: true
      }
      
      setBackupHistory(prev => [backupRecord, ...prev.slice(0, 9)]) // Mantieni solo ultimi 10
      localStorage.setItem('haccp-backup-history', JSON.stringify([backupRecord, ...backupHistory.slice(0, 9)]))

      alert('✅ Export completato con successo!\n\n📁 File scaricato nella cartella Download\n💾 Tutti i dati HACCP sono stati esportati')

    } catch (error) {
      console.error('Errore durante export:', error)
      alert('❌ Errore durante l\'export dei dati\n\nControlla la console per maggiori dettagli')
    } finally {
      setIsExporting(false)
    }
  }

  // Import dati
  const importData = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsImporting(true)
    
    try {
      const text = await file.text()
      const importData = JSON.parse(text)

      // Validazione schema base
      if (!importData.version || !importData.data || !importData.timestamp) {
        throw new Error('Formato file non valido. Il file deve contenere version, data e timestamp.')
      }

      // Conferma import
      const dataKeys = Object.keys(importData.data)
      const confirmed = confirm(
        `⚠️ ATTENZIONE: Stai per importare dati HACCP!\n\n` +
        `📊 Dati trovati: ${dataKeys.length} chiavi\n` +
        `📅 Data export: ${new Date(importData.timestamp).toLocaleString('it-IT')}\n` +
        `👤 Esportato da: ${importData.exportedBy || 'sconosciuto'}\n\n` +
        `⚠️ Questa operazione sovrascriverà i dati esistenti!\n\n` +
        `Procedere con l'import?`
      )

      if (!confirmed) {
        setIsImporting(false)
        return
      }

      // Backup dei dati esistenti prima dell'import
      const existingData = {}
      for (const key of BACKUP_KEYS) {
        const data = localStorage.getItem(key)
        if (data) {
          existingData[key] = data
        }
      }

      // Salva backup pre-import
      const preImportBackup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        type: 'pre-import-backup',
        data: existingData
      }
      localStorage.setItem('haccp-pre-import-backup', JSON.stringify(preImportBackup))

      // Importa i nuovi dati
      let importedCount = 0
      for (const [key, value] of Object.entries(importData.data)) {
        if (BACKUP_KEYS.includes(key)) {
          try {
            if (typeof value === 'string') {
              localStorage.setItem(key, value)
            } else {
              localStorage.setItem(key, JSON.stringify(value))
            }
            importedCount++
          } catch (error) {
            console.warn(`Errore nell'import di ${key}:`, error)
          }
        }
      }

      // Registra import nella cronologia
      const importRecord = {
        id: Date.now().toString(),
        type: 'import',
        timestamp: new Date().toISOString(),
        user: currentUser?.name || 'unknown',
        importedKeys: importedCount,
        success: true,
        sourceFile: file.name
      }
      
      setBackupHistory(prev => [importRecord, ...prev.slice(0, 9)])
      localStorage.setItem('haccp-backup-history', JSON.stringify([importRecord, ...backupHistory.slice(0, 9)]))

      alert(
        `✅ Import completato con successo!\n\n` +
        `📊 Chiavi importate: ${importedCount}/${Object.keys(importData.data).length}\n` +
        `💾 Backup pre-import salvato come 'haccp-pre-import-backup'\n\n` +
        `🔄 Ricarica la pagina per applicare le modifiche`
      )

      // Ricarica la pagina per applicare le modifiche
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error) {
      console.error('Errore durante import:', error)
      alert(`❌ Errore durante l'import:\n\n${error.message}\n\nControlla che il file sia un backup HACCP valido.`)
    } finally {
      setIsImporting(false)
      // Reset input file
      event.target.value = ''
    }
  }

  // Backup automatico
  const performAutoBackup = async () => {
    try {
      await exportAllData()
      
      setBackupSettings(prev => ({
        ...prev,
        lastBackupDate: new Date().toISOString()
      }))

      // Registra backup automatico
      const autoBackupRecord = {
        id: Date.now().toString(),
        type: 'auto',
        timestamp: new Date().toISOString(),
        user: 'Sistema',
        success: true
      }
      
      setBackupHistory(prev => [autoBackupRecord, ...prev.slice(0, 9)])
      localStorage.setItem('haccp-backup-history', JSON.stringify([autoBackupRecord, ...backupHistory.slice(0, 9)]))

    } catch (error) {
      console.error('Errore backup automatico:', error)
    }
  }

  // Controlla se è tempo di fare backup automatico
  useEffect(() => {
    if (backupSettings.autoBackupEnabled && backupSettings.nextBackupDate) {
      const now = new Date()
      const nextBackup = new Date(backupSettings.nextBackupDate)
      
      if (now >= nextBackup) {
        performAutoBackup()
      }
    }
  }, [backupSettings.autoBackupEnabled, backupSettings.nextBackupDate])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Backup e Export Dati</h2>
        <p className="text-gray-600">
          💾 Gestisci il backup e l'export dei dati HACCP per garantire la sicurezza e la tracciabilità
        </p>
      </div>

      {/* Statistiche backup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {backupHistory.filter(b => b.success).length}
            </div>
            <div className="text-sm text-gray-600">Backup Completati</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {backupHistory.filter(b => b.type === 'auto').length}
            </div>
            <div className="text-sm text-gray-600">Backup Automatici</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {backupHistory.filter(b => b.type === 'import').length}
            </div>
            <div className="text-sm text-gray-600">Import Completati</div>
          </CardContent>
        </Card>
      </div>

      {/* Impostazioni backup automatico */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Backup Automatico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Abilita Backup Automatico</h4>
                  <p className="text-sm text-gray-600">
                    Crea automaticamente backup periodici per garantire la sicurezza dei dati
                  </p>
                </div>
                <Button
                  variant={backupSettings.autoBackupEnabled ? "default" : "outline"}
                  onClick={() => setBackupSettings(prev => ({ 
                    ...prev, 
                    autoBackupEnabled: !prev.autoBackupEnabled 
                  }))}
                  className="flex items-center gap-2"
                >
                  {backupSettings.autoBackupEnabled ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Abilitato
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      Disabilitato
                    </>
                  )}
                </Button>
              </div>

              {backupSettings.autoBackupEnabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Frequenza Backup</h4>
                      <p className="text-sm text-gray-600">Quanto spesso creare backup automatici</p>
                    </div>
                    <select
                      value={backupSettings.autoBackupFrequency}
                      onChange={(e) => setBackupSettings(prev => ({ 
                        ...prev, 
                        autoBackupFrequency: e.target.value 
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="weekly">Settimanale</option>
                      <option value="monthly">Mensile</option>
                    </select>
                  </div>

                  {backupSettings.lastBackupDate && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Info className="h-4 w-4" />
                        <span className="font-medium">Ultimo backup:</span>
                        <span>{new Date(backupSettings.lastBackupDate).toLocaleString('it-IT')}</span>
                      </div>
                      {backupSettings.nextBackupDate && (
                        <div className="text-blue-700 text-sm mt-1">
                          Prossimo backup: {new Date(backupSettings.nextBackupDate).toLocaleString('it-IT')}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export dati */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Dati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              📊 Esporta tutti i dati HACCP in formato JSON per backup, migrazione o condivisione.
              Include temperature, pulizie, inventario, staff e tutte le configurazioni.
            </p>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={exportAllData}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isExporting ? 'Esportando...' : 'Export Completo JSON'}
              </Button>
              
              <span className="text-sm text-gray-500">
                {BACKUP_KEYS.length} chiavi dati incluse
              </span>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Dati inclusi nell'export:</span>
              </div>
              <div className="text-green-700 text-sm mt-2 grid grid-cols-2 gap-2">
                {BACKUP_KEYS.map(key => (
                  <div key={key} className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    {key.replace('haccp-', '')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import dati */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Dati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              📥 Importa dati HACCP da un file di backup JSON. 
              ⚠️ Questa operazione sovrascriverà i dati esistenti!
            </p>
            
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file">
                <Button 
                  as="span"
                  disabled={isImporting}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {isImporting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isImporting ? 'Importando...' : 'Seleziona File JSON'}
                </Button>
              </label>
              
              {isImporting && (
                <span className="text-sm text-gray-500">
                  Import in corso...
                </span>
              )}
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Attenzione Import:</span>
              </div>
              <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                <li>• I dati esistenti verranno sovrascritti</li>
                <li>• Verrà creato un backup automatico pre-import</li>
                <li>• Solo file JSON HACCP validi sono accettati</li>
                <li>• La pagina verrà ricaricata dopo l'import</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cronologia backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cronologia Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          {backupHistory.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Nessun backup registrato</p>
              <p className="text-sm">I backup appariranno qui dopo aver eseguito export o import</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backupHistory.map(backup => (
                <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      backup.type === 'auto' ? 'bg-blue-100 text-blue-600' :
                      backup.type === 'import' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {backup.type === 'auto' ? <RefreshCw className="h-4 w-4" /> :
                       backup.type === 'import' ? <Upload className="h-4 w-4" /> :
                       <Download className="h-4 w-4" />}
                    </div>
                    
                    <div>
                      <div className="font-medium">
                        {backup.type === 'auto' ? 'Backup Automatico' :
                         backup.type === 'import' ? 'Import Dati' :
                         'Export Manuale'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(backup.timestamp).toLocaleString('it-IT')} • {backup.user}
                      </div>
                      {backup.sourceFile && (
                        <div className="text-xs text-gray-500">
                          File: {backup.sourceFile}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {backup.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BackupPanel
