import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Trash2, Thermometer, AlertTriangle, CheckCircle, User, Plus, Search, MapPin, Calendar, Settings, Edit, X } from 'lucide-react'
import { getConservationSuggestions, getOptimalTemperature } from '../utils/temperatureDatabase'
import TemperatureInput from './ui/TemperatureInput'

// Categorie predefinite per i punti di conservazione (sincronizzate con Inventory.jsx)
const STORAGE_CATEGORIES = [
  { id: 'latticini', name: 'Latticini e Formaggi', description: 'Latte, formaggi freschi e stagionati' },
  { id: 'carni', name: 'Carni e Salumi', description: 'Carni crude, salumi, pollame' },
  { id: 'verdure', name: 'Verdure e Ortaggi', description: 'Verdure fresche, ortaggi, insalate' },
  { id: 'frutta', name: 'Frutta Fresca', description: 'Frutta fresca di stagione' },
  { id: 'pesce_fresco', name: 'Pesce Fresco', description: 'Pesce fresco, molluschi, crostacei' },
  { id: 'pesce_surgelato', name: 'Pesce Surgelato', description: 'Pesce e prodotti della pesca surgelati' },
  { id: 'surgelati', name: 'Surgelati', description: 'Tutti i prodotti surgelati' },
  { id: 'dispensa', name: 'Dispensa Secca', description: 'Pasta, riso, farina, conserve' },
  { id: 'condimenti', name: 'Oli e Condimenti', description: 'Oli, aceti, spezie, salse' },
  { id: 'hot_holding', name: 'Mantenimento Caldo', description: 'Piatti pronti caldi, mantenuti a temperatura' },
  { id: 'ambiente', name: 'Temperatura Ambiente', description: 'Prodotti conservati a temperatura ambiente (15-25°C)' },
  { id: 'altro', name: 'Altro', description: 'Altre categorie di prodotti' }
]

