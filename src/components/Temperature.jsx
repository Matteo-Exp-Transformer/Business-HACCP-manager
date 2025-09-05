/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo componente gestisce le TEMPERATURE - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo componente gestisce allarmi e validazioni temperature critiche
 * ⚠️ Gestisce workflow di sicurezza alimentare e compliance HACCP
 * 
 * @fileoverview Componente Temperature HACCP - Sistema Critico di Sicurezza
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Monitoraggio Temperature
 * @version 2.0 - Aggiornato per gestione range temperature uniforme
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Trash2, Thermometer, AlertTriangle, CheckCircle, User, Info } from 'lucide-react'
import TemperatureInput from './ui/TemperatureInput'

function Temperature({ temperatures, setTemperatures, currentUser }) {
  const [formData, setFormData] = useState({
    location: '',
    temperatureMin: '',
    temperatureMax: ''
  })
  

  // Save temperatures to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('haccp-temperatures', JSON.stringify(temperatures))
  }, [temperatures])

  const getTemperatureStatus = (tempMin, tempMax) => {
    // Calcola la temperatura media per la valutazione
    const avgTemp = (tempMin + tempMax) / 2
    
    if (avgTemp < 0 || avgTemp > 8) return 'danger'
    if (avgTemp >= 6 && avgTemp <= 8) return 'warning'
    return 'ok'
  }

  const addTemperature = (e) => {
    e.preventDefault()
    
    if (!formData.location.trim() || !formData.temperatureMin.trim() || !formData.temperatureMax.trim()) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    const tempMin = parseFloat(formData.temperatureMin)
    const tempMax = parseFloat(formData.temperatureMax)
    
    if (isNaN(tempMin) || isNaN(tempMax)) {
      alert('Inserisci temperature valide')
      return
    }

    // Validazione: temperatura minima deve essere inferiore alla massima
    if (tempMin >= tempMax) {
      alert('La temperatura minima deve essere inferiore alla temperatura massima')
      return
    }

    const newTemperature = {
      id: Date.now(),
      location: formData.location.trim(),
      temperatureMin: tempMin,
      temperatureMax: tempMax,
      temperature: `${tempMin}-${tempMax}°C`, // Mantiene compatibilità con sistema esistente
      status: getTemperatureStatus(tempMin, tempMax),
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
      description: `Controllo temperatura ${formData.location}: ${tempMin}-${tempMax}°C`,
      location: formData.location,
      valueMin: tempMin,
      valueMax: tempMax,
      status: getTemperatureStatus(tempMin, tempMax)
    }
    
    const actions = JSON.parse(localStorage.getItem('haccp-actions') || '[]')
    actions.push(action)
    localStorage.setItem('haccp-actions', JSON.stringify(actions))
    
    // Reset del form
    setFormData({
      location: '',
      temperatureMin: '',
      temperatureMax: ''
    })
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
                  placeholder="es. Frigo Carne, Ambiente..."
                  required
                />
              </div>
              <div>
                <TemperatureInput
                  label="Range Temperatura (°C) *"
                  minValue={formData.temperatureMin}
                  maxValue={formData.temperatureMax}
                  onMinChange={(e) => setFormData({...formData, temperatureMin: e.target.value})}
                  onMaxChange={(e) => setFormData({...formData, temperatureMax: e.target.value})}
                  required={true}
                  showValidation={true}
                  showSuggestions={true}
                  className="w-full"
                  id="temperature-range"
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
                          <div className="font-bold text-lg">{temp.temperature}</div>
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
      {/* Riferimenti Normativi EU/ASL */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            📋 Riferimenti Normativi EU/ASL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700 space-y-3">
            <p className="font-medium text-gray-800">Le temperature di conservazione suggerite sono basate sulle seguenti normative europee e italiane:</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">🇪🇺 Regolamento (CE) 853/2004</h4>
                <p className="text-blue-700 text-xs mb-1">Allegato III - Requisiti specifici per alimenti di origine animale</p>
                <p className="text-blue-700 text-xs mb-1">• Carni fresche: ≤7°C (frattaglie ≤3°C)</p>
                <p className="text-blue-700 text-xs mb-1">• Pollame: ≤4°C</p>
                <p className="text-blue-700 text-xs mb-1">• Carni macinate: ≤2°C</p>
                <p className="text-blue-700 text-xs mb-1">• Pesce fresco: vicino al ghiaccio in fusione</p>
                <p className="text-blue-700 text-xs mb-1">• Latte crudo: ≤6°C</p>
                <p className="text-blue-700 text-xs mb-1">• Ovoprodotti: ≤4°C</p>
                <a 
                  href="https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-xs hover:text-blue-800"
                >
                  📖 Leggi il regolamento completo
                </a>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">🇮🇹 DPR 327/80 (Italia)</h4>
                <p className="text-green-700 text-xs mb-1">Prassi storiche richiamate da ASL</p>
                <p className="text-green-700 text-xs mb-1">• Alimenti cotti da mantenere caldi: +60–65°C</p>
                <p className="text-green-700 text-xs mb-1">• Alimenti facilmente deperibili: +4°C</p>
                <p className="text-green-700 text-xs mb-1">• Uova in guscio: temperatura costante</p>
                <p className="text-green-700 text-xs mb-1">• Evitare sbalzi termici</p>
                <p className="text-green-700 text-xs mb-1">• Proteggere da sole e odori</p>
                <p className="text-green-700 text-xs mb-1">• Rispettare etichette produttore</p>
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">❄️ Direttiva 89/108/CEE (Surgelati)</h4>
              <p className="text-purple-700 text-xs mb-1">• Catena del freddo continua a -18°C</p>
              <p className="text-purple-700 text-xs mb-1">• Non ricongelare dopo decongelamento</p>
              <p className="text-purple-700 text-xs mb-1">• Brevi fluttuazioni ammesse nel trasporto</p>
              <a 
                href="https://eur-lex.europa.eu/legal-content/IT/ALL/?uri=celex:31989L0108" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 underline text-xs hover:text-purple-800"
              >
                📖 Leggi la direttiva completa
              </a>
            </div>
            
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">⚠️ Note Importanti</h4>
              <p className="text-orange-700 text-xs mb-1">• Le temperature suggerite sono indicative e basate su normative EU/ASL</p>
              <p className="text-orange-700 text-xs mb-1">• Rispettare sempre le indicazioni specifiche del produttore</p>
              <p className="text-orange-700 text-xs mb-1">• In caso di dubbi, consultare le autorità sanitarie locali (ASL)</p>
              <p className="text-orange-700 text-xs mb-1">• Mantenere aggiornate le procedure HACCP aziendali</p>
              <p className="text-orange-700 text-xs mb-1">• Documentare eventuali deviazioni dalle temperature standard</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

export default Temperature