# Esempi di Utilizzo - Sistema Reparti Business HACCP Manager

## 🏪 Scenari d'Uso Reali per Ristoranti

### Scenario 1: Pizzeria con 3 Reparti
```javascript
// Configurazione reparti
const pizzeriaReparti = [
  {
    id: "banconisti",
    name: "Banconisti", 
    description: "Gestione ordini e servizio al tavolo"
  },
  {
    id: "cuochi", 
    name: "Pizzaioli",
    description: "Preparazione pizze e forno"
  },
  {
    id: "dept_1640995200000",
    name: "Pasticceria",
    description: "Dessert e dolci della casa",
    isCustom: true
  }
]

// Attività di pulizia assegnate
const pizzeriaAttivita = [
  {
    id: 1640995200001,
    task: "Pulizia forno a legna",
    departmentId: "cuochi",
    departmentName: "Pizzaioli",
    completed: false
  },
  {
    id: 1640995200002, 
    task: "Sanificazione bancone servizio",
    departmentId: "banconisti",
    departmentName: "Banconisti",
    completed: true
  }
]
```

### Scenario 2: Ristorante Fine Dining
```javascript
// Reparti specializzati
const fineDiningReparti = [
  {
    id: "cuochi",
    name: "Brigade di Cucina",
    description: "Chef, sous chef, commis"
  },
  {
    id: "banconisti", 
    name: "Sala",
    description: "Maitre, camerieri, sommelier"
  },
  {
    id: "dept_1640995300000",
    name: "Garde Manger", 
    description: "Preparazioni fredde e antipasti",
    isCustom: true
  },
  {
    id: "dept_1640995300001",
    name: "Pasticceria",
    description: "Dessert e petit fours", 
    isCustom: true
  }
]
```

### Scenario 3: Bar/Caffetteria
```javascript
// Setup semplificato
const barReparti = [
  {
    id: "banconisti",
    name: "Baristi",
    description: "Caffetteria e servizio bancone" 
  },
  {
    id: "dept_1640995400000",
    name: "Cucina Express",
    description: "Panini e piatti veloci",
    isCustom: true
  }
]
```

## 🔄 Flussi di Lavoro Tipici

### 1. Setup Iniziale Ristorante
```jsx
// 1. Amministratore accede alla gestione reparti
<DepartmentManager />

// 2. Configura reparti personalizzati
// - Vai a tab "Gestione Reparti"
// - Aggiungi reparto "Pasticceria" 
// - Aggiungi reparto "Garde Manger"

// 3. Passa alla gestione pulizia
// - Vai a tab "Pulizia Reparti"
// - Assegna attività ai vari reparti
```

### 2. Assegnazione Attività Giornaliera
```jsx
// Manager assign task for each department
const dailyTasks = [
  {
    task: "Pulizia frigorifero",
    departmentId: "cuochi"
  },
  {
    task: "Sanificazione macchina caffè", 
    departmentId: "banconisti"
  },
  {
    task: "Pulizia vetrina dolci",
    departmentId: "dept_pasticceria"
  }
]
```

### 3. Completamento Task da Reparto
```jsx
// Membri del reparto possono completare task assegnati
function completaTask(taskId) {
  // Task completato da qualsiasi membro del reparto cuochi
  toggleTaskCompletion(taskId)
  // Automaticamente tracciato come completato con timestamp
}
```

## 📊 Dashboard e Monitoraggio

### Metriche Chiave per Manager
```javascript
// Statistiche che il sistema calcola automaticamente
const statistics = {
  repartiTotali: 5,
  repartiPersonalizzati: 2, 
  attivitaTotali: 12,
  attivitaInSospeso: 3,
  
  // Per reparto
  repartStats: {
    "cuochi": {
      total: 5,
      pending: 2, 
      completed: 3,
      completionRate: 60
    },
    "banconisti": {
      total: 4,
      pending: 1,
      completed: 3, 
      completionRate: 75
    }
  }
}
```

### Alerts e Notifiche
```javascript
// Situazioni che richiedono attenzione
const alerts = [
  {
    type: "reparto_eliminato",
    message: "Attenzione: ci sono 3 attività assegnate al reparto eliminato",
    action: "Riassegna attività ad altro reparto"
  },
  {
    type: "basso_completamento", 
    department: "cuochi",
    rate: 40,
    message: "Reparto Cuochi ha basso tasso completamento (40%)"
  }
]
```

