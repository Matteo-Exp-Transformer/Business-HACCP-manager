import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Plus, X, ClipboardList, AlertTriangle } from 'lucide-react';

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
    assignedTo: '',
    frequency: ''
  });

  // Dati mock per il test (in produzione verranno da formData.staff e formData.conservation)
  const mockStaff = [
    { id: 1, name: 'Mario Rossi', role: 'Responsabile', category: 'Cuochi' },
    { id: 2, name: 'Giulia Bianchi', role: 'Dipendente', category: 'Banconisti' }
  ];

  // Carica dati esistenti quando il componente si monta
  useEffect(() => {
    if (formData.tasks?.list && formData.tasks.list.length > 0) {
      setTasks(formData.tasks.list);
    }
  }, [formData.tasks]);

  const FREQUENCIES = [
    'Giornalmente',
    'Settimanalmente', 
    'Mensilmente',
    'Annualmente'
  ];

  const resetForm = () => {
    setLocalFormData({
      name: '',
      assignedTo: '',
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
    return formData.conservation?.points || [];
  };

  // Controlla se esiste già una mansione per un punto di conservazione
  const hasTaskForConservationPoint = (pointId) => {
    return tasks.some(task => 
      task.name.toLowerCase().includes('rilevamento temperatura') &&
      task.name.toLowerCase().includes(pointId.toString())
    );
  };

  // Validazione: X temperature tasks per X conservation points
  const conservationPointsCount = formData.conservation?.count || 0; // In produzione verrà da formData.conservation.count
  const temperatureTasksCount = tasks.filter(task => 
    task.name.toLowerCase().includes('rilevamento temperature')
  ).length;

  // Crea automaticamente le mansioni per i punti di conservazione quando si apre il form
  useEffect(() => {
    if (showAddForm) {
      const conservationPoints = getConservationPoints();
      const missingTasks = conservationPoints.filter(point => !hasTaskForConservationPoint(point.id));
      
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
    if (localFormData.name && localFormData.assignedTo && localFormData.frequency) {
      const newTask = {
        id: Date.now(),
        ...localFormData,
        needsConfirmation: true
      };
      
      setTasks(prev => [...prev, newTask]);
      resetForm();
      setShowAddForm(false);
    }
  };

  const handleConfirmTask = (id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, needsConfirmation: false } : task
    ));
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };
  
  const canProceed = tasks.length > 0 && 
    tasks.every(task => task.name && task.assignedTo && task.frequency) &&
    temperatureTasksCount >= conservationPointsCount;

  const handleConfirmData = () => {
    // 1. Prepara i dati AGGIORNATI localmente
    const updatedFormData = {
      ...formData,
      tasks: {
        list: tasks,
        count: tasks.length,
        temperatureTasksCount,
        conservationPointsCount
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
        <h3 className="text-xl font-semibold mb-2">Mansioni e Attività</h3>
        <p className="text-gray-600">Assegna compiti al personale</p>
      </div>

      {/* Punti di Conservazione che necessitano mansioni */}
      {(() => {
        const conservationPoints = getConservationPoints();
        const missingTasks = conservationPoints.filter(point => !hasTaskForConservationPoint(point.id));
        
        if (missingTasks.length > 0) {
          return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Punti di Conservazione senza Mansioni</h4>
              </div>
              <p className="text-sm text-yellow-800 mb-3">
                I seguenti punti di conservazione necessitano di mansioni di rilevamento temperature:
              </p>
              <div className="space-y-2">
                {missingTasks.map(point => (
                  <div key={point.id} className="flex items-center justify-between p-2 bg-yellow-100 rounded">
                    <span className="text-sm font-medium">{point.name}</span>
                    <Button
                      onClick={() => {
                        setShowAddForm(true);
                        setLocalFormData(prev => ({
                          ...prev,
                          name: getSuggestedTaskName(point)
                        }));
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

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nessuna attività configurata</p>
            <p className="text-sm">Clicca "Aggiungi Nuova Attività" per iniziare</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h5 className="font-medium">{task.name}</h5>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {task.frequency}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Assegnato a:</span> {task.assignedTo}
                    </div>
                    
                    {task.name.toLowerCase().includes('rilevamento temperature') && (
                      <div className="mt-2 text-sm text-blue-600">
                        🌡️ Attività di monitoraggio temperature
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {task.needsConfirmation ? (
                      <Button
                        onClick={() => handleConfirmTask(task.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Conferma
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleDeleteTask(task.id)}
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
              <Label htmlFor="assignedTo">Assegnato a *</Label>
              <select
                id="assignedTo"
                value={localFormData.assignedTo}
                onChange={(e) => setLocalFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleziona membro staff</option>
                {mockStaff.map(staff => (
                  <option key={staff.id} value={staff.name}>
                    {staff.name} ({staff.role} - {staff.category})
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
              disabled={!localFormData.name || !localFormData.assignedTo || !localFormData.frequency}
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
                Validazione Critica: Attività Monitoraggio Temperature
              </span>
            </div>
            <div className="mt-2 text-sm">
              <p className={temperatureTasksCount >= conservationPointsCount ? 'text-green-800' : 'text-red-800'}>
                <strong>Punti di conservazione:</strong> {conservationPointsCount} | 
                <strong> Attività temperature:</strong> {temperatureTasksCount}
              </p>
              <p className={temperatureTasksCount >= conservationPointsCount ? 'text-green-800' : 'text-red-800'}>
                {temperatureTasksCount >= conservationPointsCount 
                  ? '✅ Requisito soddisfatto! Ogni punto ha la sua attività di monitoraggio.'
                  : '⚠️ Devi creare almeno 1 attività di monitoraggio temperature per ogni punto di conservazione.'
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
             'Conferma Dati Attività'
           )}
         </Button>
       </div>
    </div>
  );
};

export default TasksStep;
