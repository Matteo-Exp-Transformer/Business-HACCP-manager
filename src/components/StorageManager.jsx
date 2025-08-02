import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { 
  HardDrive, 
  Archive, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  PieChart,
  Settings,
  Download,
  Upload
} from 'lucide-react'

function StorageManager({ 
  temperatures, 
  cleaning, 
  products, 
  refrigerators,
  setTemperatures,
  setCleaning,
  setProducts,
  setRefrigerators
}) {
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(false)
  const [storageStats, setStorageStats] = useState({
    temperatures: 0,
    cleaning: 0,
    products: 0,
    refrigerators: 0,
    totalSize: 0
  })

  // Calcola le statistiche dello storage
  useEffect(() => {
    const calculateStorage = () => {
      const tempSize = JSON.stringify(temperatures).length
      const cleaningSize = JSON.stringify(cleaning).length
      const productsSize = JSON.stringify(products).length
      const refrigeratorsSize = JSON.stringify(refrigerators).length
      
      setStorageStats({
        temperatures: temperatures.length,
        cleaning: cleaning.length,
        products: products.length,
        refrigerators: refrigerators.length,
        totalSize: tempSize + cleaningSize + productsSize + refrigeratorsSize
      })
    }

    calculateStorage()
  }, [temperatures, cleaning, products, refrigerators])

  // Sistema di archiviazione automatica
  const autoArchive = () => {
    if (!autoArchiveEnabled) return

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Archivia temperature vecchie
    const archivedTemps = temperatures.filter(temp => 
      new Date(temp.timestamp) < thirtyDaysAgo
    )
    const activeTemps = temperatures.filter(temp => 
      new Date(temp.timestamp) >= thirtyDaysAgo
    )

    // Archivia attività completate vecchie
    const archivedCleaning = cleaning.filter(task => 
      task.completed && new Date(task.createdAt) < thirtyDaysAgo
    )
    const activeCleaning = cleaning.filter(task => 
      !task.completed || new Date(task.createdAt) >= thirtyDaysAgo
    )

    // Salva dati archiviati
    const archivedData = {
      temperatures: archivedTemps,
      cleaning: archivedCleaning,
      archivedAt: new Date().toISOString()
    }

    const existingArchives = JSON.parse(localStorage.getItem('haccp-archives') || '[]')
    existingArchives.push(archivedData)
    localStorage.setItem('haccp-archives', JSON.stringify(existingArchives))

    // Aggiorna dati attivi
    setTemperatures(activeTemps)
    setCleaning(activeCleaning)

    alert(`Archiviazione completata! Rimossi ${archivedTemps.length} record temperature e ${archivedCleaning.length} attività completate.`)
  }

  // Esegui archiviazione automatica ogni giorno se abilitata
  useEffect(() => {
    if (!autoArchiveEnabled) return

    const interval = setInterval(() => {
      autoArchive()
    }, 24 * 60 * 60 * 1000) // 24 ore

    return () => clearInterval(interval)
  }, [autoArchiveEnabled])

  const getStoragePercentage = (size) => {
    const maxSize = 5 * 1024 * 1024 // 5MB limite teorico
    return Math.min((size / maxSize) * 100, 100)
  }

  const getStorageColor = (percentage) => {
    if (percentage < 50) return 'text-green-600'
    if (percentage < 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Gestione Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grafico a torta dello storage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Utilizzo Storage</h3>
              <div className="relative w-48 h-48 mx-auto">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Temperature */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="8"
                    strokeDasharray={`${(storageStats.temperatures / (storageStats.temperatures + storageStats.cleaning + storageStats.products + storageStats.refrigerators)) * 251.2} 251.2`}
                    strokeDashoffset="0"
                  />
                  {/* Cleaning */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeDasharray={`${(storageStats.cleaning / (storageStats.temperatures + storageStats.cleaning + storageStats.products + storageStats.refrigerators)) * 251.2} 251.2`}
                    strokeDashoffset={`-${(storageStats.temperatures / (storageStats.temperatures + storageStats.cleaning + storageStats.products + storageStats.refrigerators)) * 251.2}`}
                  />
                  {/* Products */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="8"
                    strokeDasharray={`${(storageStats.products / (storageStats.temperatures + storageStats.cleaning + storageStats.products + storageStats.refrigerators)) * 251.2} 251.2`}
                    strokeDashoffset={`-${((storageStats.temperatures + storageStats.cleaning) / (storageStats.temperatures + storageStats.cleaning + storageStats.products + storageStats.refrigerators)) * 251.2}`}
                  />
                  {/* Refrigerators */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="8"
                    strokeDasharray={`${(storageStats.refrigerators / (storageStats.temperatures + storageStats.cleaning + storageStats.products + storageStats.refrigerators)) * 251.2} 251.2`}
                    strokeDashoffset={`-${((storageStats.temperatures + storageStats.cleaning + storageStats.products) / (storageStats.temperatures + storageStats.cleaning + storageStats.products + storageStats.refrigerators)) * 251.2}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getStorageColor(getStoragePercentage(storageStats.totalSize))}`}>
                      {formatBytes(storageStats.totalSize)}
                    </div>
                    <div className="text-sm text-gray-600">Utilizzato</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Dettaglio Dati</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Temperature</span>
                  </div>
                  <span className="text-sm text-gray-600">{storageStats.temperatures} record</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Attività</span>
                  </div>
                  <span className="text-sm text-gray-600">{storageStats.cleaning} record</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Prodotti</span>
                  </div>
                  <span className="text-sm text-gray-600">{storageStats.products} record</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium">Frigoriferi</span>
                  </div>
                  <span className="text-sm text-gray-600">{storageStats.refrigerators} record</span>
                </div>
              </div>
            </div>
          </div>

          {/* Archiviazione Automatica */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Archiviazione Automatica
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Rimuove automaticamente i dati vecchi per mantenere l'app veloce
                </p>
              </div>
              <Button
                variant={autoArchiveEnabled ? "default" : "outline"}
                onClick={() => setAutoArchiveEnabled(!autoArchiveEnabled)}
                className="flex items-center gap-2"
              >
                {autoArchiveEnabled ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Abilitata
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4" />
                    Disabilitata
                  </>
                )}
              </Button>
            </div>

            {autoArchiveEnabled && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Cosa fa l'archiviazione automatica:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Rimuove le registrazioni temperature più vecchie di 30 giorni</li>
                  <li>• Archivia le attività completate più vecchie di 30 giorni</li>
                  <li>• Mantiene tutti i prodotti e frigoriferi attivi</li>
                  <li>• Crea un backup dei dati rimossi</li>
                  <li>• Si esegue automaticamente ogni 24 ore</li>
                </ul>
                <div className="mt-3">
                  <Button
                    onClick={autoArchive}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Archive className="h-4 w-4" />
                    Archivia Ora
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Azioni Manuali */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Azioni Manuali</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  const data = {
                    temperatures,
                    cleaning,
                    products,
                    refrigerators,
                    exportedAt: new Date().toISOString()
                  }
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `haccp-backup-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                }}
              >
                <Download className="h-4 w-4" />
                Esporta Tutti i Dati
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  if (confirm('Sei sicuro di voler eliminare tutti i dati? Questa azione non può essere annullata.')) {
                    setTemperatures([])
                    setCleaning([])
                    setProducts([])
                    setRefrigerators([])
                    alert('Tutti i dati sono stati eliminati.')
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
                Elimina Tutti i Dati
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StorageManager 