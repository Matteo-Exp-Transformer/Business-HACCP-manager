/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo componente gestisce l'INVENTARIO - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo componente gestisce tracciabilità e conservazione prodotti
 * ⚠️ Coordina scadenze, allergeni e compliance HACCP
 * 
 * @fileoverview Componente Inventory HACCP - Sistema Critico di Tracciabilità
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Gestione Inventario e Tracciabilità
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Package, 
  ShoppingCart, 
  FileText, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  Upload,
  Settings,
  Users,
  Calendar,
  MapPin,
  Thermometer,
  Star,
  Info
} from 'lucide-react'
import CustomCategoryManager from './CustomCategoryManager'
import jsPDF from 'jspdf'
import { getConservationSuggestions, suggestStorageLocation, getOptimalTemperature } from '../utils/temperatureDatabase'

// Costanti per categorie di prodotti
const CATEGORIES = [
  { id: 'carne', name: 'Carne', color: 'bg-red-100 text-red-800', temp: '0-4°C', storage: 'Frigorifero' },
  { id: 'pesce', name: 'Pesce', color: 'bg-blue-100 text-blue-800', temp: '0-2°C', storage: 'Frigorifero' },
  { id: 'latticini', name: 'Latticini', color: 'bg-yellow-100 text-yellow-800', temp: '2-4°C', storage: 'Frigorifero' },
  { id: 'verdura', name: 'Verdura', color: 'bg-green-100 text-green-800', temp: '2-8°C', storage: 'Frigorifero' },
  { id: 'frutta', name: 'Frutta', color: 'bg-orange-100 text-orange-800', temp: '2-8°C', storage: 'Frigorifero' },
  { id: 'pane', name: 'Pane', color: 'bg-amber-100 text-amber-800', temp: 'Ambiente', storage: 'Shelf' },
  { id: 'conserva', name: 'Conserve', color: 'bg-purple-100 text-purple-800', temp: 'Ambiente', storage: 'Shelf' },
  { id: 'bevande', name: 'Bevande', color: 'bg-cyan-100 text-cyan-800', temp: '2-8°C', storage: 'Frigorifero' }
]

// Prodotti predefiniti per aggiunta rapida
const DEFAULT_PRODUCTS = [
  { id: 'pollo', name: 'Petto di Pollo', category: 'carne', temp: '0-4°C' },
  { id: 'manzo', name: 'Macinato di Manzo', category: 'carne', temp: '0-4°C' },
  { id: 'salmone', name: 'Salmone Fresco', category: 'pesce', temp: '0-2°C' },
  { id: 'tonno', name: 'Tonno Fresco', category: 'pesce', temp: '0-2°C' },
  { id: 'latte', name: 'Latte Intero', category: 'latticini', temp: '2-4°C' },
  { id: 'formaggio', name: 'Formaggio Grana', category: 'latticini', temp: '2-4°C' },
  { id: 'pomodori', name: 'Pomodori', category: 'verdura', temp: '2-8°C' },
  { id: 'lattuga', name: 'Lattuga', category: 'verdura', temp: '2-8°C' },
  { id: 'mele', name: 'Mele', category: 'frutta', temp: '2-8°C' },
  { id: 'banane', name: 'Banane', category: 'frutta', temp: '2-8°C' },
  { id: 'pane_bianco', name: 'Pane Bianco', category: 'pane', temp: 'Ambiente' },
  { id: 'pasta', name: 'Pasta', category: 'conserva', temp: 'Ambiente' },
  { id: 'acqua', name: 'Acqua', category: 'bevande', temp: '2-8°C' }
]

// Allergeni comuni
const ALLERGENS = [
  { id: 'glutine', name: 'Glutine', color: 'bg-amber-100 text-amber-800' },
  { id: 'latte', name: 'Latte', color: 'bg-blue-100 text-blue-800' },
  { id: 'uova', name: 'Uova', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'soia', name: 'Soia', color: 'bg-green-100 text-green-800' },
  { id: 'frutta_guscio', name: 'Frutta a Guscio', color: 'bg-orange-100 text-orange-800' },
  { id: 'arachidi', name: 'Arachidi', color: 'bg-red-100 text-red-800' },
  { id: 'pesce', name: 'Pesce', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'crostacei', name: 'Crostacei', color: 'bg-purple-100 text-purple-800' }
]

