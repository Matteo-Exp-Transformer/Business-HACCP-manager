import React, { useState, useEffect } from 'react'
import { BarChart3, Thermometer, Sparkles, Users, Package, Download, Upload, LogIn, LogOut, Settings } from 'lucide-react'
import Dashboard from './components/Dashboard'
import Temperature from './components/Temperature'
import Cleaning from './components/Cleaning'
import Staff from './components/Staff'
import Inventory from './components/Inventory'
import Login from './components/Login'
import PDFExport from './components/PDFExport'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card'
import { Button } from './components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [temperatures, setTemperatures] = useState([])
  const [cleaning, setCleaning] = useState([])
  const [staff, setStaff] = useState([])
  const [products, setProducts] = useState([])
  const [departments, setDepartments] = useState([])
  // Sistema utenti e login
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  // Load data from localStorage on app start
  useEffect(() => {
    const temps = localStorage.getItem('haccp-temperatures')
    const cleaningData = localStorage.getItem('haccp-cleaning')
    const staffData = localStorage.getItem('haccp-staff')
    const productsData = localStorage.getItem('haccp-products')
	const departmentsData = localStorage.getItem('haccp-departments')
    const usersData = localStorage.getItem('haccp-users')

    if (temps) setTemperatures(JSON.parse(temps))
    if (cleaningData) setCleaning(JSON.parse(cleaningData))
    if (staffData) setStaff(JSON.parse(staffData))
    if (productsData) setProducts(JSON.parse(productsData))
	if (departmentsData) setDepartments(JSON.parse(departmentsData))	
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
  }, [])

  // Funzioni gestione utenti
  const handleLogin = (user) => {
    setCurrentUser(user)
    setIsLoginModalOpen(false)
    
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
              Benvenuto, {currentUser.name} 
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {currentUser.role === 'admin' ? 'Admin' : 'Dipendente'}
              </span>
              <span className="ml-2 text-sm">
                ({currentUser.department})
              </span>
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
            {isAdmin() && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('staff')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Esci
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="temperature" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Temperature
            </TabsTrigger>
            <TabsTrigger value="cleaning" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Pulizie
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gestione
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="dashboard">
            <Dashboard 
              temperatures={temperatures} 
              cleaning={cleaning} 
              staff={staff}
              products={products}
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="temperature">
            <Temperature 
              temperatures={temperatures} 
              setTemperatures={setTemperatures}
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="cleaning">
            <Cleaning 
              cleaning={cleaning} 
              setCleaning={setCleaning}
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="inventory">
            <Inventory 
              products={products} 
              setProducts={setProducts}
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="staff">
            <Staff 
              staff={staff} 
              setStaff={setStaff}
              users={users}
              setUsers={setUsers}
              currentUser={currentUser}
              isAdmin={isAdmin()}
            />
          </TabsContent>
        </Tabs>

        {/* PDF Export Floating Button */}
        <PDFExport 
          activeTab={activeTab}
          temperatures={temperatures}
        />
      </div>
    </div>
  )
}

export default App