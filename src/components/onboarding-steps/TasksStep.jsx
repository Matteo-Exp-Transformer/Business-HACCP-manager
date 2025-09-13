import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Plus, X, ClipboardList, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import MaintenanceForm from '../MaintenanceForm';
import { supabaseService } from '../../services/supabaseService';
import { MAINTENANCE_TASK_TYPES } from '../../utils/maintenanceConstants';
import { useScrollToForm } from '../../hooks/useScrollToForm';
import { debugLog, maintenanceLog } from '../../utils/debug';

const TasksStep = ({ 
  formData, 
  setFormData, 
  currentStep, 
  validateStep, 
  confirmStep, 
  markStepAsUnconfirmed, 
  isStepConfirmed, 
  canConfirmStep 
}) => {
  const [tasks, setTasks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState('generic'); // 'generic' o 'maintenance'
  const [editingTask, setEditingTask] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [localFormData, setLocalFormData] = useState({
    name: '',
    assignedRole: '',
    assignedEmployee: '',
    frequency: ''
  });
  
  // Stati per il form di manutenzione
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [selectedConservationPoint, setSelectedConservationPoint] = useState(null);
  const [existingMaintenanceData, setExistingMaintenanceData] = useState(null);
  
  // Stati per le manutenzioni salvate
  const [savedMaintenances, setSavedMaintenances] = useState([]);
  const [loadingMaintenances, setLoadingMaintenances] = useState(false);

  // Hook per scroll automatico ai form
  const { formRef: genericFormRef, scrollToForm: scrollToGenericForm } = useScrollToForm(showAddForm, 'tasks-generic-form');
  const { formRef: maintenanceFormRef, scrollToForm: scrollToMaintenanceForm } = useScrollToForm(showMaintenanceForm, 'tasks-maintenance-form');

  // Effetti per scroll automatico quando i form si aprono
  useEffect(() => {
    if (showAddForm) {
      scrollToGenericForm();
    }
  }, [showAddForm, scrollToGenericForm]);

  useEffect(() => {
    if (showMaintenanceForm) {
      scrollToMaintenanceForm();
    }
  }, [showMaintenanceForm, scrollToMaintenanceForm]);

  // Carica dati esistenti quando il componente si monta
  useEffect(() => {
    debugLog('🔄 TasksStep: Caricamento dati...');
    debugLog('📋 formData.tasks:', formData.tasks);
    
    // Controlla sia la struttura standard che quella di precompilazione
    const tasksList = formData.tasks?.list || formData.tasks?.tasksList || [];
    
    if (tasksList.length > 0) {
      debugLog('✅ Caricando tasks:', tasksList);
      setTasks(tasksList);
    } else {
      debugLog('⚠️ Nessun task trovato in formData.tasks');
    }
  }, [formData.tasks]);

  // Carica le manutenzioni salvate
  const loadSavedMaintenances = async () => {
    setLoadingMaintenances(true);
    try {
      const result = await supabaseService.getMaintenanceTasks();
      if (result.success) {
        // Raggruppa per punto di conservazione
        const groupedMaintenances = result.data.reduce((acc, maintenance) => {
          const pointId = maintenance.conservation_point_id;
          if (!acc[pointId]) {
            acc[pointId] = {
              conservation_point_id: pointId,
              conservation_point_name: maintenance.conservation_point_name,
              tasks: []
            };
          }
          acc[pointId].tasks.push(maintenance);
          return acc;
        }, {});
        
        const groupedMaintenancesArray = Object.values(groupedMaintenances);
        setSavedMaintenances(groupedMaintenancesArray);
        
        // Salva le manutenzioni in formData per la validazione
        setFormData(prev => ({
          ...prev,
          savedMaintenances: groupedMaintenancesArray
        }));
        
        maintenanceLog('✅ Manutenzioni caricate:', groupedMaintenancesArray);
      }
    } catch (error) {
      errorLog('❌ Errore nel caricamento manutenzioni:', error);
    } finally {
      setLoadingMaintenances(false);
    }
  };

  // Carica manutenzioni quando il componente si monta
  useEffect(() => {
    loadSavedMaintenances();
    loadPrecompiledMaintenances();
  }, []);

  // Carica manutenzioni precompilate dal localStorage
  const loadPrecompiledMaintenances = () => {
    try {
      const precompiledMaintenances = localStorage.getItem('haccp-maintenance-tasks');
      if (precompiledMaintenances) {
        const maintenanceTasks = JSON.parse(precompiledMaintenances);
        
        // Raggruppa per punto di conservazione
        const groupedMaintenances = maintenanceTasks.reduce((acc, maintenance) => {
          const pointId = maintenance.conservation_point_id;
          if (!acc[pointId]) {
            acc[pointId] = {
              conservation_point_id: pointId,
              conservation_point_name: maintenance.conservation_point_name,
              tasks: []
            };
          }
          acc[pointId].tasks.push(maintenance);
          return acc;
        }, {});
        
        const groupedMaintenancesArray = Object.values(groupedMaintenances);
        setSavedMaintenances(groupedMaintenancesArray);
        
        // Salva le manutenzioni in formData per la validazione
        setFormData(prev => ({
          ...prev,
          savedMaintenances: groupedMaintenancesArray
        }));
        
        maintenanceLog('✅ Manutenzioni precompilate caricate:', groupedMaintenancesArray);
      }
    } catch (error) {
      errorLog('❌ Errore nel caricamento manutenzioni precompilate:', error);
    }
  };

  // Ricarica manutenzioni quando i dati dell'onboarding cambiano
  useEffect(() => {
    if (formData.conservation?.points?.length > 0) {
      debugLog('🔄 Ricaricamento manutenzioni per punti di conservazione...');
      loadSavedMaintenances();
    }
  }, [formData.conservation?.points]);

  // Precompila il form quando viene aperto
  useEffect(() => {
    if (showAddForm) {
      debugLog('🔄 Form aperto, controllando dati disponibili...');
      debugLog('📋 formData.tasks:', formData.tasks);
      debugLog('📋 tasks locali:', tasks);
      
      // Se ci sono task locali, usali per precompilare
      if (tasks.length > 0) {
        const firstTask = tasks[0];
        debugLog('🔄 Precompilando con task locale:', firstTask);
        setLocalFormData({
          name: firstTask.name || '',
          assignedRole: firstTask.assignedRole || '',
          assignedEmployee: firstTask.assignedEmployee || '',
          frequency: firstTask.frequency || ''
        });
      }
    }
  }, [showAddForm]); // Solo quando showAddForm cambia

  // Calcola i contatori per la validazione
  const conservationPointsCount = formData.conservation?.count || 0;
  
  // Conta i task generici di temperatura
  const genericTemperatureTasks = tasks.filter(task => {
    const taskName = task.name.toLowerCase();
    const isTemperatureTask = taskName.includes('rilevamento temperature') || 
                             taskName.includes('rilevamento temperatura') ||
                             taskName.includes('temperature') ||
                             taskName.includes('temperatura') ||
                             taskName.includes('monitoraggio');
    debugLog(`🌡️ Task "${task.name}": isTemperatureTask=${isTemperatureTask}`);
    return isTemperatureTask;
  }).length;
  
  // Conta le manutenzioni di temperatura
  const maintenanceTemperatureTasks = savedMaintenances.flatMap(group => group.tasks).filter(task => 
    task.task_type === 'temperature_monitoring'
  ).length;
  
  // Totale task di temperatura (generici + manutenzioni)
  const temperatureTasksCount = genericTemperatureTasks + maintenanceTemperatureTasks;
  
  debugLog(`📊 Temperature tasks count: ${temperatureTasksCount}, Total tasks: ${tasks.length}`);
  debugLog(`🌡️ Generic temperature tasks: ${genericTemperatureTasks}`);
  debugLog(`🌡️ Maintenance temperature tasks: ${maintenanceTemperatureTasks}`);
  debugLog('📋 All tasks:', tasks);

  // Aggiorna formData quando cambiano i tasks locali
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      tasks: {
        list: tasks,
        count: tasks.length
      }
    }));
  }, [tasks, setFormData]);

  const FREQUENCIES = [
    'Giornalmente',
    'Settimanalmente', 
    'Mensilmente',
    'Annualmente'
  ];

  const resetForm = () => {
    setLocalFormData({
      name: '',
      assignedRole: '',
      assignedEmployee: '',
      frequency: ''
    });
    setEditingTask(null);
  };

  const getSuggestedTaskName = (conservationPoint) => {
    // Se è un form generico, suggerisci esempi di attività
    if (formType === 'generic') {
      return 'Sanificazione Superfici Bancone / Chiusura di Cassa alle 23:55 / Pulizia dei Tavoli della Sala';
    }
    
    if (conservationPoint) {
      return `Rilevamento temperatura ${conservationPoint.name}`;
    }
    return 'Rilevamento temperatura';
  };

  // Ottieni i punti di conservazione effettivamente aggiunti
  const getConservationPoints = () => {
    const points = formData.conservation?.points || [];
    debugLog('🏢 Conservation points:', points);
    return points;
  };

  // Controlla se esistono TUTTE e 3 le attività obbligatorie per un punto di conservazione
  const hasTaskForConservationPoint = (point) => {
    debugLog(`🔍 Checking point ${point.id} (${point.name}) for maintenance tasks...`);
    debugLog(`📋 Saved maintenances:`, savedMaintenances);
    
    // Controlla prima nelle manutenzioni salvate nel database
    const hasMaintenanceTasks = savedMaintenances.some(maintenanceGroup => 
      maintenanceGroup.conservation_point_id === point.id &&
      maintenanceGroup.tasks.length >= 3 // Deve avere tutte e 3 le manutenzioni obbligatorie
    );
    
    if (hasMaintenanceTasks) {
      debugLog(`✅ Point ${point.id} (${point.name}) has maintenance tasks in database`);
      return true;
    }
    
    debugLog(`❌ Point ${point.id} (${point.name}) has NO maintenance tasks in database`);
    
    // Controlla nelle tasks esistenti (attività generiche)
    const pointTasks = tasks.filter(task => {
      const taskName = task.name.toLowerCase();
      const containsPointId = taskName.includes(point.id.toString());
      const containsPointName = taskName.includes(point.name.toLowerCase());
      return containsPointId || containsPointName;
    });
    
    // Controlla che esistano tutte e 3 le attività obbligatorie
    const hasTemperatureTask = pointTasks.some(task => {
      const taskName = task.name.toLowerCase();
      return taskName.includes('rilevamento temperature') || 
             taskName.includes('rilevamento temperatura') ||
             taskName.includes('temperature') ||
             taskName.includes('temperatura') ||
             taskName.includes('monitoraggio');
    });
    
    const hasSanitizationTask = pointTasks.some(task => {
      const taskName = task.name.toLowerCase();
      return taskName.includes('sanificazione') || 
             taskName.includes('sanitizzazione') ||
             taskName.includes('pulizia');
    });
    
    const hasDefrostingTask = pointTasks.some(task => {
      const taskName = task.name.toLowerCase();
      return taskName.includes('sbrinamento') || 
             taskName.includes('sbrinare') ||
             taskName.includes('defrosting');
    });
    
    debugLog(`🔍 Checking point ${point.id} (${point.name}): hasTemperatureTask=${hasTemperatureTask}, hasSanitizationTask=${hasSanitizationTask}, hasDefrostingTask=${hasDefrostingTask}`);
    
    // Restituisce true solo se esistono TUTTE e 3 le attività
    return hasTemperatureTask && hasSanitizationTask && hasDefrostingTask;
  };

  // Validazione: X temperature tasks per X conservation points

  // Validazione 1: Tutte le manutenzioni obbligatorie per i punti di conservazione
  const hasAllMaintenanceTasks = () => {
    return temperatureTasksCount >= conservationPointsCount;
  };

  // Validazione 2: Almeno 1 attività generale registrata
  const hasGeneralTasks = () => {
    return tasks.length > 0;
  };

  // Validazione completa: entrambi i requisiti devono essere soddisfatti
  const isStepComplete = () => {
    return hasAllMaintenanceTasks() && hasGeneralTasks();
  };

  // Crea automaticamente le mansioni per i punti di conservazione quando si apre il form
  useEffect(() => {
    if (showAddForm) {
      // Solo per form di manutenzione, non per form generico
      if (formType === 'maintenance') {
        const conservationPoints = getConservationPoints();
        const missingTasks = conservationPoints.filter(point => !hasTaskForConservationPoint(point));
        
        if (missingTasks.length > 0) {
          // Pre-compila con la prima mansione mancante
          const firstMissingPoint = missingTasks[0];
          setLocalFormData(prev => ({
            ...prev,
            name: getSuggestedTaskName(firstMissingPoint)
          }));
        }
      } else {
        // Per form generico, resetta il form
        setLocalFormData({
          name: '',
          assignedRole: '',
          assignedEmployee: '',
          frequency: ''
        });
      }
    }
  }, [showAddForm, formType]);

  const handleAddTask = () => {
    // Validazione del nome dell'attività
    if (!localFormData.name || localFormData.name.trim().length < 5) {
      setValidationErrors({
        name: "Nome attività deve essere di almeno 5 caratteri"
      });
      return;
    }
    
    if (localFormData.name && localFormData.assignedRole && localFormData.frequency) {
      const newTask = {
        id: Date.now(),
        name: localFormData.name.trim(),
        assignedRole: localFormData.assignedRole,
        assignedEmployee: localFormData.assignedEmployee || null,
        frequency: localFormData.frequency
      };
      
      debugLog('➕ Aggiungendo nuova attività:', newTask);
      setTasks(prev => {
        const updatedTasks = [...prev, newTask];
        debugLog('📋 Lista attività aggiornata:', updatedTasks);
        return updatedTasks;
      });
      resetForm();
      setShowAddForm(false);
      setValidationErrors({}); // Reset errori
    }
  };


  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Funzioni per gestire il form di manutenzione
  const handleMaintenanceSave = async (maintenanceTasks) => {
    try {
      maintenanceLog('💾 Salvataggio manutenzioni:', maintenanceTasks);
      
      // Salva le manutenzioni tramite il servizio
      const result = await supabaseService.saveMaintenanceTasks(maintenanceTasks);
      
      if (result.success) {
        maintenanceLog('✅ Manutenzioni salvate con successo');
        
        // Ricarica le manutenzioni salvate per aggiornare la lista
        await loadSavedMaintenances();
        
        // Chiudi il form
        setShowMaintenanceForm(false);
        setSelectedConservationPoint(null);
        setExistingMaintenanceData(null);
        
        // Mostra messaggio di successo
        alert('Manutenzioni configurate con successo!');
      } else {
        errorLog('❌ Errore nel salvataggio:', result.error);
        alert('Errore nel salvataggio delle manutenzioni');
      }
    } catch (error) {
      errorLog('❌ Errore durante il salvataggio:', error);
      alert('Errore durante il salvataggio delle manutenzioni');
    }
  };

  const handleMaintenanceCancel = () => {
    setShowMaintenanceForm(false);
    setSelectedConservationPoint(null);
    setExistingMaintenanceData(null);
  };

  // Funzione per convertire frequenze italiane in inglesi
  const convertFrequencyToEnglish = (frequency) => {
    const frequencyMap = {
      'Giornalmente': 'daily',
      'Settimanale': 'weekly', 
      'Mensile': 'monthly',
      'Semestrale': 'semiannual',
      'Annuale': 'annual',
      'Giorni specifici': 'custom_days'
    };
    return frequencyMap[frequency] || frequency;
  };

  // Gestisce la modifica delle manutenzioni
  const handleEditMaintenance = (maintenanceGroup) => {
    setSelectedConservationPoint({
      id: maintenanceGroup.conservation_point_id,
      name: maintenanceGroup.conservation_point_name
    });
    
    // Prepara i dati esistenti per il form
    const existingData = {
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
    };
    
    // Popola i dati esistenti per ogni tipo di attività
    maintenanceGroup.tasks.forEach(task => {
      const taskType = task.task_type;
      if (existingData[taskType]) {
        existingData[taskType] = {
          frequency: convertFrequencyToEnglish(task.frequency) || '',
          selected_days: task.selected_days || [],
          assigned_role: task.assigned_role || '',
          assigned_category: task.assigned_category || '',
          assigned_staff_ids: task.assigned_staff_ids || []
        };
      }
    });
    
    setExistingMaintenanceData(existingData);
    setShowMaintenanceForm(true);
  };

  // Gestisce l'eliminazione delle manutenzioni
  const handleDeleteMaintenance = async (maintenanceGroup) => {
    const confirmMessage = `Sei sicuro di voler eliminare tutte le manutenzioni per "${maintenanceGroup.conservation_point_name}"?\n\nQuesta azione non può essere annullata.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const result = await supabaseService.deleteMaintenanceTasksByConservationPoint(maintenanceGroup.conservation_point_id);
        
        if (result.success) {
          maintenanceLog('✅ Manutenzioni eliminate con successo');
          
          // Ricarica le manutenzioni salvate
          await loadSavedMaintenances();
          
          alert('Manutenzioni eliminate con successo!');
        } else {
          errorLog('❌ Errore nell\'eliminazione:', result.error);
          alert('Errore nell\'eliminazione delle manutenzioni');
        }
      } catch (error) {
        errorLog('❌ Errore durante l\'eliminazione:', error);
        alert('Errore durante l\'eliminazione delle manutenzioni');
      }
    }
  };

  // Formatta le etichette delle frequenze
  const formatFrequencyLabel = (frequency, selectedDays = []) => {
    switch (frequency) {
      case 'daily':
        return 'Giornalmente';
      case 'weekly':
        return 'Settimanale';
      case 'monthly':
        return 'Mensile';
      case 'semiannual':
        return 'Semestrale';
      case 'annual':
        return 'Annuale';
      case 'custom_days':
      case 'Giorni specifici':
        if (selectedDays && selectedDays.length > 0) {
          const dayNames = {
            monday: 'Lunedì',
            tuesday: 'Martedì',
            wednesday: 'Mercoledì',
            thursday: 'Giovedì',
            friday: 'Venerdì',
            saturday: 'Sabato',
            sunday: 'Domenica'
          };
          return selectedDays.map(day => dayNames[day]).join(', ');
        }
        return 'Giorni specifici';
      default:
        return frequency;
    }
  };

  // Ottiene i nomi dei dipendenti selezionati
  const getSelectedStaffNames = (staffIds) => {
    if (!staffIds || staffIds.length === 0) return '';
    
    const staffMembers = formData.staff?.staffMembers || [];
    const selectedStaff = staffMembers.filter(staff => staffIds.includes(staff.id));
    
    return selectedStaff.map(staff => `${staff.name} ${staff.surname}`).join(', ');
  };
  
  const canProceed = isStepComplete();

  // Rimuoviamo la funzione handleConfirmData - non più necessaria

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Mansioni e Attività</h3>
        <p className="text-gray-600">Assegna compiti al personale</p>
      </div>

      {/* Punti di Conservazione che necessitano mansioni */}
      {(() => {
        const conservationPoints = getConservationPoints();
        const missingTasks = conservationPoints.filter(point => !hasTaskForConservationPoint(point));
        
        debugLog('🔍 Missing tasks check:', {
          conservationPoints: conservationPoints.map(p => ({ id: p.id, name: p.name })),
          missingTasks: missingTasks.map(p => ({ id: p.id, name: p.name })),
          allTasks: tasks.map(t => ({ name: t.name, assignedRole: t.assignedRole }))
        });
        
        if (missingTasks.length > 0) {
          return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Punti di Conservazione senza Mansioni</h4>
              </div>
              <p className="text-sm text-yellow-800 mb-3">
                I seguenti punti di conservazione necessitano delle 3 mansioni obbligatorie (Rilevamento Temperatura, Sanificazione, Sbrinamento):
              </p>
              <div className="space-y-2">
                {missingTasks.map(point => (
                  <div key={point.id} className="flex items-center justify-between p-2 bg-yellow-100 rounded">
                    <span className="text-sm font-medium">{point.name}</span>
                    <Button
                      onClick={() => {
                        setSelectedConservationPoint(point);
                        setShowMaintenanceForm(true);
                      }}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Aggiungi Mansione
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Lista Attività */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Attività e Mansioni</h4>
          <Button
            onClick={() => {
              setFormType('generic');
              setShowAddForm(true);
            }}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Aggiungi Nuova Attività
          </Button>
        </div>

        {/* Manutenzioni Salvate */}
        {savedMaintenances.length > 0 && (
          <div className="space-y-3 mb-6">
            {savedMaintenances.map(maintenanceGroup => (
              <div key={maintenanceGroup.conservation_point_id} className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-yellow-900 mb-3">
                      Manutenzioni ({maintenanceGroup.conservation_point_name})
                    </h4>
                    
                    <div className="space-y-3">
                      {maintenanceGroup.tasks.map(task => (
                        <div key={task.id} className="text-base">
                          <div className="font-medium text-gray-800 mb-2">{task.task_name}:</div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="font-medium">Frequenza:</span> 
                              <span className="ml-1 text-gray-700">
                                {formatFrequencyLabel(task.frequency, task.selected_days)}
                              </span>
                            </div>
                            {task.assigned_role && (
                              <div className="flex items-center">
                                <span className="font-medium">Ruolo:</span> 
                                <span className="ml-1 text-gray-700">{task.assigned_role}</span>
                              </div>
                            )}
                            {task.assigned_category && (
                              <div className="flex items-center">
                                <span className="font-medium">Categoria:</span> 
                                <span className="ml-1 text-gray-700">{task.assigned_category}</span>
                              </div>
                            )}
                            {task.assigned_staff_ids && task.assigned_staff_ids.length > 0 && (
                              <div className="flex items-center">
                                <span className="font-medium">Staff:</span> 
                                <span className="ml-1 text-gray-700">
                                  {getSelectedStaffNames(task.assigned_staff_ids)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditMaintenance(maintenanceGroup)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteMaintenance(maintenanceGroup)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Attività Generiche */}
        {tasks.length === 0 && savedMaintenances.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nessuna attività configurata</p>
            <p className="text-sm">Clicca "Aggiungi Nuova Attività" per iniziare</p>
          </div>
        ) : (
          tasks.length > 0 && (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h5 className="font-medium">{task.name}</h5>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {formatFrequencyLabel(task.frequency)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Assegnato a:</span> {task.assignedRole}
                        {task.assignedEmployee && (
                          <span className="ml-2 text-blue-600">({task.assignedEmployee})</span>
                        )}
                      </div>
                      
                      {task.name.toLowerCase().includes('rilevamento temperature') && (
                        <div className="mt-2 text-sm text-blue-600">
                          🌡️ Attività di monitoraggio temperature
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDeleteTask(task.id)}
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
          )
        )}
      </div>

      {/* Form Aggiungi Attività */}
      {showAddForm && (
        <div ref={genericFormRef} id="tasks-generic-form" className="border rounded-lg p-4 bg-white">
          <h4 className="font-medium text-gray-900 mb-4">Aggiungi Nuova Attività</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome Attività *</Label>
              <Input
                id="name"
                value={localFormData.name}
                onChange={(e) => {
                  setLocalFormData(prev => ({ ...prev, name: e.target.value }));
                  // Reset errori quando l'utente inizia a digitare
                  if (validationErrors.name) {
                    setValidationErrors(prev => ({ ...prev, name: null }));
                  }
                }}
                placeholder=""
                className={`mt-1 ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-500 mt-1">
                  ⚠️ {validationErrors.name}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Suggerimento: {getSuggestedTaskName()}
              </p>
            </div>
            
            <div>
              <Label htmlFor="assignedRole">Assegna Mansione a: *</Label>
              <select
                id="assignedRole"
                value={localFormData.assignedRole}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, assignedRole: e.target.value, assignedEmployee: '' }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleziona categoria</option>
                <option value="Amministratore">Amministratore</option>
                <option value="Cuochi">Cuochi</option>
                <option value="Banconisti">Banconisti</option>
                <option value="Camerieri">Camerieri</option>
                <option value="Responsabile">Responsabile</option>
                <option value="Dipendente">Dipendente</option>
              </select>
              {!localFormData.assignedRole && (
                <p className="text-sm text-red-500 mt-1">
                  ⚠️ Seleziona una categoria per procedere
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="assignedEmployee">Dipendente Specifico (Opzionale)</Label>
              <select
                id="assignedEmployee"
                value={localFormData.assignedEmployee}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, assignedEmployee: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={!localFormData.assignedRole}
              >
                <option value="">Seleziona dipendente specifico</option>
                {formData.staff?.staffMembers?.filter(member => {
                  // Se è un ruolo (Responsabile, Dipendente, Amministratore), filtra per ruolo
                  if (['Responsabile', 'Dipendente', 'Amministratore'].includes(localFormData.assignedRole)) {
                    return member.role === localFormData.assignedRole;
                  }
                  // Altrimenti filtra per categoria (Cuochi, Banconisti, Camerieri)
                  return member.categories?.includes(localFormData.assignedRole) || member.primaryCategory === localFormData.assignedRole;
                }).map(member => (
                  <option key={member.id} value={member.fullName || member.name}>
                    {member.fullName || member.name} - {member.role} ({member.primaryCategory || member.categories?.[0]})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="frequency">Frequenza *</Label>
              <select
                id="frequency"
                value={localFormData.frequency}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, frequency: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleziona frequenza</option>
                {FREQUENCIES.map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>
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
              onClick={handleAddTask}
              disabled={!localFormData.name || !localFormData.assignedRole || !localFormData.frequency}
            >
              Aggiungi Attività
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
            {tasks.length + savedMaintenances.length}
          </div>
          <div>
            {canProceed && (
              <h3 className="text-lg font-bold text-green-900 mb-2">Configurazione Completata</h3>
            )}
            <p className={`font-medium ${
              canProceed ? 'text-green-900' : 'text-yellow-900'
            }`}>
              Attività configurate: {tasks.length + savedMaintenances.length}
            </p>
            <p className={`text-sm ${
              canProceed ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {canProceed 
                ? '✅ Tutti i requisiti sono soddisfatti! Puoi procedere al prossimo step.'
                : !hasAllMaintenanceTasks() && !hasGeneralTasks()
                  ? '⚠️ Devi configurare le manutenzioni per tutti i punti di conservazione e aggiungere almeno un\'attività generale.'
                  : !hasAllMaintenanceTasks()
                    ? '⚠️ Devi configurare le manutenzioni per tutti i punti di conservazione.'
                    : '⚠️ Devi aggiungere almeno un\'attività generale.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Messaggio di errore generale quando non si può procedere */}
      {!canProceed && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h4 className="font-bold text-red-900">Non puoi procedere al prossimo step</h4>
          </div>
          <p className="text-sm text-red-800 mb-2">
            Ci sono errori che devi correggere prima di poter continuare:
          </p>
          <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
            {tasks.some(task => task.name && task.name.trim().length < 5) && (
              <li>Alcune attività hanno nomi troppo corti (minimo 5 caratteri)</li>
            )}
            {!hasAllMaintenanceTasks() && (
              <li>Devi configurare le manutenzioni per tutti i punti di conservazione</li>
            )}
            {!hasGeneralTasks() && (
              <li>Devi aggiungere almeno un'attività generale</li>
            )}
          </ul>
        </div>
      )}

      {/* Messaggio di errore per attività con nomi troppo corti */}
      {tasks.some(task => task.name && task.name.trim().length < 5) && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h4 className="text-lg font-bold text-red-900">⚠️ ERRORE DI VALIDAZIONE</h4>
          </div>
          <div className="bg-red-100 p-3 rounded-md mb-3">
            <p className="text-base font-semibold text-red-900 mb-2">
              Non puoi procedere al prossimo step perché alcune attività hanno nomi troppo corti!
            </p>
            <p className="text-sm text-red-800 mb-2">
              Per procedere, devi correggere i seguenti problemi:
            </p>
            <ul className="text-sm text-red-700 list-disc list-inside space-y-1 font-medium">
              <li>Il nome di ogni attività deve essere di almeno 5 caratteri</li>
              <li>Modifica o elimina le attività con nomi troppo corti</li>
              <li>Esempio di nome valido: "Pulizia bancone cucina"</li>
            </ul>
          </div>
          <div className="text-sm text-red-700">
            <strong>Attività con problemi:</strong>
            <ul className="list-disc list-inside mt-1">
              {tasks.filter(task => task.name && task.name.trim().length < 5).map((task, index) => (
                <li key={index}>
                  "{task.name}" (solo {task.name.trim().length} caratteri - ne servono almeno 5)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

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

       {/* Form di Manutenzione */}
       <MaintenanceForm
         ref={maintenanceFormRef}
         conservationPoint={selectedConservationPoint}
         staffMembers={formData.staff?.staffMembers || []}
         onSave={handleMaintenanceSave}
         onCancel={handleMaintenanceCancel}
         isOpen={showMaintenanceForm}
         existingData={existingMaintenanceData}
       />
    </div>
  );
};

export default TasksStep;
