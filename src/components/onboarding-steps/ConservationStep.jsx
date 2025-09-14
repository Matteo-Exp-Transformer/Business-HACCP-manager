import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Plus, X, Thermometer, AlertTriangle, Edit, CheckCircle } from 'lucide-react';
import { CONSERVATION_POINT_RULES } from '../../utils/haccpRules';
import { debugLog, errorLog, haccpLog } from '../../utils/debug';
import { useScrollToForm } from '../../hooks/useScrollToForm';

const ConservationStep = ({ 
  formData, 
  setFormData, 
  currentStep, 
  validateStep, 
  confirmStep, 
  markStepAsUnconfirmed, 
  isStepConfirmed, 
  canConfirmStep 
}) => {
  const [conservationPoints, setConservationPoints] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);

  // Hook per scroll automatico al form
  const { formRef, scrollToForm } = useScrollToForm(showAddForm, 'conservation-step-form');
  
  // Effetto per scroll automatico quando il form si apre
  useEffect(() => {
    if (showAddForm) {
      scrollToForm();
    }
  }, [showAddForm, scrollToForm]);

  const [validationErrors, setValidationErrors] = useState({});
  const [temperatureFieldHighlighted, setTemperatureFieldHighlighted] = useState(false);
  const [localFormData, setLocalFormData] = useState({
    name: '',
    location: '',
    targetTemp: '', // Sostituiamo minTemp e maxTemp con targetTemp
    selectedCategories: [],
    isAbbattitore: false,
    isAmbiente: false
  });

  // Usa i dati reali da formData
  const departments = formData.departments?.list || [];
  const staffMembers = formData.staff?.staffMembers || [];
  
  // Debug: log dei reparti per verificare il problema
  debugLog('🔍 ConservationStep - formData:', formData);
  debugLog('🔍 ConservationStep - departments:', departments);
  
  // Ottieni i reparti disponibili, includendo quelli personalizzati
  const availableDepartments = departments.length > 0 ? 
    departments.filter(dept => dept && dept.enabled).map(dept => dept.name || dept) : 
    ['Cucina', 'Bancone', 'Sala', 'Magazzino'];
  
  debugLog('🔍 ConservationStep - availableDepartments:', availableDepartments);

  // Carica dati esistenti quando il componente si monta
  useEffect(() => {
    if (formData.conservation?.points && formData.conservation.points.length > 0) {
      // Calcola SEMPRE la compliance per ogni punto quando i dati vengono caricati
      const pointsWithCompliance = formData.conservation.points.map(point => {
        if (point.targetTemp && point.selectedCategories && point.selectedCategories.length > 0) {
          const compliance = checkHACCPCompliance(point.targetTemp, point.selectedCategories);
          return {
            ...point,
            compliance: {
              compliant: compliance?.compliant || false,
              message: compliance?.message || 'Non validato',
              type: compliance?.type || 'error',
              color: compliance?.color || 'red'
            }
          };
        }
        return {
          ...point,
          compliance: {
            compliant: false,
            message: 'Non validato',
            type: 'error',
            color: 'red'
          }
        };
      });
      setConservationPoints(pointsWithCompliance);
    }
  }, [formData.conservation]);


  // Aggiorna il formData solo quando necessario (rimosso per evitare loop infinito)
  // La funzione handleAddPoint gestisce già l'aggiornamento del formData

  // Funzione per aggiornare la compliance di un punto specifico
  const updatePointCompliance = (pointId) => {
    setConservationPoints(prevPoints => 
      prevPoints.map(point => {
        if (point.id === pointId && point.targetTemp && point.selectedCategories && point.selectedCategories.length > 0) {
          const compliance = checkHACCPCompliance(point.targetTemp, point.selectedCategories);
          return {
            ...point,
            compliance: {
              compliant: compliance?.compliant || false,
              message: compliance?.message || 'Non validato',
              type: compliance?.type || 'error',
              color: compliance?.color || 'red'
            }
          };
        }
        return {
          ...point,
          compliance: {
            compliant: false,
            message: 'Non validato',
            type: 'error',
            color: 'red'
          }
        };
      })
    );
    
    // Marca lo step come non confermato quando vengono modificati i dati
    markStepAsUnconfirmed(currentStep);
  };

  const resetForm = () => {
    setLocalFormData({
      name: '',
      location: '',
      targetTemp: '',
      selectedCategories: [],
      isAbbattitore: false,
      isAmbiente: false
    });
    setEditingPoint(null);
  };

  const checkHACCPCompliance = (targetTemp, selectedCategories = []) => {
    // Gestisce il caso speciale "Ambiente"
    if (typeof targetTemp === 'string' && targetTemp.includes('Ambiente')) {
      // Per ambiente, controlla solo che ci sia "Dispensa Secca"
      const hasDispensaSecca = selectedCategories.includes('dry_goods');
      
      if (hasDispensaSecca) {
        return { 
          compliant: true, 
          message: '✅ Temperatura ambiente valida per Dispensa Secca', 
          type: 'compliant',
          color: 'green'
        };
      } else {
        return { 
          compliant: false, 
          message: '⚠️ Per temperatura ambiente seleziona solo "Dispensa Secca"', 
          type: 'warning',
          color: 'orange'
        };
      }
    }
    
    const temp = parseFloat(targetTemp);
    
    if (isNaN(temp)) return { compliant: false, message: 'Temperatura non valida', type: 'error' };
    
    // Se sono state selezionate categorie, usa le regole HACCP
    if (selectedCategories.length > 0) {
      // Prima controlla se le categorie sono compatibili tra loro
      const tolerance = CONSERVATION_POINT_RULES.tolerance;
      let hasIncompatibleCategories = false;
      
      // Controlla se ci sono categorie con range di temperatura che non si sovrappongono
      for (let i = 0; i < selectedCategories.length; i++) {
        for (let j = i + 1; j < selectedCategories.length; j++) {
          const category1 = CONSERVATION_POINT_RULES.categories.find(c => c.id === selectedCategories[i]);
          const category2 = CONSERVATION_POINT_RULES.categories.find(c => c.id === selectedCategories[j]);
          
          if (category1 && category2) {
            // Calcola i range di tolleranza per entrambe le categorie
            const range1Min = category1.minTemp - tolerance;
            const range1Max = category1.maxTemp + tolerance;
            const range2Min = category2.minTemp - tolerance;
            const range2Max = category2.maxTemp + tolerance;
            
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
      
      let allInRange = true;
      let allInToleranceRange = true;
      let incompatibleCategories = [];
      
      for (const categoryId of selectedCategories) {
        const category = CONSERVATION_POINT_RULES.categories.find(c => c.id === categoryId);
        if (category) {
          // Controlla se è nel range HACCP
          const inRange = temp >= category.minTemp && temp <= category.maxTemp;
          // Controlla se è nel range di tolleranza estesa (±0.5°C)
          const categoryMin = category.minTemp - tolerance;
          const categoryMax = category.maxTemp + tolerance;
          const inToleranceRange = temp >= categoryMin && temp <= categoryMax;
          
          if (!inRange) {
            allInRange = false;
            if (!inToleranceRange) {
              allInToleranceRange = false;
              incompatibleCategories.push(category.name);
            }
          }
        }
      }
      
      if (allInRange) {
        return { 
          compliant: true, 
          message: '✅ Valore temperatura valido per tutte le categorie', 
          type: 'compliant',
          color: 'green'
        };
      } else if (allInToleranceRange) {
        return { 
          compliant: true, 
          message: `Temperatura impostata entro i limiti accettabili (0,5°C di differenza) per tutte le categorie`, 
          type: 'warning',
          color: 'yellow'
        };
      } else {
        return { 
          compliant: false, 
          message: `❌ Fuori range HACCP per: ${incompatibleCategories.join(', ')}`, 
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

  // Funzione per determinare la compatibilità delle categorie (logica originale corretta)
  const getCategoryCompatibility = (categoryId, selectedCategories, targetTemp) => {
    // Controlla se la categoria è già selezionata
    if (selectedCategories.includes(categoryId)) return 'selected';
    
    // Le categorie abbattitore non hanno range ottimale di conservazione
    if (categoryId === 'abbattitore_menu' || categoryId === 'abbattitore_esposizione') {
      return 'neutral';
    }
    
    // Se non c'è temperatura inserita, mostra tutte le categorie come neutral
    if (!targetTemp || (typeof targetTemp === 'string' && targetTemp.trim() === '')) return 'neutral';
    
    // Gestisce "ambiente" come range 15-25°C per monitoraggio futuro
    let temp;
    let isAmbiente = false;
    
<<<<<<< Updated upstream
    // Controlla se targetTemp è una stringa e se è "ambiente"
    if (typeof targetTemp === 'string' && targetTemp.toLowerCase().trim() === 'ambiente') {
=======
    // Controlla se targetTemp è una stringa e se contiene "Ambiente"
    if (typeof targetTemp === 'string' && targetTemp.includes('Ambiente')) {
>>>>>>> Stashed changes
      temp = 20; // Valore medio per validazione HACCP
      isAmbiente = true;
    } else {
      temp = parseFloat(targetTemp);
    }
    if (isNaN(temp)) return 'neutral';
    
    // Cerca prima nelle categorie HACCP standard, poi in quelle personalizzate
    let category = CONSERVATION_POINT_RULES.categories.find(c => c.id === categoryId);
    if (!category) return 'neutral';
    
    // Controlla compatibilità con le categorie già selezionate
    const tolerance = CONSERVATION_POINT_RULES.tolerance;
    
    // Calcola il range di tolleranza per la categoria corrente
    const categoryMin = category.minTemp - tolerance;
    const categoryMax = category.maxTemp + tolerance;
    const categoryMinTemp = category.minTemp;
    const categoryMaxTemp = category.maxTemp;
    
    // Controlla se la temperatura target è nel range di questa categoria
    // Gestione speciale per "ambiente" - deve essere compatibile con range 15-25°C
    if (isAmbiente) {
      const ambienteRange = { min: 15, max: 25 };
      if (categoryMinTemp <= ambienteRange.max && categoryMaxTemp >= ambienteRange.min) {
        return 'compatible';
      } else {
        return 'incompatible';
      }
    } else if (temp >= categoryMinTemp && temp <= categoryMaxTemp) {
      // Temperatura nel range HACCP ottimale
      if (selectedCategories.length === 0) {
        return 'compatible'; // Se non ci sono categorie selezionate, mostra come compatibile
      }
      
      // Controlla compatibilità con le altre categorie selezionate
      for (const selectedId of selectedCategories) {
        const selectedCategory = CONSERVATION_POINT_RULES.categories.find(c => c.id === selectedId);
        if (selectedCategory) {
          const selectedMin = selectedCategory.minTemp - tolerance;
          const selectedMax = selectedCategory.maxTemp + tolerance;
          
          // Se c'è sovrapposizione nei range di tolleranza, è compatibile
          if (selectedMin <= categoryMax && selectedMax >= categoryMin) {
            return 'compatible';
          }
        }
      }
      return 'incompatible';
    } else if (temp >= categoryMin && temp <= categoryMax) {
      // Temperatura nel range di tolleranza (fuori dal range ottimale ma accettabile)
      if (selectedCategories.length === 0) {
        return 'tolerance'; // Se non ci sono categorie selezionate, mostra come tolleranza
      }
      
      // Controlla compatibilità con le altre categorie selezionate
      for (const selectedId of selectedCategories) {
        const selectedCategory = CONSERVATION_POINT_RULES.categories.find(c => c.id === selectedId);
        if (selectedCategory) {
          const selectedMin = selectedCategory.minTemp - tolerance;
          const selectedMax = selectedCategory.maxTemp + tolerance;
          
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

  // Funzione per generare suggerimento di temperatura
  const getTemperatureSuggestion = (point) => {
    if (!point.selectedCategories || point.selectedCategories.length === 0) {
      return null;
    }

    const temp = parseFloat(point.targetTemp);
    if (isNaN(temp)) return null;

    // Trova la categoria principale (la prima selezionata)
    const mainCategory = CONSERVATION_POINT_RULES.categories.find(c => c.id === point.selectedCategories[0]);
    if (!mainCategory) return null;

    const tolerance = CONSERVATION_POINT_RULES.tolerance;
    const optimalMin = mainCategory.minTemp;
    const optimalMax = mainCategory.maxTemp;
    const toleranceMin = optimalMin - tolerance;
    const toleranceMax = optimalMax + tolerance;

    // Se è nel range ottimale, non serve suggerimento
    if (temp >= optimalMin && temp <= optimalMax) {
      return null;
    }

    // Se è nel range di tolleranza, suggerisci di avvicinarsi all'ottimale
    if (temp >= toleranceMin && temp <= toleranceMax) {
      const optimalCenter = (optimalMin + optimalMax) / 2;
      if (temp < optimalCenter) {
        return `Aumenta la temperatura verso ${optimalCenter.toFixed(1)}°C per ottimizzare la conservazione`;
      } else {
        return `Diminuisci la temperatura verso ${optimalCenter.toFixed(1)}°C per ottimizzare la conservazione`;
      }
    }

    // Se è fuori dal range di tolleranza, suggerisci il range ottimale
    if (temp < toleranceMin) {
      return `Aumenta la temperatura al range ottimale ${optimalMin}-${optimalMax}°C`;
    } else if (temp > toleranceMax) {
      return `Diminuisci la temperatura al range ottimale ${optimalMin}-${optimalMax}°C`;
    }

    return null;
  };

  // Funzione per ottenere la temperatura ottimale di una categoria
  const getOptimalTemperatureLocal = (categoryId) => {
    const category = CONSERVATION_POINT_RULES.categories.find(c => c.id === categoryId);
    if (category) {
      return {
        min: category.minTemp,
        max: category.maxTemp
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
        const category = CONSERVATION_POINT_RULES.categories.find(cat => cat.id === categoryId);
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
      // Calcola la temperatura ottimale come media del range comune
      const optimalTemp = Math.round(((minTemp + maxTemp) / 2) * 10) / 10;
      return {
        compatible: true,
        message: `Temperatura ottimale per le categorie selezionate: ${optimalTemp}°C`
      };
    } else {
      return {
        compatible: false,
        message: `⚠️ Conflitto di temperature: Le categorie selezionate hanno range incompatibili. Verifica i requisiti HACCP.`
      };
    }
  };

  const handleAddPoint = () => {
    if (localFormData.name && localFormData.location && (localFormData.targetTemp || localFormData.isAmbiente) && localFormData.selectedCategories.length > 0) {
      // Gestisce le categorie in base al tipo di punto
      let finalCategories = localFormData.selectedCategories || []
      
      if (localFormData.isAmbiente) {
        // Per ambiente, forza solo "Dispensa Secca"
        finalCategories = ['dry_goods']
      } else if (localFormData.isAbbattitore) {
        // Se è un abbattitore, aggiungi le categorie specifiche dell'abbattitore
        const abbattitoreCategories = ['abbattitore_menu', 'abbattitore_esposizione']
        finalCategories = [...finalCategories, ...abbattitoreCategories]
      }
      
      // Gestisce il caso speciale "ambiente"
      let targetTemp = localFormData.targetTemp;
      if (localFormData.isAmbiente) {
        targetTemp = 'Ambiente (15°C - 27°C)';
      }
      
      const compliance = checkHACCPCompliance(targetTemp, finalCategories);
      
      const pointData = {
        ...localFormData,
        targetTemp: targetTemp,
        selectedCategories: finalCategories,
        compliance
      };
      
      if (editingPoint) {
        // Modifica punto esistente
        const updatedPoints = conservationPoints.map(point => 
          point.id === editingPoint ? { ...point, ...pointData } : point
        );
        setConservationPoints(updatedPoints);
        
        // Aggiorna il formData
        setFormData(prev => ({
          ...prev,
          conservation: {
            points: updatedPoints,
            count: updatedPoints.length
          }
        }));
      } else {
        // Aggiungi nuovo punto
        const newPoint = {
          id: Date.now(),
          ...pointData
        };
        const updatedPoints = [...conservationPoints, newPoint];
        setConservationPoints(updatedPoints);
        
        // Aggiorna il formData
        setFormData(prev => ({
          ...prev,
          conservation: {
            points: updatedPoints,
            count: updatedPoints.length
          }
        }));
      }
      
      resetForm();
      setShowAddForm(false);
      
      // Marca lo step come non confermato quando viene aggiunto un nuovo punto
      markStepAsUnconfirmed(currentStep);
    }
  };


  const handleDeletePoint = (id) => {
    const updatedPoints = conservationPoints.filter(point => point.id !== id);
    
    debugLog('🗑️ ConservationStep - Eliminando punto:', {
      pointId: id,
      pointsBefore: conservationPoints.length,
      pointsAfter: updatedPoints.length
    });
    
    setConservationPoints(updatedPoints);
    
    // Aggiorna il formData
    setFormData(prev => ({
      ...prev,
      conservation: {
        points: updatedPoints,
        count: updatedPoints.length
      }
    }));
    
    // Marca lo step come non confermato quando viene eliminato un punto
    markStepAsUnconfirmed(currentStep);
    
    // Forza il ricalcolo della validazione
    debugLog('🔄 ConservationStep - Validazione dopo eliminazione:', {
      remainingPoints: updatedPoints.length,
      hasNonCompliant: updatedPoints.some(point => !isPointFullyCompliant(point)),
      canProceed: updatedPoints.length > 0 && 
        updatedPoints.every(point => point.name && point.location && point.targetTemp && point.selectedCategories && point.selectedCategories.length > 0) &&
        !updatedPoints.some(point => !isPointFullyCompliant(point))
    });
  };

  const handleEditPoint = (id) => {
    const point = conservationPoints.find(p => p.id === id);
    if (point) {
      setLocalFormData({
        name: point.name,
        location: point.location,
        targetTemp: point.targetTemp,
        selectedCategories: point.selectedCategories || [],
        isAbbattitore: point.isAbbattitore || false,
        isAmbiente: point.isAmbiente || false
      });
      setEditingPoint(id);
      setShowAddForm(true);
    }
  };

  // Funzione per verificare se un punto è HACCP compliant per TUTTE le categorie
  const isPointFullyCompliant = (point) => {
    if (!point.targetTemp || !point.selectedCategories || point.selectedCategories.length === 0) {
      return false;
    }
    
    const compliance = checkHACCPCompliance(point.targetTemp, point.selectedCategories);
    return compliance.compliant;
  };

  // Verifica se ci sono punti non HACCP compliant per TUTTE le categorie
  const hasNonCompliantPoints = conservationPoints.some(point => !isPointFullyCompliant(point));

  const canProceed = conservationPoints.length > 0 && 
    conservationPoints.every(point => point.name && point.location && point.targetTemp && point.selectedCategories && point.selectedCategories.length > 0) &&
    !hasNonCompliantPoints; // Non può procedere se ci sono punti non compliant

  // Forza il ricalcolo della validazione quando cambia lo stato dei punti
  useEffect(() => {
    // Questo useEffect assicura che la validazione venga ricalcolata quando cambia conservationPoints
    debugLog('🔄 ConservationStep - Punti aggiornati, ricalcolo validazione:', {
      pointsCount: conservationPoints.length,
      hasNonCompliant: hasNonCompliantPoints,
      canProceed: canProceed
    });
  }, [conservationPoints, hasNonCompliantPoints, canProceed]);

  // Rimuoviamo la funzione handleConfirmData - non più necessaria

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Punti di Conservazione</h3>
        <p className="text-gray-600">Configura frigoriferi e aree di stoccaggio</p>
      </div>

      {/* Lista Punti di Conservazione */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h4 className="font-medium text-gray-900">Punti di Conservazione</h4>
          <Button
            onClick={() => {
              debugLog('🔄 Pulsante Aggiungi cliccato');
              try {
                resetForm();
                setShowAddForm(true);
                debugLog('✅ Form resettato e showAddForm impostato a true');
              } catch (error) {
                errorLog('❌ Errore nel pulsante Aggiungi:', error);
              }
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap min-w-fit"
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Aggiungi Nuovo Punto di Conservazione</span>
            <span className="sm:hidden">Aggiungi Punto</span>
          </Button>
        </div>

        {/* Form Aggiungi Punto - Posizionato subito dopo il pulsante */}
        {showAddForm && (
          <div ref={formRef} id="conservation-step-form" className="border rounded-lg p-4 bg-white mb-6">
            <h4 className="font-medium text-gray-900 mb-4">
              {editingPoint ? 'Modifica Punto di Conservazione' : 'Aggiungi Nuovo Punto di Conservazione'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Punto di Conservazione *</Label>
                <Input
                  id="name"
                  value={localFormData.name}
                  onChange={(e) => {
                    setLocalFormData(prev => ({ ...prev, name: e.target.value }));
                    markStepAsUnconfirmed(currentStep);
                  }}
                  placeholder="Es. Frigo A, Freezer, Abbattitore"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Luogo *</Label>
                <select
                  id="location"
                  value={localFormData.location}
                  onChange={(e) => {
                    setLocalFormData(prev => ({ ...prev, location: e.target.value }));
                    markStepAsUnconfirmed(currentStep);
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleziona reparto</option>
                  {availableDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="targetTemp">Temperatura Punto di Conservazione (°C) *</Label>
                <Input
                  id="targetTemp"
                  type="number"
                  min="-30"
                  max="80"
                  step="0.1"
<<<<<<< Updated upstream
                  value={localFormData.targetTemp}
=======
                  value={localFormData.targetTemp || ''}
>>>>>>> Stashed changes
                  onChange={(e) => {
                    const newTemperature = e.target.value;
                    setLocalFormData(prev => ({ ...prev, targetTemp: newTemperature }));
                    
                    // Rimuovi l'evidenziazione quando l'utente inizia a digitare
                    if (temperatureFieldHighlighted) {
                      setTemperatureFieldHighlighted(false);
                    }
                    
                    // Refresh categorie quando cambia la temperatura per evitare conflitti
                    if (localFormData.selectedCategories && localFormData.selectedCategories.length > 0) {
                      setLocalFormData(prev => ({
                        ...prev,
                        targetTemp: newTemperature,
                        selectedCategories: [] // Azzera le categorie selezionate
                      }));
                    }
                    
                    markStepAsUnconfirmed(currentStep);
                  }}
                  placeholder="4"
                  className={`mt-1 transition-all duration-300 ${
                    temperatureFieldHighlighted ? 
                      'border-red-500 bg-red-50 ring-2 ring-red-200 focus:border-red-500 focus:ring-red-500' :
                      localFormData.targetTemp && localFormData.selectedCategories.length > 0 ? 
                        (() => {
                          const compliance = checkHACCPCompliance(localFormData.targetTemp, localFormData.selectedCategories);
                          return compliance.color === 'green' ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                                 compliance.color === 'yellow' ? 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500' :
                                 compliance.color === 'red' ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                                 'border-gray-300';
                        })() : 'border-gray-300'
                  }`}
                />
                <p className="text-sm text-gray-500 mt-1">
<<<<<<< Updated upstream
                  Inserisci la temperatura di conservazione (es. 4 per frigorifero, -18 per freezer, "ambiente" per temperatura ambiente)
                </p>
                
=======
                  Inserisci la temperatura di conservazione (es. 4 per frigorifero, -18 per freezer)
                </p>
                
                {/* Checkbox Ambiente */}
                <div className="mt-4 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAmbiente"
                    checked={localFormData.isAmbiente || false}
                    onChange={(e) => {
                      const isAmbiente = e.target.checked;
                      setLocalFormData(prev => ({
                        ...prev,
                        isAmbiente: isAmbiente,
                        targetTemp: isAmbiente ? '' : prev.targetTemp,
                        selectedCategories: isAmbiente ? ['dry_goods'] : prev.selectedCategories,
                        isAbbattitore: isAmbiente ? false : prev.isAbbattitore
                      }));
                      markStepAsUnconfirmed(currentStep);
                    }}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="isAmbiente" className="text-sm font-medium text-gray-700">
                    °T Ambiente
                  </Label>
                </div>
                
>>>>>>> Stashed changes
                {/* Checkbox Abbattitore - appare solo se temperatura è tra -1°C e -90°C */}
                {(() => {
                  const tempValue = parseFloat(localFormData.targetTemp);
                  const isInAbbattitoreRange = !isNaN(tempValue) && tempValue >= -90 && tempValue <= -1;
                  return isInAbbattitoreRange ? (
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isAbbattitore"
                        checked={localFormData.isAbbattitore}
                        onChange={(e) => setLocalFormData({...localFormData, isAbbattitore: e.target.checked})}
                        className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <Label htmlFor="isAbbattitore" className="text-lg font-bold text-red-700">
                        Abbattitore
                      </Label>
                    </div>
                  ) : null;
                })()}
              </div>
              
              <div className="md:col-span-2">
                <Label>Categorie Prodotti *</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {CONSERVATION_POINT_RULES.categories
                    .filter(category => {
<<<<<<< Updated upstream
=======
                      // Se ambiente è selezionato, mostra solo "Dispensa Secca"
                      if (localFormData.isAmbiente) {
                        return category.id === 'dry_goods' || category.name === 'Dispensa Secca';
                      }
>>>>>>> Stashed changes
                      // Nascondi le categorie abbattitore se la checkbox non è spuntata
                      if (category.id === 'abbattitore_menu' || category.id === 'abbattitore_esposizione') {
                        return localFormData.isAbbattitore === true;
                      }
                      return true;
                    })
                    .map(category => {
                    const isSelected = localFormData.selectedCategories.includes(category.id);
                    const compatibility = getCategoryCompatibility(category.id, localFormData.selectedCategories, localFormData.targetTemp);
                    
                    const getCompatibilityStyle = () => {
                      switch (compatibility) {
                        case 'selected':
                          return 'bg-blue-100 border-blue-400 text-blue-900 shadow-sm';
                        case 'compatible':
                          return 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300';
                        case 'tolerance':
                          return 'bg-yellow-200 border-yellow-400 text-yellow-900 shadow-sm';
                        case 'incompatible':
                          return 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60';
                        case 'neutral':
                          return 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300';
                        default:
                          return 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300';
                      }
                    };
                    
                    return (
                      <div
                        key={category.id}
                        onClick={() => {
                          // Non permettere il click se la categoria è incompatibile
                          if (compatibility === 'incompatible') return;
                          
                          // Se non c'è temperatura impostata, evidenzia il campo temperatura
                          if (!localFormData.targetTemp || localFormData.targetTemp.trim() === '') {
                            setTemperatureFieldHighlighted(true);
                            const temperatureField = document.getElementById('targetTemp');
                            if (temperatureField) {
                              temperatureField.focus();
                              temperatureField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            // Rimuovi l'evidenziazione dopo 3 secondi
                            setTimeout(() => setTemperatureFieldHighlighted(false), 3000);
                            return;
                          }
                          
                          const newCategories = isSelected 
                            ? localFormData.selectedCategories.filter(id => id !== category.id)
                            : [...localFormData.selectedCategories, category.id];
                          setLocalFormData(prev => ({ ...prev, selectedCategories: newCategories }));
                          markStepAsUnconfirmed(currentStep);
                        }}
                        className={`p-2 rounded-lg border-2 transition-all duration-200 ${getCompatibilityStyle()}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs truncate">{category.name}</h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{category.description}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {isSelected && <CheckCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />}
                            {compatibility === 'compatible' && !isSelected && <span className="text-xs">✅</span>}
                            {compatibility === 'incompatible' && !isSelected && <span className="text-xs">🚫</span>}
                            {compatibility === 'tolerance' && !isSelected && <span className="text-xs">⚠️</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Consigli di compatibilità */}
                {localFormData.targetTemp && localFormData.selectedCategories.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <strong>Consigli:</strong> {(() => {
                        const suggestion = getOptimalTemperatureSuggestions(localFormData.selectedCategories);
                        if (suggestion && !suggestion.compatible) {
                          return suggestion.message;
                        } else if (suggestion) {
                          return suggestion.message;
                        }
                        return 'Temperatura compatibile con le categorie selezionate';
                      })()}
                    </div>
                  </div>
                )}
                
                
                {localFormData.selectedCategories.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    ⚠️ Seleziona almeno una categoria per procedere
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingPoint(null);
                  setLocalFormData({
                    name: '',
                    location: '',
                    targetTemp: '',
                    selectedCategories: [],
<<<<<<< Updated upstream
                    isAbbattitore: false
=======
                    isAbbattitore: false,
                    isAmbiente: false
>>>>>>> Stashed changes
                  });
                }}
              >
                Annulla
              </Button>
              <Button
                onClick={handleAddPoint}
<<<<<<< Updated upstream
                disabled={!localFormData.name || !localFormData.location || !localFormData.targetTemp || localFormData.selectedCategories.length === 0}
=======
                disabled={!localFormData.name || !localFormData.location || (!localFormData.targetTemp && !localFormData.isAmbiente) || localFormData.selectedCategories.length === 0}
>>>>>>> Stashed changes
              >
                {editingPoint ? 'Salva Modifiche' : 'Aggiungi Punto'}
              </Button>
            </div>
          </div>
        )}

        {conservationPoints.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Thermometer className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nessun punto di conservazione configurato</p>
            <p className="text-sm">Clicca "Aggiungi Nuovo Punto di Conservazione" per iniziare</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conservationPoints.map(point => (
              <div key={point.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h5 className="font-medium">{point.name || 'Nome non disponibile'}</h5>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {point.location}
                      </span>
                    </div>
                    
                                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                       <div>
                         <span className="text-gray-600">Temperatura:</span>
                         <p className="font-medium">{point.targetTemp}°C</p>
                       </div>
                       <div>
                         <span className="text-gray-600">HACCP:</span>
                         <div className={`flex items-center gap-1 ${
                           point.compliance?.type === 'compliant' ? 'text-green-600' :
                           point.compliance?.type === 'warning' ? 'text-yellow-600' :
                           'text-red-600'
                         }`}>
                           {point.compliance?.type === 'compliant' ? '✅' : 
                            point.compliance?.type === 'warning' ? '⚠️' : '❌'}
                           <span className="text-xs">{typeof point.compliance === 'object' && point.compliance?.message ? point.compliance.message : 'Non validato'}</span>
                         </div>
                       </div>
                     </div>
                     
                     {/* Categorie prodotti */}
                     {point.selectedCategories && point.selectedCategories.length > 0 && (
                       <div className="mt-2">
                         <span className="text-gray-600 text-sm">Categorie:</span>
                         <div className="flex flex-wrap gap-1 mt-1">
                           {point.selectedCategories.map(categoryId => {
                             const category = CONSERVATION_POINT_RULES.categories.find(c => c.id === categoryId);
                             return category ? (
                               <span key={categoryId} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                 {category.name || 'Categoria non disponibile'}
                               </span>
                             ) : null;
                           })}
                         </div>
                       </div>
                     )}

                     {/* Suggerimenti */}
                     {(() => {
                       const suggestion = getTemperatureSuggestion(point);
                       return suggestion ? (
                         <div className="mt-2">
                           <span className="text-gray-600 text-sm">Suggerimenti:</span>
                           <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                             {suggestion}
                           </div>
                         </div>
                       ) : null;
                     })()}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditPoint(point.id)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeletePoint(point.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validazione */}
      <div className={`p-4 rounded-lg ${
        canProceed ? 'bg-green-50 border border-green-200' : hasNonCompliantPoints ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            canProceed ? 'bg-green-500' : hasNonCompliantPoints ? 'bg-red-500' : 'bg-yellow-500'
          } text-white text-sm font-bold`}>
            {conservationPoints.length}
          </div>
          <div>
            {canProceed && (
              <h3 className="text-lg font-bold text-green-900 mb-2">Configurazione Completata</h3>
            )}
            <p className={`font-medium ${
              canProceed ? 'text-green-900' : hasNonCompliantPoints ? 'text-red-900' : 'text-yellow-900'
            }`}>
              Punti configurati: {conservationPoints.length}
            </p>
            <p className={`text-sm ${
              canProceed ? 'text-green-800' : 'text-red-800'
            }`}>
              {canProceed 
                ? '✅ Tutti i punti di conservazione sono HACCP compliant! Puoi procedere al prossimo step.'
                : hasNonCompliantPoints
                  ? '❌ Non puoi procedere: alcuni punti di conservazione non rispettano i range di temperatura per TUTTE le categorie selezionate. Correggi le temperature o rimuovi le categorie incompatibili.'
                  : '⚠️ Devi configurare almeno un punto di conservazione con tutti i campi obbligatori.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Errori di validazione */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">
            <p className="font-medium">❌ Errori di validazione:</p>
            {Object.entries(validationErrors).map(([key, error]) => (
              <p key={key}>• {error}</p>
            ))}
          </div>
        </div>
      )}

      {/* Pulsante "Conferma Dati" rimosso - ora si usa solo "Avanti" */}
    </div>
  );
};

export default ConservationStep;
