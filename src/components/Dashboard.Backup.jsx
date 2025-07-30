import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { AlertTriangle, CheckCircle, Thermometer, Users, Calendar, Clock, User, Package } from 'lucide-react'

function Dashboard({ temperatures, cleaning, staff, products = [], currentUser }) {
  // Calcola statistiche temperature
  const tempStats = {
    ok: temperatures.filter(t => t.status === 'ok').length,
    warning: temperatures.filter(t => t.status === 'warning').length,
    danger: temperatures.filter(t => t.status === 'danger').length
  }

  // Temperature critiche (ultime 24h)
  const criticalTemps = temperatures
    .filter(temp => temp.status === 'danger')
    .slice(-5) // Mostra solo le ultime 5

  // Statistiche pulizie
  const completedCleaning = cleaning.filter(task => task.completed).length
  const cleaningRate = cleaning.length > 0 ? Math.round((completedCleaning / cleaning.length) * 100) : 0

  // Get recent activities based on current user
  const userActions = JSON.parse(localStorage.getItem('haccp-actions') || '[]')
  const recentUserActions = userActions
    .filter(action => action.user === currentUser?.id)
    .slice(-5)
    .reverse()

  // Get today's activities
  const today = new Date().toISOString().split('T')[0]
  const todayActions = userActions.filter(action => 
    action.timestamp.startsWith(today)
  )

  // Calculate product statistics
  const productStats = {
    total: products.length,
    expired: products.filter(product => {
      const expiryDate = new Date(product.expiryDate)
      return expiryDate < new Date()
    }).length,
    expiringSoon: products.filter(product => {
      const expiryDate = new Date(product.expiryDate)
      const today = new Date()
      const diffTime = expiryDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays > 0
    }).length,
    byCategory: products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1
      return acc
    }, {})
  }

  // Calculate inventory statistics
  const expiringProducts = products.filter(product => {
    if (!product.expiryDate) return false
    const today = new Date()
    const expiry = new Date(product.expiryDate)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0
  })

  const expiredProducts = products.filter(product => {
    if (!product.expiryDate) return false
    return new Date(product.expiryDate) < new Date()
  })

  return (
return (
    <div className="space-y-6">
      {/* Statistiche Principali */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">{tempStats.ok}</p>
                <p className="text-sm text-gray-600">Temperature OK</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-red-600">{tempStats.danger}</p>
                <p className="text-sm text-gray-600">Allarmi Temp.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">{cleaningRate}%</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">{completedCleaning}/{cleaning.length}</p>
                <p className="text-sm text-gray-600">Pulizie Completate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-purple-600">{productStats.total}</p>
                <p className="text-sm text-gray-600">Prodotti Inventario</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informazioni Utente Corrente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Il Tuo Turno - {currentUser?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Informazioni</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Reparto:</span>
                  <span className="font-medium">{currentUser?.department}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ruolo:</span>
                  <span className="font-medium">
                    {currentUser?.role === 'admin' ? 'Amministratore' : 'Dipendente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Accesso:</span>
                  <span className="font-medium">
                    {new Date().toLocaleTimeString('it-IT')}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Le Tue Attività Recenti</h4>
              <div className="space-y-1 text-sm max-h-24 overflow-y-auto">
                {recentUserActions.length > 0 ? (
                  recentUserActions.map(action => (
                    <div key={action.id} className="flex justify-between text-xs">
                      <span className="truncate">{action.description || action.type}</span>
                      <span className="text-gray-500 ml-2">
                        {new Date(action.timestamp).toLocaleTimeString('it-IT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs">Nessuna attività registrata</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventario e Alert */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Prodotti in Scadenza */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Prodotti in Scadenza
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productStats.expired > 0 || productStats.expiringSoon > 0 ? (
              <div className="space-y-3">
                {productStats.expired > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">{productStats.expired} prodotti scaduti</span>
                    </div>
                  </div>
                )}
                {productStats.expiringSoon > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">{productStats.expiringSoon} prodotti in scadenza (7 giorni)</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>Tutti i prodotti sono freschi</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Temperature Critiche */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Temperature Critiche
            </CardTitle>
          </CardHeader>
          <CardContent>
            {criticalTemps.length > 0 ? (
              <div className="space-y-3">
                {criticalTemps.map(temp => (
                  <div key={temp.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">{temp.location}</p>
                      <p className="text-sm text-red-700">
                        {temp.temperature}°C - {new Date(temp.timestamp).toLocaleTimeString('it-IT')}
                      </p>
                    </div>
                    <Thermometer className="h-5 w-5 text-red-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>Tutte le temperature sono nella norma</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni Rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 text-center bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Thermometer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Controllo Temperature</p>
            </button>
            
            <button className="p-4 text-center bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Completa Pulizie</p>
            </button>
            
            <button className="p-4 text-center bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Gestisci Inventario</p>
            </button>
            
            <button className="p-4 text-center bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Gestione Staff</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
            </div>
          )}


              <div>
                <Label htmlFor="user-select">Seleziona Utente</Label>
                <select
                  id="user-select"
                  value={selectedUser}
                  onChange={(e) => {
                    setSelectedUser(e.target.value)
                    setError('')
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Scegli utente --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.department})
                      {user.role === 'admin' && ' - Admin'}
                    </option>
                  ))}
                </select>
              </div>

              {/* PIN */}
              <div>
                <Label htmlFor="pin">PIN (4 cifre)</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setPin(value)
                      setError('')
                    }}
                    maxLength={4}
                    placeholder="••••"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Pulsanti */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleLogin}
                  className="flex-1"
                  disabled={!selectedUser || pin.length !== 4}
                >
                  <User className="mr-2 h-4 w-4" />
                  Entra
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Annulla
                </Button>
              </div>

              {/* Aggiungi nuovo utente */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddUser(true)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi Nuovo Utente
                </Button>
              </div>
            </div>
          ) : (
            // Form Nuovo Utente
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <Label htmlFor="new-name">Nome Completo</Label>
                <Input
                  id="new-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="es. Mario Rossi"
                />
              </div>

              </div>

              {/* Ruolo */}
              <div>
                <Label htmlFor="new-role">Ruolo</Label>
                <select
                  id="new-role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="employee">Dipendente</option>
                  <option value="admin">Amministratore</option>
                </select>
              </div>

              {/* Reparto */}
              <div>
                <Label htmlFor="new-department">Reparto</Label>
                <select
                  id="new-department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Pulsanti */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddUser}
                  className="flex-1"
                  disabled={!newUser.name.trim() || newUser.pin.length !== 4}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crea Utente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddUser(false)
                    setError('')
                  }}
                >
                  Indietro
                </Button>
              </div>
 <Card>
          <CardHeader>
            <CardTitle>Inventario Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nessun prodotto in inventario
              </p>
            ) : (
              <div className="space-y-2">
                {products.slice(-5).reverse().map(product => {
                  const isExpiring = product.expiryDate && (() => {
                    const today = new Date()
                    const expiry = new Date(product.expiryDate)
                    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
                    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0
                  })()
                  
                  const isExpired = product.expiryDate && new Date(product.expiryDate) < new Date()
                  
                  return (
                    <div key={product.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          {product.location} • {product.category}
                        </div>
                      </div>
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${isExpired 
                          ? 'bg-red-100 text-red-800' 
                          : isExpiring
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        }
                      `}>
                        {isExpired ? 'Scaduto' : isExpiring ? 'In scadenza' : 'OK'}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
      </div>
    </div>
  )
}

export default Login