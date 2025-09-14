import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Thermometer, Droplets, Snowflake, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  MAINTENANCE_TASK_TYPES, 
  MAINTENANCE_TASK_NAMES,
  MAINTENANCE_FREQUENCIES,
  MAINTENANCE_ROLES,
  MAINTENANCE_CATEGORIES,
  validateMaintenanceConfig,
  getFrequenciesForTaskType,
  getTaskTypeDisplayName,
  getFrequencyDisplayName
} from '../utils/maintenanceConstants';
import { debugLog, maintenanceLog } from '../utils/debug';

const MaintenanceSection = ({ 
  conservationPointId,
  staffMembers = [],
  onMaintenanceChange,
  initialData = {},
  errors = {},
  isRequired = true
}) => {
  const [maintenanceData, setMaintenanceData] = useState({
    [MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING]: {
      frequency: '',
      assigned_role: '',
      assigned_category: '',
      assigned_staff_ids: []
    },
    [MAINTENANCE_TASK_TYPES.SANITIZATION]: {
      frequency: '',
      assigned_role: '',
      assigned_category: '',
      assigned_staff_ids: []
    },
    [MAINTENANCE_TASK_TYPES.DEFROSTING]: {
      frequency: '',
      assigned_role: '',
      assigned_category: '',
      assigned_staff_ids: []
    }
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Carica dati iniziali
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setMaintenanceData(initialData);
    }
  }, [initialData]);

  // Notifica cambiamenti al componente padre
  useEffect(() => {
    if (onMaintenanceChange && Object.keys(maintenanceData).length > 0) {
      // Solo se i dati sono effettivamente cambiati
      const hasValidData = Object.values(maintenanceData).some(taskData => 
        taskData.frequency || taskData.assigned_role || taskData.assigned_category
      );
      
      if (hasValidData) {
        onMaintenanceChange(maintenanceData);
      }
    }
  }, [maintenanceData, onMaintenanceChange]);

  // Aggiorna un campo specifico per un tipo di attività con reset automatico
  const updateMaintenanceField = (taskType, field, value) => {
    
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

  // Filtra i dipendenti in base a ruolo e categoria selezionati
  const getFilteredStaff = (taskType) => {
    const taskData = maintenanceData[taskType];
    const role = taskData?.assigned_role;
    const category = taskData?.assigned_category;

    // Se non sono selezionati ruolo e categoria, mostra tutti i dipendenti
    if (!role && !category) {
      return staffMembers;
    }

    // Usa la nuova funzione helper per filtrare
    const filtered = getAvailableStaff(staffMembers, role, category);
    

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
            <Label htmlFor={`${taskType}-frequency`} className="text-sm font-medium text-gray-700">
              Frequenza *
            </Label>
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

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-800">Manutenzione</h3>
        </div>
        <p className="text-sm text-blue-700">
          Configura le tre attività di manutenzione obbligatorie per questo punto di conservazione.
          Ogni attività deve avere frequenza, ruolo e categoria assegnati.
        </p>
      </div>

      {/* Rilevamento Temperatura */}
      {renderMaintenanceTask(MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING)}

      {/* Sanificazione */}
      {renderMaintenanceTask(MAINTENANCE_TASK_TYPES.SANITIZATION)}

      {/* Sbrinamento */}
      {renderMaintenanceTask(MAINTENANCE_TASK_TYPES.DEFROSTING)}

      {/* Validazione finale */}
      {isRequired && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Validazione Critica: Attività di Manutenzione
            </span>
          </div>
          <p className="text-sm text-yellow-700">
            Tutte e tre le attività di manutenzione (Rilevamento Temperatura, Sanificazione, Sbrinamento) 
            devono essere configurate per completare la creazione del punto di conservazione.
          </p>
        </div>
      )}
    </div>
  );
};

export default MaintenanceSection;
