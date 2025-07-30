import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { AlertTriangle, CheckCircle, Thermometer, Users, Calendar, Package } from 'lucide-react'

function Dashboard({ temperatures, cleaning, staff, products = [] }) {
  // Calculate temperature statistics
  const tempStats = temperatures.reduce((acc, temp) => {
    if (temp.status === 'ok') acc.ok++
    else if (temp.status === 'warning') acc.warning++
    else if (temp.status === 'danger') acc.danger++
    return acc
  }, { ok: 0, warning: 0, danger: 0 })

  // Get recent critical temperatures
  const criticalTemps = temperatures
    .filter(temp => temp.status === 'danger')
    .slice(-5)

  // Calculate cleaning completion rate
  const completedCleaning = cleaning.filter(task => task.completed).length
  const cleaningRate = cleaning.length > 0 ? Math.round((completedCleaning / cleaning.length) * 100) : 0

  // Get today's date for filtering
  const today = new Date().toLocaleDateString('it-IT')
  const todaysTemps = temperatures.filter(temp => temp.time.includes(today))

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature Oggi</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysTemps.length}</div>
            <p className="text-xs text-muted-foreground">
              {tempStats.danger > 0 && (
                <span className="text-red-600">⚠️ {tempStats.danger} critiche</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pulizie Complete</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cleaningRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedCleaning}/{cleaning.length} completate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventario</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {expiredProducts.length > 0 && (
                <span className="text-red-600">⚠️ {expiredProducts.length} scaduti</span>
              )}
              {expiredProducts.length === 0 && expiringProducts.length > 0 && (
                <span className="text-yellow-600">⚠️ {expiringProducts.length} in scadenza</span>
              )}
              {expiredProducts.length === 0 && expiringProducts.length === 0 && 'prodotti tracciati'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personale</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground">
              membri del team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ultimo Controllo</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {temperatures.length > 0 ? 'Oggi' : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {temperatures.length > 0 
                ? temperatures[temperatures.length - 1].time.split(' ')[1]
                : 'Nessun controllo'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {(criticalTemps.length > 0 || cleaningRate < 80 || expiredProducts.length > 0 || expiringProducts.length > 0) && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Attenzione Richiesta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalTemps.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-2">Temperature Critiche</h4>
                <div className="space-y-2">
                  {criticalTemps.map(temp => (
                    <div key={temp.id} className="flex justify-between items-center bg-red-50 p-2 rounded">
                      <span className="font-medium">{temp.location}</span>
                      <span className="text-red-600 font-bold">{temp.temperature}°C</span>
                      <span className="text-xs text-gray-500">{temp.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cleaningRate < 80 && (
              <div>
                <h4 className="font-medium text-orange-600 mb-2">Pulizie in Ritardo</h4>
                <p className="text-sm text-orange-600">
                  Solo {cleaningRate}% delle attività di pulizia sono state completate.
                  Controllare la sezione Pulizie.
                </p>
              </div>
            )}

            {expiredProducts.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-2">Prodotti Scaduti</h4>
                <div className="space-y-2">
                  {expiredProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="flex justify-between items-center bg-red-50 p-2 rounded">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-red-600 text-sm">
                        Scaduto il {new Date(product.expiryDate).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  ))}
                  {expiredProducts.length > 3 && (
                    <p className="text-sm text-red-600">...e altri {expiredProducts.length - 3} prodotti scaduti</p>
                  )}
                </div>
              </div>
            )}

            {expiringProducts.length > 0 && expiredProducts.length === 0 && (
              <div>
                <h4 className="font-medium text-yellow-600 mb-2">Prodotti in Scadenza</h4>
                <div className="space-y-2">
                  {expiringProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="flex justify-between items-center bg-yellow-50 p-2 rounded">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-yellow-600 text-sm">
                        Scade il {new Date(product.expiryDate).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  ))}
                  {expiringProducts.length > 3 && (
                    <p className="text-sm text-yellow-600">...e altri {expiringProducts.length - 3} prodotti in scadenza</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ultime Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            {temperatures.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nessuna temperatura registrata
              </p>
            ) : (
              <div className="space-y-2">
                {temperatures.slice(-5).reverse().map(temp => (
                  <div key={temp.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                    <div>
                      <div className="font-medium">{temp.location}</div>
                      <div className="text-xs text-gray-500">{temp.time}</div>
                    </div>
                    <div className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${temp.status === 'ok' 
                        ? 'bg-green-100 text-green-800' 
                        : temp.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }
                    `}>
                      {temp.temperature}°C
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attività Pulizie</CardTitle>
          </CardHeader>
          <CardContent>
            {cleaning.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nessuna attività di pulizia
              </p>
            ) : (
              <div className="space-y-2">
                {cleaning.slice(-5).reverse().map(task => (
                  <div key={task.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                    <div>
                      <div className="font-medium">{task.task}</div>
                      <div className="text-xs text-gray-500">
                        {task.assignee} • {task.date}
                      </div>
                    </div>
                    <div className={`
                      w-3 h-3 rounded-full
                      ${task.completed ? 'bg-green-500' : 'bg-gray-300'}
                    `} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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