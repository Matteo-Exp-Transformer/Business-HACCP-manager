import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Thermometer, Droplets, Snowflake, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { 
  MAINTENANCE_TASK_TYPES, 
  MAINTENANCE_TASK_NAMES,
  MAINTENANCE_FREQUENCIES,
  MAINTENANCE_ROLES,
  MAINTENANCE_CATEGORIES,
  validateMaintenanceConfig,
  getFrequenciesForTaskType,
  getTaskTypeDisplayName
} from '../utils/maintenanceConstants';

const MaintenanceForm = ({ 
  conservationPoint,
  staffMembers = [],
  onSave,
  onCancel,
  isOpen = false
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form quando si apre
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 MaintenanceForm opened with data:', {
        conservationPoint,
        staffMembers: staffMembers.length,
        staffMembersData: staffMembers
      });
      
      setMaintenanceData({
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
      setValidationErrors({});
    }
  }, [isOpen, conservationPoint, staffMembers]);

  // Aggiorna un campo specifico per un tipo di attività
  const updateMaintenanceField = (taskType, field, value) => {
    setMaintenanceData(prev => ({
      ...prev,
      [taskType]: {
        ...prev[taskType],
        [field]: value
      }
    }));
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

  // Filtra i dipendenti in base a ruolo e categoria selezionati
  const getFilteredStaff = (taskType) => {
    const taskData = maintenanceData[taskType];
    const role = taskData.assigned_role;
    const category = taskData.assigned_category;

    console.log('🔍 getFilteredStaff Debug:', {
      taskType,
      role,
      category,
      staffMembers: staffMembers.length,
      staffMembersData: staffMembers
    });

    if (!role || !category) {
      console.log('⚠️ Ruolo o categoria mancanti:', { role, category });
      return [];
    }

    const filtered = staffMembers.filter(member => {
      const roleMatch = member.role === role;
      const categoryMatch = member.categories && member.categories.includes(category);
      
      console.log(`🔍 Member ${member.name} ${member.surname}:`, {
        memberRole: member.role,
        memberCategories: member.categories,
        roleMatch,
        categoryMatch
      });
      
      return roleMatch && categoryMatch;
    });

    console.log('✅ Filtered staff:', filtered);
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
    const filteredStaff = getFilteredStaff(taskType);
    const frequencies = getFrequenciesForTaskType(taskType);

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
              {MAINTENANCE_ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor={`${taskType}-category`} className="text-sm font-medium text-gray-700">
              Categoria *
            </Label>
            <select
              id={`${taskType}-category`}
              value={taskData.assigned_category}
              onChange={(e) => updateMaintenanceField(taskType, 'assigned_category', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleziona categoria</option>
              {MAINTENANCE_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dipendenti Specifici (Opzionale) */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Dipendenti Specifici (Opzionale)
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
                    : 'Seleziona prima ruolo e categoria per vedere i dipendenti disponibili'
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
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
              Ogni attività deve avere frequenza, ruolo e categoria assegnati.
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
};

export default MaintenanceForm;
