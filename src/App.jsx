/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo è il COMPONENTE PRINCIPALE dell'applicazione HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo file gestisce tutti i moduli critici HACCP
 * ⚠️ Coordina workflow di sicurezza alimentare e compliance
 * 
 * @fileoverview Componente Principale HACCP - Sistema Critico di Sicurezza
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Coordinamento Moduli
 * @version 1.1 - Aggiornato con nomenclatura HACCP italiana
 * 
 * STRUTTURA SEZIONI (Glossario HACCP):
 * - Home (ex Dashboard) – overview e statistiche
 * - Punti di Conservazione (ex Frigoriferi) – gestione frigoriferi/freezer
 * - Attività e Mansioni (ex Cleaning/Tasks) – mansioni staff e checklist
 * - Inventario (ex Inventory) – prodotti e stock
 * - Gestione Etichette (ex Product Labels) – creazione/modifica etichette
 * - IA Assistant (ex AI Assistant) – assistente IA
 * - Impostazioni e Dati (ex Settings/Data) – configurazioni, backup, manuale HACCP
 */

import React, { useState, useEffect } from 'react'
import { BarChart3, Thermometer, Sparkles, Users, Package, Download, Upload, LogIn, LogOut, Settings, QrCode, Bot, RotateCcw } from 'lucide-react'
import Dashboard from './components/Dashboard'
import Cleaning from './components/Cleaning'
import PuntidiConservazione from './components/PuntidiConservazione'
import Gestione from './components/Gestione'
import Inventory from './components/Inventory'
import ProductLabels from './components/ProductLabels'
import AIAssistant from './components/AIAssistant'
import AIAssistantSection from './components/AIAssistantSection'
import ExpiryAlertAutomation from './components/automations/ExpiryAlertAutomation'
import StorageManager from './components/StorageManager'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import SyncManager from './components/SyncManager'
import DataSettings from './components/DataSettings'

