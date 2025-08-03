import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { CheckCircle, AlertTriangle, Package, Calendar, Clock, ShoppingCart, FileText, Settings, LogOut, Thermometer, ListTodo, Search, ChevronDown, ChevronUp, Filter, User } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'

function Dashboard({ temperatures = [], cleaning = [], staff = [], products = [], currentUser, setActiveTab, onLogout, onSettings }) {
  const [timePeriod, setTimePeriod] = useState('today') // 'today', 'week', 'month', 'all'
  
  // Stati per l'espansione delle sezioni
  const [expandedSections, setExpandedSections] = useState({
    orders: false,
    products: false,
    temperatures: false,
    tasks: false
  })
  
  // Stati per la ricerca e filtri
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')

  // Calcola statistiche per mansioni non svolte
  const pendingTasks = cleaning.filter(task => !task.completed).length
  const completedTasks = cleaning.filter(task => task.completed).length

  // Calcola prodotti in scadenza
  const today = new Date()
  const expiringProducts = products.filter(product => {
    const expiryDate = new Date(product.expiryDate)
    const diffTime = expiryDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= 0
  }).length

  const expiredProducts = products.filter(product => {
    const expiryDate = new Date(product.expiryDate)
    return expiryDate < today
  }).length

  // Calcola problemi temperature
  const tempProblems = temperatures.filter(t => t.status === 'danger').length

  // Calcola liste della spesa generate (da localStorage)
  const shoppingListsGenerated = JSON.parse(localStorage.getItem('haccp-shopping-lists-count') || '0')

  // Calcola ordini e prodotti registrati nel periodo selezionato
  const getDateRange = () => {
    const now = new Date()
    switch(timePeriod) {
      case 'today':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          end: now
        }
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return { start: weekAgo, end: now }
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        return { start: monthAgo, end: now }
      case 'all':
        return { start: new Date(0), end: now } // Dal 1970 fino ad oggi
      default:
        return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), end: now }
    }
  }

  const { start, end } = getDateRange()
  
  // Filtra ordini per periodo
  const orders = JSON.parse(localStorage.getItem('haccp-orders') || '[]')
  const ordersInPeriod = orders.filter(order => {
    const orderDate = new Date(order.orderDate)
    return orderDate >= start && orderDate <= end
  }).length

  // Filtra prodotti registrati per periodo
  const productsInPeriod = products.filter(product => {
    const productDate = new Date(product.addedDate || product.createdAt || product.date)
    return productDate >= start && productDate <= end
  }).length

  // Filtra temperature registrate per periodo
  const temperaturesInPeriod = temperatures.filter(temp => {
    const tempDate = new Date(temp.timestamp || temp.date)
    return tempDate >= start && tempDate <= end
  }).length

  // Filtra mansioni completate per periodo
  const tasksCompletedInPeriod = cleaning.filter(task => {
    if (!task.completed) return false
    const taskDate = new Date(task.completedAt || task.date)
    return taskDate >= start && taskDate <= end
  }).length

  // Funzioni per gestire l'espansione
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Funzioni per filtrare i dati
  const filterData = (data, searchTerm, dateFilter, userFilter) => {
    return data.filter(item => {
      const matchesSearch = !searchTerm || 
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDate = !dateFilter || 
        (item.orderDate && new Date(item.orderDate).toLocaleDateString('it-IT').includes(dateFilter)) ||
        (item.createdAt && new Date(item.createdAt).toLocaleDateString('it-IT').includes(dateFilter)) ||
        (item.timestamp && new Date(item.timestamp).toLocaleDateString('it-IT').includes(dateFilter)) ||
        (item.completedAt && new Date(item.completedAt).toLocaleDateString('it-IT').includes(dateFilter))
      
      const matchesUser = !userFilter || 
        (item.createdBy && item.createdBy.toLowerCase().includes(userFilter.toLowerCase())) ||
        (item.userName && item.userName.toLowerCase().includes(userFilter.toLowerCase())) ||
        (item.addedByName && item.addedByName.toLowerCase().includes(userFilter.toLowerCase()))
      
      return matchesSearch && matchesDate && matchesUser
    })
  }

  // Dati filtrati per periodo
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate)
    return orderDate >= start && orderDate <= end
  })

  const filteredProducts = products.filter(product => {
    const productDate = new Date(product.addedDate || product.createdAt || product.date)
    return productDate >= start && productDate <= end
  })

  const filteredTemperatures = temperatures.filter(temp => {
    const tempDate = new Date(temp.timestamp || temp.date)
    return tempDate >= start && tempDate <= end
  })

  const filteredTasks = cleaning.filter(task => {
    if (!task.completed) return false
    const taskDate = new Date(task.completedAt || task.date)
    return taskDate >= start && taskDate <= end
  })

  // Componente per sezione espandibile
  const ExpandableSection = ({ title, count, icon, data, sectionKey, searchPlaceholder }) => {
    const isExpanded = expandedSections[sectionKey]
    const filteredData = filterData(data, searchTerm, dateFilter, userFilter)
    
    return (
      <div className="text-center p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
           onClick={() => toggleSection(sectionKey)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {icon}
            <div className="ml-3 text-left">
              <div className="text-2xl font-bold text-blue-600">{count}</div>
              <div className="text-sm text-blue-700">{title}</div>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5 text-blue-600" /> : <ChevronDown className="h-5 w-5 text-blue-600" />}
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            {/* Filtri di ricerca */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              <div>
                <Label className="text-xs">Cerca</Label>
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Data</Label>
                <Input
                  placeholder="Filtra per data..."
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Utente</Label>
                <Input
                  placeholder="Filtra per utente..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            
            {/* Lista dati */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredData.length === 0 ? (
                <div className="text-gray-500 text-sm py-4">
                  Nessun dato trovato con i filtri applicati
                </div>
              ) : (
                filteredData.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded border text-left text-sm">
                    {sectionKey === 'orders' && (
                      <div>
                        <div className="font-medium">Ordine #{item.orderId}</div>
                        <div className="text-gray-600">Fornitore: {item.supplierName}</div>
                        <div className="text-gray-600">Data: {new Date(item.orderDate).toLocaleDateString('it-IT')}</div>
                        {item.createdBy && <div className="text-gray-600">Utente: {item.createdBy}</div>}
                      </div>
                    )}
                    {sectionKey === 'products' && (
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-600">Categoria: {item.category}</div>
                        <div className="text-gray-600">Scadenza: {new Date(item.expiryDate).toLocaleDateString('it-IT')}</div>
                        {item.addedByName && <div className="text-gray-600">Utente: {item.addedByName}</div>}
                      </div>
                    )}
                    {sectionKey === 'temperatures' && (
                      <div>
                        <div className="font-medium">{item.location}</div>
                        <div className="text-gray-600">Temperatura: {item.temperature}°C</div>
                        <div className="text-gray-600">Data: {new Date(item.timestamp).toLocaleDateString('it-IT')}</div>
                        {item.userName && <div className="text-gray-600">Utente: {item.userName}</div>}
                      </div>
                    )}
                    {sectionKey === 'tasks' && (
                      <div>
                        <div className="font-medium">{item.task}</div>
                        <div className="text-gray-600">Assegnato a: {item.assignee}</div>
                        <div className="text-gray-600">Completato: {item.completedAt}</div>
                        {item.completedBy && <div className="text-gray-600">Utente: {item.completedBy}</div>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiche Principali */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ListTodo className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">{pendingTasks}</p>
                <p className="text-sm text-gray-600">Mansioni da Svolgere</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-orange-600">{expiringProducts + expiredProducts}</p>
                <p className="text-sm text-gray-600">Prodotti in Scadenza</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Thermometer className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-red-600">{tempProblems}</p>
                <p className="text-sm text-gray-600">Problemi Temperature</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">{shoppingListsGenerated}</p>
                <p className="text-sm text-gray-600">Liste Spesa Generate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selezione Periodo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Riepilogo Attività
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Caselle statistiche compatte sopra ai filtri */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-lg font-bold text-blue-600">{ordersInPeriod}</p>
                  <p className="text-xs text-blue-700">Ordini</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-lg font-bold text-green-600">{productsInPeriod}</p>
                  <p className="text-xs text-green-700">Prodotti</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-lg font-bold text-purple-600">{temperaturesInPeriod}</p>
                  <p className="text-xs text-purple-700">Temperature</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-lg font-bold text-orange-600">{tasksCompletedInPeriod}</p>
                  <p className="text-xs text-orange-700">Mansioni</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              variant={timePeriod === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('today')}
            >
              Oggi
            </Button>
            <Button
              variant={timePeriod === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('week')}
            >
              Questa Settimana
            </Button>
            <Button
              variant={timePeriod === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('month')}
            >
              Questo Mese
            </Button>
            <Button
              variant={timePeriod === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('all')}
            >
              Tutti
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExpandableSection
              title="Ordini Registrati"
              count={ordersInPeriod}
              icon={<FileText className="h-8 w-8 text-blue-600" />}
              data={filteredOrders}
              sectionKey="orders"
              searchPlaceholder="Cerca ordini, fornitori..."
            />
            
            <ExpandableSection
              title="Prodotti Registrati"
              count={productsInPeriod}
              icon={<Package className="h-8 w-8 text-green-600" />}
              data={filteredProducts}
              sectionKey="products"
              searchPlaceholder="Cerca prodotti, categorie..."
            />
            
            <ExpandableSection
              title="Controlli Temperature"
              count={temperaturesInPeriod}
              icon={<Thermometer className="h-8 w-8 text-purple-600" />}
              data={filteredTemperatures}
              sectionKey="temperatures"
              searchPlaceholder="Cerca posizioni, temperature..."
            />
            
            <ExpandableSection
              title="Mansioni Completate"
              count={tasksCompletedInPeriod}
              icon={<CheckCircle className="h-8 w-8 text-orange-600" />}
              data={filteredTasks}
              sectionKey="tasks"
              searchPlaceholder="Cerca mansioni, assegnati..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Benvenuto */}
      <Card>
        <CardHeader>
          <CardTitle>Benvenuto, {currentUser?.name}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Dashboard Business HACCP Manager</p>
          <p className="text-sm text-gray-500 mt-2">
            Ruolo: {currentUser?.role === 'admin' ? 'Amministratore' : 'Dipendente'} • 
            Reparto: {currentUser?.department}
          </p>
        </CardContent>
      </Card>

      {/* Pulsanti Impostazioni ed Esci */}
      <div className="flex gap-4 justify-center">
        {currentUser?.role === 'admin' && (
          <Button
            onClick={() => onSettings && onSettings()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Impostazioni
          </Button>
        )}
        <Button
          onClick={() => onLogout && onLogout()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>
    </div>
  )
}

export default Dashboard