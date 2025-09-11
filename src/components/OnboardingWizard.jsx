import React, { useState } from 'react';
import { Button } from './ui/Button';
import StepNavigator from './StepNavigator';
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
import { CONSERVATION_POINT_RULES } from '../utils/haccpRules';

// Funzione per validare la conformità HACCP
const validateHACCPCompliance = (targetTemp, selectedCategories) => {
  const temp = parseFloat(targetTemp);
  
  if (isNaN(temp)) return { compliant: false, message: 'Temperatura non valida' };
  
  if (selectedCategories.length > 0) {
    const tolerance = CONSERVATION_POINT_RULES.tolerance;
    let hasIncompatibleCategories = false;
    
    // Controlla incompatibilità tra categorie
    for (let i = 0; i < selectedCategories.length; i++) {
      for (let j = i + 1; j < selectedCategories.length; j++) {
        const category1 = CONSERVATION_POINT_RULES.categories.find(c => c.id === selectedCategories[i]);
        const category2 = CONSERVATION_POINT_RULES.categories.find(c => c.id === selectedCategories[j]);
        
        if (category1 && category2) {
          const range1Min = category1.minTemp - tolerance;
          const range1Max = category1.maxTemp + tolerance;
          const range2Min = category2.minTemp - tolerance;
          const range2Max = category2.maxTemp + tolerance;
          
          if (range1Max < range2Min || range2Max < range1Min) {
            hasIncompatibleCategories = true;
            break;
          }
        }
      }
      if (hasIncompatibleCategories) break;
    }
    
    if (hasIncompatibleCategories) {
      return { 
        compliant: false, 
        message: 'Categorie incompatibili selezionate'
      };
    }
    
    // Controlla se la temperatura è nel range di TUTTE le categorie selezionate
    let isInRange = true;
    let isInToleranceRange = true;
    
    for (const categoryId of selectedCategories) {
      const category = CONSERVATION_POINT_RULES.categories.find(c => c.id === categoryId);
      if (category) {
        // Controlla se la temperatura è nel range di questa categoria
        const categoryInRange = temp >= category.minTemp && temp <= category.maxTemp;
        const categoryMin = category.minTemp - tolerance;
        const categoryMax = category.maxTemp + tolerance;
        const categoryInToleranceRange = temp >= categoryMin && temp <= categoryMax;
        
        // Se anche una categoria non è soddisfatta, l'intera validazione fallisce
        if (!categoryInRange) {
          isInRange = false;
        }
        if (!categoryInToleranceRange) {
          isInToleranceRange = false;
        }
      }
    }
    
    if (isInRange) {
      return { compliant: true, message: 'Conforme HACCP' };
    } else if (isInToleranceRange) {
      return { 
        compliant: true, 
        message: `Temperatura impostata entro i limiti accettabili (0,5°C di differenza)`
      };
    } else {
      return { 
        compliant: false, 
        message: 'Fuori range HACCP per le categorie selezionate'
      };
    }
  }
  
  return { compliant: true, message: 'Conforme HACCP' };
};

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
       if (!data.business?.companyName?.trim()) {
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
       if (data.business?.companyName?.trim() && data.business.companyName.trim().length < 3) {
         errors.businessName = "Il nome attività deve essere di almeno 3 caratteri";
       }
       
       // Controlla che l'indirizzo non sia troppo corto
       if (data.business?.address?.trim() && data.business.address.trim().length < 10) {
         errors.address = "L'indirizzo deve essere di almeno 10 caratteri";
       }
       
       // Controlla che il nome dell'attività sia unico (non duplicato)
       if (data.business?.companyName?.trim()) {
         const businessName = data.business.companyName.trim().toLowerCase();
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
      if (enabledDepartments.length < 1) {
        errors.departments = "Devi attivare almeno 1 reparto per procedere";
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
           // Controlla le categorie (ora array)
           const memberCategories = member.categories && member.categories.length > 0 ? member.categories : (member.category ? [member.category] : []);
           if (memberCategories.length === 0) {
             errors[`staff_${index}_category`] = "Categoria obbligatoria";
           } else {
             // Controlla che le categorie siano valide
             const validCategories = ['Cuochi', 'Banconisti', 'Camerieri', 'Social & Media Manager', 'Amministratore', 'Altro'];
             memberCategories.forEach(category => {
               if (!validCategories.includes(category)) {
                 errors[`staff_${index}_category`] = "Categoria non valida - seleziona una categoria valida";
               }
             });
           }
           
           // RIMOSSO: Controllo compatibilità ruolo-categoria - L'amministratore può scegliere qualsiasi categoria
           
           // RIMOSSO: Controllo HACCP - La scadenza attestato HACCP è FACOLTATIVA per tutte le categorie
           // console.log(`🔍 Validazione membro ${index}:`, {
           //   category: member.category,
           //   requiresHaccp,
           //   haccpExpiry: member.haccpExpiry,
           //   hasHaccpExpiry: member.haccpExpiry && member.haccpExpiry.trim() !== ''
           // });
           
           // RIMOSSO: Controllo HACCP - Non più obbligatorio per nessuna categoria
           // if (requiresHaccp && (!member.haccpExpiry || member.haccpExpiry.trim() === '')) {
           //   errors[`staff_${index}_haccp`] = "Scadenza attestato HACCP obbligatoria per questa categoria";
           // }
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
           console.log('🔍 OnboardingWizard: Validating step 3 (Conservation)');
           console.log('🔍 OnboardingWizard: data.conservation:', data.conservation);
           console.log('🔍 OnboardingWizard: conservationPoints:', conservationPoints);
           if (conservationPoints.length === 0) {
             console.log('❌ OnboardingWizard: No conservation points found, adding error');
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
               if (!point.targetTemp) {
                 errors[`conservation_${index}_temperature`] = "Temperatura target obbligatoria";
               } else {
                 const temp = parseFloat(point.targetTemp);
                 if (isNaN(temp)) {
                   errors[`conservation_${index}_temperature`] = "Temperatura non valida";
                 }
               }
               if (!point.selectedCategories || point.selectedCategories.length === 0) {
                 errors[`conservation_${index}_categories`] = "Categorie prodotti obbligatorie";
               } else {
                 // Controlla che le categorie selezionate siano valide
                 const validCategories = ['fresh_dairy', 'fresh_meat', 'fresh_fish', 'fresh_produce', 'fresh_fruits', 'frozen', 'deep_frozen', 'dry_goods', 'hot_holding', 'chilled_ready', 'fresh_beverages'];
                 point.selectedCategories.forEach(categoryId => {
                   if (!validCategories.includes(categoryId)) {
                     errors[`conservation_${index}_categories`] = "Categoria non valida - seleziona categorie valide";
                   }
                 });
                 
                 // Validazione HACCP: controlla conformità temperatura e categorie per TUTTE le categorie
                 if (point.targetTemp && point.selectedCategories.length > 0) {
                   const haccpValidation = validateHACCPCompliance(point.targetTemp, point.selectedCategories);
                   if (!haccpValidation.compliant) {
                     errors[`conservation_${index}_haccp`] = `Non conforme HACCP: ${haccpValidation.message}. La temperatura deve essere compatibile con TUTTE le categorie selezionate.`;
                   }
                 }
               }
             });
             
             // Controlla che i nomi dei punti di conservazione siano unici
             const names = conservationPoints.map(point => point.name.toLowerCase().trim());
             const uniqueNames = new Set(names);
             if (names.length !== uniqueNames.size) {
               errors.conservationNames = "I nomi dei punti di conservazione devono essere unici";
             }
             
             // Requisito distribuzione in reparti diversi rimosso - non più obbligatorio
             
             // Requisito delle note rimosso - non più obbligatorio
           }
         }
    
            if (stepNumber === 4) { // Mansioni e Attività
          // TasksStep salva come { list: [...], count: number } + savedMaintenances
          const tasksList = data.tasks?.list || [];
          const savedMaintenances = data.savedMaintenances || [];
          const maintenanceTasksCount = savedMaintenances.reduce((total, group) => total + group.tasks.length, 0);
           
           const totalTasks = tasksList.length + maintenanceTasksCount;
           
           if (totalTasks === 0) {
             errors.tasks = "Devi aggiungere almeno un'attività o configurare le manutenzioni";
           } else {
             tasksList.forEach((task, index) => {
               if (!task.name?.trim()) {
                 errors[`task_${index}_name`] = "Nome attività obbligatorio";
               } else if (task.name.trim().length < 5) {
                 errors[`task_${index}_name`] = "Nome attività deve essere di almeno 5 caratteri";
               }
               if (!task.assignedRole) {
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
             const temperatureTasks = tasksList.filter(task => {
               const taskName = task.name.toLowerCase();
               return taskName.includes('rilevamento temperature') || 
                      taskName.includes('rilevamento temperatura') ||
                      taskName.includes('temperature') ||
                      taskName.includes('temperatura') ||
                      taskName.includes('monitoraggio');
             });
             
             // Conta anche le manutenzioni di monitoraggio temperature
             const temperatureMaintenances = savedMaintenances.flatMap(group => group.tasks).filter(task => 
               task.task_type === 'temperature_monitoring'
             );
             
             const totalTemperatureTasks = temperatureTasks.length + temperatureMaintenances.length;
             
             if (totalTemperatureTasks < conservationPoints.length) {
               errors.temperatureTasks = `Devi creare almeno ${conservationPoints.length} attività di monitoraggio temperature (una per ogni punto di conservazione)`;
             }
             
             // Controllo assegnazione a membri dello staff rimosso - non più obbligatorio
             
             // Controlla che i nomi delle attività siano unici (considerando anche le manutenzioni)
             const taskNames = tasksList.map(task => task.name.toLowerCase().trim());
             const maintenanceNames = savedMaintenances.flatMap(group => group.tasks).map(task => 
               task.task_name ? task.task_name.toLowerCase().trim() : ''
             ).filter(name => name);
             const allNames = [...taskNames, ...maintenanceNames];
             const uniqueNames = new Set(allNames);
             if (allNames.length !== uniqueNames.size) {
               errors.taskNames = "I nomi delle attività devono essere unici";
             }
             
             // Controllo frequenze diverse rimosso - non più obbligatorio
             
             // Controllo priorità o note rimosso - non più obbligatorio
           }
         }
    
             if (stepNumber === 5) { // Inventario Prodotti
           // InventoryStep salva come { products: [...], count: number }
           const productsList = data.products?.productsList || data.inventory?.products || [];
           console.log('🔍 OnboardingWizard: Validating step 5 (Inventory)');
           console.log('🔍 OnboardingWizard: data.products:', data.products);
           console.log('🔍 OnboardingWizard: productsList:', productsList);
           if (productsList.length === 0) {
             console.log('❌ OnboardingWizard: No products found, adding error');
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
                 const position = conservationPoints.find(point => 
                   point.id === parseInt(product.position) || point.name === product.position
                 );
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
             
             // Controllo tipi diversi rimosso - non più obbligatorio
             
             // Controllo note o descrizioni rimosso - non più obbligatorio
           }
         }
    
    return errors;
  };

  // Controlla se uno step è valido per abilitare "Avanti"
  const isStepValid = (stepNumber) => {
    const errors = validateStep(stepNumber, formData);
    const isValid = Object.keys(errors).length === 0;
    
    // Debug specifico per step 3 (Punti di Conservazione)
    if (stepNumber === 3) {
      console.log(`🔍 DEBUG PULSANTE AVANTI - Step 3 (Punti di Conservazione):`);
      console.log(`🔍 errors:`, errors);
      console.log(`🔍 errors.length:`, Object.keys(errors).length);
      console.log(`🔍 isValid:`, isValid);
      console.log(`🔍 formData.conservation:`, formData.conservation);
      console.log(`🔍 conservation.points:`, formData.conservation?.points);
      console.log(`🔍 conservation.count:`, formData.conservation?.count);
      
      // Mostra dettagli degli errori
      if (Object.keys(errors).length > 0) {
        console.log(`❌ ERRORI DETTAGLIATI:`);
        Object.entries(errors).forEach(([key, value]) => {
          console.log(`❌ ${key}: ${value}`);
        });
        
        // Debug specifico per categorie
        if (formData.conservation?.points?.[0]) {
          const point = formData.conservation.points[0];
          console.log(`🔍 PUNTO DI CONSERVAZIONE DETTAGLIATO:`);
          console.log(`🔍 point.name:`, point.name);
          console.log(`🔍 point.location:`, point.location);
          console.log(`🔍 point.targetTemp:`, point.targetTemp);
          console.log(`🔍 point.selectedCategories:`, point.selectedCategories);
          console.log(`🔍 point.selectedCategories type:`, typeof point.selectedCategories);
          console.log(`🔍 point.selectedCategories length:`, point.selectedCategories?.length);
          
          // Debug categorie valide
          const validCategories = ['fresh_dairy', 'fresh_meat', 'fresh_fish', 'fresh_produce', 'fresh_fruits', 'frozen', 'deep_frozen', 'dry_goods', 'hot_holding', 'chilled_ready', 'fresh_beverages'];
          console.log(`🔍 CATEGORIE VALIDE:`, validCategories);
          console.log(`🔍 CATEGORIE SELEZIONATE:`, point.selectedCategories);
          
          // Controlla ogni categoria selezionata
          point.selectedCategories.forEach((categoryId, index) => {
            const isValid = validCategories.includes(categoryId);
            console.log(`🔍 Categoria ${index}: "${categoryId}" - ${isValid ? 'VALIDA' : 'NON VALIDA'}`);
          });
        }
      }
    }
    
    return isValid;
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

  // Naviga a uno step specifico
  const goToStep = (stepIndex) => {
    console.log(`🔍 goToStep chiamato per step ${stepIndex}`);
    
    if (stepIndex >= 0 && stepIndex < ONBOARDING_STEPS.length) {
      setCurrentStepWithLogging(stepIndex);
      saveProgress();
      console.log(`✅ Navigazione diretta completata a step ${stepIndex + 1}`);
    } else {
      console.log(`❌ Step ${stepIndex} non valido`);
    }
  };

  // Avanza al prossimo step con validazione al click
  const nextStep = () => {
    console.log(`🔍 nextStep chiamato`);
    console.log(`🔍 Stato: currentStep=${currentStep}`);
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      // Valida lo step corrente
      const errors = validateStep(currentStep, formData);
      
      if (Object.keys(errors).length === 0) {
        console.log(`✅ Step ${currentStep} valido, navigando al prossimo`);
        // Aggiungi lo step corrente a completedSteps quando si naviga
        setCompletedSteps(prev => new Set([...prev, ONBOARDING_STEPS[currentStep].id]));
        // Marca lo step come confermato quando si naviga
        setConfirmedSteps(prev => new Set([...prev, currentStep]));
        setCurrentStepWithLogging(currentStep + 1);
        saveProgress();
        console.log(`✅ Navigazione completata a step ${currentStep + 1}`);
      } else {
        console.log(`❌ Step ${currentStep} non valido:`, errors);
        console.log(`❌ Errori dettagliati:`, Object.entries(errors).map(([key, value]) => `${key}: ${value}`));
        console.log(`❌ Errori completi:`, errors);
        console.log(`🔍 FormData per step ${currentStep}:`, formData);
        
        // Debug specifico per step 3 (Punti di Conservazione)
        if (currentStep === 3) {
          console.log(`🔍 DEBUG STEP 3 (Punti di Conservazione):`);
          console.log(`🔍 data.conservation:`, formData.conservation);
          console.log(`🔍 conservation.points:`, formData.conservation?.points);
          console.log(`🔍 conservation.count:`, formData.conservation?.count);
        }
        
        // Mostra errori all'utente
        alert(`Ci sono errori di validazione:\n${Object.values(errors).join('\n')}`);
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

  // Completa l'onboarding con validazione
  const completeOnboarding = () => {
    // Valida l'ultimo step
    const errors = validateStep(currentStep, formData);
    
    if (Object.keys(errors).length === 0) {
      console.log(`✅ Ultimo step valido, completando onboarding`);
      setCompletedSteps(prev => new Set([...prev, ONBOARDING_STEPS[currentStep].id]));
      saveProgress();
      onComplete && onComplete(formData);
    } else {
      console.log(`❌ Ultimo step non valido:`, errors);
      // Mostra errori all'utente
      alert(`Ci sono errori di validazione:\n${Object.values(errors).join('\n')}`);
    }
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
          
          {/* Step Navigation */}
          <div className="mt-4">
            <StepNavigator
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={goToStep}
              steps={ONBOARDING_STEPS}
            />
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
                disabled={!isStepValid(currentStep)}
                className={`${isStepValid(currentStep) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                Avanti
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={completeOnboarding} 
                className="bg-green-600 hover:bg-green-700"
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
