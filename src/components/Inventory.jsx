import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Plus, Search, Filter, AlertTriangle, Calendar, MapPin, Trash2, Edit2, Package } from 'lucide-react'

// Database prodotti italiani tipici precompilati
const ITALIAN_PRODUCTS_DB = [
  { name: 'Mozzarella di Bufala', category: 'fresco', allergens: ['latte'], defaultLocation: 'Frigo A' },
  { name: 'Pomodoro San Marzano', category: 'ambiente', allergens: [], defaultLocation: 'Scaffale 1' },
  { name: 'Basilico Fresco', category: 'fresco', allergens: [], defaultLocation: 'Frigo Erbe' },
  { name: 'Olio Extra Vergine', category: 'ambiente', allergens: [], defaultLocation: 'Scaffale 2' },
  { name: 'Parmigiano Reggiano', category: 'fresco', allergens: ['latte'], defaultLocation: 'Frigo B' },
  { name: 'Prosciutto di Parma', category: 'fresco', allergens: [], defaultLocation: 'Frigo Salumi' },
  { name: 'Farina 00', category: 'ambiente', allergens: ['glutine'], defaultLocation: 'Dispensa' },
  { name: 'Salmone Affumicato', category: 'fresco', allergens: ['pesce'], defaultLocation: 'Frigo Pesce' },
  { name: 'Gamberi Surgelati', category: 'surgelato', allergens: ['crostacei'], defaultLocation: 'Freezer A' },
  { name: 'Ricotta Fresca', category: 'fresco', allergens: ['latte'], defaultLocation: 'Frigo A' },
  { name: 'Bresaola della Valtellina', category: 'fresco', allergens: [], defaultLocation: 'Frigo Salumi' },
  { name: 'Burrata Pugliese', category: 'fresco', allergens: ['latte'], defaultLocation: 'Frigo A' },
  { name: 'Aceto Balsamico', category: 'ambiente', allergens: ['solfiti'], defaultLocation: 'Scaffale 2' },
  { name: 'Pancetta', category: 'fresco', allergens: [], defaultLocation: 'Frigo Salumi' },
  { name: 'Funghi Porcini Secchi', category: 'ambiente', allergens: [], defaultLocation: 'Dispensa' },
  { name: 'Vongole Fresche', category: 'fresco', allergens: ['molluschi'], defaultLocation: 'Frigo Pesce' },
  { name: 'Gorgonzola DOP', category: 'fresco', allergens: ['latte'], defaultLocation: 'Frigo B' },
  { name: 'Speck Alto Adige', category: 'fresco', allergens: [], defaultLocation: 'Frigo Salumi' },
  { name: 'Passata di Pomodoro', category: 'ambiente', allergens: [], defaultLocation: 'Scaffale 1' },
  { name: 'Tonno in Scatola', category: 'ambiente', allergens: ['pesce'], defaultLocation: 'Scaffale 3' }
]

// Lista allergeni standard EU
const EU_ALLERGENS = [
  'glutine', 'crostacei', 'uova', 'pesce', 'arachidi', 'soia', 'latte', 
  'frutta_a_guscio', 'sedano', 'senape', 'sesamo', 'solfiti', 'lupini', 'molluschi'
]

const ALLERGEN_LABELS = {
  glutine: 'Glutine',
  crostacei: 'Crostacei',
  uova: 'Uova',
  pesce: 'Pesce',
  arachidi: 'Arachidi',
  soia: 'Soia',
  latte: 'Latte',
  frutta_a_guscio: 'Frutta a guscio',
  sedano: 'Sedano',
  senape: 'Senape',
  sesamo: 'Sesamo',
  solfiti: 'Solfiti',
  lupini: 'Lupini',
  molluschi: 'Molluschi'
}

const CATEGORIES = {
  fresco: { label: 'Fresco (0-4°C)', color: 'bg-blue-100 text-blue-800', icon: '❄️' },
  surgelato: { label: 'Surgelato (-18°C)', color: 'bg-cyan-100 text-cyan-800', icon: '🧊' },
  ambiente: { label: 'Temperatura Ambiente', color: 'bg-green-100 text-green-800', icon: '🌡️' }
}

