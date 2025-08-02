import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Package, Plus, Search, Filter, Trash2, Edit, AlertTriangle, Calendar, Clock } from 'lucide-react'
import jsPDF from 'jspdf'

// Database prodotti italiani precaricati (per aggiunta rapida)
const DEFAULT_PRODUCTS = [
  // LATTICINI E FORMAGGI
  { id: 'prod_001', name: 'Mozzarella di Bufala', category: 'latticini', defaultLocation: 'Frigo A - Ripiano intermedio', allergens: ['latte'] },
  { id: 'prod_002', name: 'Parmigiano Reggiano', category: 'latticini', defaultLocation: 'Frigo A - Ripiano intermedio', allergens: ['latte'] },
  { id: 'prod_003', name: 'Burrata', category: 'latticini', defaultLocation: 'Frigo A - Ripiano intermedio', allergens: ['latte'] },
  { id: 'prod_018', name: 'Gorgonzola DOP', category: 'latticini', defaultLocation: 'Frigo A - Ripiano intermedio', allergens: ['latte'] },
  { id: 'prod_021', name: 'Ricotta Fresca', category: 'latticini', defaultLocation: 'Frigo A - Ripiano intermedio', allergens: ['latte'] },
  
  // CARNI E SALUMI
  { id: 'prod_007', name: 'Prosciutto Crudo', category: 'carni', defaultLocation: 'Frigo C - Ripiano inferiore', allergens: [] },
  { id: 'prod_031', name: 'Prosciutto Cotto', category: 'carni', defaultLocation: 'Frigo C - Ripiano inferiore', allergens: [] },
  { id: 'prod_032', name: 'Salame', category: 'carni', defaultLocation: 'Frigo C - Ripiano inferiore', allergens: [] },
  { id: 'prod_008', name: 'Bresaola', category: 'carni', defaultLocation: 'Frigo C - Ripiano inferiore', allergens: [] },
  { id: 'prod_014', name: 'Pancetta', category: 'carni', defaultLocation: 'Frigo C - Ripiano inferiore', allergens: [] },
  { id: 'prod_015', name: 'Speck', category: 'carni', defaultLocation: 'Frigo C - Ripiano inferiore', allergens: [] },
  { id: 'prod_020', name: 'Guanciale', category: 'carni', defaultLocation: 'Frigo C - Ripiano inferiore', allergens: [] },
  { id: 'prod_022', name: 'Carne di Manzo', category: 'carni', defaultLocation: 'Frigo C - Ripiano inferiore', allergens: [] },
  
  // VERDURE E ORTAGGI
  { id: 'prod_005', name: 'Basilico Fresco', category: 'verdure', defaultLocation: 'Frigo B - Cassetto verdure', allergens: [] },
  { id: 'prod_017', name: 'Rucola', category: 'verdure', defaultLocation: 'Frigo B - Cassetto verdure', allergens: [] },
  { id: 'prod_004', name: 'Pomodoro', category: 'verdure', defaultLocation: 'Frigo B - Cassetto verdure', allergens: [] },
  { id: 'prod_023', name: 'Zucchine', category: 'verdure', defaultLocation: 'Frigo B - Cassetto verdure', allergens: [] },
  { id: 'prod_024', name: 'Melanzane', category: 'verdure', defaultLocation: 'Frigo B - Cassetto verdure', allergens: [] },
  
  // FRUTTA
  { id: 'prod_025', name: 'Limoni', category: 'frutta', defaultLocation: 'Frigo B - Cassetto frutta', allergens: [] },
  { id: 'prod_026', name: 'Arance', category: 'frutta', defaultLocation: 'Frigo B - Cassetto frutta', allergens: [] },
  
  // PESCE E FRUTTI DI MARE
  { id: 'prod_011', name: 'Salmone', category: 'pesce', defaultLocation: 'Frigo Pesce - Ripiano inferiore', allergens: ['pesce'] },
  { id: 'prod_012', name: 'Vongole Veraci', category: 'pesce', defaultLocation: 'Frigo Pesce - Ripiano inferiore', allergens: ['molluschi'] },
  { id: 'prod_027', name: 'Branzino Fresco', category: 'pesce', defaultLocation: 'Frigo Pesce - Ripiano inferiore', allergens: ['pesce'] },
  
  // SURGELATI
  { id: 'prod_010', name: 'Gamberi Rossi Surgelati', category: 'surgelati', defaultLocation: 'Freezer A', allergens: ['crostacei'] },
  { id: 'prod_028', name: 'Spinaci Surgelati', category: 'surgelati', defaultLocation: 'Freezer A', allergens: [] },
  
  // DISPENSA SECCA
  { id: 'prod_009', name: 'Farina 00 Manitoba', category: 'dispensa', defaultLocation: 'Scaffale 3 - Dispensa', allergens: ['glutine'] },
  { id: 'prod_029', name: 'Pasta Spaghetti', category: 'dispensa', defaultLocation: 'Scaffale 3 - Dispensa', allergens: ['glutine'] },
  { id: 'prod_030', name: 'Riso Carnaroli', category: 'dispensa', defaultLocation: 'Scaffale 3 - Dispensa', allergens: [] },
  
  // CONDIMENTI
  { id: 'prod_006', name: "Olio Extra Vergine d'Oliva", category: 'condimenti', defaultLocation: 'Scaffale 2 - Condimenti', allergens: [] },
  { id: 'prod_016', name: 'Aceto Balsamico Modena', category: 'condimenti', defaultLocation: 'Scaffale 2 - Condimenti', allergens: ['solfiti'] },
  { id: 'prod_019', name: 'Pistacchi', category: 'condimenti', defaultLocation: 'Scaffale 4 - Frutta secca', allergens: ['frutta_guscio'] },
  
  // ALTRI
  { id: 'prod_013', name: 'Uova Bio Fresche', category: 'latticini', defaultLocation: 'Frigo A - Ripiano intermedio', allergens: ['uova'] }
]