function Refrigerators({ temperatures, setTemperatures, currentUser, refrigerators, setRefrigerators }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRefrigerator, setEditingRefrigerator] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    setTemperatureMin: '',
    setTemperatureMax: '',
    location: '',
    dedicatedTo: '',
    nextMaintenance: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRefrigerator, setSelectedRefrigerator] = useState(null)
  const [showTemperatureHistory, setShowTemperatureHistory] = useState(false)
  
  // Nuovi stati per la gestione delle categorie personalizzate
  const [customCategories, setCustomCategories] = useState([])
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false)
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: '',
    temperatureMin: '',
    temperatureMax: '',
    notes: ''
  })

  // Combina le categorie predefinite con quelle personalizzate
  const allCategories = [...STORAGE_CATEGORIES, ...customCategories]

  // Carica le categorie personalizzate dal localStorage all'avvio
  useEffect(() => {
    const savedCategories = localStorage.getItem('customStorageCategories')
    if (savedCategories) {
      try {
        setCustomCategories(JSON.parse(savedCategories))
      } catch (error) {
        console.error('Errore nel caricamento delle categorie personalizzate:', error)
      }
    }
  }, [])

  // Salva le categorie personalizzate nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem('customStorageCategories', JSON.stringify(customCategories))
  }, [customCategories])



  // Funzione per aggiungere una nuova categoria personalizzata
  const addCustomCategory = () => {
    if (!newCategoryData.name.trim() || !newCategoryData.description.trim()) {
      alert('Nome e descrizione sono obbligatori')
      return
    }

    // Validazione temperature se inserite
    if (newCategoryData.temperatureMin && newCategoryData.temperatureMax) {
      const tempMin = parseFloat(newCategoryData.temperatureMin)
      const tempMax = parseFloat(newCategoryData.temperatureMax)
      
      if (isNaN(tempMin) || isNaN(tempMax)) {
        alert('Inserisci temperature valide')
        return
      }
      
      if (tempMin >= tempMax) {
        alert('La temperatura minima deve essere inferiore alla temperatura massima')
        return
      }
    }

    // Genera un ID univoco per la nuova categoria
    const newCategory = {
      id: `custom_${Date.now()}`,
      name: newCategoryData.name.trim(),
      description: newCategoryData.description.trim(),
      temperatureMin: newCategoryData.temperatureMin ? parseFloat(newCategoryData.temperatureMin) : null,
      temperatureMax: newCategoryData.temperatureMax ? parseFloat(newCategoryData.temperatureMax) : null,
      temperatureRange: newCategoryData.temperatureMin && newCategoryData.temperatureMax ? 
        `${newCategoryData.temperatureMin}-${newCategoryData.temperatureMax}°C` : '',
      notes: newCategoryData.notes.trim(),
      isCustom: true,
      createdAt: new Date().toISOString()
    }

    setCustomCategories(prev => {
      const updated = [...prev, newCategory]
      console.log('🔍 Categorie aggiornate:', updated)
      return updated
    })
    
    // Reset del form e chiusura del form espandibile
    setNewCategoryData({
      name: '',
      description: '',
      temperatureMin: '',
      temperatureMax: '',
      notes: ''
    })
    setShowAddCategoryForm(false)
    
    // Mostra conferma
    alert(`Categoria "${newCategory.name}" aggiunta con successo!`)
  }

  // Funzione per eliminare una categoria personalizzata
  const deleteCustomCategory = (categoryId) => {
    if (!confirm('Sei sicuro di voler eliminare questa categoria? I frigoriferi che la utilizzano non avranno più una categoria assegnata.')) {
      return
    }

    // Rimuovi la categoria dai frigoriferi che la utilizzano
    setRefrigerators(prev => prev.map(ref => 
      ref.dedicatedTo === categoryId ? { ...ref, dedicatedTo: '' } : ref
    ))

    // Rimuovi la categoria
    setCustomCategories(prev => prev.filter(cat => cat.id !== categoryId))
  }

  // Funzione per determinare il tipo di punto di conservazione in base alla temperatura
  const getRefrigeratorType = (temperature) => {
    if (temperature < -13.5 && temperature >= -80) {
      return 'Abbattitore'
    } else if (temperature < -2.5 && temperature >= -13.5) {
      return 'Freezer'
    } else if ((temperature >= -2.5 && temperature <= 0) || (temperature > 0 && temperature <= 14)) {
      return 'Frigo'
    } else if (temperature >= 15 && temperature <= 25) {
      return 'Ambiente'
    } else {
      return 'N/A'
    }
  }

  // Funzione per aprire la cronologia temperature
  const openTemperatureHistory = (refrigerator) => {
    setSelectedRefrigerator(refrigerator)
    setShowTemperatureHistory(true)
  }

  // Funzione per ottenere tutte le temperature di un frigorifero
  const getRefrigeratorTemperatures = (refrigerator) => {
    return temperatures
      .filter(temp => temp.location.toLowerCase().includes(refrigerator.name.toLowerCase()))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }



  const addRefrigerator = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.setTemperatureMin.trim() || !formData.setTemperatureMax.trim()) {
      return
    }

    // Check for duplicate name (only among currently active refrigerators)
    // Note: Deleted refrigerators are removed from the array, so their names can be reused
    const existingRefrigerator = refrigerators.find(ref => 
      ref.name.toLowerCase() === formData.name.trim().toLowerCase()
    )
    
    if (existingRefrigerator) {
      alert(`Un punto di conservazione con questo nome esiste già: "${existingRefrigerator.name}" (creato il ${new Date(existingRefrigerator.createdAt).toLocaleDateString('it-IT')}). Scegli un nome diverso.`)
      return
    }

    const setTempMin = parseFloat(formData.setTemperatureMin)
    const setTempMax = parseFloat(formData.setTemperatureMax)
    if (isNaN(setTempMin) || isNaN(setTempMax) || setTempMin >= setTempMax) {
      alert('Inserisci un range di temperatura valido (min < max)')
      return
    }

    // Validazione temperatura se è stata selezionata una categoria
    if (formData.dedicatedTo && formData.dedicatedTo !== 'altro') {
      const optimalTemp = getOptimalTemperature(formData.dedicatedTo)
      const avgTemp = (setTempMin + setTempMax) / 2
      const tempDiff = Math.abs(avgTemp - (optimalTemp.min + optimalTemp.max) / 2)
      
      // Se la temperatura è troppo diversa da quella ottimale, mostra un warning
      if (tempDiff > 5) {
        const categoryName = STORAGE_CATEGORIES.find(cat => cat.id === formData.dedicatedTo)?.name
        const shouldContinue = confirm(
          `⚠️ ATTENZIONE: Temperatura non ottimale!\n\n` +
          `Hai impostato: ${setTempMin}-${setTempMax}°C\n` +
          `Temperatura ottimale per ${categoryName}: ${optimalTemp.min}-${optimalTemp.max}°C\n\n` +
          `Questa temperatura potrebbe non essere adatta per la conservazione ottimale degli alimenti di questa categoria.\n\n` +
          `Vuoi continuare comunque?`
        )
        
        if (!shouldContinue) {
          return
        }
      }
    }

    const newRefrigerator = {
      id: Date.now(),
      name: formData.name.trim(),
      setTemperatureMin: setTempMin,
      setTemperatureMax: setTempMax,
      setTemperature: `${setTempMin}-${setTempMax}°C`, // Mantiene compatibilità
      location: formData.location.trim(),
      dedicatedTo: formData.dedicatedTo.trim(),
      nextMaintenance: formData.nextMaintenance.trim(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Unknown'
    }

    setRefrigerators([...refrigerators, newRefrigerator])
    setFormData({
      name: '',
      setTemperatureMin: '',
      setTemperatureMax: '',
      location: '',
      dedicatedTo: '',
      nextMaintenance: ''
    })
    setShowAddModal(false)
  }

  const deleteRefrigerator = (id) => {
    if (confirm('Sei sicuro di voler eliminare questo punto di conservazione?')) {
      setRefrigerators(refrigerators.filter(ref => ref.id !== id))
    }
  }

  const editRefrigerator = (refrigerator) => {
    setEditingRefrigerator(refrigerator)
    
    // Gestisce sia i vecchi frigoriferi (con setTemperature singola) che i nuovi (con range)
    let tempMin = ''
    let tempMax = ''
    
    if (refrigerator.setTemperatureMin && refrigerator.setTemperatureMax) {
      // Nuovo formato con range
      tempMin = refrigerator.setTemperatureMin.toString()
      tempMax = refrigerator.setTemperatureMax.toString()
    } else if (refrigerator.setTemperature) {
      // Vecchio formato - estrae il valore singolo
      const temp = parseFloat(refrigerator.setTemperature)
      if (!isNaN(temp)) {
        tempMin = temp.toString()
        tempMax = temp.toString()
      }
    }
    
    setFormData({
      name: refrigerator.name,
      setTemperatureMin: tempMin,
      setTemperatureMax: tempMax,
      location: refrigerator.location || '',
      dedicatedTo: refrigerator.dedicatedTo || '',
      nextMaintenance: refrigerator.nextMaintenance || ''
    })
    setShowEditModal(true)
  }

  const updateRefrigerator = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.setTemperatureMin.trim() || !formData.setTemperatureMax.trim()) {
      return
    }

    // Check for duplicate name (excluding the current refrigerator being edited)
    const existingRefrigerator = refrigerators.find(ref => 
      ref.id !== editingRefrigerator.id && 
      ref.name.toLowerCase() === formData.name.trim().toLowerCase()
    )
    
    if (existingRefrigerator) {
      alert('Un punto di conservazione con questo nome esiste già. Scegli un nome diverso.')
      return
    }

    const setTempMin = parseFloat(formData.setTemperatureMin)
    const setTempMax = parseFloat(formData.setTemperatureMax)
    if (isNaN(setTempMin) || isNaN(setTempMax) || setTempMin >= setTempMax) {
      alert('Inserisci un range di temperatura valido (min < max)')
      return
    }

    // Validazione temperatura se è stata selezionata una categoria
    if (formData.dedicatedTo && formData.dedicatedTo !== 'altro') {
      const optimalTemp = getOptimalTemperature(formData.dedicatedTo)
      
      // Verifica se il range di temperatura del frigorifero è compatibile con quello ottimale
      const isCompatible = (
        (setTempMin <= optimalTemp.max && setTempMax >= optimalTemp.min) ||
        (optimalTemp.min <= setTempMax && optimalTemp.max >= setTempMin)
      )
      
      if (!isCompatible) {
        const categoryName = STORAGE_CATEGORIES.find(cat => cat.id === formData.dedicatedTo)?.name
        const shouldContinue = confirm(
          `🚨 ERRORE: Temperatura INCOMPATIBILE!\n\n` +
          `Hai impostato: ${setTempMin}-${setTempMax}°C\n` +
          `Temperatura ottimale per ${categoryName}: ${optimalTemp.min}-${optimalTemp.max}°C\n\n` +
          `Questo range di temperatura NON è adatto per la conservazione degli alimenti di questa categoria.\n\n` +
          `Vuoi continuare comunque? (Non raccomandato)`
        )
        
        if (!shouldContinue) {
          return
        }
      } else if (Math.abs(setTempMin - optimalTemp.min) > 2 || Math.abs(setTempMax - optimalTemp.max) > 2) {
        // Se è compatibile ma non ottimale, mostra un warning
        const categoryName = STORAGE_CATEGORIES.find(cat => cat.id === formData.dedicatedTo)?.name
        const shouldContinue = confirm(
          `⚠️ ATTENZIONE: Temperatura non ottimale!\n\n` +
          `Hai impostato: ${setTempMin}-${setTempMax}°C\n` +
          `Temperatura ottimale per ${categoryName}: ${optimalTemp.min}-${optimalTemp.max}°C\n\n` +
          `Questa temperatura è compatibile ma potrebbe non essere ideale per la conservazione ottimale.\n\n` +
          `Vuoi continuare comunque?`
        )
        
        if (!shouldContinue) {
          return
        }
      }
    }

    const updatedRefrigerator = {
      ...editingRefrigerator,
      name: formData.name.trim(),
      setTemperatureMin: setTempMin,
      setTemperatureMax: setTempMax,
      setTemperature: `${setTempMin}-${setTempMax}°C`, // Mantiene compatibilità
      location: formData.location.trim(),
      dedicatedTo: formData.dedicatedTo.trim(),
      nextMaintenance: formData.nextMaintenance.trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || 'Unknown'
    }

    setRefrigerators(refrigerators.map(ref => 
      ref.id === editingRefrigerator.id ? updatedRefrigerator : ref
    ))
    
    setFormData({
      name: '',
      setTemperatureMin: '',
      setTemperatureMax: '',
      location: '',
      dedicatedTo: '',
      nextMaintenance: ''
    })
    setEditingRefrigerator(null)
    setShowEditModal(false)
  }

  const getTemperatureStatus = (refrigerator) => {
    // Find the last temperature recording for this refrigerator
    const lastTemperature = temperatures
      .filter(temp => temp.location.toLowerCase().includes(refrigerator.name.toLowerCase()))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]

    if (!lastTemperature) return 'no-data'

    const tempDiff = Math.abs(lastTemperature.temperature - refrigerator.setTemperature)
    
    if (tempDiff <= 1) return 'green'
    if (tempDiff <= 1.5) return 'orange'
    if (tempDiff >= 2) return 'red'
    return 'orange' // Default case
  }

  const getStatusDot = (status) => {
    const colors = {
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      'no-data': 'bg-gray-400'
    }
    return <div className={`w-3 h-3 rounded-full ${colors[status]}`}></div>
  }

  const getStatusText = (status) => {
    const texts = {
      green: 'Temperatura OK',
      orange: 'Attenzione',
      red: 'Critica',
      'no-data': 'Nessun dato'
    }
    return texts[status]
  }

  const filteredRefrigerators = refrigerators.filter(ref => 
    ref.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTemperatures = temperatures.filter(temp => 
    refrigerators.some(ref => 
      temp.location.toLowerCase().includes(ref.name.toLowerCase())
    )
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return (
    <div className="space-y-6">
      {/* Section 1: Punti di Conservazione */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Punti di Conservazione
            </span>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Aggiungi Punto di Conservazione
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Informazioni sulla nuova logica */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800 mb-2">🆕 Nuova Logica di Gestione</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Ora puoi assegnare categorie specifiche ai punti di conservazione per garantire la corretta gestione HACCP:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Assegna categorie ai frigoriferi per limitare i tipi di prodotti</li>
                  <li>Previeni errori di conservazione e contaminazioni</li>
                  <li>Migliora la tracciabilità e la sicurezza alimentare</li>
                  <li>L'applicazione valida automaticamente la compatibilità</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Sezione Categorie Personalizzate */}
          {customCategories.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-green-600">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium text-green-800">📋 Categorie Personalizzate</h3>
                </div>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {customCategories.length} categoria{customCategories.length === 1 ? 'a' : 'e'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {customCategories.map(category => (
                  <div key={category.id} className="p-3 bg-white border border-green-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-green-800">{category.name}</h4>
                        <p className="text-sm text-green-700">{category.description}</p>
                        {category.temperatureRange && (
                          <p className="text-xs text-green-600 mt-1">
                            🌡️ {category.temperatureRange}
                          </p>
                        )}
                        {category.notes && (
                          <p className="text-xs text-green-600 mt-1">
                            📝 {category.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteCustomCategory(category.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Elimina categoria"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-green-500">
                      Creata il {new Date(category.createdAt).toLocaleDateString('it-IT')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {refrigerators.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Thermometer className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nessun punto di conservazione registrato</p>
              <p className="text-sm">Aggiungi il primo punto di conservazione per iniziare</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Categorie frigoriferi */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Frigoriferi (-2.5°C a 0°C e 0°C a +14°C) */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Frigoriferi
                  </h3>
                  <div className="space-y-2">
                    {filteredRefrigerators
                      .filter(ref => (ref.setTemperature >= -2.5 && ref.setTemperature <= 0) || (ref.setTemperature > 0 && ref.setTemperature <= 14))
                      .map(refrigerator => {
                        const status = getTemperatureStatus(refrigerator)
                        return (
                          <div key={refrigerator.id} className={`p-3 border rounded-lg ${
                            status === 'green' ? 'bg-green-50 border-green-200' :
                            status === 'orange' ? 'bg-orange-50 border-orange-200' :
                            status === 'red' ? 'bg-red-50 border-red-200' :
                            'bg-white border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusDot(status)}
                                <div>
                                  <h4 className="font-medium text-sm">{refrigerator.name}</h4>
                                  <p className={`text-xs ${
                                    status === 'green' ? 'text-green-600' :
                                    status === 'orange' ? 'text-orange-600' :
                                    status === 'red' ? 'text-red-600' :
                                    'text-gray-600'
                                  }`}>{getStatusText(status)}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {currentUser?.role === 'admin' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => editRefrigerator(refrigerator)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => deleteRefrigerator(refrigerator.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {refrigerator.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-500" />
                                  <span className="text-gray-600">{refrigerator.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Thermometer className="h-3 w-3 text-gray-500" />
                                <span className="font-medium">{refrigerator.setTemperature}°C</span>
                              </div>
                            </div>
                            {refrigerator.dedicatedTo && (
                              <div className="mt-2 text-xs">
                                <span className="text-gray-500">Categoria: </span>
                                <span className="font-medium text-gray-700">
                                  {allCategories.find(cat => cat.id === refrigerator.dedicatedTo)?.name || refrigerator.dedicatedTo}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    {filteredRefrigerators.filter(ref => (ref.setTemperature >= -2.5 && ref.setTemperature <= 0) || (ref.setTemperature > 0 && ref.setTemperature <= 14)).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nessun frigorifero</p>
                    )}
                  </div>
                </div>

                {/* Freezer (-2.5°C a -13.5°C) */}
                <div className="border rounded-lg p-4 bg-purple-50">
                  <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Freezer
                  </h3>
                  <div className="space-y-2">
                    {filteredRefrigerators
                      .filter(ref => ref.setTemperature < -2.5 && ref.setTemperature >= -13.5)
                      .map(refrigerator => {
                        const status = getTemperatureStatus(refrigerator)
                        return (
                          <div key={refrigerator.id} className={`p-3 border rounded-lg ${
                            status === 'green' ? 'bg-green-50 border-green-200' :
                            status === 'orange' ? 'bg-orange-50 border-orange-200' :
                            status === 'red' ? 'bg-red-50 border-red-200' :
                            'bg-white border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusDot(status)}
                                <div>
                                  <h4 className="font-medium text-sm">{refrigerator.name}</h4>
                                  <p className={`text-xs ${
                                    status === 'green' ? 'text-green-600' :
                                    status === 'orange' ? 'text-orange-600' :
                                    status === 'red' ? 'text-red-600' :
                                    'text-gray-600'
                                  }`}>{getStatusText(status)}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {currentUser?.role === 'admin' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => editRefrigerator(refrigerator)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => deleteRefrigerator(refrigerator.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {refrigerator.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-500" />
                                  <span className="text-gray-600">{refrigerator.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Thermometer className="h-3 w-3 text-gray-500" />
                                <span className="font-medium">{refrigerator.setTemperature}°C</span>
                              </div>
                            </div>
                            {refrigerator.dedicatedTo && (
                              <div className="mt-2 text-xs">
                                <span className="text-gray-500">Categoria: </span>
                                <span className="font-medium text-gray-700">
                                  {STORAGE_CATEGORIES.find(cat => cat.id === refrigerator.dedicatedTo)?.name || refrigerator.dedicatedTo}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    {filteredRefrigerators.filter(ref => ref.setTemperature < -2.5 && ref.setTemperature >= -13.5).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nessun freezer</p>
                    )}
                  </div>
                </div>

                {/* Abbattitore (-13.5°C a -80°C) */}
                <div className="border rounded-lg p-4 bg-red-50">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Abbattitore
                  </h3>
                  <div className="space-y-2">
                    {filteredRefrigerators
                      .filter(ref => ref.setTemperature < -13.5 && ref.setTemperature >= -80)
                      .map(refrigerator => {
                        const status = getTemperatureStatus(refrigerator)
                        return (
                          <div key={refrigerator.id} className={`p-3 border rounded-lg ${
                            status === 'green' ? 'bg-green-50 border-green-200' :
                            status === 'orange' ? 'bg-orange-50 border-orange-200' :
                            status === 'red' ? 'bg-red-50 border-red-200' :
                            'bg-white border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusDot(status)}
                                <div>
                                  <h4 className="font-medium text-sm">{refrigerator.name}</h4>
                                  <p className={`text-xs ${
                                    status === 'green' ? 'text-green-600' :
                                    status === 'orange' ? 'text-orange-600' :
                                    status === 'red' ? 'text-red-600' :
                                    'text-gray-600'
                                  }`}>{getStatusText(status)}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {currentUser?.role === 'admin' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => editRefrigerator(refrigerator)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => deleteRefrigerator(refrigerator.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {refrigerator.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-500" />
                                  <span className="text-gray-600">{refrigerator.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Thermometer className="h-3 w-3 text-gray-500" />
                                <span className="font-medium">{refrigerator.setTemperature}°C</span>
                              </div>
                            </div>
                            {refrigerator.dedicatedTo && (
                              <div className="mt-2 text-xs">
                                <span className="text-gray-500">Categoria: </span>
                                <span className="font-medium text-gray-700">
                                  {STORAGE_CATEGORIES.find(cat => cat.id === refrigerator.dedicatedTo)?.name || refrigerator.dedicatedTo}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    {filteredRefrigerators.filter(ref => ref.setTemperature < -13.5 && ref.setTemperature >= -80).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nessun abbattitore</p>
                    )}
                  </div>
                </div>

                {/* Ambiente (15°C a 25°C) */}
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Ambiente
                  </h3>
                  <div className="space-y-2">
                    {filteredRefrigerators
                      .filter(ref => ref.setTemperature >= 15 && ref.setTemperature <= 25)
                      .map(refrigerator => {
                        const status = getTemperatureStatus(refrigerator)
                        return (
                          <div key={refrigerator.id} className={`p-3 border rounded-lg ${
                            status === 'green' ? 'bg-green-50 border-green-200' :
                            status === 'orange' ? 'bg-orange-50 border-orange-200' :
                            status === 'red' ? 'bg-red-50 border-red-200' :
                            'bg-white border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusDot(status)}
                                <div>
                                  <h4 className="font-medium text-sm">{refrigerator.name}</h4>
                                  <p className={`text-xs ${
                                    status === 'green' ? 'text-green-600' :
                                    status === 'orange' ? 'text-orange-600' :
                                    status === 'red' ? 'text-red-600' :
                                    'text-gray-600'
                                  }`}>{getStatusText(status)}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {currentUser?.role === 'admin' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => editRefrigerator(refrigerator)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => deleteRefrigerator(refrigerator.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {refrigerator.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-500" />
                                  <span className="text-gray-600">{refrigerator.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Thermometer className="h-3 w-3 text-gray-500" />
                                <span className="font-medium">{refrigerator.setTemperature}°C</span>
                              </div>
                            </div>
                            {refrigerator.dedicatedTo && (
                              <div className="mt-2 text-xs">
                                <span className="text-gray-500">Categoria: </span>
                                <span className="text-gray-700">
                                  {STORAGE_CATEGORIES.find(cat => cat.id === refrigerator.dedicatedTo)?.name || refrigerator.dedicatedTo}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    {filteredRefrigerators.filter(ref => ref.setTemperature >= 15 && ref.setTemperature <= 25).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nessun punto ambiente</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Attività Registro Temperature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attività Registro Temperature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cerca per nome frigorifero, utente, data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredTemperatures.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Thermometer className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nessuna attività di registrazione temperatura</p>
                <p className="text-sm">Le registrazioni appariranno qui dopo aver aggiunto frigoriferi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTemperatures.map(temp => {
                  const relatedRefrigerator = refrigerators.find(ref => 
                    temp.location.toLowerCase().includes(ref.name.toLowerCase())
                  )
                  
                  return (
                    <div key={temp.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{temp.location}</h3>
                            {relatedRefrigerator && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {relatedRefrigerator.name}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Temperatura rilevata:</span>
                              <div className="font-bold text-lg">{temp.temperature}°C</div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600">Data rilevamento:</span>
                              <div className="font-medium">{temp.time}</div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600">Operatore:</span>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span className="font-medium">
                                  {temp.userName || 'N/A'}
                                </span>
                                {temp.userDepartment && (
                                  <span className="text-gray-500">
                                    ({temp.userDepartment})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Stato Punti di Conservazione */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Stato Punti di Conservazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          {refrigerators.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nessun punto di conservazione registrato</p>
              <p className="text-sm">Aggiungi punti di conservazione per visualizzare lo stato</p>
            </div>
          ) : (
            <div className="space-y-3">
              {refrigerators.map(refrigerator => {
                const status = getTemperatureStatus(refrigerator)
                const lastTemperature = temperatures
                  .filter(temp => temp.location.toLowerCase().includes(refrigerator.name.toLowerCase()))
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]

                return (
                  <div 
                    key={refrigerator.id} 
                    className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                      status === 'green' ? 'bg-green-50 border-green-200 hover:bg-green-100' :
                      status === 'orange' ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' :
                      status === 'red' ? 'bg-red-50 border-red-200 hover:bg-red-100' :
                      'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => openTemperatureHistory(refrigerator)}
                    title="Clicca per vedere la cronologia temperature"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{refrigerator.name}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {getRefrigeratorType(refrigerator.setTemperature)}
                          </span>
                          {getStatusDot(status)}
                          <span className={`text-sm font-medium ${
                            status === 'green' ? 'text-green-700' :
                            status === 'orange' ? 'text-orange-700' :
                            status === 'red' ? 'text-red-700' :
                            'text-gray-600'
                          }`}>{getStatusText(status)}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Temperatura impostata:</span>
                            <div className="font-medium">{refrigerator.setTemperature}°C ({getRefrigeratorType(refrigerator.setTemperature)})</div>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">Posizionamento:</span>
                            <div className="font-medium">{refrigerator.location || 'Non specificato'}</div>
                          </div>
                        </div>

                        {lastTemperature && (
                          <div className={`mt-3 p-3 rounded-lg ${
                            status === 'green' ? 'bg-green-100' :
                            status === 'orange' ? 'bg-orange-100' :
                            status === 'red' ? 'bg-red-100' :
                            'bg-gray-100'
                          }`}>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Ultima registrazione:</span>
                              <span className="font-medium">{lastTemperature.temperature}°C</span>
                              <span className="text-gray-500">il {lastTemperature.time}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>



      {/* Add Refrigerator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Aggiungi Punto di Conservazione</h2>
            
            {/* Informazioni sulla nuova logica */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 mt-0.5">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">
                    <strong>💡 Suggerimento:</strong> Assegna una categoria specifica al punto di conservazione per garantire che solo i prodotti compatibili possano essere inseriti.
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={addRefrigerator} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome punto di conservazione</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="es. ripiano A, Armadio 2, Freezer A..."
                  required
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="dedicatedTo">Categoria punto di Conservazione</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Plus className="h-3 w-3" />
                    Nuova Categoria
                  </Button>
                </div>
                <select
                  id="dedicatedTo"
                  value={formData.dedicatedTo}
                  onChange={(e) => setFormData({...formData, dedicatedTo: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Seleziona una categoria</option>
                  {allCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {formData.dedicatedTo && (
                  <p className="text-xs text-gray-600 mt-1">
                    {allCategories.find(cat => cat.id === formData.dedicatedTo)?.description}
                  </p>
                )}

                {/* Form espandibile per nuova categoria */}
                {showAddCategoryForm && (
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold mb-3 text-gray-700">Crea Nuova Categoria</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="categoryName" className="text-xs">Nome Categoria *</Label>
                        <Input
                          id="categoryName"
                          type="text"
                          value={newCategoryData.name}
                          onChange={(e) => setNewCategoryData({...newCategoryData, name: e.target.value})}
                          placeholder="es. Prodotti Biologici..."
                          className="text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="categoryDescription" className="text-xs">Descrizione *</Label>
                        <Input
                          id="categoryDescription"
                          type="text"
                          value={newCategoryData.description}
                          onChange={(e) => setNewCategoryData({...newCategoryData, description: e.target.value})}
                          placeholder="Descrizione della categoria..."
                          className="text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <TemperatureInput
                          label="Range Temperatura (°C)"
                          minValue={newCategoryData.temperatureMin}
                          maxValue={newCategoryData.temperatureMax}
                          onMinChange={(e) => setNewCategoryData({...newCategoryData, temperatureMin: e.target.value})}
                          onMaxChange={(e) => setNewCategoryData({...newCategoryData, temperatureMax: e.target.value})}
                          required={false}
                          showValidation={true}
                          showSuggestions={true}
                          className="w-full"
                          id="category-temperature-range"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="categoryNotes" className="text-xs">Note</Label>
                        <Input
                          id="categoryNotes"
                          type="text"
                          value={newCategoryData.notes}
                          onChange={(e) => setNewCategoryData({...newCategoryData, notes: e.target.value})}
                          placeholder="Note aggiuntive..."
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          type="button" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={addCustomCategory}
                        >
                          Crea Categoria
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowAddCategoryForm(false)}
                          className="flex-1 text-xs"
                        >
                          Annulla
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <TemperatureInput
                  label="Range Temperatura (°C) *"
                  minValue={formData.setTemperatureMin}
                  maxValue={formData.setTemperatureMax}
                  onMinChange={(e) => setFormData({...formData, setTemperatureMin: e.target.value})}
                  onMaxChange={(e) => setFormData({...formData, setTemperatureMax: e.target.value})}
                  required={true}
                  showValidation={true}
                  showSuggestions={true}
                  className="w-full"
                  id="set-temperature-range"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Posizionamento</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="es. Cucina principale, Deposito..."
                />
              </div>
              
              <div>
                <Label htmlFor="nextMaintenance">Prossima Manutenzione Stimata</Label>
                <Input
                  id="nextMaintenance"
                  type="text"
                  value={formData.nextMaintenance}
                  onChange={(e) => setFormData({...formData, nextMaintenance: e.target.value})}
                  placeholder="es. 15/12/2024"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Aggiungi
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Refrigerator Modal */}
      {showEditModal && editingRefrigerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Modifica Punto di Conservazione</h2>
            
            {/* Informazioni sulla nuova logica */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 mt-0.5">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">
                    <strong>💡 Suggerimento:</strong> Assegna una categoria specifica al punto di conservazione per garantire che solo i prodotti compatibili possano essere inseriti.
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={updateRefrigerator} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome punto di conservazione</Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="es. ripiano A, Armadio 2, Freezer A..."
                  required
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="edit-dedicatedTo">Categoria punto di Conservazione</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Plus className="h-3 w-3" />
                    Nuova Categoria
                  </Button>
                </div>
                <select
                  id="edit-dedicatedTo"
                  value={formData.dedicatedTo}
                  onChange={(e) => setFormData({...formData, dedicatedTo: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Seleziona una categoria</option>
                  {allCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {formData.dedicatedTo && (
                  <p className="text-xs text-gray-600 mt-1">
                    {allCategories.find(cat => cat.id === formData.dedicatedTo)?.description}
                  </p>
                )}
              </div>
              
              <div>
                <TemperatureInput
                  label="Range Temperatura (°C) *"
                  minValue={formData.setTemperatureMin}
                  maxValue={formData.setTemperatureMax}
                  onMinChange={(e) => setFormData({...formData, setTemperatureMin: e.target.value})}
                  onMaxChange={(e) => setFormData({...formData, setTemperatureMax: e.target.value})}
                  required={true}
                  showValidation={true}
                  showSuggestions={true}
                  className="w-full"
                  id="edit-set-temperature-range"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-location">Posizionamento</Label>
                <Input
                  id="edit-location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="es. Cucina principale, Deposito..."
                />
              </div>
              
              <div>
                <Label htmlFor="edit-nextMaintenance">Prossima Manutenzione Stimata</Label>
                <Input
                  id="edit-nextMaintenance"
                  type="text"
                  value={formData.nextMaintenance}
                  onChange={(e) => setFormData({...formData, nextMaintenance: e.target.value})}
                  placeholder="es. 15/12/2024"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Aggiorna
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingRefrigerator(null)
                    setFormData({
                      name: '',
                      setTemperature: '',
                      location: '',
                      dedicatedTo: '',
                      nextMaintenance: ''
                    })
                  }}
                  className="flex-1"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cronologia Temperature */}
      {showTemperatureHistory && selectedRefrigerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Cronologia Temperature - {selectedRefrigerator.name}
              </h2>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowTemperatureHistory(false)
                  setSelectedRefrigerator(null)
                }}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Temperatura impostata:</span>
                  <div className="font-medium">{selectedRefrigerator.setTemperature}°C ({getRefrigeratorType(selectedRefrigerator.setTemperature)})</div>
                </div>
                <div>
                  <span className="text-gray-600">Posizionamento:</span>
                  <div className="font-medium">{selectedRefrigerator.location || 'Non specificato'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Categoria punto di Conservazione:</span>
                  <div className="font-medium">
                    {selectedRefrigerator.dedicatedTo ? 
                      allCategories.find(cat => cat.id === selectedRefrigerator.dedicatedTo)?.name || selectedRefrigerator.dedicatedTo
                      : 'Non specificato'
                    }
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Prossima manutenzione:</span>
                  <div className="font-medium">{selectedRefrigerator.nextMaintenance || 'Non programmata'}</div>
                </div>
              </div>
            </div>

            {(() => {
              const refrigeratorTemperatures = getRefrigeratorTemperatures(selectedRefrigerator)
              
              if (refrigeratorTemperatures.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <Thermometer className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Nessuna registrazione di temperatura</p>
                    <p className="text-sm">Le registrazioni appariranno qui dopo le prime misurazioni</p>
                  </div>
                )
              }

              return (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-4">
                    Totale registrazioni: {refrigeratorTemperatures.length}
                  </div>
                  
                  {refrigeratorTemperatures.map((temp, index) => {
                    const tempDiff = Math.abs(temp.temperature - selectedRefrigerator.setTemperature)
                    const status = tempDiff > 2 ? 'danger' : tempDiff > 1 ? 'warning' : 'ok'
                    
                    return (
                      <div 
                        key={temp.id || index} 
                        className={`p-4 border rounded-lg ${
                          status === 'ok' ? 'bg-green-50 border-green-200' :
                          status === 'warning' ? 'bg-orange-50 border-orange-200' :
                          'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-lg font-bold">
                              {temp.temperature}°C
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status === 'ok' ? 'bg-green-100 text-green-700' :
                              status === 'warning' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {status === 'ok' ? '✓ OK' : 
                               status === 'warning' ? '⚠ Attenzione' : '🚨 Critico'}
                            </div>
                            <div className="text-sm text-gray-600">
                              Differenza: {tempDiff.toFixed(1)}°C
                            </div>
                          </div>
                          
                          <div className="text-right text-sm text-gray-600">
                            <div>{temp.time}</div>
                            <div className="text-xs">{temp.user || 'Utente sconosciuto'}</div>
                          </div>
                        </div>
                        
                        {temp.notes && (
                          <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            📝 {temp.notes}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>
      )}


    </div>
  )
}

export default Refrigerators 