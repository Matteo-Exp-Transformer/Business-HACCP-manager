import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Plus, X, Thermometer, AlertTriangle } from 'lucide-react';
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
    minTemp: '',
    maxTemp: '',
    assignedRole: '',
    assignedTo: '',
    selectedCategories: []
  });

  // Dati mock per il test (in produzione verranno da formData.departments e formData.staff)
  const mockDepartments = ['Cucina', 'Bancone', 'Sala', 'Magazzino'];
  const mockStaff = [
    { id: 1, name: 'Mario Rossi', role: 'Responsabile', category: 'Cuochi' },
    { id: 2, name: 'Giulia Bianchi', role: 'Dipendente', category: 'Banconisti' }
  ];

  // Carica dati esistenti quando il componente si monta
  useEffect(() => {
    if (formData.conservation?.points && formData.conservation.points.length > 0) {
      setConservationPoints(formData.conservation.points);
    }
  }, [formData.conservation]);

  const resetForm = () => {
    setLocalFormData({
      name: '',
      location: '',
      minTemp: '',
      maxTemp: '',
      assignedRole: '',
      assignedTo: '',
      selectedCategories: []
    });
    setEditingPoint(null);
  };

  const checkHACCPCompliance = (minTemp, maxTemp, selectedCategories = []) => {
    const min = parseFloat(minTemp);
    const max = parseFloat(maxTemp);
    
    if (isNaN(min) || isNaN(max)) return { compliant: false, message: 'Temperature non valide' };
    
    // Controllo base: temperatura minima non può essere superiore alla massima
    if (min >= max) return { compliant: false, message: 'Temperatura minima deve essere inferiore alla massima', type: 'error' };
    
    // Se sono state selezionate categorie, usa le regole HACCP
    if (selectedCategories.length > 0) {
      const result = CONSERVATION_POINT_RULES.validateTemperatureCompatibility(min, max, selectedCategories);
      
      // Determina il tipo di compliance
      if (result.compatible) {
        return { compliant: true, message: 'Dati a norma HACCP', type: 'compliant' };
      } else {
        // Controlla se siamo nel range di tolleranza (±2°C)
        const tolerance = CONSERVATION_POINT_RULES.tolerance;
        let inToleranceRange = false;
        
        for (const categoryId of selectedCategories) {
          const category = CONSERVATION_POINT_RULES.categories.find(c => c.id === categoryId);
          if (category) {
            const categoryMin = category.minTemp - tolerance;
            const categoryMax = category.maxTemp + tolerance;
            if (min >= categoryMin && max <= categoryMax) {
              inToleranceRange = true;
              break;
            }
          }
        }
        
        if (inToleranceRange) {
          return { compliant: false, message: 'Range di tolleranza HACCP (±2°C)', type: 'warning' };
        } else {
          return { compliant: false, message: result.message, type: 'error' };
        }
      }
    }
    
    // Validazione generica se non ci sono categorie selezionate
    if (min < -30 || max > 80) return { compliant: false, message: 'Range temperatura fuori limiti operativi', type: 'error' };
    
    return { compliant: true, message: 'Range temperatura valido', type: 'compliant' };
  };

  const handleAddPoint = () => {
    if (localFormData.name && localFormData.location && localFormData.minTemp && localFormData.maxTemp && localFormData.assignedRole && localFormData.selectedCategories.length > 0) {
      const compliance = checkHACCPCompliance(localFormData.minTemp, localFormData.maxTemp, localFormData.selectedCategories);
      
      const newPoint = {
        id: Date.now(),
        ...localFormData,
        compliance,
        needsConfirmation: true
      };
      
      setConservationPoints(prev => [...prev, newPoint]);
      resetForm();
      setShowAddForm(false);
    }
  };

  const handleConfirmPoint = (id) => {
    setConservationPoints(prev => prev.map(point => 
      point.id === id ? { ...point, needsConfirmation: false } : point
    ));
  };

  const handleDeletePoint = (id) => {
    setConservationPoints(prev => prev.filter(point => point.id !== id));
  };

  const canProceed = conservationPoints.length > 0 && 
    conservationPoints.every(point => point.name && point.location && point.minTemp && point.maxTemp && point.assignedRole && point.selectedCategories && point.selectedCategories.length > 0);

  const handleConfirmData = () => {
    // 1. Prepara i dati AGGIORNATI localmente
    const updatedFormData = {
      ...formData,
      conservation: {
        points: conservationPoints,
        count: conservationPoints.length
      }
    };

    // 2. VALIDA usando i dati AGGIORNATI (updatedFormData), non quelli vecchi!
    const errors = validateStep(currentStep, updatedFormData);

    if (Object.keys(errors).length === 0) {
      // 3. Solo se la validazione passa, SALVA i dati aggiornati nello stato globale
      setFormData(updatedFormData);
      // 4. Segna lo step come confermato
      confirmStep(currentStep);
      setValidationErrors({}); // Pulisci errori
    } else {
      // Mostra errori di validazione
      setValidationErrors(errors);
    }
  };

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
            onClick={() => setShowAddForm(true)}
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
                         <p className="font-medium">{point.minTemp}°C - {point.maxTemp}°C</p>
                       </div>
                       <div>
                         <span className="text-gray-600">Categoria:</span>
                         <p className="font-medium">{point.assignedRole}</p>
                       </div>
                       {point.assignedTo && (
                         <div>
                           <span className="text-gray-600">Dipendente:</span>
                           <p className="font-medium">{point.assignedTo}</p>
                         </div>
                       )}
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
                    {point.needsConfirmation ? (
                      <Button
                        onClick={() => handleConfirmPoint(point.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Conferma
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleDeletePoint(point.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
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
          <h4 className="font-medium text-gray-900 mb-4">Aggiungi Nuovo Punto di Conservazione</h4>
          
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
                {mockDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="minTemp">Temperatura Minima (°C) *</Label>
              <Input
                id="minTemp"
                type="number"
                min="-30"
                max="80"
                step="0.1"
                value={localFormData.minTemp}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, minTemp: e.target.value }))}
                placeholder="-18"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="maxTemp">Temperatura Massima (°C) *</Label>
              <Input
                id="maxTemp"
                type="number"
                min="-30"
                max="80"
                step="0.1"
                value={localFormData.maxTemp}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, maxTemp: e.target.value }))}
                placeholder="4"
                className="mt-1"
              />
            </div>
            
            {/* Validazione range temperature */}
            {localFormData.minTemp && localFormData.maxTemp && parseFloat(localFormData.minTemp) >= parseFloat(localFormData.maxTemp) && (
              <div className="md:col-span-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-800">
                  ❌ La temperatura minima non può essere superiore o uguale alla massima
                </p>
              </div>
            )}
            
                         <div>
               <Label htmlFor="assignedRole">Assegna rilevamento temperature a: *</Label>
               <select
                 id="assignedRole"
                 value={localFormData.assignedRole}
                 onChange={(e) => setLocalFormData(prev => ({ ...prev, assignedRole: e.target.value }))}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
               >
                 <option value="">Seleziona categoria</option>
                 <option value="Cuochi">Cuochi</option>
                 <option value="Banconisti">Banconisti</option>
                 <option value="Camerieri">Camerieri</option>
                 <option value="Responsabile">Responsabile</option>
                 <option value="Dipendente">Dipendente</option>
               </select>
               {!localFormData.assignedRole && (
                 <p className="text-xs text-red-500 mt-1">
                   ⚠️ Seleziona una categoria per procedere
                 </p>
               )}
             </div>
            
            {localFormData.assignedRole && (
              <div>
                <Label htmlFor="assignedTo">Dipendente Specifico</Label>
                <select
                  id="assignedTo"
                  value={localFormData.assignedTo}
                  onChange={(e) => setLocalFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Generico (solo categoria)</option>
                  {mockStaff.filter(staff => staff.category === localFormData.assignedRole).map(staff => (
                    <option key={staff.id} value={staff.name}>{staff.name} ({staff.role})</option>
                  ))}
                </select>
              </div>
            )}

             <div className="md:col-span-2">
               <Label htmlFor="categories">Categorie Prodotti Conservati *</Label>
               <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                 {CONSERVATION_POINT_RULES.categories.map(category => (
                   <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                     <input
                       type="checkbox"
                       checked={localFormData.selectedCategories.includes(category.id)}
                       onChange={(e) => {
                         if (e.target.checked) {
                           setLocalFormData(prev => ({
                             ...prev,
                             selectedCategories: [...prev.selectedCategories, category.id]
                           }));
                         } else {
                           setLocalFormData(prev => ({
                             ...prev,
                             selectedCategories: prev.selectedCategories.filter(id => id !== category.id)
                           }));
                         }
                       }}
                       className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                     />
                     <span className="text-sm">
                       {category.name}
                     </span>
                   </label>
                 ))}
               </div>
               <p className="text-xs text-gray-500 mt-1">
                 Seleziona le categorie di prodotti che verranno conservate in questo punto
               </p>
               {localFormData.selectedCategories.length === 0 && (
                 <p className="text-xs text-red-500 mt-1">
                   ⚠️ Seleziona almeno una categoria per procedere
                 </p>
               )}
             </div>
           </div>
          
                     {/* Validazione HACCP in tempo reale */}
           {localFormData.minTemp && localFormData.maxTemp && (
             <div className="mt-4 p-3 rounded-lg bg-gray-50">
               <div className="flex items-center gap-2">
                 <Thermometer className="h-4 w-4" />
                 <span className="font-medium">Validazione HACCP:</span>
               </div>
               {(() => {
                 const compliance = checkHACCPCompliance(localFormData.minTemp, localFormData.maxTemp, localFormData.selectedCategories);
                 return (
                   <div className={`mt-2 flex items-center gap-2 ${
                     compliance.type === 'compliant' ? 'text-green-600' :
                     compliance.type === 'warning' ? 'text-yellow-600' :
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
               disabled={!localFormData.name || !localFormData.location || !localFormData.minTemp || !localFormData.maxTemp || !localFormData.assignedRole || localFormData.selectedCategories.length === 0}
             >
               Aggiungi Punto
             </Button>
          </div>
        </div>
      )}

      {/* Validazione */}
      <div className={`p-4 rounded-lg ${
        canProceed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            canProceed ? 'bg-green-500' : 'bg-yellow-500'
          } text-white text-sm font-bold`}>
            {conservationPoints.length}
          </div>
          <div>
            <p className={`font-medium ${
              canProceed ? 'text-green-900' : 'text-yellow-900'
            }`}>
              Punti configurati: {conservationPoints.length}
            </p>
            <p className={`text-sm ${
              canProceed ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {canProceed 
                ? '✅ Tutti i punti hanno i campi obbligatori compilati!'
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

       {/* Pulsante Conferma */}
       <div className="flex justify-end">
         <Button
           onClick={handleConfirmData}
           disabled={!canProceed || isStepConfirmed(currentStep)}
           className={`${
             isStepConfirmed(currentStep) 
               ? 'bg-green-500 hover:bg-green-600 cursor-not-allowed' 
               : canProceed 
                 ? 'bg-green-600 hover:bg-green-700'
                 : 'bg-gray-300 cursor-not-allowed'
           }`}
         >
           {isStepConfirmed(currentStep) ? (
             <>
               ✅ Dati Confermati
             </>
           ) : (
             'Conferma Dati Conservazione'
           )}
         </Button>
       </div>
    </div>
  );
};

export default ConservationStep;
