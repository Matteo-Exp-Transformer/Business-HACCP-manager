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
    { id: 'cucina', name: 'Cucina', enabled: true, isCustom: false, required: false },
    { id: 'bancone', name: 'Bancone', enabled: true, isCustom: false, required: false },
    { id: 'sala', name: 'Sala', enabled: true, isCustom: false, required: false },
    { id: 'magazzino', name: 'Magazzino', enabled: true, isCustom: false, required: false }
  ]);

  // Carica dati esistenti solo al primo mount
  useEffect(() => {
    if (formData.departments?.list && formData.departments.list.length > 0) {
      // Carica i reparti esistenti senza forzare lo stato enabled
      const existingDepartments = formData.departments.list;
      const defaultDepartments = [
        { id: 'cucina', name: 'Cucina', enabled: true, isCustom: false, required: false },
        { id: 'bancone', name: 'Bancone', enabled: true, isCustom: false, required: false },
        { id: 'sala', name: 'Sala', enabled: true, isCustom: false, required: false },
        { id: 'magazzino', name: 'Magazzino', enabled: true, isCustom: false, required: false }
      ];
      
      // Mantieni i reparti predefiniti con il loro stato esistente
      const updatedDepartments = defaultDepartments.map(defaultDept => {
        const existing = existingDepartments.find(d => d.id === defaultDept.id);
        return existing ? { ...existing, required: false } : defaultDept;
      });
      
      // Aggiungi i reparti custom esistenti
      const customDepartments = existingDepartments.filter(d => d.isCustom);
      setDepartments([...updatedDepartments, ...customDepartments]);
    }
  }, []); // Solo al mount, non quando formData.departments cambia

  const handleToggleDepartment = (id) => {
    setDepartments(prev => prev.map(dept => {
      if (dept.id === id) {
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
      };
      setDepartments(prev => [...prev, newDept]);
      setCustomDepartment('');
    }
  };

  // Funzione rimossa - non più necessaria

  const handleRemoveCustomDepartment = (id) => {
    setDepartments(prev => prev.filter(dept => dept.id !== id));
  };

  const enabledCount = departments.filter(dept => dept.enabled).length;
  const canProceed = enabledCount > 0; // Deve avere almeno 1 reparto attivo

  // Sincronizza lo stato locale con formData quando cambia
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      departments: {
        list: departments,
        enabledCount: enabledCount
      }
    }));
  }, [departments, enabledCount, setFormData]);

  // Rimuoviamo la funzione handleConfirmData - non più necessaria

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
          {departments.filter(dept => !dept.isCustom && dept && dept.id && dept.name && typeof dept.name === 'string').map(dept => (
            <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">{dept.name || 'Nome non disponibile'}</span>
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
          {departments.filter(dept => dept.isCustom && dept && dept.id && dept.name && typeof dept.name === 'string').map(dept => (
            <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <span className="font-medium">{dept.name || 'Nome non disponibile'}</span>
              
              <div className="flex items-center gap-2">
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
            {canProceed && (
              <h3 className="text-lg font-bold text-green-900 mb-2">Configurazione Completata</h3>
            )}
            <p className={`font-medium ${
              canProceed ? 'text-green-900' : 'text-yellow-900'
            }`}>
              Reparti attivi: {enabledCount}
            </p>
            <p className={`text-sm ${
              canProceed ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {canProceed 
                ? '✅ Requisito soddisfatto! Puoi procedere.'
                : '⚠️ Devi attivare almeno 1 reparto per continuare.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Pulsante "Conferma Dati" rimosso - ora si usa solo "Avanti" */}
    </div>
  );
};

export default DepartmentsStep;