// Lista allergeni standard EU
const ALLERGENS = [
  { id: 'glutine', name: 'Glutine', color: 'bg-red-100 text-red-800' },
  { id: 'crostacei', name: 'Crostacei', color: 'bg-orange-100 text-orange-800' },
  { id: 'uova', name: 'Uova', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'pesce', name: 'Pesce', color: 'bg-blue-100 text-blue-800' },
  { id: 'arachidi', name: 'Arachidi', color: 'bg-amber-100 text-amber-800' },
  { id: 'soia', name: 'Soia', color: 'bg-green-100 text-green-800' },
  { id: 'latte', name: 'Latte', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'frutta_guscio', name: 'Frutta a guscio', color: 'bg-purple-100 text-purple-800' },
  { id: 'sedano', name: 'Sedano', color: 'bg-lime-100 text-lime-800' },
  { id: 'senape', name: 'Senape', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'sesamo', name: 'Sesamo', color: 'bg-orange-100 text-orange-800' },
  { id: 'solfiti', name: 'Solfiti', color: 'bg-red-100 text-red-800' },
  { id: 'lupini', name: 'Lupini', color: 'bg-green-100 text-green-800' },
  { id: 'molluschi', name: 'Molluschi', color: 'bg-blue-100 text-blue-800' }
]

const CATEGORIES = [
  { id: 'latticini', name: 'Latticini e Formaggi', color: 'bg-blue-100 text-blue-800', temp: '4-5°C', storage: 'Ripiani intermedi frigo', description: 'Latte, formaggi freschi e stagionati' },
  { id: 'carni', name: 'Carni e Salumi', color: 'bg-red-100 text-red-800', temp: '2-4°C', storage: 'Ripiano inferiore frigo', description: 'Carni crude, salumi, pollame' },
  { id: 'verdure', name: 'Verdure e Ortaggi', color: 'bg-green-100 text-green-800', temp: '6-8°C', storage: 'Cassetto frutta/verdura', description: 'Verdure fresche, ortaggi, insalate' },
  { id: 'frutta', name: 'Frutta Fresca', color: 'bg-orange-100 text-orange-800', temp: '6-8°C', storage: 'Cassetto frutta/verdura', description: 'Frutta fresca di stagione' },
  { id: 'pesce', name: 'Pesce e Frutti di Mare', color: 'bg-cyan-100 text-cyan-800', temp: '1-3°C', storage: 'Ripiano inferiore frigo', description: 'Pesce fresco, molluschi, crostacei' },
  { id: 'surgelati', name: 'Surgelati', color: 'bg-indigo-100 text-indigo-800', temp: '-18°C', storage: 'Freezer', description: 'Tutti i prodotti surgelati' },
  { id: 'dispensa', name: 'Dispensa Secca', color: 'bg-yellow-100 text-yellow-800', temp: 'Ambiente', storage: 'Scaffali dispensa', description: 'Pasta, riso, farina, conserve' },
  { id: 'condimenti', name: 'Oli e Condimenti', color: 'bg-amber-100 text-amber-800', temp: 'Ambiente', storage: 'Scaffali condimenti', description: 'Oli, aceti, spezie, salse' }
]