const Inventory = () => {
  // Stati principali
  const [products, setProducts] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterExpiry, setFilterExpiry] = useState('')
  const [filterAllergen, setFilterAllergen] = useState('')
  const [refrigerators, setRefrigerators] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [orders, setOrders] = useState([])

  // Stati per modali
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [bulkSelectedProducts, setBulkSelectedProducts] = useState([])
  const [bulkSearchTerm, setBulkSearchTerm] = useState('')
  const [bulkFilterCategory, setBulkFilterCategory] = useState('')
  const [bulkFilterExpiry, setBulkFilterExpiry] = useState('')
  const [bulkFilterAllergen, setBulkFilterAllergen] = useState('')
  
  // Form data per aggiunta/modifica prodotto
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    expiryDate: '',
    allergens: [],
    notes: '',
    lotNumber: '',
    batchDeliveryDate: '',
    supplierName: '',
    associatedOrderId: ''
  })

  // Carica dati dal localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('haccp-inventory')
    const savedRefrigerators = localStorage.getItem('haccp-refrigerators')
    const savedSuppliers = localStorage.getItem('haccp-suppliers')
    const savedOrders = localStorage.getItem('haccp-orders')
    
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts))
      } catch (error) {
        console.error('Errore nel caricamento inventario:', error)
      }
    }
    
    if (savedRefrigerators) {
      try {
        setRefrigerators(JSON.parse(savedRefrigerators))
      } catch (error) {
        console.error('Errore nel caricamento frigoriferi:', error)
      }
    }
    
    if (savedSuppliers) {
      try {
        setSuppliers(JSON.parse(savedSuppliers))
      } catch (error) {
        console.error('Errore nel caricamento fornitori:', error)
      }
    }
    
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders))
      } catch (error) {
        console.error('Errore nel caricamento ordini:', error)
      }
    }
  }, [])

  // Salva prodotti nel localStorage
  useEffect(() => {
    localStorage.setItem('haccp-inventory', JSON.stringify(products))
  }, [products])

  // Funzioni di utilità
  const getExpiryStatus = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'expired', label: 'Scaduto', color: 'bg-red-100 text-red-800' }
    if (diffDays <= 3) return { status: 'critical', label: 'Critico', color: 'bg-red-100 text-red-800' }
    if (diffDays <= 7) return { status: 'warning', label: 'In scadenza', color: 'bg-yellow-100 text-yellow-800' }
    return { status: 'ok', label: 'OK', color: 'bg-green-100 text-green-800' }
  }

  const getAppropriateRefrigerator = (category) => {
    const categoryInfo = CATEGORIES.find(c => c.id === category)
    if (!categoryInfo) return 'Categoria non trovata'
    
    const appropriateRefrigerator = refrigerators.find(ref => 
      ref.temperature >= 0 && ref.temperature <= 4 && 
      categoryInfo.temp.includes('0-4°C')
    )
    
    return appropriateRefrigerator ? appropriateRefrigerator.name : 'Nessun frigorifero appropriato'
  }

  // Filtri prodotti
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      CATEGORIES.find(c => c.id === product.category)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !filterCategory || product.category === filterCategory
    
    let matchesExpiry = true
    if (filterExpiry) {
      const expiryStatus = getExpiryStatus(product.expiryDate)
      matchesExpiry = expiryStatus.status === filterExpiry
    }
    
    const matchesAllergen = !filterAllergen || 
      (product.allergens && product.allergens.includes(filterAllergen))
    
    return matchesSearch && matchesCategory && matchesExpiry && matchesAllergen
  })

  // Gestione form
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      location: '',
      expiryDate: '',
      allergens: [],
      notes: '',
      lotNumber: '',
      batchDeliveryDate: '',
      supplierName: '',
      associatedOrderId: ''
    })
    setEditingProduct(null)
    setShowAddForm(false)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAllergenToggle = (allergenId) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergenId)
        ? prev.allergens.filter(id => id !== allergenId)
        : [...prev.allergens, allergenId]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category || !formData.location || !formData.expiryDate) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    const productData = {
      ...formData,
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      addedAt: editingProduct ? editingProduct.addedAt : new Date().toISOString()
    }

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? productData : p))
    } else {
      setProducts(prev => [...prev, productData])
    }

    resetForm()
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      location: product.location,
      expiryDate: product.expiryDate,
      allergens: product.allergens || [],
      notes: product.notes || '',
      lotNumber: product.lotNumber || '',
      batchDeliveryDate: product.batchDeliveryDate || '',
      supplierName: product.supplierName || '',
      associatedOrderId: product.associatedOrderId || ''
    })
    setEditingProduct(product)
    setShowAddForm(true)
  }

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const handleQuickAdd = (product) => {
    const today = new Date()
    const expiryDate = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 giorni da oggi
    
    const quickProduct = {
      ...product,
      id: Date.now().toString(),
      location: getAppropriateRefrigerator(product.category),
      expiryDate: expiryDate.toISOString().split('T')[0],
      allergens: [],
      notes: '',
      lotNumber: '',
      batchDeliveryDate: today.toISOString().split('T')[0],
      supplierName: '',
      associatedOrderId: '',
      addedAt: new Date().toISOString()
    }
    
    setProducts(prev => [...prev, quickProduct])
  }

  // Gestione bulk delete
  const toggleBulkSelect = (productId) => {
    setBulkSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleBulkDelete = () => {
    setProducts(prev => prev.filter(p => !bulkSelectedProducts.includes(p.id)))
    setBulkSelectedProducts([])
    setShowBulkDelete(false)
  }

  const handleDeleteAll = () => {
    setProducts([])
    setShowDeleteConfirm(false)
  }
  
  // Export PDF
  const exportToPDF = () => {
  const doc = new jsPDF()
  doc.setFontSize(20)
    doc.text('Inventario HACCP', 20, 20)
  
	doc.setFontSize(12)
    doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 20, 30)
    doc.text(`Totale prodotti: ${products.length}`, 20, 40)
    
    let y = 60
    products.forEach((product, index) => {
      if (y > 280) {
        doc.addPage()
        y = 20
      }
      
      const category = CATEGORIES.find(c => c.id === product.category)
      const expiryStatus = getExpiryStatus(product.expiryDate)
      
      doc.text(`${index + 1}. ${product.name}`, 20, y)
      doc.text(`   Categoria: ${category?.name || 'N/A'}`, 25, y + 5)
      doc.text(`   Posizione: ${product.location}`, 25, y + 10)
      doc.text(`   Scadenza: ${new Date(product.expiryDate).toLocaleDateString('it-IT')} (${expiryStatus.label})`, 25, y + 15)
      
      if (product.allergens && product.allergens.length > 0) {
        const allergenNames = product.allergens.map(id => 
          ALLERGENS.find(a => a.id === id)?.name
        ).filter(Boolean).join(', ')
        doc.text(`   Allergeni: ${allergenNames}`, 25, y + 20)
        y += 25
      } else {
        y += 20
      }
      
      if (product.notes) {
        doc.text(`   Note: ${product.notes}`, 25, y)
        y += 10
      }
      
      y += 10
    })
    
    doc.save(`inventario-haccp-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* Header con controlli */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
          <p className="text-gray-600">Gestisci i prodotti e la tracciabilità HACCP</p>
              </div>
            <div className="flex gap-2">
          <Button onClick={exportToPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export PDF
              </Button>
              <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
              >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Prodotto
              </Button>
            </div>
          </div>

      {/* Filtri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Cerca</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome prodotto, posizione..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="category">Categoria</Label>
            <select
                id="category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tutte le categorie</option>
                {CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            </div>
            
            <div>
              <Label htmlFor="expiry">Scadenza</Label>
            <select
                id="expiry"
              value={filterExpiry}
              onChange={(e) => setFilterExpiry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tutte le scadenze</option>
              <option value="expired">Scaduti</option>
              <option value="critical">Critici (≤3 giorni)</option>
              <option value="warning">In scadenza (≤7 giorni)</option>
              <option value="ok">OK (&gt;7 giorni)</option>
            </select>
          </div>
          
            <div>
              <Label htmlFor="allergen">Allergene</Label>
              <select
                id="allergen"
                value={filterAllergen}
                onChange={(e) => setFilterAllergen(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tutti gli allergeni</option>
                {ALLERGENS.map(allergen => (
                  <option key={allergen.id} value={allergen.id}>{allergen.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 1. Gestione Inventario */}
        <Card>
          <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gestione Inventario
            </CardTitle>
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
                          <p>📍 {product.location}</p>
                          <p>📅 Scadenza: {new Date(product.expiryDate).toLocaleDateString('it-IT')}</p>
                          {product.allergens && product.allergens.length > 0 && (
                            <p>⚠️ Allergeni: {product.allergens.map(a => ALLERGENS.find(al => al.id === a)?.name).join(', ')}</p>
                          )}
                          {product.notes && <p>📝 {product.notes}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                      <Button
                          onClick={() => handleEdit(product)}
                        size="sm"
                          variant="outline"
                      >
                          <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                          onClick={() => deleteProduct(product.id)}
                        size="sm"
                          variant="outline"
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

      {/* 2. Prodotti nell'inventario */}
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
                          <p>📍 {product.location}</p>
                          <p>📅 Scadenza: {new Date(product.expiryDate).toLocaleDateString('it-IT')}</p>
                          {product.allergens && product.allergens.length > 0 && (
                            <p>⚠️ Allergeni: {product.allergens.map(a => ALLERGENS.find(al => al.id === a)?.name).join(', ')}</p>
                          )}
                          {product.notes && <p>📝 {product.notes}</p>}
              </div>
              </div>
                      <div className="flex gap-2 ml-4">
                <Button 
                          onClick={() => handleEdit(product)}
                  size="sm"
                  variant="outline"
                >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => deleteProduct(product.id)}
                          size="sm"
                          variant="outline"
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

      {/* 3. Aggiunta prodotti rapidi */}
      {!showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Aggiunta prodotti rapidi
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
                          <div className="text-xs text-green-600 mt-1">
                            {CATEGORIES.find(c => c.id === product.category)?.temp}
                            </div>
                        </div>
                        <Plus className="h-4 w-4 text-green-600 group-hover:text-green-700" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!filterCategory && (
              <div className="text-center py-8">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Seleziona una categoria sopra per vedere i prodotti disponibili</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 4. Categorie Personalizzate */}
      <CustomCategoryManager />

      {/* Form per aggiungere/modificare prodotto */}
      {showAddForm && (
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingProduct ? 'Modifica Prodotto' : 'Aggiungi Prodotto'}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Prodotto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Es. Pomodori San Marzano"
                    required
                  />
            </div>
                
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleziona categoria</option>
                    {CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                        </div>
                        
                <div>
                  <Label htmlFor="location">Posizione *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Es. Frigorifero A, Scaffale 2"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="expiryDate">Data di Scadenza *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    required
                  />
                              </div>
                              </div>
              
              <div>
                <Label>Allergeni</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {ALLERGENS.map(allergen => (
                    <label key={allergen.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.allergens.includes(allergen.id)}
                        onChange={() => handleAllergenToggle(allergen.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{allergen.name}</span>
                    </label>
                  ))}
                              </div>
                          </div>
                          
              <div>
                <Label htmlFor="notes">Note</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Note aggiuntive sul prodotto..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                      </div>
                      
              <div className="flex justify-end gap-2">
                <Button type="button" onClick={resetForm} variant="outline">
                  Annulla
                        </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingProduct ? 'Aggiorna' : 'Aggiungi'} Prodotto
                        </Button>
                      </div>
            </form>
        </CardContent>
      </Card>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Rimuovi Prodotti dall'Inventario</h3>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={bulkSearchTerm}
                  onChange={(e) => setBulkSearchTerm(e.target.value)}
                  placeholder="Cerca prodotti..."
                  className="px-3 py-2 border rounded-md"
                />
              
                <select
                  value={bulkFilterCategory}
                  onChange={(e) => setBulkFilterCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Tutte le categorie</option>
                  {CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
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
                  const matchesSearch = !bulkSearchTerm || 
                    product.name.toLowerCase().includes(bulkSearchTerm.toLowerCase()) ||
                    product.location?.toLowerCase().includes(bulkSearchTerm.toLowerCase()) ||
                    CATEGORIES.find(c => c.id === product.category)?.name.toLowerCase().includes(bulkSearchTerm.toLowerCase());
                  
                  const matchesCategory = !bulkFilterCategory || product.category === bulkFilterCategory;
                  
                  let matchesExpiry = true;
                  if (bulkFilterExpiry) {
                    const expiryStatus = getExpiryStatus(product.expiryDate);
                    matchesExpiry = expiryStatus.status === bulkFilterExpiry;
                  }
                  
                  const matchesAllergen = !bulkFilterAllergen || 
                    (product.allergens && product.allergens.includes(bulkFilterAllergen));
                  
                  return matchesSearch && matchesCategory && matchesExpiry && matchesAllergen;
                }).map(product => {
                  const category = CATEGORIES.find(c => c.id === product.category)
                  const expiryStatus = getExpiryStatus(product.expiryDate)
                  
                  return (
                    <div key={product.id} className="flex items-center p-2 border rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={bulkSelectedProducts.includes(product.id)}
                        onChange={() => toggleBulkSelect(product.id)}
                        className="mr-3 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {category?.name} • {product.location} • Scade: {new Date(product.expiryDate).toLocaleDateString('it-IT')}
                      </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${expiryStatus.color}`}>
                        {expiryStatus.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Selezionati: {bulkSelectedProducts.length} prodotti
              </div>
              <div className="flex gap-2">
              <Button 
                  onClick={() => setShowBulkDelete(false)}
                  variant="outline"
              >
                  Annulla
              </Button>
                <Button
                  onClick={handleBulkDelete}
                  disabled={bulkSelectedProducts.length === 0}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Rimuovi {bulkSelectedProducts.length} Prodotti
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Conferma Cancellazione</h3>
            <p className="text-gray-700 mb-6">
              Sei sicuro di voler cancellare TUTTO l'inventario? Questa azione non può essere annullata.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
              >
                Annulla
                </Button>
                <Button 
                onClick={handleDeleteAll}
                className="bg-red-600 hover:bg-red-700"
              >
                Sì, Cancella Tutto
                </Button>
              </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
