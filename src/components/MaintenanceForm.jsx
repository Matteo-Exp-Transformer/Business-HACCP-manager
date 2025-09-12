import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Thermometer, Droplets, Snowflake, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { 
  MAINTENANCE_TASK_TYPES, 
  MAINTENANCE_TASK_NAMES,
  MAINTENANCE_FREQUENCIES,
  WEEKDAYS,
  validateMaintenanceConfig,
  getFrequenciesForTaskType,
  getTaskTypeDisplayName
} from '../utils/maintenanceConstants';

// Funzioni helper per filtri progressivi
const getAvailableRoles = (staffMembers) => {
  if (!staffMembers || staffMembers.length === 0) return [];
  
  const roles = [...new Set(staffMembers.map(member => member.role).filter(Boolean))];
  return roles.map(role => ({ 
    value: role.toLowerCase().replace(/\s+/g, '_'), 
    label: role 
  }));
};

const getAvailableCategories = (staffMembers, selectedRole = null) => {
  if (!staffMembers || staffMembers.length === 0) return [];
  
  let filteredMembers = staffMembers;
  
  // Se è selezionato un ruolo, filtra solo i membri con quel ruolo
  if (selectedRole) {
    const normalizedSelectedRole = selectedRole.toLowerCase().replace(/\s+/g, '_');
    filteredMembers = staffMembers.filter(member => {
      const memberRole = member.role?.toLowerCase().replace(/\s+/g, '_');
      return memberRole === normalizedSelectedRole;
    });
  }
  
  const categories = [...new Set(filteredMembers.flatMap(member => member.categories || []).filter(Boolean))];
  return categories.map(cat => ({ 
    value: cat.toLowerCase().replace(/\s+/g, '_'), 
    label: cat 
  }));
};

const getAvailableStaff = (staffMembers, selectedRole = null, selectedCategory = null) => {
  if (!staffMembers || staffMembers.length === 0) return [];
  
  let filteredMembers = staffMembers;
  
  // Filtra per ruolo se selezionato
  if (selectedRole) {
    const normalizedSelectedRole = selectedRole.toLowerCase().replace(/\s+/g, '_');
    filteredMembers = filteredMembers.filter(member => {
      const memberRole = member.role?.toLowerCase().replace(/\s+/g, '_');
      return memberRole === normalizedSelectedRole;
    });
  }
  
  // Filtra per categoria se selezionata
  if (selectedCategory) {
    const normalizedSelectedCategory = selectedCategory.toLowerCase().replace(/\s+/g, '_');
    filteredMembers = filteredMembers.filter(member => {
      return member.categories && member.categories.some(cat => {
        const memberCat = cat?.toLowerCase().replace(/\s+/g, '_');
        return memberCat === normalizedSelectedCategory;
      });
    });
  }
  
  return filteredMembers;
};

