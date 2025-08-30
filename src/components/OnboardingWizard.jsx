import React, { useState } from 'react';
import { Button } from './ui/Button';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Building2, 
  Thermometer, 
  Users, 
  Package, 
  ClipboardList
} from 'lucide-react';

// Import degli step (da creare)
import BusinessInfoStep from './onboarding-steps/BusinessInfoStep';
import DepartmentsStep from './onboarding-steps/DepartmentsStep';
import StaffStep from './onboarding-steps/StaffStep';
import ConservationStep from './onboarding-steps/ConservationStep';
import TasksStep from './onboarding-steps/TasksStep';
import InventoryStep from './onboarding-steps/InventoryStep';

const ONBOARDING_STEPS = [
  {
    id: 'business',
    title: 'Informazioni Attività',
    description: 'Configura i dati base della tua attività',
    icon: Building2,
    component: BusinessInfoStep
  },
  {
    id: 'departments',
    title: 'Reparti',
    description: 'Organizza la struttura operativa',
    icon: Building2,
    component: DepartmentsStep
  },
  {
    id: 'staff',
    title: 'Staff e Ruoli',
    description: 'Registra il personale e assegna responsabilità',
    icon: Users,
    component: StaffStep
  },
  {
    id: 'conservation',
    title: 'Punti di Conservazione',
    description: 'Configura frigoriferi e aree di stoccaggio',
    icon: Thermometer,
    component: ConservationStep
  },
  {
    id: 'tasks',
    title: 'Mansioni e Attività',
    description: 'Assegna compiti al personale',
    icon: ClipboardList,
    component: TasksStep
  },
  {
    id: 'inventory',
    title: 'Inventario Prodotti',
    description: 'Gestisci prodotti e allergeni',
    icon: Package,
    component: InventoryStep
  }
];

