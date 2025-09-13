import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import CollapsibleCard from './CollapsibleCard'
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
import { useModals } from '../hooks/useModals'
import AlertModal from './ui/AlertModal'
import ConfirmModal from './ui/ConfirmModal'
import PromptModal from './ui/PromptModal'

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
  
  // Initialize modals
  const {
    alertModal, confirmModal, promptModal,
    closeAlert, closeConfirm, closePrompt,
    alertSuccess, alertError, alertWarning,
    confirmDelete, confirmAction
  } = useModals()

  // Calcola le statistiche dello storage
  useEffect(() => {
    const calculateStorage = () => {
      // Controlli di sicurezza per evitare errori se le props sono undefined
      const tempArray = temperatures || []
      const cleaningArray = cleaning || []
      const productsArray = products || []
      const refrigeratorsArray = refrigerators || []
      
      const tempSize = JSON.stringify(tempArray).length
      const cleaningSize = JSON.stringify(cleaningArray).length
      const productsSize = JSON.stringify(productsArray).length
      const refrigeratorsSize = JSON.stringify(refrigeratorsArray).length
      
      setStorageStats({
        temperatures: tempArray.length,
        cleaning: cleaningArray.length,
        products: productsArray.length,
        refrigerators: refrigeratorsArray.length,
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

    // Controlli di sicurezza per evitare errori se le props sono undefined
    const tempArray = temperatures || []
    const cleaningArray = cleaning || []

    // Archivia temperature vecchie
    const archivedTemps = tempArray.filter(temp => 
      new Date(temp.timestamp) < thirtyDaysAgo
    )
    const activeTemps = tempArray.filter(temp => 
      new Date(temp.timestamp) >= thirtyDaysAgo
    )

    // Archivia attività completate vecchie
    const archivedCleaning = cleaningArray.filter(task => 
      task.completed && new Date(task.createdAt) < thirtyDaysAgo
    )
    const activeCleaning = cleaningArray.filter(task => 
      !task.completed || new Date(task.createdAt) >= thirtyDaysAgo
    )

    // Controlla etichette prodotti scaduti OGGI (DISABILITATO - causa alert persistenti)
    /*
    const productLabels = JSON.parse(localStorage.getItem('haccp-product-labels') || '[]')
    const products = JSON.parse(localStorage.getItem('haccp-products') || '[]')
    
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Inizio giornata
    
    const expiredTodayLabels = []
    const activeLabels = []
    
    productLabels.forEach(label => {
      // Controlla se il prodotto associato è scaduto OGGI
      const associatedProduct = products.find(p => p.name === label.productName)
      if (associatedProduct) {
        const productExpiry = new Date(associatedProduct.expiryDate)
        productExpiry.setHours(0, 0, 0, 0) // Inizio giornata per confronto
        
        if (productExpiry.getTime() === today.getTime()) {
          // Prodotto scaduto oggi - chiedi conferma per rimuovere etichetta
          expiredTodayLabels.push({
            ...label,
            associatedProduct
          })
        } else {
          activeLabels.push(label)
        }
      } else {
        // Se non c'è un prodotto associato, mantieni l'etichetta
        activeLabels.push(label)
      }
    })
    
    let expiredLabels = []
    // Se ci sono etichette di prodotti scaduti oggi, chiedi conferma
    if (expiredTodayLabels.length > 0) {
      const shouldRemoveLabels = confirm(`🗂️ PULIZIA ETICHETTE\n\n📅 Oggi sono scaduti ${expiredTodayLabels.length} prodotti con etichette salvate:\n\n${expiredTodayLabels.map(l => `• ${l.productName}`).join('\n')}\n\n🗑️ Vuoi rimuovere le etichette (con foto) per liberare spazio?\n\n✅ OK = Rimuovi etichette\n❌ Annulla = Mantieni tutto`)
      
      if (shouldRemoveLabels) {
        expiredLabels = expiredTodayLabels
        // Le etichette confermate per rimozione non vanno in activeLabels
      } else {
        // Se l'utente non conferma, mantieni le etichette
        activeLabels.push(...expiredTodayLabels)
      }
    }
    */

    // Semplificato - nessun controllo scadenze per ora
    let expiredLabels = []

    // Salva dati archiviati
    const archivedData = {
      temperatures: archivedTemps,
      cleaning: archivedCleaning,
      expiredLabels: expiredLabels,
      archivedAt: new Date().toISOString()
    }

    const existingArchives = JSON.parse(localStorage.getItem('haccp-archives') || '[]')
    existingArchives.push(archivedData)
    localStorage.setItem('haccp-archives', JSON.stringify(existingArchives))

    // Aggiorna dati attivi
    setTemperatures(activeTemps)
    setCleaning(activeCleaning)
    
    // Etichette: nessuna modifica per ora (controllo scadenze disabilitato)
    // if (expiredLabels.length > 0) {
    //   localStorage.setItem('haccp-product-labels', JSON.stringify(activeLabels))
    // }

    const totalArchived = archivedTemps.length + archivedCleaning.length + expiredLabels.length
    
    if (totalArchived > 0) {
      alertSuccess(`🗂️ Archiviazione completata!\n\n📊 Elementi archiviati:\n• ${archivedTemps.length} registrazioni temperature\n• ${archivedCleaning.length} attività completate\n• ${expiredLabels.length} etichette prodotti scaduti\n\n💾 Controllo scadenze temporaneamente disabilitato`)
    } else {
      alertSuccess(`✅ Archiviazione completata!\n\n📊 Elementi archiviati:\n• ${archivedTemps.length} registrazioni temperature\n• ${archivedCleaning.length} attività completate\n• Controllo etichette scadute: disabilitato`)
    }
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
      <CollapsibleCard
        title="Gestione Storage"
        subtitle="Monitoraggio spazio e archiviazione dati"
        icon={HardDrive}
        iconColor="text-gray-600"
        iconBgColor="bg-gray-100"
        count={storageStats.temperatures + storageStats.cleaning + storageStats.products + storageStats.refrigerators}
        testId="storage-manager"
        defaultExpanded={true}
      >
        <div className="space-y-6">
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
                  <li>• Chiede conferma per rimuovere etichette di prodotti scaduti OGGI</li>
                  <li>• Mantiene tutti i prodotti e frigoriferi attivi</li>
                  <li>• Crea un backup completo dei dati rimossi</li>
                  <li>• Libera spazio solo con conferma utente per le foto</li>
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
                  confirmDelete(
                    'Sei sicuro di voler eliminare tutti i dati? Questa azione non può essere annullata.',
                    () => {
                      setTemperatures([])
                      setCleaning([])
                      setProducts([])
                      setRefrigerators([])
                      alertSuccess('Tutti i dati sono stati eliminati.')
                    }
                  )
                }}
              >
                <Trash2 className="h-4 w-4" />
                Elimina Tutti i Dati
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* Modal Components */}
      <AlertModal 
        isOpen={alertModal.isOpen} 
        onClose={closeAlert} 
        title={alertModal.title} 
        message={alertModal.message} 
        type={alertModal.type} 
        confirmText={alertModal.confirmText} 
        onConfirm={alertModal.onConfirm} 
      />
      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        onClose={closeConfirm} 
        title={confirmModal.title} 
        message={confirmModal.message} 
        type={confirmModal.type} 
        confirmText={confirmModal.confirmText} 
        cancelText={confirmModal.cancelText} 
        onConfirm={confirmModal.onConfirm} 
        onCancel={confirmModal.onCancel} 
      />
      <PromptModal 
        isOpen={promptModal.isOpen} 
        onClose={closePrompt} 
        title={promptModal.title} 
        message={promptModal.message} 
        placeholder={promptModal.placeholder} 
        defaultValue={promptModal.defaultValue} 
        type={promptModal.type} 
        confirmText={promptModal.confirmText} 
        cancelText={promptModal.cancelText} 
        validation={promptModal.validation} 
        onConfirm={promptModal.onConfirm} 
        onCancel={promptModal.onCancel} 
      />
    </div>
  )
}

export default StorageManager 