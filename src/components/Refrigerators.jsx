import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Trash2, Thermometer, AlertTriangle, CheckCircle, User, Plus, Search, MapPin, Calendar, Settings, Edit, Clock } from 'lucide-react'

function Refrigerators({ temperatures, setTemperatures, currentUser, refrigerators, setRefrigerators, staff = [] }) {
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
  
  // Stati per registrazione temperature
  const [tempFormData, setTempFormData] = useState({
    location: '',
    temperature: ''
  })



  const addRefrigerator = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.setTemperature.trim()) {
      return
    }

    // Check for duplicate name
    const existingRefrigerator = refrigerators.find(ref => 
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

    const newRefrigerator = {
      id: Date.now(),
      name: formData.name.trim(),
      setTemperature: setTempValue,
      location: formData.location.trim(),
      dedicatedTo: formData.dedicatedTo.trim(),
      cleaningDate: formData.cleaningDate,
      cleaningAssignee: formData.cleaningAssignee,
      cleaningFrequency: formData.cleaningFrequency,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Unknown'
    }

    setRefrigerators([...refrigerators, newRefrigerator])
    
    // Se è stata configurata una pulizia straordinaria, crea un'attività
    if (formData.cleaningDate && formData.cleaningAssignee && formData.cleaningFrequency) {
      const cleaningTask = {
        id: Date.now() + 1,
        task: `Pulizia straordinaria frigorifero: ${formData.name}`,
        assignee: formData.cleaningAssignee,
        frequency: formData.cleaningFrequency,
        date: formData.cleaningDate,
        completed: false,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name,
        type: 'cleaning_task'
      }
      
      const currentCleaning = JSON.parse(localStorage.getItem('haccp-cleaning') || '[]')
      currentCleaning.push(cleaningTask)
      localStorage.setItem('haccp-cleaning', JSON.stringify(currentCleaning))
    }
    
    setFormData({
      name: '',
      setTemperature: '',
      location: '',
      dedicatedTo: '',
      cleaningDate: '',
      cleaningAssignee: '',
      cleaningFrequency: ''
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
      cleaningDate: refrigerator.cleaningDate || '',
      cleaningAssignee: refrigerator.cleaningAssignee || '',
      cleaningFrequency: refrigerator.cleaningFrequency || ''
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
      cleaningDate: formData.cleaningDate,
      cleaningAssignee: formData.cleaningAssignee,
      cleaningFrequency: formData.cleaningFrequency,
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

  // Funzione per determinare lo stato di una singola temperatura
  const getSingleTemperatureStatus = (temp) => {
    if (temp < 0 || temp > 8) return 'danger'
    if (temp >= 6 && temp <= 8) return 'warning'
    return 'ok'
  }



  const addTemperature = (e) => {
    e.preventDefault()
    
    if (!tempFormData.location.trim() || !tempFormData.temperature.trim()) {
      return
    }

    const tempValue = parseFloat(tempFormData.temperature)
    if (isNaN(tempValue)) {
      return
    }

    const newTemperature = {
      id: Date.now(),
      location: tempFormData.location.trim(),
      temperature: tempValue,
      status: getSingleTemperatureStatus(tempValue),
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
      description: `Controllo temperatura ${tempFormData.location}: ${tempValue}°C`,
      location: tempFormData.location,
      value: tempValue,
      status: getSingleTemperatureStatus(tempValue)
    }
    
    const actions = JSON.parse(localStorage.getItem('haccp-actions') || '[]')
    actions.push(action)
    localStorage.setItem('haccp-actions', JSON.stringify(actions))

    setTempFormData({ location: '', temperature: '' })
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

      {/* Section 2: Registra Temperature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Registra Temperatura Frigorifero/Freezer
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
                <Label htmlFor="temp-location">Frigorifero / Freezer</Label>
                {refrigerators.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Nessun frigorifero registrato. Aggiungi prima un frigorifero nella sezione "Frigoriferi e Freezer".
                    </p>
                  </div>
                ) : (
                  <select
                    id="temp-location"
                    value={tempFormData.location}
                    onChange={(e) => setTempFormData({...tempFormData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Seleziona Frigorifero/Freezer --</option>
                    {refrigerators.map(refrigerator => (
                      <option key={refrigerator.id} value={refrigerator.name}>
                        {refrigerator.name} ({refrigerator.location || 'Posizione non specificata'})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <Label htmlFor="temp-temperature">Temperatura (°C)</Label>
                <Input
                  id="temp-temperature"
                  type="number"
                  step="0.1"
                  value={tempFormData.temperature}
                  onChange={(e) => setTempFormData({...tempFormData, temperature: e.target.value})}
                  placeholder="es. 4.2"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={refrigerators.length === 0}
            >
              <Thermometer className="mr-2 h-4 w-4" />
              Registra Temperatura
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Section 3: Attività Registro Temperature */}
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
                            <div className="font-medium">{refrigerator.setTemperature}°C</div>
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
                <Label htmlFor="nextMaintenance">Reminder Pulizia Straordinaria (Facoltativo)</Label>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="cleaningDate">Data Prossima Pulizia</Label>
                    <Input
                      id="cleaningDate"
                      type="date"
                      value={formData.cleaningDate || ''}
                      onChange={(e) => setFormData({...formData, cleaningDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cleaningAssignee">Assegnato a</Label>
                    <select
                      id="cleaningAssignee"
                      value={formData.cleaningAssignee || ''}
                      onChange={(e) => setFormData({...formData, cleaningAssignee: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Seleziona Utente/Ruolo --</option>
                      {staff.map(member => (
                        <option key={member.id} value={member.name}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                      {/* Aggiungi categorie di ruoli */}
                      {Array.from(new Set(staff.map(s => s.role))).map(role => (
                        <option key={`role-${role}`} value={`Categoria: ${role}`}>
                          Categoria: {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="cleaningFrequency">Frequenza</Label>
                    <select
                      id="cleaningFrequency"
                      value={formData.cleaningFrequency || ''}
                      onChange={(e) => setFormData({...formData, cleaningFrequency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Seleziona Frequenza --</option>
                      <option value="weekly">Settimanale</option>
                      <option value="monthly">Mensile</option>
                    </select>
                  </div>
                </div>
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
                <Label htmlFor="edit-nextMaintenance">Reminder Pulizia Straordinaria (Facoltativo)</Label>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edit-cleaningDate">Data Prossima Pulizia</Label>
                    <Input
                      id="edit-cleaningDate"
                      type="date"
                      value={formData.cleaningDate || ''}
                      onChange={(e) => setFormData({...formData, cleaningDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-cleaningAssignee">Assegnato a</Label>
                    <select
                      id="edit-cleaningAssignee"
                      value={formData.cleaningAssignee || ''}
                      onChange={(e) => setFormData({...formData, cleaningAssignee: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Seleziona Utente/Ruolo --</option>
                      {staff.map(member => (
                        <option key={member.id} value={member.name}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                      {/* Aggiungi categorie di ruoli */}
                      {Array.from(new Set(staff.map(s => s.role))).map(role => (
                        <option key={`role-${role}`} value={`Categoria: ${role}`}>
                          Categoria: {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-cleaningFrequency">Frequenza</Label>
                    <select
                      id="edit-cleaningFrequency"
                      value={formData.cleaningFrequency || ''}
                      onChange={(e) => setFormData({...formData, cleaningFrequency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Seleziona Frequenza --</option>
                      <option value="weekly">Settimanale</option>
                      <option value="monthly">Mensile</option>
                    </select>
                  </div>
                </div>
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