import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { 
  QrCode, 
  Camera, 
  Package, 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Calendar, 
  AlertTriangle,
  Clock,
  FileImage,
  Scan,
  Tag,
  ImageIcon,
  CheckCircle,
  X,
  Eye,
  Edit,
  History,
  FolderPlus,
  Folder,
  Check,
  Square,
  CheckSquare,
  Move,
  Filter,
  Settings
} from 'lucide-react'

function ProductLabels({ productLabels = [], setProductLabels, products = [], currentUser }) {
  const [activeSection, setActiveSection] = useState('scanner')
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [scannedCode, setScannedCode] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [showLabelPreview, setShowLabelPreview] = useState(false)
  const [previewLabel, setPreviewLabel] = useState(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [showCleanupModal, setShowCleanupModal] = useState(false)
  const [expiredItems, setExpiredItems] = useState([])
  
  // Stati per selezione multipla etichette
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedLabels, setSelectedLabels] = useState([])
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [labelGroups, setLabelGroups] = useState([])
  const [activeGroup, setActiveGroup] = useState(null)
  
  // Stati per selezione foto
  const [isPhotoSelectionMode, setIsPhotoSelectionMode] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [photoSearchTerm, setPhotoSearchTerm] = useState('')
  const [photoFilterDate, setPhotoFilterDate] = useState('')
  const [photoFilterExpiry, setPhotoFilterExpiry] = useState('')
  
  // Stati per ottimizzazione performance grandi dataset (500+ foto)
  const [currentPhotoPage, setCurrentPhotoPage] = useState(1)
  const [photosPerPage, setPhotosPerPage] = useState(20)
  const [loadedImages, setLoadedImages] = useState(new Set())
  const [imageQuality, setImageQuality] = useState('medium') // low, medium, high

  // Stati per gestione etichette nei gruppi
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false)
  const [availableLabelsForGroup, setAvailableLabelsForGroup] = useState([])
  const [selectedLabelsToAdd, setSelectedLabelsToAdd] = useState([])
  const [addToGroupSearchTerm, setAddToGroupSearchTerm] = useState('')
  const [showEditGroupModal, setShowEditGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [editGroupName, setEditGroupName] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [selectedLabelForView, setSelectedLabelForView] = useState(null)
  const [showLabelViewModal, setShowLabelViewModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [groupSearchTerm, setGroupSearchTerm] = useState('')
  const [showMoveToGroupModal, setShowMoveToGroupModal] = useState(false)
  const [globalSearchTerm, setGlobalSearchTerm] = useState('')

  // Form state per nuova etichetta
  const [newLabel, setNewLabel] = useState({
    productName: '',
    barcode: '',
    expiryDate: '',
    lotNumber: '',
    category: '',
    location: '',
    notes: '',
    photo: null,
    allergens: []
  })

  // Check scadenze al caricamento e carica gruppi
  useEffect(() => {
    checkExpiredItems()
    loadLabelGroups()
  }, [productLabels])

  // Carica gruppi etichette da localStorage
  const loadLabelGroups = () => {
    const groups = localStorage.getItem('haccp-label-groups')
    if (groups) {
      setLabelGroups(JSON.parse(groups))
    }
  }

  // Salva gruppi etichette in localStorage
  const saveLabelGroups = (groups) => {
    setLabelGroups(groups)
    localStorage.setItem('haccp-label-groups', JSON.stringify(groups))
  }

  // Funzioni per selezione multipla etichette
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedLabels([])
  }

  const toggleLabelSelection = (labelId) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    )
  }

  const selectAllLabels = () => {
    const allLabelIds = filteredLabels.map(label => label.id)
    setSelectedLabels(allLabelIds)
  }

  const deselectAllLabels = () => {
    setSelectedLabels([])
  }

  // Crea gruppo da etichette selezionate
  const createGroupFromSelected = () => {
    if (selectedLabels.length === 0) {
      alert('Seleziona almeno una etichetta')
      return
    }
    setShowCreateGroupModal(true)
  }

  // Salva nuovo gruppo
  const saveNewGroup = () => {
    if (!newGroupName.trim()) {
      alert('Inserisci un nome per il gruppo')
      return
    }

    const selectedLabelData = productLabels.filter(label => selectedLabels.includes(label.id))
    const latestDate = selectedLabelData.reduce((latest, label) => {
      const labelDate = new Date(label.createdAt)
      return labelDate > latest ? labelDate : latest
    }, new Date(0))

    const newGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName,
      labelIds: selectedLabels,
      labelCount: selectedLabels.length,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      lastUpdate: latestDate.toISOString()
    }

    const updatedGroups = [...labelGroups, newGroup]
    saveLabelGroups(updatedGroups)
    
    setSelectedLabels([])
    setIsSelectionMode(false)
    setShowCreateGroupModal(false)
    setNewGroupName('')
  }

  // Crea gruppo vuoto
  const createEmptyGroup = () => {
    const groupName = prompt('Nome del nuovo gruppo:')
    if (!groupName) return

    const newGroup = {
      id: `group_${Date.now()}`,
      name: groupName,
      labelIds: [],
      labelCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      lastUpdate: new Date().toISOString()
    }

    const updatedGroups = [...labelGroups, newGroup]
    saveLabelGroups(updatedGroups)
  }

  // Funzione per controllare se un'etichetta è già in un gruppo
  const getLabelCurrentGroup = (labelId) => {
    return labelGroups.find(group => group.labelIds.includes(labelId))
  }

  // Apri modal per aggiungere etichette al gruppo corrente
  const openAddToGroupModal = () => {
    if (!activeGroup) return

    // Trova tutte le etichette che NON sono già nel gruppo corrente
    const labelsNotInCurrentGroup = productLabels.filter(label => 
      !activeGroup.labelIds.includes(label.id)
    )

    setAvailableLabelsForGroup(labelsNotInCurrentGroup)
    setSelectedLabelsToAdd([])
    setAddToGroupSearchTerm('')
    setShowAddToGroupModal(true)
  }

  // Aggiungi etichette selezionate al gruppo
  const addLabelsToGroup = () => {
    if (!activeGroup || selectedLabelsToAdd.length === 0) return

    const labelsToMove = []
    const labelsWithWarnings = []

    // Controlla quali etichette devono essere spostate da altri gruppi
    selectedLabelsToAdd.forEach(labelId => {
      const currentGroup = getLabelCurrentGroup(labelId)
      if (currentGroup) {
        labelsWithWarnings.push({
          labelId,
          labelName: productLabels.find(l => l.id === labelId)?.productName,
          fromGroup: currentGroup.name
        })
      }
      labelsToMove.push(labelId)
    })

    // Mostra avvisi per etichette che verranno spostate
    if (labelsWithWarnings.length > 0) {
      const warningMessage = labelsWithWarnings.map(w => 
        `• "${w.labelName}" verrà spostata da "${w.fromGroup}"`
      ).join('\n')
      
      const confirmed = confirm(
        `ATTENZIONE: Le seguenti etichette verranno spostate:\n\n${warningMessage}\n\nContinuare?`
      )
      
      if (!confirmed) return
    }

    // Rimuovi le etichette dai gruppi precedenti
    const updatedGroups = labelGroups.map(group => {
      if (group.id === activeGroup.id) {
        // Aggiungi al gruppo corrente
        const newLabelIds = [...group.labelIds, ...labelsToMove]
        const uniqueLabelIds = [...new Set(newLabelIds)] // Rimuovi duplicati
        return {
          ...group,
          labelIds: uniqueLabelIds,
          labelCount: uniqueLabelIds.length,
          lastUpdate: new Date().toISOString()
        }
      } else {
        // Rimuovi dai altri gruppi
        const filteredLabelIds = group.labelIds.filter(id => !labelsToMove.includes(id))
        return {
          ...group,
          labelIds: filteredLabelIds,
          labelCount: filteredLabelIds.length,
          lastUpdate: filteredLabelIds.length !== group.labelIds.length ? new Date().toISOString() : group.lastUpdate
        }
      }
    })

    saveLabelGroups(updatedGroups)
    
    // Aggiorna il gruppo attivo
    const updatedActiveGroup = updatedGroups.find(g => g.id === activeGroup.id)
    setActiveGroup(updatedActiveGroup)
    
    setShowAddToGroupModal(false)
    setSelectedLabelsToAdd([])
  }

  // Toggle selezione etichetta da aggiungere
  const toggleLabelToAdd = (labelId) => {
    setSelectedLabelsToAdd(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    )
  }

  // Seleziona tutte le etichette disponibili
  const selectAllAvailableLabels = () => {
    const filteredIds = availableLabelsForGroup
      .filter(label => 
        label.productName.toLowerCase().includes(addToGroupSearchTerm.toLowerCase()) ||
        label.barcode.includes(addToGroupSearchTerm) ||
        label.lotNumber.toLowerCase().includes(addToGroupSearchTerm.toLowerCase())
      )
      .map(label => label.id)
    
    setSelectedLabelsToAdd(filteredIds)
  }

  // Modifica gruppo
  const openEditGroupModal = () => {
    if (!activeGroup) return
    setEditingGroup(activeGroup)
    setEditGroupName(activeGroup.name)
    setShowEditGroupModal(true)
  }

  // Salva modifiche gruppo
  const saveGroupChanges = () => {
    if (!editGroupName.trim() || !editingGroup) return

    const updatedGroups = labelGroups.map(group => {
      if (group.id === editingGroup.id) {
        return {
          ...group,
          name: editGroupName.trim(),
          lastUpdate: new Date().toISOString()
        }
      }
      return group
    })

    saveLabelGroups(updatedGroups)
    
    // Aggiorna gruppo attivo se è quello che stiamo modificando
    if (activeGroup && activeGroup.id === editingGroup.id) {
      setActiveGroup({
        ...activeGroup,
        name: editGroupName.trim(),
        lastUpdate: new Date().toISOString()
      })
    }

    setShowEditGroupModal(false)
    setEditingGroup(null)
    setEditGroupName('')
  }

  // Modifica gruppo dalla lista (non da gruppo attivo)
  const openEditGroupFromList = (group) => {
    setEditingGroup(group)
    setEditGroupName(group.name)
    setShowEditGroupModal(true)
  }

  // Elimina singola etichetta
  const deleteLabel = (labelId) => {
    const labelToDelete = productLabels.find(l => l.id === labelId)
    if (!labelToDelete) return

    const confirmed = confirm(`Eliminare l'etichetta "${labelToDelete.productName}"?\n\nQuesta azione non può essere annullata.`)
    if (!confirmed) return

    // Rimuovi etichetta dalla lista principale
    const updatedLabels = productLabels.filter(l => l.id !== labelId)
    setProductLabels(updatedLabels)
    localStorage.setItem('haccp-product-labels', JSON.stringify(updatedLabels))

    // Rimuovi etichetta da tutti i gruppi
    const updatedGroups = labelGroups.map(group => ({
      ...group,
      labelIds: group.labelIds.filter(id => id !== labelId),
      labelCount: group.labelIds.filter(id => id !== labelId).length,
      lastUpdate: group.labelIds.includes(labelId) ? new Date().toISOString() : group.lastUpdate
    }))
    saveLabelGroups(updatedGroups)

    // Aggiorna gruppo attivo se necessario
    if (activeGroup && activeGroup.labelIds.includes(labelId)) {
      const updatedActiveGroup = updatedGroups.find(g => g.id === activeGroup.id)
      setActiveGroup(updatedActiveGroup)
    }
  }

  // Categorie preimpostate
  const PRESET_CATEGORIES = [
    { id: 'latticini', name: 'Latticini e Formaggi', color: 'bg-blue-100 text-blue-800', emoji: '🧀' },
    { id: 'carni', name: 'Carni e Salumi', color: 'bg-red-100 text-red-800', emoji: '🥩' },
    { id: 'verdure', name: 'Verdure e Ortaggi', color: 'bg-green-100 text-green-800', emoji: '🥬' },
    { id: 'frutta', name: 'Frutta Fresca', color: 'bg-orange-100 text-orange-800', emoji: '🍎' },
    { id: 'pesce', name: 'Pesce e Frutti di Mare', color: 'bg-cyan-100 text-cyan-800', emoji: '🐟' },
    { id: 'surgelati', name: 'Surgelati', color: 'bg-indigo-100 text-indigo-800', emoji: '❄️' },
    { id: 'dispensa', name: 'Dispensa Secca', color: 'bg-yellow-100 text-yellow-800', emoji: '📦' },
    { id: 'condimenti', name: 'Oli e Condimenti', color: 'bg-amber-100 text-amber-800', emoji: '🫒' }
  ]

  // Filtra etichette per categoria preimpostata
  const filterByCategory = (categoryId) => {
    if (activeCategory === categoryId) {
      // Se è già attiva, disattivala
      setActiveCategory(null)
    } else {
      // Attiva la nuova categoria
      setActiveCategory(categoryId)
      setActiveGroup(null) // Esci dai gruppi quando selezioni una categoria
    }
  }

  // Funzioni per selezione foto
  const togglePhotoSelectionMode = () => {
    setIsPhotoSelectionMode(!isPhotoSelectionMode)
    setSelectedPhotos([])
  }

  const togglePhotoSelection = (labelId) => {
    setSelectedPhotos(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    )
  }

  const selectAllPhotos = () => {
    const allPhotoIds = filteredPhotos.map(label => label.id)
    setSelectedPhotos(allPhotoIds)
  }

  const deselectAllPhotos = () => {
    setSelectedPhotos([])
  }

  // Funzione per controllare prodotti scaduti
  const checkExpiredItems = () => {
    const today = new Date()
    const expired = productLabels.filter(label => {
      const expiryDate = new Date(label.expiryDate)
      return expiryDate < today && label.photo
    })
    
    if (expired.length > 0) {
      setExpiredItems(expired)
      setShowCleanupModal(true)
    }
  }

  // Simulatore scanner codice a barre
  const simulateBarcodeScan = () => {
    setIsScanning(true)
    
    // Simula scansione con codici casuali
    setTimeout(() => {
      const sampleBarcodes = [
        '8001234567890',
        '8001234567891', 
        '8001234567892',
        '8001234567893',
        '8001234567894'
      ]
      const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)]
      setScannedCode(randomBarcode)
      setNewLabel(prev => ({ ...prev, barcode: randomBarcode }))
      setIsScanning(false)
      setShowAddForm(true)
    }, 2000)
  }

  // Salva etichetta (step 1: validazione e conferma)
  const saveLabel = () => {
    if (!newLabel.productName || !newLabel.expiryDate) {
      alert('Nome prodotto e data scadenza sono obbligatori')
      return
    }

    // Mostra conferma prima del salvataggio
    setShowConfirmationModal(true)
  }

  // Salva effettivamente l'etichetta dopo la conferma (step 2)
  const confirmSaveLabel = () => {

    const label = {
      id: `label_${Date.now()}`,
      ...newLabel,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      status: 'active'
    }

    const updatedLabels = [...productLabels, label]
    setProductLabels(updatedLabels)
    localStorage.setItem('haccp-product-labels', JSON.stringify(updatedLabels))

    // AUTO-CREAZIONE PRODOTTO NELL'INVENTARIO
    // Crea automaticamente un prodotto corrispondente nell'inventario
    const inventoryProduct = {
      id: `prod_${Date.now()}`,
      name: newLabel.productName,
      category: newLabel.category.startsWith('group_') ? 'latticini' : newLabel.category, // Default a latticini se è un gruppo
      expiryDate: newLabel.expiryDate,
      location: newLabel.location || 'Posizione da definire',
      allergens: newLabel.allergens || [],
      notes: `${newLabel.notes ? newLabel.notes + ' - ' : ''}Generato automaticamente da etichetta. Lotto: ${newLabel.lotNumber || 'N/A'}`,
      addedBy: currentUser?.id,
      addedByName: currentUser?.name,
      createdAt: new Date().toISOString(),
      status: 'active',
      // Aggiungi riferimenti all'etichetta per tracciabilità
      fromLabel: true,
      labelId: label.id,
      barcode: newLabel.barcode,
      lotNumber: newLabel.lotNumber || '',
      batchDeliveryDate: '',
      associatedOrderId: '',
      supplierName: ''
    }
    
    // Ottieni prodotti esistenti e aggiungi il nuovo
    const existingProducts = JSON.parse(localStorage.getItem('haccp-products') || '[]')
    const updatedProducts = [...existingProducts, inventoryProduct]
    localStorage.setItem('haccp-products', JSON.stringify(updatedProducts))

    // Se è stata selezionata una categoria gruppo, aggiungi l'etichetta al gruppo
    if (newLabel.category && newLabel.category.startsWith('group_')) {
      const groupId = newLabel.category.replace('group_', '')
      const updatedGroups = labelGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            labelIds: [...group.labelIds, label.id],
            labelCount: group.labelCount + 1,
            lastUpdate: new Date().toISOString()
          }
        }
        return group
      })
      saveLabelGroups(updatedGroups)
    }

    // Reset form
    setNewLabel({
      productName: '',
      barcode: '',
      expiryDate: '',
      lotNumber: '',
      category: '',
      location: '',
      notes: '',
      photo: null,
      allergens: []
    })
    setShowAddForm(false)
    setScannedCode('')
    setShowConfirmationModal(false)
  }

  // Gestione foto
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Ridimensiona e comprimi l'immagine per ottimizzare la memoria
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Ridimensiona mantenendo le proporzioni
          const maxWidth = 800
          const maxHeight = 600
          let { width, height } = img
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          ctx.drawImage(img, 0, 0, width, height)
          
          // Comprimi l'immagine
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7)
          setNewLabel(prev => ({ ...prev, photo: compressedImage }))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  // Genera etichetta PDF
  const generateLabelPDF = (label) => {
    setPreviewLabel(label)
    setShowLabelPreview(true)
  }

  // Pulisci foto prodotti scaduti
  const cleanExpiredPhotos = () => {
    const updatedLabels = productLabels.map(label => {
      if (expiredItems.some(item => item.id === label.id)) {
        return { ...label, photo: null, cleanedAt: new Date().toISOString() }
      }
      return label
    })
    
    setProductLabels(updatedLabels)
    localStorage.setItem('haccp-product-labels', JSON.stringify(updatedLabels))
    setShowCleanupModal(false)
    setExpiredItems([])
  }

  // Filtra etichette
  const filteredLabels = productLabels.filter(label => {
    // Se siamo in una visualizzazione di gruppo, mostra solo le etichette di quel gruppo
    if (activeGroup) {
      return activeGroup.labelIds.includes(label.id)
    }
    
    // Se è attiva una categoria preimpostata, filtra per quella
    if (activeCategory) {
      const matchesCategory = label.category === activeCategory
      const matchesSearch = label.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           label.barcode.includes(searchTerm) ||
                           label.lotNumber.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    }
    
    // Altrimenti applica solo il filtro di ricerca normale
    return label.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           label.barcode.includes(searchTerm) ||
           label.lotNumber.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Filtra foto prodotti con ricerca avanzata
  const filteredPhotos = productLabels.filter(label => {
    if (!label.photo) return false
    
    const matchesSearch = !photoSearchTerm || 
      label.productName.toLowerCase().includes(photoSearchTerm.toLowerCase()) ||
      label.barcode.includes(photoSearchTerm) ||
      label.lotNumber.toLowerCase().includes(photoSearchTerm.toLowerCase())
    
    const matchesDate = !photoFilterDate || 
      new Date(label.createdAt).toDateString() === new Date(photoFilterDate).toDateString()
    
    const matchesExpiry = !photoFilterExpiry || (() => {
      const expiryDate = new Date(label.expiryDate)
      const today = new Date()
      const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
      
      switch(photoFilterExpiry) {
        case 'expired': return diffDays < 0
        case 'expiring': return diffDays >= 0 && diffDays <= 7
        case 'fresh': return diffDays > 7
        default: return true
      }
    })()
    
    return matchesSearch && matchesDate && matchesExpiry
  })

  // Paginazione per gestire grandi dataset
  const totalPhotoPages = Math.ceil(filteredPhotos.length / photosPerPage)
  const paginatedPhotos = filteredPhotos.slice(
    (currentPhotoPage - 1) * photosPerPage,
    currentPhotoPage * photosPerPage
  )

  // Funzione per ottimizzare qualità immagine
  const getOptimizedImageSrc = (originalSrc, quality = imageQuality) => {
    if (!originalSrc) return ''
    
    // Se l'immagine è già ottimizzata (base64), la ritorniamo così com'è
    if (originalSrc.startsWith('data:image/')) {
      // Per grandi dataset, riduciamo la qualità per le anteprime
      if (quality === 'low' && originalSrc.length > 50000) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        return new Promise((resolve) => {
          img.onload = () => {
            canvas.width = Math.min(img.width, 200)
            canvas.height = Math.min(img.height, 200)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            resolve(canvas.toDataURL('image/jpeg', 0.5))
          }
          img.src = originalSrc
        })
      }
    }
    
    return originalSrc
  }

  // Inizializza tutte le immagini come caricate per default
  useEffect(() => {
    const allPhotoIds = productLabels.filter(l => l.photo).map(l => l.id)
    setLoadedImages(new Set(allPhotoIds))
  }, [productLabels])

  // Lazy loading per immagini
  const handleImageLoad = (labelId) => {
    setLoadedImages(prev => new Set([...prev, labelId]))
  }

  // Reset paginazione quando cambiano i filtri
  useEffect(() => {
    setCurrentPhotoPage(1)
  }, [photoSearchTerm, photoFilterDate, photoFilterExpiry])

  // Ottimizzazione selezione per grandi dataset
  const selectAllPhotosVisible = () => {
    const visiblePhotoIds = paginatedPhotos.map(label => label.id)
    setSelectedPhotos(prev => [...new Set([...prev, ...visiblePhotoIds])])
  }

  // Performance monitor per grandi dataset
  const getPerformanceInfo = () => {
    const totalPhotos = productLabels.filter(l => l.photo).length
    const isLargeDataset = totalPhotos > 100
    const isVeryLargeDataset = totalPhotos > 500
    
    return {
      totalPhotos,
      isLargeDataset,
      isVeryLargeDataset,
      recommendedPhotosPerPage: isVeryLargeDataset ? 12 : isLargeDataset ? 20 : 50
    }
  }

  // Calcola statistiche
  const stats = {
    total: productLabels.length,
    withPhotos: productLabels.filter(l => l.photo).length,
    expiringSoon: productLabels.filter(l => {
      const expiryDate = new Date(l.expiryDate)
      const today = new Date()
      const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays >= 0
    }).length,
    expired: productLabels.filter(l => {
      const expiryDate = new Date(l.expiryDate)
      return expiryDate < new Date()
    }).length
  }

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Gestione Etichette Prodotti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">Etichette Totali</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.withPhotos}</div>
              <div className="text-sm text-green-700">Con Foto</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</div>
              <div className="text-sm text-yellow-700">In Scadenza</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-red-700">Scaduti</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sezioni Navigation */}
      <div className="flex gap-2 overflow-x-auto">
        <Button
          variant={activeSection === 'scanner' ? 'default' : 'outline'}
          onClick={() => setActiveSection('scanner')}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Scan className="h-4 w-4" />
          Scanner
        </Button>
        <Button
          variant={activeSection === 'labels' ? 'default' : 'outline'}
          onClick={() => setActiveSection('labels')}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Tag className="h-4 w-4" />
          Le Mie Etichette
        </Button>
        <Button
          variant={activeSection === 'photos' ? 'default' : 'outline'}
          onClick={() => setActiveSection('photos')}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <ImageIcon className="h-4 w-4" />
          Foto Prodotti
        </Button>
      </div>

      {/* Sezione Scanner */}
      {activeSection === 'scanner' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scanner Codici a Barre
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              {isScanning ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-pulse">
                    <QrCode className="h-20 w-20 text-blue-500" />
                  </div>
                  <p className="text-blue-600">Scansione in corso...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scannedCode ? (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-green-700">Codice scansionato: <strong>{scannedCode}</strong></p>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Clicca "Avvia Scanner" per leggere un codice a barre</p>
                    </div>
                  )}
                  
                  <Button
                    onClick={simulateBarcodeScan}
                    disabled={isScanning}
                    className="w-full"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Avvia Scanner
                  </Button>
                  
                  {scannedCode && (
                    <Button
                      onClick={() => setShowAddForm(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crea Etichetta per questo Prodotto
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sezione Le Mie Etichette */}
      {activeSection === 'labels' && (
        <div className="space-y-4">
          {/* Search e Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Riga 1: Ricerca e Nuova Etichetta */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder={
                          activeGroup ? `Cerca in "${activeGroup.name}"...` :
                          activeCategory ? `Cerca in "${PRESET_CATEGORIES.find(c => c.id === activeCategory)?.name}"...` :
                          "Cerca per nome, codice, lotto..."
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nuova Etichetta
                  </Button>
                </div>

                {/* Riga 2: Controlli selezione e gruppi */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={toggleSelectionMode}
                    variant={isSelectionMode ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <CheckSquare className="h-4 w-4" />
                    {isSelectionMode ? 'Annulla Selezione' : 'Seleziona Etichette'}
                  </Button>

                  {isSelectionMode && (
                    <>
                      <Button
                        onClick={selectAllLabels}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Seleziona Tutto
                      </Button>
                      <Button
                        onClick={deselectAllLabels}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Deseleziona Tutto
                      </Button>
                      <Button
                        onClick={createGroupFromSelected}
                        variant="default"
                        size="sm"
                        className="flex items-center gap-2"
                        disabled={selectedLabels.length === 0}
                      >
                        <Move className="h-4 w-4" />
                        Crea Gruppo ({selectedLabels.length})
                      </Button>
                    </>
                  )}

                  {!activeGroup && !isSelectionMode && (
                    <Button
                      onClick={createEmptyGroup}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <FolderPlus className="h-4 w-4" />
                      Crea Gruppo di Etichette
                    </Button>
                  )}

                  {!activeGroup && isSelectionMode && selectedLabels.length > 0 && (
                    <Button
                      onClick={() => setShowMoveToGroupModal(true)}
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Folder className="h-4 w-4" />
                      Sposta Etichette nel Gruppo...
                    </Button>
                  )}

                  {activeGroup && (
                    <>
                      <Button
                        onClick={openAddToGroupModal}
                        variant="default"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Aggiungi Etichette al Gruppo
                      </Button>
                      <Button
                        onClick={openEditGroupModal}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Modifica Gruppo
                      </Button>
                      <Button
                        onClick={() => setActiveGroup(null)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Esci da "{activeGroup.name}"
                      </Button>
                    </>
                  )}

                  {activeCategory && (
                    <Button
                      onClick={() => setActiveCategory(null)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Esci da "{PRESET_CATEGORIES.find(c => c.id === activeCategory)?.name}"
                    </Button>
                  )}
                </div>

                {/* Selezione attiva info */}
                {isSelectionMode && selectedLabels.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      {selectedLabels.length} etichett{selectedLabels.length === 1 ? 'a selezionata' : 'e selezionate'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lista Gruppi con Categorie Integrate */}
          {!activeGroup && !activeCategory && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    I Miei Gruppi di Etichette
                  </CardTitle>
                  
                  {/* Barra di ricerca gruppi */}
                  {labelGroups.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Cerca gruppi ed etichette..."
                          value={globalSearchTerm}
                          onChange={(e) => setGlobalSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Risultati Ricerca Globale */}
                {globalSearchTerm && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Risultati Ricerca: "{globalSearchTerm}"
                    </h3>
                    
                    {(() => {
                      // Cerca nei gruppi
                      const matchingGroups = labelGroups.filter(group =>
                        group.name.toLowerCase().includes(globalSearchTerm.toLowerCase())
                      )
                      
                      // Cerca nelle etichette
                      const matchingLabels = productLabels.filter(label =>
                        label.productName.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
                        label.barcode.includes(globalSearchTerm) ||
                        label.lotNumber.toLowerCase().includes(globalSearchTerm.toLowerCase())
                      )
                      
                      if (matchingGroups.length === 0 && matchingLabels.length === 0) {
                        return (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500">Nessun risultato trovato</p>
                          </div>
                        )
                      }
                      
                      return (
                        <div className="space-y-4">
                          {/* Gruppi trovati */}
                          {matchingGroups.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <Folder className="h-3 w-3" />
                                GRUPPI ({matchingGroups.length})
                              </h4>
                              <div className="grid gap-2">
                                {matchingGroups.map(group => (
                                  <div
                                    key={group.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-blue-50 border-blue-200"
                                    onClick={() => {
                                      setActiveGroup(group)
                                      setGlobalSearchTerm('')
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        <Folder className="h-3 w-3" />
                                        GRUPPO
                                      </div>
                                      <div>
                                        <p className="font-medium">{group.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {group.labelIds.length} etichette
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Click per aprire
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Etichette trovate */}
                          {matchingLabels.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                ETICHETTE ({matchingLabels.length})
                              </h4>
                              <div className="grid gap-2">
                                {matchingLabels.slice(0, 5).map(label => (
                                  <div
                                    key={label.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-green-50 border-green-200"
                                    onClick={() => {
                                      setPreviewLabel(label)
                                      setShowLabelPreview(true)
                                      setGlobalSearchTerm('')
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                        <Package className="h-3 w-3" />
                                        ETICHETTA
                                      </div>
                                      <div>
                                        <p className="font-medium">{label.productName}</p>
                                        <p className="text-xs text-gray-500">
                                          Scadenza: {label.expiryDate} • Lotto: {label.lotNumber}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Click per visualizzare
                                    </div>
                                  </div>
                                ))}
                                {matchingLabels.length > 5 && (
                                  <div className="text-center py-2">
                                    <p className="text-xs text-gray-500">
                                      ... e altre {matchingLabels.length - 5} etichette
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGlobalSearchTerm('')}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Chiudi Ricerca
                      </Button>
                    </div>
                  </div>
                )}

                {/* Categorie Preimpostate - Scelte Rapide */}
                {!globalSearchTerm && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Categorie Ingredienti (Scelte Rapide)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_CATEGORIES.map(category => {
                        const categoryLabels = productLabels.filter(label => label.category === category.id)
                        const categoryCount = categoryLabels.length
                        
                        return (
                          <Button
                            key={category.id}
                            variant="outline"
                            size="sm"
                            onClick={() => filterByCategory(category.id)}
                            className={`flex items-center gap-2 ${categoryCount > 0 ? 'hover:shadow-md' : 'opacity-50 cursor-not-allowed'}`}
                            disabled={categoryCount === 0}
                          >
                            <span className="text-lg">{category.emoji}</span>
                            <span className="hidden sm:inline">{category.name}</span>
                            <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                            {categoryCount > 0 && (
                              <span className={`px-2 py-1 text-xs rounded-full ${category.color} ml-1`}>
                                {categoryCount}
                              </span>
                            )}
                          </Button>
                        )
                      })}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Clicca su una categoria per vedere le relative etichette
                    </div>
                  </div>
                )}

                {/* Separatore per gruppi personalizzati */}
                {labelGroups.length > 0 && (
                  <div className="border-t border-gray-200 my-4"></div>
                )}

                {/* Gruppi Personalizzati come Scelte Rapide */}
                {labelGroups.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Gruppi Personalizzati (Scelte Rapide)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {labelGroups.map(group => {
                        const groupCount = group.labelIds.length
                        
                        return (
                          <Button
                            key={group.id}
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveGroup(group)}
                            className={`flex items-center gap-2 ${groupCount > 0 ? 'hover:shadow-md' : 'opacity-50 cursor-not-allowed'}`}
                            disabled={groupCount === 0}
                          >
                            <Folder className="h-4 w-4" />
                            <span className="hidden sm:inline">{group.name}</span>
                            <span className="sm:hidden">{group.name.split(' ')[0]}</span>
                            {groupCount > 0 && (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 ml-1">
                                {groupCount}
                              </span>
                            )}
                          </Button>
                        )
                      })}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Clicca su un gruppo per vedere le relative etichette
                    </div>
                  </div>
                )}

                {/* Separatore finale */}
                {!globalSearchTerm && (
                  <div className="border-t border-gray-200 my-4"></div>
                )}

                {/* Gruppi Personalizzati - Gestione Completa */}
                {!globalSearchTerm && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Gestione Gruppi Personalizzati
                    </h3>
                  </div>
                )}

                {!globalSearchTerm && (
                  <div className="grid gap-3">
                    {labelGroups.map(group => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all"
                      onClick={() => setActiveGroup(group)}
                    >
                      <div className="flex items-center gap-3">
                        <Folder className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-semibold">{group.name}</h4>
                          <p className="text-sm text-gray-600">
                            {group.labelCount} etichett{group.labelCount === 1 ? 'a' : 'e'} • 
                            Ultimo aggiornamento: {new Date(group.lastUpdate).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditGroupFromList(group)
                          }}
                          title="Modifica gruppo"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Eliminare il gruppo "${group.name}"? Le etichette non verranno eliminate.`)) {
                              const updatedGroups = labelGroups.filter(g => g.id !== group.id)
                              saveLabelGroups(updatedGroups)
                            }
                          }}
                          title="Elimina gruppo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                                      ))}
                </div>
                )}

                {/* Messaggio se non ci sono gruppi personalizzati */}
                {!globalSearchTerm && labelGroups.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Nessun gruppo personalizzato creato ancora.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Usa "Seleziona Etichette" per creare gruppi dalle etichette esistenti
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Header Lista Etichette */}
          <>
            {activeGroup && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Folder className="h-5 w-5 text-blue-600" />
                    Gruppo: <span className="text-blue-600">{activeGroup.name}</span>
                    <span className="text-sm text-gray-500 font-normal">
                      ({activeGroup.labelIds.length} etichette)
                    </span>
                  </CardTitle>
                </CardHeader>
              </Card>
            )}

            {activeCategory && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="h-5 w-5 text-green-600" />
                    Categoria: <span className="text-green-600">
                      {PRESET_CATEGORIES.find(c => c.id === activeCategory)?.name}
                    </span>
                    <span className="text-sm text-gray-500 font-normal">
                      ({filteredLabels.length} etichette)
                    </span>
                  </CardTitle>
                </CardHeader>
              </Card>
            )}

            {/* Titolo Lista Etichette */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Etichette Registrate
                  <span className="text-sm text-gray-500 font-normal">
                    ({filteredLabels.length} totali)
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
          </>

          {/* Lista Etichette */}
          <div className="grid gap-4">
            {filteredLabels.map(label => {
              const expiryDate = new Date(label.expiryDate)
              const today = new Date()
              const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
              const isExpired = expiryDate < today
              const isExpiringSoon = diffDays <= 7 && diffDays >= 0
              const isSelected = selectedLabels.includes(label.id)

              return (
                <Card 
                  key={label.id} 
                  className={`${isExpired ? 'border-red-200 bg-red-50' : isExpiringSoon ? 'border-yellow-200 bg-yellow-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isSelectionMode ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                  onClick={() => isSelectionMode && toggleLabelSelection(label.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      {/* Checkbox per selezione multipla */}
                      {isSelectionMode && (
                        <div className="mr-3 mt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleLabelSelection(label.id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 pointer-events-none"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{label.productName}</h3>
                          {label.photo && (
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                          )}
                          {isExpired && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              SCADUTO
                            </span>
                          )}
                          {isExpiringSoon && !isExpired && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              IN SCADENZA
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <strong>Codice:</strong> {label.barcode}
                          </div>
                          <div>
                            <strong>Lotto:</strong> {label.lotNumber}
                          </div>
                          <div>
                            <strong>Scadenza:</strong> {new Date(label.expiryDate).toLocaleDateString('it-IT')}
                          </div>
                          <div>
                            <strong>Categoria:</strong> {
                              PRESET_CATEGORIES.find(c => c.id === label.category)?.name || 
                              labelGroups.find(g => g.id === label.category)?.name || 
                              label.category || 'Non specificata'
                            }
                          </div>
                          <div className="col-span-2">
                            <strong>Gruppo:</strong> {
                              (() => {
                                const currentGroup = getLabelCurrentGroup(label.id)
                                return currentGroup ? (
                                  <span className="inline-flex items-center gap-1 ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    <Folder className="h-3 w-3" />
                                    {currentGroup.name}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 ml-2">Nessun gruppo</span>
                                )
                              })()
                            }
                          </div>
                        </div>
                        
                        {label.location && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Posizione:</strong> {label.location}
                          </div>
                        )}
                        
                        {label.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Note:</strong> {label.notes}
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Creata da {label.createdBy} il {new Date(label.createdAt).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewLabel(label)
                            setShowLabelPreview(true)
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Visualizza
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            generateLabelPDF(label)
                          }}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                        
                        {label.photo && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPhoto(label.photo)
                              setShowPhotoModal(true)
                            }}
                            className="flex items-center gap-1"
                          >
                            <ImageIcon className="h-3 w-3" />
                            Foto
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteLabel(label.id)
                          }}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Elimina
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            
            {filteredLabels.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {activeGroup ? `Nessuna etichetta nel gruppo "${activeGroup.name}"` :
                     activeCategory ? `Nessuna etichetta nella categoria "${PRESET_CATEGORIES.find(c => c.id === activeCategory)?.name}"` :
                     searchTerm ? 'Nessuna etichetta trovata' : 
                     'Nessuna etichetta creata ancora'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Sezione Foto Prodotti */}
      {activeSection === 'photos' && (
        <div className="space-y-4">
          {/* Controlli ricerca e selezione foto */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Riga 1: Ricerca avanzata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Cerca per nome, codice, lotto..."
                      value={photoSearchTerm}
                      onChange={(e) => setPhotoSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Input
                    type="date"
                    placeholder="Filtra per data creazione"
                    value={photoFilterDate}
                    onChange={(e) => setPhotoFilterDate(e.target.value)}
                  />
                  <select
                    value={photoFilterExpiry}
                    onChange={(e) => setPhotoFilterExpiry(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Tutte le scadenze</option>
                    <option value="fresh">Prodotti freschi (>7 giorni)</option>
                    <option value="expiring">In scadenza (≤7 giorni)</option>
                    <option value="expired">Scaduti</option>
                  </select>
                </div>

                {/* Riga 2: Controlli selezione */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={togglePhotoSelectionMode}
                    variant={isPhotoSelectionMode ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <CheckSquare className="h-4 w-4" />
                    {isPhotoSelectionMode ? 'Annulla Selezione' : 'Seleziona Foto'}
                  </Button>

                  {isPhotoSelectionMode && (
                    <>
                      <Button
                        onClick={selectAllPhotos}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Seleziona Tutte ({filteredPhotos.length})
                      </Button>
                      <Button
                        onClick={selectAllPhotosVisible}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Solo Pagina Corrente ({paginatedPhotos.length})
                      </Button>
                      <Button
                        onClick={deselectAllPhotos}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Deseleziona Tutto
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                        disabled={selectedPhotos.length === 0}
                        onClick={() => {
                          if (confirm(`Eliminare ${selectedPhotos.length} foto selezionate?`)) {
                            const updatedLabels = productLabels.map(label => 
                              selectedPhotos.includes(label.id) 
                                ? { ...label, photo: null }
                                : label
                            )
                            setProductLabels(updatedLabels)
                            localStorage.setItem('haccp-product-labels', JSON.stringify(updatedLabels))
                            setSelectedPhotos([])
                            setIsPhotoSelectionMode(false)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Elimina Selezionate ({selectedPhotos.length})
                      </Button>
                    </>
                  )}

                  {(photoSearchTerm || photoFilterDate || photoFilterExpiry) && (
                    <Button
                      onClick={() => {
                        setPhotoSearchTerm('')
                        setPhotoFilterDate('')
                        setPhotoFilterExpiry('')
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancella Filtri
                    </Button>
                  )}
                </div>

                {/* Info selezione */}
                {isPhotoSelectionMode && selectedPhotos.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      {selectedPhotos.length} foto selezionat{selectedPhotos.length === 1 ? 'a' : 'e'}
                    </p>
                  </div>
                )}

                {/* Info filtri attivi */}
                {(photoSearchTerm || photoFilterDate || photoFilterExpiry) && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-700 text-sm">
                      Filtri attivi: {filteredPhotos.length} foto di {productLabels.filter(l => l.photo).length}
                    </p>
                  </div>
                )}

                {/* Info performance per grandi dataset */}
                {(() => {
                  const perfInfo = getPerformanceInfo()
                  if (perfInfo.isLargeDataset) {
                    return (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-blue-700 text-sm font-semibold">
                              Dataset grande: {perfInfo.totalPhotos} foto
                            </p>
                            <p className="text-blue-600 text-xs">
                              Modalità ottimizzata attiva • Pagina {currentPhotoPage} di {totalPhotoPages}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={photosPerPage}
                              onChange={(e) => {
                                setPhotosPerPage(Number(e.target.value))
                                setCurrentPhotoPage(1)
                              }}
                              className="text-xs p-1 border rounded"
                            >
                              <option value={12}>12 foto/pagina</option>
                              <option value={20}>20 foto/pagina</option>
                              <option value={50}>50 foto/pagina</option>
                              <option value={100}>100 foto/pagina</option>
                            </select>
                            <select
                              value={imageQuality}
                              onChange={(e) => setImageQuality(e.target.value)}
                              className="text-xs p-1 border rounded"
                            >
                              <option value="low">Qualità Bassa</option>
                              <option value="medium">Qualità Media</option>
                              <option value="high">Qualità Alta</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Controlli paginazione */}
          {totalPhotoPages > 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center items-center gap-4">
                  <Button
                    onClick={() => setCurrentPhotoPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPhotoPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    ← Precedente
                  </Button>
                  
                  <div className="flex gap-1">
                    {[...Array(Math.min(5, totalPhotoPages))].map((_, index) => {
                      let pageNum
                      if (totalPhotoPages <= 5) {
                        pageNum = index + 1
                      } else {
                        const start = Math.max(1, currentPhotoPage - 2)
                        pageNum = start + index
                        if (pageNum > totalPhotoPages) pageNum = totalPhotoPages - (4 - index)
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPhotoPage(pageNum)}
                          variant={currentPhotoPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    onClick={() => setCurrentPhotoPage(prev => Math.min(totalPhotoPages, prev + 1))}
                    disabled={currentPhotoPage === totalPhotoPages}
                    variant="outline"
                    size="sm"
                  >
                    Successiva →
                  </Button>
                </div>
                
                <div className="text-center mt-2">
                  <p className="text-sm text-gray-600">
                    Pagina {currentPhotoPage} di {totalPhotoPages} • 
                    Mostrando {paginatedPhotos.length} di {filteredPhotos.length} foto
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Griglia foto ottimizzata */}
          <div className={`grid gap-4 ${
            photosPerPage <= 12 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' :
            photosPerPage <= 20 ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5' :
            'grid-cols-3 md:grid-cols-5 lg:grid-cols-6'
          }`}>
            {paginatedPhotos.map(label => {
              const isSelected = selectedPhotos.includes(label.id)
              const expiryDate = new Date(label.expiryDate)
              const today = new Date()
              const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
              const isExpired = expiryDate < today
              const isExpiringSoon = diffDays <= 7 && diffDays >= 0

              return (
                <Card 
                  key={label.id} 
                  className={`overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isPhotoSelectionMode ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                  onClick={() => isPhotoSelectionMode && togglePhotoSelection(label.id)}
                >
                  <div className="relative">
                    {/* Checkbox per selezione */}
                    {isPhotoSelectionMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePhotoSelection(label.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 pointer-events-none"
                        />
                      </div>
                    )}
                    
                    {/* Badge scadenza */}
                    {(isExpired || isExpiringSoon) && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className={`px-2 py-1 text-xs rounded ${
                          isExpired ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {isExpired ? 'SCADUTO' : 'SCADENZA'}
                        </span>
                      </div>
                    )}

                    <div 
                      className="aspect-square bg-gray-100 cursor-pointer overflow-hidden"
                      onClick={(e) => {
                        if (!isPhotoSelectionMode) {
                          e.stopPropagation()
                          setSelectedPhoto(label.photo)
                          setShowPhotoModal(true)
                        }
                      }}
                    >
                      {/* Immagine ottimizzata per grandi dataset */}
                      <img 
                        src={getOptimizedImageSrc(label.photo)}
                        alt={label.productName}
                        className="w-full h-full object-cover transition-opacity duration-200"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      
                      {/* Fallback per errori di caricamento */}
                      <div className="w-full h-full hidden items-center justify-center bg-red-50">
                        <div className="text-center">
                          <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-1" />
                          <p className="text-xs text-red-600">Errore caricamento</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-sm truncate">{label.productName}</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Scad: {new Date(label.expiryDate).toLocaleDateString('it-IT')}</p>
                      <p>Creata: {new Date(label.createdAt).toLocaleDateString('it-IT')}</p>
                      {label.lotNumber && <p>Lotto: {label.lotNumber}</p>}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {/* Footer paginazione per grandi dataset */}
          {totalPhotoPages > 1 && paginatedPhotos.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center items-center gap-2">
                  <Button
                    onClick={() => setCurrentPhotoPage(1)}
                    disabled={currentPhotoPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Prima
                  </Button>
                  <Button
                    onClick={() => setCurrentPhotoPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPhotoPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    ←
                  </Button>
                  <span className="px-4 py-2 text-sm bg-gray-100 rounded">
                    {currentPhotoPage} / {totalPhotoPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPhotoPage(prev => Math.min(totalPhotoPages, prev + 1))}
                    disabled={currentPhotoPage === totalPhotoPages}
                    variant="outline"
                    size="sm"
                  >
                    →
                  </Button>
                  <Button
                    onClick={() => setCurrentPhotoPage(totalPhotoPages)}
                    disabled={currentPhotoPage === totalPhotoPages}
                    variant="outline"
                    size="sm"
                  >
                    Ultima
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredPhotos.length === 0 && productLabels.filter(l => l.photo).length > 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nessuna foto trovata con i filtri attuali</p>
              </CardContent>
            </Card>
          )}
          
          {productLabels.filter(label => label.photo).length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nessuna foto caricata ancora</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal Aggiunta Etichetta */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Nuova Etichetta Prodotto</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewLabel({
                      productName: '',
                      barcode: '',
                      expiryDate: '',
                      lotNumber: '',
                      category: '',
                      location: '',
                      notes: '',
                      photo: null,
                      allergens: []
                    })
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName">Nome Prodotto *</Label>
                <Input
                  id="productName"
                  value={newLabel.productName}
                  onChange={(e) => setNewLabel(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="es. Mozzarella di Bufala"
                />
              </div>

              <div>
                <Label htmlFor="barcode">Codice a Barre</Label>
                <Input
                  id="barcode"
                  value={newLabel.barcode}
                  onChange={(e) => setNewLabel(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="Scansiona o inserisci manualmente"
                />
              </div>

              <div>
                <Label htmlFor="expiryDate">Data Scadenza *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newLabel.expiryDate}
                  onChange={(e) => setNewLabel(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="lotNumber">Numero Lotto</Label>
                <Input
                  id="lotNumber"
                  value={newLabel.lotNumber}
                  onChange={(e) => setNewLabel(prev => ({ ...prev, lotNumber: e.target.value }))}
                  placeholder="es. L240315A"
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  value={newLabel.category}
                  onChange={(e) => setNewLabel(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleziona categoria</option>
                  <optgroup label="📂 Categorie Standard">
                    <option value="latticini">Latticini e Formaggi</option>
                    <option value="carni">Carni e Salumi</option>
                    <option value="verdure">Verdure e Ortaggi</option>
                    <option value="frutta">Frutta Fresca</option>
                    <option value="pesce">Pesce e Frutti di Mare</option>
                    <option value="surgelati">Surgelati</option>
                    <option value="dispensa">Dispensa Secca</option>
                    <option value="condimenti">Oli e Condimenti</option>
                  </optgroup>
                  {labelGroups.length > 0 && (
                    <optgroup label="🏷️ I Miei Gruppi di Etichette">
                      {labelGroups.map(group => (
                        <option key={group.id} value={`group_${group.id}`}>
                          {group.name} ({group.labelCount} etichett{group.labelCount === 1 ? 'a' : 'e'})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <Label htmlFor="location">Posizione</Label>
                <Input
                  id="location"
                  value={newLabel.location}
                  onChange={(e) => setNewLabel(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="es. Frigo A - Ripiano intermedio"
                />
              </div>

              <div>
                <Label>Allergeni</Label>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mt-2">
                  {ALLERGENS.map(allergen => (
                    <button
                      key={allergen.id}
                      type="button"
                      onClick={() => {
                        const isSelected = newLabel.allergens.includes(allergen.id)
                        setNewLabel(prev => ({
                          ...prev,
                          allergens: isSelected 
                            ? prev.allergens.filter(id => id !== allergen.id)
                            : [...prev.allergens, allergen.id]
                        }))
                      }}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        newLabel.allergens.includes(allergen.id)
                          ? allergen.color
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {allergen.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Note</Label>
                <textarea
                  id="notes"
                  value={newLabel.notes}
                  onChange={(e) => setNewLabel(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Note aggiuntive..."
                  className="w-full p-2 border border-gray-300 rounded-md h-20 resize-none"
                />
              </div>

              <div>
                <Label>Foto Prodotto</Label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {newLabel.photo && (
                    <div className="relative">
                      <img 
                        src={newLabel.photo} 
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-md border"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNewLabel(prev => ({ ...prev, photo: null }))}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={saveLabel}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Salva Etichetta
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false)
                    setNewLabel({
                      productName: '',
                      barcode: '',
                      expiryDate: '',
                      lotNumber: '',
                      category: '',
                      location: '',
                      notes: '',
                      photo: null,
                      allergens: []
                    })
                  }}
                >
                  Annulla
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Anteprima Etichetta */}
      {showLabelPreview && previewLabel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Anteprima Etichetta</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowLabelPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-white">
                <div className="text-center space-y-2">
                  <h2 className="text-lg font-bold">{previewLabel.productName}</h2>
                  <div className="text-sm">
                    <div><strong>Codice:</strong> {previewLabel.barcode}</div>
                    <div><strong>Lotto:</strong> {previewLabel.lotNumber}</div>
                    <div><strong>Scadenza:</strong> {new Date(previewLabel.expiryDate).toLocaleDateString('it-IT')}</div>
                    {previewLabel.location && (
                      <div><strong>Posizione:</strong> {previewLabel.location}</div>
                    )}
                  </div>
                  
                  {/* QR Code simulato */}
                  <div className="flex justify-center my-4">
                    <div className="w-16 h-16 bg-black border-2 border-gray-300 flex items-center justify-center">
                      <QrCode className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    Creata il {new Date(previewLabel.createdAt).toLocaleDateString('it-IT')}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <Button onClick={() => alert('Funzione stampa in sviluppo')}>
                  <Download className="h-4 w-4 mr-2" />
                  Scarica Etichetta PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Visualizza Foto */}
      {showPhotoModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-[90vh]">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-4 right-4 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
            <img 
              src={selectedPhoto} 
              alt="Foto prodotto"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Modal Pulizia Prodotti Scaduti */}
      {showCleanupModal && expiredItems.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Pulizia Automatica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Trovati <strong>{expiredItems.length}</strong> prodotti scaduti con foto.
                Vuoi eliminare le foto per liberare spazio in memoria?
              </p>
              
              <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                {expiredItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm">{item.productName}</span>
                    <span className="text-xs text-red-600">
                      Scad: {new Date(item.expiryDate).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={cleanExpiredPhotos}
                  className="flex-1"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina Foto
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCleanupModal(false)}
                >
                  Mantieni
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Crea Gruppo */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Crea Nuovo Gruppo</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowCreateGroupModal(false)
                    setNewGroupName('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="groupName">Nome del Gruppo</Label>
                <Input
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="es. Etichette Salumi"
                  onKeyPress={(e) => e.key === 'Enter' && saveNewGroup()}
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-700 text-sm">
                  Il gruppo conterrà {selectedLabels.length} etichett{selectedLabels.length === 1 ? 'a' : 'e'} selezionat{selectedLabels.length === 1 ? 'a' : 'e'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={saveNewGroup}
                  className="flex-1"
                  disabled={!newGroupName.trim()}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Crea Gruppo
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateGroupModal(false)
                    setNewGroupName('')
                  }}
                >
                  Annulla
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Aggiungi Etichette al Gruppo */}
      {showAddToGroupModal && activeGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Aggiungi Etichette al Gruppo "{activeGroup.name}"</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowAddToGroupModal(false)
                    setSelectedLabelsToAdd([])
                    setAddToGroupSearchTerm('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto">
              {/* Controlli ricerca e selezione */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Cerca etichette da aggiungere..."
                        value={addToGroupSearchTerm}
                        onChange={(e) => setAddToGroupSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={selectAllAvailableLabels}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Seleziona Tutte
                  </Button>
                  <Button
                    onClick={() => setSelectedLabelsToAdd([])}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Deseleziona
                  </Button>
                </div>

                {/* Info selezione */}
                {selectedLabelsToAdd.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      {selectedLabelsToAdd.length} etichett{selectedLabelsToAdd.length === 1 ? 'a selezionata' : 'e selezionate'}
                    </p>
                  </div>
                )}

                {/* Info etichette disponibili */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 text-sm">
                    Etichette disponibili: {availableLabelsForGroup.filter(label => 
                      label.productName.toLowerCase().includes(addToGroupSearchTerm.toLowerCase()) ||
                      label.barcode.includes(addToGroupSearchTerm) ||
                      label.lotNumber.toLowerCase().includes(addToGroupSearchTerm.toLowerCase())
                    ).length} di {availableLabelsForGroup.length}
                  </p>
                </div>
              </div>

              {/* Lista etichette disponibili */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {availableLabelsForGroup
                  .filter(label => 
                    label.productName.toLowerCase().includes(addToGroupSearchTerm.toLowerCase()) ||
                    label.barcode.includes(addToGroupSearchTerm) ||
                    label.lotNumber.toLowerCase().includes(addToGroupSearchTerm.toLowerCase())
                  )
                  .map(label => {
                    const isSelected = selectedLabelsToAdd.includes(label.id)
                    const currentGroup = getLabelCurrentGroup(label.id)
                    
                    return (
                      <div
                        key={label.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:shadow-md ${
                          isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-400'
                        }`}
                        onClick={() => toggleLabelToAdd(label.id)}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleLabelToAdd(label.id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 pointer-events-none"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{label.productName}</h4>
                              {label.photo && (
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                              )}
                              {currentGroup && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                  In "{currentGroup.name}"
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                              <div><strong>Codice:</strong> {label.barcode}</div>
                              <div><strong>Lotto:</strong> {label.lotNumber}</div>
                              <div><strong>Scadenza:</strong> {new Date(label.expiryDate).toLocaleDateString('it-IT')}</div>
                              <div><strong>Categoria:</strong> {label.category}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
                
                {availableLabelsForGroup.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Tutte le etichette sono già in questo gruppo</p>
                  </div>
                )}
              </div>

              {/* Pulsanti azione */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={addLabelsToGroup}
                  className="flex-1"
                  disabled={selectedLabelsToAdd.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi {selectedLabelsToAdd.length} Etichett{selectedLabelsToAdd.length === 1 ? 'a' : 'e'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddToGroupModal(false)
                    setSelectedLabelsToAdd([])
                    setAddToGroupSearchTerm('')
                  }}
                >
                  Annulla
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Modifica Gruppo */}
      {showEditGroupModal && editingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Modifica Gruppo</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowEditGroupModal(false)
                    setEditingGroup(null)
                    setEditGroupName('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="editGroupName">Nome del Gruppo</Label>
                <Input
                  id="editGroupName"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  placeholder="es. Etichette Salumi"
                  onKeyPress={(e) => e.key === 'Enter' && saveGroupChanges()}
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-700 text-sm">
                  Il gruppo contiene {editingGroup.labelCount} etichett{editingGroup.labelCount === 1 ? 'a' : 'e'}
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  Creato da {editingGroup.createdBy} il {new Date(editingGroup.createdAt).toLocaleDateString('it-IT')}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={saveGroupChanges}
                  className="flex-1"
                  disabled={!editGroupName.trim() || editGroupName.trim() === editingGroup.name}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Salva Modifiche
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditGroupModal(false)
                    setEditingGroup(null)
                    setEditGroupName('')
                  }}
                >
                  Annulla
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Modal Conferma Salvataggio */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-center text-orange-600">
                ⚠️ Conferma Salvataggio Etichetta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-700 mb-4">
                    Stai per salvare l'etichetta con questi dati:
                  </p>
                  
                  <div className="bg-gray-50 p-3 rounded-lg text-left space-y-2">
                    <p><strong>Prodotto:</strong> {newLabel.productName}</p>
                    <p><strong>Scadenza:</strong> {newLabel.expiryDate}</p>
                    <p><strong>Lotto:</strong> {newLabel.lotNumber || 'Non specificato'}</p>
                    <p><strong>Categoria:</strong> {
                      PRESET_CATEGORIES.find(c => c.id === newLabel.category)?.name || 
                      labelGroups.find(g => g.id === newLabel.category)?.name || 
                      'Non specificata'
                    }</p>
                    {newLabel.photo && <p><strong>Foto:</strong> ✅ Allegata</p>}
                  </div>
                  
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>⚠️ ATTENZIONE:</strong><br/>
                      Una volta salvata, l'etichetta <strong>NON potrà essere modificata</strong>. 
                      In caso di errore sarà necessario:
                    </p>
                    <ul className="text-xs text-red-600 mt-2 text-left">
                      <li>• Caricare una nuova foto</li>
                      <li>• Rifare completamente la registrazione</li>
                    </ul>
                    <p className="text-sm text-red-700 mt-2">
                      <strong>Ricontrolla attentamente tutte le informazioni!</strong>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmationModal(false)}
                    className="flex-1"
                  >
                    ← Modifica Dati
                  </Button>
                  <Button
                    onClick={confirmSaveLabel}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    ✓ Conferma e Salva
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Visualizzazione Etichetta */}
      {showLabelPreview && previewLabel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visualizzazione Etichetta
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowLabelPreview(false)
                    setPreviewLabel(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Foto Prodotto */}
                {previewLabel.photo && (
                  <div className="text-center">
                    <h3 className="text-sm font-medium mb-2">Foto Prodotto</h3>
                    <div className="relative inline-block">
                      <img
                        src={previewLabel.photo}
                        alt="Foto prodotto"
                        className="w-32 h-32 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => setShowImageModal(true)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                        <span className="text-white text-xs">Clicca per ingrandire</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Dettagli Etichetta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nome Prodotto</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{previewLabel.productName}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Codice/Barcode</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{previewLabel.barcode || 'Non specificato'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Data Scadenza</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{previewLabel.expiryDate}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Numero Lotto</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{previewLabel.lotNumber || 'Non specificato'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Categoria</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">
                      {PRESET_CATEGORIES.find(c => c.id === previewLabel.category)?.name || 
                       labelGroups.find(g => g.id === previewLabel.category)?.name || 
                       'Non specificata'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Posizione</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{previewLabel.location || 'Non specificata'}</p>
                  </div>
                </div>
                
                {previewLabel.notes && (
                  <div>
                    <Label className="text-sm font-medium">Note</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{previewLabel.notes}</p>
                  </div>
                )}
                
                {/* Info Creazione */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <Label className="text-xs font-medium">Creata da</Label>
                      <p>{previewLabel.createdBy}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Data Creazione</Label>
                      <p>{new Date(previewLabel.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Azioni */}
                <div className="border-t pt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowLabelPreview(false)
                      setPreviewLabel(null)
                    }}
                    className="px-8"
                  >
                    Chiudi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Foto Ingrandita */}
      {showImageModal && previewLabel?.photo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-4xl p-4">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-white hover:bg-white hover:bg-opacity-20"
              onClick={() => setShowImageModal(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <img
              src={previewLabel.photo}
              alt="Foto prodotto ingrandita"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Modal Sposta Etichette nel Gruppo */}
      {showMoveToGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Sposta Etichette nel Gruppo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Seleziona il gruppo dove spostare le {selectedLabels.length} etichette selezionate:
                </p>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {labelGroups.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        Nessun gruppo disponibile.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Crea prima un gruppo per spostare le etichette.
                      </p>
                    </div>
                  ) : (
                    labelGroups.map(group => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          // Sposta le etichette selezionate nel gruppo
                          const updatedGroups = labelGroups.map(g => {
                            if (g.id === group.id) {
                              // Aggiungi le etichette selezionate al gruppo (evita duplicati)
                              const newLabelIds = [...new Set([...g.labelIds, ...selectedLabels])]
                              return {
                                ...g,
                                labelIds: newLabelIds,
                                labelCount: newLabelIds.length,
                                lastUpdate: new Date().toISOString()
                              }
                            } else {
                              // Rimuovi le etichette selezionate dagli altri gruppi
                              const filteredLabelIds = g.labelIds.filter(id => !selectedLabels.includes(id))
                              return {
                                ...g,
                                labelIds: filteredLabelIds,
                                labelCount: filteredLabelIds.length,
                                lastUpdate: filteredLabelIds.length !== g.labelIds.length ? new Date().toISOString() : g.lastUpdate
                              }
                            }
                          })
                          
                          saveLabelGroups(updatedGroups)
                          setSelectedLabels([])
                          setIsSelectionMode(false)
                          setShowMoveToGroupModal(false)
                        }}
                      >
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-xs text-gray-500">
                            {group.labelIds.length} etichette
                          </p>
                        </div>
                        <Folder className="h-4 w-4 text-gray-400" />
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMoveToGroupModal(false)
                    }}
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                  <Button
                    onClick={() => {
                      setShowMoveToGroupModal(false)
                      setShowCreateGroupModal(true)
                    }}
                    variant="default"
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuovo Gruppo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ProductLabels