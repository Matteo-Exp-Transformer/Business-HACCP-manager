import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Trash2, Thermometer, AlertTriangle, CheckCircle, User } from 'lucide-react'

function Temperature({ temperatures, setTemperatures, currentUser }) {
  const [formData, setFormData] = useState({
    location: '',
    temperature: ''
  })

  // Save temperatures to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('haccp-temperatures', JSON.stringify(temperatures))
  }, [temperatures])

  const getTemperatureStatus = (temp) => {
    if (temp < 0 || temp > 8) return 'danger'
    if (temp >= 6 && temp <= 8) return 'warning'
    return 'ok'
  }

  const addTemperature = (e) => {
    e.preventDefault()
    
    if (!formData.location.trim() || !formData.temperature.trim()) {
      return
    }

    const tempValue = parseFloat(formData.temperature)
    if (isNaN(tempValue)) {
      return
    }

    const newTemperature = {
      id: Date.now(),
      location: formData.location.trim(),
      temperature: tempValue,
      status: getTemperatureStatus(tempValue),
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleString('it-IT'),
      user: currentUser?.id,
      userName: currentUser?.name,
      userDepartment: currentUser?.department
    }

    setTemperatures([...temperatures, newTemperature])
    
    // Registra l'azione nel log
    const action = {
      id: Date.now() + 1,
      timestamp: new Date().toISOString(),
      user: currentUser?.id,
      userName: currentUser?.name,
      type: 'temperature_check',
      description: `Controllo temperatura ${formData.location}: ${tempValue}°C`,
      location: formData.location,
      value: tempValue,
      status: getTemperatureStatus(tempValue)
    }
    
    const actions = JSON.parse(localStorage.getItem('haccp-actions') || '[]')
    actions.push(action)
    localStorage.setItem('haccp-actions', JSON.stringify(actions))

    setFormData({ location: '', temperature: '' })
  }

  const deleteTemperature = (id) => {
    setTemperatures(temperatures.filter(temp => temp.id !== id))
    
    // Registra l'azione di cancellazione
    const action = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: currentUser?.id,
      userName: currentUser?.name,
      type: 'temperature_delete',
      description: `Eliminato controllo temperatura`
    }
    
    const actions = JSON.parse(localStorage.getItem('haccp-actions') || '[]')
    actions.push(action)
    localStorage.setItem('haccp-actions', JSON.stringify(actions))
  }

  const getStatusBadge = (status) => {
    const badges = {
      ok: <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">OK</span>,
      warning: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Attenzione</span>,
      danger: <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Critica</span>
    }
    return badges[status]
  }

  return (
    <div className="space-y-6">
      {/* Form per nuova temperatura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Registra Temperatura
          </CardTitle>
          {currentUser && (
            <p className="text-sm text-gray-600">
              Registrando come: <span className="font-medium">{currentUser.name}</span> ({currentUser.department})
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={addTemperature} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Posizione</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="es. Frigo Carne, Congelatore A..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="temperature">Temperatura (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                  placeholder="es. 4.2"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              <Thermometer className="mr-2 h-4 w-4" />
              Registra Temperatura
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Statistiche rapide */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {temperatures.filter(t => t.status === 'ok').length}
            </div>
            <div className="text-sm text-gray-600">Temperature OK</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {temperatures.filter(t => t.status === 'warning').length}
            </div>
            <div className="text-sm text-gray-600">Attenzioni</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {temperatures.filter(t => t.status === 'danger').length}
            </div>
            <div className="text-sm text-gray-600">Critiche</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista temperature registrate */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature Registrate</CardTitle>
        </CardHeader>
        <CardContent>
          {temperatures.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Thermometer className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Nessuna temperatura registrata</p>
              <p className="text-sm">Inizia registrando la prima temperatura</p>
            </div>
          ) : (
            <div className="space-y-3">
              {temperatures.slice().reverse().map(temp => (
                <div 
                  key={temp.id} 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    temp.status === 'danger' ? 'border-red-200 bg-red-50' :
                    temp.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{temp.location}</h3>
                        {getStatusBadge(temp.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Temperatura:</span>
                          <div className="font-bold text-lg">{temp.temperature}°C</div>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">Registrato:</span>
                          <div className="font-medium">{temp.time}</div>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">Operatore:</span>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium">
                              {temp.userName || 'N/A'}
                            </span>
                            {temp.userDepartment && (
                              <span className="text-gray-500">
                                ({temp.userDepartment})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemperature(temp.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Alert per temperature critiche */}
                  {temp.status === 'danger' && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Temperatura critica!</span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">
                        Verificare immediatamente lo stato dei prodotti e controllare il funzionamento dell'apparecchio.
                      </p>
                    </div>
                  )}
                  
                  {temp.status === 'warning' && (
                    <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Temperatura di attenzione</span>
                      </div>
                      <p className="text-yellow-700 text-sm mt-1">
                        Controllare periodicamente e verificare che non aumenti ulteriormente.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Temperature