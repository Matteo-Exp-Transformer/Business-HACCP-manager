import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Package, Plus, Search, Filter, Trash2, Edit, AlertTriangle, Calendar, Clock } from 'lucide-react'

// Database prodotti italiani precaricati
const DEFAULT_PRODUCTS = [
  { id: 'prod_001', name: 'Mozzarella di Bufala', category: 'fresco', defaultLocation: 'Frigo A', allergens: ['latte'] },
  { id: 'prod_002', name: 'Parmigiano Reggiano 24m', category: 'fresco', defaultLocation: 'Frigo A', allergens: ['latte'] },
  { id: 'prod_003', name: 'Burrata Pugliese', category: 'fresco', defaultLocation: 'Frigo A', allergens: ['latte'] },
  { id: 'prod_004', name: 'Pomodoro San Marzano', category: 'ambiente', defaultLocation: 'Scaffale 1', allergens: [] },
  { id: 'prod_005', name: 'Basilico Fresco', category: 'fresco', defaultLocation: 'Frigo B', allergens: [] },
  { id: 'prod_006', name: 'Olio Extra Vergine Pugliese', category: 'ambiente', defaultLocation: 'Scaffale 2', allergens: [] },
  { id: 'prod_007', name: 'Prosciutto di Parma 18m', category: 'fresco', defaultLocation: 'Frigo C', allergens: [] },
  { id: 'prod_008', name: 'Bresaola della Valtellina', category: 'fresco', defaultLocation: 'Frigo C', allergens: [] },
  { id: 'prod_009', name: 'Farina 00 Manitoba', category: 'ambiente', defaultLocation: 'Scaffale 3', allergens: ['glutine'] },
  { id: 'prod_010', name: 'Gamberi Rossi Surgelati', category: 'surgelato', defaultLocation: 'Freezer A', allergens: ['crostacei'] },
  { id: 'prod_011', name: 'Salmone Norvegese', category: 'fresco', defaultLocation: 'Frigo Pesce', allergens: ['pesce'] },
  { id: 'prod_012', name: 'Vongole Veraci', category: 'fresco', defaultLocation: 'Frigo Pesce', allergens: ['molluschi'] },
  { id: 'prod_013', name: 'Uova Bio Fresche', category: 'fresco', defaultLocation: 'Frigo A', allergens: ['uova'] },
  { id: 'prod_014', name: 'Pancetta Tesa', category: 'fresco', defaultLocation: 'Frigo C', allergens: [] },
  { id: 'prod_015', name: 'Speck Alto Adige', category: 'fresco', defaultLocation: 'Frigo C', allergens: [] },
  { id: 'prod_016', name: 'Aceto Balsamico Modena', category: 'ambiente', defaultLocation: 'Scaffale 2', allergens: ['solfiti'] },
  { id: 'prod_017', name: 'Rucola Selvatica', category: 'fresco', defaultLocation: 'Frigo B', allergens: [] },
  { id: 'prod_018', name: 'Gorgonzola DOP', category: 'fresco', defaultLocation: 'Frigo A', allergens: ['latte'] },
  { id: 'prod_019', name: 'Pistacchi Siciliani', category: 'ambiente', defaultLocation: 'Scaffale 4', allergens: ['frutta_guscio'] },
  { id: 'prod_020', name: 'Guanciale Romano', category: 'fresco', defaultLocation: 'Frigo C', allergens: [] }
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
  { id: 'fresco', name: 'Fresco (0-4°C)', color: 'bg-blue-100 text-blue-800', temp: '0-4°C' },
  { id: 'surgelato', name: 'Surgelato (-18°C)', color: 'bg-cyan-100 text-cyan-800', temp: '-18°C' },
  { id: 'ambiente', name: 'Temperatura Ambiente', color: 'bg-green-100 text-green-800', temp: 'Ambiente' }
]

