import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Trash2, Thermometer, AlertTriangle, CheckCircle, User, Plus, Search, MapPin, Calendar, Settings, Edit } from 'lucide-react'

function Refrigerators({ temperatures, setTemperatures, currentUser, refrigerators, setRefrigerators }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRefrigerator, setEditingRefrigerator] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    setTemperature: '',
    location: '',
    dedicatedTo: '',
    nextMaintenance: ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Funzione per determinare il tipo di frigorifero in base alla temperatura
  const getRefrigeratorType = (temperature) => {
    if (temperature < -13.5 && temperature >= -80) {
      return 'Abbattitore'
    } else if (temperature < -2.5 && temperature >= -13.5) {
      return 'Freezer'
    } else if ((temperature >= -2.5 && temperature <= 0) || (temperature > 0 && temperature <= 14)) {
      return 'Frigo'
    } else {
      return 'N/A'
    }
  }



  const addRefrigerator = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.setTemperature.trim()) {
      return
    }

    // Check for duplicate name (only among currently active refrigerators)
    // Note: Deleted refrigerators are removed from the array, so their names can be reused
    const existingRefrigerator = refrigerators.find(ref => 
      ref.name.toLowerCase() === formData.name.trim().toLowerCase()
    )
    
    if (existingRefrigerator) {
      alert(`Un frigorifero/freezer con questo nome esiste già: "${existingRefrigerator.name}" (creato il ${new Date(existingRefrigerator.createdAt).toLocaleDateString('it-IT')}). Scegli un nome diverso.`)
      return
    }

    const setTempValue = parseFloat(formData.setTemperature)
    if (isNaN(setTempValue)) {
      return
    }

    const newRefrigerator = {
      id: Date.now(),
      name: formData.name.trim(),
      setTemperature: setTempValue,
      location: formData.location.trim(),
      dedicatedTo: formData.dedicatedTo.trim(),
      nextMaintenance: formData.nextMaintenance.trim(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Unknown'
    }

    setRefrigerators([...refrigerators, newRefrigerator])
    setFormData({
      name: '',
      setTemperature: '',
      location: '',
      dedicatedTo: '',
      nextMaintenance: ''
    })
    setShowAddModal(false)
  }

  const deleteRefrigerator = (id) => {
    if (confirm('Sei sicuro di voler eliminare questo frigorifero/freezer?')) {
      setRefrigerators(refrigerators.filter(ref => ref.id !== id))
    }
  }

  const editRefrigerator = (refrigerator) => {
    setEditingRefrigerator(refrigerator)
    setFormData({
      name: refrigerator.name,
      setTemperature: refrigerator.setTemperature.toString(),
      location: refrigerator.location || '',
      dedicatedTo: refrigerator.dedicatedTo || '',
      nextMaintenance: refrigerator.nextMaintenance || ''
    })
    setShowEditModal(true)
  }

  const updateRefrigerator = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.setTemperature.trim()) {
      return
    }

    // Check for duplicate name (excluding the current refrigerator being edited)
    const existingRefrigerator = refrigerators.find(ref => 
      ref.id !== editingRefrigerator.id && 
      ref.name.toLowerCase() === formData.name.trim().toLowerCase()
    )
    
    if (existingRefrigerator) {
      alert('Un frigorifero/freezer con questo nome esiste già. Scegli un nome diverso.')
      return
    }

    const setTempValue = parseFloat(formData.setTemperature)
    if (isNaN(setTempValue)) {
      return
    }

    const updatedRefrigerator = {
      ...editingRefrigerator,
      name: formData.name.trim(),
      setTemperature: setTempValue,
      location: formData.location.trim(),
      dedicatedTo: formData.dedicatedTo.trim(),
      nextMaintenance: formData.nextMaintenance.trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || 'Unknown'
    }

    setRefrigerators(refrigerators.map(ref => 
      ref.id === editingRefrigerator.id ? updatedRefrigerator : ref
    ))
    
    setFormData({
      name: '',
      setTemperature: '',
      location: '',
      dedicatedTo: '',
      nextMaintenance: ''
    })
    setEditingRefrigerator(null)
    setShowEditModal(false)
  }

  const getTemperatureStatus = (refrigerator) => {
    // Find the last temperature recording for this refrigerator
    const lastTemperature = temperatures
      .filter(temp => temp.location.toLowerCase().includes(refrigerator.name.toLowerCase()))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]

    if (!lastTemperature) return 'no-data'

    const tempDiff = Math.abs(lastTemperature.temperature - refrigerator.setTemperature)
    
    if (tempDiff <= 1) return 'green'
    if (tempDiff <= 1.5) return 'orange'
    if (tempDiff >= 2) return 'red'
    return 'orange' // Default case
  }

  const getStatusDot = (status) => {
    const colors = {
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      'no-data': 'bg-gray-400'
    }
    return <div className={`w-3 h-3 rounded-full ${colors[status]}`}></div>
  }

  const getStatusText = (status) => {
    const texts = {
      green: 'Temperatura OK',
      orange: 'Attenzione',
      red: 'Critica',
      'no-data': 'Nessun dato'
    }
    return texts[status]
  }

  const filteredRefrigerators = refrigerators.filter(ref => 
    ref.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTemperatures = temperatures.filter(temp => 
    refrigerators.some(ref => 
      temp.location.toLowerCase().includes(ref.name.toLowerCase())
    )
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return (
    <div className="space-y-6">
      {/* Section 1: Frigoriferi e Freezer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Frigoriferi e Freezer
            </span>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Aggiungi Frigo / Freezer
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {refrigerators.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Thermometer className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nessun frigorifero/freezer registrato</p>
              <p className="text-sm">Aggiungi il primo frigorifero per iniziare</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Categorie frigoriferi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Frigoriferi (-2.5°C a 0°C e 0°C a +14°C) */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Frigoriferi
                  </h3>
                  <div className="space-y-2">
                    {filteredRefrigerators
                      .filter(ref => (ref.setTemperature >= -2.5 && ref.setTemperature <= 0) || (ref.setTemperature > 0 && ref.setTemperature <= 14))
                      .map(refrigerator => {
                        const status = getTemperatureStatus(refrigerator)
                        return (
                          <div key={refrigerator.id} className={`p-3 border rounded-lg ${
                            status === 'green' ? 'bg-green-50 border-green-200' :
                            status === 'orange' ? 'bg-orange-50 border-orange-200' :
                            status === 'red' ? 'bg-red-50 border-red-200' :
                            'bg-white border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusDot(status)}
                                <div>
                                  <h4 className="font-medium text-sm">{refrigerator.name}</h4>
                                  <p className={`text-xs ${
                                    status === 'green' ? 'text-green-600' :
                                    status === 'orange' ? 'text-orange-600' :
                                    status === 'red' ? 'text-red-600' :
                                    'text-gray-600'
                                  }`}>{getStatusText(status)}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {currentUser?.role === 'admin' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => editRefrigerator(refrigerator)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => deleteRefrigerator(refrigerator.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {refrigerator.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-500" />
                                  <span className="text-gray-600">{refrigerator.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Thermometer className="h-3 w-3 text-gray-500" />
                                <span className="font-medium">{refrigerator.setTemperature}°C</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    {filteredRefrigerators.filter(ref => (ref.setTemperature >= -2.5 && ref.setTemperature <= 0) || (ref.setTemperature > 0 && ref.setTemperature <= 14)).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nessun frigorifero</p>
                    )}
                  </div>
                </div>

                {/* Freezer (-2.5°C a -13.5°C) */}
                <div className="border rounded-lg p-4 bg-purple-50">
                  <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Freezer
                  </h3>
                  <div className="space-y-2">
                    {filteredRefrigerators
                      .filter(ref => ref.setTemperature < -2.5 && ref.setTemperature >= -13.5)
                      .map(refrigerator => {
                        const status = getTemperatureStatus(refrigerator)
                        return (
                          <div key={refrigerator.id} className={`p-3 border rounded-lg ${
                            status === 'green' ? 'bg-green-50 border-green-200' :
                            status === 'orange' ? 'bg-orange-50 border-orange-200' :
                            status === 'red' ? 'bg-red-50 border-red-200' :
                            'bg-white border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusDot(status)}
                                <div>
                                  <h4 className="font-medium text-sm">{refrigerator.name}</h4>
                                  <p className={`text-xs ${
                                    status === 'green' ? 'text-green-600' :
                                    status === 'orange' ? 'text-orange-600' :
                                    status === 'red' ? 'text-red-600' :
                                    'text-gray-600'
                                  }`}>{getStatusText(status)}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {currentUser?.role === 'admin' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => editRefrigerator(refrigerator)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => deleteRefrigerator(refrigerator.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {refrigerator.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-500" />
                                  <span className="text-gray-600">{refrigerator.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Thermometer className="h-3 w-3 text-gray-500" />
                                <span className="font-medium">{refrigerator.setTemperature}°C</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    {filteredRefrigerators.filter(ref => ref.setTemperature < -2.5 && ref.setTemperature >= -13.5).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nessun freezer</p>
                    )}
                  </div>
                </div>

                {/* Abbattitore (-13.5°C a -80°C) */}
                <div className="border rounded-lg p-4 bg-red-50">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Abbattitore
                  </h3>
                  <div className="space-y-2">
                    {filteredRefrigerators
                      .filter(ref => ref.setTemperature < -13.5 && ref.setTemperature >= -80)
                      .map(refrigerator => {
                        const status = getTemperatureStatus(refrigerator)
                        return (
                          <div key={refrigerator.id} className={`p-3 border rounded-lg ${
                            status === 'green' ? 'bg-green-50 border-green-200' :
                            status === 'orange' ? 'bg-orange-50 border-orange-200' :
                            status === 'red' ? 'bg-red-50 border-red-200' :
                            'bg-white border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusDot(status)}
                                <div>
                                  <h4 className="font-medium text-sm">{refrigerator.name}</h4>
                                  <p className={`text-xs ${
                                    status === 'green' ? 'text-green-600' :
                                    status === 'orange' ? 'text-orange-600' :
                                    status === 'red' ? 'text-red-600' :
                                    'text-gray-600'
                                  }`}>{getStatusText(status)}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {currentUser?.role === 'admin' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => editRefrigerator(refrigerator)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => deleteRefrigerator(refrigerator.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {refrigerator.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-500" />
                                  <span className="text-gray-600">{refrigerator.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Thermometer className="h-3 w-3 text-gray-500" />
                                <span className="font-medium">{refrigerator.setTemperature}°C</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    {filteredRefrigerators.filter(ref => ref.setTemperature < -13.5 && ref.setTemperature >= -80).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nessun abbattitore</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Attività Registro Temperature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attività Registro Temperature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cerca per nome frigorifero, utente, data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredTemperatures.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Thermometer className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nessuna attività di registrazione temperatura</p>
                <p className="text-sm">Le registrazioni appariranno qui dopo aver aggiunto frigoriferi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTemperatures.map(temp => {
                  const relatedRefrigerator = refrigerators.find(ref => 
                    temp.location.toLowerCase().includes(ref.name.toLowerCase())
                  )
                  
                  return (
                    <div key={temp.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{temp.location}</h3>
                            {relatedRefrigerator && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {relatedRefrigerator.name}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Temperatura rilevata:</span>
                              <div className="font-bold text-lg">{temp.temperature}°C</div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600">Data rilevamento:</span>
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
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Stato Frigoriferi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Stato Frigoriferi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {refrigerators.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nessun frigorifero registrato</p>
              <p className="text-sm">Aggiungi frigoriferi per visualizzare lo stato</p>
            </div>
          ) : (
            <div className="space-y-3">
              {refrigerators.map(refrigerator => {
                const status = getTemperatureStatus(refrigerator)
                const lastTemperature = temperatures
                  .filter(temp => temp.location.toLowerCase().includes(refrigerator.name.toLowerCase()))
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]

                return (
                  <div key={refrigerator.id} className={`p-4 border rounded-lg ${
                    status === 'green' ? 'bg-green-50 border-green-200' :
                    status === 'orange' ? 'bg-orange-50 border-orange-200' :
                    status === 'red' ? 'bg-red-50 border-red-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{refrigerator.name}</h3>
                          {getStatusDot(status)}
                          <span className={`text-sm font-medium ${
                            status === 'green' ? 'text-green-700' :
                            status === 'orange' ? 'text-orange-700' :
                            status === 'red' ? 'text-red-700' :
                            'text-gray-600'
                          }`}>{getStatusText(status)}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Temperatura impostata:</span>
                            <div className="font-medium">{refrigerator.setTemperature}°C ({getRefrigeratorType(refrigerator.setTemperature)})</div>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">Posizionamento:</span>
                            <div className="font-medium">{refrigerator.location || 'Non specificato'}</div>
                          </div>
                        </div>

                        {lastTemperature && (
                          <div className={`mt-3 p-3 rounded-lg ${
                            status === 'green' ? 'bg-green-100' :
                            status === 'orange' ? 'bg-orange-100' :
                            status === 'red' ? 'bg-red-100' :
                            'bg-gray-100'
                          }`}>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Ultima registrazione:</span>
                              <span className="font-medium">{lastTemperature.temperature}°C</span>
                              <span className="text-gray-500">il {lastTemperature.time}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Refrigerator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Aggiungi Frigorifero/Freezer</h2>
            
            <form onSubmit={addRefrigerator} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Frigorifero</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="es. Frigo Carne, Freezer A..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="setTemperature">Temperatura Impostata (°C)</Label>
                <Input
                  id="setTemperature"
                  type="number"
                  step="0.1"
                  value={formData.setTemperature}
                  onChange={(e) => setFormData({...formData, setTemperature: e.target.value})}
                  placeholder="es. 4.0"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="location">Posizionamento</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="es. Cucina principale, Deposito..."
                />
              </div>
              
              <div>
                <Label htmlFor="dedicatedTo">Dedicato a</Label>
                <Input
                  id="dedicatedTo"
                  type="text"
                  value={formData.dedicatedTo}
                  onChange={(e) => setFormData({...formData, dedicatedTo: e.target.value})}
                  placeholder="es. Carne, Pesce, Verdure..."
                />
              </div>
              
              <div>
                <Label htmlFor="nextMaintenance">Prossima Manutenzione Stimata</Label>
                <Input
                  id="nextMaintenance"
                  type="text"
                  value={formData.nextMaintenance}
                  onChange={(e) => setFormData({...formData, nextMaintenance: e.target.value})}
                  placeholder="es. 15/12/2024"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Aggiungi
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Refrigerator Modal */}
      {showEditModal && editingRefrigerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Modifica Frigorifero/Freezer</h2>
            
            <form onSubmit={updateRefrigerator} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome Frigorifero</Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="es. Frigo Carne, Freezer A..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-setTemperature">Temperatura Impostata (°C)</Label>
                <Input
                  id="edit-setTemperature"
                  type="number"
                  step="0.1"
                  value={formData.setTemperature}
                  onChange={(e) => setFormData({...formData, setTemperature: e.target.value})}
                  placeholder="es. 4.0"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-location">Posizionamento</Label>
                <Input
                  id="edit-location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="es. Cucina principale, Deposito..."
                />
              </div>
              
              <div>
                <Label htmlFor="edit-dedicatedTo">Dedicato a</Label>
                <Input
                  id="edit-dedicatedTo"
                  type="text"
                  value={formData.dedicatedTo}
                  onChange={(e) => setFormData({...formData, dedicatedTo: e.target.value})}
                  placeholder="es. Carne, Pesce, Verdure..."
                />
              </div>
              
              <div>
                <Label htmlFor="edit-nextMaintenance">Prossima Manutenzione Stimata</Label>
                <Input
                  id="edit-nextMaintenance"
                  type="text"
                  value={formData.nextMaintenance}
                  onChange={(e) => setFormData({...formData, nextMaintenance: e.target.value})}
                  placeholder="es. 15/12/2024"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Aggiorna
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingRefrigerator(null)
                    setFormData({
                      name: '',
                      setTemperature: '',
                      location: '',
                      dedicatedTo: '',
                      nextMaintenance: ''
                    })
                  }}
                  className="flex-1"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Refrigerators 