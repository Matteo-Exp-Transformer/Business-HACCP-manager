import React, { useState, useEffect } from 'react'
import { BarChart3, Thermometer, Sparkles, Users, Package, Download, Upload, LogIn, LogOut, Settings, QrCode, Bot } from 'lucide-react'
import Dashboard from './components/Dashboard'
import Cleaning from './components/Cleaning'
import Refrigerators from './components/Refrigerators'
import Staff from './components/Staff'
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

  // Load data from localStorage on app start
  useEffect(() => {
    const temps = localStorage.getItem('haccp-temperatures')
    const cleaningData = localStorage.getItem('haccp-cleaning')
    const refrigeratorsData = localStorage.getItem('haccp-refrigerators')
    const staffData = localStorage.getItem('haccp-staff')
    const productsData = localStorage.getItem('haccp-products')
	const departmentsData = localStorage.getItem('haccp-departments')
    const productLabelsData = localStorage.getItem('haccp-product-labels')
    const usersData = localStorage.getItem('haccp-users')
    const currentUserData = localStorage.getItem('haccp-current-user')

    if (temps) setTemperatures(JSON.parse(temps))
    if (cleaningData) setCleaning(JSON.parse(cleaningData))
    if (refrigeratorsData) setRefrigerators(JSON.parse(refrigeratorsData))
    if (staffData) setStaff(JSON.parse(staffData))
    if (productsData) setProducts(JSON.parse(productsData))
	if (departmentsData) setDepartments(JSON.parse(departmentsData))	
    if (productLabelsData) setProductLabels(JSON.parse(productLabelsData))
    
    if (usersData) {
      setUsers(JSON.parse(usersData))
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

    // Recupera l'utente corrente se era loggato prima della chiusura dell'app
    if (currentUserData) {
      setCurrentUser(JSON.parse(currentUserData))
    }

    // Recupera la preferenza per la visibilità della chat IA
    const chatIconPref = localStorage.getItem('haccp-show-chat-icon')
    if (chatIconPref !== null) {
      setShowChatIcon(JSON.parse(chatIconPref))
    }

    // Listener per i cambiamenti alle preferenze chat
    const handleStorageChange = (e) => {
      if (e.key === 'haccp-show-chat-icon') {
        setShowChatIcon(JSON.parse(e.newValue))
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
    const actions = JSON.parse(localStorage.getItem('haccp-actions') || '[]')
    actions.push(loginAction)
    localStorage.setItem('haccp-actions', JSON.stringify(actions))
    
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
    const newStaffMembers = staff.filter(member => 
      new Date(member.addedDate || member.createdAt || '2000-01-01') > new Date(lastCheckStaff)
    ).length
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
    addPendingChange(type, data, id)
  }

  // Auto-track data changes when arrays change
  useEffect(() => {
    // Skip initial load
    if (products.length > 0) {
      trackDataChange('inventory', products, 'auto-inventory')
    }
  }, [products])

  useEffect(() => {
    if (temperatures.length > 0) {
      trackDataChange('temperatures', temperatures, 'auto-temperatures')  
    }
  }, [temperatures])

  useEffect(() => {
    if (cleaning.length > 0) {
      trackDataChange('cleaning', cleaning, 'auto-cleaning')
    }
  }, [cleaning])

  useEffect(() => {
    if (staff.length > 0) {
      trackDataChange('staff', staff, 'auto-staff')
    }
  }, [staff])

  // Funzione per controllare etichette di prodotti scaduti oggi
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
      
      const actions = JSON.parse(localStorage.getItem('haccp-actions') || '[]')
      actions.push(logoutAction)
      localStorage.setItem('haccp-actions', JSON.stringify(actions))
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

  // Se non c'è utente loggato, mostra dashboard con pulsante "Inizia Turno"
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                      <span>
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
          
          <div className="flex gap-2">
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
                <span>
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
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(newTab) => {
          setActiveTab(newTab)
          updateLastCheck(newTab)
        }}>
          <TabsList className={`grid w-full ${isAdmin() ? 'grid-cols-3 md:grid-cols-9' : 'grid-cols-3 md:grid-cols-8'} gap-1 mb-8`}>
            <TabsTrigger value="dashboard" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm relative">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <NotificationDot hasNotification={notifications.dashboard > 0} />
            </TabsTrigger>
            <TabsTrigger value="refrigerators" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm relative">
              <Thermometer className="h-4 w-4" />
              <span className="hidden sm:inline">Frigoriferi e Freezer</span>
              <NotificationDot hasNotification={notifications.refrigerators > 0} />
            </TabsTrigger>
            <TabsTrigger value="cleaning" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm relative">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Attività e Mansioni</span>
              <NotificationDot hasNotification={notifications.cleaning > 0} />
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm relative">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventario</span>
              <NotificationDot hasNotification={notifications.inventory > 0} />
            </TabsTrigger>
            <TabsTrigger value="labels" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm relative">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Etichette</span>
              <NotificationDot hasNotification={notifications.labels > 0} />
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">IA Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="data-settings" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Dati</span>
            </TabsTrigger>
            {isAdmin() && (
              <TabsTrigger value="staff" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm relative">
                <Users className="h-4 w-4" />
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
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm h-9 px-3"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Impostazioni</span>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1 md:gap-2 text-xs md:text-sm h-9 px-3"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Esci</span>
              </Button>
            </div>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="dashboard">
            <div className="space-y-6">
              {/* Sync Manager - Always visible at top */}
              <SyncManager
                currentUser={currentUser}
                companyId={companyId}
                pendingChanges={pendingChanges}
                lastSyncTime={lastSyncTime}
                onDataSync={handleDataSync}
              />
              
              <Dashboard 
                temperatures={temperatures}
                cleaning={cleaning}
                products={products}
                staff={staff}
                currentUser={currentUser}
              />
            </div>
          </TabsContent>

          <TabsContent value="refrigerators">
            <Refrigerators 
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
            />
          </TabsContent>

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

          <TabsContent value="labels">
            <ProductLabels 
              productLabels={productLabels}
              setProductLabels={setProductLabels}
              products={products}
              currentUser={currentUser}
            />
          </TabsContent>

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

          {isAdmin() && (
            <TabsContent value="staff">
              <div className="space-y-6">
                <Staff 
                  staff={staff} 
                  setStaff={(newStaff) => {
                    setStaff(newStaff)
                    trackDataChange('staff', newStaff)
                  }}
                  users={users}
                  setUsers={setUsers}
                  currentUser={currentUser}
                  isAdmin={isAdmin()}
                />
                <StorageManager
                  temperatures={temperatures}
                  setTemperatures={setTemperatures}
                  cleaning={cleaning}
                  setCleaning={setCleaning}
                  productLabels={productLabels}
                  setProductLabels={setProductLabels}
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
      </div>
    </div>
  )
}

export default App