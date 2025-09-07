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
  const [filterLot, setFilterLot] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')
  const [filterOrderId, setFilterOrderId] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterConservationPoint, setFilterConservationPoint] = useState('')
  const [groupByDepartment, setGroupByDepartment] = useState(false)
  const [groupByConservationPoint, setGroupByConservationPoint] = useState(false)
  const [refrigerators, setRefrigerators] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [orders, setOrders] = useState([])

  // Dati per filtri e raggruppamenti
  const [departments, setDepartments] = useState([])
  const [conservationPoints, setConservationPoints] = useState([])
  
  // Stati per alert prodotti senza punto di conservazione
  const [showMissingConservationAlert, setShowMissingConservationAlert] = useState(false)
  const [productsWithoutConservation, setProductsWithoutConservation] = useState([])

  // Stati per modali
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [bulkSelectedProducts, setBulkSelectedProducts] = useState([])
  
  // Stati per sezione Ordini e Spesa
  const [shoppingItems, setShoppingItems] = useState([])
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [orderItems, setOrderItems] = useState([])
  const [showOrderForm, setShowOrderForm] = useState(false)
  
  // Stati per ingredienti già utilizzati
  const [usedIngredients, setUsedIngredients] = useState([])
  const [showUsedIngredients, setShowUsedIngredients] = useState(false)
  const [bulkSearchTerm, setBulkSearchTerm] = useState('')
  const [bulkFilterCategory, setBulkFilterCategory] = useState('')
  const [bulkFilterExpiry, setBulkFilterExpiry] = useState('')
  const [bulkFilterAllergen, setBulkFilterAllergen] = useState('')
  
  // Form data per aggiunta/modifica prodotto
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    department: '', // Reparto (es. "Cucina", "Sala")
    conservationPoint: '', // Punto di conservazione (es. "Frigo A", "Freezer")
    expiryDate: '',
    allergens: [],
    notes: '',
    lotNumber: '',
    batchDeliveryDate: '',
    supplierName: '',
    associatedOrderId: ''
  })

  // Stato per form ordini
  const [orderFormData, setOrderFormData] = useState({
    orderId: '',
    supplierName: '',
    orderDate: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // Carica dati dal localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('haccp-inventory')
    const savedRefrigerators = localStorage.getItem('haccp-refrigerators')
    const savedSuppliers = localStorage.getItem('haccp-suppliers')
    const savedOrders = localStorage.getItem('haccp-orders')
    
    // Carica dati reparti e punti di conservazione dall'onboarding
    const savedOnboarding = localStorage.getItem('haccp-onboarding')
    if (savedOnboarding) {
      try {
        const onboarding = JSON.parse(savedOnboarding)
        
        // Carica reparti attivi
        if (onboarding.departments?.list) {
          const activeDepartments = onboarding.departments.list
            .filter(dept => dept.enabled)
            .map(dept => ({ id: dept.id, name: dept.name }))
          setDepartments(activeDepartments)
        }
        
        // Carica punti di conservazione
        if (onboarding.conservation?.points) {
          setConservationPoints(onboarding.conservation.points)
        }
      } catch (error) {
        console.error('Errore nel caricamento dati onboarding:', error)
      }
    }
    
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
    
    // Carica ingredienti utilizzati
    const savedUsedIngredients = localStorage.getItem('haccp-used-ingredients')
    if (savedUsedIngredients) {
      try {
        setUsedIngredients(JSON.parse(savedUsedIngredients))
      } catch (error) {
        console.error('Errore nel caricamento ingredienti utilizzati:', error)
      }
    }
  }, [])

  // Salva prodotti nel localStorage
  useEffect(() => {
    localStorage.setItem('haccp-inventory', JSON.stringify(products))
  }, [products])

  // Salva ingredienti utilizzati nel localStorage
  useEffect(() => {
    localStorage.setItem('haccp-used-ingredients', JSON.stringify(usedIngredients))
  }, [usedIngredients])

  // Rileva prodotti senza punto di conservazione
  useEffect(() => {
    const productsWithout = products.filter(product => 
      !product.conservationPoint || product.conservationPoint === ''
    )
    setProductsWithoutConservation(productsWithout)
    
    if (productsWithout.length > 0) {
      setShowMissingConservationAlert(true)
    }
  }, [products])

  // Funzioni per gestione sostituzione reparti/punti
  const handleDepartmentDeletion = (departmentToDelete) => {
    const productsInDepartment = products.filter(product => product.department === departmentToDelete)
    
    if (productsInDepartment.length > 0) {
      const confirmMessage = `Il reparto "${departmentToDelete}" contiene ${productsInDepartment.length} prodotti. Vuoi sostituirlo con un altro reparto?`
      
      if (confirm(confirmMessage)) {
        // Mostra modal per selezione nuovo reparto
        const newDepartment = prompt(`Seleziona il nuovo reparto per i ${productsInDepartment.length} prodotti:\n${departments.map(d => d.name).join('\n')}`)
        
        if (newDepartment && departments.find(d => d.name === newDepartment)) {
          // Aggiorna i prodotti con il nuovo reparto
          setProducts(prev => prev.map(product => 
            product.department === departmentToDelete 
              ? { ...product, department: newDepartment }
              : product
          ))
          
          // Rimuovi il reparto dalla lista
          setDepartments(prev => prev.filter(d => d.name !== departmentToDelete))
          
          alert(`Reparto "${departmentToDelete}" sostituito con "${newDepartment}" per ${productsInDepartment.length} prodotti.`)
        } else {
          alert('Reparto non valido. Operazione annullata.')
        }
      }
    } else {
      // Nessun prodotto nel reparto, può essere eliminato direttamente
      setDepartments(prev => prev.filter(d => d.name !== departmentToDelete))
    }
  }

  const handleConservationPointDeletion = (pointToDelete) => {
    const productsInPoint = products.filter(product => product.conservationPoint === pointToDelete)
    
    if (productsInPoint.length > 0) {
      const confirmMessage = `Il punto di conservazione "${pointToDelete}" contiene ${productsInPoint.length} prodotti. Vuoi sostituirlo con un altro punto?`
      
      if (confirm(confirmMessage)) {
        // Mostra modal per selezione nuovo punto
        const newPoint = prompt(`Seleziona il nuovo punto di conservazione per i ${productsInPoint.length} prodotti:\n${conservationPoints.map(p => p.name).join('\n')}`)
        
        if (newPoint && conservationPoints.find(p => p.name === newPoint)) {
          // Aggiorna i prodotti con il nuovo punto
          setProducts(prev => prev.map(product => 
            product.conservationPoint === pointToDelete 
              ? { ...product, conservationPoint: newPoint }
              : product
          ))
          
          // Rimuovi il punto dalla lista
          setConservationPoints(prev => prev.filter(p => p.name !== pointToDelete))
          
          alert(`Punto di conservazione "${pointToDelete}" sostituito con "${newPoint}" per ${productsInPoint.length} prodotti.`)
        } else {
          alert('Punto di conservazione non valido. Operazione annullata.')
        }
      }
    } else {
      // Nessun prodotto nel punto, può essere eliminato direttamente
      setConservationPoints(prev => prev.filter(p => p.name !== pointToDelete))
    }
  }

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

  // Funzione per calcolare data di scadenza predefinita
  const getDefaultExpiryDate = (category) => {
    const today = new Date()
    let daysToAdd = 7
    
    // Categorie predefinite
    if (category === 'latticini') daysToAdd = 7
    else if (category === 'carne') daysToAdd = 3
    else if (category === 'pesce') daysToAdd = 2
    else if (category === 'verdure') daysToAdd = 7
    else if (category === 'frutta') daysToAdd = 7
    else if (category === 'dispensa') daysToAdd = 365
    else if (category === 'condimenti') daysToAdd = 730
    else if (category === 'surgelati') daysToAdd = 180
    
    const expiryDate = new Date(today)
    expiryDate.setDate(today.getDate() + daysToAdd)
    return expiryDate.toISOString().split('T')[0]
  }

  // Funzione per reinserire un ingrediente già utilizzato
  const reinsertUsedIngredient = (usedIngredient) => {
    // Rimuovi l'ingrediente dalla lista degli utilizzati
    setUsedIngredients(prev => prev.filter(item => item.id !== usedIngredient.id))
    
    // Pre-compila il form con i dati dell'ingrediente
    setFormData({
      name: usedIngredient.name,
      category: usedIngredient.category,
      expiryDate: getDefaultExpiryDate(usedIngredient.category),
      department: usedIngredient.department || '',
      conservationPoint: usedIngredient.conservationPoint || '',
      allergens: usedIngredient.allergens || [],
      notes: usedIngredient.notes || '',
      lotNumber: usedIngredient.lotNumber || '',
      batchDeliveryDate: usedIngredient.batchDeliveryDate || '',
      associatedOrderId: usedIngredient.associatedOrderId || '',
      supplierName: usedIngredient.supplierName || ''
    })
    
    setShowAddForm(true)
    setShowUsedIngredients(false)
  }

  // Funzioni per gestione Ordini
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
          batchDeliveryDate: orderFormData.orderDate,
          lotNumber: `L${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${Math.random().toString(36).substr(2, 3).toUpperCase()}`
        }
      }
      return product
    })
    
    setProducts(updatedProducts)
    setOrderItems([])
    setShowOrderForm(false)
    
    // Reset form
    setOrderFormData({
      orderId: '',
      supplierName: '',
      orderDate: new Date().toISOString().split('T')[0],
      notes: ''
    })
  }

  // Funzioni per gestione Lista della Spesa
  const toggleShoppingItem = (productId) => {
    setShoppingItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const generateShoppingListPDF = () => {
    const doc = new jsPDF()
    
    // Titolo
    doc.setFontSize(20)
    doc.text('Lista della Spesa', 20, 30)
    
    // Data
    doc.setFontSize(12)
    doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 20, 45)
    
    // Prodotti selezionati
    let yPosition = 60
    doc.setFontSize(14)
    doc.text('Prodotti da acquistare:', 20, yPosition)
    yPosition += 10
    
    const selectedProducts = products.filter(product => shoppingItems.includes(product.id))
    
    if (selectedProducts.length === 0) {
      doc.setFontSize(12)
      doc.text('Nessun prodotto selezionato', 20, yPosition)
    } else {
      doc.setFontSize(10)
      selectedProducts.forEach((product, index) => {
        if (yPosition > 280) {
          doc.addPage()
          yPosition = 20
        }
        
        const categoryInfo = CATEGORIES.find(c => c.id === product.category)
        doc.text(`${index + 1}. ${product.name}`, 20, yPosition)
        if (categoryInfo) {
          doc.text(`   Categoria: ${categoryInfo.name}`, 25, yPosition + 5)
        }
        if (product.department) {
          doc.text(`   Reparto: ${product.department}`, 25, yPosition + 10)
        }
        if (product.conservationPoint) {
          doc.text(`   Punto di Conservazione: ${product.conservationPoint}`, 25, yPosition + 15)
        }
        yPosition += 20
      })
    }
    
    // Salva il PDF
    doc.save(`lista-spesa-${new Date().toISOString().split('T')[0]}.pdf`)
    
    // Chiudi il modal e resetta la lista
    setShowShoppingList(false)
    setShoppingItems([])
  }

  // Funzione per raggruppare i prodotti
  const groupProducts = (products) => {
    if (groupByDepartment) {
      const grouped = {}
      products.forEach(product => {
        const key = product.department || 'Non assegnato'
        if (!grouped[key]) {
          grouped[key] = []
        }
        grouped[key].push(product)
      })
      return grouped
    } else if (groupByConservationPoint) {
      const grouped = {}
      products.forEach(product => {
        const key = product.conservationPoint || 'Non assegnato'
        if (!grouped[key]) {
          grouped[key] = []
        }
        grouped[key].push(product)
      })
      return grouped
    }
    return { 'Tutti i prodotti': products }
  }

  // Filtri prodotti
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.conservationPoint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      CATEGORIES.find(c => c.id === product.category)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !filterCategory || product.category === filterCategory
    
    let matchesExpiry = true
    if (filterExpiry) {
      const expiryStatus = getExpiryStatus(product.expiryDate)
      matchesExpiry = expiryStatus.status === filterExpiry
    }
    
    const matchesAllergen = !filterAllergen || 
      (product.allergens && product.allergens.includes(filterAllergen))
    
    const matchesLot = !filterLot || 
      (product.lotNumber && product.lotNumber.toLowerCase().includes(filterLot.toLowerCase()))
    
    const matchesSupplier = !filterSupplier || 
      (product.supplierName && product.supplierName.toLowerCase().includes(filterSupplier.toLowerCase()))
    
    const matchesOrderId = !filterOrderId || 
      (product.associatedOrderId && product.associatedOrderId.toLowerCase().includes(filterOrderId.toLowerCase()))
    
    const matchesDepartment = !filterDepartment || product.department === filterDepartment
    
    const matchesConservationPoint = !filterConservationPoint || product.conservationPoint === filterConservationPoint
    
    return matchesSearch && matchesCategory && matchesExpiry && matchesAllergen && matchesLot && matchesSupplier && matchesOrderId && matchesDepartment && matchesConservationPoint
  })

  // Gestione form
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      department: '',
      conservationPoint: '',
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
    
    if (!formData.name || !formData.category || !formData.department || !formData.conservationPoint || !formData.expiryDate) {
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
      department: product.department || '',
      conservationPoint: product.conservationPoint || '',
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
    const productToDelete = products.find(p => p.id === id)
    if (productToDelete) {
      // Aggiungi il prodotto alla lista degli ingredienti utilizzati
      const usedIngredient = {
        ...productToDelete,
        usedDate: new Date().toISOString(),
        id: `used_${Date.now()}_${productToDelete.id}`
      }
      setUsedIngredients(prev => [...prev, usedIngredient])
    }
    
    // Rimuovi il prodotto dall'inventario
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const handleQuickAdd = (product) => {
    const today = new Date()
    const expiryDate = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 giorni da oggi
    
    // Trova il punto di conservazione appropriato per la categoria
    const appropriateConservationPoint = getAppropriateRefrigerator(product.category)
    const conservationPoint = conservationPoints.find(cp => cp.name === appropriateConservationPoint)
    const department = conservationPoint?.location || ''
    
    const quickProduct = {
      ...product,
      id: Date.now().toString(),
      department: department,
      conservationPoint: appropriateConservationPoint,
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
      if (product.department) {
        doc.text(`   Reparto: ${product.department}`, 25, y + 10)
      }
      if (product.conservationPoint) {
        doc.text(`   Punto di Conservazione: ${product.conservationPoint}`, 25, y + 15)
      }
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
              <Button 
                variant="outline" 
                onClick={() => setShowUsedIngredients(!showUsedIngredients)}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Ingredienti Utilizzati ({usedIngredients.length})
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Cerca</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome prodotto, reparto, punto di conservazione..."
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
            
            <div>
              <Label htmlFor="lot">Numero Lotto</Label>
              <Input
                id="lot"
                value={filterLot}
                onChange={(e) => setFilterLot(e.target.value)}
                placeholder="Filtra per numero lotto..."
              />
            </div>
            
            <div>
              <Label htmlFor="supplier">Fornitore</Label>
              <Input
                id="supplier"
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                placeholder="Filtra per fornitore..."
              />
            </div>
            
            <div>
              <Label htmlFor="orderId">ID Ordine</Label>
              <Input
                id="orderId"
                value={filterOrderId}
                onChange={(e) => setFilterOrderId(e.target.value)}
                placeholder="Filtra per ID ordine..."
              />
            </div>
            
            <div>
              <Label htmlFor="department">Reparto</Label>
              <select
                id="department"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tutti i reparti</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="conservationPoint">Punto di Conservazione</Label>
              <select
                id="conservationPoint"
                value={filterConservationPoint}
                onChange={(e) => setFilterConservationPoint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tutti i punti</option>
                {conservationPoints.map(point => (
                  <option key={point.id} value={point.name}>{point.name}</option>
                ))}
              </select>
            </div>
            
            <div className="col-span-full">
              <div className="flex flex-wrap gap-4 items-center mb-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="groupByDepartment"
                    checked={groupByDepartment}
                    onChange={(e) => {
                      setGroupByDepartment(e.target.checked)
                      if (e.target.checked) setGroupByConservationPoint(false)
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="groupByDepartment" className="text-sm">Raggruppa per Reparto</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="groupByConservationPoint"
                    checked={groupByConservationPoint}
                    onChange={(e) => {
                      setGroupByConservationPoint(e.target.checked)
                      if (e.target.checked) setGroupByDepartment(false)
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="groupByConservationPoint" className="text-sm">Raggruppa per Punto di Conservazione</Label>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  setSearchTerm('')
                  setFilterCategory('')
                  setFilterExpiry('')
                  setFilterAllergen('')
                  setFilterLot('')
                  setFilterSupplier('')
                  setFilterOrderId('')
                  setFilterDepartment('')
                  setFilterConservationPoint('')
                  setGroupByDepartment(false)
                  setGroupByConservationPoint(false)
                }}
                variant="outline"
                className="w-full"
              >
                🔄 Reset Filtri
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert prodotti senza punto di conservazione */}
      {showMissingConservationAlert && productsWithoutConservation.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Attenzione: {productsWithoutConservation.length} prodotti senza punto di conservazione!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              I seguenti prodotti devono essere posizionati in un adeguato punto di conservazione:
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {productsWithoutConservation.map(product => {
                const category = CATEGORIES.find(c => c.id === product.category)
                return (
                  <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-gray-600">
                        ({category?.name || 'Categoria sconosciuta'})
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        handleEdit(product)
                        setShowMissingConservationAlert(false)
                      }}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Assegna
                    </Button>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setShowMissingConservationAlert(false)}
                variant="outline"
                size="sm"
              >
                Chiudi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              {Object.entries(groupProducts(filteredProducts)).map(([groupName, groupProducts]) => (
                <div key={groupName}>
                  {(groupByDepartment || groupByConservationPoint) && (
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 bg-gray-100 px-3 py-2 rounded-md">
                      {groupName} ({groupProducts.length} prodotti)
                    </h3>
                  )}
                  <div className="space-y-3">
                    {groupProducts.map(product => {
                      const category = CATEGORIES.find(c => c.id === product.category)
                      const expiryStatus = getExpiryStatus(product.expiryDate)
                      
                      return (
                        <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{product.name || 'Prodotto non disponibile'}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${category?.color}`}>
                            {category?.name}
                            </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${expiryStatus.color}`}>
                            {expiryStatus.label}
                          </span>
                          </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>🏢 Reparto: {product.department || 'Non assegnato'}</p>
                          <p>📍 Punto: {product.conservationPoint || 'Non assegnato'}</p>
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
                </div>
              ))}
              </div>
            )}
          </CardContent>
        </Card>

      {/* 2. Prodotti nell'inventario */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Prodotti nell'inventario ({filteredProducts.length})
              {(groupByDepartment || groupByConservationPoint) && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  - Raggruppati per {groupByDepartment ? 'Reparto' : 'Punto di Conservazione'}
                </span>
              )}
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
              {Object.entries(groupProducts(filteredProducts)).map(([groupName, groupProducts]) => (
                <div key={groupName}>
                  {(groupByDepartment || groupByConservationPoint) && (
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 bg-gray-100 px-3 py-2 rounded-md">
                      {groupName} ({groupProducts.length} prodotti)
                    </h3>
                  )}
                  <div className="space-y-3">
                    {groupProducts.map(product => {
                      const category = CATEGORIES.find(c => c.id === product.category)
                      const expiryStatus = getExpiryStatus(product.expiryDate)
                      
                      return (
                        <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{product.name || 'Prodotto non disponibile'}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${category?.color}`}>
                            {category?.name}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${expiryStatus.color}`}>
                            {expiryStatus.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>🏢 Reparto: {product.department || 'Non assegnato'}</p>
                          <p>📍 Punto: {product.conservationPoint || 'Non assegnato'}</p>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gestione Reparti e Punti di Conservazione */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestione Reparti e Punti di Conservazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gestione Reparti */}
            <div>
              <h3 className="font-semibold mb-3">Reparti Attivi ({departments.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {departments.map(dept => {
                  const productsInDept = products.filter(p => p.department === dept.name).length
                  return (
                    <div key={dept.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{dept.name}</span>
                        <span className="text-sm text-gray-600 ml-2">({productsInDept} prodotti)</span>
                      </div>
                      <Button
                        onClick={() => handleDepartmentDeletion(dept.name)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Gestione Punti di Conservazione */}
            <div>
              <h3 className="font-semibold mb-3">Punti di Conservazione ({conservationPoints.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {conservationPoints.map(point => {
                  const productsInPoint = products.filter(p => p.conservationPoint === point.name).length
                  return (
                    <div key={point.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{point.name}</span>
                        <span className="text-sm text-gray-600 ml-2">({productsInPoint} prodotti)</span>
                        <div className="text-xs text-gray-500">
                          {point.location} • {point.targetTemp}°C
                        </div>
                      </div>
                      <Button
                        onClick={() => handleConservationPointDeletion(point.name)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
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
                          <div className="font-medium text-sm text-green-900">{product.name || 'Prodotto non disponibile'}</div>
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

      {/* 3. Ordini e Spesa */}
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
                          <div className="font-medium text-sm">{product.name || 'Prodotto non disponibile'}</div>
                          <div className="text-xs text-gray-500">
                            {product.department && product.conservationPoint 
                              ? `${product.department} • ${product.conservationPoint}`
                              : product.department || product.conservationPoint || 'Non assegnato'
                            }
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                Selezionati: {shoppingItems.length} prodotti
              </div>
            </div>

            {/* Gestione Ordini */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">📦 Gestione Ordini</h3>
                <Button 
                  onClick={() => setShowOrderForm(true)}
                  disabled={orderItems.length === 0}
                  size="sm"
                  variant="outline"
                >
                  📋 Crea Ordine
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
                          <div className="font-medium text-sm">{product.name || 'Prodotto non disponibile'}</div>
                          <div className="text-xs text-gray-500">
                            {product.department && product.conservationPoint 
                              ? `${product.department} • ${product.conservationPoint}`
                              : product.department || product.conservationPoint || 'Non assegnato'
                            }
                          </div>
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

      {/* 4. Ingredienti già utilizzati */}
      {showUsedIngredients && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-600" />
              Ingredienti già Utilizzati ({usedIngredients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usedIngredients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Nessun ingrediente utilizzato</p>
                <p className="text-sm">I prodotti eliminati dall'inventario appariranno qui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {usedIngredients.map(ingredient => (
                  <div 
                    key={ingredient.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg opacity-75"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{ingredient.name}</div>
                      <div className="text-sm text-gray-600">
                        {CATEGORIES.find(c => c.id === ingredient.category)?.name} • 
                        {ingredient.location} • 
                        Utilizzato: {new Date(ingredient.usedDate).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => reinsertUsedIngredient(ingredient)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        ✅ Reinserisci
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm('Sei sicuro di voler eliminare definitivamente questo ingrediente?')) {
                            setUsedIngredients(prev => prev.filter(ing => ing.id !== ingredient.id))
                          }
                        }}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        🗑️ Elimina
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. Categorie Personalizzate */}
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
                  <Label htmlFor="department">Reparto *</Label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleziona reparto</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="conservationPoint">Punto di Conservazione *</Label>
                  <select
                    id="conservationPoint"
                    value={formData.conservationPoint}
                    onChange={(e) => handleInputChange('conservationPoint', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleziona punto di conservazione</option>
                    {conservationPoints.map(point => (
                      <option key={point.id} value={point.name}>{point.name}</option>
                    ))}
                  </select>
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
                  placeholder="Cerca prodotti, reparti, punti..."
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
                    product.department?.toLowerCase().includes(bulkSearchTerm.toLowerCase()) ||
                    product.conservationPoint?.toLowerCase().includes(bulkSearchTerm.toLowerCase()) ||
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
                        <div className="font-medium">{product.name || 'Prodotto non disponibile'}</div>
                        <div className="text-sm text-gray-500">
                          {category?.name} • {product.department || 'N/A'} • {product.conservationPoint || 'N/A'} • Scade: {new Date(product.expiryDate).toLocaleDateString('it-IT')}
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

      {/* Modal Lista della Spesa */}
      {showShoppingList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">🛒 Lista della Spesa</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Prodotti selezionati per la lista della spesa ({shoppingItems.length}):
              </p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {shoppingItems.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">Nessun prodotto selezionato</p>
                    <p className="text-xs">Torna alla sezione inventario per selezionare i prodotti</p>
                  </div>
                ) : (
                  products
                    .filter(product => shoppingItems.includes(product.id))
                    .map(product => {
                      const categoryInfo = CATEGORIES.find(c => c.id === product.category)
                      return (
                        <div key={product.id} className="flex items-center p-3 border rounded bg-gray-50">
                          <div className="flex-1">
                            <div className="font-medium">{product.name || 'Prodotto non disponibile'}</div>
                            <div className="text-sm text-gray-600">
                              {categoryInfo?.name} • {product.department || 'N/A'} • {product.conservationPoint || 'N/A'}
                            </div>
                          </div>
                        </div>
                      )
                    })
                )}
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
                    placeholder="Nome fornitore"
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
                  <Label>Note</Label>
                  <Input
                    value={orderFormData.notes}
                    onChange={(e) => setOrderFormData({...orderFormData, notes: e.target.value})}
                    placeholder="Note aggiuntive..."
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Prodotti selezionati ({orderItems.length}):</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {products.filter(product => orderItems.includes(product.id)).map(product => {
                    const category = CATEGORIES.find(c => c.id === product.category)
                    return (
                      <div key={product.id} className="p-2 border rounded">
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-gray-600">
                          {category?.name} • {product.department || 'N/A'} • {product.conservationPoint || 'N/A'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  📦 Crea Ordine
                </Button>
                <Button 
                  type="button"
                  onClick={() => setShowOrderForm(false)} 
                  variant="outline"
                >
                  Annulla
                </Button>
              </div>
            </div>
            </form>
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