import Login from './components/Login'
import PDFExport from './components/PDFExport'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card'
import { Button } from './components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs'
import { initializeDataSchemas, initializeDevModeIfRequested } from './utils/dataSchemas'
import DevModeBanner from './components/DevModeBanner'
import OnboardingWizard from './components/OnboardingWizard'
import BottomSheetGuide from './components/BottomSheetGuide'
import HeaderButtons from './components/HeaderButtons'
import DevButtons from './components/DevButtons'
import DataButtons from './components/DataButtons'
import { shouldBypassOnboarding } from './utils/devMode'
// import { useHaccpValidation } from './utils/useHaccpValidation' // TEMPORANEAMENTE DISABILITATO

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [temperatures, setTemperatures] = useState([])
  const [cleaning, setCleaning] = useState([])
  const [refrigerators, setRefrigerators] = useState([])
  const [staff, setStaff] = useState([])
  const [products, setProducts] = useState([])
  const [departments, setDepartments] = useState([])
  const [productLabels, setProductLabels] = useState([])
  // Sistema utenti e login
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  // Gestione visibilità chat IA
  const [showChatIcon, setShowChatIcon] = useState(true)
  
  // Sistema notifiche per le sezioni
  const [lastCheck, setLastCheck] = useState(() => {
    const saved = localStorage.getItem('haccp-last-check')
    return saved ? JSON.parse(saved) : {}
  })

  // Sistema sincronizzazione cloud
  const [pendingChanges, setPendingChanges] = useState([])
  const [lastSyncTime, setLastSyncTime] = useState(() => {
    return localStorage.getItem('haccp-last-sync') || null
  })
  const [companyId, setCompanyId] = useState(() => {
    return localStorage.getItem('haccp-company-id') || 'demo-pizzeria'
  })

  // Sistema onboarding
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [showBottomSheet, setShowBottomSheet] = useState(false)

  // Dati dell'applicazione per validazione HACCP
  const [appData, setAppData] = useState({
    users: [],
    departments: [],
    refrigerators: [],
    staff: [],
    cleaning: [],
    inventory: []
  })

  // Hook per validazione HACCP - TEMPORANEAMENTE DISABILITATO
  // const validation = useHaccpValidation(appData, activeTab)
  const validation = {
    isOnboardingComplete: true,
    currentSectionAccess: { isEnabled: true, message: null },
    missingRequirements: [],
    onboardingProgress: 100,
    // Funzioni mock per evitare errori
    canAccessSection: () => ({ isEnabled: true, message: null }),
    areRequirementsMet: () => true,
    getMissingRequirements: () => [],
    getNextOnboardingStep: () => null,
    getOnboardingProgress: () => 100,
    validateField: () => null,
    getEducationalMessage: () => '',
    getSuggestions: () => [],
    validateConservationPoint: () => ({ isValid: true, errors: [], warnings: [] }),
    getEducationalMessages: () => [],
    onboardingStatus: { isComplete: true, progress: 100, nextStep: null },
    sectionAccess: { isEnabled: true, message: null }
  }

  // Carica i dati dell'applicazione per validazione HACCP
  const loadAppData = () => {
    const users = JSON.parse(localStorage.getItem('haccp-users') || '[]')
    let departments = []
    const refrigerators = JSON.parse(localStorage.getItem('haccp-refrigerators') || '[]')
    const staff = JSON.parse(localStorage.getItem('haccp-staff') || '[]')
    const cleaning = JSON.parse(localStorage.getItem('haccp-cleaning') || '[]')
    const inventory = JSON.parse(localStorage.getItem('haccp-products') || '[]')
    
    // Carica departments con gestione errori
    try {
      departments = JSON.parse(localStorage.getItem('haccp-departments') || '[]')
    } catch (error) {
      console.warn('Errore nel parsing departments:', error)
      departments = []
    }
    
    // Controlla se i reparti sono corrotti (contengono ruoli invece di nomi reparti)
    const corruptedDepartments = departments.some(dept => 
      dept && dept.name && (
        dept.name === 'Amministratori' || 
        dept.name === 'Responsabili' || 
        dept.name === 'Dipendenti' || 
        dept.name === 'Collaboratore Occasionale' ||
        /^\d+$/.test(dept.name) || // Nomi numerici
        dept.name.length < 3 // Nomi troppo corti
      )
    )
    
    // Se i reparti sono corrotti o non ci sono reparti, carica dall'onboarding
    if (corruptedDepartments || departments.length === 0) {
      console.log('🧹 Rilevati reparti corrotti, ricaricamento dall\'onboarding...')
      const onboardingData = localStorage.getItem('haccp-onboarding-new') || localStorage.getItem('haccp-onboarding')
      console.log('🔍 Dati onboarding trovati:', typeof onboardingData, onboardingData)
      
      if (onboardingData) {
        try {
          // Gestisci sia stringhe JSON che oggetti JavaScript
          let onboarding
          if (typeof onboardingData === 'string') {
            // Se è una stringa, prova a parsarla come JSON
            try {
              // Controlla se è la stringa corrotta "[object Object]"
              if (onboardingData === '[object Object]') {
                console.warn('Rilevata stringa corrotta "[object Object]", usando oggetto vuoto')
                onboarding = { formData: { departments: { list: [] } } }
              } else {
                onboarding = JSON.parse(onboardingData)
              }
            } catch (jsonError) {
              // Se il parsing JSON fallisce, usa un oggetto vuoto invece di eval
              console.warn('Errore parsing JSON, usando oggetto vuoto:', jsonError)
              onboarding = { formData: { departments: { list: [] } } }
            }
          } else {
            // Se è già un oggetto, usalo direttamente
            onboarding = onboardingData
          }
          // Gestisci sia la struttura vecchia che quella nuova
          const departmentsData = onboarding.departments?.list || onboarding.formData?.departments?.list
          if (departmentsData) {
            departments = departmentsData
              .filter(dept => dept && dept.enabled)
              .map(dept => ({
                id: dept.id || Date.now() + Math.random(),
                name: dept.name || 'Reparto non disponibile',
                enabled: true,
                isCustom: dept.isCustom || false,
                createdAt: new Date().toISOString()
              }))
            // Salva i reparti corretti
            setDepartments(departments)
            localStorage.setItem('haccp-departments', JSON.stringify(departments))
            console.log('✅ Reparti corretti caricati dall\'onboarding:', departments)
          }
        } catch (error) {
          console.warn('Errore nel caricamento reparti dall\'onboarding:', error)
        }
      }
    }
    
    // Carica sempre i reparti dall'onboarding se ci sono dati precompilati
    const onboardingData = localStorage.getItem('haccp-onboarding-new')
    if (onboardingData) {
      try {
        // Gestisci sia stringhe JSON che oggetti JavaScript
        let onboarding
        if (typeof onboardingData === 'string') {
          // Se è una stringa, prova a parsarla come JSON
          try {
            onboarding = JSON.parse(onboardingData)
          } catch (jsonError) {
            // Se il parsing JSON fallisce, usa un oggetto vuoto
            console.warn('Errore parsing JSON, usando oggetto vuoto:', jsonError)
            onboarding = { formData: { departments: { list: [] } } }
          }
        } else {
          // Se è già un oggetto, usalo direttamente
          onboarding = onboardingData
        }
        const departmentsData = onboarding.formData?.departments?.list
        if (departmentsData && departmentsData.length > 0) {
          // Carica i reparti precompilati anche se non ci sono errori
          const precompiledDepartments = departmentsData
            .filter(dept => dept && dept.enabled)
            .map(dept => ({
              id: dept.id || Date.now() + Math.random(),
              name: dept.name || 'Reparto non disponibile',
              enabled: true,
              isCustom: dept.isCustom || false,
              createdAt: new Date().toISOString()
            }))
          
          // Aggiorna solo se non ci sono già reparti o se i reparti precompilati sono diversi
          if (departments.length === 0 || JSON.stringify(departments) !== JSON.stringify(precompiledDepartments)) {
            setDepartments(precompiledDepartments)
            localStorage.setItem('haccp-departments', JSON.stringify(precompiledDepartments))
            console.log('✅ Reparti precompilati caricati:', precompiledDepartments)
          }
        }
      } catch (error) {
        console.warn('Errore nel caricamento reparti precompilati:', error)
      }
    }
    
    setAppData({
      users,
      departments,
      refrigerators,
      staff,
      cleaning,
      inventory
    })
  }

  // Funzione per resettare completamente l'app (solo in modalità sviluppo)
  const resetApp = () => {
    if (window.confirm('⚠️ ATTENZIONE: Questo cancellerà TUTTI i dati dell\'app!\n\nSei sicuro di voler procedere?')) {
      // Pulisce tutto il localStorage
      localStorage.clear()
      sessionStorage.clear()
      
      // Pulisce anche i dati specifici dell'onboarding
      localStorage.removeItem('haccp-onboarding')
      localStorage.removeItem('haccp-onboarding-new')
      
      // Ricarica la pagina
      window.location.reload()
    }
  }



  // Funzione per precompilare l'onboarding con i dati di test
  const prefillOnboarding = () => {
    console.log('🔄 Precompilando onboarding con dati di test...')
    
    // Pulisce COMPLETAMENTE tutti i dati esistenti per evitare conflitti
    console.log('🧹 Pulizia completa localStorage...')
    localStorage.clear()
    sessionStorage.clear()
    
    // Pulisce anche i dati specifici dell'onboarding
    localStorage.removeItem('haccp-onboarding')
    localStorage.removeItem('haccp-onboarding-new')
    localStorage.removeItem('haccp-departments')
    localStorage.removeItem('haccp-staff')
    localStorage.removeItem('haccp-refrigerators')
    localStorage.removeItem('haccp-cleaning')
    localStorage.removeItem('haccp-products')
    localStorage.removeItem('haccp-temperatures')
    localStorage.removeItem('haccp-product-labels')
    localStorage.removeItem('haccp-users')
    localStorage.removeItem('haccp-current-user')
    
    // Dati precompilati per "Al Ritrovo"
    const prefillData = {
      business: {
        companyName: 'Al Ritrovo SRL',
        address: 'Via centotrecento 1/1b Bologna 40128',
        vatNumber: '001255668899101',
        email: '000@gmail.com',
        phone: '0511234567'
      },
      departments: {
        list: [
          { id: 'cucina', name: 'Cucina', description: 'Area di preparazione e cottura', location: 'Piano terra', manager: 'Matteo Cavallaro', notes: 'Reparto principale', enabled: true, createdAt: new Date().toISOString(), createdBy: 'Sistema' },
          { id: 'bancone', name: 'Bancone', description: 'Area di servizio e preparazione', location: 'Piano terra', manager: 'Matteo Cavallaro', notes: 'Area servizio', enabled: true, createdAt: new Date().toISOString(), createdBy: 'Sistema' },
          { id: 'sala', name: 'Sala', description: 'Area di servizio clienti', location: 'Piano terra', manager: 'Matteo Cavallaro', notes: 'Area clienti', enabled: true, createdAt: new Date().toISOString(), createdBy: 'Sistema' },
          { id: 'magazzino', name: 'Magazzino', description: 'Area di stoccaggio e conservazione', location: 'Seminterrato', manager: 'Matteo Cavallaro', notes: 'Magazzino principale', enabled: true, createdAt: new Date().toISOString(), createdBy: 'Sistema' },
          { id: 'magazzino-b', name: 'Magazzino B', description: 'Magazzino secondario', location: 'Piano terra', manager: 'Matteo Cavallaro', notes: 'Magazzino secondario', enabled: true, isCustom: true, createdAt: new Date().toISOString(), createdBy: 'Sistema' },
          { id: 'sala-b', name: 'Sala B', description: 'Sala secondaria', location: 'Piano terra', manager: 'Matteo Cavallaro', notes: 'Sala secondaria', enabled: true, isCustom: true, createdAt: new Date().toISOString(), createdBy: 'Sistema' }
        ],
        enabledCount: 6
      },
      staff: {
        staffMembers: [
          {
            id: 'staff_001',
            name: 'Matteo',
            surname: 'Cavallaro',
            fullName: 'Matteo Cavallaro',
            role: 'Responsabile',
            categories: ['Banconisti', 'Amministratore'],
            certification: 'HACCP Avanzato',
            notes: 'Responsabile generale',
            addedDate: new Date().toLocaleDateString('it-IT'),
            addedTime: new Date().toLocaleString('it-IT')
          },
          {
            id: 'staff_002',
            name: 'Fabrizio',
            surname: 'Dettori',
            fullName: 'Fabrizio Dettori',
            role: 'Responsabile',
            categories: ['Amministratore', 'Camerieri'],
            certification: 'HACCP Base',
            notes: 'Responsabile sala e amministrazione',
            addedDate: new Date().toLocaleDateString('it-IT'),
            addedTime: new Date().toLocaleString('it-IT')
          },
          {
            id: 'staff_003',
            name: 'Paolo',
            surname: 'Dettori',
            fullName: 'Paolo Dettori',
            role: 'Amministratore',
            categories: ['Amministratore', 'Cuochi'],
            certification: 'HACCP Avanzato',
            notes: 'Amministratore e responsabile cucina',
            addedDate: new Date().toLocaleDateString('it-IT'),
            addedTime: new Date().toLocaleString('it-IT')
          },
          {
            id: 'staff_004',
            name: 'Eddy',
            surname: 'TheQueen',
            fullName: 'Eddy TheQueen',
            role: 'Dipendente',
            categories: ['Banconisti'],
            certification: 'HACCP Base',
            notes: 'Addetto bancone',
            addedDate: new Date().toLocaleDateString('it-IT'),
            addedTime: new Date().toLocaleString('it-IT')
          },
          {
            id: 'staff_005',
            name: 'Elena',
            surname: 'Guaitoli',
            fullName: 'Elena Guaitoli',
            role: 'Dipendente',
            categories: ['Social & Media Manager', 'Banconisti'],
            certification: 'HACCP Base',
            notes: 'Social media e bancone',
            addedDate: new Date().toLocaleDateString('it-IT'),
            addedTime: new Date().toLocaleString('it-IT')
          }
        ]
      },
      conservation: {
        points: [
          {
            id: 'conservation-1',
            name: 'Frigo A',
            location: 'Cucina',
            targetTemp: 2,
            selectedCategories: ['fresh_dairy', 'fresh_produce', 'fresh_meat']
            // La compliance verrà calcolata automaticamente dal componente
          },
          {
            id: 'conservation-2',
            name: 'Frigo Bancone 1',
            location: 'Bancone',
            targetTemp: 6,
            selectedCategories: ['fresh_beverages', 'chilled_ready']
          },
          {
            id: 'conservation-3',
            name: 'Frigo Bancone 2',
            location: 'Bancone',
            targetTemp: 5,
            selectedCategories: ['fresh_beverages', 'chilled_ready']
          },
          {
            id: 'conservation-4',
            name: 'Frigo Bancone 3',
            location: 'Bancone',
            targetTemp: 5,
            selectedCategories: ['fresh_beverages', 'chilled_ready']
          },
          {
            id: 'conservation-5',
            name: 'Frigo B',
            location: 'Cucina',
            targetTemp: -18,
            selectedCategories: ['frozen']
          },
          {
            id: 'conservation-6',
            name: 'Frigo C',
            location: 'Cucina',
            targetTemp: -22,
            selectedCategories: ['deep_frozen']
          },
          {
            id: 'conservation-7',
            name: 'Frigo D',
            location: 'Cucina',
            targetTemp: -18,
            selectedCategories: ['frozen']
          }
        ],
        count: 7
      },
      tasks: {
        list: [],
        count: 0
      },
      products: {
        productsList: [
          {
            id: 'product_001',
            name: 'Acqua nato 0,5',
            type: 'Bevande',
            expiryDate: '2025-09-08',
            position: 'Frigo A',
            allergens: []
            // La compliance verrà calcolata automaticamente dal componente
          }
        ],
        count: 1
      }
    }
    
    // Salva i dati nell'onboarding con la struttura corretta
    const onboardingProgress = {
      currentStep: 0,
      completedSteps: [0, 1, 2, 3, 4, 5], // Tutti gli step completati
      confirmedSteps: [0, 1, 2, 3, 4, 5], // Tutti gli step confermati
      formData: prefillData,
      lastActivity: new Date().toISOString()
    }
    localStorage.setItem('haccp-onboarding-new', JSON.stringify(onboardingProgress))
    
    // Crea anche i dati di accesso precompilati
    const adminUser = {
      id: 'admin_001',
      name: 'Admin',
      pin: '0000',
      role: 'admin',
      department: 'Amministrazione',
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem('haccp-users', JSON.stringify([adminUser]))
    localStorage.setItem('haccp-current-user', JSON.stringify(adminUser))
    
    console.log('✅ Onboarding precompilato con i tuoi dati')
    console.log('✅ Dati di accesso precompilati: Admin / 0000')
    
    // Mostra conferma
    alert('✅ Onboarding precompilato con successo!\n\nDati caricati:\n- Al Ritrovo SRL\n- 6 Reparti\n- 5 Membri staff (Matteo, Fabrizio, Paolo, Eddy, Elena)\n- 7 Punti di conservazione (Frigo A, Bancone 1-3, Frigo B-D)\n- Acqua nato 0,5L\n\nClicca "Riapri Onboarding" per vedere i dati!')
  }

  // Funzione per resettare completamente l'onboarding
  const resetOnboarding = () => {
    if (window.confirm('⚠️ ATTENZIONE: Questo cancellerà TUTTI i dati dell\'onboarding e dell\'app!\n\nSei sicuro di voler procedere?')) {
      // Pulisce tutti i dati dell'onboarding
      localStorage.removeItem('haccp-onboarding')
      localStorage.removeItem('haccp-onboarding-new')
      
      // Pulisce tutti i dati dell'app
      localStorage.removeItem('haccp-departments')
      localStorage.removeItem('haccp-staff')
      localStorage.removeItem('haccp-refrigerators')
      localStorage.removeItem('haccp-cleaning')
      localStorage.removeItem('haccp-products')
      localStorage.removeItem('haccp-users')
      localStorage.removeItem('haccp-temperatures')
      localStorage.removeItem('haccp-product-labels')
      
      // Reset degli stati dell'app
      setDepartments([])
      setStaff([])
      setRefrigerators([])
      setCleaning([])
      setProducts([])
      setUsers([])
      setTemperatures([])
      setProductLabels([])
      setOnboardingCompleted(false)
      
      console.log('🧹 Onboarding e app completamente resettati')
      
      // Ricrea i dati di accesso predefiniti
      const defaultUsers = [
        {
          id: 'admin-1',
          name: 'Admin',
          pin: '0000',
          role: 'admin',
          department: 'Amministrazione',
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ]
      
      localStorage.setItem('haccp-users', JSON.stringify(defaultUsers))
      localStorage.setItem('haccp-current-user', JSON.stringify(defaultUsers[0]))
      
      console.log('✅ Dati di accesso ricreati: Admin / 0000')
      
      // Ricarica la pagina per applicare le modifiche
      window.location.reload()
    }
  }


  // Rendi le funzioni disponibili globalmente per la console (solo in sviluppo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.resetApp = resetApp
      window.resetOnboarding = resetOnboarding
      window.prefillOnboarding = prefillOnboarding
      console.log('🔄 Funzioni disponibili globalmente:')
      console.log('  - resetApp() - Reset completo app')
      console.log('  - resetOnboarding() - Reset onboarding e app')
      console.log('  - prefillOnboarding() - Precompila onboarding')
    }
  }, [])


  // Load data from localStorage on app start
  useEffect(() => {
    // Inizializza schemi dati HACCP se non esistono
    const schemas = initializeDataSchemas()
    Object.entries(schemas).forEach(([key, defaultValue]) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, defaultValue)
      }
    })

    // Inizializza modalità dev se richiesta via URL
    initializeDevModeIfRequested()
    
    // Carica i dati dell'app per validazione HACCP
    loadAppData()

    const temps = localStorage.getItem('haccp-temperatures')
    const cleaningData = localStorage.getItem('haccp-cleaning')
    const refrigeratorsData = localStorage.getItem('haccp-refrigerators')
    const staffData = localStorage.getItem('haccp-staff')
    const productsData = localStorage.getItem('haccp-products')
	const departmentsData = localStorage.getItem('haccp-departments')
    const productLabelsData = localStorage.getItem('haccp-product-labels')
    const usersData = localStorage.getItem('haccp-users')
    const currentUserData = localStorage.getItem('haccp-current-user')

    try {
      if (temps) setTemperatures(JSON.parse(temps))
      if (cleaningData) setCleaning(JSON.parse(cleaningData))
      if (refrigeratorsData) setRefrigerators(JSON.parse(refrigeratorsData))
      if (staffData) setStaff(JSON.parse(staffData))
      if (productsData) setProducts(JSON.parse(productsData))
      if (departmentsData) setDepartments(JSON.parse(departmentsData))	
      if (productLabelsData) setProductLabels(JSON.parse(productLabelsData))
    } catch (error) {
      console.warn('Errore nel parsing dei dati:', error)
      // Pulisce i dati corrotti
      localStorage.removeItem('haccp-temperatures')
      localStorage.removeItem('haccp-cleaning')
      localStorage.removeItem('haccp-refrigerators')
      localStorage.removeItem('haccp-staff')
      localStorage.removeItem('haccp-products')
      localStorage.removeItem('haccp-departments')
      localStorage.removeItem('haccp-product-labels')
    }
    
    if (usersData) {
      try {
        setUsers(JSON.parse(usersData))
      } catch (error) {
        console.warn('Errore nel parsing users:', error)
        localStorage.removeItem('haccp-users')
      }
    } else {
      // Crea utente admin di default se non esistono utenti
      const defaultAdmin = {
        id: 'admin_001',
        name: 'Admin',
        pin: '0000',
        role: 'admin',
        department: 'Amministrazione',
        createdAt: new Date().toISOString()
      }
      setUsers([defaultAdmin])
      localStorage.setItem('haccp-users', JSON.stringify([defaultAdmin]))
    }

    // NON recupera automaticamente l'utente corrente per sicurezza
    // L'utente deve sempre fare login all'avvio dell'app
    // if (currentUserData) {
    //   setCurrentUser(JSON.parse(currentUserData))
    // }

    // Recupera la preferenza per la visibilità della chat IA
    const chatIconPref = localStorage.getItem('haccp-show-chat-icon')
    if (chatIconPref !== null) {
      try {
        setShowChatIcon(JSON.parse(chatIconPref))
      } catch (error) {
        console.warn('Errore nel parsing chat icon pref:', error)
        localStorage.removeItem('haccp-show-chat-icon')
      }
    }

    // Listener per i cambiamenti alle preferenze chat
    const handleStorageChange = (e) => {
      if (e.key === 'haccp-show-chat-icon') {
        try {
          setShowChatIcon(JSON.parse(e.newValue))
        } catch (error) {
          console.warn('Errore nel parsing chat icon pref change:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Re-calcola le notifiche quando i dati cambiano
  useEffect(() => {
    // Forza il ricalcolo delle notifiche ogni volta che i dati cambiano
  }, [products, temperatures, cleaning, staff, productLabels])

  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('haccp-temperatures', JSON.stringify(temperatures))
  }, [temperatures])

  useEffect(() => {
    localStorage.setItem('haccp-refrigerators', JSON.stringify(refrigerators))
  }, [refrigerators])

  useEffect(() => {
    localStorage.setItem('haccp-cleaning', JSON.stringify(cleaning))
  }, [cleaning])

  useEffect(() => {
    localStorage.setItem('haccp-staff', JSON.stringify(staff))
  }, [staff])

  useEffect(() => {
    localStorage.setItem('haccp-products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('haccp-departments', JSON.stringify(departments))
  }, [departments])

  useEffect(() => {
    localStorage.setItem('haccp-product-labels', JSON.stringify(productLabels))
  }, [productLabels])



  // Funzioni gestione utenti
  const handleLogin = (user) => {
    setCurrentUser(user)
    setIsLoginModalOpen(false)
    
    // Salva l'utente corrente nel localStorage
    localStorage.setItem('haccp-current-user', JSON.stringify(user))
    
    // Registra l'accesso
    const loginAction = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: user.id,
      userName: user.name,
      type: 'login',
      description: `Accesso di ${user.name}`
    }
    
    // Salva l'azione di login
    try {
      const actions = JSON.parse(localStorage.getItem('haccp-actions') || '[]')
      actions.push(loginAction)
      localStorage.setItem('haccp-actions', JSON.stringify(actions))
    } catch (error) {
      console.warn('Errore nel parsing actions:', error)
      localStorage.removeItem('haccp-actions')
    }
    
    // Controlla se ci sono etichette di prodotti scaduti oggi (DISABILITATO temporaneamente)
    // setTimeout(checkExpiredLabelsToday, 2000)
  }

  // Funzioni per calcolare le notifiche delle sezioni
  const getNotifications = () => {
    const notifications = {
      dashboard: 0,
      cleaning: 0,
      inventory: 0,
      labels: 0,
      staff: 0,
      refrigerators: 0
    }
    
    // Notifiche per Attività e Mansioni (nuove attività aggiunte)
    const lastCheckCleaning = lastCheck.cleaning || '2000-01-01T00:00:00.000Z'
    const newCleaningTasks = cleaning.filter(task => 
      new Date(task.createdAt || task.timestamp) > new Date(lastCheckCleaning)
    ).length
    notifications.cleaning += newCleaningTasks
    
    // Notifiche per Inventario (prodotti in scadenza tra 3-4 giorni + nuovi prodotti)
    const lastCheckInventory = lastCheck.inventory || '2000-01-01T00:00:00.000Z'
    const today = new Date()
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
    const fourDaysFromNow = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000)
    
    const expiringProducts = products.filter(product => {
      const expiryDate = new Date(product.expiryDate)
      return expiryDate >= threeDaysFromNow && expiryDate <= fourDaysFromNow
    }).length
    
    const newProducts = products.filter(product => 
      new Date(product.createdAt || product.addedDate) > new Date(lastCheckInventory)
    ).length
    
    notifications.inventory += expiringProducts + newProducts
    
    // Notifiche per Etichette (nuove etichette)
    const lastCheckLabels = lastCheck.labels || '2000-01-01T00:00:00.000Z'
    const newLabels = productLabels.filter(label => 
      new Date(label.createdAt || '2000-01-01') > new Date(lastCheckLabels)
    ).length
    notifications.labels += newLabels
    
    // Notifiche per Staff (nuovi membri)
    const lastCheckStaff = lastCheck.staff || '2000-01-01T00:00:00.000Z'
    const newStaffMembers = staff && Array.isArray(staff) ? staff.filter(member => 
      member && new Date(member.addedDate || member.createdAt || '2000-01-01') > new Date(lastCheckStaff)
    ).length : 0
    notifications.staff += newStaffMembers
    
    // Notifiche per Temperature (nuove registrazioni critiche)
    const lastCheckRefrigerators = lastCheck.refrigerators || '2000-01-01T00:00:00.000Z'
    const criticalTemperatures = temperatures.filter(temp => {
      const tempDate = new Date(temp.timestamp)
      const isNew = tempDate > new Date(lastCheckRefrigerators)
      const isCritical = temp.status === 'warning' || temp.status === 'danger'
      return isNew && isCritical
    }).length
    notifications.refrigerators += criticalTemperatures
    
    // Notifiche per Dashboard (urgenze immediate - prodotti scaduti oggi)
    const expiredToday = products.filter(product => {
      const expiryDate = new Date(product.expiryDate)
      const today = new Date()
      expiryDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      return expiryDate.getTime() === today.getTime()
    }).length
    
    notifications.dashboard = expiredToday + criticalTemperatures
    
    return notifications
  }
  
  // Aggiorna l'ultima visita a una sezione
  const updateLastCheck = (section) => {
    const updatedCheck = {
      ...lastCheck,
      [section]: new Date().toISOString()
    }
    setLastCheck(updatedCheck)
    localStorage.setItem('haccp-last-check', JSON.stringify(updatedCheck))
  }
  
  // Calcola le notifiche
  const notifications = getNotifications()
  
  // Componente pallino notifica
  const NotificationDot = ({ hasNotification, className = "" }) => {
    if (!hasNotification) return null
    
    return (
      <div className={`absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full ${className}`}>
      </div>
    )
  }

  // Funzioni gestione sincronizzazione
  const addPendingChange = (type, data, id = null) => {
    const change = {
      id: id || `${type}_${Date.now()}`,
      type, // 'temperature', 'inventory', 'cleaning', 'staff'
      data,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id,
      userName: currentUser?.name
    }
    
    setPendingChanges(prev => {
      const filtered = prev.filter(c => !(c.type === type && c.id === change.id))
      return [...filtered, change]
    })
  }

  const handleDataSync = (direction, changes) => {
    if (direction === 'upload') {
      // Rimuovi i cambiamenti che sono stati caricati
      setPendingChanges([])
      setLastSyncTime(new Date().toISOString())
      localStorage.setItem('haccp-last-sync', new Date().toISOString())
      
      // Mostra notifica di successo
      console.log('✅ Sincronizzazione completata!')
    } else if (direction === 'download') {
      // Aggiorna l'ultimo sync time
      setLastSyncTime(new Date().toISOString())
      localStorage.setItem('haccp-last-sync', new Date().toISOString())
      
      // In futuro qui caricheremo i dati da Firebase
      console.log('📥 Dati aggiornati dal cloud!')
    }
  }

  // Intercetta i cambiamenti dei dati per aggiungerli ai pending
  const trackDataChange = (type, data, id) => {
    console.log('🎯 TRACKING:', type, 'with', data?.length || 0, 'items')
    addPendingChange(type, data, id)
  }

  // Auto-track data changes when arrays change (with debug)
  useEffect(() => {
    // Skip initial load and empty arrays
    if (products.length > 0 && currentUser) {
      console.log('📦 Products changed:', products.length, 'items')
      trackDataChange('inventory', products, 'auto-inventory')
    }
  }, [products, currentUser])

  useEffect(() => {
    if (temperatures.length > 0 && currentUser) {
      console.log('🌡️ Temperatures changed:', temperatures.length, 'items')
      trackDataChange('temperatures', temperatures, 'auto-temperatures')  
    }
  }, [temperatures, currentUser])

  useEffect(() => {
    if (cleaning.length > 0 && currentUser) {
      console.log('🧹 Cleaning changed:', cleaning.length, 'items')
      trackDataChange('cleaning', cleaning, 'auto-cleaning')
    }
  }, [cleaning, currentUser])

  useEffect(() => {
    if (staff.length > 0 && currentUser) {
      console.log('👥 Staff changed:', staff.length, 'items')
      trackDataChange('staff', staff, 'auto-staff')
    }
  }, [staff, currentUser])

  // Debug pending changes
  useEffect(() => {
    console.log('📋 PENDING CHANGES:', pendingChanges.length, pendingChanges)
  }, [pendingChanges])

  // Funzione per controllare etichette di prodotti scaduti oggi (COMPLETAMENTE DISABILITATA)
  /*
  const checkExpiredLabelsToday = () => {
    const productLabels = JSON.parse(localStorage.getItem('haccp-product-labels') || '[]')
    const products = JSON.parse(localStorage.getItem('haccp-products') || '[]')
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const expiredTodayLabels = []
    
    productLabels.forEach(label => {
      const associatedProduct = products.find(p => p.name === label.productName)
      if (associatedProduct) {
        const productExpiry = new Date(associatedProduct.expiryDate)
        productExpiry.setHours(0, 0, 0, 0)
        
        if (productExpiry.getTime() === today.getTime() && label.photo) {
          expiredTodayLabels.push({
            ...label,
            associatedProduct
          })
        }
      }
    })
    
    if (expiredTodayLabels.length > 0) {
      const shouldRemoveLabels = confirm(`🗑️ PULIZIA ETICHETTE - Controllo giornaliero\n\n📅 Oggi sono scaduti ${expiredTodayLabels.length} prodotti con foto etichette:\n\n${expiredTodayLabels.map(l => `• ${l.productName}`).join('\n')}\n\n💾 Vuoi rimuovere le foto per liberare spazio di archiviazione?\n\n✅ Sì, rimuovi le foto\n❌ No, mantieni tutto`)
      
      if (shouldRemoveLabels) {
        // Rimuovi le foto dalle etichette ma mantieni i dati
        const updatedLabels = productLabels.map(label => {
          const isExpiredToday = expiredTodayLabels.some(exp => exp.id === label.id)
          if (isExpiredToday && label.photo) {
            return {
              ...label,
              photo: null,
              photoRemovedAt: new Date().toISOString(),
              photoRemovedReason: 'Prodotto scaduto - pulizia automatica'
            }
          }
          return label
        })
        
        localStorage.setItem('haccp-product-labels', JSON.stringify(updatedLabels))
        
        const spaceSaved = expiredTodayLabels.length * 150
        alert(`✅ Pulizia completata!\n\n🗑️ Rimosse ${expiredTodayLabels.length} foto da etichette di prodotti scaduti\n💾 Spazio liberato: ~${spaceSaved} KB\n\n📝 I dati delle etichette sono stati mantenuti`)
      }
    }
  }
  */

  const handleLogout = () => {
    if (currentUser) {
      const logoutAction = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        user: currentUser.id,
        userName: currentUser.name,
        type: 'logout',
        description: `Disconnessione di ${currentUser.name}`
      }
      
      try {
        const actions = JSON.parse(localStorage.getItem('haccp-actions') || '[]')
        actions.push(logoutAction)
        localStorage.setItem('haccp-actions', JSON.stringify(actions))
      } catch (error) {
        console.warn('Errore nel parsing actions logout:', error)
        localStorage.removeItem('haccp-actions')
      }
    }
    
    setCurrentUser(null)
    setActiveTab('dashboard')
    
    // Rimuovi l'utente corrente dal localStorage
    localStorage.removeItem('haccp-current-user')
  }

  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem('haccp-users', JSON.stringify(updatedUsers))
    
    // Integra l'utente registrato nella sezione Staff
    const newStaffMember = {
      id: `staff_${Date.now()}`,
      name: userData.name,
      role: userData.role === 'admin' ? 'Amministratore' : 
            userData.role === 'dipendente' ? 'Dipendente' :
            userData.role === 'responsabile' ? 'Responsabile' :
            userData.role === 'collaboratore' ? 'Collaboratore Occasionale' : 'Dipendente',
      department: userData.department || 'Non assegnato',
      certification: '',
      notes: `Utente registrato il ${new Date().toLocaleDateString('it-IT')}`,
      addedDate: new Date().toLocaleDateString('it-IT'),
      addedTime: new Date().toLocaleString('it-IT'),
      isRegisteredUser: true,
      userId: newUser.id
    }
    
    const updatedStaff = [...staff, newStaffMember]
    setStaff(updatedStaff)
    localStorage.setItem('haccp-staff', JSON.stringify(updatedStaff))
  }

  // Funzione per verificare se l'utente è admin
  const isAdmin = () => currentUser && currentUser.role === 'admin'

  // Calcola statistiche per la dashboard
  const getQuickStats = () => {
    const tempOk = temperatures.filter(t => t.status === 'ok').length
    const tempProblems = temperatures.filter(t => t.status === 'danger').length
    const cleaningPending = cleaning.filter(c => !c.completed).length
    
    // Calcola scadenze prodotti
    const today = new Date()
    const expiringToday = products.filter(product => {
      const expiryDate = new Date(product.expiryDate)
      const diffTime = expiryDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays >= 0
    }).length
    
    return {
      temperatureOk: tempOk,
      temperatureProblems: tempProblems,
      cleaningPending: cleaningPending,
      expiringToday: expiringToday
    }
  }

  const quickStats = getQuickStats()

  // Export all data
  const exportData = () => {
    const data = {
  temperatures,
  cleaningTasks: cleaning,
  staff,
  products,
  departments,
  productLabels,
  exportDate: new Date().toISOString()
}
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `haccp-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import data
  const importData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.temperatures) {
          setTemperatures(data.temperatures)
          localStorage.setItem('haccp-temperatures', JSON.stringify(data.temperatures))
        }
        if (data.cleaningTasks) {
          setCleaning(data.cleaningTasks)
          localStorage.setItem('haccp-cleaning', JSON.stringify(data.cleaningTasks))
        }
        if (data.staff) {
          setStaff(data.staff)
          localStorage.setItem('haccp-staff', JSON.stringify(data.staff))
        }
        if (data.products) {
          setProducts(data.products)
          localStorage.setItem('haccp-products', JSON.stringify(data.products))
        }
		if (data.departments) {
		  setDepartments(data.departments)
		  localStorage.setItem('haccp-departments', JSON.stringify(data.departments))
		}
        if (data.productLabels) {
          setProductLabels(data.productLabels)
          localStorage.setItem('haccp-product-labels', JSON.stringify(data.productLabels))
        }
        alert('Dati importati con successo!')
      } catch (error) {
        alert('Errore durante l\'importazione del file')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
  }

  // Controlla se mostrare l'onboarding
  useEffect(() => {
    if (currentUser && !onboardingCompleted) {
      // Se la modalità dev è attiva, bypassa l'onboarding
      if (shouldBypassOnboarding()) {
        setOnboardingCompleted(true)
        return
      }
      
      // Ottieni i dati dell'onboarding dal localStorage
      const savedOnboarding = localStorage.getItem('haccp-onboarding')
      
      // Controlla se l'onboarding è già completato
      if (savedOnboarding && savedOnboarding !== 'undefined' && savedOnboarding !== 'null' && savedOnboarding !== '[object Object]') {
        try {
          // Prova a parsare come JSON
          const onboarding = JSON.parse(savedOnboarding)
          if (onboarding && typeof onboarding === 'object' && onboarding.completed) {
            setOnboardingCompleted(true)
            return
          }
        } catch (error) {
          console.warn('Errore nel parsing onboarding:', error)
          // Pulisce il valore corrotto
          localStorage.removeItem('haccp-onboarding')
        }
      }
      
      // Mostra l'onboarding se non è completato
      setShowOnboarding(true)
    }
  }, [currentUser, onboardingCompleted])

  // Gestisce il completamento dell'onboarding
  const handleOnboardingComplete = (onboardingData) => {
    setShowOnboarding(false)
    setOnboardingCompleted(true)
    
    // Salva i dati dell'onboarding
    const onboarding = {
      ...onboardingData,
      completed: true,
      completedAt: new Date().toISOString()
    }
    localStorage.setItem('haccp-onboarding', JSON.stringify(onboarding))
    
    // Migra i dati dell'onboarding alle sezioni principali
    if (onboardingData.business) {
      // Salva informazioni business
      localStorage.setItem('haccp-business-info', JSON.stringify(onboardingData.business))
    }
    
    if (onboardingData.departments?.list) {
      // Migra dipartimenti - filtra solo quelli attivati durante l'onboarding
      const departments = onboardingData.departments.list
        .filter(dept => dept && dept.enabled) // Solo reparti attivati
        .map(dept => ({
          id: dept.id || Date.now() + Math.random(),
          name: dept.name || 'Reparto non disponibile',
          enabled: true,
          isCustom: dept.isCustom || false,
          createdAt: new Date().toISOString()
        }))
      setDepartments(departments)
      localStorage.setItem('haccp-departments', JSON.stringify(departments))
    }
    
    if (onboardingData.staff?.staffMembers) {
      // Migra staff
      const staffMembers = onboardingData.staff.staffMembers.map(member => ({
        ...member,
        id: member.id || Date.now() + Math.random(),
        createdAt: new Date().toISOString()
      }))
      setStaff(staffMembers)
      localStorage.setItem('haccp-staff', JSON.stringify(staffMembers))
    }
    
    if (onboardingData.conservation?.points) {
      // Migra punti di conservazione
      const conservationPoints = onboardingData.conservation.points.map(point => ({
        ...point,
        id: point.id || Date.now() + Math.random(),
        createdAt: new Date().toISOString()
      }))
      setRefrigerators(conservationPoints)
      localStorage.setItem('haccp-refrigerators', JSON.stringify(conservationPoints))
    }
    
    if (onboardingData.tasks?.list) {
      // Migra attività e mansioni
      const tasks = onboardingData.tasks.list.map(task => ({
        ...task,
        id: task.id || Date.now() + Math.random(),
        createdAt: new Date().toISOString()
      }))
      setCleaning(tasks)
      localStorage.setItem('haccp-cleaning', JSON.stringify(tasks))
    }
    
    if (onboardingData.inventory?.products) {
      // Migra inventario prodotti
      const products = onboardingData.inventory.products.map(product => ({
        ...product,
        id: product.id || Date.now() + Math.random(),
        createdAt: new Date().toISOString()
      }))
      setProducts(products)
      localStorage.setItem('haccp-products', JSON.stringify(products))
    }
    
    // Applica i dati dell'onboarding se necessario
    if (onboardingData.preset) {
      localStorage.setItem('haccp-presets', JSON.stringify({
        selected: onboardingData.preset,
        applied: true,
        appliedAt: new Date().toISOString()
      }))
    }
    
    // Ricarica i dati dell'app per aggiornare la validazione
    loadAppData()
  }

  // Pulisce localStorage corrotto (solo in sviluppo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      try {
        // Pulisce valori corrotti
        const keys = ['dev-mode', 'haccp-onboarding'];
        keys.forEach(key => {
          const value = localStorage.getItem(key);
          if (value && typeof value === 'object') {
            console.warn(`🧹 Pulizia localStorage corrotto per: ${key}`);
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Errore nella pulizia localStorage:', error);
      }
    }
  }, []);

  // Gestisce i prerequisiti mancanti
  const handleMissingRequirements = (section) => {
    const access = validation.canAccessSection(section)
    if (!access.isEnabled) {
      setShowBottomSheet(true)
    }
  }

  // Gestisce la richiesta di risolvere un prerequisito
  const handleFixRequirement = (requirement) => {
    if (requirement === 'onboarding') {
      setShowOnboarding(true)
    } else {
      // Naviga alla sezione appropriata per risolvere il prerequisito
      switch (requirement) {
        case 'departments':
          setActiveTab('staff') // Staff ha la gestione dipartimenti
          break
        case 'refrigerators':
          setActiveTab('refrigerators')
          break
        case 'staff':
          setActiveTab('staff')
          break
        default:
          setActiveTab('dashboard')
      }
    }
  }

  // Se non c'è utente loggato, mostra dashboard con pulsante "Inizia Turno"
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DevModeBanner />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Business HACCP Manager
            </h1>
            <p className="text-gray-600">Sistema di Gestione HACCP per Ristoranti</p>
          </div>

          {/* Report Giornalieri */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Report Giornalieri - {new Date().toLocaleDateString('it-IT')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {quickStats.temperatureOk}
                    </div>
                    <div className="text-sm text-green-700">Temperature OK</div>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {quickStats.temperatureProblems}
                    </div>
                    <div className="text-sm text-red-700">Problemi Temp.</div>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {quickStats.cleaningPending}
                    </div>
                    <div className="text-sm text-yellow-700">Pulizie Pending</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {quickStats.expiringToday}
                    </div>
                    <div className="text-sm text-blue-700">Scadenze Prodotti</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export/Import */}
          <div className="max-w-md mx-auto mb-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={exportData}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Esporta
                  </Button>
                  <label className="cursor-pointer">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      asChild
                    >
                      <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Importa
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="hidden"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ultimo utente e pulsante login */}
          <div className="max-w-md mx-auto">
            {users.length > 1 && (
              <Card className="mb-4">
                <CardContent className="pt-6">
                  <div className="text-center text-gray-600">
                    <div className="text-sm">Ultimo accesso:</div>
                    <div className="font-semibold">
                      {users[users.length - 1]?.name} 
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => setIsLoginModalOpen(true)}
              >
                <LogIn className="mr-2 h-5 w-5" />
                🚀 INIZIA TURNO
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Login */}
        <Login 
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
          users={users}
          onAddUser={addUser}
        />
      </div>
    )
  }

  // Se utente è loggato, mostra l'app completa
  return (
    <div className="min-h-screen bg-gray-50">
      <DevModeBanner />
      <div className="container mx-auto px-4 py-8">
        {/* Header con info utente */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Business HACCP Manager
            </h1>
            <p className="text-gray-600">
              Benvenuto, <span className="font-['Dancing_Script'] font-semibold text-2xl text-purple-600">{currentUser.name} - {currentUser.role === 'admin' ? 'Admin' : 'Dipendente'}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Pulsanti principali */}
            <HeaderButtons
              onResetApp={resetApp}
              onOpenOnboarding={() => setShowOnboarding(true)}
              showResetApp={process.env.NODE_ENV === 'development'}
            />
            
            {/* Pulsanti di sviluppo - Sempre visibili se in dev mode */}
            <DevButtons
              onPrefillOnboarding={prefillOnboarding}
              onResetOnboarding={resetOnboarding}
              isDevMode={process.env.NODE_ENV === 'development'}
            />
            
            {/* Pulsanti dati */}
            <DataButtons
              onExportData={exportData}
              onImportData={importData}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(newTab) => {
          // Controlla se la sezione è accessibile
          const access = validation.canAccessSection(newTab)
          if (!access.isEnabled) {
            handleMissingRequirements(newTab)
            return
          }
          
          setActiveTab(newTab)
          updateLastCheck(newTab)
        }}>
          <TabsList className={`grid w-full ${isAdmin() ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-9' : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8'} gap-1 mb-8`}>
            <TabsTrigger value="dashboard" className="flex items-center gap-1 md:gap-2 text-sm relative" title="Home">
              <BarChart3 className="h-4 w-4" />
              <span className="sm:hidden">Home</span>
              <span className="hidden sm:inline">Home</span>
              <NotificationDot hasNotification={notifications.dashboard > 0} />
            </TabsTrigger>
            <TabsTrigger value="refrigerators" className="flex items-center gap-1 md:gap-2 text-sm relative" title="Punti di Conservazione">
              <Thermometer className="h-4 w-4" />
              <span className="sm:hidden text-xs">Frigo</span>
              <span className="hidden sm:inline">Punti di Conservazione</span>
              <NotificationDot hasNotification={notifications.refrigerators > 0} />
            </TabsTrigger>
            <TabsTrigger value="cleaning" className="flex items-center gap-1 md:gap-2 text-sm relative" title="Attività e Mansioni">
              <Sparkles className="h-4 w-4" />
              <span className="sm:hidden text-xs">Attività</span>
              <span className="hidden sm:inline">Attività e Mansioni</span>
              <NotificationDot hasNotification={notifications.cleaning > 0} />
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-1 md:gap-2 text-sm relative" title="Inventario">
              <Package className="h-4 w-4" />
              <span className="sm:hidden text-xs">Stock</span>
              <span className="hidden sm:inline">Inventario</span>
              <NotificationDot hasNotification={notifications.inventory > 0} />
            </TabsTrigger>
            <TabsTrigger value="labels" className="flex items-center gap-1 md:gap-2 text-sm relative" title="Gestione Etichette">
              <QrCode className="h-4 w-4" />
              <span className="sm:hidden text-xs">Etichette</span>
              <span className="hidden sm:inline">Gestione Etichette</span>
              <NotificationDot hasNotification={notifications.labels > 0} />
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex items-center gap-1 md:gap-2 text-sm" title="IA Assistant">
              <Bot className="h-4 w-4" />
              <span className="sm:hidden text-xs">IA</span>
              <span className="hidden sm:inline">IA Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="data-settings" className="flex items-center gap-1 md:gap-2 text-sm" title="Impostazioni e Dati">
              <Settings className="h-4 w-4" />
              <span className="sm:hidden text-xs">Settings</span>
              <span className="hidden sm:inline">Impostazioni e Dati</span>
            </TabsTrigger>
            {isAdmin() && (
              <TabsTrigger value="staff" className="flex items-center gap-1 md:gap-2 text-sm relative" title="Gestione">
                <Users className="h-4 w-4" />
                <span className="sm:hidden text-xs">Staff</span>
                <span className="hidden sm:inline">Gestione</span>
                <NotificationDot hasNotification={notifications.staff > 0} />
              </TabsTrigger>
            )}
            <div className="flex flex-col gap-1">
              {isAdmin() && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('staff')}
                  className="flex items-center gap-1 md:gap-2 text-sm h-9 px-3"
                  title="Impostazioni"
                >
                  <Settings className="h-4 w-4" />
                  <span className="sm:hidden text-xs">Settings</span>
                  <span className="hidden sm:inline">Impostazioni</span>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1 md:gap-2 text-sm h-9 px-3"
                title="Esci"
              >
                <LogOut className="h-4 w-4" />
                <span className="sm:hidden text-xs">Exit</span>
                <span className="hidden sm:inline">Esci</span>
              </Button>
            </div>
          </TabsList>

          {/* Tab Content - Mappatura Sezioni HACCP */}
          
          {/* Sezione: Home (ex Dashboard) - Overview e statistiche */}
          <TabsContent value="dashboard">
            <div className="space-y-6">
              {/* Original SyncManager - commented out temporarily */}
              {/* 
              <SyncManager
                currentUser={currentUser}
                companyId={companyId}
                pendingChanges={pendingChanges}
                lastSyncTime={lastSyncTime}
                onDataSync={handleDataSync}
                onAddPendingChange={addPendingChange}
              />
              */}
              
              <Dashboard 
                temperatures={temperatures}
                cleaning={cleaning}
                products={products}
                staff={staff}
                currentUser={currentUser}
              />
            </div>
          </TabsContent>

          {/* Sezione: Punti di Conservazione (ex Frigoriferi) - Gestione frigoriferi/freezer */}
          <TabsContent value="refrigerators">
            <PuntidiConservazione 
              temperatures={temperatures} 
              setTemperatures={(newTemperatures) => {
                setTemperatures(newTemperatures)
                trackDataChange('temperatures', newTemperatures)
              }}
              currentUser={currentUser}
              refrigerators={refrigerators}
              setRefrigerators={(newRefrigerators) => {
                setRefrigerators(newRefrigerators)
                trackDataChange('refrigerators', newRefrigerators)
              }}
              departments={departments}
              setDepartments={(newDepartments) => {
                setDepartments(newDepartments)
                trackDataChange('departments', newDepartments)
              }}
            />
          </TabsContent>

          {/* Sezione: Attività e Mansioni (ex Cleaning/Tasks) - Mansioni staff e checklist */}
          <TabsContent value="cleaning">
            <Cleaning 
              cleaning={cleaning} 
              setCleaning={(newCleaning) => {
                setCleaning(newCleaning)
                trackDataChange('cleaning', newCleaning)
              }}
              currentUser={currentUser}
              departments={departments}
            />
          </TabsContent>

          {/* Sezione: Inventario (ex Inventory) - Prodotti e stock */}
          <TabsContent value="inventory">
            <Inventory 
              products={products} 
              setProducts={(newProducts) => {
                setProducts(newProducts)
                trackDataChange('inventory', newProducts)
              }}
              currentUser={currentUser}
              refrigerators={refrigerators}
            />
          </TabsContent>

          {/* Sezione: Gestione Etichette (ex Product Labels) - Creazione/modifica etichette */}
          <TabsContent value="labels">
            <ProductLabels 
              productLabels={productLabels}
              setProductLabels={setProductLabels}
              products={products}
              currentUser={currentUser}
            />
          </TabsContent>

          {/* Sezione: IA Assistant (ex AI Assistant) - Assistente IA */}
          <TabsContent value="ai-assistant">
            <AIAssistantSection 
              currentUser={currentUser}
              products={products}
              temperatures={temperatures}
              cleaning={cleaning}
              staff={staff}
              onAction={(action) => {
                console.log('AI Action:', action)
                // Qui implementeremo le azioni dell'IA
              }}
            />
          </TabsContent>

          {/* Sezione: Impostazioni e Dati (ex Settings/Data) - Configurazioni, backup, manuale HACCP */}
          <TabsContent value="data-settings">
            <DataSettings
              currentUser={currentUser}
              isAdmin={isAdmin()}
              onSettingsChange={(settings) => {
                console.log('📱 Impostazioni dati aggiornate:', settings)
                // Qui implementeremo l'applicazione delle impostazioni
              }}
            />
          </TabsContent>

          {/* Sezione: Gestione (Admin only) - Gestione staff, utenti e configurazioni avanzate */}
          {isAdmin() && (
            <TabsContent value="staff">
              <div className="space-y-6">
                <Gestione 
                  staff={staff} 
                  setStaff={(newStaff) => {
                    setStaff(newStaff)
                    trackDataChange('staff', newStaff)
                  }}
                  users={users}
                  setUsers={setUsers}
                  currentUser={currentUser}
                  isAdmin={isAdmin()}
                  departments={onboardingCompleted ? departments : []}
                  setDepartments={(newDepartments) => {
                    setDepartments(newDepartments)
                    trackDataChange('departments', newDepartments)
                  }}
                />
                <StorageManager
                  temperatures={temperatures}
                  setTemperatures={setTemperatures}
                  cleaning={cleaning}
                  setCleaning={setCleaning}
                  products={products}
                  setProducts={setProducts}
                  refrigerators={refrigerators}
                  setRefrigerators={setRefrigerators}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* PDF Export Floating Button */}
        <PDFExport 
          activeTab={activeTab}
          temperatures={temperatures}
        />

        {/* AI Assistant */}
        {currentUser && showChatIcon && (
          <AIAssistant
            currentUser={currentUser}
            currentSection={activeTab}
            products={products}
            temperatures={temperatures}
            cleaning={cleaning}
            staff={staff}
            onAction={(action) => {
              console.log('AI Action:', action)
              // Qui implementeremo le azioni dell'IA
            }}
          />
        )}

        {/* Automatizzazioni */}
        {currentUser && (
          <ExpiryAlertAutomation
            products={products}
            onRecipeSuggestion={(recipes) => {
              console.log('Recipe suggestions:', recipes)
              // Qui implementeremo la gestione delle ricette
            }}
          />
        )}

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Onboarding Wizard */}
        {showOnboarding && (
          <OnboardingWizard
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
            onComplete={handleOnboardingComplete}
            currentData={appData}
          />
        )}

        {/* Bottom Sheet Guide per prerequisiti mancanti */}
        <BottomSheetGuide
          isOpen={showBottomSheet}
          onClose={() => setShowBottomSheet(false)}
          missingRequirements={validation.missingRequirements}
          suggestions={validation.getSuggestions()}
          onFixRequirement={handleFixRequirement}
        />
      </div>
    </div>
  )
}

export default App