function Inventory({ products = [], setProducts, currentUser, refrigerators = [] }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterExpiry, setFilterExpiry] = useState('')
  // Nuovi filtri per lotti e ordini
  const [filterLot, setFilterLot] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')
  const [filterOrderId, setFilterOrderId] = useState('')

  // Stati per menu a tendina fornitori
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false)
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('')
  const [suppliers, setSuppliers] = useState([])

  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [selectedForDeletion, setSelectedForDeletion] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [bulkSearchTerm, setBulkSearchTerm] = useState('')
  const [bulkFilterCategory, setBulkFilterCategory] = useState('')
  const [bulkFilterExpiry, setBulkFilterExpiry] = useState('')
  const [bulkFilterAllergen, setBulkFilterAllergen] = useState('')
  
  // Stati per sezione Ordini e Spesa
  const [shoppingItems, setShoppingItems] = useState([])
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [orderItems, setOrderItems] = useState([])
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderFormData, setOrderFormData] = useState({
    orderId: '',
    supplierName: '',
    orderDate: '',
    expectedDelivery: '',
    notes: ''
  })
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    expiryDate: '',
    location: '',
    allergens: [],
    notes: '',
    // Nuovi campi per gestione lotti e ordini
    lotNumber: '',
    batchDeliveryDate: '',
    associatedOrderId: '',
    supplierName: ''
  })

  // Save products to localStorage
  useEffect(() => {
    localStorage.setItem('haccp-products', JSON.stringify(products))
  }, [products])

  // Carica fornitori da localStorage
  useEffect(() => {
    const savedSuppliers = localStorage.getItem('haccp-suppliers')
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers))
    }
  }, [])

  // Chiudi dropdown fornitori quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSupplierDropdown && !event.target.closest('.supplier-dropdown')) {
        setShowSupplierDropdown(false)
        setSupplierSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSupplierDropdown])

  const getDefaultExpiryDate = (category) => {
    const today = new Date()
    let daysToAdd = 7
    
    switch(category) {
      case 'latticini': daysToAdd = 5; break
      case 'carni': daysToAdd = 3; break
      case 'verdure': daysToAdd = 7; break
      case 'frutta': daysToAdd = 7; break
      case 'pesce': daysToAdd = 2; break
      case 'surgelati': daysToAdd = 90; break
      case 'dispensa': daysToAdd = 365; break
      case 'condimenti': daysToAdd = 730; break
    }
    
    const expiryDate = new Date(today)
    expiryDate.setDate(today.getDate() + daysToAdd)
    return expiryDate.toISOString().split('T')[0]
  }

  const getExpiryStatus = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'expired', label: 'Scaduto', color: 'bg-red-100 text-red-800' }
    if (diffDays <= 3) return { status: 'critical', label: `${diffDays} giorni`, color: 'bg-red-100 text-red-800' }
    if (diffDays <= 7) return { status: 'warning', label: `${diffDays} giorni`, color: 'bg-yellow-100 text-yellow-800' }
    return { status: 'ok', label: `${diffDays} giorni`, color: 'bg-green-100 text-green-800' }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      expiryDate: '',
      location: '',
      allergens: [],
      notes: '',
      lotNumber: '',
      batchDeliveryDate: '',
      associatedOrderId: '',
      supplierName: ''
    })
    setEditingProduct(null)
    setShowAddForm(false)
  }

  // Funzione per trovare il frigorifero più appropriato per categoria
  const getAppropriateRefrigerator = (category) => {
    if (refrigerators.length === 0) return ''
    
    // Mappa categorie con temperature appropriate
    const categoryTempRanges = {
      'latticini': { min: 2, max: 8 }, // 4-5°C
      'carni': { min: 0, max: 6 }, // 2-4°C
      'verdure': { min: 4, max: 10 }, // 6-8°C
      'frutta': { min: 4, max: 10 }, // 6-8°C
      'pesce': { min: -2, max: 4 }, // 1-3°C
      'surgelati': { min: -25, max: -10 } // -18°C
    }
    
    const tempRange = categoryTempRanges[category]
    if (!tempRange) return refrigerators[0]?.name || ''
    
    // Trova il frigorifero con temperatura più vicina al range ideale
    const appropriateRefrigerator = refrigerators.find(ref => {
      const setTemp = ref.setTemperature
      return setTemp >= tempRange.min && setTemp <= tempRange.max
    })
    
    // Se non trova un frigorifero appropriato, usa il primo disponibile
    return appropriateRefrigerator?.name || refrigerators[0]?.name || ''
  }

  const handleQuickAdd = (defaultProduct) => {
    const appropriateLocation = getAppropriateRefrigerator(defaultProduct.category)
    
    setFormData({
      name: defaultProduct.name,
      category: defaultProduct.category,
      expiryDate: getDefaultExpiryDate(defaultProduct.category),
      location: appropriateLocation,
      allergens: [...defaultProduct.allergens],
      notes: ''
    })
    setShowAddForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.expiryDate || !formData.location.trim()) return

    if (editingProduct) {
      const updatedProducts = products.map(product =>
        product.id === editingProduct.id
          ? { ...product, ...formData, updatedAt: new Date().toISOString() }
          : product
      )
      setProducts(updatedProducts)
    } else {
      const newProduct = {
        id: `prod_${Date.now()}`,
        ...formData,
        addedBy: currentUser?.id,
        addedByName: currentUser?.name,
        createdAt: new Date().toISOString(),
        status: 'active'
      }
      setProducts([...products, newProduct])
    }

    resetForm()
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      expiryDate: product.expiryDate,
      location: product.location,
      allergens: product.allergens || [],
      notes: product.notes || '',
      lotNumber: product.lotNumber || '',
      batchDeliveryDate: product.batchDeliveryDate || '',
      associatedOrderId: product.associatedOrderId || '',
      supplierName: product.supplierName || ''
    })
    setEditingProduct(product)
    setShowAddForm(true)
  }

  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id))
  }

  const toggleAllergen = (allergenId) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergenId)
        ? prev.allergens.filter(id => id !== allergenId)
        : [...prev.allergens, allergenId]
    }))
  }

  const toggleProductSelection = (productId) => {
    setSelectedForDeletion(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const deleteSelectedProducts = () => {
    setProducts(products.filter(product => !selectedForDeletion.includes(product.id)))
    setSelectedForDeletion([])
    setShowBulkDelete(false)
  }

  const clearAllInventory = () => {
    setProducts([])
    setShowDeleteConfirm(false)
  }
  const generateShoppingListPDF = () => {
  const doc = new jsPDF()
  
  // Titolo
  doc.setFontSize(20)
  doc.text('Lista della Spesa', 20, 30)
  
  // Data e utente
	doc.setFontSize(12)
	doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 20, 45)
	doc.text(`Generato da: ${currentUser?.name || 'N/A'} (${currentUser?.role === 'admin' ? 'Amministratore' : 'Dipendente'})`, 20, 57)
  
  // Prodotti selezionati
  const selectedProducts = products.filter(product => shoppingItems.includes(product.id))
  
  if (selectedProducts.length === 0) {
    doc.text('Nessun prodotto selezionato', 20, 60)
  } else {
    doc.text(`Prodotti finiti (${selectedProducts.length}):`, 20, 72)
    
    let yPosition = 87
    selectedProducts.forEach((product, index) => {
      const category = CATEGORIES.find(c => c.id === product.category)
      doc.text(`${index + 1}. ${product.name}`, 25, yPosition)
      doc.setFontSize(10)
      doc.text(`   Categoria: ${category?.name || 'N/A'} | Posizione: ${product.location}`, 25, yPosition + 8)
      doc.setFontSize(12)
      yPosition += 20
      
      // Nuova pagina se necessario
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 30
      }
    })
  }
  
  // Download
  doc.save(`lista-spesa-${new Date().toISOString().split('T')[0]}.pdf`)
  
  // Chiudi modal dopo download
  setShowShoppingList(false)
  setShoppingItems([])
}

