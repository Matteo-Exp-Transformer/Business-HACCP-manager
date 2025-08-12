/**
 * HaccpManual - Componente per visualizzazione guida HACCP
 * 
 * Questo componente mostra la guida HACCP completa in una sezione dedicata
 * accessibile dalle Impostazioni. Non invasivo, solo se l'utente lo cerca.
 * 
 * @version 1.1 - Aggiornato con ricerca e contenuto migliorato
 * @critical Sicurezza alimentare - Guida utente
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs'
import { Input } from './ui/Input'
import { 
  BookOpen, 
  Shield, 
  Users, 
  Thermometer, 
  Sparkles, 
  Package, 
  Truck, 
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Search,
  Clock,
  AlertCircle
} from 'lucide-react'
import { HACCP_GUIDE } from '../utils/haccpGuide'

function HaccpManual() {
  const [expandedSections, setExpandedSections] = useState(new Set(['principles']))
  const [activeTab, setActiveTab] = useState('principles')
  const [searchTerm, setSearchTerm] = useState('')

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  // Funzione di ricerca migliorata
  const filteredPrinciples = HACCP_GUIDE.principles.filter(principle =>
    principle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    principle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    principle.implementation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredGuidelines = Object.entries(HACCP_GUIDE.guidelines).filter(([key, guideline]) =>
    guideline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (guideline.whyMatters && guideline.whyMatters.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (guideline.frequency && guideline.frequency.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const renderPrinciple = (principle) => (
    <div key={principle.id} className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {principle.title}
          </h4>
          <p className="text-blue-800 mb-2">{principle.description}</p>
          <div className="bg-blue-100 p-3 rounded">
            <p className="text-sm font-medium text-blue-900 mb-1">Implementazione:</p>
            <p className="text-sm text-blue-800">{principle.implementation}</p>
          </div>
        </div>
        <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 ml-2" />
      </div>
    </div>
  )

  const renderGuideline = (section, guideline) => (
    <div key={guideline.id} className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
        {getGuidelineIcon(section)}
        {guideline.title}
      </h4>
      
      {guideline.frequency && (
        <div className="mb-3">
          <p className="text-sm font-medium text-green-800">Frequenza:</p>
          <p className="text-green-700">{guideline.frequency}</p>
        </div>
      )}

      {guideline.criticalPoints && (
        <div className="mb-3">
          <p className="text-sm font-medium text-green-800">Punti di Controllo:</p>
          <div className="space-y-2">
            {guideline.criticalPoints.map((point, idx) => (
              <div key={idx} className="bg-green-100 p-2 rounded">
                <p className="font-medium text-green-900">{point.name}</p>
                <p className="text-sm text-green-800">
                  Range: {point.range.min}°C - {point.range.max || '∞'}°C
                </p>
                <p className="text-sm text-green-700">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {guideline.whyMatters && (
        <div className="bg-green-100 p-3 rounded">
          <p className="text-sm font-medium text-green-900 mb-1">Perché è importante:</p>
          <p className="text-sm text-green-800">{guideline.whyMatters}</p>
        </div>
      )}
    </div>
  )

  const getGuidelineIcon = (section) => {
    const icons = {
      'temperature': <Thermometer className="h-5 w-5" />,
      'cleaning': <Sparkles className="h-5 w-5" />,
      'staff': <Users className="h-5 w-5" />,
      'inventory': <Package className="h-5 w-5" />,
      'suppliers': <Truck className="h-5 w-5" />,
      'autoprodotti': <Clock className="h-5 w-5" />
    }
    return icons[section] || <Info className="h-5 w-5" />
  }

  const renderAutoprodottiSection = () => (
    <div className="space-y-4">
      <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
        <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Autoprodotti e Lavorati
        </h4>
        <div className="space-y-3">
          <div className="bg-purple-100 p-3 rounded">
            <h5 className="font-medium text-purple-800 mb-2">Pasta Fresca</h5>
            <p className="text-sm text-purple-700">Conservazione: 2-4°C • Durata: 24-48 ore</p>
            <p className="text-xs text-purple-600 mt-1">Se >4°C: sposta i prodotti e riprova tra 10 minuti</p>
          </div>
          
          <div className="bg-purple-100 p-3 rounded">
            <h5 className="font-medium text-purple-800 mb-2">Salse Preparate</h5>
            <p className="text-sm text-purple-700">Conservazione: 2-4°C • Durata: 72 ore</p>
            <p className="text-xs text-purple-600 mt-1">Controlla odore e colore prima dell'uso</p>
          </div>
          
          <div className="bg-purple-100 p-3 rounded">
            <h5 className="font-medium text-purple-800 mb-2">Impasti Lievitati</h5>
            <p className="text-sm text-purple-700">Conservazione: 2-4°C • Durata: 24 ore</p>
            <p className="text-xs text-purple-600 mt-1">Verifica consistenza e odore prima della cottura</p>
          </div>
          
          <div className="bg-purple-100 p-3 rounded">
            <h5 className="font-medium text-purple-800 mb-2">Dolci Freschi</h5>
            <p className="text-sm text-purple-700">Conservazione: 2-4°C • Durata: 48-72 ore</p>
            <p className="text-xs text-purple-600 mt-1">Controlla muffe e odori sgradevoli</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header con ricerca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Manuale HACCP - Guida Completa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cerca nel manuale HACCP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Risultati per: <span className="font-medium">"{searchTerm}"</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contenuto principale */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="principles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Principi
          </TabsTrigger>
          <TabsTrigger value="guidelines" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Linee Guida
          </TabsTrigger>
          <TabsTrigger value="autoprodotti" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Autoprodotti
          </TabsTrigger>
          <TabsTrigger value="quick-actions" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Azioni Rapide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="principles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>I 7 Principi HACCP</CardTitle>
            </CardHeader>
            <CardContent>
              {searchTerm ? (
                filteredPrinciples.length > 0 ? (
                  filteredPrinciples.map(renderPrinciple)
                ) : (
                  <p className="text-gray-500 text-center py-8">Nessun risultato trovato per "{searchTerm}"</p>
                )
              ) : (
                HACCP_GUIDE.principles.map(renderPrinciple)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Linee Guida Operative</CardTitle>
            </CardHeader>
            <CardContent>
              {searchTerm ? (
                filteredGuidelines.length > 0 ? (
                  filteredGuidelines.map(([key, guideline]) => renderGuideline(key, guideline))
                ) : (
                  <p className="text-gray-500 text-center py-8">Nessun risultato trovato per "{searchTerm}"</p>
                )
              ) : (
                Object.entries(HACCP_GUIDE.guidelines).map(([key, guideline]) => renderGuideline(key, guideline))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="autoprodotti" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Autoprodotti e Lavorati</CardTitle>
            </CardHeader>
            <CardContent>
              {renderAutoprodottiSection()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Azioni Rapide HACCP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Temperatura Alta
                  </h4>
                  <p className="text-sm text-red-700 mb-2">Se >4°C: sposta i prodotti e riprova tra 10 minuti</p>
                  <Button size="sm" variant="outline" className="text-red-700 border-red-300">
                    Azione Correttiva
                  </Button>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Scadenza Imminente
                  </h4>
                  <p className="text-sm text-orange-700 mb-2">Prodotti che scadono entro 24 ore</p>
                  <Button size="sm" variant="outline" className="text-orange-700 border-orange-300">
                    Verifica Inventario
                  </Button>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Pulizia Necessaria
                  </h4>
                  <p className="text-sm text-yellow-700 mb-2">Superfici e attrezzature da pulire</p>
                  <Button size="sm" variant="outline" className="text-yellow-700 border-yellow-300">
                    Pianifica Pulizia
                  </Button>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Formazione Staff
                  </h4>
                  <p className="text-sm text-blue-700 mb-2">Verifica certificazioni e formazione</p>
                  <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                    Controlla Certificazioni
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default HaccpManual
