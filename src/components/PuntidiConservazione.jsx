import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Trash2, Thermometer, AlertTriangle, CheckCircle, User, Plus, Search, MapPin, Calendar, Settings, Edit, X, HelpCircle } from 'lucide-react'
import { getConservationSuggestions, getOptimalTemperature } from '../utils/temperatureDatabase'
import TemperatureInput from './ui/TemperatureInput'
import HelpOverlay from './HelpOverlay'
import { CONSERVATION_POINT_RULES } from '../utils/haccpRules'

// Usa le categorie HACCP standardizzate
const STORAGE_CATEGORIES = CONSERVATION_POINT_RULES.categories

function PuntidiConservazione({ temperatures, setTemperatures, currentUser, refrigerators, setRefrigerators, departments, setDepartments }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRefrigerator, setEditingRefrigerator] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    setTemperature: '',
    location: '',
    dedicatedTo: '',
    nextMaintenance: '',
    assignedRole: '',
    assignedTo: '',
    frequency: '',
    selectedCategories: []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRefrigerator, setSelectedRefrigerator] = useState(null)
  const [showTemperatureHistory, setShowTemperatureHistory] = useState(false)
  
  // Stati per i dati dell'onboarding
  const [onboardingData, setOnboardingData] = useState(null)
  const [staffMembers, setStaffMembers] = useState([])
  
  // Nuovi stati per la gestione delle categorie personalizzate
  const [customCategories, setCustomCategories] = useState([])
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false)
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: '',
    temperatureMin: '',
    temperatureMax: '',
    notes: '',
    isAmbiente: false
  })
  
  // Stato per HelpOverlay
  const [showHelpOverlay, setShowHelpOverlay] = useState(false)
  const [helpType, setHelpType] = useState('')

  // Combina le categorie predefinite con quelle personalizzate
  const allCategories = [...STORAGE_CATEGORIES, ...customCategories]
  
  // Funzione per aprire l'HelpOverlay
  const openHelpOverlay = (type) => {
    setHelpType(type)
    setShowHelpOverlay(true)
  }

  // Funzioni per gestire la selezione multipla delle categorie
  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const currentCategories = prev.selectedCategories || []
      const isSelected = currentCategories.includes(categoryId)
      
      if (isSelected) {
        // Rimuovi la categoria
        return {
          ...prev,
          selectedCategories: currentCategories.filter(id => id !== categoryId)
        }
      } else {
        // Aggiungi la categoria (max 5)
        if (currentCategories.length < 5) {
          return {
            ...prev,
            selectedCategories: [...currentCategories, categoryId]
          }
        } else {
          alert('Puoi selezionare al massimo 5 categorie')
          return prev
        }
      }
    })
  }

  // Funzione per validazione HACCP (stessa logica dell'onboarding)
  const checkHACCPCompliance = (targetTemp, selectedCategories = []) => {
    // Gestisce "ambiente" come range 15-25°C per monitoraggio futuro
    let temp;
    let isAmbiente = false;
    if (targetTemp.toLowerCase().trim() === 'ambiente') {
      temp = 20; // Valore medio per validazione HACCP
      isAmbiente = true;
    } else {
      temp = parseFloat(targetTemp);
    }
    
    if (isNaN(temp)) return { compliant: false, message: 'Temperatura non valida', type: 'error' };
    
    // Se sono state selezionate categorie, usa le regole HACCP
    if (selectedCategories.length > 0) {
      // Prima controlla se le categorie sono compatibili tra loro
      const tolerance = CONSERVATION_POINT_RULES.tolerance;
      let hasIncompatibleCategories = false;
      
      // Controlla se ci sono categorie con range di temperatura che non si sovrappongono
      for (let i = 0; i < selectedCategories.length; i++) {
        for (let j = i + 1; j < selectedCategories.length; j++) {
          // Cerca prima nelle categorie HACCP standard, poi in quelle personalizzate
          let category1 = CONSERVATION_POINT_RULES.categories.find(c => c.id === selectedCategories[i]);
          if (!category1) {
            category1 = customCategories.find(c => c.id === selectedCategories[i]);
          }
          
          let category2 = CONSERVATION_POINT_RULES.categories.find(c => c.id === selectedCategories[j]);
          if (!category2) {
            category2 = customCategories.find(c => c.id === selectedCategories[j]);
          }
          
          if (category1 && category2) {
            // Calcola i range di tolleranza per entrambe le categorie
            const range1Min = (category1.minTemp || category1.temperatureMin) - tolerance;
            const range1Max = (category1.maxTemp || category1.temperatureMax) + tolerance;
            const range2Min = (category2.minTemp || category2.temperatureMin) - tolerance;
            const range2Max = (category2.maxTemp || category2.temperatureMax) + tolerance;
            
            // Se i range non si sovrappongono, le categorie sono incompatibili
            if (range1Max < range2Min || range2Max < range1Min) {
              hasIncompatibleCategories = true;
              break;
            }
          }
        }
        if (hasIncompatibleCategories) break;
      }
      
      if (hasIncompatibleCategories) {
        return { 
          compliant: false, 
          message: '❌ Categorie incompatibili selezionate', 
          type: 'error',
          color: 'red'
        };
      }
      
      let isInRange = false;
      let isInToleranceRange = false;
      let categoryInfo = null;
      
      for (const categoryId of selectedCategories) {
        let category = CONSERVATION_POINT_RULES.categories.find(c => c.id === categoryId);
        if (!category) {
          category = customCategories.find(c => c.id === categoryId);
        }
        if (category) {
          if (!categoryInfo) categoryInfo = category; // Imposta la prima categoria come riferimento
          // Controlla se è nel range HACCP
          const categoryMinTemp = category.minTemp || category.temperatureMin;
          const categoryMaxTemp = category.maxTemp || category.temperatureMax;
          
          if (isAmbiente) {
            // Per "ambiente", controlla se il range 15-25°C si sovrappone con la categoria
            const ambienteRange = getAmbienteTemperatureRange();
            if (categoryMinTemp <= ambienteRange.max && categoryMaxTemp >= ambienteRange.min) {
              isInRange = true;
              break;
            }
          } else if (temp >= categoryMinTemp && temp <= categoryMaxTemp) {
            isInRange = true;
            break;
          }
        }
      }
      
      // Se non è nel range HACCP, controlla se è in tolleranza per almeno una categoria
      if (!isInRange) {
        for (const categoryId of selectedCategories) {
          let category = CONSERVATION_POINT_RULES.categories.find(c => c.id === categoryId);
          if (!category) {
            category = customCategories.find(c => c.id === categoryId);
          }
          if (category) {
            if (!categoryInfo) categoryInfo = category; // Imposta la prima categoria come riferimento
            const categoryMinTemp = category.minTemp || category.temperatureMin;
            const categoryMaxTemp = category.maxTemp || category.temperatureMax;
            const categoryMin = categoryMinTemp - tolerance;
            const categoryMax = categoryMaxTemp + tolerance;
            
            if (isAmbiente) {
              // Per "ambiente", controlla se il range 15-25°C è in tolleranza
              const ambienteRange = getAmbienteTemperatureRange();
              const ambienteMin = ambienteRange.min - tolerance;
              const ambienteMax = ambienteRange.max + tolerance;
              if (categoryMinTemp <= ambienteMax && categoryMaxTemp >= ambienteMin) {
                isInToleranceRange = true;
                break;
              }
            } else if (temp >= categoryMin && temp <= categoryMax) {
              isInToleranceRange = true;
              break;
            }
          }
        }
      }
      
      if (isInRange) {
        return { 
          compliant: true, 
          message: '✅ Valore temperatura valido', 
          type: 'compliant',
          color: 'green'
        };
      } else if (isInToleranceRange) {
        return { 
          compliant: false, 
          message: `La temperatura impostata è in tolleranza (fino a ${tolerance}°C di differenza)`, 
          type: 'warning',
          color: 'yellow'
        };
      } else {
        return { 
          compliant: false, 
          message: `❌ Fuori range HACCP per ${categoryInfo?.name || 'categorie selezionate'}`, 
          type: 'error',
          color: 'red'
        };
      }
    }
    
    // Validazione generica se non ci sono categorie selezionate
    if (temp < -30 || temp > 80) return { 
      compliant: false, 
      message: 'Range temperatura fuori limiti operativi', 
      type: 'error',
      color: 'red'
    };
    
    return { 
      compliant: true, 
      message: '✅ Valore temperatura valido', 
      type: 'compliant',
      color: 'green'
    };
  };

  // Funzione per gestire il range di temperatura ambiente (15-25°C)
  const getAmbienteTemperatureRange = () => {
    return {
      min: 15,
      max: 25,
      description: 'Temperatura ambiente (15-25°C)',
      isAmbiente: true
    };
  };

  // Funzione per validare se una temperatura reale è nel range ambiente
  const validateAmbienteTemperature = (actualTemp) => {
    const range = getAmbienteTemperatureRange();
    return {
      isValid: actualTemp >= range.min && actualTemp <= range.max,
      range: range,
      actualTemp: actualTemp,
      isTooLow: actualTemp < range.min,
      isTooHigh: actualTemp > range.max,
      deviation: actualTemp < range.min ? range.min - actualTemp : actualTemp - range.max
    };
  };

  // Funzione per ottenere la temperatura ottimale di una categoria (gestisce sia HACCP che personalizzate)
  const getOptimalTemperatureLocal = (categoryId) => {
    // Prima cerca nelle categorie HACCP standard
    let category = CONSERVATION_POINT_RULES.categories.find(c => c.id === categoryId);
    if (category) {
      return {
        min: category.minTemp,
        max: category.maxTemp
      };
    }
    
    // Poi cerca nelle categorie personalizzate
    category = customCategories.find(c => c.id === categoryId);
    if (category) {
      return {
        min: category.temperatureMin,
        max: category.temperatureMax
      };
    }
    
    return null;
  };

  // Funzione per ottenere suggerimenti di temperatura ottimale per categorie selezionate
  const getOptimalTemperatureSuggestions = (selectedCategories) => {
    if (!selectedCategories || selectedCategories.length === 0) {
      return { message: 'Seleziona categorie per ottenere suggerimenti sulle temperature ottimali' };
    }

    const temperatureRanges = [];
    
    selectedCategories.forEach(categoryId => {
      const optimalTemp = getOptimalTemperatureLocal(categoryId);
      if (optimalTemp) {
        const category = allCategories.find(cat => cat.id === categoryId);
        temperatureRanges.push({
          name: category?.name || categoryId,
          min: optimalTemp.min,
          max: optimalTemp.max
        });
      }
    });

    if (temperatureRanges.length === 0) {
      return { message: 'Nessuna informazione di temperatura disponibile per le categorie selezionate' };
    }

    // Calcola il range comune
    const minTemp = Math.max(...temperatureRanges.map(range => range.min));
    const maxTemp = Math.min(...temperatureRanges.map(range => range.max));

    if (minTemp <= maxTemp) {
      return {
        compatible: true,
        message: `Range ottimale per le categorie selezionate: da ${minTemp}°C a ${maxTemp}°C`
      };
    } else {
      return {
        compatible: false,
        message: `⚠️ Conflitto di temperature: Le categorie selezionate hanno range incompatibili. Verifica i requisiti HACCP.`
      };
    }
  };

  // Funzione per determinare la compatibilità delle categorie (stessa logica dell'onboarding)
  const getCategoryCompatibility = (categoryId, selectedCategories, targetTemp) => {
    // Controlla se la categoria è già selezionata
    if (selectedCategories.includes(categoryId)) return 'selected';
    
    // Se non c'è temperatura inserita, mostra tutte le categorie come neutral
    if (!targetTemp || targetTemp.trim() === '') return 'neutral';
    
    // Gestisce "ambiente" come range 15-25°C per monitoraggio futuro
    let temp;
    let isAmbiente = false;
    if (targetTemp.toLowerCase().trim() === 'ambiente') {
      temp = 20; // Valore medio per validazione HACCP
      isAmbiente = true;
    } else {
      temp = parseFloat(targetTemp);
    }
    if (isNaN(temp)) return 'neutral';
    
    // Cerca prima nelle categorie HACCP standard, poi in quelle personalizzate
    let category = CONSERVATION_POINT_RULES.categories.find(c => c.id === categoryId);
    if (!category) {
      category = customCategories.find(c => c.id === categoryId);
    }
    if (!category) return 'neutral';
    
    // Controlla compatibilità con le categorie già selezionate
    const tolerance = CONSERVATION_POINT_RULES.tolerance;
    
    // Calcola il range di tolleranza per la categoria corrente
    // Gestisce sia categorie HACCP standard che personalizzate
    const categoryMin = (category.minTemp || category.temperatureMin) - tolerance;
    const categoryMax = (category.maxTemp || category.temperatureMax) + tolerance;
    const categoryMinTemp = category.minTemp || category.temperatureMin;
    const categoryMaxTemp = category.maxTemp || category.temperatureMax;
    
    // Controlla se la temperatura target è nel range di questa categoria
    // Gestione speciale per "ambiente" - deve essere compatibile con range 15-25°C
    if (isAmbiente) {
      const ambienteRange = getAmbienteTemperatureRange();
      if (categoryMinTemp <= ambienteRange.max && categoryMaxTemp >= ambienteRange.min) {
        return 'compatible';
      } else {
        return 'incompatible';
      }
    } else if (temp >= categoryMinTemp && temp <= categoryMaxTemp) {
      // Temperatura nel range HACCP
      if (selectedCategories.length === 0) {
        return 'compatible'; // Se non ci sono categorie selezionate, mostra come compatibile
      }
      
      // Controlla compatibilità con le altre categorie selezionate
      for (const selectedId of selectedCategories) {
        let selectedCategory = CONSERVATION_POINT_RULES.categories.find(c => c.id === selectedId);
        if (!selectedCategory) {
          selectedCategory = customCategories.find(c => c.id === selectedId);
        }
        if (selectedCategory) {
          const selectedMin = (selectedCategory.minTemp || selectedCategory.temperatureMin) - tolerance;
          const selectedMax = (selectedCategory.maxTemp || selectedCategory.temperatureMax) + tolerance;
          
          // Se c'è sovrapposizione nei range di tolleranza, è compatibile
          if (selectedMin <= categoryMax && selectedMax >= categoryMin) {
            return 'compatible';
          }
        }
      }
      return 'incompatible';
    } else if (isAmbiente) {
      // Per "ambiente", controlla se il range 15-25°C è in tolleranza con la categoria
      const ambienteRange = getAmbienteTemperatureRange();
      const ambienteMin = ambienteRange.min - tolerance;
      const ambienteMax = ambienteRange.max + tolerance;
      if (categoryMinTemp <= ambienteMax && categoryMaxTemp >= ambienteMin) {
        return 'tolerance';
      } else {
        return 'incompatible';
      }
    } else if (temp >= categoryMin && temp <= categoryMax) {
      // Temperatura nel range di tolleranza
      if (selectedCategories.length === 0) {
        return 'tolerance'; // Se non ci sono categorie selezionate, mostra come tolleranza
      }
      
      // Controlla compatibilità con le altre categorie selezionate
      for (const selectedId of selectedCategories) {
        let selectedCategory = CONSERVATION_POINT_RULES.categories.find(c => c.id === selectedId);
        if (!selectedCategory) {
          selectedCategory = customCategories.find(c => c.id === selectedId);
        }
        if (selectedCategory) {
          const selectedMin = (selectedCategory.minTemp || selectedCategory.temperatureMin) - tolerance;
          const selectedMax = (selectedCategory.maxTemp || selectedCategory.temperatureMax) + tolerance;
          
          // Se c'è sovrapposizione nei range di tolleranza, è in tolleranza
          if (selectedMin <= categoryMax && selectedMax >= categoryMin) {
            return 'tolerance';
          }
        }
      }
      return 'incompatible';
    }
    
    return 'incompatible';
  };

  // Funzione per verificare conflitti temperatura-categorie
  const checkTemperatureCategoryConflicts = (temperature, categories) => {
    const conflicts = []
    
    categories.forEach(categoryId => {
      const category = allCategories.find(cat => cat.id === categoryId)
      if (category) {
        const optimalTemp = getOptimalTemperatureLocal(categoryId)
        if (optimalTemp) {
          const tempValue = temperature.toLowerCase().trim() === 'ambiente' ? 20 : parseFloat(temperature)
          if (!isNaN(tempValue)) {
            // Usa la stessa logica HACCP delle altre funzioni
            const tolerance = CONSERVATION_POINT_RULES.tolerance
            const categoryMin = optimalTemp.min - tolerance
            const categoryMax = optimalTemp.max + tolerance
            
            // Controlla se la temperatura è nel range HACCP
            if (tempValue >= optimalTemp.min && tempValue <= optimalTemp.max) {
              // Temperatura nel range HACCP - nessun conflitto
              return
            }
            
            // Controlla se la temperatura è nel range di tolleranza
            if (tempValue >= categoryMin && tempValue <= categoryMax) {
              // Temperatura in tolleranza - conflitto minore
              conflicts.push({
                category: category.name,
                optimal: `${optimalTemp.min}-${optimalTemp.max}°C`,
                current: temperature,
                severity: 'warning',
                message: `Temperatura in tolleranza (fino a ${tolerance}°C di differenza)`
              })
            } else {
              // Temperatura fuori range - conflitto grave
              conflicts.push({
                category: category.name,
                optimal: `${optimalTemp.min}-${optimalTemp.max}°C`,
                current: temperature,
                severity: 'error',
                message: `Temperatura fuori range HACCP`
              })
            }
          }
        }
      }
    })
    
    return conflicts
  }

  // Carica le categorie personalizzate dal localStorage all'avvio
  // Carica i dati dell'onboarding
  useEffect(() => {
    const savedOnboarding = localStorage.getItem('onboardingData')
    if (savedOnboarding && savedOnboarding !== '[object Object]') {
      try {
        const data = JSON.parse(savedOnboarding)
        setOnboardingData(data)
        
        // Estrae i reparti
        if (data.departments && Array.isArray(data.departments)) {
          setDepartments(data.departments)
        }
        
        // Estrae i membri dello staff
        if (data.staff && Array.isArray(data.staff)) {
          setStaffMembers(data.staff)
        }
      } catch (error) {
        console.error('Errore nel caricamento dei dati onboarding:', error)
      }
    }
  }, [])

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

    // Gestione temperature
    let tempMin, tempMax;
    if (newCategoryData.isAmbiente) {
      tempMin = 15;
      tempMax = 25;
    } else {
      // Validazione temperature se inserite
      if (newCategoryData.temperatureMin && newCategoryData.temperatureMax) {
        tempMin = parseFloat(newCategoryData.temperatureMin)
        tempMax = parseFloat(newCategoryData.temperatureMax)
        
        if (isNaN(tempMin) || isNaN(tempMax)) {
          alert('Inserisci temperature valide')
          return
        }
        
        if (tempMin >= tempMax) {
          alert('La temperatura minima deve essere inferiore alla temperatura massima')
          return
        }
      } else {
        tempMin = null;
        tempMax = null;
      }
    }

    // Genera un ID univoco per la nuova categoria
    const newCategory = {
      id: `custom_${Date.now()}`,
      name: newCategoryData.name.trim(),
      description: newCategoryData.description.trim(),
      temperatureMin: tempMin,
      temperatureMax: tempMax,
      temperatureRange: newCategoryData.isAmbiente ? '15-25°C (Ambiente)' : 
        (tempMin && tempMax ? `${tempMin}-${tempMax}°C` : ''),
      notes: newCategoryData.notes.trim(),
      isCustom: true,
      isAmbiente: newCategoryData.isAmbiente,
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
      notes: '',
      isAmbiente: false
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
    // Gestisce sia i vecchi frigoriferi (con setTemperature singola) che i nuovi (con range)
    let tempValue = 0
    
    if (typeof temperature === 'object' && temperature.setTemperatureMin !== undefined && temperature.setTemperatureMax !== undefined) {
      // Nuovo formato con range - usa la media
      tempValue = (temperature.setTemperatureMin + temperature.setTemperatureMax) / 2
    } else if (typeof temperature === 'string') {
      // Vecchio formato - estrae il valore numerico dalla stringa
      const tempStr = temperature.replace('°C', '').trim()
      tempValue = parseFloat(tempStr)
    } else if (typeof temperature === 'number') {
      // Formato numerico diretto
      tempValue = temperature
    }
    
    if (isNaN(tempValue)) return 'N/A'
    
    if (tempValue < -13.5 && tempValue >= -80) {
      return 'Abbattitore'
    } else if (tempValue < -2.5 && tempValue >= -13.5) {
      return 'Freezer'
    } else if ((tempValue >= -2.5 && tempValue <= 0) || (tempValue > 0 && tempValue <= 14)) {
      return 'Frigo'
    } else if (tempValue >= 15 && tempValue <= 25) {
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
    
    if (!formData.name.trim() || !formData.setTemperature.trim() || !formData.location.trim() || !formData.assignedRole.trim() || !formData.frequency.trim() || !formData.selectedCategories || formData.selectedCategories.length === 0) {
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

    // Gestisce il caso speciale "ambiente"
    let setTemp
    let temperatureDisplay = ''
    
    if (formData.setTemperature.toLowerCase().trim() === 'ambiente') {
      setTemp = 20 // Temperatura media ambiente per calcoli
      temperatureDisplay = 'da 15°C a 25°C'
    } else {
      setTemp = parseFloat(formData.setTemperature)
      if (isNaN(setTemp)) {
        alert('Inserisci una temperatura valida o scrivi "ambiente" per temperatura ambiente')
        return
      }
      temperatureDisplay = `${setTemp}°C`
    }

    // Validazione conflitti temperatura-categorie
    if (formData.selectedCategories && formData.selectedCategories.length > 0) {
      const conflicts = checkTemperatureCategoryConflicts(formData.setTemperature, formData.selectedCategories)
      
      if (conflicts.length > 0) {
        const conflictList = conflicts.map(c => `• ${c.category}: ottimale ${c.optimal}, impostata ${c.current}`).join('\n')
        const shouldContinue = confirm(
          `⚠️ ATTENZIONE: Conflitti temperatura-categorie rilevati!\n\n` +
          `Temperatura impostata: ${temperatureDisplay}\n\n` +
          `Conflitti rilevati:\n${conflictList}\n\n` +
          `Questa temperatura potrebbe non essere adatta per la conservazione ottimale di alcune categorie selezionate.\n\n` +
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
      setTemperature: temperatureDisplay,
      location: formData.location.trim(),
      dedicatedTo: formData.dedicatedTo.trim(),
      nextMaintenance: formData.nextMaintenance.trim(),
      assignedRole: formData.assignedRole.trim(),
      assignedTo: formData.assignedTo.trim(),
      frequency: formData.frequency.trim(),
      selectedCategories: formData.selectedCategories || [],
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Unknown'
    }

    setRefrigerators([...refrigerators, newRefrigerator])
    setFormData({
      name: '',
      setTemperature: '',
      location: '',
      dedicatedTo: '',
      nextMaintenance: '',
      assignedRole: '',
      assignedTo: '',
      frequency: '',
      selectedCategories: []
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
    
    // Estrae il valore di temperatura dal campo setTemperature
    let temperature = ''
    
    if (refrigerator.setTemperature) {
      const tempStr = refrigerator.setTemperature.toString()
      
      // Se è il range "da 15°C a 25°C", mostra "ambiente"
      if (tempStr.includes('da 15°C a 25°C')) {
        temperature = 'ambiente'
      } else {
        // Estrae il valore numerico dalla stringa (es. "4°C" -> "4")
        temperature = tempStr.replace('°C', '').trim()
      }
    }
    
    setFormData({
      name: refrigerator.name,
      setTemperature: temperature,
      location: refrigerator.location || '',
      dedicatedTo: refrigerator.dedicatedTo || '',
      nextMaintenance: refrigerator.nextMaintenance || '',
      assignedRole: refrigerator.assignedRole || '',
      assignedTo: refrigerator.assignedTo || '',
      frequency: refrigerator.frequency || '',
      selectedCategories: refrigerator.selectedCategories || []
    })
    setShowEditModal(true)
  }

  const updateRefrigerator = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.setTemperature.trim() || !formData.location.trim() || !formData.assignedRole.trim() || !formData.frequency.trim() || !formData.selectedCategories || formData.selectedCategories.length === 0) {
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

    // Gestisce il caso speciale "ambiente"
    let setTemp
    let temperatureDisplay = ''
    
    if (formData.setTemperature.toLowerCase().trim() === 'ambiente') {
      setTemp = 20 // Temperatura media ambiente per calcoli
      temperatureDisplay = 'da 15°C a 25°C'
    } else {
      setTemp = parseFloat(formData.setTemperature)
      if (isNaN(setTemp)) {
        alert('Inserisci una temperatura valida o scrivi "ambiente" per temperatura ambiente')
        return
      }
      temperatureDisplay = `${setTemp}°C`
    }

    // Validazione conflitti temperatura-categorie
    if (formData.selectedCategories && formData.selectedCategories.length > 0) {
      const conflicts = checkTemperatureCategoryConflicts(formData.setTemperature, formData.selectedCategories)
      
      if (conflicts.length > 0) {
        const conflictList = conflicts.map(c => `• ${c.category}: ottimale ${c.optimal}, impostata ${c.current}`).join('\n')
        const shouldContinue = confirm(
          `⚠️ ATTENZIONE: Conflitti temperatura-categorie rilevati!\n\n` +
          `Temperatura impostata: ${temperatureDisplay}\n\n` +
          `Conflitti rilevati:\n${conflictList}\n\n` +
          `Questa temperatura potrebbe non essere adatta per la conservazione ottimale di alcune categorie selezionate.\n\n` +
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
      setTemperature: temperatureDisplay,
      location: formData.location.trim(),
      dedicatedTo: formData.dedicatedTo.trim(),
      nextMaintenance: formData.nextMaintenance.trim(),
      assignedRole: formData.assignedRole.trim(),
      assignedTo: formData.assignedTo.trim(),
      frequency: formData.frequency.trim(),
      selectedCategories: formData.selectedCategories || [],
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || 'Unknown'
    }

    setRefrigerators(refrigerators.map(ref => 
      ref.id === editingRefrigerator.id ? updatedRefrigerator : ref
    ))
    
    setFormData({
      name: '',
      setTemperature: '',
      location: '',
      dedicatedTo: '',
      nextMaintenance: '',
      assignedRole: '',
      assignedTo: '',
      frequency: '',
      selectedCategories: []
    })
    setEditingRefrigerator(null)
    setShowEditModal(false)
  }

  // Funzione helper per ottenere la temperatura impostata in formato leggibile
  const getDisplayTemperature = (refrigerator) => {
    if (refrigerator.setTemperatureMin !== undefined && refrigerator.setTemperatureMax !== undefined) {
      // Nuovo formato con range
      return `${refrigerator.setTemperatureMin}-${refrigerator.setTemperatureMax}°C`
    } else if (refrigerator.setTemperature) {
      // Vecchio formato
      return refrigerator.setTemperature
    }
    return 'N/A'
  }

  // Funzione helper per estrarre il valore numerico dalla temperatura impostata
  const getTemperatureValue = (refrigerator) => {
    if (refrigerator.setTemperatureMin !== undefined && refrigerator.setTemperatureMax !== undefined) {
      // Nuovo formato con range - usa la media
      return (refrigerator.setTemperatureMin + refrigerator.setTemperatureMax) / 2
    } else if (refrigerator.setTemperature) {
      // Vecchio formato - estrae il valore numerico dalla stringa
      const tempStr = refrigerator.setTemperature.toString().replace('°C', '').trim()
      return parseFloat(tempStr)
    }
    return 0
  }

  const getTemperatureStatus = (refrigerator) => {
    // Find the last temperature recording for this refrigerator
    const lastTemperature = temperatures
      .filter(temp => temp.location.toLowerCase().includes(refrigerator.name.toLowerCase()))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]

    if (!lastTemperature) return 'no-data'

    // Usa la funzione helper per ottenere il valore numerico
    const setTempValue = getTemperatureValue(refrigerator)
    
    if (isNaN(setTempValue) || setTempValue === 0) return 'no-data'
    
    const tempDiff = Math.abs(lastTemperature.temperature - setTempValue)
    
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
                        <h4 className="font-medium text-green-800">{category.name || 'Categoria non disponibile'}</h4>
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
                    <button
                      onClick={() => openHelpOverlay('pizzeria-frigoA')}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Guida posizionamento prodotti"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </h3>
                  <div className="space-y-2">
                    {filteredRefrigerators
                      .filter(ref => {
                        // Gestisce sia i vecchi frigoriferi (con setTemperature singola) che i nuovi (con range)
                        let tempValue = 0
                        if (ref.setTemperatureMin !== undefined && ref.setTemperatureMax !== undefined) {
                          // Nuovo formato con range - usa la media
                          tempValue = (ref.setTemperatureMin + ref.setTemperatureMax) / 2
                        } else if (ref.setTemperature) {
                          // Vecchio formato - estrae il valore numerico dalla stringa
                          const tempStr = ref.setTemperature.toString().replace('°C', '').trim()
                          tempValue = parseFloat(tempStr)
                        }
                        return !isNaN(tempValue) && ((tempValue >= -2.5 && tempValue <= 0) || (tempValue > 0 && tempValue <= 14))
                      })
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
                                  <h4 className="font-medium text-sm">{refrigerator.name || 'Nome non disponibile'}</h4>
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
                                <span className="font-medium">{getDisplayTemperature(refrigerator)}</span>
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
                    {filteredRefrigerators.filter(ref => {
                        // Gestisce sia i vecchi frigoriferi (con setTemperature singola) che i nuovi (con range)
                        let tempValue = 0
                        if (ref.setTemperatureMin !== undefined && ref.setTemperatureMax !== undefined) {
                          // Nuovo formato con range - usa la media
                          tempValue = (ref.setTemperatureMin + ref.setTemperatureMax) / 2
                        } else if (ref.setTemperature) {
                          // Vecchio formato - estrae il valore numerico dalla stringa
                          const tempStr = ref.setTemperature.toString().replace('°C', '').trim()
                          tempValue = parseFloat(tempStr)
                        }
                        return !isNaN(tempValue) && ((tempValue >= -2.5 && tempValue <= 0) || (tempValue > 0 && tempValue <= 14))
                      }).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nessun frigorifero</p>
                    )}
                  </div>
                </div>

                {/* Freezer (-2.5°C a -13.5°C) */}
                <div className="border rounded-lg p-4 bg-purple-50">
                  <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Freezer
                    <button
                      onClick={() => openHelpOverlay('pizzeria-frigoB')}
                      className="text-purple-600 hover:text-purple-800 transition-colors"
                      title="Guida posizionamento prodotti"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </h3>
                  <div className="space-y-2">
                    {filteredRefrigerators
                      .filter(ref => {
                        // Gestisce sia i vecchi frigoriferi (con setTemperature singola) che i nuovi (con range)
                        let tempValue = 0
                        if (ref.setTemperatureMin !== undefined && ref.setTemperatureMax !== undefined) {
                          // Nuovo formato con range - usa la media
                          tempValue = (ref.setTemperatureMin + ref.setTemperatureMax) / 2
                        } else if (ref.setTemperature) {
                          // Vecchio formato - estrae il valore numerico dalla stringa
                          const tempStr = ref.setTemperature.toString().replace('°C', '').trim()
                          tempValue = parseFloat(tempStr)
                        }
                        return !isNaN(tempValue) && tempValue < -2.5 && tempValue >= -13.5
                      })
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
                                  <h4 className="font-medium text-sm">{refrigerator.name || 'Nome non disponibile'}</h4>
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
                                <span className="font-medium">{getDisplayTemperature(refrigerator)}</span>
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
                    {filteredRefrigerators.filter(ref => {
                        // Gestisce sia i vecchi frigoriferi (con setTemperature singola) che i nuovi (con range)
                        let tempValue = 0
                        if (ref.setTemperatureMin !== undefined && ref.setTemperatureMax !== undefined) {
                          // Nuovo formato con range - usa la media
                          tempValue = (ref.setTemperatureMin + ref.setTemperatureMax) / 2
                        } else if (ref.setTemperature) {
                          // Vecchio formato - estrae il valore numerico dalla stringa
                          const tempStr = ref.setTemperature.toString().replace('°C', '').trim()
                          tempValue = parseFloat(tempStr)
                        }
                        return !isNaN(tempValue) && tempValue < -2.5 && tempValue >= -13.5
                      }).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nessun freezer</p>
                    )}
                  </div>
                </div>

                {/* Abbattitore (-13.5°C a -80°C) */}
                <div className="border rounded-lg p-4 bg-red-50">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Abbattitore
                    <button
                      onClick={() => openHelpOverlay('abbattitore')}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Guida posizionamento prodotti"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </h3>
                  <div className="space-y-2">
                    {filteredRefrigerators
                      .filter(ref => {
                        // Gestisce sia i vecchi frigoriferi (con setTemperature singola) che i nuovi (con range)
                        let tempValue = 0
                        if (ref.setTemperatureMin !== undefined && ref.setTemperatureMax !== undefined) {
                          // Nuovo formato con range - usa la media
                          tempValue = (ref.setTemperatureMin + ref.setTemperatureMax) / 2
                        } else if (ref.setTemperature) {
                          // Vecchio formato - estrae il valore numerico dalla stringa
                          const tempStr = ref.setTemperature.toString().replace('°C', '').trim()
                          tempValue = parseFloat(tempStr)
                        }
                        return !isNaN(tempValue) && tempValue < -13.5 && tempValue >= -80
                      })
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
                                  <h4 className="font-medium text-sm">{refrigerator.name || 'Nome non disponibile'}</h4>
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
                                <span className="font-medium">{getDisplayTemperature(refrigerator)}</span>
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
                    {filteredRefrigerators.filter(ref => {
                        // Gestisce sia i vecchi frigoriferi (con setTemperature singola) che i nuovi (con range)
                        let tempValue = 0
                        if (ref.setTemperatureMin !== undefined && ref.setTemperatureMax !== undefined) {
                          // Nuovo formato con range - usa la media
                          tempValue = (ref.setTemperatureMin + ref.setTemperatureMax) / 2
                        } else if (ref.setTemperature) {
                          // Vecchio formato - estrae il valore numerico dalla stringa
                          const tempStr = ref.setTemperature.toString().replace('°C', '').trim()
                          tempValue = parseFloat(tempStr)
                        }
                        return !isNaN(tempValue) && tempValue < -13.5 && tempValue >= -80
                      }).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nessun abbattitore</p>
                    )}
                  </div>
                </div>

                {/* Ambiente (15°C a 25°C) */}
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Ambiente
                    <button
                      onClick={() => openHelpOverlay('ambiente')}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Guida posizionamento prodotti"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </h3>
                  <div className="space-y-2">
                    {filteredRefrigerators
                      .filter(ref => {
                        // Gestisce sia i vecchi frigoriferi (con setTemperature singola) che i nuovi (con range)
                        let tempValue = 0
                        if (ref.setTemperatureMin !== undefined && ref.setTemperatureMax !== undefined) {
                          // Nuovo formato con range - usa la media
                          tempValue = (ref.setTemperatureMin + ref.setTemperatureMax) / 2
                        } else if (ref.setTemperature) {
                          // Vecchio formato - estrae il valore numerico dalla stringa
                          const tempStr = ref.setTemperature.toString().replace('°C', '').trim()
                          tempValue = parseFloat(tempStr)
                        }
                        return !isNaN(tempValue) && tempValue >= 15 && tempValue <= 25
                      })
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
                                  <h4 className="font-medium text-sm">{refrigerator.name || 'Nome non disponibile'}</h4>
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
                                <span className="font-medium">{getDisplayTemperature(refrigerator)}</span>
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
                    {filteredRefrigerators.filter(ref => {
                        // Gestisce sia i vecchi frigoriferi (con setTemperature singola) che i nuovi (con range)
                        let tempValue = 0
                        if (ref.setTemperatureMin !== undefined && ref.setTemperatureMax !== undefined) {
                          // Nuovo formato con range - usa la media
                          tempValue = (ref.setTemperatureMin + ref.setTemperatureMax) / 2
                        } else if (ref.setTemperature) {
                          // Vecchio formato - estrae il valore numerico dalla stringa
                          const tempStr = ref.setTemperature.toString().replace('°C', '').trim()
                          tempValue = parseFloat(tempStr)
                        }
                        return !isNaN(tempValue) && tempValue >= 15 && tempValue <= 25
                      }).length === 0 && (
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
                                                            {getRefrigeratorType(refrigerator)}
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
                            <div className="font-medium">{getDisplayTemperature(refrigerator)} ({getRefrigeratorType(refrigerator)})</div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-6xl mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Aggiungi Punto di Conservazione</h2>
            
            {/* Informazioni sulla nuova logica */}
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
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
              {/* Sezione Informazioni Base */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informazioni Base</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-base font-medium text-gray-700">Nome punto di conservazione *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="es. ripiano A, Armadio 2, Freezer A..."
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location" className="text-base font-medium text-gray-700">Posizionamento *</Label>
                    <select
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seleziona reparto</option>
                      {departments.map((dept, index) => (
                        <option key={dept.id || index} value={dept.name || dept}>
                          {dept.name || dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                </div>
              </div>
              
              {/* Sezione Categorie Multiple */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Categorie di Prodotti (Max 5)</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                    className="flex items-center gap-1 text-xs px-2 py-1"
                  >
                    <Plus className="h-3 w-3" />
                    Nuova
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {allCategories.map(category => {
                    const isSelected = formData.selectedCategories?.includes(category.id) || false
                    const compatibility = getCategoryCompatibility(category.id, formData.selectedCategories || [], formData.setTemperature)
                    
                    const getCompatibilityStyle = () => {
                      switch (compatibility) {
                        case 'selected':
                          return 'bg-blue-200 border-blue-400 text-blue-900 shadow-sm';
                        case 'compatible':
                          return 'bg-green-200 border-green-400 text-green-900 shadow-sm';
                        case 'tolerance':
                          return 'bg-yellow-200 border-yellow-400 text-yellow-900 shadow-sm';
                        case 'incompatible':
                          return 'bg-red-200 border-red-400 text-red-900 shadow-sm';
                        case 'neutral':
                          return 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300';
                        default:
                          return 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300';
                      }
                    };
                    
                    return (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getCompatibilityStyle()}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs truncate">{category.name}</h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{category.description}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {isSelected && <CheckCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />}
                            {compatibility === 'compatible' && !isSelected && <span className="text-xs">✅</span>}
                            {compatibility === 'incompatible' && !isSelected && <span className="text-xs">❌</span>}
                            {compatibility === 'tolerance' && !isSelected && <span className="text-xs">⚠️</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {formData.selectedCategories && formData.selectedCategories.length > 0 && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <p className="text-sm font-medium text-gray-700 mb-2">Categorie selezionate:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedCategories.map(categoryId => {
                        const category = allCategories.find(cat => cat.id === categoryId)
                        return (
                          <span
                            key={categoryId}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {category?.name}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                
                {formData.selectedCategories.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    ⚠️ Seleziona almeno una categoria per procedere
                  </p>
                )}

                {/* Form espandibile per nuova categoria */}
                {showAddCategoryForm && (
                  <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold mb-2 text-gray-700">Crea Nuova Categoria</h3>
                    
                    <div className="space-y-2">
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
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            id="categoryIsAmbiente"
                            checked={newCategoryData.isAmbiente}
                            onChange={(e) => setNewCategoryData({...newCategoryData, isAmbiente: e.target.checked})}
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <Label htmlFor="categoryIsAmbiente" className="text-xs font-medium text-gray-700">
                            Temperatura ambiente (15-25°C)
                          </Label>
                        </div>
                        
                        {!newCategoryData.isAmbiente && (
                          <TemperatureInput
                            label="Range Temperatura (°C)"
                            minValue={newCategoryData.temperatureMin}
                            maxValue={newCategoryData.temperatureMax}
                            onMinChange={(e) => setNewCategoryData({...newCategoryData, temperatureMin: e.target.value})}
                            onMaxChange={(e) => setNewCategoryData({...newCategoryData, temperatureMax: e.target.value})}
                            required={false}
                            showValidation={true}
                            showSuggestions={true}
                            compactMode={true}
                            className="w-full"
                            id="category-temperature-range"
                          />
                        )}
                        
                        {newCategoryData.isAmbiente && (
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                            <div className="flex items-center gap-1">
                              <Thermometer className="h-3 w-3 text-blue-600" />
                              <span className="text-blue-800 font-medium">
                                Temperatura ambiente: 15-25°C
                              </span>
                            </div>
                            <p className="text-blue-600 mt-1">
                              Questa categoria utilizzerà automaticamente il range di temperatura ambiente.
                            </p>
                          </div>
                        )}
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
              
              {/* Sezione Temperatura */}
              <div className="bg-green-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Temperatura di Conservazione</h3>
                <div>
                  <Label htmlFor="setTemperature" className="text-sm font-medium text-gray-700">Temperatura Impostata (°C) *</Label>
                  <Input
                    id="setTemperature"
                    type="text"
                    value={formData.setTemperature}
                    onChange={(e) => setFormData({...formData, setTemperature: e.target.value})}
                    placeholder="es. 4, -18, 2.5, ambiente..."
                    className={`mt-1 p-3 ${
                      formData.setTemperature && formData.selectedCategories.length > 0 ? 
                        (() => {
                          const compliance = checkHACCPCompliance(formData.setTemperature, formData.selectedCategories);
                          return compliance.color === 'green' ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                                 compliance.color === 'yellow' ? 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500' :
                                 compliance.color === 'red' ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                                 'border-gray-300';
                        })() : 'border-gray-300'
                    }`}
                    required
                  />
                  <p className="text-xs text-gray-600 mt-2 p-2 bg-white rounded border">
                    Inserisci la temperatura di conservazione (es. 4 per frigorifero, -18 per freezer, "ambiente" per temperatura ambiente)
                  </p>
                </div>
                
                {/* Validazione HACCP in tempo reale */}
                {formData.setTemperature && formData.selectedCategories.length > 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-gray-50 border">
                    <div className="flex items-center gap-2 mb-3">
                      <Thermometer className="h-4 w-4" />
                      <span className="font-medium">Validazione HACCP:</span>
                    </div>
                    {(() => {
                      const compliance = checkHACCPCompliance(formData.setTemperature, formData.selectedCategories);
                      return (
                        <div className={`flex items-center gap-2 ${
                          compliance.color === 'green' ? 'text-green-600' :
                          compliance.color === 'yellow' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {compliance.type === 'compliant' ? '✅' : 
                           compliance.type === 'warning' ? '⚠️' : '❌'}
                          <span className="text-sm">{compliance.message}</span>
                        </div>
                      );
                    })()}
                    
                    {/* Suggerimenti temperature ottimali */}
                    {formData.selectedCategories.length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="text-sm text-blue-800">
                          <strong>Suggerimento:</strong> {(() => {
                            const suggestion = getOptimalTemperatureSuggestions(formData.selectedCategories);
                            if (suggestion && !suggestion.compatible) {
                              return suggestion.message;
                            } else if (suggestion) {
                              return suggestion.message;
                            }
                            return 'Seleziona categorie per ottenere suggerimenti sulle temperature ottimali';
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              

              {/* Sezione Manutenzione */}
              <div className="bg-orange-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Manutenzione</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency" className="text-sm font-medium text-gray-700">Frequenza Rilevamento *</Label>
                    <select
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                      required
                    >
                      <option value="">Seleziona frequenza</option>
                      <option value="giornaliera">Giornaliera</option>
                      <option value="settimanale">Settimanale</option>
                      <option value="bisettimanale">Bisettimanale</option>
                      <option value="mensile">Mensile</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="assignedRole" className="text-sm font-medium text-gray-700">Assegna rilevamento temperature a: *</Label>
                    <select
                      id="assignedRole"
                      value={formData.assignedRole}
                      onChange={(e) => setFormData({...formData, assignedRole: e.target.value, assignedTo: ''})}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                      required
                    >
                      <option value="">Seleziona categoria</option>
                      <option value="Responsabile">Responsabile</option>
                      <option value="Cuoco">Cuoco</option>
                      <option value="Banconista">Banconista</option>
                      <option value="Addetto">Addetto</option>
                      <option value="Altro">Altro</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="assignedTo" className="text-sm font-medium text-gray-700">Dipendente Specifico (Opzionale)</Label>
                    <select
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                      disabled={!formData.assignedRole}
                    >
                      <option value="">Seleziona dipendente</option>
                      {staffMembers
                        .filter(member => 
                          formData.assignedRole ? 
                            (formData.assignedRole === 'Altro' ? member.category === 'Altro' : member.role === formData.assignedRole) :
                            true
                        )
                        .map(member => (
                          <option key={member.id} value={member.name}>
                            {member.name || 'Nome non disponibile'} - {member.role || 'Ruolo non disponibile'} ({member.category || 'Categoria non disponibile'})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Pulsanti di Azione */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
                  disabled={!formData.name.trim() || !formData.setTemperature.trim() || !formData.location.trim() || !formData.assignedRole.trim() || !formData.frequency.trim() || !formData.selectedCategories || formData.selectedCategories.length === 0}
                >
                  Aggiungi Punto di Conservazione
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-6xl mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Modifica Punto di Conservazione</h2>
            
            {/* Informazioni sulla nuova logica */}
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
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
              {/* Sezione Informazioni Base */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informazioni Base</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">Nome punto di conservazione *</Label>
                    <Input
                      id="edit-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="es. ripiano A, Armadio 2, Freezer A..."
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-location" className="text-sm font-medium text-gray-700">Posizionamento *</Label>
                    <select
                      id="edit-location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seleziona reparto</option>
                      {departments.map((dept, index) => (
                        <option key={dept.id || index} value={dept.name || dept}>
                          {dept.name || dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Sezione Categorie Multiple */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Categorie di Prodotti (Max 5)</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                    className="flex items-center gap-1 text-xs px-2 py-1"
                  >
                    <Plus className="h-3 w-3" />
                    Nuova
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {allCategories.map(category => {
                    const isSelected = formData.selectedCategories?.includes(category.id) || false
                    const compatibility = getCategoryCompatibility(category.id, formData.selectedCategories || [], formData.setTemperature)
                    
                    const getCompatibilityStyle = () => {
                      switch (compatibility) {
                        case 'selected':
                          return 'bg-blue-200 border-blue-400 text-blue-900 shadow-sm';
                        case 'compatible':
                          return 'bg-green-200 border-green-400 text-green-900 shadow-sm';
                        case 'tolerance':
                          return 'bg-yellow-200 border-yellow-400 text-yellow-900 shadow-sm';
                        case 'incompatible':
                          return 'bg-red-200 border-red-400 text-red-900 shadow-sm';
                        case 'neutral':
                          return 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300';
                        default:
                          return 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300';
                      }
                    };
                    
                    return (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getCompatibilityStyle()}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs truncate">{category.name}</h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{category.description}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {isSelected && <CheckCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />}
                            {compatibility === 'compatible' && !isSelected && <span className="text-xs">✅</span>}
                            {compatibility === 'incompatible' && !isSelected && <span className="text-xs">❌</span>}
                            {compatibility === 'tolerance' && !isSelected && <span className="text-xs">⚠️</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {formData.selectedCategories && formData.selectedCategories.length > 0 && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <p className="text-sm font-medium text-gray-700 mb-2">Categorie selezionate:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedCategories.map(categoryId => {
                        const category = allCategories.find(cat => cat.id === categoryId)
                        return (
                          <span
                            key={categoryId}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {category?.name}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                
                {formData.selectedCategories.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    ⚠️ Seleziona almeno una categoria per procedere
                  </p>
                )}
              </div>
              
              {/* Sezione Temperatura */}
              <div className="bg-green-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Temperatura di Conservazione</h3>
                <div>
                  <Label htmlFor="edit-setTemperature" className="text-sm font-medium text-gray-700">Temperatura Impostata (°C) *</Label>
                  <Input
                    id="edit-setTemperature"
                    type="text"
                    value={formData.setTemperature}
                    onChange={(e) => setFormData({...formData, setTemperature: e.target.value})}
                    placeholder="es. 4, -18, 2.5, ambiente..."
                    className={`mt-1 p-3 ${
                      formData.setTemperature && formData.selectedCategories.length > 0 ? 
                        (() => {
                          const compliance = checkHACCPCompliance(formData.setTemperature, formData.selectedCategories);
                          return compliance.color === 'green' ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                                 compliance.color === 'yellow' ? 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500' :
                                 compliance.color === 'red' ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                                 'border-gray-300';
                        })() : 'border-gray-300'
                    }`}
                    required
                  />
                  <p className="text-xs text-gray-600 mt-2 p-2 bg-white rounded border">
                    Inserisci la temperatura di conservazione (es. 4 per frigorifero, -18 per freezer, "ambiente" per temperatura ambiente)
                  </p>
                </div>
                
                {/* Validazione HACCP in tempo reale */}
                {formData.setTemperature && formData.selectedCategories.length > 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-gray-50 border">
                    <div className="flex items-center gap-2 mb-3">
                      <Thermometer className="h-4 w-4" />
                      <span className="font-medium">Validazione HACCP:</span>
                    </div>
                    {(() => {
                      const compliance = checkHACCPCompliance(formData.setTemperature, formData.selectedCategories);
                      return (
                        <div className={`flex items-center gap-2 ${
                          compliance.color === 'green' ? 'text-green-600' :
                          compliance.color === 'yellow' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {compliance.type === 'compliant' ? '✅' : 
                           compliance.type === 'warning' ? '⚠️' : '❌'}
                          <span className="text-sm">{compliance.message}</span>
                        </div>
                      );
                    })()}
                    
                    {/* Suggerimenti temperature ottimali */}
                    {formData.selectedCategories.length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="text-sm text-blue-800">
                          <strong>Suggerimento:</strong> {(() => {
                            const suggestion = getOptimalTemperatureSuggestions(formData.selectedCategories);
                            if (suggestion && !suggestion.compatible) {
                              return suggestion.message;
                            } else if (suggestion) {
                              return suggestion.message;
                            }
                            return 'Seleziona categorie per ottenere suggerimenti sulle temperature ottimali';
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Sezione Posizionamento */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Posizionamento</h3>
                <div>
                  <Label htmlFor="edit-location" className="text-sm font-medium text-gray-700">Reparto *</Label>
                  <select
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                    required
                  >
                    <option value="">Seleziona un reparto</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sezione Manutenzione */}
              <div className="bg-orange-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Manutenzione</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-frequency" className="text-sm font-medium text-gray-700">Frequenza Rilevamento *</Label>
                    <select
                      id="edit-frequency"
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                      required
                    >
                      <option value="">Seleziona frequenza</option>
                      <option value="giornaliera">Giornaliera</option>
                      <option value="settimanale">Settimanale</option>
                      <option value="bisettimanale">Bisettimanale</option>
                      <option value="mensile">Mensile</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-assignedRole" className="text-sm font-medium text-gray-700">Assegna rilevamento temperature a: *</Label>
                    <select
                      id="edit-assignedRole"
                      value={formData.assignedRole}
                      onChange={(e) => setFormData({...formData, assignedRole: e.target.value, assignedTo: ''})}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                      required
                    >
                      <option value="">Seleziona categoria</option>
                      <option value="Responsabile">Responsabile</option>
                      <option value="Cuoco">Cuoco</option>
                      <option value="Banconista">Banconista</option>
                      <option value="Addetto">Addetto</option>
                      <option value="Altro">Altro</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="edit-assignedTo" className="text-sm font-medium text-gray-700">Dipendente Specifico (Opzionale)</Label>
                    <select
                      id="edit-assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                      disabled={!formData.assignedRole}
                    >
                      <option value="">Seleziona dipendente</option>
                      {staffMembers
                        .filter(member => 
                          formData.assignedRole ? 
                            (formData.assignedRole === 'Altro' ? member.category === 'Altro' : member.role === formData.assignedRole) :
                            true
                        )
                        .map(member => (
                          <option key={member.id} value={member.name}>
                            {member.name || 'Nome non disponibile'} - {member.role || 'Ruolo non disponibile'} ({member.category || 'Categoria non disponibile'})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={!formData.name.trim() || !formData.setTemperature.trim() || !formData.location.trim() || !formData.assignedRole.trim() || !formData.frequency.trim() || !formData.selectedCategories || formData.selectedCategories.length === 0}
                >
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
                      nextMaintenance: '',
                      assignedRole: '',
                      assignedTo: '',
                      frequency: '',
                      selectedCategories: []
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
                                              <div className="font-medium">{getDisplayTemperature(selectedRefrigerator)} ({getRefrigeratorType(selectedRefrigerator)})</div>
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
                    const tempDiff = Math.abs(temp.temperature - getTemperatureValue(selectedRefrigerator))
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

      {/* HelpOverlay per guide posizionamento prodotti */}
      {showHelpOverlay && (
        <HelpOverlay
          isOpen={showHelpOverlay}
          onClose={() => setShowHelpOverlay(false)}
          fridgeType={helpType}
        />
      )}

      {/* Riferimenti Normativi EU/ASL */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            📋 Riferimenti Normativi EU/ASL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700 space-y-3">
            <p className="font-medium text-gray-800">Le temperature di conservazione suggerite sono basate sulle seguenti normative europee e italiane:</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">🇪🇺 Regolamento (CE) 853/2004</h4>
                <p className="text-blue-700 text-xs mb-1">Allegato III - Requisiti specifici per alimenti di origine animale</p>
                <p className="text-blue-700 text-xs mb-1">• Carni fresche: ≤7°C (frattaglie ≤3°C)</p>
                <p className="text-blue-700 text-xs mb-1">• Pollame: ≤4°C</p>
                <p className="text-blue-700 text-xs mb-1">• Carni macinate: ≤2°C</p>
                <p className="text-blue-700 text-xs mb-1">• Pesce fresco: vicino al ghiaccio in fusione</p>
                <p className="text-blue-700 text-xs mb-1">• Latte crudo: ≤6°C</p>
                <p className="text-blue-700 text-xs mb-1">• Ovoprodotti: ≤4°C</p>
                <a 
                  href="https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-xs hover:text-blue-800"
                >
                  📖 Leggi il regolamento completo
                </a>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">🇮🇹 DPR 327/80 (Italia)</h4>
                <p className="text-green-700 text-xs mb-1">Prassi storiche richiamate da ASL</p>
                <p className="text-green-700 text-xs mb-1">• Alimenti cotti da mantenere caldi: +60–65°C</p>
                <p className="text-green-700 text-xs mb-1">• Alimenti facilmente deperibili: +4°C</p>
                <p className="text-green-700 text-xs mb-1">• Uova in guscio: temperatura costante</p>
                <p className="text-green-700 text-xs mb-1">• Evitare sbalzi termici</p>
                <p className="text-green-700 text-xs mb-1">• Proteggere da sole e odori</p>
                <p className="text-green-700 text-xs mb-1">• Rispettare etichette produttore</p>
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">❄️ Direttiva 89/108/CEE (Surgelati)</h4>
              <p className="text-purple-700 text-xs mb-1">• Catena del freddo continua a -18°C</p>
              <p className="text-purple-700 text-xs mb-1">• Non ricongelare dopo decongelamento</p>
              <p className="text-purple-700 text-xs mb-1">• Brevi fluttuazioni ammesse nel trasporto</p>
              <a 
                href="https://eur-lex.europa.eu/legal-content/IT/ALL/?uri=celex:31989L0108" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 underline text-xs hover:text-purple-800"
              >
                📖 Leggi la direttiva completa
              </a>
            </div>
            
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">⚠️ Note Importanti</h4>
              <p className="text-orange-700 text-xs mb-1">• Le temperature suggerite sono indicative e basate su normative EU/ASL</p>
              <p className="text-orange-700 text-xs mb-1">• Rispettare sempre le indicazioni specifiche del produttore</p>
              <p className="text-orange-700 text-xs mb-1">• In caso di dubbi, consultare le autorità sanitarie locali (ASL)</p>
              <p className="text-orange-700 text-xs mb-1">• Mantenere aggiornate le procedure HACCP aziendali</p>
              <p className="text-orange-700 text-xs mb-1">• Documentare eventuali deviazioni dalle temperature standard</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

export default PuntidiConservazione 