const MaintenanceForm = React.forwardRef(({ 
  conservationPoint,
  staffMembers = [],
  onSave,
  onCancel,
  isOpen = false,
  existingData = null
}, ref) => {
  const [maintenanceData, setMaintenanceData] = useState({
    [MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING]: {
      frequency: '',
      selected_days: [],
      assigned_role: '',
      assigned_category: '',
      assigned_staff_ids: []
    },
    [MAINTENANCE_TASK_TYPES.SANITIZATION]: {
      frequency: '',
      selected_days: [],
      assigned_role: '',
      assigned_category: '',
      assigned_staff_ids: []
    },
    [MAINTENANCE_TASK_TYPES.DEFROSTING]: {
      frequency: '',
      selected_days: [],
      assigned_role: '',
      assigned_category: '',
      assigned_staff_ids: []
    }
  });

  // Stato per controllare se usare giorni personalizzati per ogni attività
  const [useCustomDays, setUseCustomDays] = useState({
    [MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING]: false,
    [MAINTENANCE_TASK_TYPES.SANITIZATION]: false,
    [MAINTENANCE_TASK_TYPES.DEFROSTING]: false
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log per debug
  console.log('🔍 MaintenanceForm - Available data:', {
    staffMembers: staffMembers.length
  });

  // Reset form quando si apre
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 MaintenanceForm opened with data:', {
        conservationPoint,
        staffMembers: staffMembers.length,
        staffMembersData: staffMembers,
        existingData
      });
      
      if (existingData) {
        // Carica dati esistenti per modifica
        console.log('📝 Caricamento dati esistenti per modifica');
        setMaintenanceData(existingData);
        
        // Imposta useCustomDays basato sui dati esistenti
        setUseCustomDays({
          [MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING]: existingData[MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING]?.frequency === 'custom_days',
          [MAINTENANCE_TASK_TYPES.SANITIZATION]: existingData[MAINTENANCE_TASK_TYPES.SANITIZATION]?.frequency === 'custom_days',
          [MAINTENANCE_TASK_TYPES.DEFROSTING]: false // Sbrinamento non supporta giorni personalizzati
        });
      } else {
        // Reset per nuovo punto di conservazione
        console.log('🆕 Reset per nuovo punto di conservazione');
        setMaintenanceData({
          [MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING]: {
            frequency: '',
            selected_days: [],
            assigned_role: '',
            assigned_category: '',
            assigned_staff_ids: []
          },
          [MAINTENANCE_TASK_TYPES.SANITIZATION]: {
            frequency: '',
            selected_days: [],
            assigned_role: '',
            assigned_category: '',
            assigned_staff_ids: []
          },
          [MAINTENANCE_TASK_TYPES.DEFROSTING]: {
            frequency: '',
            selected_days: [],
            assigned_role: '',
            assigned_category: '',
            assigned_staff_ids: []
          }
        });

        setUseCustomDays({
          [MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING]: false,
          [MAINTENANCE_TASK_TYPES.SANITIZATION]: false,
          [MAINTENANCE_TASK_TYPES.DEFROSTING]: false
        });
      }
      
      setValidationErrors({});
    }
  }, [isOpen, conservationPoint, staffMembers, existingData]);

  // Aggiorna un campo specifico per un tipo di attività con reset automatico
  const updateMaintenanceField = (taskType, field, value) => {
    console.log(`🔄 updateMaintenanceField: ${taskType}.${field} = ${value}`);
    
    setMaintenanceData(prev => {
      const currentTask = prev[taskType];
      const newTask = { ...currentTask, [field]: value };
      
      // Reset automatico basato sul campo modificato
      if (field === 'frequency') {
        // Se cambia la frequenza, reset giorni selezionati
        newTask.selected_days = [];
      } else if (field === 'assigned_role') {
        // Se cambia il ruolo, reset categoria e dipendenti
        newTask.assigned_category = '';
        newTask.assigned_staff_ids = [];
      } else if (field === 'assigned_category') {
        // Se cambia la categoria, reset dipendenti
        newTask.assigned_staff_ids = [];
      }
      
      return {
        ...prev,
        [taskType]: newTask
      };
    });
  };

  // Gestisce la selezione/deselezione di dipendenti specifici
  const toggleStaffMember = (taskType, staffId) => {
    setMaintenanceData(prev => {
      const currentStaff = prev[taskType].assigned_staff_ids || [];
      const newStaff = currentStaff.includes(staffId)
        ? currentStaff.filter(id => id !== staffId)
        : [...currentStaff, staffId];
      
      return {
        ...prev,
        [taskType]: {
          ...prev[taskType],
          assigned_staff_ids: newStaff
        }
      };
    });
  };

  // Gestisce il toggle per usare giorni personalizzati
  const toggleCustomDays = (taskType) => {
    setUseCustomDays(prev => ({
      ...prev,
      [taskType]: !prev[taskType]
    }));

    // Reset frequenza e giorni quando si cambia modalità
    setMaintenanceData(prev => ({
      ...prev,
      [taskType]: {
        ...prev[taskType],
        frequency: '',
        selected_days: []
      }
    }));
  };

  // Gestisce la selezione/deselezione dei giorni della settimana
  const toggleDay = (taskType, dayValue) => {
    setMaintenanceData(prev => {
      const currentDays = prev[taskType].selected_days || [];
      const isSelected = currentDays.includes(dayValue);
      const newDays = isSelected 
        ? currentDays.filter(day => day !== dayValue)
        : [...currentDays, dayValue];
      
      return {
        ...prev,
        [taskType]: {
          ...prev[taskType],
          selected_days: newDays,
          // Imposta frequency a 'custom_days' quando si selezionano giorni
          frequency: newDays.length > 0 ? 'custom_days' : ''
        }
      };
    });
  };

  // Filtra i dipendenti in base a ruolo e categoria selezionati
  const getFilteredStaff = (taskType) => {
    const taskData = maintenanceData[taskType];
    const role = taskData.assigned_role;
    const category = taskData.assigned_category;

    // Se non sono selezionati ruolo e categoria, mostra tutti i dipendenti
    if (!role && !category) {
      console.log('🔍 getFilteredStaff Debug: Mostrando tutti i dipendenti');
      return staffMembers;
    }

    // Usa la nuova funzione helper per filtrare
    const filtered = getAvailableStaff(staffMembers, role, category);
    
    console.log('🔍 getFilteredStaff Debug:', {
      taskType,
      role,
      category,
      filteredCount: filtered.length,
      filtered: filtered.map(m => `${m.name} ${m.surname}`)
    });

    return filtered;
  };

  // Valida la configurazione di manutenzione
  const validateMaintenance = () => {
    const errors = {};
    
    Object.values(MAINTENANCE_TASK_TYPES).forEach(taskType => {
      const taskData = maintenanceData[taskType];
      const validation = validateMaintenanceConfig(taskType, taskData);
      
      if (!validation.isValid) {
        errors[taskType] = validation.errors;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestisce il salvataggio
  const handleSave = async () => {
    if (!validateMaintenance()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Crea le attività di manutenzione per il punto di conservazione
      const maintenanceTasks = Object.values(MAINTENANCE_TASK_TYPES).map(taskType => {
        const taskData = maintenanceData[taskType];
        return {
          id: `${conservationPoint.id}_${taskType}_${Date.now()}`,
          conservation_point_id: conservationPoint.id,
          conservation_point_name: conservationPoint.name,
          task_type: taskType,
          task_name: getTaskTypeDisplayName(taskType),
          frequency: taskData.frequency,
          selected_days: taskData.selected_days || [],
          assigned_role: taskData.assigned_role,
          assigned_category: taskData.assigned_category,
          assigned_staff_ids: taskData.assigned_staff_ids || [],
          is_active: true,
          created_at: new Date().toISOString()
        };
      });

      await onSave(maintenanceTasks);
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Icone per ogni tipo di attività
  const getTaskIcon = (taskType) => {
    switch (taskType) {
      case MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING:
        return <Thermometer className="w-5 h-5 text-blue-500" />;
      case MAINTENANCE_TASK_TYPES.SANITIZATION:
        return <Droplets className="w-5 h-5 text-green-500" />;
      case MAINTENANCE_TASK_TYPES.DEFROSTING:
        return <Snowflake className="w-5 h-5 text-cyan-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  // Renderizza una singola attività di manutenzione
  const renderMaintenanceTask = (taskType) => {
    const taskData = maintenanceData[taskType];
    const taskErrors = validationErrors[taskType] || [];
    const frequencies = getFrequenciesForTaskType(taskType);
    
    // Filtri progressivi
    const availableRoles = getAvailableRoles(staffMembers);
    const availableCategories = getAvailableCategories(staffMembers, taskData.assigned_role);
    const filteredStaff = getFilteredStaff(taskType);

    return (
      <div key={taskType} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          {getTaskIcon(taskType)}
          <h4 className="text-lg font-semibold text-gray-800">
            {getTaskTypeDisplayName(taskType)}
          </h4>
          {taskErrors.length === 0 && taskData.frequency && taskData.assigned_role && taskData.assigned_category && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>

        {taskErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700 font-medium">Configurazione incompleta</span>
            </div>
            <ul className="mt-2 text-sm text-red-600">
              {taskErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Frequenza */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor={`${taskType}-frequency`} className="text-sm font-medium text-gray-700">
                Frequenza *
              </Label>
              {/* Checkbox per giorni personalizzati - solo per Sanificazione e Rilevamento Temperatura */}
              {(taskType === MAINTENANCE_TASK_TYPES.SANITIZATION || taskType === MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING) && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    id={`${taskType}-custom-days`}
                    checked={useCustomDays[taskType]}
                    onChange={() => toggleCustomDays(taskType)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`${taskType}-custom-days`} className="cursor-pointer">
                    Seleziona giorni della settimana
                  </label>
                </div>
              )}
            </div>
            
            {useCustomDays[taskType] ? (
              // Mostra checkbox per giorni della settimana se modalità personalizzata abilitata
              <div className="mt-1 border border-gray-300 rounded-md p-3 bg-gray-50">
                <div className="text-sm text-gray-600 mb-2">Seleziona i giorni:</div>
                <div className="grid grid-cols-2 gap-2">
                  {WEEKDAYS.map(day => (
                    <label key={day.value} className="flex items-center space-x-2 text-base">
                      <input
                        type="checkbox"
                        checked={taskData.selected_days?.includes(day.value) || false}
                        onChange={() => toggleDay(taskType, day.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 font-medium">{day.label}</span>
                    </label>
                  ))}
                </div>
                {taskData.selected_days && taskData.selected_days.length > 0 && (
                  <div className="mt-2 text-xs text-blue-600">
                    Giorni selezionati: {taskData.selected_days.length}
                  </div>
                )}
              </div>
            ) : (
              // Mostra dropdown standard se modalità personalizzata disabilitata
              <select
                id={`${taskType}-frequency`}
                value={taskData.frequency}
                onChange={(e) => updateMaintenanceField(taskType, 'frequency', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleziona frequenza</option>
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ruolo */}
          <div>
            <Label htmlFor={`${taskType}-role`} className="text-sm font-medium text-gray-700">
              Ruolo *
            </Label>
            <select
              id={`${taskType}-role`}
              value={taskData.assigned_role}
              onChange={(e) => updateMaintenanceField(taskType, 'assigned_role', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleziona ruolo</option>
              {availableRoles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor={`${taskType}-category`} className="text-sm font-medium text-gray-700">
              Categoria (Opzionale)
            </Label>
            <select
              id={`${taskType}-category`}
              value={taskData.assigned_category}
              onChange={(e) => updateMaintenanceField(taskType, 'assigned_category', e.target.value)}
              disabled={!taskData.assigned_role}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                !taskData.assigned_role ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">{taskData.assigned_role ? 'Seleziona categoria' : 'Prima seleziona ruolo'}</option>
              {availableCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dipendenti Specifici (Opzionale) */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Dipendenti Specifici *
            </Label>
            {filteredStaff.length > 0 ? (
              <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                {filteredStaff.map(member => (
                  <label key={member.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={taskData.assigned_staff_ids?.includes(member.id) || false}
                      onChange={() => toggleStaffMember(taskType, member.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {member.name} {member.surname}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-500">
                  {taskData.assigned_role && taskData.assigned_category 
                    ? 'Nessun dipendente trovato per la combinazione ruolo/categoria selezionata'
                    : 'Seleziona ruolo e categoria per filtrare i dipendenti, oppure seleziona direttamente i dipendenti'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={ref} id="tasks-maintenance-form" className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configura Manutenzione</h1>
          <p className="text-2xl text-gray-700">
            Punto di Conservazione: <span className="font-bold text-blue-600">{conservationPoint?.name}</span>
          </p>
        </div>
        
        <div className="absolute top-4 right-4">
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Rilevamento Temperatura */}
          {renderMaintenanceTask(MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING)}

          {/* Sanificazione */}
          {renderMaintenanceTask(MAINTENANCE_TASK_TYPES.SANITIZATION)}

          {/* Sbrinamento */}
          {renderMaintenanceTask(MAINTENANCE_TASK_TYPES.DEFROSTING)}

          {/* Messaggio informativo spostato in basso */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Manutenzione Obbligatoria</h3>
            </div>
            <p className="text-sm text-blue-700">
              Configura le tre attività di manutenzione obbligatorie per questo punto di conservazione.
              Ogni attività deve avere <strong>frequenza</strong> e <strong>almeno uno tra Ruolo o Dipendenti Specifici</strong> assegnati.
              <br />
              <span className="text-xs text-blue-600 mt-1 block">
                💡 Per Sanificazione e Rilevamento Temperatura puoi selezionare giorni specifici della settimana.
              </span>
            </p>
          </div>
        </div>

        {/* Pulsanti di Azione */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 mt-6">
          <Button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            {isSubmitting ? 'Salvataggio...' : 'Salva Manutenzione'}
          </Button>
          <Button 
            onClick={onCancel}
            variant="outline" 
            className="flex-1 py-3"
            disabled={isSubmitting}
          >
            Annulla
          </Button>
        </div>
      </div>
    </div>
  );
});

MaintenanceForm.displayName = 'MaintenanceForm';

export default MaintenanceForm;
