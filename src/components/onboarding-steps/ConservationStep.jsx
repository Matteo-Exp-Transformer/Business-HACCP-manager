import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Plus, X, Thermometer, AlertTriangle, Edit } from 'lucide-react';
import { CONSERVATION_POINT_RULES } from '../../utils/haccpRules';

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
  const [validationErrors, setValidationErrors] = useState({});
  const [localFormData, setLocalFormData] = useState({
    name: '',
    location: '',
    targetTemp: '', // Sostituiamo minTemp e maxTemp con targetTemp
    selectedCategories: []
  });

  // Usa i dati reali da formData
  const departments = formData.departments?.list || [];
  const staffMembers = formData.staff?.staffMembers || [];
  
  // Se non ci sono dipartimenti, usa i mock per il test
  const availableDepartments = departments.length > 0 ? departments.map(dept => dept.name || dept) : ['Cucina', 'Bancone', 'Sala', 'Magazzino'];

  // Carica dati esistenti quando il componente si monta
  useEffect(() => {
    if (formData.conservation?.points && formData.conservation.points.length > 0) {
      setConservationPoints(formData.conservation.points);
    }
  }, [formData.conservation]);

  // Aggiorna automaticamente il formData quando i punti di conservazione cambiano
  useEffect(() => {
    const updatedFormData = {
      ...formData,
      conservation: {
        points: conservationPoints,
        count: conservationPoints.length
      }
    };
    setFormData(updatedFormData);
  }, [conservationPoints]);

  const resetForm = () => {
    setLocalFormData({
      name: '',
      location: '',
      targetTemp: '',
      selectedCategories: []
    });
    setEditingPoint(null);
  };

  const checkHACCPCompliance = (targetTemp, selectedCategories = []) => {
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
      
      let isInRange = false;
      let isInToleranceRange = false;
      let categoryInfo = null;
      
      for (const categoryId of selectedCategories) {
        const category = CONSERVATION_POINT_RULES.categories.find(c => c.id === categoryId);
        if (category) {
          categoryInfo = category;
          // Controlla se è nel range HACCP
          if (temp >= category.minTemp && temp <= category.maxTemp) {
            isInRange = true;
            break;
          }
          // Controlla se è nel range di tolleranza estesa (±1.5°C)
          const categoryMin = category.minTemp - tolerance;
          const categoryMax = category.maxTemp + tolerance;
          if (temp >= categoryMin && temp <= categoryMax) {
            isInToleranceRange = true;
            break;
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
          message: '⚠️ Range di tolleranza estesa (±1.5°C)', 
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

  // Funzione per determinare la compatibilità delle categorie
  const getCategoryCompatibility = (categoryId, selectedCategories, targetTemp) => {
    if (selectedCategories.length === 0) return 'neutral';
    
    const temp = parseFloat(targetTemp);
    if (isNaN(temp)) return 'neutral';
    
    const category = CONSERVATION_POINT_RULES.categories.find(c => c.id === categoryId);
    if (!category) return 'neutral';
    
    // Controlla se la categoria è già selezionata
    if (selectedCategories.includes(categoryId)) return 'selected';
    
    // Controlla compatibilità con le categorie già selezionate
    const tolerance = CONSERVATION_POINT_RULES.tolerance;
    
    // Calcola il range di tolleranza per la categoria corrente
    const categoryMin = category.minTemp - tolerance;
    const categoryMax = category.maxTemp + tolerance;
    
    // Controlla se la temperatura target è nel range di questa categoria
    if (temp >= category.minTemp && temp <= category.maxTemp) {
      // Temperatura nel range HACCP - controlla se è compatibile con le altre categorie
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
      // Temperatura nel range di tolleranza - controlla se è compatibile con le altre categorie
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

  const handleAddPoint = () => {
    if (localFormData.name && localFormData.location && localFormData.targetTemp && localFormData.selectedCategories.length > 0) {
      const compliance = checkHACCPCompliance(localFormData.targetTemp, localFormData.selectedCategories);
      
      const pointData = {
        ...localFormData,
        compliance
      };
      
      if (editingPoint) {
        // Modifica punto esistente
        setConservationPoints(prev => prev.map(point => 
          point.id === editingPoint ? { ...point, ...pointData } : point
        ));
      } else {
        // Aggiungi nuovo punto
        const newPoint = {
          id: Date.now(),
          ...pointData
        };
        setConservationPoints(prev => [...prev, newPoint]);
      }
      
      resetForm();
      setShowAddForm(false);
    }
  };


  const handleDeletePoint = (id) => {
    setConservationPoints(prev => prev.filter(point => point.id !== id));
  };

  const handleEditPoint = (id) => {
    const point = conservationPoints.find(p => p.id === id);
    if (point) {
      setLocalFormData({
        name: point.name,
        location: point.location,
        targetTemp: point.targetTemp,
        selectedCategories: point.selectedCategories || []
      });
      setEditingPoint(id);
      setShowAddForm(true);
    }
  };

  const canProceed = conservationPoints.length > 0 && 
    conservationPoints.every(point => point.name && point.location && point.targetTemp && point.selectedCategories && point.selectedCategories.length > 0);

  // Verifica se ci sono punti non HACCP compliant
  const hasNonCompliantPoints = conservationPoints.some(point => 
    point.compliance && point.compliance.type !== 'compliant'
  );

  // Rimuoviamo la funzione handleConfirmData - non più necessaria

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Punti di Conservazione</h3>
        <p className="text-gray-600">Configura frigoriferi e aree di stoccaggio</p>
      </div>

      {/* Lista Punti di Conservazione */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Punti di Conservazione</h4>
          <Button
            onClick={() => {
              console.log('🔄 Pulsante Aggiungi cliccato');
              try {
                resetForm();
                setShowAddForm(true);
                console.log('✅ Form resettato e showAddForm impostato a true');
              } catch (error) {
                console.error('❌ Errore nel pulsante Aggiungi:', error);
              }
            }}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Aggiungi Nuovo Punto di Conservazione
          </Button>
        </div>

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
                      <h5 className="font-medium">{point.name}</h5>
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
                           point.compliance.type === 'compliant' ? 'text-green-600' :
                           point.compliance.type === 'warning' ? 'text-yellow-600' :
                           'text-red-600'
                         }`}>
                           {point.compliance.type === 'compliant' ? '✅' : 
                            point.compliance.type === 'warning' ? '⚠️' : '❌'}
                           <span className="text-xs">{point.compliance.message}</span>
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
                                 {category.name}
                               </span>
                             ) : null;
                           })}
                         </div>
                       </div>
                     )}
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

      {/* Form Aggiungi Punto */}
      {showAddForm && (
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-medium text-gray-900 mb-4">
            {editingPoint ? 'Modifica Punto di Conservazione' : 'Aggiungi Nuovo Punto di Conservazione'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Punto di Conservazione *</Label>
              <Input
                id="name"
                value={localFormData.name}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Es. Frigo A, Freezer, Abbattitore"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="location">Luogo *</Label>
              <select
                id="location"
                value={localFormData.location}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, location: e.target.value }))}
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
                value={localFormData.targetTemp}
                onChange={(e) => {
                  console.log('🌡️ Temperatura cambiata:', e.target.value);
                  setLocalFormData(prev => ({ ...prev, targetTemp: e.target.value }));
                }}
                placeholder="4"
                className={`mt-1 ${
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
              {localFormData.targetTemp && localFormData.selectedCategories.length > 0 && (
                <div className="mt-1">
                  {(() => {
                    const compliance = checkHACCPCompliance(localFormData.targetTemp, localFormData.selectedCategories);
                    return (
                      <p className={`text-xs ${
                        compliance.color === 'green' ? 'text-green-600' :
                        compliance.color === 'yellow' ? 'text-yellow-600' :
                        compliance.color === 'red' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {compliance.message}
                      </p>
                    );
                  })()}
                </div>
              )}
            </div>

             <div className="md:col-span-2">
               <Label htmlFor="categories">Categorie Prodotti Conservati *</Label>
               <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                 {CONSERVATION_POINT_RULES.categories.map(category => {
                   const compatibility = getCategoryCompatibility(category.id, localFormData.selectedCategories, localFormData.targetTemp);
                   console.log(`🎨 Category ${category.name}: compatibility=${compatibility}, selected=${localFormData.selectedCategories}, temp=${localFormData.targetTemp}`);
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
                       default:
                         return 'bg-gray-100 border-gray-300 text-gray-700';
                     }
                   };
                   
                   return (
                     <label key={category.id} className={`flex items-center gap-2 cursor-pointer p-2 rounded border ${getCompatibilityStyle()}`}>
                       <input
                         type="checkbox"
                         checked={localFormData.selectedCategories.includes(category.id)}
                         onChange={(e) => {
                           console.log('📦 Categoria cambiata:', category.id, 'checked:', e.target.checked);
                           if (e.target.checked) {
                             setLocalFormData(prev => {
                               const newCategories = [...prev.selectedCategories, category.id];
                               console.log('✅ Categorie aggiornate:', newCategories);
                               return {
                                 ...prev,
                                 selectedCategories: newCategories
                               };
                             });
                           } else {
                             setLocalFormData(prev => {
                               const newCategories = prev.selectedCategories.filter(id => id !== category.id);
                               console.log('❌ Categorie aggiornate:', newCategories);
                               return {
                                 ...prev,
                                 selectedCategories: newCategories
                               };
                             });
                           }
                         }}
                         className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                       />
                       <span className="text-sm font-medium">
                         {category.name}
                       </span>
                       {compatibility === 'compatible' && <span className="text-xs">✅</span>}
                       {compatibility === 'incompatible' && <span className="text-xs">❌</span>}
                       {compatibility === 'tolerance' && <span className="text-xs">⚠️</span>}
                     </label>
                   );
                 })}
               </div>
               <p className="text-xs text-gray-500 mt-1">
                 Seleziona le categorie di prodotti che verranno conservate in questo punto
               </p>
               <div className="mt-2 p-3 bg-gray-50 rounded text-xs border">
                 <p className="font-medium mb-2">Legenda compatibilità:</p>
                 <div className="flex flex-wrap gap-3">
                   <span className="flex items-center gap-2">
                     <span className="w-4 h-4 bg-green-200 border-2 border-green-400 rounded shadow-sm"></span>
                     <span className="font-medium text-green-900">Verde: Compatibile con temperatura</span>
                   </span>
                   <span className="flex items-center gap-2">
                     <span className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded shadow-sm"></span>
                     <span className="font-medium text-yellow-900">Giallo: Tolleranza estesa</span>
                   </span>
                   <span className="flex items-center gap-2">
                     <span className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded shadow-sm"></span>
                     <span className="font-medium text-red-900">Rosso: Incompatibile</span>
                   </span>
                 </div>
               </div>
               {localFormData.selectedCategories.length === 0 && (
                 <p className="text-xs text-red-500 mt-1">
                   ⚠️ Seleziona almeno una categoria per procedere
                 </p>
               )}
             </div>
           </div>
          
                     {/* Validazione HACCP in tempo reale */}
           {localFormData.targetTemp && localFormData.selectedCategories.length > 0 && (
             <div className="mt-4 p-3 rounded-lg bg-gray-50">
               <div className="flex items-center gap-2">
                 <Thermometer className="h-4 w-4" />
                 <span className="font-medium">Validazione HACCP:</span>
               </div>
               {(() => {
                 const compliance = checkHACCPCompliance(localFormData.targetTemp, localFormData.selectedCategories);
                 return (
                   <div className={`mt-2 flex items-center gap-2 ${
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
               {localFormData.selectedCategories.length > 0 && (
                 <div className="mt-3 p-2 rounded-lg bg-blue-50 border border-blue-200">
                   <div className="text-sm text-blue-800">
                     <strong>Suggerimento:</strong> {(() => {
                       const suggestion = CONSERVATION_POINT_RULES.getOptimalTemperatureSuggestions(localFormData.selectedCategories);
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
          
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
            >
              Annulla
            </Button>
                         <Button
               onClick={handleAddPoint}
               disabled={!localFormData.name || !localFormData.location || !localFormData.targetTemp || localFormData.selectedCategories.length === 0}
             >
               {editingPoint ? 'Salva Modifiche' : 'Aggiungi Punto'}
             </Button>
          </div>
        </div>
      )}

      {/* Validazione */}
      <div className={`p-4 rounded-lg ${
        canProceed && !hasNonCompliantPoints ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            canProceed && !hasNonCompliantPoints ? 'bg-green-500' : 'bg-yellow-500'
          } text-white text-sm font-bold`}>
            {conservationPoints.length}
          </div>
          <div>
            <p className={`font-medium ${
              canProceed && !hasNonCompliantPoints ? 'text-green-900' : 'text-yellow-900'
            }`}>
              Punti configurati: {conservationPoints.length}
            </p>
            <p className={`text-sm ${
              canProceed && !hasNonCompliantPoints ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {canProceed 
                ? (hasNonCompliantPoints 
                    ? '⚠️ Alcuni punti di conservazione non sono in linea con le norme HACCP. Controlla le temperature e le categorie selezionate.'
                    : '✅ Tutti i punti hanno i campi obbligatori compilati!')
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
