import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Plus, X, Check } from 'lucide-react';

const DepartmentsStep = ({ 
  formData, 
  setFormData, 
  currentStep, 
  validateStep, 
  confirmStep, 
  markStepAsUnconfirmed, 
  isStepConfirmed, 
  canConfirmStep 
}) => {
  const [customDepartment, setCustomDepartment] = useState('');
  const [departments, setDepartments] = useState([
    { id: 'cucina', name: 'Cucina', enabled: true, isCustom: false, required: true },
    { id: 'bancone', name: 'Bancone', enabled: true, isCustom: false, required: true },
    { id: 'sala', name: 'Sala', enabled: true, isCustom: false, required: true },
    { id: 'magazzino', name: 'Magazzino', enabled: true, isCustom: false, required: true }
  ]);

  // Carica dati esistenti quando il componente si monta
  useEffect(() => {
    if (formData.departments?.list && formData.departments.list.length > 0) {
      // Assicurati che i reparti predefiniti siano sempre presenti e attivi
      const existingDepartments = formData.departments.list;
      const defaultDepartments = [
        { id: 'cucina', name: 'Cucina', enabled: true, isCustom: false, required: true },
        { id: 'bancone', name: 'Bancone', enabled: true, isCustom: false, required: true },
        { id: 'sala', name: 'Sala', enabled: true, isCustom: false, required: true },
        { id: 'magazzino', name: 'Magazzino', enabled: true, isCustom: false, required: true }
      ];
      
      // Mantieni i reparti predefiniti sempre attivi
      const updatedDepartments = defaultDepartments.map(defaultDept => {
        const existing = existingDepartments.find(d => d.id === defaultDept.id);
        return existing ? { ...existing, enabled: true, required: true } : defaultDept;
      });
      
      // Aggiungi i reparti custom esistenti
      const customDepartments = existingDepartments.filter(d => d.isCustom);
      setDepartments([...updatedDepartments, ...customDepartments]);
    }
  }, [formData.departments]);

  const handleToggleDepartment = (id) => {
    setDepartments(prev => prev.map(dept => {
      if (dept.id === id) {
        // Non permettere di disabilitare i reparti richiesti
        if (dept.required && !dept.enabled) {
          return dept; // Mantieni disabilitato se è richiesto
        }
        return { ...dept, enabled: !dept.enabled };
      }
      return dept;
    }));
  };

  const handleAddCustomDepartment = () => {
    if (customDepartment.trim()) {
      const newDept = {
        id: `custom-${Date.now()}`,
        name: customDepartment.trim(),
        enabled: true,
        isCustom: true,
        needsConfirmation: true
      };
      setDepartments(prev => [...prev, newDept]);
      setCustomDepartment('');
    }
  };

  const handleConfirmCustomDepartment = (id) => {
    setDepartments(prev => prev.map(dept => 
      dept.id === id ? { ...dept, needsConfirmation: false } : dept
    ));
  };

  const handleRemoveCustomDepartment = (id) => {
    setDepartments(prev => prev.filter(dept => dept.id !== id));
  };

  const enabledCount = departments.filter(dept => dept.enabled).length;
  const canProceed = enabledCount === 4; // Deve essere esattamente 4

  // Debug per capire cosa sta succedendo
  useEffect(() => {
    console.log('🔍 DepartmentsStep - Stato reparti:', {
      total: departments.length,
      enabled: enabledCount,
      canProceed,
      departments: departments.map(d => ({ name: d.name, enabled: d.enabled }))
    });
  }, [departments, enabledCount, canProceed]);

  const handleConfirmData = () => {
    // 1. Prepara i dati AGGIORNATI localmente
    const enabledDepartments = departments.filter(dept => dept.enabled);
    const enabledCount = enabledDepartments.length;
    const updatedFormData = { 
      ...formData, 
      departments: { 
        list: enabledDepartments, 
        enabledCount 
      } 
    };

    // 2. VALIDA usando i dati AGGIORNATI (updatedFormData), non quelli vecchi!
    const errors = validateStep(currentStep, updatedFormData);

    if (Object.keys(errors).length === 0) {
      // 3. Solo se la validazione passa, SALVA i dati aggiornati nello stato globale
      setFormData(updatedFormData);
      // 4. Segna lo step come confermato
      confirmStep(currentStep);
    } else {
      // Mostra errori di validazione
      console.error('Errori di validazione:', errors);
      alert('Ci sono errori di validazione. Controlla i dati inseriti.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Reparti</h3>
        <p className="text-gray-600">Organizza la struttura operativa della tua attività</p>
      </div>

      {/* Reparti preimpostati */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Reparti Standard</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {departments.filter(dept => !dept.isCustom).map(dept => (
            <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">{dept.name}</span>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dept.enabled}
                  onChange={() => handleToggleDepartment(dept.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {dept.enabled ? 'Attivo' : 'Inattivo'}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Aggiungi reparto custom */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Aggiungi Reparto Personalizzato</h4>
        <div className="flex gap-2">
          <Input
            value={customDepartment}
            onChange={(e) => setCustomDepartment(e.target.value)}
            placeholder="Nome del nuovo reparto"
            className="flex-1"
          />
          <Button
            onClick={handleAddCustomDepartment}
            disabled={!customDepartment.trim()}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Aggiungi
          </Button>
        </div>
      </div>

      {/* Reparti custom */}
      {departments.filter(dept => dept.isCustom).length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Reparti Personalizzati</h4>
          {departments.filter(dept => dept.isCustom).map(dept => (
            <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="font-medium">{dept.name}</span>
                {dept.needsConfirmation && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    In attesa di conferma
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {dept.needsConfirmation ? (
                  <Button
                    onClick={() => handleConfirmCustomDepartment(dept.id)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Conferma
                  </Button>
                ) : (
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dept.enabled}
                      onChange={() => handleToggleDepartment(dept.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {dept.enabled ? 'Attivo' : 'Inattivo'}
                    </span>
                  </label>
                )}
                
                <Button
                  onClick={() => handleRemoveCustomDepartment(dept.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
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
            {enabledCount}
          </div>
          <div>
            <p className={`font-medium ${
              canProceed ? 'text-green-900' : 'text-yellow-900'
            }`}>
              Reparti attivi: {enabledCount}/4
            </p>
            <p className={`text-sm ${
              canProceed ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {canProceed 
                ? '✅ Requisito soddisfatto! Puoi procedere.'
                : '⚠️ Devi attivare esattamente 4 reparti per continuare.'
              }
            </p>
            {!canProceed && enabledCount > 4 && (
              <p className="text-sm text-red-600 mt-1">
                ❌ Hai troppi reparti attivi. Disabilita alcuni reparti per avere esattamente 4.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pulsante Conferma */}
      <div className="flex justify-end">
        <Button
          onClick={handleConfirmData}
          disabled={!canProceed}
          className={`${canProceed ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Conferma Dati Reparti
        </Button>
      </div>
    </div>
  );
};

export default DepartmentsStep;
