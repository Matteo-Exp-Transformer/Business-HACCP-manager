import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Plus, X, Package, AlertTriangle } from 'lucide-react';

const InventoryStep = ({ 
  formData, 
  setFormData, 
  currentStep, 
  validateStep, 
  confirmStep, 
  markStepAsUnconfirmed, 
  isStepConfirmed, 
  canConfirmStep 
}) => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [localFormData, setLocalFormData] = useState({
    name: '',
    type: '',
    expiryDate: '',
    position: '',
    allergens: []
  });

  // Ottieni i punti di conservazione reali dall'onboarding
  const getConservationPoints = () => {
    if (formData.conservation?.points && formData.conservation.points.length > 0) {
      return formData.conservation.points;
    }
    // Fallback ai dati mock se non ci sono punti reali
    return [
      { id: 1, name: 'Frigo A', minTemp: 2, maxTemp: 4 },
      { id: 2, name: 'Freezer', minTemp: -18, maxTemp: -15 },
      { id: 3, name: 'Abbattitore', minTemp: 0, maxTemp: 3 }
    ];
  };

  // Carica dati esistenti quando il componente si monta
  useEffect(() => {
    if (formData.inventory?.products && formData.inventory.products.length > 0) {
      setProducts(formData.inventory.products);
    }
  }, [formData.inventory]);

  const PRODUCT_TYPES = [
    'Latticini e Formaggi',
    'Carni Fresche',
    'Pesce e Frutti di Mare',
    'Verdure e Ortaggi',
    'Frutta',
    'Prodotti da Forno',
    'Bevande',
    'Altro'
  ];

  const ALLERGENS = [
    { id: 'glutine', name: 'Glutine', icon: '🌾' },
    { id: 'latte', name: 'Latte', icon: '🥛' },
    { id: 'uova', name: 'Uova', icon: '🥚' },
    { id: 'pesce', name: 'Pesce', icon: '🐟' },
    { id: 'crostacei', name: 'Crostacei', icon: '🦐' },
    { id: 'frutta_secca', name: 'Frutta a guscio', icon: '🥜' },
    { id: 'arachidi', name: 'Arachidi', icon: '🥜' },
    { id: 'soia', name: 'Soia', icon: '🫘' },
    { id: 'sedano', name: 'Sedano', icon: '🥬' },
    { id: 'senape', name: 'Senape', icon: '🌶️' },
    { id: 'sesamo', name: 'Sesamo', icon: '⚪' },
    { id: 'solfiti', name: 'Solfiti', icon: '🧪' },
    { id: 'lupini', name: 'Lupini', icon: '🫘' },
    { id: 'molluschi', name: 'Molluschi', icon: '🦪' }
  ];

  const resetForm = () => {
    setLocalFormData({
      name: '',
      type: '',
      expiryDate: '',
      position: '',
      allergens: []
    });
    setEditingProduct(null);
  };

  const checkHACCPCompliance = (productType, positionId) => {
    const position = getConservationPoints().find(p => p.id === parseInt(positionId));
    if (!position) return { compliant: false, message: 'Posizione non valida' };
    
    // Regole HACCP semplificate per il test
    if (productType === 'Latticini e Formaggi' && (position.minTemp > 5 || position.maxTemp > 5)) {
      return { compliant: false, message: 'Temperatura troppo alta per latticini' };
    }
    if (productType === 'Carni Fresche' && (position.minTemp > 7 || position.maxTemp > 7)) {
      return { compliant: false, message: 'Temperatura troppo alta per carni fresche' };
    }
    if (productType === 'Pesce e Frutti di Mare' && (position.minTemp > 2 || position.maxTemp > 2)) {
      return { compliant: false, message: 'Temperatura troppo alta per pesce' };
    }
    
    return { compliant: true, message: 'Posizione conforme HACCP per questo tipo di prodotto' };
  };

  const handleAddProduct = () => {
    if (localFormData.name && localFormData.type && localFormData.expiryDate && localFormData.position) {
      const compliance = checkHACCPCompliance(localFormData.type, localFormData.position);
      
      const newProduct = {
        id: Date.now(),
        ...localFormData,
        compliance,
        needsConfirmation: true
      };
      
      setProducts(prev => [...prev, newProduct]);
      resetForm();
      setShowAddForm(false);
    }
  };

  const handleConfirmProduct = (id) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, needsConfirmation: false } : product
    ));
  };

  const handleDeleteProduct = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const toggleAllergen = (allergenId) => {
    setLocalFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergenId)
        ? prev.allergens.filter(id => id !== allergenId)
        : [...prev.allergens, allergenId]
    }));
  };

  const canProceed = products.length > 0 && 
    products.every(product => product.name && product.type && product.expiryDate && product.position);

  const handleConfirmData = () => {
    // 1. Prepara i dati AGGIORNATI localmente
    const updatedFormData = {
      ...formData,
      inventory: {
        products,
        count: products.length
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
        <h3 className="text-xl font-semibold mb-2">Inventario Prodotti</h3>
        <p className="text-gray-600">Gestisci prodotti e allergeni</p>
      </div>

      {/* Lista Prodotti */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Prodotti nell'Inventario</h4>
          <Button
            onClick={() => setShowAddForm(true)}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Aggiungi Prodotto
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nessun prodotto registrato</p>
            <p className="text-sm">Clicca "Aggiungi Prodotto" per iniziare</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(product => (
              <div key={product.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h5 className="font-medium">{product.name}</h5>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {product.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Scadenza:</span>
                        <p className="font-medium">{product.expiryDate}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Posizione:</span>
                        <p className="font-medium">{product.position}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Allergeni:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.allergens.map(allergenId => {
                            const allergen = ALLERGENS.find(a => a.id === allergenId);
                            return allergen ? (
                              <span key={allergenId} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                {allergen.icon} {allergen.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">HACCP:</span>
                        <div className={`flex items-center gap-1 ${
                          product.compliance.compliant ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.compliance.compliant ? '✅' : '⚠️'}
                          <span className="text-xs">{product.compliance.message}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {product.needsConfirmation ? (
                      <Button
                        onClick={() => handleConfirmProduct(product.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Conferma
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleDeleteProduct(product.id)}
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

      {/* Form Aggiungi Prodotto */}
      {showAddForm && (
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-medium text-gray-900 mb-4">Aggiungi Nuovo Prodotto</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Prodotto *</Label>
              <Input
                id="name"
                value={localFormData.name}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Es. Acqua nat 0,5"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Tipologia *</Label>
              <select
                id="type"
                value={localFormData.type}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, type: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleziona tipologia</option>
                {PRODUCT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="expiryDate">Data di Scadenza *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={localFormData.expiryDate}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="position">Posizione *</Label>
              <select
                id="position"
                value={localFormData.position}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, position: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleziona posizione</option>
                                 {getConservationPoints().map(point => (
                   <option key={point.id} value={point.id}>
                     {point.name} ({point.minTemp}°C - {point.maxTemp}°C)
                   </option>
                 ))}
              </select>
            </div>
          </div>
          
                     {/* Allergeni */}
           <div className="mt-4">
             <Label>Allergeni</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {ALLERGENS.map(allergen => (
                <label key={allergen.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFormData.allergens.includes(allergen.id)}
                    onChange={() => toggleAllergen(allergen.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">
                    {allergen.icon} {allergen.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Validazione HACCP in tempo reale */}
          {localFormData.type && localFormData.position && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Validazione HACCP:</span>
              </div>
              {(() => {
                const compliance = checkHACCPCompliance(localFormData.type, localFormData.position);
                return (
                  <div className={`mt-2 flex items-center gap-2 ${
                    compliance.compliant ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {compliance.compliant ? '✅' : '⚠️'}
                    <span className="text-sm">{compliance.message}</span>
                  </div>
                );
              })()}
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
               onClick={handleAddProduct}
               disabled={!localFormData.name || !localFormData.type || !localFormData.expiryDate || !localFormData.position}
             >
               Aggiungi Prodotto
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
            {products.length}
          </div>
          <div>
            <p className={`font-medium ${
              canProceed ? 'text-green-900' : 'text-yellow-900'
            }`}>
              Prodotti registrati: {products.length}
            </p>
            <p className={`text-sm ${
              canProceed ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {canProceed 
                ? '✅ Tutti i prodotti hanno i campi obbligatori compilati!'
                : '⚠️ Devi registrare almeno un prodotto con tutti i campi obbligatori.'
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

       {/* Pulsante Conferma Finale */}
       <div className="flex justify-end">
         <Button
           onClick={handleConfirmData}
           disabled={!canProceed}
           className={`${canProceed ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
         >
           Conferma Dati Inventario
         </Button>
       </div>
    </div>
  );
};

export default InventoryStep;
