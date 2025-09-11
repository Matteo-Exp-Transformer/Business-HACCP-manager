import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Trash2, Thermometer, AlertTriangle, CheckCircle, User, Plus, Search, MapPin, Calendar, Settings, Edit, X, HelpCircle } from 'lucide-react'
import { getConservationSuggestions, getOptimalTemperature } from '../utils/temperatureDatabase'
import TemperatureInput from './ui/TemperatureInput'
import HelpOverlay from './HelpOverlay'
import { CONSERVATION_POINT_RULES } from '../utils/haccpRules'
import MaintenanceSection from './MaintenanceSection'
import { 
  MAINTENANCE_TASK_TYPES, 
  validateMaintenanceConfig 
} from '../utils/maintenanceConstants'
import { supabaseService } from '../services/supabaseService'

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
    selectedCategories: [],
    maintenanceData: {},
    isAbbattitore: false
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRefrigerator, setSelectedRefrigerator] = useState(null)
  const [showTemperatureHistory, setShowTemperatureHistory] = useState(false)

  // Funzione stabilizzata per evitare loop infiniti
  const handleMaintenanceChange = useCallback((maintenanceData) => {
    setFormData(prev => ({...prev, maintenanceData}))
  }, [])
  
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
    
    // Controlla se targetTemp è una stringa e se è "ambiente"
    if (typeof targetTemp === 'string' && targetTemp.toLowerCase().trim() === 'ambiente') {
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
    if (!targetTemp || (typeof targetTemp === 'string' && targetTemp.trim() === '')) return 'neutral';
    
    // Gestisce "ambiente" come range 15-25°C per monitoraggio futuro
    let temp;
    let isAmbiente = false;
    
    // Controlla se targetTemp è una stringa e se è "ambiente"
    if (typeof targetTemp === 'string' && targetTemp.toLowerCase().trim() === 'ambiente') {
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
  // Carica i dati esistenti e assicurati che abbiano isAbbattitore
  useEffect(() => {
    const savedRefrigerators = localStorage.getItem('haccp-refrigerators')
    if (savedRefrigerators) {
      try {
        const refrigerators = JSON.parse(savedRefrigerators)
        const updatedRefrigerators = refrigerators.map(ref => ({
          ...ref,
          isAbbattitore: ref.isAbbattitore || false
        }))
        
        // Controlla se ci sono stati aggiornamenti
        const hasUpdates = refrigerators.some(ref => ref.isAbbattitore === undefined)
        if (hasUpdates) {
          console.log('🔄 Aggiornando punti di conservazione con flag isAbbattitore')
          setRefrigerators(updatedRefrigerators)
          localStorage.setItem('haccp-refrigerators', JSON.stringify(updatedRefrigerators))
        } else {
          setRefrigerators(updatedRefrigerators)
        }
        
        // Debug: mostra la classificazione di ogni punto (solo se ci sono stati aggiornamenti)
        if (hasUpdates) {
          console.log('🔍 Classificazione punti di conservazione:')
          updatedRefrigerators.forEach(ref => {
            const type = getRefrigeratorType(ref)
            console.log(`   ${ref.name}: ${ref.setTemperature}°C, isAbbattitore: ${ref.isAbbattitore} → ${type}`)
          })
        }
      } catch (error) {
        console.error('Errore nel caricamento dei frigoriferi:', error)
      }
    }
  }, [])

  // Carica le attività di manutenzione dal database per i punti esistenti
  useEffect(() => {
    const loadMaintenanceData = async () => {
      try {
        const result = await supabaseService.getMaintenanceTasks()
        if (result.success && result.data.length > 0) {
          console.log('🔍 Caricamento attività di manutenzione dal database:', result.data.length)
          
          // Raggruppa per punto di conservazione
          const groupedMaintenances = result.data.reduce((acc, maintenance) => {
            const pointId = maintenance.conservation_point_id
            if (!acc[pointId]) {
              acc[pointId] = {
                conservation_point_id: pointId,
                conservation_point_name: maintenance.conservation_point_name,
                tasks: []
              }
            }
            acc[pointId].tasks.push(maintenance)
            return acc
          }, {})
          
          const maintenanceArray = Object.values(groupedMaintenances)
          console.log('🔍 Attività raggruppate:', maintenanceArray)
          console.log('🔍 Numero totale di gruppi di attività:', maintenanceArray.length)
          
          // Aggiorna i frigoriferi esistenti con le attività di manutenzione
          setRefrigerators(prevRefrigerators => {
            // Controlla se ci sono già dati di manutenzione per evitare loop infiniti
            const hasMaintenanceData = prevRefrigerators.some(ref => 
              ref.maintenanceData && Object.keys(ref.maintenanceData).length > 0
            )
            
            if (hasMaintenanceData) {
              console.log('🔍 Dati di manutenzione già presenti, saltando aggiornamento')
              return prevRefrigerators
            }
            
            const updatedRefrigerators = prevRefrigerators.map(refrigerator => {
              const pointMaintenances = maintenanceArray.find(group => 
                group.conservation_point_id === refrigerator.id
              )
              
              if (pointMaintenances && pointMaintenances.tasks) {
                let maintenanceData = {}
                
                // Mappa i valori di frequenza ai valori corretti
                const mapFrequency = (freq, taskType) => {
                  if (!freq) return taskType === 'defrosting' ? 'semiannual' : 'daily'
                  
                  // Mappa valori comuni
                  if (freq === 'custom_days') return 'daily'
                  if (freq === 'Semestrale (ogni 6 mesi)') return 'semiannual'
                  if (freq === 'Annuale') return 'annual'
                  if (freq === 'Giornalmente') return 'daily'
                  if (freq === 'Settimanale') return 'weekly'
                  if (freq === 'Mensile') return 'monthly'
                  
                  // Se è già un valore valido, usalo
                  const validFrequencies = {
                    'temperature_monitoring': ['daily', 'weekly', 'monthly'],
                    'sanitization': ['daily', 'weekly'],
                    'defrosting': ['semiannual', 'annual']
                  }
                  
                  if (validFrequencies[taskType]?.includes(freq)) {
                    return freq
                  }
                  
                  // Default per tipo
                  return taskType === 'defrosting' ? 'semiannual' : 'daily'
                }
                
                // Mappa i ruoli ai valori corretti
                const mapRole = (role) => {
                  if (!role) return ''
                  
                  const roleMap = {
                    'Amministratore': 'amministratore',
                    'Responsabile': 'responsabile',
                    'Dipendente': 'dipendente',
                    'Collaboratore': 'collaboratore',
                    'Collaboratore Occasionale': 'collaboratore'
                  }
                  
                  return roleMap[role] || role.toLowerCase()
                }
                
                // Mappa le categorie ai valori corretti
                const mapCategory = (category) => {
                  if (!category) return ''
                  
                  const categoryMap = {
                    'Amministratore': 'amministratore',
                    'Cuochi': 'cuochi',
                    'Banconisti': 'banconisti',
                    'Camerieri': 'camerieri',
                    'Social & Media Manager': 'social_media_manager',
                    'Altro': 'altro'
                  }
                  
                  return categoryMap[category] || category.toLowerCase()
                }
                
                pointMaintenances.tasks.forEach(task => {
                  const taskType = task.task_type
                  if (taskType === 'temperature_monitoring') {
                    maintenanceData.temperature_monitoring = {
                      frequency: mapFrequency(task.frequency, 'temperature_monitoring'),
                      assigned_role: mapRole(task.assigned_role),
                      assigned_category: mapCategory(task.assigned_category),
                      assigned_staff_ids: task.assigned_staff_ids || []
                    }
                  } else if (taskType === 'sanitization') {
                    maintenanceData.sanitization = {
                      frequency: mapFrequency(task.frequency, 'sanitization'),
                      assigned_role: mapRole(task.assigned_role),
                      assigned_category: mapCategory(task.assigned_category),
                      assigned_staff_ids: task.assigned_staff_ids || []
                    }
                  } else if (taskType === 'defrosting') {
                    maintenanceData.defrosting = {
                      frequency: mapFrequency(task.frequency, 'defrosting'),
                      assigned_role: mapRole(task.assigned_role),
                      assigned_category: mapCategory(task.assigned_category),
                      assigned_staff_ids: task.assigned_staff_ids || []
                    }
                  }
                })
                
                console.log(`🔍 Aggiornando ${refrigerator.name} con maintenanceData:`, maintenanceData)
                console.log(`🔍 assigned_staff_ids:`, maintenanceData.temperature_monitoring?.assigned_staff_ids, maintenanceData.sanitization?.assigned_staff_ids, maintenanceData.defrosting?.assigned_staff_ids)
                return {
                  ...refrigerator,
                  maintenanceData: maintenanceData
                }
              }
              
              return refrigerator
            })
            
            // Salva nel localStorage
            // Debug: console.log('🔍 Salvando frigoriferi aggiornati con manutenzioni nel localStorage')
            localStorage.setItem('haccp-refrigerators', JSON.stringify(updatedRefrigerators))
            return updatedRefrigerators
          })
        }
      } catch (error) {
        console.error('❌ Errore nel caricamento delle attività di manutenzione:', error)
      }
    }
    
    loadMaintenanceData()
  }, [])

  // Carica i dipendenti dal localStorage
  useEffect(() => {
    const savedStaff = localStorage.getItem('haccp-staff')
    if (savedStaff) {
      try {
        const staff = JSON.parse(savedStaff)
        console.log('🔍 Caricando staffMembers dal localStorage:', staff.length)
        console.log('🔍 StaffMembers:', JSON.stringify(staff, null, 2))
        setStaffMembers(staff)
      } catch (error) {
        console.error('Errore nel caricamento dello staff:', error)
      }
    } else {
      console.log('🔍 Nessun staffMembers trovato nel localStorage')
    }
  }, [])

  // Carica i dati dell'onboarding solo se non ci sono già dati
  useEffect(() => {
    const savedOnboarding = localStorage.getItem('haccp-onboarding-new')
    const existingRefrigerators = localStorage.getItem('haccp-refrigerators')
    
    // Carica i dati dell'onboarding solo se non ci sono già frigoriferi salvati
    // e se non è già stato caricato (controlla un flag)
    const hasLoadedOnboarding = localStorage.getItem('haccp-onboarding-loaded')
    if (savedOnboarding && savedOnboarding !== '[object Object]' && !existingRefrigerators && !hasLoadedOnboarding) {
      try {
        const data = JSON.parse(savedOnboarding)
        setOnboardingData(data)
        
        // Estrae i reparti
        if (data.formData?.departments?.list && Array.isArray(data.formData.departments.list)) {
          setDepartments(data.formData.departments.list)
        }
        
        // Estrae i membri dello staff
        if (data.formData?.staff?.staffMembers && Array.isArray(data.formData.staff.staffMembers)) {
        console.log('🔍 Caricando staffMembers dall\'onboarding:', data.formData.staff.staffMembers.length)
        console.log('🔍 Primo dipendente:', JSON.stringify(data.formData.staff.staffMembers[0], null, 2))
        setStaffMembers(data.formData.staff.staffMembers)
        } else {
          console.log('🔍 Nessun staffMembers trovato nell\'onboarding')
        }
        
        // Estrae i punti di conservazione e li carica nei frigoriferi
        if (data.formData?.conservation?.points && Array.isArray(data.formData.conservation.points)) {
          // Carica le attività di manutenzione dall'onboarding
          const savedMaintenances = data.formData?.savedMaintenances || data.savedMaintenances || []
          
          console.log('🔍 Dati onboarding caricati:', data.formData.conservation.points.length, 'punti,', savedMaintenances.length, 'attività manutenzione')
          console.log('🔍 Primo punto di conservazione:', data.formData.conservation.points[0])
          
          const conservationPoints = data.formData.conservation.points.map(point => {
            // Trova le attività di manutenzione per questo punto
            const pointMaintenances = savedMaintenances.find(group => 
              group.conservation_point_id === point.id
            )
            
            // Debug: console.log(`🔍 Punto ${point.name}: ${pointMaintenances ? pointMaintenances.tasks.length : 0} attività`)
            
            // Converte le attività di manutenzione nel formato atteso
            let maintenanceData = {}
            if (pointMaintenances && pointMaintenances.tasks) {
              // Mappa i valori di frequenza ai valori corretti
              const mapFrequency = (freq, taskType) => {
                if (!freq) return taskType === 'defrosting' ? 'semiannual' : 'daily'
                
                // Mappa valori comuni
                if (freq === 'custom_days') return 'daily'
                if (freq === 'Semestrale (ogni 6 mesi)') return 'semiannual'
                if (freq === 'Annuale') return 'annual'
                if (freq === 'Giornalmente') return 'daily'
                if (freq === 'Settimanale') return 'weekly'
                if (freq === 'Mensile') return 'monthly'
                
                // Se è già un valore valido, usalo
                const validFrequencies = {
                  'temperature_monitoring': ['daily', 'weekly', 'monthly'],
                  'sanitization': ['daily', 'weekly'],
                  'defrosting': ['semiannual', 'annual']
                }
                
                if (validFrequencies[taskType]?.includes(freq)) {
                  return freq
                }
                
                // Default per tipo
                return taskType === 'defrosting' ? 'semiannual' : 'daily'
              }
              
              // Mappa i ruoli ai valori corretti
              const mapRole = (role) => {
                if (!role) return ''
                
                const roleMap = {
                  'Amministratore': 'amministratore',
                  'Responsabile': 'responsabile',
                  'Dipendente': 'dipendente',
                  'Collaboratore': 'collaboratore',
                  'Collaboratore Occasionale': 'collaboratore'
                }
                
                return roleMap[role] || role.toLowerCase()
              }
              
              // Mappa le categorie ai valori corretti
              const mapCategory = (category) => {
                if (!category) return ''
                
                const categoryMap = {
                  'Amministratore': 'amministratore',
                  'Cuochi': 'cuochi',
                  'Banconisti': 'banconisti',
                  'Camerieri': 'camerieri',
                  'Social & Media Manager': 'social_media_manager',
                  'Altro': 'altro'
                }
                
                return categoryMap[category] || category.toLowerCase()
              }
              
              pointMaintenances.tasks.forEach(task => {
                const taskType = task.task_type
                // Debug: console.log(`  - Attività ${taskType}:`, task)
                  if (taskType === 'temperature_monitoring') {
                    maintenanceData.temperature_monitoring = {
                      frequency: mapFrequency(task.frequency, 'temperature_monitoring'),
                      assigned_role: mapRole(task.assigned_role),
                      assigned_category: mapCategory(task.assigned_category),
                      assigned_staff_ids: task.assigned_staff_ids || []
                    }
                  } else if (taskType === 'sanitization') {
                    maintenanceData.sanitization = {
                      frequency: mapFrequency(task.frequency, 'sanitization'),
                      assigned_role: mapRole(task.assigned_role),
                      assigned_category: mapCategory(task.assigned_category),
                      assigned_staff_ids: task.assigned_staff_ids || []
                    }
                  } else if (taskType === 'defrosting') {
                    maintenanceData.defrosting = {
                      frequency: mapFrequency(task.frequency, 'defrosting'),
                      assigned_role: mapRole(task.assigned_role),
                      assigned_category: mapCategory(task.assigned_category),
                      assigned_staff_ids: task.assigned_staff_ids || []
                    }
                  }
              })
            }
            
            console.log(`🔍 Punto ${point.name} - MaintenanceData finale:`, maintenanceData)
            console.log(`🔍 Punto ${point.name} - assigned_staff_ids:`, maintenanceData.temperature_monitoring?.assigned_staff_ids, maintenanceData.sanitization?.assigned_staff_ids, maintenanceData.defrosting?.assigned_staff_ids)
            
            console.log(`🔍 Punto ${point.name} - targetTemp:`, point.targetTemp, 'setTemperature:', point.setTemperature, 'temperature:', point.temperature)
            console.log(`🔍 Punto ${point.name} - Tutti i campi temperatura:`, {
              targetTemp: point.targetTemp,
              setTemperature: point.setTemperature,
              temperature: point.temperature,
              temp: point.temp
            })
            console.log(`🔍 Punto ${point.name} - Punto completo:`, JSON.stringify(point, null, 2))
            
            return {
              ...point,
              id: point.id || `conservation-${Date.now()}-${Math.random()}`,
              setTemperature: point.targetTemp || point.setTemperature || point.temperature || point.temp || '',
              selectedCategories: point.selectedCategories || [],
              compliance: point.compliance || checkHACCPCompliance(point.targetTemp, point.selectedCategories),
              createdAt: point.createdAt || new Date().toISOString(),
              isAbbattitore: false, // Forza sempre false per i punti dall'onboarding
              maintenanceData: maintenanceData
            }
          })
          
          // Aggiorna i frigoriferi con i dati dell'onboarding
          setRefrigerators(conservationPoints)
          localStorage.setItem('haccp-refrigerators', JSON.stringify(conservationPoints))
          
          // Marca l'onboarding come caricato per evitare ricaricamenti
          localStorage.setItem('haccp-onboarding-loaded', 'true')
          
          console.log('✅ Punti di conservazione caricati dall\'onboarding:', conservationPoints.length, 'punti')
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
  const getRefrigeratorType = (refrigerator) => {
    // Se è esplicitamente marcato come abbattitore, restituisci Abbattitore
    if (refrigerator.isAbbattitore) {
      return 'Abbattitore'
    }
    
    // Gestisce sia i vecchi frigoriferi (con setTemperature singola) che i nuovi (con range) e quelli dall'onboarding
    let tempValue = 0
    
    // Controlla se è un oggetto con range di temperatura
    if (typeof refrigerator === 'object' && refrigerator.setTemperatureMin !== undefined && refrigerator.setTemperatureMax !== undefined) {
      // Nuovo formato con range - usa la media
      tempValue = (refrigerator.setTemperatureMin + refrigerator.setTemperatureMax) / 2
    } else if (refrigerator.setTemperature) {
      // Vecchio formato - gestisce sia numeri che "ambiente"
      if (refrigerator.setTemperature.toString().toLowerCase().trim() === 'ambiente') {
        tempValue = 20 // Valore medio per ambiente
      } else {
        const tempStr = refrigerator.setTemperature.toString().replace('°C', '').trim()
      tempValue = parseFloat(tempStr)
      }
    } else if (refrigerator.targetTemp) {
      // Formato dall'onboarding - gestisce sia numeri che "ambiente"
      if (refrigerator.targetTemp.toString().toLowerCase().trim() === 'ambiente') {
        tempValue = 20 // Valore medio per ambiente
      } else {
        const tempStr = refrigerator.targetTemp.toString().replace('°C', '').trim()
        tempValue = parseFloat(tempStr)
      }
    } else if (typeof refrigerator === 'string') {
      // Se viene passata direttamente una stringa di temperatura
      if (refrigerator.toLowerCase().trim() === 'ambiente') {
        tempValue = 20 // Valore medio per ambiente
      } else {
        const tempStr = refrigerator.replace('°C', '').trim()
        tempValue = parseFloat(tempStr)
      }
    } else if (typeof refrigerator === 'number') {
      // Formato numerico diretto
      tempValue = refrigerator
    }
    
    if (isNaN(tempValue)) return 'N/A'
    
    // Classifica in base alla temperatura (solo se non è esplicitamente marcato come abbattitore)
    if (tempValue < -1 && tempValue >= -90) {
      return 'Freezer'
    } else if (tempValue >= 0 && tempValue <= 8) {
      return 'Frigo'
    } else if (tempValue >= 15 && tempValue <= 27) {
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



  const addRefrigerator = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.setTemperature.trim() || !formData.location.trim() || !formData.selectedCategories || formData.selectedCategories.length === 0) {
      return
    }

    // Validazione dati di manutenzione
    if (formData.maintenanceData) {
      const maintenanceErrors = {}
      let hasMaintenanceErrors = false

      Object.values(MAINTENANCE_TASK_TYPES).forEach(taskType => {
        const taskData = formData.maintenanceData[taskType]
        if (taskData) {
          const validation = validateMaintenanceConfig(taskType, taskData)
          if (!validation.isValid) {
            maintenanceErrors[taskType] = validation.errors
            hasMaintenanceErrors = true
          }
        }
      })

      if (hasMaintenanceErrors) {
        alert('Configurazione manutenzione incompleta. Verifica che tutte e tre le attività (Rilevamento Temperatura, Sanificazione, Sbrinamento) abbiano frequenza, ruolo e categoria assegnati.')
        return
      }
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

    // Se è un abbattitore, aggiungi le categorie specifiche dell'abbattitore
    let finalCategories = formData.selectedCategories || []
    if (formData.isAbbattitore) {
      // Aggiungi le categorie specifiche dell'abbattitore
      const abbattitoreCategories = ['abbattitore_menu', 'abbattitore_esposizione']
      finalCategories = [...finalCategories, ...abbattitoreCategories]
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
      selectedCategories: finalCategories,
      maintenanceData: formData.maintenanceData || {},
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Unknown',
      isAbbattitore: formData.isAbbattitore || false
    }

    setRefrigerators([...refrigerators, newRefrigerator])
    
    // Salva le attività di manutenzione se presenti
    if (formData.maintenanceData && Object.keys(formData.maintenanceData).length > 0) {
      try {
        const maintenanceTasks = Object.values(MAINTENANCE_TASK_TYPES).map(taskType => {
          const taskData = formData.maintenanceData[taskType];
          return {
            id: `${newRefrigerator.id}_${taskType}_${Date.now()}`,
            company_id: supabaseService.getCompanyId(),
            conservation_point_id: newRefrigerator.id,
            task_type: taskType,
            frequency: taskData.frequency,
            assigned_role: taskData.assigned_role,
            assigned_category: taskData.assigned_category,
            assigned_staff_ids: taskData.assigned_staff_ids || [],
            is_active: true,
            created_at: new Date().toISOString()
          };
        });

        const result = await supabaseService.saveMaintenanceTasks(maintenanceTasks);
        if (result.success) {
          console.log('✅ Attività di manutenzione salvate:', result.data);
        } else {
          console.error('❌ Errore nel salvataggio manutenzione:', result.error);
        }
      } catch (error) {
        console.error('❌ Errore durante il salvataggio delle attività di manutenzione:', error);
      }
    }
    
    setFormData({
      name: '',
      setTemperature: '',
      location: '',
      dedicatedTo: '',
      nextMaintenance: '',
      assignedRole: '',
      assignedTo: '',
      frequency: '',
      selectedCategories: [],
      maintenanceData: {},
      isAbbattitore: false
    })
    setShowAddModal(false)
  }


  const deleteRefrigerator = async (id) => {
    if (confirm('Sei sicuro di voler eliminare questo punto di conservazione?')) {
      try {
        // Elimina le attività di manutenzione associate
        const result = await supabaseService.deleteMaintenanceTasksByConservationPoint(id);
        if (result.success) {
          console.log('✅ Attività di manutenzione eliminate per il punto:', id);
        } else {
          console.error('❌ Errore nell\'eliminazione manutenzione:', result.error);
        }
      } catch (error) {
        console.error('❌ Errore durante l\'eliminazione delle attività di manutenzione:', error);
      }
      
      setRefrigerators(refrigerators.filter(ref => ref.id !== id))
    }
  }

  const editRefrigerator = (refrigerator) => {
    setEditingRefrigerator(refrigerator)
    
    // Debug: verifica i dati di manutenzione
    console.log('🔍 EditRefrigerator - Dati del punto:', refrigerator.name)
    console.log('🔍 maintenanceData completo:', JSON.stringify(refrigerator.maintenanceData, null, 2))
    console.log('🔍 staffMembers disponibili:', staffMembers.length, 'dipendenti')
    console.log('🔍 setTemperature:', refrigerator.setTemperature)
    console.log('🔍 Tutti i campi temperatura nel punto:', {
      setTemperature: refrigerator.setTemperature,
      targetTemp: refrigerator.targetTemp,
      temperature: refrigerator.temperature,
      temp: refrigerator.temp
    })
    
    // Estrae il valore di temperatura da tutti i possibili campi
    let temperature = ''
    
    const tempValue = refrigerator.setTemperature || refrigerator.targetTemp || refrigerator.temperature || refrigerator.temp
    
    if (tempValue) {
      const tempStr = tempValue.toString()
      
      // Se è il range "da 15°C a 25°C", mostra "ambiente"
      if (tempStr.includes('da 15°C a 25°C')) {
        temperature = 'ambiente'
      } else {
        // Estrae il valore numerico dalla stringa (es. "4°C" -> "4")
        temperature = tempStr.replace('°C', '').trim()
      }
    }
    
    console.log('🔍 Temperatura estratta:', temperature, 'da valore:', tempValue)
    
    const formDataToSet = {
      name: refrigerator.name,
      setTemperature: temperature,
      location: refrigerator.location || '',
      dedicatedTo: refrigerator.dedicatedTo || '',
      nextMaintenance: refrigerator.nextMaintenance || '',
      assignedRole: refrigerator.assignedRole || '',
      assignedTo: refrigerator.assignedTo || '',
      frequency: refrigerator.frequency || '',
      selectedCategories: refrigerator.selectedCategories || [],
      maintenanceData: refrigerator.maintenanceData || {},
      isAbbattitore: refrigerator.isAbbattitore || false
    }
    
    console.log('🔍 FormData da impostare:', JSON.stringify(formDataToSet.maintenanceData, null, 2))
    setFormData(formDataToSet)
    setShowEditModal(true)
  }

  const updateRefrigerator = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.setTemperature.trim() || !formData.location.trim() || !formData.selectedCategories || formData.selectedCategories.length === 0) {
      return
    }

    // Validazione dati di manutenzione
    if (formData.maintenanceData) {
      const maintenanceErrors = {}
      let hasMaintenanceErrors = false

      Object.values(MAINTENANCE_TASK_TYPES).forEach(taskType => {
        const taskData = formData.maintenanceData[taskType]
        if (taskData) {
          const validation = validateMaintenanceConfig(taskType, taskData)
          if (!validation.isValid) {
            maintenanceErrors[taskType] = validation.errors
            hasMaintenanceErrors = true
          }
        }
      })

      if (hasMaintenanceErrors) {
        alert('Configurazione manutenzione incompleta. Verifica che tutte e tre le attività (Rilevamento Temperatura, Sanificazione, Sbrinamento) abbiano frequenza, ruolo e categoria assegnati.')
        return
      }
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

    // Se è un abbattitore, aggiungi le categorie specifiche dell'abbattitore
    let finalCategories = formData.selectedCategories || []
    if (formData.isAbbattitore) {
      // Aggiungi le categorie specifiche dell'abbattitore
      const abbattitoreCategories = ['abbattitore_menu', 'abbattitore_esposizione']
      finalCategories = [...finalCategories, ...abbattitoreCategories]
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
      selectedCategories: finalCategories,
      maintenanceData: formData.maintenanceData || {},
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || 'Unknown',
      isAbbattitore: formData.isAbbattitore || false
    }

    setRefrigerators(refrigerators.map(ref => 
      ref.id === editingRefrigerator.id ? updatedRefrigerator : ref
    ))
    
    // Aggiorna le attività di manutenzione se presenti
    if (formData.maintenanceData && Object.keys(formData.maintenanceData).length > 0) {
      try {
        // Prima elimina le attività esistenti per questo punto
        await supabaseService.deleteMaintenanceTasksByConservationPoint(editingRefrigerator.id);
        
        // Poi crea le nuove attività
        const maintenanceTasks = Object.values(MAINTENANCE_TASK_TYPES).map(taskType => {
          const taskData = formData.maintenanceData[taskType];
          return {
            id: `${editingRefrigerator.id}_${taskType}_${Date.now()}`,
            company_id: supabaseService.getCompanyId(),
            conservation_point_id: editingRefrigerator.id,
            task_type: taskType,
            frequency: taskData.frequency,
            assigned_role: taskData.assigned_role,
            assigned_category: taskData.assigned_category,
            assigned_staff_ids: taskData.assigned_staff_ids || [],
            is_active: true,
            created_at: new Date().toISOString()
          };
        });

        const result = await supabaseService.saveMaintenanceTasks(maintenanceTasks);
        if (result.success) {
          console.log('✅ Attività di manutenzione aggiornate:', result.data);
        } else {
          console.error('❌ Errore nell\'aggiornamento manutenzione:', result.error);
        }
      } catch (error) {
        console.error('❌ Errore durante l\'aggiornamento delle attività di manutenzione:', error);
      }
    }
    
    setFormData({
      name: '',
      setTemperature: '',
      location: '',
      dedicatedTo: '',
      nextMaintenance: '',
                      assignedRole: '',
                      assignedTo: '',
                      frequency: '',
      selectedCategories: [],
                      maintenanceData: {},
                      isAbbattitore: false
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
    } else if (refrigerator.targetTemp) {
      // Formato dall'onboarding
      return refrigerator.targetTemp
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
    } else if (refrigerator.targetTemp) {
      // Formato dall'onboarding - estrae il valore numerico dalla stringa
      const tempStr = refrigerator.targetTemp.toString().replace('°C', '').trim()
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
                {/* Frigoriferi (0°C a +8°C) */}
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
                      .filter(ref => getRefrigeratorType(ref) === 'Frigo')
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
                            {/* Mostra le categorie selezionate dall'onboarding */}
                            {refrigerator.selectedCategories && refrigerator.selectedCategories.length > 0 && (
                              <div className="mt-2 text-xs">
                                <span className="text-gray-500">Categorie: </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {refrigerator.selectedCategories.map(categoryId => {
                                    const category = allCategories.find(cat => cat.id === categoryId)
                                    return (
                                      <span
                                        key={categoryId}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                      >
                                        {category?.name || categoryId}
                                      </span>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                            {/* Fallback per la vecchia categoria singola */}
                            {(!refrigerator.selectedCategories || refrigerator.selectedCategories.length === 0) && refrigerator.dedicatedTo && (
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
                    {filteredRefrigerators.filter(ref => getRefrigeratorType(ref) === 'Frigo').length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nessun frigorifero</p>
                    )}
                  </div>
                </div>

                {/* Freezer (-1°C a -90°C) */}
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
                      .filter(ref => getRefrigeratorType(ref) === 'Freezer')
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
                            {/* Mostra le categorie selezionate dall'onboarding */}
                            {refrigerator.selectedCategories && refrigerator.selectedCategories.length > 0 && (
                              <div className="mt-2 text-xs">
                                <span className="text-gray-500">Categorie: </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {refrigerator.selectedCategories.map(categoryId => {
                                    const category = allCategories.find(cat => cat.id === categoryId)
                                    return (
                                      <span
                                        key={categoryId}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                      >
                                        {category?.name || categoryId}
                                      </span>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                            {/* Fallback per la vecchia categoria singola */}
                            {(!refrigerator.selectedCategories || refrigerator.selectedCategories.length === 0) && refrigerator.dedicatedTo && (
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
                    {filteredRefrigerators.filter(ref => getRefrigeratorType(ref) === 'Freezer').length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nessun freezer</p>
                    )}
                  </div>
                </div>

                {/* Abbattitore (solo punti con isAbbattitore: true) */}
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
                      .filter(ref => getRefrigeratorType(ref) === 'Abbattitore')
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
                            {/* Mostra le categorie selezionate dall'onboarding */}
                            {refrigerator.selectedCategories && refrigerator.selectedCategories.length > 0 && (
                              <div className="mt-2 text-xs">
                                <span className="text-gray-500">Categorie: </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {refrigerator.selectedCategories.map(categoryId => {
                                    const category = allCategories.find(cat => cat.id === categoryId)
                                    return (
                                      <span
                                        key={categoryId}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                      >
                                        {category?.name || categoryId}
                                      </span>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                            {/* Fallback per la vecchia categoria singola */}
                            {(!refrigerator.selectedCategories || refrigerator.selectedCategories.length === 0) && refrigerator.dedicatedTo && (
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
                    {filteredRefrigerators.filter(ref => getRefrigeratorType(ref) === 'Abbattitore').length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nessun abbattitore</p>
                    )}
                  </div>
                </div>

                {/* Ambiente (15°C a 27°C) */}
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
                      .filter(ref => getRefrigeratorType(ref) === 'Ambiente')
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
                    {filteredRefrigerators.filter(ref => getRefrigeratorType(ref) === 'Ambiente').length === 0 && (
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
                  <Label htmlFor="setTemperature" className="text-sm font-medium text-gray-700">Temperatura Punto di Conservazione (°C) *</Label>
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
                  
                  {/* Checkbox Abbattitore - appare solo se temperatura è tra -1°C e -90°C */}
                  {(() => {
                    const tempValue = parseFloat(formData.setTemperature);
                    const isInAbbattitoreRange = !isNaN(tempValue) && tempValue >= -90 && tempValue <= -1;
                    return isInAbbattitoreRange ? (
                      <div className="mt-3 flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isAbbattitore"
                          checked={formData.isAbbattitore}
                          onChange={(e) => setFormData({...formData, isAbbattitore: e.target.checked})}
                          className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <Label htmlFor="isAbbattitore" className="text-lg font-bold text-red-700">
                          Abbattitore
                        </Label>
                      </div>
                    ) : null;
                  })()}
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
              <MaintenanceSection
                conservationPointId={null} // Sarà generato al salvataggio
                staffMembers={staffMembers}
                onMaintenanceChange={handleMaintenanceChange}
                initialData={formData.maintenanceData}
                isRequired={true}
              />
              
              {/* Pulsanti di Azione */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
                  disabled={!formData.name.trim() || !formData.setTemperature.trim() || !formData.location.trim() || !formData.selectedCategories || formData.selectedCategories.length === 0}
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
                  <Label htmlFor="edit-setTemperature" className="text-sm font-medium text-gray-700">Temperatura Punto di Conservazione (°C) *</Label>
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
                  
                  {/* Checkbox Abbattitore - appare solo se temperatura è tra -1°C e -90°C */}
                  {(() => {
                    const tempValue = parseFloat(formData.setTemperature);
                    const isInAbbattitoreRange = !isNaN(tempValue) && tempValue >= -90 && tempValue <= -1;
                    return isInAbbattitoreRange ? (
                      <div className="mt-3 flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="edit-isAbbattitore"
                          checked={formData.isAbbattitore}
                          onChange={(e) => setFormData({...formData, isAbbattitore: e.target.checked})}
                          className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <Label htmlFor="edit-isAbbattitore" className="text-lg font-bold text-red-700">
                          Abbattitore
                        </Label>
                      </div>
                    ) : null;
                  })()}
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
              <MaintenanceSection
                conservationPointId={editingRefrigerator?.id}
                staffMembers={staffMembers}
                onMaintenanceChange={handleMaintenanceChange}
                initialData={formData.maintenanceData}
                isRequired={true}
              />
              
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={!formData.name.trim() || !formData.setTemperature.trim() || !formData.location.trim() || !formData.selectedCategories || formData.selectedCategories.length === 0}
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