function OnboardingWizard({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  // Wrapper per setCurrentStep con logging
  const setCurrentStepWithLogging = (newStep) => {
    console.log(`🚨 setCurrentStep chiamato: ${currentStep} → ${newStep}`);
    console.log(`🚨 Stack trace:`, new Error().stack);
    setCurrentStep(newStep);
  };
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [confirmedSteps, setConfirmedSteps] = useState(new Set()); // Step confermati
  const [formData, setFormData] = useState({
    business: {},
    departments: {},
    staff: {},
    conservation: {},
    tasks: {},
    inventory: {}
  });

  // Funzione di validazione globale per tutti gli step
  const validateStep = (stepNumber, data) => {
    const errors = {};
    
         if (stepNumber === 0) { // Business Info
       if (!data.business?.name?.trim()) {
         errors.businessName = "Il nome attività è obbligatorio";
       }
       if (!data.business?.address?.trim()) {
         errors.address = "L'indirizzo è obbligatorio";
       }
       if (!data.business?.email?.trim()) {
         errors.email = "L'email è obbligatoria";
       } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.business.email)) {
         errors.email = "Inserisci una email valida (formato: nome@dominio.com)";
       }
       
       // Controlla che il nome attività non sia troppo corto
       if (data.business?.name?.trim() && data.business.name.trim().length < 3) {
         errors.businessName = "Il nome attività deve essere di almeno 3 caratteri";
       }
       
       // Controlla che l'indirizzo non sia troppo corto
       if (data.business?.address?.trim() && data.business.address.trim().length < 10) {
         errors.address = "L'indirizzo deve essere di almeno 10 caratteri";
       }
       
       // Controlla che il nome dell'attività sia unico (non duplicato)
       if (data.business?.name?.trim()) {
         const businessName = data.business.name.trim().toLowerCase();
         // In un sistema reale, qui si controllerebbe contro un database
         // Per ora, controlliamo solo che non sia vuoto o troppo corto
         if (businessName.length < 3) {
           errors.businessName = "Il nome attività deve essere di almeno 3 caratteri";
         }
       }
       
       // Controlla che i dati di contatto siano completi
       if (!data.business?.phone?.trim() && !data.business?.email?.trim()) {
         errors.contactInfo = "Devi fornire almeno un metodo di contatto (telefono o email)";
       }
     }
    
         if (stepNumber === 1) { // Reparti
       // DepartmentsStep salva come { list: [...], enabledCount: number }
       const departmentsList = data.departments?.list || [];
       const enabledDepartments = departmentsList.filter(dept => dept.enabled);
       if (enabledDepartments.length < 4) {
         errors.departments = "Devi attivare almeno 4 reparti per procedere";
       } else {
         // Controlla solo che i reparti attivi abbiano nomi validi
         enabledDepartments.forEach((dept, index) => {
           if (!dept.name?.trim() || dept.name.trim().length < 2) {
             errors[`department_${index}_name`] = "Nome reparto deve essere di almeno 2 caratteri";
           }
         });
         
         // Controlla che i nomi dei reparti siano unici
         const names = enabledDepartments.map(dept => dept.name.toLowerCase().trim());
         const uniqueNames = new Set(names);
         if (names.length !== uniqueNames.size) {
           errors.departmentNames = "I nomi dei reparti devono essere unici";
         }
       }
     }
    
         if (stepNumber === 2) { // Staff
       // StaffStep salva come { staffMembers: [...] }
       const staffMembers = data.staff?.staffMembers || [];
       if (staffMembers.length === 0) {
         errors.staff = "Devi aggiungere almeno un membro dello staff";
       } else {
         // Controlla ogni membro individualmente
         staffMembers.forEach((member, index) => {
           if (!member.fullName?.trim()) {
             errors[`staff_${index}_name`] = "Nome obbligatorio";
           } else if (member.fullName.trim().length < 3) {
             errors[`staff_${index}_name`] = "Nome deve essere di almeno 3 caratteri";
           }
           if (!member.role) {
             errors[`staff_${index}_role`] = "Ruolo obbligatorio";
           } else {
             // Controlla che il ruolo sia valido
             const validRoles = ['Amministratore', 'Responsabile', 'Dipendente', 'Collaboratore Occasionale / Part-time'];
             if (!validRoles.includes(member.role)) {
               errors[`staff_${index}_role`] = "Ruolo non valido - seleziona un ruolo valido";
             }
           }
           if (!member.category) {
             errors[`staff_${index}_category`] = "Categoria obbligatoria";
           } else {
             // Controlla che la categoria sia valida
             const validCategories = ['Cuochi', 'Banconisti', 'Camerieri', 'Social & Media Manager', 'Amministratore'];
             if (!validCategories.includes(member.category)) {
               errors[`staff_${index}_category`] = "Categoria non valida - seleziona una categoria valida";
             }
           }
           
           // Controlla che il ruolo e la categoria siano compatibili
           if (member.role === 'Amministratore' && member.category !== 'Amministratore') {
             errors[`staff_${index}_category`] = "Il ruolo 'Amministratore' deve essere associato alla categoria 'Amministratore'";
           }
         });
         
         // Controlla che i nomi dei membri siano unici
         const names = staffMembers.map(member => member.fullName.toLowerCase().trim());
         const uniqueNames = new Set(names);
         if (names.length !== uniqueNames.size) {
           errors.staffNames = "I nomi dei membri dello staff devono essere unici";
         }
       }
     }
    
             if (stepNumber === 3) { // Punti di Conservazione
           // ConservationStep salva come { points: [...], count: number }
           const conservationPoints = data.conservation?.points || [];
           if (conservationPoints.length === 0) {
             errors.conservation = "Devi aggiungere almeno un punto di conservazione";
           } else {
             conservationPoints.forEach((point, index) => {
               if (!point.name?.trim()) {
                 errors[`conservation_${index}_name`] = "Nome obbligatorio";
               } else if (point.name.trim().length < 2) {
                 errors[`conservation_${index}_name`] = "Nome deve essere di almeno 2 caratteri";
               }
               if (!point.location) {
                 errors[`conservation_${index}_location`] = "Posizione obbligatoria";
               } else {
                 // Controlla che la posizione sia un reparto valido
                 const departments = data.departments?.list || [];
                 const validLocation = departments.find(dept => dept.name === point.location && dept.enabled);
                 if (!validLocation) {
                   errors[`conservation_${index}_location`] = "Posizione non valida - seleziona un reparto attivo";
                 }
               }
               if (!point.minTemp || !point.maxTemp) {
                 errors[`conservation_${index}_temperature`] = "Range temperature obbligatorio";
               } else {
                 const min = parseFloat(point.minTemp);
                 const max = parseFloat(point.maxTemp);
                 if (isNaN(min) || isNaN(max)) {
                   errors[`conservation_${index}_temperature`] = "Temperature non valide";
                 } else if (min >= max) {
                   errors[`conservation_${index}_temperature`] = "Temperatura minima deve essere inferiore alla massima";
                 }
               }
               if (!point.assignedRole) {
                 errors[`conservation_${index}_assigned`] = "Assegnazione obbligatoria";
               } else {
                 // Controlla che il ruolo assegnato sia valido
                 const validRoles = ['Cuochi', 'Banconisti', 'Camerieri', 'Responsabile', 'Dipendente'];
                 if (!validRoles.includes(point.assignedRole)) {
                   errors[`conservation_${index}_assigned`] = "Ruolo non valido - seleziona una categoria valida";
                 }
               }
               if (!point.selectedCategories || point.selectedCategories.length === 0) {
                 errors[`conservation_${index}_categories`] = "Categorie prodotti obbligatorie";
               } else {
                 // Controlla che le categorie selezionate siano valide
                 const validCategories = ['fresh_dairy', 'fresh_meat', 'fresh_fish', 'fresh_produce', 'fresh_fruits', 'frozen', 'deep_frozen', 'dry_goods', 'hot_holding', 'chilled_ready'];
                 point.selectedCategories.forEach(categoryId => {
                   if (!validCategories.includes(categoryId)) {
                     errors[`conservation_${index}_categories`] = "Categoria non valida - seleziona categorie valide";
                   }
                 });
               }
             });
             
             // Controlla che i nomi dei punti di conservazione siano unici
             const names = conservationPoints.map(point => point.name.toLowerCase().trim());
             const uniqueNames = new Set(names);
             if (names.length !== uniqueNames.size) {
               errors.conservationNames = "I nomi dei punti di conservazione devono essere unici";
             }
             
             // Controlla che i punti abbiano posizioni diverse (non tutti nello stesso reparto)
             const locations = conservationPoints.map(point => point.location);
             const uniqueLocations = new Set(locations);
             if (uniqueLocations.size < 2) {
               errors.conservationLocations = "I punti di conservazione devono essere distribuiti in almeno 2 reparti diversi";
             }
             
             // Controlla che i punti abbiano note o descrizioni
             const hasNotes = conservationPoints.some(point => point.notes || point.description);
             if (!hasNotes) {
               errors.conservationNotes = "Almeno un punto di conservazione deve avere note o descrizioni";
             }
           }
         }
    
             if (stepNumber === 4) { // Mansioni e Attività
           // TasksStep salva come { list: [...], count: number }
           const tasksList = data.tasks?.list || [];
           if (tasksList.length === 0) {
             errors.tasks = "Devi aggiungere almeno un'attività";
           } else {
             tasksList.forEach((task, index) => {
               if (!task.name?.trim()) {
                 errors[`task_${index}_name`] = "Nome attività obbligatorio";
               } else if (task.name.trim().length < 5) {
                 errors[`task_${index}_name`] = "Nome attività deve essere di almeno 5 caratteri";
               }
               if (!task.assignedTo) {
                 errors[`task_${index}_assigned`] = "Assegnazione obbligatoria";
               }
               if (!task.frequency) {
                 errors[`task_${index}_frequency`] = "Frequenza obbligatoria";
               } else {
                 // Controlla che la frequenza sia valida
                 const validFrequencies = ['Giornalmente', 'Settimanalmente', 'Mensilmente', 'Annualmente'];
                 if (!validFrequencies.includes(task.frequency)) {
                   errors[`task_${index}_frequency`] = "Frequenza non valida - seleziona una frequenza valida";
                 }
               }
             });
             
             // Controlla che ci siano abbastanza attività di monitoraggio temperature
             const conservationPoints = data.conservation?.points || [];
             const temperatureTasks = tasksList.filter(task => 
               task.name.toLowerCase().includes('rilevamento temperature')
             );
             
             if (temperatureTasks.length < conservationPoints.length) {
               errors.temperatureTasks = `Devi creare almeno ${conservationPoints.length} attività di monitoraggio temperature (una per ogni punto di conservazione)`;
             }
             
             // Controlla che le attività siano assegnate a membri dello staff validi
             const staffMembers = data.staff?.staffMembers || [];
             if (staffMembers.length === 0) {
               errors.staffRequired = "Devi prima configurare lo staff per assegnare le attività";
             } else {
               // Controlla che ogni attività sia assegnata a un membro dello staff valido
               tasksList.forEach((task, index) => {
                 const assignedMember = staffMembers.find(member => member.fullName === task.assignedTo);
                 if (!assignedMember) {
                   errors[`task_${index}_assigned`] = "Assegnazione non valida - seleziona un membro dello staff esistente";
                 }
               });
             }
             
             // Controlla che i nomi delle attività siano unici
             const names = tasksList.map(task => task.name.toLowerCase().trim());
             const uniqueNames = new Set(names);
             if (names.length !== uniqueNames.size) {
               errors.taskNames = "I nomi delle attività devono essere unici";
             }
             
             // Controlla che le attività abbiano frequenze diverse (non tutte giornaliere)
             const frequencies = tasksList.map(task => task.frequency);
             const uniqueFrequencies = new Set(frequencies);
             if (uniqueFrequencies.size < 2) {
               errors.taskFrequencies = "Le attività devono avere frequenze diverse per una gestione efficace";
             }
             
             // Controlla che le attività abbiano priorità o note
             const hasPriorities = tasksList.some(task => task.priority || task.notes);
             if (!hasPriorities) {
               errors.taskPriorities = "Almeno un'attività deve avere una priorità o note";
             }
           }
         }
    
             if (stepNumber === 5) { // Inventario Prodotti
           // InventoryStep salva come { products: [...], count: number }
           const productsList = data.inventory?.products || [];
           if (productsList.length === 0) {
             errors.inventory = "Devi aggiungere almeno un prodotto";
           } else {
             productsList.forEach((product, index) => {
               if (!product.name?.trim()) {
                 errors[`product_${index}_name`] = "Nome prodotto obbligatorio";
               } else if (product.name.trim().length < 2) {
                 errors[`product_${index}_name`] = "Nome prodotto deve essere di almeno 2 caratteri";
               }
               if (!product.type) {
                 errors[`product_${index}_type`] = "Tipologia obbligatoria";
               } else {
                 // Controlla che il tipo di prodotto sia valido
                 const validTypes = ['Latticini e Formaggi', 'Carni Fresche', 'Pesce e Frutti di Mare', 'Verdure e Ortaggi', 'Frutta', 'Prodotti da Forno', 'Bevande', 'Altro'];
                 if (!validTypes.includes(product.type)) {
                   errors[`product_${index}_type`] = "Tipologia non valida - seleziona una tipologia valida";
                 }
               }
               if (!product.expiryDate) {
                 errors[`product_${index}_expiry`] = "Data scadenza obbligatoria";
               } else {
                 // Controlla che la data di scadenza sia nel futuro
                 const expiryDate = new Date(product.expiryDate);
                 const today = new Date();
                 today.setHours(0, 0, 0, 0);
                 if (expiryDate < today) {
                   errors[`product_${index}_expiry`] = "La data di scadenza deve essere nel futuro";
                 }
               }
               if (!product.position) {
                 errors[`product_${index}_position`] = "Posizione obbligatoria";
               }
             });
             
             // Controlla che i prodotti siano assegnati a punti di conservazione validi
             const conservationPoints = data.conservation?.points || [];
             if (conservationPoints.length === 0) {
               errors.conservationRequired = "Devi prima configurare i punti di conservazione per assegnare i prodotti";
             } else {
               // Controlla che ogni prodotto sia assegnato a un punto di conservazione valido
               productsList.forEach((product, index) => {
                 const position = conservationPoints.find(point => point.id === parseInt(product.position));
                 if (!position) {
                   errors[`product_${index}_position`] = "Posizione non valida - seleziona un punto di conservazione esistente";
                 }
               });
             }
             
             // Controlla che i nomi dei prodotti siano unici
             const names = productsList.map(product => product.name.toLowerCase().trim());
             const uniqueNames = new Set(names);
             if (names.length !== uniqueNames.size) {
               errors.productNames = "I nomi dei prodotti devono essere unici";
             }
             
             // Controlla che i prodotti abbiano tipi diversi (non tutti dello stesso tipo)
             const types = productsList.map(product => product.type);
             const uniqueTypes = new Set(types);
             if (uniqueTypes.size < 2) {
               errors.productTypes = "I prodotti devono avere tipi diversi per una gestione efficace";
             }
             
             // Controlla che i prodotti abbiano note o descrizioni
             const hasNotes = productsList.some(product => product.notes || product.description);
             if (!hasNotes) {
               errors.productNotes = "Almeno un prodotto deve avere note o descrizioni";
             }
           }
         }
    
    return errors;
  };

  // Controlla se uno step è valido per abilitare "Avanti"
  const isStepValid = (stepNumber) => {
    const errors = validateStep(stepNumber, formData);
    return Object.keys(errors).length === 0;
  };

  // Controlla se uno step è valido per abilitare "Conferma Dati"
  const canConfirmStep = (stepNumber) => {
    const errors = validateStep(stepNumber, formData);
    return Object.keys(errors).length === 0;
  };

  // Controlla se uno step è confermato
  const isStepConfirmed = (stepNumber) => {
    return confirmedSteps.has(stepNumber);
  };

  // Conferma uno step (chiamato dai componenti figli)
  const confirmStep = (stepNumber) => {
    console.log(`🔍 confirmStep chiamato per step ${stepNumber}`);
    console.log(`🔍 Stato prima: currentStep=${currentStep}, confirmedSteps=${Array.from(confirmedSteps)}`);
    
    if (isStepValid(stepNumber)) {
      console.log(`✅ Step ${stepNumber} valido, marcando come confermato`);
      setConfirmedSteps(prev => new Set([...prev, stepNumber]));
      // NON aggiungiamo a completedSteps qui - solo quando si naviga
      console.log(`✅ Step ${stepNumber} confermato con successo`);
      return true; // Step confermato con successo
    } else {
      console.log(`❌ Step ${stepNumber} non valido`);
      return false; // Step non valido
    }
  };

  // Marca uno step come non confermato (quando viene modificato)
  const markStepAsUnconfirmed = (stepNumber) => {
    setConfirmedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepNumber);
      return newSet;
    });
  };

  // Salva progresso
  const saveProgress = () => {
    const progress = {
      currentStep,
      completedSteps: Array.from(completedSteps),
      confirmedSteps: Array.from(confirmedSteps),
      formData,
      lastActivity: new Date().toISOString()
    };
    localStorage.setItem('haccp-onboarding-new', JSON.stringify(progress));
  };

  // Avanza al prossimo step
  const nextStep = () => {
    console.log(`🔍 nextStep chiamato`);
    console.log(`🔍 Stato: currentStep=${currentStep}, isStepConfirmed=${isStepConfirmed(currentStep)}`);
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      // Controlla che lo step corrente sia confermato
      if (isStepConfirmed(currentStep)) {
        console.log(`✅ Step ${currentStep} confermato, navigando al prossimo`);
        // Aggiungi lo step corrente a completedSteps quando si naviga
        setCompletedSteps(prev => new Set([...prev, ONBOARDING_STEPS[currentStep].id]));
        setCurrentStepWithLogging(currentStep + 1);
        saveProgress();
        console.log(`✅ Navigazione completata a step ${currentStep + 1}`);
      } else {
        console.log(`❌ Step ${currentStep} non confermato, navigazione bloccata`);
      }
    } else {
      console.log(`❌ Ultimo step raggiunto, navigazione non possibile`);
    }
  };

  // Torna allo step precedente
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStepWithLogging(currentStep - 1);
      saveProgress();
    }
  };

  // Completa l'onboarding
  const completeOnboarding = () => {
    setCompletedSteps(prev => new Set([...prev, ONBOARDING_STEPS[currentStep].id]));
    saveProgress();
    onComplete && onComplete(formData);
  };

  // Controlla se l'onboarding è bypassato in modalità dev
  React.useEffect(() => {
    const savedProgress = localStorage.getItem('haccp-onboarding-new');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setCurrentStepWithLogging(progress.currentStep || 0);
        setCompletedSteps(new Set(progress.completedSteps || []));
        setConfirmedSteps(new Set(progress.confirmedSteps || []));
        setFormData(progress.formData || formData);
      } catch (error) {
        console.warn('Errore nel caricamento progresso onboarding:', error);
      }
    }
  }, []);

  if (!isOpen) return null;

  const CurrentStepComponent = ONBOARDING_STEPS[currentStep].component;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Configurazione Iniziale HACCP</h2>
            <Button variant="outline" onClick={onClose}>
              Chiudi
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progresso: {Math.round((completedSteps.size / ONBOARDING_STEPS.length) * 100)}%</span>
              <span>Step {currentStep + 1} di {ONBOARDING_STEPS.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSteps.size / ONBOARDING_STEPS.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {index > 0 && <div className="w-8 h-px bg-gray-300 mx-2"></div>}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  completedSteps.has(step.id) 
                    ? 'bg-green-500 text-white' 
                    : index === currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {completedSteps.has(step.id) ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <CurrentStepComponent 
            formData={formData} 
            setFormData={setFormData}
            currentStep={currentStep}
            setCurrentStep={setCurrentStepWithLogging}
            onComplete={onComplete}
            validateStep={validateStep}
            confirmStep={confirmStep}
            markStepAsUnconfirmed={markStepAsUnconfirmed}
            isStepConfirmed={isStepConfirmed}
            canConfirmStep={canConfirmStep}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Precedente
          </Button>
          
          <div className="flex gap-2">
            {!isLastStep ? (
              <Button 
                onClick={nextStep}
                disabled={!isStepConfirmed(currentStep)}
                className={isStepConfirmed(currentStep) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}
              >
                Avanti
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={completeOnboarding} 
                disabled={!isStepConfirmed(currentStep)}
                className={isStepConfirmed(currentStep) ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Completa Configurazione
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingWizard;