// Funzioni per gestione Ordini e Spesa
const toggleShoppingItem = (productId) => {
  setShoppingItems(prev => 
    prev.includes(productId) 
      ? prev.filter(id => id !== productId)
      : [...prev, productId]
  )
}

const toggleOrderItem = (productId) => {
  setOrderItems(prev => 
    prev.includes(productId) 
      ? prev.filter(id => id !== productId)
      : [...prev, productId]
  )
}

const handleOrderSubmit = (e) => {
  e.preventDefault()
  
  const selectedProducts = products.filter(product => orderItems.includes(product.id))
  
  // Aggiorna i prodotti con le informazioni dell'ordine
  const updatedProducts = products.map(product => {
    if (orderItems.includes(product.id)) {
      return {
        ...product,
        associatedOrderId: orderFormData.orderId,
        supplierName: orderFormData.supplierName,
        batchDeliveryDate: orderFormData.expectedDelivery,
        lotNumber: `L${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${Math.random().toString(36).substr(2, 3).toUpperCase()}`
      }
    }
    return product
  })
  
  setProducts(updatedProducts)
  setOrderItems([])
  setShowOrderForm(false)
  setOrderFormData({
    orderId: '',
    supplierName: '',
    orderDate: '',
    expectedDelivery: '',
    notes: ''
  })
}
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || (
      product.name.toLowerCase().includes(searchLower) ||
      CATEGORIES.find(c => c.id === product.category)?.name.toLowerCase().includes(searchLower) ||
      (product.allergens && product.allergens.some(allergen => 
        ALLERGENS.find(a => a.id === allergen)?.name.toLowerCase().includes(searchLower)
      )) ||
      (product.location && product.location.toLowerCase().includes(searchLower))
    )
    
    const matchesCategory = !filterCategory || product.category === filterCategory
    const matchesExpiry = !filterExpiry || getExpiryStatus(product.expiryDate).status === filterExpiry
    return matchesSearch && matchesCategory && matchesExpiry
  })

  const stats = {
    total: products.length,
    expired: products.filter(p => getExpiryStatus(p.expiryDate).status === 'expired').length,
    warning: products.filter(p => getExpiryStatus(p.expiryDate).status === 'warning').length,
    byCategory: products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {})
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-600">Totale Prodotti</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                <p className="text-sm text-gray-600">Scaduti</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
                <p className="text-sm text-gray-600">In Scadenza</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold text-green-600">{stats.byCategory.latticini || 0}</p>
                <p className="text-sm text-gray-600">Latticini</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestione Inventario */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gestione Inventario
            </CardTitle>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Prodotto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cerca per nome, categoria, allergene o posizione..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Tutte le categorie</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={filterExpiry}
              onChange={(e) => setFilterExpiry(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Tutte le scadenze</option>
              <option value="expired">Scaduti</option>
              <option value="critical">Critici (≤3 giorni)</option>
              <option value="warning">In scadenza (≤7 giorni)</option>
              <option value="ok">OK (&gt;7 giorni)</option>
            </select>
          </div>
          
          {/* Nuovi filtri per Lotti e Ordini */}
          {/* Nuovi filtri per Lotti e Ordini */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded">
            <div>
              <Label>🏷️ Filtra per Lotto</Label>
              <Input
                placeholder="Numero lotto..."
                value={filterLot}
                onChange={(e) => setFilterLot(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Label>🏪 Filtra per Fornitore</Label>
              <Input
                placeholder="Nome fornitore..."
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
                              <Label>📋 Filtra per Fattura/DDT</Label>
              <Input
                placeholder="Fattura N° / DDT N°"
                value={filterOrderId}
                onChange={(e) => setFilterOrderId(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form aggiunta/modifica prodotto */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? 'Modifica Prodotto' : 'Aggiungi Nuovo Prodotto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Prodotto *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Es. Mozzarella di Bufala"
                    required
                  />
                </div>
                <div>
                  <Label>Categoria *</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Data Scadenza *</Label>
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Posizione *</Label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                    disabled={refrigerators.length === 0}
                  >
                    <option value="">
                      {refrigerators.length > 0 
                        ? 'Seleziona un frigorifero' 
                        : 'Nessun frigorifero registrato - Aggiungi prima un frigorifero'
                      }
                    </option>
                    {refrigerators.map(refrigerator => (
                      <option key={refrigerator.id} value={refrigerator.name}>
                        {refrigerator.name} - {refrigerator.location || 'Posizione non specificata'}
                      </option>
                    ))}
                  </select>
                  {refrigerators.length === 0 && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ Devi prima registrare almeno un frigorifero nella sezione "Frigoriferi e Freezer"
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Allergeni</Label>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mt-2">
                  {ALLERGENS.map(allergen => (
                    <button
                      key={allergen.id}
                      type="button"
                      onClick={() => toggleAllergen(allergen.id)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        formData.allergens.includes(allergen.id)
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
                <Label>Note</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Note aggiuntive..."
                />
              </div>

              {/* Sezione Gestione Lotti e Ordini */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">📦 Gestione Lotti e Ordini</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Numero Lotto</Label>
                    <Input
                      value={formData.lotNumber}
                      onChange={(e) => setFormData({...formData, lotNumber: e.target.value})}
                      placeholder="es. L240315A"
                    />
                  </div>
                  <div>
                    <Label>Data Consegna Lotto</Label>
                    <Input
                      type="date"
                      value={formData.batchDeliveryDate}
                      onChange={(e) => setFormData({...formData, batchDeliveryDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>ID Ordine Associato</Label>
                    <Input
                      value={formData.associatedOrderId}
                      onChange={(e) => setFormData({...formData, associatedOrderId: e.target.value})}
                      placeholder="Collegamento a ordine/fattura"
                    />
                  </div>
                  <div className="relative">
                    <Label>Nome Fornitore</Label>
                    <div className="relative">
                      <Input
                        value={formData.supplierName}
                        onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                        onFocus={() => setShowSupplierDropdown(true)}
                        placeholder="Cerca o digita nome fornitore..."
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Dropdown Fornitori */}
                    {showSupplierDropdown && (
                      <div className="supplier-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {/* Barra di ricerca fornitori */}
                        <div className="p-2 border-b">
                          <Input
                            placeholder="Cerca fornitori..."
                            value={supplierSearchTerm}
                            onChange={(e) => setSupplierSearchTerm(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        
                        {/* Lista fornitori */}
                        <div className="py-1">
                          {suppliers
                            .filter(supplier => 
                              supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
                              (supplier.piva && supplier.piva.toLowerCase().includes(supplierSearchTerm.toLowerCase()))
                            )
                            .map(supplier => (
                              <button
                                key={supplier.id}
                                type="button"
                                onClick={() => {
                                  setFormData({...formData, supplierName: supplier.name})
                                  setShowSupplierDropdown(false)
                                  setSupplierSearchTerm('')
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              >
                                <div className="font-medium">{supplier.name}</div>
                                {supplier.piva && (
                                  <div className="text-xs text-gray-500">P.IVA: {supplier.piva}</div>
                                )}
                              </button>
                            ))}
                          
                          {suppliers.filter(supplier => 
                            supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
                            (supplier.piva && supplier.piva.toLowerCase().includes(supplierSearchTerm.toLowerCase()))
                          ).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              Nessun fornitore trovato
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingProduct ? 'Aggiorna' : 'Aggiungi'} Prodotto
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Ordini e Spesa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ordini e Spesa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lista della Spesa */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">🛒 Lista della Spesa</h3>
                <Button 
                  onClick={() => setShowShoppingList(true)}
                  disabled={shoppingItems.length === 0}
                  size="sm"
                  variant="outline"
                >
                  📄 Genera PDF
                </Button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">Nessun prodotto disponibile per la lista della spesa</p>
                    <p className="text-xs">Aggiungi prodotti all'inventario per iniziare</p>
                  </div>
                ) : (
                  filteredProducts.map(product => {
                    const isSelected = shoppingItems.includes(product.id)
                    return (
                      <div key={product.id} className="flex items-center p-2 border rounded hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleShoppingItem(product.id)}
                          className="mr-3 w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.location}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                Prodotti selezionati: {shoppingItems.length}
              </div>
            </div>

            {/* Gestione Ordini */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">📋 Gestione Ordini</h3>
                <Button 
                  onClick={() => setShowOrderForm(true)}
                  disabled={orderItems.length === 0}
                  size="sm"
                  variant="outline"
                >
                  📝 Crea Ordine
                </Button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">Nessun prodotto disponibile per gli ordini</p>
                    <p className="text-xs">Aggiungi prodotti all'inventario per iniziare</p>
                  </div>
                ) : (
                  filteredProducts.map(product => {
                    const isSelected = orderItems.includes(product.id)
                    return (
                      <div key={product.id} className="flex items-center p-2 border rounded hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOrderItem(product.id)}
                          className="mr-3 w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.location}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                Prodotti selezionati: {orderItems.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorie di Prodotti */}
      {!showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Categorie di Prodotti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {CATEGORIES.map(category => {
                const categoryProducts = DEFAULT_PRODUCTS.filter(p => p.category === category.id)
                return (
                  <div key={category.id} className="space-y-2">
                    <button 
                      onClick={() => setFilterCategory(filterCategory === category.id ? '' : category.id)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                        filterCategory === category.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`inline-flex px-2 py-1 text-xs rounded-full ${category.color} mb-2`}>
                        {category.name}
                      </div>
                      <div className="text-sm font-medium">{category.temp}</div>
                      <div className="text-xs text-gray-600">{category.storage}</div>
                      <div className="text-xs text-gray-500 mt-1">{categoryProducts.length} prodotti</div>
                    </button>
                  </div>
                )
              })}
            </div>

            {filterCategory && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">
                  Prodotti {CATEGORIES.find(c => c.id === filterCategory)?.name}:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {DEFAULT_PRODUCTS
                    .filter(product => product.category === filterCategory)
                    .map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleQuickAdd(product)}
                      className="p-3 text-left bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-green-900">{product.name}</div>
                          <div className="text-xs text-green-700 mt-1">
                            {refrigerators.length > 0 
                              ? getAppropriateRefrigerator(product.category) 
                              : 'Nessun frigorifero registrato'
                            }
                          </div>
                          {product.allergens.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.allergens.map(allergen => {
                                const allergenInfo = ALLERGENS.find(a => a.id === allergen)
                                return (
                                  <span key={allergen} className={`px-1 py-0.5 text-xs rounded ${allergenInfo?.color}`}>
                                    {allergenInfo?.name}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <Plus className="h-4 w-4 text-green-600 group-hover:text-green-800" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!filterCategory && (
              <div className="text-center py-6 text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Seleziona una categoria sopra per vedere i prodotti disponibili</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Prodotti nell'inventario */}
      <Card>
        <CardHeader>
	<div className="flex justify-between items-center">
	  <CardTitle>Prodotti nell'inventario ({filteredProducts.length})</CardTitle>
	  <div className="flex gap-2">
		{products.length > 0 && (
		  <>

			<Button 
			  onClick={() => setShowBulkDelete(true)}
			  className="flex items-center gap-2"
			  variant="outline"
			>
			  🗑️ Rimuovi Prodotti
			</Button>
			<Button 
			  onClick={() => setShowDeleteConfirm(true)}
			  className="flex items-center gap-2"
			  variant="destructive"
			>
			  ❌ Cancella Tutto l'Inventario
			</Button>
		  </>
		)}
	  </div>
	</div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">
                {products.length === 0 
                  ? "Inventario vuoto. Inizia aggiungendo prodotti con i pulsanti categoria sopra!"
                  : "Nessun prodotto trovato con i filtri attuali"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map(product => {
                const category = CATEGORIES.find(c => c.id === product.category)
                const expiryStatus = getExpiryStatus(product.expiryDate)
                
                return (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{product.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${category?.color}`}>
                            {category?.name}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${expiryStatus.color}`}>
                            {expiryStatus.label}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>📍 {product.location}</div>
                          <div>📅 Scade: {new Date(product.expiryDate).toLocaleDateString('it-IT')}</div>
                          
                          {/* Informazioni Lotto e Ordine */}
                          <div className="flex flex-wrap gap-4 mt-2 pt-2 border-t border-gray-100">
                            {product.lotNumber && (
                              <div className="flex items-center gap-1">
                                <span className="text-blue-600">🏷️</span>
                                <span className="font-medium">Lotto:</span>
                                <span>{product.lotNumber}</span>
                              </div>
                            )}
                            {product.batchDeliveryDate && (
                              <div className="flex items-center gap-1">
                                <span className="text-green-600">📦</span>
                                <span className="font-medium">Consegna:</span>
                                <span>{new Date(product.batchDeliveryDate).toLocaleDateString('it-IT')}</span>
                              </div>
                            )}
                            {product.supplierName && (
                              <div className="flex items-center gap-1">
                                <span className="text-purple-600">🏪</span>
                                <span className="font-medium">Fornitore:</span>
                                <span>{product.supplierName}</span>
                              </div>
                            )}
                            {product.associatedOrderId && (
                              <div className="flex items-center gap-1">
                                <span className="text-orange-600">📋</span>
                                <span className="font-medium">Fattura:</span>
                                <span>{product.associatedOrderId}</span>
                              </div>
                            )}
                          </div>
                          
                          {product.allergens && product.allergens.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              <span>🚨</span>
                              {product.allergens.map(allergen => {
                                const allergenInfo = ALLERGENS.find(a => a.id === allergen)
                                return (
                                  <span key={allergen} className={`px-2 py-1 text-xs rounded ${allergenInfo?.color}`}>
                                    {allergenInfo?.name}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                          {product.addedByName && (
                            <div className="text-xs text-gray-500">
                              Aggiunto da: {product.addedByName} • {new Date(product.createdAt).toLocaleDateString('it-IT')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>


	        {/* Modal Rimozione Multipla */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">🗑️ Rimuovi Prodotti</h2>
              <Button onClick={() => {
				  setShowBulkDelete(false);
				  setBulkSearchTerm('');
				  setBulkFilterCategory('');
				  setBulkFilterExpiry('');
				  setBulkFilterAllergen('');
				}} variant="outline" size="sm">✕ Chiudi</Button>
            </div>
            
            <div className="mb-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cerca prodotti da rimuovere..."
                  value={bulkSearchTerm}
                  onChange={(e) => setBulkSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select
                  value={bulkFilterCategory}
                  onChange={(e) => setBulkFilterCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Tutte le categorie</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                
                <select
                  value={bulkFilterExpiry}
                  onChange={(e) => setBulkFilterExpiry(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Tutte le scadenze</option>
                  <option value="expired">Scaduti</option>
                  <option value="critical">Critici (≤3 giorni)</option>
                  <option value="warning">In scadenza (≤7 giorni)</option>
                  <option value="ok">OK (&gt;7 giorni)</option>
                </select>
                
                <select
                  value={bulkFilterAllergen}
                  onChange={(e) => setBulkFilterAllergen(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Tutti gli allergeni</option>
                  {ALLERGENS.map(allergen => (
                    <option key={allergen.id} value={allergen.id}>{allergen.name}</option>
                  ))}
                </select>
              </div>
              
              <p className="text-gray-600 mb-4">Seleziona i prodotti da rimuovere dall'inventario:</p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredProducts.filter(product => {
                  // Filtro ricerca
                  const matchesSearch = !bulkSearchTerm || 
                    product.name.toLowerCase().includes(bulkSearchTerm.toLowerCase()) ||
                    product.location?.toLowerCase().includes(bulkSearchTerm.toLowerCase()) ||
                    CATEGORIES.find(c => c.id === product.category)?.name.toLowerCase().includes(bulkSearchTerm.toLowerCase());
                  
                  // Filtro categoria
                  const matchesCategory = !bulkFilterCategory || product.category === bulkFilterCategory;
                  
                  // Filtro scadenza
                  let matchesExpiry = true;
                  if (bulkFilterExpiry) {
                    const expiryStatus = getExpiryStatus(product.expiryDate);
                    matchesExpiry = expiryStatus.status === bulkFilterExpiry;
                  }
                  
                  // Filtro allergeni
                  const matchesAllergen = !bulkFilterAllergen || 
                    (product.allergens && product.allergens.includes(bulkFilterAllergen));
                  
                  return matchesSearch && matchesCategory && matchesExpiry && matchesAllergen;
                }).map(product => {
                  const isSelected = selectedForDeletion.includes(product.id)
                  return (
                    <div key={product.id} className="flex items-center p-2 border rounded">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProductSelection(product.id)}
                        className="mr-3 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.location}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={deleteSelectedProducts}
                disabled={selectedForDeletion.length === 0}
                variant="destructive"
              >
                🗑️ Rimuovi Selezionati ({selectedForDeletion.length})
              </Button>
              <Button onClick={() => {
				  setShowBulkDelete(false);
				  setBulkSearchTerm('');
				  setBulkFilterCategory('');
				  setBulkFilterExpiry('');
				  setBulkFilterAllergen('');
				}} variant="outline" size="sm">✕ Chiudi</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Conferma Cancellazione Totale */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Conferma Cancellazione</h2>
            <p className="text-gray-700 mb-6">
              Sei sicuro di voler <strong>cancellare tutto l'inventario</strong>? 
              Questa operazione cancellerà <strong>tutti gli ingredienti registrati nell'app</strong> 
               e <strong>non può essere annullata</strong>.
            </p>
            <div className="flex gap-3">
              <Button onClick={clearAllInventory} variant="destructive">
                ❌ Sì, Cancella Tutto
              </Button>
              <Button onClick={() => setShowDeleteConfirm(false)} variant="outline">
                Annulla
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lista della Spesa */}
      {showShoppingList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">🛒 Lista della Spesa</h2>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Prodotti selezionati per la lista della spesa ({shoppingItems.length}):
              </p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {products.filter(product => shoppingItems.includes(product.id)).map(product => {
                  const category = CATEGORIES.find(c => c.id === product.category)
                  return (
                    <div key={product.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            {category?.name} • {product.location}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${category?.color}`}>
                          {category?.name}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={generateShoppingListPDF} className="flex-1">
                📄 Genera PDF
              </Button>
              <Button 
                onClick={() => {
                  setShowShoppingList(false)
                  setShoppingItems([])
                }} 
                variant="outline"
              >
                Annulla
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gestione Ordini */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">📋 Crea Nuovo Ordine</h2>
            
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Numero Ordine *</Label>
                  <Input
                    value={orderFormData.orderId}
                    onChange={(e) => setOrderFormData({...orderFormData, orderId: e.target.value})}
                    placeholder="es. ORD-2024-001"
                    required
                  />
                </div>
                
                <div>
                  <Label>Fornitore *</Label>
                  <Input
                    value={orderFormData.supplierName}
                    onChange={(e) => setOrderFormData({...orderFormData, supplierName: e.target.value})}
                    placeholder="es. Fornitore ABC"
                    required
                  />
                </div>
                
                <div>
                  <Label>Data Ordine *</Label>
                  <Input
                    type="date"
                    value={orderFormData.orderDate}
                    onChange={(e) => setOrderFormData({...orderFormData, orderDate: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label>Data Consegna Prevista *</Label>
                  <Input
                    type="date"
                    value={orderFormData.expectedDelivery}
                    onChange={(e) => setOrderFormData({...orderFormData, expectedDelivery: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label>Note</Label>
                <Input
                  value={orderFormData.notes}
                  onChange={(e) => setOrderFormData({...orderFormData, notes: e.target.value})}
                  placeholder="Note aggiuntive sull'ordine..."
                />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Prodotti selezionati ({orderItems.length}):</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {products.filter(product => orderItems.includes(product.id)).map(product => {
                    const category = CATEGORIES.find(c => c.id === product.category)
                    return (
                      <div key={product.id} className="p-2 border rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-gray-600">{product.location}</div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${category?.color}`}>
                            {category?.name}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  📝 Crea Ordine
                </Button>
                <Button 
                  onClick={() => {
                    setShowOrderForm(false)
                    setOrderItems([])
                    setOrderFormData({
                      orderId: '',
                      supplierName: '',
                      orderDate: '',
                      expectedDelivery: '',
                      notes: ''
                    })
                  }} 
                  variant="outline"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default Inventory