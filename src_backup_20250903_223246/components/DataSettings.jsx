import React, { useState, useEffect, Fragment } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { 
  Smartphone, 
  Image, 
  HardDrive, 
  Wifi, 
  Settings,
  ToggleLeft,
  ToggleRight,
  Info,
  Camera,
  FileText,
  Users,
  Package,
  Thermometer,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Truck,
  Download
} from 'lucide-react'
import { createCloudSimulator } from '../utils/cloudSimulator'
import HaccpManual from './HaccpManual'
import Suppliers from './Suppliers'
import BackupPanel from './BackupPanel'

function DataSettings({ 
  currentUser, 
  isAdmin = false,
  onSettingsChange 
}) {
  const [showHaccpManual, setShowHaccpManual] = useState(false)
  const [settings, setSettings] = useState({
    // Cosa salvare sul telefono
    keepPhotosLocal: false,        // False = solo online
    keepDocsLocal: true,           // True = anche sul telefono
    keepDataLocal: true,           // True = backup sul telefono
    
    // Cosa condividere automaticamente  
    autoShareTemperatures: true,
    autoShareInventory: true,
    autoShareCleaning: true,
    autoShareStaff: isAdmin,       // Solo admin condivide staff
    
    // Quanto tenere sul telefono
    keepDaysLocal: 7,              // Quanti giorni di dati
    maxPhotosLocal: isAdmin ? 100 : 20  // Quante foto max
  })

  const [storageInfo, setStorageInfo] = useState({
    usedSpace: '45 MB',
    availableSpace: '2.1 GB',
    photosCount: 23,
    docsCount: 156
  })

  const [cloudSimulator] = useState(() => createCloudSimulator('demo-pizzeria'))

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('haccp-data-settings')
    if (saved) {
      setSettings({ ...settings, ...JSON.parse(saved) })
    }

    // Load real storage stats from simulator
    const stats = cloudSimulator.getStorageStats()
    setStorageInfo({
      usedSpace: stats.localSpace,
      availableSpace: '2.1 GB', // Simulated phone space
      photosCount: stats.photosCount,
      docsCount: stats.documentsCount
    })
  }, [cloudSimulator])

  // Save settings when changed
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('haccp-data-settings', JSON.stringify(newSettings))
    onSettingsChange?.(newSettings)
  }

  const SettingToggle = ({ 
    title, 
    description, 
    value, 
    onChange, 
    icon: Icon,
    adminOnly = false 
  }) => {
    if (adminOnly && !isAdmin) return null

    return (
      <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
            {adminOnly && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                <Settings className="h-3 w-3" />
                Solo Amministratore
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => onChange(!value)}
          className="p-1"
        >
          {value ? (
            <ToggleRight className="h-6 w-6 text-green-600" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-gray-400" />
          )}
        </Button>
      </div>
    )
  }

  const StorageOption = ({ title, description, current, options, onChange, icon: Icon }) => (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-start gap-3 mb-3">
        <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={current === option.value ? "default" : "outline"}
            onClick={() => onChange(option.value)}
            className="text-sm py-2"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )

  return (
    <Fragment>
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📱 Gestione Dati</h1>
        <p className="text-gray-600">Decidi cosa tenere sul tuo telefono e cosa condividere</p>
      </div>

      {/* Storage Overview */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Spazio sul Tuo Telefono
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{storageInfo.usedSpace}</p>
              <p className="text-xs text-gray-600">Usato dall'app</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{storageInfo.availableSpace}</p>
              <p className="text-xs text-gray-600">Spazio libero</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{storageInfo.photosCount}</p>
              <p className="text-xs text-gray-600">Foto salvate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{storageInfo.docsCount}</p>
              <p className="text-xs text-gray-600">Documenti</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo & Files Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Foto e Documenti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            icon={Camera}
            title="Salva Foto sul Telefono"
            description="Le foto delle etichette rimangono sul tuo telefono anche senza internet. Occupa più spazio ma è più veloce."
            value={settings.keepPhotosLocal}
            onChange={(value) => updateSetting('keepPhotosLocal', value)}
          />
          
          <SettingToggle
            icon={FileText}
            title="Salva Documenti sul Telefono"
            description="Tieni una copia di ricette, procedure e documenti sul telefono per consultarli anche offline."
            value={settings.keepDocsLocal}
            onChange={(value) => updateSetting('keepDocsLocal', value)}
          />

          <StorageOption
            icon={HardDrive}
            title="Quante Foto Tenere"
            description="Numero massimo di foto da tenere salvate sul telefono"
            current={settings.maxPhotosLocal}
            onChange={(value) => updateSetting('maxPhotosLocal', value)}
            options={[
              { value: 10, label: '10 foto' },
              { value: 50, label: '50 foto' },
              { value: 100, label: '100 foto' }
            ]}
          />
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Condivisione Automatica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Cosa significa:</strong> Se attivi queste opzioni, le modifiche che fai verranno condivise automaticamente con i colleghi appena hai internet.
            </p>
          </div>

          <SettingToggle
            icon={Thermometer}
            title="Condividi Temperature Automaticamente"
            description="Le temperature dei frigoriferi vengono condivise subito con tutti. Importante per la sicurezza alimentare."
            value={settings.autoShareTemperatures}
            onChange={(value) => updateSetting('autoShareTemperatures', value)}
          />

          <SettingToggle
            icon={Package}
            title="Condividi Inventario Automaticamente"
            description="Quando aggiungi o modifichi prodotti, tutti vedono subito le modifiche."
            value={settings.autoShareInventory}
            onChange={(value) => updateSetting('autoShareInventory', value)}
          />

          <SettingToggle
            icon={CheckCircle}
            title="Condividi Pulizie Automaticamente"
            description="Le attività di pulizia completate vengono condivise subito con il team."
            value={settings.autoShareCleaning}
            onChange={(value) => updateSetting('autoShareCleaning', value)}
          />

          <SettingToggle
            icon={Users}
            title="Condividi Gestione Staff"
            description="Modifiche a dipendenti, ruoli e permessi vengono condivise automaticamente."
            value={settings.autoShareStaff}
            onChange={(value) => updateSetting('autoShareStaff', value)}
            adminOnly={true}
          />
        </CardContent>
      </Card>

      {/* Local Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Quanto Tenere sul Telefono
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StorageOption
            icon={HardDrive}
            title="Giorni di Dati da Tenere"
            description="Quanti giorni di temperature, pulizie e inventario tenere salvati sul telefono"
            current={settings.keepDaysLocal}
            onChange={(value) => updateSetting('keepDaysLocal', value)}
            options={[
              { value: 3, label: '3 giorni' },
              { value: 7, label: '1 settimana' },
              { value: 30, label: '1 mese' }
            ]}
          />

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Perché è importante?</p>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                  <li>• 📱 <strong>Meno giorni</strong> = telefono più veloce e più spazio libero</li>
                  <li>• 📊 <strong>Più giorni</strong> = puoi vedere dati anche senza internet</li>
                  <li>• ☁️ <strong>Tutti i dati</strong> rimangono sempre salvati online</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Azioni Rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={async () => {
                try {
                  const result = await cloudSimulator.cleanupCloudStorage()
                  if (result.success) {
                    alert(`✅ ${result.message}\n💾 Spazio liberato: ${result.spaceSaved}`)
                    // Update storage info
                    const newStats = cloudSimulator.getStorageStats()
                    setStorageInfo(prev => ({
                      ...prev,
                      usedSpace: newStats.localSpace
                    }))
                  }
                } catch (error) {
                  alert('❌ Errore durante la pulizia dello spazio')
                }
              }}
            >
              <HardDrive className="h-4 w-4" />
              Libera Spazio
            </Button>
            
            <Button 
              variant="outline"
              className="flex items-center gap-2" 
              onClick={async () => {
                try {
                  alert('🔄 Sto sincronizzando tutto...')
                  // Simulate sync delay
                  await new Promise(resolve => setTimeout(resolve, 1500))
                  
                  const result = await cloudSimulator.getRecentChanges()
                  if (result.success) {
                    alert(`✅ Sincronizzazione completata!\n👥 Trovate ${result.changes?.length || 0} modifiche dai colleghi`)
                  }
                } catch (error) {
                  alert('❌ Errore durante la sincronizzazione')
                }
              }}
            >
              <Wifi className="h-4 w-4" />
              Sincronizza Ora
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup e Export Dati */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Backup e Export Dati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              💾 Gestisci il backup e l'export dei dati HACCP per garantire la sicurezza e la tracciabilità.
              Esporta tutti i dati in formato JSON o importa da backup esistenti.
            </p>
            
            <BackupPanel currentUser={currentUser} isAdmin={isAdmin} />
          </div>
        </CardContent>
      </Card>

      {/* Gestione Fornitori */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Gestione Fornitori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              📋 Gestisci i fornitori per garantire la tracciabilità HACCP e la sicurezza alimentare.
              Mantieni aggiornate le informazioni sui fornitori per la compliance normativa.
            </p>
            
            <Suppliers currentUser={currentUser} />
          </div>
        </CardContent>
      </Card>

      {/* Manuale HACCP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Manuale HACCP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Consulta la guida completa per normative HACCP e procedure operative.
              Questo manuale ti aiuterà a comprendere i requisiti e implementare correttamente le procedure.
            </p>
            
            <Button 
              variant="outline"
              className="flex items-center gap-2 w-full"
              onClick={() => setShowHaccpManual(true)}
            >
              <BookOpen className="h-4 w-4" />
              Apri Manuale HACCP
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Modal Manuale HACCP */}
    {showHaccpManual && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Manuale HACCP</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowHaccpManual(false)}
            >
              ✕ Chiudi
            </Button>
          </div>
          <div className="overflow-y-auto h-full p-4">
            <HaccpManual />
          </div>
        </div>
      </div>
    )}
      </Fragment>
  )
}

export default DataSettings