function Inventory() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [expiryFilter, setExpiryFilter] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'fresco',
    expiryDate: '',
    location: '',
    allergens: [],
    isCustom: true
  })

  // Load products from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('haccp-products')
    if (stored) {
      setProducts(JSON.parse(stored))
    }
  }, [])

  // Save products to localStorage
  const saveProducts = (newProducts) => {
    setProducts(newProducts)
    localStorage.setItem('haccp-products', JSON.stringify(newProducts))
  }

  // Add product from database
  const addProductFromDB = (dbProduct) => {
    const newProduct = {
      id: `prod_${Date.now()}`,
      name: dbProduct.name,
      category: dbProduct.category,
      expiryDate: '',
      location: dbProduct.defaultLocation,
      allergens: dbProduct.allergens,
      isCustom: false,
      addedBy: 'current_user',
      createdAt: new Date().toISOString()
    }
    
    setFormData(newProduct)
    setShowForm(true)
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingProduct) {
      // Update existing product
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id 
          ? { ...formData, id: editingProduct.id, updatedAt: new Date().toISOString() }
          : p
      )
      saveProducts(updatedProducts)
    } else {
      // Add new product
      const newProduct = {
        ...formData,
        id: `prod_${Date.now()}`,
        addedBy: 'current_user',
        createdAt: new Date().toISOString()
      }
      saveProducts([...products, newProduct])
    }
    
    resetForm()
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'fresco',
      expiryDate: '',
      location: '',
      allergens: [],
      isCustom: true
    })
    setShowForm(false)
    setEditingProduct(null)
  }

  // Edit product
  const editProduct = (product) => {
    setFormData(product)
    setEditingProduct(product)
    setShowForm(true)
  }

  // Delete product
  const deleteProduct = (productId) => {
    if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      const updatedProducts = products.filter(p => p.id !== productId)
      saveProducts(updatedProducts)
    }
  }

  // Toggle allergen
  const toggleAllergen = (allergen) => {
    const newAllergens = formData.allergens.includes(allergen)
      ? formData.allergens.filter(a => a !== allergen)
      : [...formData.allergens, allergen]
    
    setFormData({ ...formData, allergens: newAllergens })
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    
    let matchesExpiry = true
    if (expiryFilter === 'expired') {
      matchesExpiry = product.expiryDate && new Date(product.expiryDate) < new Date()
    } else if (expiryFilter === 'expiring') {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      matchesExpiry = product.expiryDate && 
        new Date(product.expiryDate) >= today && 
        new Date(product.expiryDate) <= nextWeek
    }
    
    return matchesSearch && matchesCategory && matchesExpiry
  })

  // Check if product is expiring soon
  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0
  }

  // Check if product is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-primary-700 flex items-center gap-2">
                <Package className="h-6 w-6" />
                Business HACCP Manager - Inventario
              </CardTitle>
              <p className="text-gray-600 mt-1">Gestione prodotti e controllo scadenze</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Aggiungi Prodotto
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cerca prodotti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Tutte le categorie</option>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.label}</option>
              ))}
            </select>

            {/* Expiry Filter */}
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Tutte le scadenze</option>
              <option value="expiring">In scadenza (7 giorni)</option>
              <option value="expired">Scaduti</option>
            </select>

            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Filter className="h-4 w-4" />
              {filteredProducts.length} prodotti
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? 'Modifica Prodotto' : 'Aggiungi Nuovo Prodotto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome Prodotto</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoria Conservazione</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data Scadenza</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Posizione</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="es. Frigo A, Scaffale 1"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Allergens */}
              <div>
                <label className="block text-sm font-medium mb-2">Allergeni</label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {EU_ALLERGENS.map(allergen => (
                    <label key={allergen} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allergens.includes(allergen)}
                        onChange={() => toggleAllergen(allergen)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm">{ALLERGEN_LABELS[allergen]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingProduct ? 'Aggiorna' : 'Aggiungi'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Product Database */}
      {!editingProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Prodotti Italiani Tipici</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {ITALIAN_PRODUCTS_DB.map((product, index) => (
                <button
                  key={index}
                  onClick={() => addProductFromDB(product)}
                  className="p-3 border rounded-md hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${CATEGORIES[product.category].color}`}>
                      {CATEGORIES[product.category].icon} {CATEGORIES[product.category].label}
                    </span>
                  </div>
                  {product.allergens.length > 0 && (
                    <div className="text-xs text-orange-600 mt-1">
                      Allergeni: {product.allergens.map(a => ALLERGEN_LABELS[a]).join(', ')}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <Card key={product.id} className={`
            ${isExpired(product.expiryDate) ? 'border-red-300 bg-red-50' : 
              isExpiringSoon(product.expiryDate) ? 'border-yellow-300 bg-yellow-50' : ''}
          `}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${CATEGORIES[product.category].color}`}>
                      {CATEGORIES[product.category].icon} {CATEGORIES[product.category].label}
                    </span>
                    {!product.isCustom && (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        DB Italiano
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editProduct(product)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {/* Expiry Date */}
                {product.expiryDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className={`
                      ${isExpired(product.expiryDate) ? 'text-red-600 font-medium' :
                        isExpiringSoon(product.expiryDate) ? 'text-yellow-600 font-medium' :
                        'text-gray-600'}
                    `}>
                      {isExpired(product.expiryDate) ? '⚠️ Scaduto il ' :
                       isExpiringSoon(product.expiryDate) ? '⚠️ Scade il ' :
                       'Scade il '} 
                      {new Date(product.expiryDate).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                )}

                {/* Location */}
                {product.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {product.location}
                  </div>
                )}

                {/* Allergens */}
                {product.allergens.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <div className="flex flex-wrap gap-1">
                      {product.allergens.map(allergen => (
                        <span
                          key={allergen}
                          className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700"
                        >
                          {ALLERGEN_LABELS[allergen]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {products.length === 0 
                ? 'Nessun prodotto in inventario. Aggiungi il primo prodotto!'
                : 'Nessun prodotto corrisponde ai filtri selezionati.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Inventory