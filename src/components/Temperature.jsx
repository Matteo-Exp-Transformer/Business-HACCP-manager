import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Trash2, Thermometer, AlertTriangle, CheckCircle } from 'lucide-react'

function Temperature({ temperatures, setTemperatures }) {
  const [formData, setFormData] = useState({
    location: '',
    temperature: ''
  })

  // Persist to localStorage whenever temperatures change
  useEffect(() => {
    localStorage.setItem('haccp-temperatures', JSON.stringify(temperatures))
  }, [temperatures])

  const getTemperatureStatus = (temp) => {
    const tempNum = parseFloat(temp)
    if (tempNum < 4) return 'ok'
    if (tempNum <= 8) return 'warning'
    return 'danger'
  }

  const addTemperature = (e) => {
    e.preventDefault()
    if (!formData.location.trim() || !formData.temperature.trim()) return

    const temperature = parseFloat(formData.temperature)
    if (isNaN(temperature)) {
      alert('Inserire una temperatura valida')
      return
    }

    const newTemp = {
      id: Date.now(),
      location: formData.location.trim(),
      temperature: temperature,
      time: new Date().toLocaleString('it-IT'),
      status: getTemperatureStatus(temperature)
    }

    setTemperatures([...temperatures, newTemp])
    setFormData({ location: '', temperature: '' })
  }

  const deleteTemperature = (id) => {
    if (confirm('Sei sicuro di voler eliminare questa registrazione?')) {
      setTemperatures(temperatures.filter(temp => temp.id !== id))
    }
  }

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Temperature Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Registra Temperatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTemperature} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Posizione</Label>
                <Input
                  id="location"
                  placeholder="Es: Frigorifero principale, Freezer..."
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperatura (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="Es: 2.5"
                  value={formData.temperature}
                  onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Registra Temperatura
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Temperature Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Linee Guida Temperature</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium text-green-800">Sicura</div>
                <div className="text-green-600">&lt; 4°C</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-800">Attenzione</div>
                <div className="text-yellow-600">4°C - 8°C</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <div className="font-medium text-red-800">Pericolosa</div>
                <div className="text-red-600">&gt; 8°C</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Temperature List */}
      <Card>
        <CardHeader>
          <CardTitle>Storico Temperature ({temperatures.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {temperatures.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nessuna temperatura registrata.
              <br />
              Inizia registrando la prima misurazione.
            </p>
          ) : (
            <div id="temperatureList" className="space-y-3">
              {temperatures.slice().reverse().map(temp => (
                <div key={temp.id} className={`
                  p-4 rounded-lg border-l-4 bg-gray-50
                  ${temp.status === 'ok' 
                    ? 'border-green-500' 
                    : temp.status === 'warning'
                    ? 'border-yellow-500'
                    : 'border-red-500'
                  }
                `}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon status={temp.status} />
                        <strong className="font-medium">{temp.location}</strong>
                      </div>
                      <div className="text-xl font-bold mb-1">{temp.temperature}°C</div>
                      <div className="text-xs text-gray-500">{temp.time}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTemperature(temp.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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