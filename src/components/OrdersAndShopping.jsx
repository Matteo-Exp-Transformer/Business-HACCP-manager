import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Package, Plus, Search, Filter, Trash2, Edit, AlertTriangle, Calendar, Clock, ShoppingCart, FileText, CheckCircle, XCircle } from 'lucide-react'
import { checkPDFLibraries, createPDFDocument, downloadPDF } from '../utils/pdfUtils'

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
  { id: 'latticini', name: 'Latticini e Formaggi', color: 'bg-blue-100 text-blue-800' },
  { id: 'carni', name: 'Carni e Salumi', color: 'bg-red-100 text-red-800' },
  { id: 'verdure', name: 'Verdure e Ortaggi', color: 'bg-green-100 text-green-800' },
  { id: 'frutta', name: 'Frutta Fresca', color: 'bg-orange-100 text-orange-800' },
  { id: 'pesce', name: 'Pesce e Frutti di Mare', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'surgelati', name: 'Surgelati', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'dispensa', name: 'Dispensa Secca', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'condimenti', name: 'Oli e Condimenti', color: 'bg-amber-100 text-amber-800' }
]

function OrdersAndShopping({ products = [], setProducts, currentUser }) {
  // Stati per Lista della Spesa
  const [shoppingItems, setShoppingItems] = useState([])
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterExpiry, setFilterExpiry] = useState('')
  const [filterAllergen, setFilterAllergen] = useState('')
  const [sortBy, setSortBy] = useState('name') // 'name', 'category', 'expiry'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc', 'desc'

  // Stati per Gestione Ordini
  const [orders, setOrders] = useState([])
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [orderFormData, setOrderFormData] = useState({
    orderId: '',
    supplierName: '',
    orderDate: '',
    deliveredDate: '',
    paymentDueDate: '',
    invoiceDdtNumber: '',
    totalBoxes: '',
    totalProducts: '',
    notes: '',
    products: []
  })

  // Carica ordini da localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('haccp-orders')
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
  }, [])

  // Salva ordini in localStorage
  useEffect(() => {
    localStorage.setItem('haccp-orders', JSON.stringify(orders))
  }, [orders])

  // Filtra prodotti per ricerca avanzata
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
    const matchesAllergen = !filterAllergen || (product.allergens && product.allergens.includes(filterAllergen))
    
    return matchesSearch && matchesCategory && matchesExpiry && matchesAllergen
  })

  // Ordina prodotti
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue, bValue
    
    switch(sortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'category':
        aValue = CATEGORIES.find(c => c.id === a.category)?.name || ''
        bValue = CATEGORIES.find(c => c.id === b.category)?.name || ''
        break
      case 'expiry':
        aValue = new Date(a.expiryDate)
        bValue = new Date(b.expiryDate)
        break
      default:
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Funzioni per Lista della Spesa
  const toggleShoppingItem = (productId) => {
    setShoppingItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const generateShoppingListPDF = () => {
    // Check if PDF libraries are loaded
    if (!checkPDFLibraries()) {
      alert("Errore: Librerie PDF non caricate. Ricarica la pagina e riprova.")
      return
    }

    try {
      const doc = createPDFDocument()
      
      // Titolo
      doc.setFontSize(20)
      doc.text('Lista della Spesa', 105, 20, { align: 'center' })
      
      // Data e utente
      doc.setFontSize(12)
      doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 20, 35)
      doc.text(`Generato da: ${currentUser?.name || 'N/A'}`, 20, 45)
      
      // Prodotti selezionati
      const selectedProducts = products.filter(product => shoppingItems.includes(product.id))
      
      if (selectedProducts.length === 0) {
        doc.text('Nessun prodotto selezionato', 20, 60)
      } else {
        // Raggruppa per categoria
        const groupedProducts = {}
        selectedProducts.forEach(product => {
          const category = CATEGORIES.find(c => c.id === product.category)?.name || 'Altri'
          if (!groupedProducts[category]) {
            groupedProducts[category] = []
          }
          groupedProducts[category].push(product)
        })
        
        let yPosition = 60
        Object.entries(groupedProducts).forEach(([category, products]) => {
          // Categoria
          doc.setFontSize(14)
          doc.text(category, 20, yPosition)
          yPosition += 10
          
          // Prodotti della categoria
          doc.setFontSize(12)
          products.forEach(product => {
            doc.text(`• ${product.name}`, 25, yPosition)
            if (product.location) {
              doc.setFontSize(10)
              doc.text(`  Posizione: ${product.location}`, 30, yPosition + 5)
              doc.setFontSize(12)
              yPosition += 10
            } else {
              yPosition += 7
            }
            
            // Nuova pagina se necessario
            if (yPosition > 250) {
              doc.addPage()
              yPosition = 30
            }
          })
          
          yPosition += 5
        })
      }
      
      // Download
      const fileName = `lista-spesa-${new Date().toISOString().split('T')[0]}.pdf`
      const success = downloadPDF(doc, fileName)
      
      if (success) {
        // Incrementa il contatore delle liste generate
        const currentCount = parseInt(localStorage.getItem('haccp-shopping-lists-count') || '0')
        localStorage.setItem('haccp-shopping-lists-count', (currentCount + 1).toString())
        
        // Chiudi modal
        setShowShoppingList(false)
        setShoppingItems([])
      } else {
        alert("Errore durante il download del PDF. Riprova.")
      }
    } catch (error) {
      console.error('PDF export error:', error)
      alert("Errore durante l'esportazione del PDF. Riprova.")
    }
  }

  // Funzioni per Gestione Ordini
  const handleOrderSubmit = (e) => {
    e.preventDefault()
    
    const newOrder = {
      id: editingOrder ? editingOrder.id : `order_${Date.now()}`,
      ...orderFormData,
      createdAt: editingOrder ? editingOrder.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'N/A'
    }
    
    if (editingOrder) {
      setOrders(prev => prev.map(order => order.id === editingOrder.id ? newOrder : order))
    } else {
      setOrders(prev => [...prev, newOrder])
    }
    
    setShowOrderForm(false)
    setEditingOrder(null)
    setOrderFormData({
      orderId: '',
      supplierName: '',
      orderDate: '',
      deliveredDate: '',
      paymentDueDate: '',
      invoiceDdtNumber: '',
      totalBoxes: '',
      totalProducts: '',
      notes: '',
      products: []
    })
  }

  const deleteOrder = (orderId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo ordine?')) {
      setOrders(prev => prev.filter(order => order.id !== orderId))
    }
  }

  const editOrder = (order) => {
    setEditingOrder(order)
    setOrderFormData({
      orderId: order.orderId,
      supplierName: order.supplierName,
      orderDate: order.orderDate,
      deliveredDate: order.deliveredDate || order.expectedDelivery || '',
      paymentDueDate: order.paymentDueDate || '',
      invoiceDdtNumber: order.invoiceDdtNumber || order.invoiceNumber || order.ddtNumber || '',
      totalBoxes: order.totalBoxes,
      totalProducts: order.totalProducts,
      notes: order.notes,
      products: order.products
    })
    setShowOrderForm(true)
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

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prodotti Totali</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lista Spesa</p>
                <p className="text-2xl font-bold">{shoppingItems.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ordini Attivi</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Scadenza</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => getExpiryStatus(p.expiryDate).status === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista della Spesa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Lista della Spesa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtri avanzati */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <Label>Ricerca</Label>
              <Input
                placeholder="Cerca prodotti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Categoria</Label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="">Tutte le categorie</option>
                {CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label>Scadenza</Label>
              <select
                value={filterExpiry}
                onChange={(e) => setFilterExpiry(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="">Tutte le scadenze</option>
                                  <option value="critical">In scadenza (&le;3 giorni)</option>
                  <option value="warning">Attenzione (&le;7 giorni)</option>
                  <option value="ok">OK (&gt;7 giorni)</option>
                <option value="expired">Scaduti</option>
              </select>
            </div>
            
            <div>
              <Label>Allergene</Label>
              <select
                value={filterAllergen}
                onChange={(e) => setFilterAllergen(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="">Tutti gli allergeni</option>
                {ALLERGENS.map(allergen => (
                  <option key={allergen.id} value={allergen.id}>
                    {allergen.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ordinamento */}
          <div className="flex items-center gap-4 mb-4">
            <Label>Ordina per:</Label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border rounded-md"
            >
              <option value="name">Nome</option>
              <option value="category">Categoria</option>
              <option value="expiry">Scadenza</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>

          {/* Lista prodotti */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Nessun prodotto trovato</p>
                <p className="text-sm">Prova a modificare i filtri di ricerca</p>
              </div>
            ) : (
              sortedProducts.map(product => {
                const isSelected = shoppingItems.includes(product.id)
                const category = CATEGORIES.find(c => c.id === product.category)
                const expiryStatus = getExpiryStatus(product.expiryDate)
                
                return (
                  <div key={product.id} className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-green-50 border-green-200' : ''
                  }`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleShoppingItem(product.id)}
                      className="mr-3 w-4 h-4"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.name}</span>
                        {category && (
                          <span className={`px-2 py-1 text-xs rounded-full ${category.color}`}>
                            {category.name}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${expiryStatus.color}`}>
                          {expiryStatus.label}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        {product.location && `📍 ${product.location}`}
                        {product.allergens && product.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
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
                    </div>
                    
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Azioni */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Prodotti selezionati: {shoppingItems.length}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShoppingItems([])}
                variant="outline"
                size="sm"
                disabled={shoppingItems.length === 0}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Deseleziona Tutti
              </Button>
              
              <Button
                onClick={() => setShowShoppingList(true)}
                disabled={shoppingItems.length === 0}
                size="sm"
              >
                <FileText className="h-4 w-4 mr-1" />
                Genera PDF ({shoppingItems.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestione Ordini */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gestione Ordini
            </CardTitle>
            <Button onClick={() => setShowOrderForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Nuovo Ordine
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Nessun ordine registrato</p>
              <p className="text-sm">Clicca "Nuovo Ordine" per iniziare</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">Ordine #{order.orderId}</h3>
                      <p className="text-sm text-gray-600">{order.supplierName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => editOrder(order)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteOrder(order.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Data Ordine:</span>
                      <p>{new Date(order.orderDate).toLocaleDateString('it-IT')}</p>
                    </div>
                                         <div>
                       <span className="font-medium">Consegnato il:</span>
                       <p>{order.deliveredDate ? new Date(order.deliveredDate).toLocaleDateString('it-IT') : 'N/A'}</p>
                     </div>
                                         <div>
                       <span className="font-medium">N° Fattura / N° DDT:</span>
                       <p>{order.invoiceDdtNumber || order.invoiceNumber || order.ddtNumber || 'N/A'}</p>
                     </div>
                    <div>
                      <span className="font-medium">Colli:</span>
                      <p>{order.totalBoxes || 'N/A'}</p>
                    </div>
                                         <div>
                       <span className="font-medium">Prodotti:</span>
                       <p>{order.totalProducts || 'N/A'}</p>
                     </div>
                     {order.paymentDueDate && (
                       <div>
                         <span className="font-medium">Scadenza Pagamento:</span>
                         <p>{new Date(order.paymentDueDate).toLocaleDateString('it-IT')}</p>
                       </div>
                     )}
                  </div>
                  
                  {order.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <span className="font-medium text-sm">Note:</span>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Lista Spesa PDF */}
      {showShoppingList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Genera Lista della Spesa</h3>
            <p className="text-gray-600 mb-6">
              Verrà generato un PDF con {shoppingItems.length} prodotti selezionati.
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={generateShoppingListPDF}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-1" />
                Genera PDF
              </Button>
              <Button
                onClick={() => setShowShoppingList(false)}
                variant="outline"
              >
                Annulla
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Ordine */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingOrder ? 'Modifica Ordine' : 'Nuovo Ordine'}
            </h3>
            
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>N° Ordine *</Label>
                  <Input
                    value={orderFormData.orderId}
                    onChange={(e) => setOrderFormData({...orderFormData, orderId: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label>Fornitore *</Label>
                  <Input
                    value={orderFormData.supplierName}
                    onChange={(e) => setOrderFormData({...orderFormData, supplierName: e.target.value})}
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
                   <Label>Consegnato il *</Label>
                   <Input
                     type="date"
                     value={orderFormData.deliveredDate}
                     onChange={(e) => setOrderFormData({...orderFormData, deliveredDate: e.target.value})}
                     required
                   />
                 </div>
                 
                 <div>
                   <Label>Scadenza Pagamento (facoltativo)</Label>
                   <Input
                     type="date"
                     value={orderFormData.paymentDueDate}
                     onChange={(e) => setOrderFormData({...orderFormData, paymentDueDate: e.target.value})}
                   />
                 </div>
                
                                 <div>
                   <Label>N° Fattura / N° DDT</Label>
                   <Input
                     value={orderFormData.invoiceDdtNumber}
                     onChange={(e) => setOrderFormData({...orderFormData, invoiceDdtNumber: e.target.value})}
                   />
                 </div>
                
                <div>
                  <Label>N° Colli</Label>
                  <Input
                    type="number"
                    value={orderFormData.totalBoxes}
                    onChange={(e) => setOrderFormData({...orderFormData, totalBoxes: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>N° Prodotti</Label>
                  <Input
                    type="number"
                    value={orderFormData.totalProducts}
                    onChange={(e) => setOrderFormData({...orderFormData, totalProducts: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label>Note</Label>
                <textarea
                  value={orderFormData.notes}
                  onChange={(e) => setOrderFormData({...orderFormData, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingOrder ? 'Aggiorna' : 'Crea'} Ordine
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowOrderForm(false)
                    setEditingOrder(null)
                                         setOrderFormData({
                       orderId: '',
                       supplierName: '',
                       orderDate: '',
                       deliveredDate: '',
                       paymentDueDate: '',
                                               invoiceDdtNumber: '',
                       totalBoxes: '',
                       totalProducts: '',
                       notes: '',
                       products: []
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

export default OrdersAndShopping 