/**
 * Suppliers - Gestione fornitori HACCP
 * 
 * Questo componente gestisce:
 * 1. Creazione e modifica fornitori
 * 2. Categorizzazione per tipo prodotto
 * 3. Tracciabilità per compliance HACCP
 * 4. Gestione contatti e note
 * 
 * @version 1.0
 * @critical Tracciabilità - Gestione fornitori
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Truck, 
  Phone, 
  Mail, 
  Building2, 
  Save, 
  X,
  Info,
  AlertTriangle
} from 'lucide-react'

// Categorie fornitori disponibili
const SUPPLIER_CATEGORIES = [
  { key: 'latticini', name: 'Latticini', icon: '🥛', description: 'Latte, formaggi, yogurt' },
  { key: 'salumi', name: 'Salumi', icon: '🥓', description: 'Prosciutto, salame, mortadella' },
  { key: 'verdure', name: 'Verdure', icon: '🥬', description: 'Verdure fresche e ortaggi' },
  { key: 'farine', name: 'Farine', icon: '🌾', description: 'Farine, cereali, impasti' },
  { key: 'surgelati', name: 'Surgelati', icon: '❄️', description: 'Prodotti surgelati' },
  { key: 'altro', name: 'Altro', icon: '📦', description: 'Altri prodotti alimentari' }
]

function Suppliers({ currentUser }) {
  const [suppliers, setSuppliers] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    vat: '',
    phone: '',
    email: '',
    notes: ''
  })

  // Carica fornitori da localStorage
  useEffect(() => {
    const savedSuppliers = localStorage.getItem('haccp-suppliers')
    if (savedSuppliers) {
      try {
        setSuppliers(JSON.parse(savedSuppliers))
      } catch (error) {
        console.error('Errore nel caricamento fornitori:', error)
        setSuppliers([])
      }
    }
  }, [])

  // Salva fornitori in localStorage
  useEffect(() => {
    localStorage.setItem('haccp-suppliers', JSON.stringify(suppliers))
  }, [suppliers])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      vat: '',
      phone: '',
      email: '',
      notes: ''
    })
    setEditingSupplier(null)
    setIsFormOpen(false)
  }

  // Gestione submit form
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.category) {
      alert('⚠️ Attenzione: Nome fornitore e categoria sono obbligatori per la tracciabilità HACCP')
      return
    }

    const supplierData = {
      id: editingSupplier?.id || Date.now().toString(),
      ...formData,
      name: formData.name.trim(),
      category: formData.category,
      createdAt: editingSupplier?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: editingSupplier?.createdBy || currentUser?.id || 'unknown',
      updatedBy: currentUser?.id || 'unknown'
    }

    if (editingSupplier) {
      // Aggiorna fornitore esistente
      setSuppliers(prev => prev.map(s => 
        s.id === editingSupplier.id ? supplierData : s
      ))
      alert('✅ Fornitore aggiornato con successo!')
    } else {
      // Crea nuovo fornitore
      setSuppliers(prev => [...prev, supplierData])
      alert('✅ Nuovo fornitore aggiunto con successo!')
    }

    resetForm()
  }

  // Elimina fornitore
  const deleteSupplier = (id) => {
    if (confirm('⚠️ ATTENZIONE: Stai per eliminare questo fornitore.\n\nQuesta azione non può essere annullata e rimuoverà tutte le informazioni di tracciabilità associate.\n\nProcedere?')) {
      setSuppliers(prev => prev.filter(s => s.id !== id))
      alert('🗑️ Fornitore eliminato con successo')
    }
  }

  // Apre form per modifica
  const editSupplier = (supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      category: supplier.category,
      vat: supplier.vat || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      notes: supplier.notes || ''
    })
    setIsFormOpen(true)
  }

  // Ottiene categoria per display
  const getCategoryInfo = (categoryKey) => {
    return SUPPLIER_CATEGORIES.find(cat => cat.key === categoryKey) || 
           { name: 'Sconosciuta', icon: '❓', description: 'Categoria non definita' }
  }

  // Filtra fornitori per categoria
  const [selectedCategory, setSelectedCategory] = useState('all')
  const filteredSuppliers = selectedCategory === 'all' 
    ? suppliers 
    : suppliers.filter(s => s.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Fornitori</h1>
          <p className="text-gray-600">
            📋 Gestisci i fornitori per garantire la tracciabilità HACCP e la sicurezza alimentare
          </p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuovo Fornitore
        </Button>
      </div>

      {/* Statistiche rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{suppliers.length}</div>
            <div className="text-sm text-gray-600">Fornitori Totali</div>
          </CardContent>
        </Card>
        
        {SUPPLIER_CATEGORIES.map(category => (
          <Card key={category.key}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {suppliers.filter(s => s.category === category.key).length}
              </div>
              <div className="text-sm text-gray-600">{category.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtri categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Filtra per Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tutti ({suppliers.length})
            </button>
            {SUPPLIER_CATEGORIES.map(category => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.key 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon} {category.name} ({suppliers.filter(s => s.category === category.key).length})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form fornitore */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {editingSupplier ? 'Modifica Fornitore' : 'Nuovo Fornitore'}
            </CardTitle>
            <p className="text-sm text-gray-600">
              💡 Compila i campi obbligatori per garantire la tracciabilità HACCP
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Nome Fornitore *
                    <span className="text-xs text-gray-500" title="Nome completo del fornitore per la tracciabilità">
                      ℹ️
                    </span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Es: Fornitura Rossi SRL"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    💡 Inserisci il nome completo per la tracciabilità HACCP
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2">
                    Categoria *
                    <span className="text-xs text-gray-500" title="Tipo di prodotti forniti">
                      ℹ️
                    </span>
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Seleziona Categoria --</option>
                    {SUPPLIER_CATEGORIES.map(category => (
                      <option key={category.key} value={category.key}>
                        {category.icon} {category.name} - {category.description}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    📋 Categorizza per tipo di prodotto fornito
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vat">Partita IVA</Label>
                  <Input
                    id="vat"
                    value={formData.vat}
                    onChange={(e) => setFormData({...formData, vat: e.target.value})}
                    placeholder="IT12345678901"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="fornitore@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Note</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Note aggiuntive, orari di consegna, requisiti speciali..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingSupplier ? 'Aggiorna' : 'Salva'} Fornitore
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista fornitori */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Fornitori ({filteredSuppliers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Truck className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">Nessun fornitore trovato</p>
              <p className="text-sm">
                {selectedCategory === 'all' 
                  ? 'Inizia aggiungendo il primo fornitore per la tracciabilità HACCP'
                  : `Nessun fornitore nella categoria "${getCategoryInfo(selectedCategory).name}"`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSuppliers.map(supplier => {
                const categoryInfo = getCategoryInfo(supplier.category)
                return (
                  <div key={supplier.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{supplier.name}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                            {categoryInfo.icon} {categoryInfo.name}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {supplier.vat && (
                            <div>
                              <span className="text-gray-600">Partita IVA:</span>
                              <div className="font-medium">{supplier.vat}</div>
                            </div>
                          )}
                          
                          {supplier.phone && (
                            <div>
                              <span className="text-gray-600">Telefono:</span>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span className="font-medium">{supplier.phone}</span>
                              </div>
                            </div>
                          )}
                          
                          {supplier.email && (
                            <div>
                              <span className="text-gray-600">Email:</span>
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="font-medium">{supplier.email}</span>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <span className="text-gray-600">Aggiornato:</span>
                            <div className="font-medium">
                              {new Date(supplier.updatedAt).toLocaleDateString('it-IT')}
                            </div>
                          </div>
                        </div>
                        
                        {supplier.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600 text-sm">Note:</span>
                            <p className="text-gray-800 mt-1">{supplier.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editSupplier(supplier)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSupplier(supplier.id)}
                          className="text-red-600 hover:text-red-700"
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

export default Suppliers
