import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Plus, X, Edit, Trash2 } from 'lucide-react';
import { useScrollToForm } from '../../hooks/useScrollToForm';

const StaffStep = ({ 
  formData, 
  setFormData, 
  currentStep, 
  setCurrentStep,
  validateStep,
  confirmStep,
  markStepAsUnconfirmed,
  isStepConfirmed,
  canConfirmStep
}) => {
  const [staffMembers, setStaffMembers] = useState(formData.staff?.staffMembers || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Hook per scroll automatico al form
  const { formRef, scrollToForm } = useScrollToForm(showAddForm, 'staff-add-form');

  // Effetto per scroll automatico quando il form si apre
  useEffect(() => {
    if (showAddForm) {
      scrollToForm();
    }
  }, [showAddForm, scrollToForm]);

  const [errors, setErrors] = useState({});
  const [localFormData, setLocalFormData] = useState({
    name: '',
    surname: '',
    role: '',
    categories: [''],
    haccpExpiry: ''
  });

  // Sincronizza i dati quando il componente si monta o cambia formData
  // Carica dati esistenti quando il componente si monta
  useEffect(() => {
    if (formData.staff?.staffMembers && formData.staff.staffMembers.length > 0) {
      setStaffMembers(formData.staff.staffMembers);
    }
  }, [formData.staff]);

  // Funzione per aggiornare i dati nel formData principale
  const updateFormData = (newStaffMembers) => {
    setFormData(prev => ({
      ...prev,
      staff: {
        ...prev.staff,
        staffMembers: newStaffMembers
      }
    }));
  };

  const ROLES = [
    'Amministratore',
    'Responsabile', 
    'Dipendente',
    'Collaboratore Occasionale / Part-time'
  ];

  const CATEGORIES = [
    'Cuochi',
    'Banconisti',
    'Camerieri',
    'Social & Media Manager',
    'Amministratore',
    'Altro'
  ];

  const resetForm = () => {
    setLocalFormData({
      name: '',
      surname: '',
      role: '',
      categories: [''],
      haccpExpiry: ''
    });
    setEditingMember(null);
  };


  // Controlla se mostrare il campo HACCP
  const shouldShowHaccpField = (selectedCategories) => {
    return selectedCategories.some(category => category !== 'Social & Media Manager' && category !== 'Altro');
  };

  // Funzioni per gestire categorie multiple
  const addCategoryField = () => {
    setLocalFormData(prev => ({
      ...prev,
      categories: [...prev.categories, '']
    }))
  }

  const removeCategoryField = (index) => {
    if (localFormData.categories.length > 1) {
      setLocalFormData(prev => ({
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index)
      }))
    }
  }

  const updateCategory = (index, value) => {
    setLocalFormData(prev => ({
      ...prev,
      categories: prev.categories.map((category, i) => i === index ? value : category)
    }))
  }

  const handleAddMember = () => {
    // Filtra categorie vuote e duplicati
    const validCategories = [...new Set(localFormData.categories.filter(category => category.trim()))];
    
    if (localFormData.name && localFormData.surname && localFormData.role && validCategories.length > 0) {
      const newMember = {
        id: Date.now(),
        name: localFormData.name,
        surname: localFormData.surname,
        role: localFormData.role,
        categories: validCategories,
        primaryCategory: validCategories[0], // Categoria principale (prima selezionata)
        fullName: `${localFormData.name} ${localFormData.surname}`,
        // Includi haccpExpiry sempre, ma solo se le categorie lo richiedono e il valore è presente
        haccpExpiry: shouldShowHaccpField(validCategories) && localFormData.haccpExpiry ? localFormData.haccpExpiry : ''
      };
      const updatedMembers = [...staffMembers, newMember];
      setStaffMembers(updatedMembers);
      
      // Aggiorna il formData globale
      setFormData(prev => ({
        ...prev,
        staff: {
          ...prev.staff,
          staffMembers: updatedMembers
        }
      }));
      
      // Marca lo step come non confermato se era già confermato
      if (isStepConfirmed(currentStep)) {
        markStepAsUnconfirmed(currentStep);
      }
      
      resetForm();
      setShowAddForm(false);
      setErrors({}); // Pulisci gli errori
    }
  };

  const handleEditMember = (member) => {
    setLocalFormData({
      name: member.name,
      surname: member.surname,
      role: member.role || '',
      categories: member.categories && member.categories.length > 0 ? member.categories : [member.category || ''],
      haccpExpiry: member.haccpExpiry
    });
    setEditingMember(member);
    setShowAddForm(true);
  };

  const handleUpdateMember = () => {
    // Filtra categorie vuote e duplicati
    const validCategories = [...new Set(localFormData.categories.filter(category => category.trim()))];
    
    if (localFormData.name && localFormData.surname && localFormData.role && validCategories.length > 0) {
      const updatedMembers = staffMembers.map(member => 
        member.id === editingMember.id 
          ? { 
              ...member, 
              name: localFormData.name,
              surname: localFormData.surname,
              role: localFormData.role,
              categories: validCategories,
              primaryCategory: validCategories[0], // Categoria principale (prima selezionata)
              fullName: `${localFormData.name} ${localFormData.surname}`,
              // Includi haccpExpiry sempre, ma solo se le categorie lo richiedono e il valore è presente
              haccpExpiry: shouldShowHaccpField(validCategories) && localFormData.haccpExpiry ? localFormData.haccpExpiry : ''
            }
          : member
      );
      setStaffMembers(updatedMembers);
      
      // Aggiorna il formData globale
      setFormData(prev => ({
        ...prev,
        staff: {
          ...prev.staff,
          staffMembers: updatedMembers
        }
      }));
      
      // Marca lo step come non confermato se era già confermato
      if (isStepConfirmed(currentStep)) {
        markStepAsUnconfirmed(currentStep);
      }
      
      resetForm();
      setShowAddForm(false);
      setErrors({}); // Pulisci gli errori
    }
  };

  const handleDeleteMember = (id) => {
    const updatedMembers = staffMembers.filter(member => member.id !== id);
    setStaffMembers(updatedMembers);
    
    // Aggiorna il formData globale
    setFormData(prev => ({
      ...prev,
      staff: {
        ...prev.staff,
        staffMembers: updatedMembers
      }
    }));
    
    // Marca lo step come non confermato se era già confermato
    if (isStepConfirmed(currentStep)) {
      markStepAsUnconfirmed(currentStep);
    }
    
    setErrors({}); // Pulisci gli errori
  };

  // Rimuoviamo la funzione handleConfirmData - non più necessaria

  // Controlla se lo step è valido per conferma
  const isStepValid = () => {
    // Verifica che ci sia almeno un membro dello staff
    if (staffMembers.length === 0) {
      return false;
    }
    
    // Verifica che ogni membro abbia i campi obbligatori (HACCP è FACOLTATIVO)
    return staffMembers.every(member => {
      const hasBasicFields = member.fullName && 
                            member.fullName.trim().length >= 3 &&
                            member.role &&
                            ((member.categories && member.categories.length > 0) || member.category);
      
      // Tutti i membri devono avere solo i campi base (HACCP facoltativo)
      return hasBasicFields;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Staff e Ruoli</h3>
        <p className="text-gray-600">Registra il personale e assegna responsabilità</p>
      </div>

      {/* Lista Staff */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Membri dello Staff</h4>
          <Button
            onClick={() => setShowAddForm(true)}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Aggiungi Staff
          </Button>
        </div>

        {staffMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nessun membro dello staff registrato</p>
            <p className="text-sm">Clicca "Aggiungi Staff" per iniziare</p>
          </div>
        ) : (
          <div className="space-y-3">
            {staffMembers.map((member, index) => (
              <div key={member.id} className="space-y-2">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{member.fullName || 'Nome non disponibile'}</p>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(member.categories && member.categories.length > 0 ? member.categories : [member.category || 'Non assegnato']).map((category, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                      {member.haccpExpiry && (
                        <div className="text-sm text-gray-600">
                          HACCP: {member.haccpExpiry}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditMember(member)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteMember(member.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Errori individuali per questo membro */}
                {(errors[`staff_${index}_name`] || errors[`staff_${index}_role`] || errors[`staff_${index}_category`]) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm text-red-800">
                      {errors[`staff_${index}_name`] && (
                        <p>• {errors[`staff_${index}_name`]}</p>
                      )}
                      {errors[`staff_${index}_role`] && (
                        <p>• {errors[`staff_${index}_role`]}</p>
                      )}
                      {errors[`staff_${index}_category`] && (
                        <p>• {errors[`staff_${index}_category`]}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Aggiungi/Modifica */}
      {showAddForm && (
        <div ref={formRef} id="staff-add-form" className="border rounded-lg p-4 bg-white">
          <h4 className="font-medium text-gray-900 mb-4">
            {editingMember ? 'Modifica Membro' : 'Aggiungi Nuovo Membro'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={localFormData.name}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="surname">Cognome *</Label>
              <Input
                id="surname"
                value={localFormData.surname}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, surname: e.target.value }))}
                placeholder="Cognome"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="role">Ruolo *</Label>
              <select
                id="role"
                value={localFormData.role}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, role: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleziona ruolo</option>
                {ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="categories">Categorie *</Label>
              <div className="space-y-2">
                {localFormData.categories.map((category, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select
                      value={category}
                      onChange={(e) => updateCategory(index, e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required={index === 0}
                    >
                      <option value="">Seleziona una categoria...</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {localFormData.categories.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeCategoryField(index)}
                        variant="outline"
                        size="sm"
                        className="h-10 w-10 p-0 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addCategoryField}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  + Aggiungi Categoria
                </Button>
              </div>
            </div>
            
            {shouldShowHaccpField(localFormData.categories) && (
              <div className="md:col-span-2">
                <Label htmlFor="haccpExpiry">Scadenza Attestato HACCP</Label>
                <Input
                  id="haccpExpiry"
                  type="date"
                  value={localFormData.haccpExpiry}
                  onChange={(e) => setLocalFormData(prev => ({ ...prev, haccpExpiry: e.target.value }))}
                  className="mt-1"
                />
              </div>
            )}
          </div>
          
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
              onClick={editingMember ? handleUpdateMember : handleAddMember}
              disabled={!localFormData.name || !localFormData.surname || !localFormData.role || localFormData.categories.every(category => !category.trim())}
            >
              {editingMember ? 'Aggiorna' : 'Aggiungi'}
            </Button>
          </div>
        </div>
      )}

      {/* Validazione e Stato Step */}
      <div className={`p-4 rounded-lg ${
        isStepConfirmed(currentStep) 
          ? 'bg-green-50 border border-green-200' 
          : isStepValid() 
          ? 'bg-blue-50 border border-blue-200'
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isStepConfirmed(currentStep) 
              ? 'bg-green-500' 
              : isStepValid() 
              ? 'bg-blue-500'
              : 'bg-yellow-500'
          } text-white text-sm font-bold`}>
            {staffMembers.length}
          </div>
          <div>
            {isStepConfirmed(currentStep) && (
              <h3 className="text-lg font-bold text-green-900 mb-2">Configurazione Completata</h3>
            )}
            <p className={`font-medium ${
              isStepConfirmed(currentStep) 
                ? 'text-green-900' 
                : isStepValid() 
                ? 'text-blue-900'
                : 'text-yellow-900'
            }`}>
              Membri registrati: {staffMembers.length}
            </p>
            <p className={`text-sm ${
              isStepConfirmed(currentStep) 
                ? 'text-green-800' 
                : isStepValid() 
                ? 'text-blue-800'
                : 'text-yellow-800'
            }`}>
              {isStepConfirmed(currentStep)
                ? '✅ Step confermato! Puoi procedere al prossimo step.'
                : isStepValid()
                ? '🔵 Dati validi! Clicca "Conferma Dati Staff" per confermare.'
                : '⚠️ Devi registrare almeno un membro con tutti i campi obbligatori.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Errori generali */}
      {errors.staff && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">
            <p className="font-medium">❌ Errore generale:</p>
            <p>• {errors.staff}</p>
          </div>
        </div>
      )}

      {/* Pulsante "Conferma Dati" rimosso - ora si usa solo "Avanti" */}
    </div>
  );
};

export default StaffStep;
