/**
 * HaccpManual - Componente per visualizzazione guida HACCP
 * 
 * Questo componente mostra la guida HACCP completa in una sezione dedicata
 * accessibile dalle Impostazioni. Non invasivo, solo se l'utente lo cerca.
 * 
 * @version 1.0
 * @critical Sicurezza alimentare - Guida utente
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs'
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
  ChevronRight
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

  // Funzione di ricerca
  const filteredPrinciples = HACCP_GUIDE.principles.filter(principle =>
    principle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    principle.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredGuidelines = Object.entries(HACCP_GUIDE.guidelines).filter(([key, guideline]) =>
    guideline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (guideline.whyMatters && guideline.whyMatters.toLowerCase().includes(searchTerm.toLowerCase()))
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

      {guideline.zones && (
        <div className="mb-3">
          <p className="text-sm font-medium text-green-800">Zone e Frequenza:</p>
          <div className="space-y-2">
            {guideline.zones.map((zone, idx) => (
              <div key={idx} className="bg-green-100 p-2 rounded">
                <p className="font-medium text-green-900">{zone.name}</p>
                <p className="text-sm text-green-800">Frequenza: {zone.frequency}</p>
                <p className="text-sm text-green-700">Prodotti: {zone.products.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {guideline.roles && (
        <div className="mb-3">
          <p className="text-sm font-medium text-green-800">Ruoli e Responsabilità:</p>
          <div className="space-y-2">
            {guideline.roles.map((role, idx) => (
              <div key={idx} className="bg-green-100 p-2 rounded">
                <p className="font-medium text-green-900">{role.name}</p>
                <div className="text-sm text-green-800">
                  <p>Responsabilità:</p>
                  <ul className="list-disc list-inside ml-2">
                    {role.responsibilities.map((resp, respIdx) => (
                      <li key={respIdx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {guideline.correctiveActions && (
        <div className="mb-3">
          <p className="text-sm font-medium text-green-800">Azioni Correttive:</p>
          <ul className="list-disc list-inside space-y-1">
            {guideline.correctiveActions.map((action, idx) => (
              <li key={idx} className="text-green-700">{action}</li>
            ))}
          </ul>
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

  const renderRequirement = (section, requirement) => (
    <div key={section} className="mb-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
      <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
        <Info className="h-5 w-5" />
        {getSectionDisplayName(section)}
      </h4>
      
      <div className="mb-3">
        <p className="text-sm font-medium text-orange-800">Dati obbligatori:</p>
        <ul className="list-disc list-inside space-y-1">
          {requirement.mandatory.map((field, idx) => (
            <li key={idx} className="text-orange-700">{field}</li>
          ))}
        </ul>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-orange-800">Validazione:</p>
        <p className="text-orange-700">{requirement.validation}</p>
      </div>

      {requirement.blocking && requirement.blocking.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-orange-800">Blocca sezioni:</p>
          <p className="text-orange-700">{requirement.blocking.join(', ')}</p>
        </div>
      )}

      <div className="bg-orange-100 p-3 rounded">
        <p className="text-sm font-medium text-orange-900 mb-1">Perché è importante:</p>
        <p className="text-sm text-orange-800">{requirement.whyMatters}</p>
      </div>
    </div>
  )

  const getGuidelineIcon = (section) => {
    const icons = {
      temperature: <Thermometer className="h-5 w-5" />,
      cleaning: <Sparkles className="h-5 w-5" />,
      staff: <Users className="h-5 w-5" />,
      products: <Package className="h-5 w-5" />,
      suppliers: <Truck className="h-5 w-5" />,
      nonConformity: <AlertTriangle className="h-5 w-5" />
    }
    return icons[section] || <Info className="h-5 w-5" />
  }

  const getSectionDisplayName = (section) => {
    const names = {
      refrigerators: "Gestione Frigoriferi",
      temperature: "Registrazione Temperature",
      staff: "Gestione Personale",
      cleaning: "Gestione Pulizie",
      products: "Gestione Prodotti",
      suppliers: "Gestione Fornitori",
      nonConformity: "Gestione Non Conformità"
    }
    return names[section] || section
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Manuale HACCP - Guida Completa
          </CardTitle>
          <p className="text-gray-600">
            Riferimento completo per normative HACCP e procedure operative
          </p>
        </CardHeader>
      </Card>

      {/* Tabs principali */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="principles">Principi Base</TabsTrigger>
          <TabsTrigger value="guidelines">Linee Guida</TabsTrigger>
          <TabsTrigger value="requirements">Requisiti</TabsTrigger>
        </TabsList>

        {/* Tab Principi Base */}
        <TabsContent value="principles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Principi Fondamentali HACCP
              </CardTitle>
              <p className="text-gray-600">
                Questi principi garantiscono la conformità alle normative di sicurezza alimentare
              </p>
              
              {/* Barra di ricerca */}
              <div className="mt-4 relative">
                <input
                  type="text"
                  placeholder="Cerca nei principi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredPrinciples.map(renderPrinciple)}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Linee Guida */}
        <TabsContent value="guidelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-green-600" />
                Linee Guida Operative
              </CardTitle>
              <p className="text-gray-600">
                Procedure dettagliate per ogni area operativa
              </p>
            </CardHeader>
            <CardContent>
              {filteredGuidelines.map(([section, guideline]) => 
                renderGuideline(section, guideline)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Requisiti */}
        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-orange-600" />
                Requisiti Minimi e Validazioni
              </CardTitle>
              <p className="text-gray-600">
                Dati obbligatori e controlli automatici per ogni sezione
              </p>
            </CardHeader>
            <CardContent>
              {Object.entries(HACCP_GUIDE.requirements).map(([section, requirement]) => 
                renderRequirement(section, requirement)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Messaggi educativi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-6 w-6 text-purple-600" />
            Informazioni Importanti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(HACCP_GUIDE.educationalMessages).map(([key, message]) => (
              <div key={key} className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-800">{message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-gray-500">
            <p>Versione {HACCP_GUIDE.version} • Ultimo aggiornamento: {HACCP_GUIDE.lastUpdated}</p>
            <p className="mt-1">Questo manuale è conforme alle normative HACCP vigenti</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HaccpManual