## 🎯 Best Practices per Ristoranti

### Naming Convention Reparti
```javascript
// ✅ Buone pratiche
const goodNames = [
  "Cucina Calda",
  "Cucina Fredda", 
  "Sala Pranzo",
  "Bar/Caffetteria",
  "Pasticceria",
  "Garde Manger",
  "Dishwashing"
]

// ❌ Da evitare
const badNames = [
  "Mario e Giuseppe", // troppo specifico
  "Reparto 1",        // non descrittivo
  "Vari",             // generico
]
```

### Descrizioni Efficaci
```javascript
const descriptions = {
  "Cucina Calda": "Preparazione primi, secondi, cotture principali",
  "Garde Manger": "Antipasti, insalate, preparazioni fredde", 
  "Pasticceria": "Dolci, dessert, preparazioni da forno",
  "Sala": "Servizio clienti, mise en place, pulizia tavoli"
}
```

### Task Assignment Strategy
```javascript
// Distribuzione bilanciata
const taskDistribution = {
  "cuochi": [
    "Pulizia piani cottura",
    "Sanificazione frigoriferi", 
    "Pulizia cappa aspirazione"
  ],
  "banconisti": [
    "Pulizia macchina caffè",
    "Sanificazione bancone",
    "Pulizia vetrine"
  ],
  "pasticceria": [
    "Pulizia impastatrice",
    "Sanificazione banco dolci",
    "Pulizia forno pasticceria"
  ]
}
```

## 🧪 Scenari di Test

### Test 1: Creazione Reparto Personalizzato
1. Apri DepartmentManager
2. Tab "Gestione Reparti" 
3. Compila form: Nome="Rosticceria", Descrizione="Preparazioni da asporto"
4. Clicca "Aggiungi Reparto"
5. Verifica: Reparto appare in lista con badge "Personalizzato"

### Test 2: Assegnazione Task
1. Tab "Pulizia Reparti"
2. Compila: Task="Pulizia vitrina", Reparto="Rosticceria"  
3. Clicca "Aggiungi Attività"
4. Verifica: Task appare in "Attività in Sospeso" con icona reparto

### Test 3: Statistiche Aggiornate
1. Completa alcuni task
2. Verifica aggiornamento contatori in tempo reale
3. Controlla "Statistiche per Reparto" 
4. Verifica percentuali completamento corrette

## 🔧 Troubleshooting Comune

### Problema: Reparto Non Eliminabile
```javascript
// Causa: Tentativo eliminazione reparto predefinito
if (!department.isCustom) {
  alert('Non puoi eliminare i reparti predefiniti del sistema.')
  return
}
```

### Problema: Nome Reparto Duplicato
```javascript
// Soluzione: Validazione nomi unici
const nameExists = departments.some(dept => 
  dept.name.toLowerCase() === formData.name.trim().toLowerCase()
)
if (nameExists) {
  alert('Esiste già un reparto con questo nome.')
  return  
}
```

### Problema: Task Orfani
```javascript
// Quando si elimina reparto con task assegnati
const orphanedTasks = cleaningTasks.filter(task => task.departmentId === id)
if (orphanedTasks.length > 0) {
  alert(`Attenzione: ci sono ${orphanedTasks.length} attività da riassegnare`)
}
```

## 🚀 Integrazione con App Esistente

### Modifica App.jsx per Test
```jsx
// Temporaneamente per testare
import DepartmentManager from './components/DepartmentManager'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DepartmentManager />
    </div>
  )
}
```

### Integrazione in Dashboard Esistente
```jsx
// Aggiungere come nuovo modulo
import DepartmentManager from './components/DepartmentManager'

function Dashboard() {
  const [activeModule, setActiveModule] = useState('overview')
  
  return (
    <div>
      {activeModule === 'departments' && <DepartmentManager />}
      {/* Altri moduli... */}
    </div>
  )
}
```

---

**Business HACCP Manager** - Esempi pratici per ristoranti professionali 🇮🇹