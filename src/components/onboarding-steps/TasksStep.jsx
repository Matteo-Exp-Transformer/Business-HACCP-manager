import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Plus, X, ClipboardList, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import MaintenanceForm from '../MaintenanceForm';
import { supabaseService } from '../../services/supabaseService';
import { MAINTENANCE_TASK_TYPES } from '../../utils/maintenanceConstants';

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

  // Carica dati esistenti quando il componente si monta
  useEffect(() => {
    console.log('🔄 TasksStep: Caricamento dati...');
    console.log('📋 formData.tasks:', formData.tasks);
    
    // Controlla sia la struttura standard che quella di precompilazione
    const tasksList = formData.tasks?.list || formData.tasks?.tasksList || [];
    
    if (tasksList.length > 0) {
      console.log('✅ Caricando tasks:', tasksList);
      setTasks(tasksList);
    } else {
      console.log('⚠️ Nessun task trovato in formData.tasks');
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
        
        console.log('✅ Manutenzioni caricate:', groupedMaintenancesArray);
      }
    } catch (error) {
      console.error('❌ Errore nel caricamento manutenzioni:', error);
    } finally {
      setLoadingMaintenances(false);
    }
  };

  // Carica manutenzioni quando il componente si monta
  useEffect(() => {
    loadSavedMaintenances();
  }, []);

  // Ricarica manutenzioni quando i dati dell'onboarding cambiano
  useEffect(() => {
    if (formData.conservation?.points?.length > 0) {
      console.log('🔄 Ricaricamento manutenzioni per punti di conservazione...');
      loadSavedMaintenances();
    }
  }, [formData.conservation?.points]);

  // Precompila il form quando viene aperto
  useEffect(() => {
    if (showAddForm) {
      console.log('🔄 Form aperto, controllando dati disponibili...');
      console.log('📋 formData.tasks:', formData.tasks);
      console.log('📋 tasks locali:', tasks);
      
      // Se ci sono task locali, usali per precompilare
      if (tasks.length > 0) {
        const firstTask = tasks[0];
        console.log('🔄 Precompilando con task locale:', firstTask);
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
  const temperatureTasksCount = tasks.filter(task => {
    const taskName = task.name.toLowerCase();
    const isTemperatureTask = taskName.includes('rilevamento temperature') || 
                             taskName.includes('rilevamento temperatura') ||
                             taskName.includes('temperature') ||
                             taskName.includes('temperatura') ||
                             taskName.includes('monitoraggio');
    console.log(`🌡️ Task "${task.name}": isTemperatureTask=${isTemperatureTask}`);
    return isTemperatureTask;
  }).length;
  
  console.log(`📊 Temperature tasks count: ${temperatureTasksCount}, Total tasks: ${tasks.length}`);
  console.log('📋 All tasks:', tasks);

  // RIMOSSO: useEffect che causava loop infinito
  // updateFormData viene chiamato solo quando necessario (add/edit/delete)

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
    if (conservationPoint) {
      return `Rilevamento temperatura ${conservationPoint.name}`;
    }
    return 'Rilevamento temperatura';
  };

  // Ottieni i punti di conservazione effettivamente aggiunti
  const getConservationPoints = () => {
    const points = formData.conservation?.points || [];
    console.log('🏢 Conservation points:', points);
    return points;
  };

  // Controlla se esistono TUTTE e 3 le attività obbligatorie per un punto di conservazione
  const hasTaskForConservationPoint = (point) => {
    console.log(`🔍 Checking point ${point.id} (${point.name}) for maintenance tasks...`);
    console.log(`📋 Saved maintenances:`, savedMaintenances);
    
    // Controlla prima nelle manutenzioni salvate nel database
    const hasMaintenanceTasks = savedMaintenances.some(maintenanceGroup => 
      maintenanceGroup.conservation_point_id === point.id &&
      maintenanceGroup.tasks.length >= 3 // Deve avere tutte e 3 le manutenzioni obbligatorie
    );
    
    if (hasMaintenanceTasks) {
      console.log(`✅ Point ${point.id} (${point.name}) has maintenance tasks in database`);
      return true;
    }
    
    console.log(`❌ Point ${point.id} (${point.name}) has NO maintenance tasks in database`);
    
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
    
    console.log(`🔍 Checking point ${point.id} (${point.name}): hasTemperatureTask=${hasTemperatureTask}, hasSanitizationTask=${hasSanitizationTask}, hasDefrostingTask=${hasDefrostingTask}`);
    
    // Restituisce true solo se esistono TUTTE e 3 le attività
    return hasTemperatureTask && hasSanitizationTask && hasDefrostingTask;
  };

  // Validazione: X temperature tasks per X conservation points

  // Crea automaticamente le mansioni per i punti di conservazione quando si apre il form
  useEffect(() => {
    if (showAddForm) {
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
    }
  }, [showAddForm]);

  const handleAddTask = () => {
    if (localFormData.name && localFormData.assignedRole && localFormData.frequency) {
      const newTask = {
        id: Date.now(),
        name: localFormData.name,
        assignedRole: localFormData.assignedRole,
        assignedEmployee: localFormData.assignedEmployee || null,
        frequency: localFormData.frequency
      };
      
      console.log('➕ Aggiungendo nuova attività:', newTask);
      setTasks(prev => {
        const updatedTasks = [...prev, newTask];
        console.log('📋 Lista attività aggiornata:', updatedTasks);
        return updatedTasks;
      });
      resetForm();
      setShowAddForm(false);
    }
  };


  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Funzioni per gestire il form di manutenzione
  const handleMaintenanceSave = async (maintenanceTasks) => {
    try {
      console.log('💾 Salvataggio manutenzioni:', maintenanceTasks);
      
      // Salva le manutenzioni tramite il servizio
      const result = await supabaseService.saveMaintenanceTasks(maintenanceTasks);
      
      if (result.success) {
        console.log('✅ Manutenzioni salvate con successo');
        
        // Ricarica le manutenzioni salvate per aggiornare la lista
        await loadSavedMaintenances();
        
        // Chiudi il form
        setShowMaintenanceForm(false);
        setSelectedConservationPoint(null);
        setExistingMaintenanceData(null);
        
        // Mostra messaggio di successo
        alert('Manutenzioni configurate con successo!');
      } else {
        console.error('❌ Errore nel salvataggio:', result.error);
        alert('Errore nel salvataggio delle manutenzioni');
      }
    } catch (error) {
      console.error('❌ Errore durante il salvataggio:', error);
      alert('Errore durante il salvataggio delle manutenzioni');
    }
  };

  const handleMaintenanceCancel = () => {
    setShowMaintenanceForm(false);
    setSelectedConservationPoint(null);
    setExistingMaintenanceData(null);
  };

  // Gestisce la modifica delle manutenzioni
  const handleEditMaintenance = (maintenanceGroup) => {
    setSelectedConservationPoint({
      id: maintenanceGroup.conservation_point_id,
      name: maintenanceGroup.conservation_point_name
    });
    
    // Prepara i dati esistenti per il form
    const existingData = {
      [MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING]: {},
      [MAINTENANCE_TASK_TYPES.SANITIZATION]: {},
      [MAINTENANCE_TASK_TYPES.DEFROSTING]: {}
    };
    
    // Popola i dati esistenti per ogni tipo di attività
    maintenanceGroup.tasks.forEach(task => {
      const taskType = task.task_type;
      if (existingData[taskType]) {
        existingData[taskType] = {
          frequency: task.frequency,
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
          console.log('✅ Manutenzioni eliminate con successo');
          
          // Ricarica le manutenzioni salvate
          await loadSavedMaintenances();
          
          alert('Manutenzioni eliminate con successo!');
        } else {
          console.error('❌ Errore nell\'eliminazione:', result.error);
          alert('Errore nell\'eliminazione delle manutenzioni');
        }
      } catch (error) {
        console.error('❌ Errore durante l\'eliminazione:', error);
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
  
  const canProceed = tasks.length > 0 && 
    tasks.every(task => task.name && task.assignedRole && task.frequency) &&
    temperatureTasksCount >= conservationPointsCount;

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
        
        console.log('🔍 Missing tasks check:', {
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
            onClick={() => setShowAddForm(true)}
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
                    <h4 className="text-xl font-bold text-yellow-900 mb-4">
                      Attività di Manutenzione ({maintenanceGroup.conservation_point_name})
                    </h4>
                    
                    <div className="space-y-3">
                      {maintenanceGroup.tasks.map(task => (
                        <div key={task.id} className="text-base">
                          <div className="font-bold text-gray-800 mb-2">{task.task_name}:</div>
                          <div className="flex flex-wrap items-center gap-4 text-gray-600">
                            <div className="flex items-center">
                              <span className="font-semibold">Frequenza:</span> 
                              <span className="ml-1 text-gray-700 font-semibold">
                                {formatFrequencyLabel(task.frequency, task.selected_days)}
                              </span>
                            </div>
                            {task.assigned_role && (
                              <div className="flex items-center">
                                <span className="font-semibold">Ruolo:</span> 
                                <span className="ml-1 text-gray-700 font-semibold">{task.assigned_role}</span>
                              </div>
                            )}
                            {task.assigned_category && (
                              <div className="flex items-center">
                                <span className="font-semibold">Categoria:</span> 
                                <span className="ml-1 text-gray-700 font-semibold">{task.assigned_category}</span>
                              </div>
                            )}
                            {task.assigned_staff_ids && task.assigned_staff_ids.length > 0 && (
                              <div className="flex items-center">
                                <span className="font-semibold">Dipendenti:</span> 
                                <span className="ml-1 text-gray-700 font-semibold">
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
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-medium text-gray-900 mb-4">Aggiungi Nuova Attività</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome Attività *</Label>
              <Input
                id="name"
                value={localFormData.name}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={getSuggestedTaskName()}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Suggerimento: {getSuggestedTaskName()}
              </p>
            </div>
            
            <div>
              <Label htmlFor="assignedRole">Assegna rilevamento temperature a: *</Label>
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
                <p className="text-xs text-red-500 mt-1">
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

      {/* Validazione Critica */}
      <div className={`p-4 rounded-lg ${
        canProceed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              canProceed ? 'bg-green-500' : 'bg-yellow-500'
            } text-white text-sm font-bold`}>
              {tasks.length}
            </div>
            <div>
              <p className={`font-medium ${
                canProceed ? 'text-green-900' : 'text-yellow-900'
              }`}>
                Attività configurate: {tasks.length}
              </p>
            </div>
          </div>
          
          {/* Validazione Temperature Tasks */}
          <div className={`p-3 rounded-lg ${
            temperatureTasksCount >= conservationPointsCount ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${
                temperatureTasksCount >= conservationPointsCount ? 'text-green-600' : 'text-red-600'
              }`} />
              <span className={`font-medium ${
                temperatureTasksCount >= conservationPointsCount ? 'text-green-900' : 'text-red-900'
              }`}>
                Validazione Critica: Attività Manutenzione Complete
              </span>
            </div>
            <div className="mt-2 text-sm">
              <p className={temperatureTasksCount >= conservationPointsCount ? 'text-green-800' : 'text-red-800'}>
                <strong>Punti di conservazione:</strong> {conservationPointsCount} | 
                <strong> Attività temperature:</strong> {temperatureTasksCount}
              </p>
              <p className={temperatureTasksCount >= conservationPointsCount ? 'text-green-800' : 'text-red-800'}>
                {temperatureTasksCount >= conservationPointsCount 
                  ? '✅ Requisito soddisfatto! Ogni punto ha le 3 attività obbligatorie (Rilevamento Temperatura, Sanificazione, Sbrinamento).'
                  : '❌ Devi creare le 3 attività obbligatorie (Rilevamento Temperatura, Sanificazione, Sbrinamento) per ogni punto di conservazione.'
                }
              </p>
            </div>
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

       {/* Form di Manutenzione */}
       <MaintenanceForm
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