function Inventory({ products = [], setProducts, currentUser }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterExpiry, setFilterExpiry] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'fresco',
    expiryDate: '',
    location: '',
    allergens: [],
    notes: ''
  })

  // Save products to localStorage
  useEffect(() => {
    localStorage.setItem('haccp-products', JSON.stringify(products))
  }, [products])

  // Precarica prodotti se l'inventario è vuoto
  useEffect(() => {
    if (products.length === 0) {
      const preloadedProducts = DEFAULT_PRODUCTS.map(product => ({
        ...product,
        expiryDate: getDefaultExpiryDate(product.category),
        location: product.defaultLocation,
        addedBy: currentUser?.id || 'system',
        addedByName: currentUser?.name || 'Sistema',
        createdAt: new Date().toISOString(),
        status: 'active'
      }))
      setProducts(preloadedProducts)
    }
  }, [])

  const getDefaultExpiryDate = (category) => {
    const today = new Date()
    let daysToAdd = 7 // default
    
    switch(category) {
      case 'fresco': daysToAdd = 5; break
      case 'surgelato': daysToAdd = 90; break
      case 'ambiente': daysToAdd = 365; break
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
      category: 'fresco',
      expiryDate: '',
      location: '',
      allergens: [],
      notes: ''
    })
    setEditingProduct(null)
    setShowAddForm(false)
  }

  const handleQuickAdd = (defaultProduct) => {
    const newProduct = {
      id: `prod_${Date.now()}`,
      name: defaultProduct.name,
      category: defaultProduct.category,
      expiryDate: getDefaultExpiryDate(defaultProduct.category),
      location: defaultProduct.defaultLocation,
      allergens: [...defaultProduct.allergens],
      addedBy: currentUser?.id,
      addedByName: currentUser?.name,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    
    setProducts([...products, newProduct])
    
    // Log action
    const action = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: currentUser?.id,
      userName: currentUser?.name,
      type: 'product_add',
      description: `Aggiunto prodotto: ${newProduct.name}`
    }
    const actions = JSON.parse(localStorage.getItem('haccp-actions') || '[]')
    actions.push(action)
    localStorage.setItem('haccp-actions', JSON.stringify(actions))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.expiryDate || !formData.location.trim()) return

    if (editingProduct) {
      // Update existing product
      const updatedProducts = products.map(product =>
        product.id === editingProduct.id
          ? { ...product, ...formData, updatedAt: new Date().toISOString() }
          : product
      )
      setProducts(updatedProducts)
    } else {
      // Add new product
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
      notes: product.notes || ''
    })
    setEditingProduct(product)
    setShowAddForm(true)
  }

  const handleDelete = (id) => {
    if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      setProducts(products.filter(product => product.id !== id))
    }
  }

  const toggleAllergen = (allergenId) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergenId)
        ? prev.allergens.filter(id => id !== allergenId)
        : [...prev.allergens, allergenId]
    }))
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || product.category === filterCategory
    const matchesExpiry = !filterExpiry || getExpiryStatus(product.expiryDate).status === filterExpiry
    return matchesSearch && matchesCategory && matchesExpiry
  })

  // Statistics
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
      {/* Header con statistiche */}
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
                <p className="text-2xl font-bold text-green-600">{stats.byCategory.fresco || 0}</p>
                <p className="text-sm text-gray-600">Freschi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra ricerca e filtri */}
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
              <Input
                placeholder="Cerca prodotti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
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
              <option value="ok">OK (>7 giorni)</option>
            </select>
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
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Es. Frigo A, Scaffale 2"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Allergeni</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {ALLERGENS.map(allergen => (
                    <button
                      key={allergen.id}
                      type="button"
                      onClick={() => toggleAllergen(allergen.id)}
                      className={`
                        px-3 py-1 text-xs rounded-full transition-colors
                        ${formData.allergens.includes(allergen.id)
                          ? allergen.color + ' font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {allergen.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Note (opzionale)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Note aggiuntive..."
                />
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

      {/* Prodotti predefiniti per aggiunta rapida */}
      {!showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Aggiunta Rapida - Prodotti Italiani</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DEFAULT_PRODUCTS.slice(0, 8).map(product => (
                <button
                  key={product.id}
                  onClick={() => handleQuickAdd(product)}
                  className="p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {CATEGORIES.find(c => c.id === product.category)?.name}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista prodotti */}
      <Card>
        <CardHeader>
          <CardTitle>Prodotti Registrati ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">Nessun prodotto trovato</p>
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
                          {product.allergens?.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              ⚠️ Allergeni:
                              {product.allergens.map(allergenId => {
                                const allergen = ALLERGENS.find(a => a.id === allergenId)
                                return allergen ? (
                                  <span key={allergenId} className={`px-2 py-1 text-xs rounded-full ${allergen.color}`}>
                                    {allergen.name}
                                  </span>
                                ) : null
                              })}
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
                          onClick={() => handleDelete(product.id)}
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
    </div>
  )
}

export default Inventory