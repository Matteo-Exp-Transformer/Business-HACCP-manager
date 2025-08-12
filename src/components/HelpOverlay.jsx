/**
 * HelpOverlay - Overlay di aiuto per scaffali
 * 
 * Questo componente mostra un overlay con diagrammi degli scaffali
 * quando l'utente clicca sull'icona "?" nei frigoriferi
 * 
 * @version 1.0
 * @critical UX - Guida posizionamento prodotti
 */

import React from 'react'
import { X, Info, Thermometer, Package, AlertTriangle } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'

// Configurazioni scaffali per tipo di frigorifero
const SHELF_CONFIGS = {
  'pizzeria-frigoA': {
    title: 'Frigo A - Pizzeria',
    subtitle: 'Prodotti freschi (2-4°C)',
    shelves: [
      {
        name: 'Scaffale 1 (Superiore)',
        products: ['Verdure fresche', 'Insalate', 'Erbe aromatiche'],
        temperature: '2-4°C',
        color: 'bg-green-100',
        borderColor: 'border-green-300'
      },
      {
        name: 'Scaffale 2',
        products: ['Salumi', 'Prosciutti', 'Mortadelle'],
        temperature: '2-4°C',
        color: 'bg-red-100',
        borderColor: 'border-red-300'
      },
      {
        name: 'Scaffale 3',
        products: ['Formaggi freschi', 'Mozzarella', 'Ricotta'],
        temperature: '2-4°C',
        color: 'bg-yellow-100',
        borderColor: 'border-yellow-300'
      },
      {
        name: 'Scaffale 4 (Inferiore)',
        products: ['Latticini', 'Yogurt', 'Panna'],
        temperature: '2-4°C',
        color: 'bg-blue-100',
        borderColor: 'border-blue-300'
      }
    ],
    notes: [
      'Mantenere sempre la temperatura tra 2-4°C',
      'Non mescolare prodotti cotti e crudi',
      'Controllare le scadenze ogni giorno',
      'Pulire gli scaffali settimanalmente'
    ]
  },
  'pizzeria-frigoB': {
    title: 'Frigo B - Pizzeria',
    subtitle: 'Surgelati (-19 a -16°C)',
    shelves: [
      {
        name: 'Scaffale 1 (Superiore)',
        products: ['Pizze surgelate', 'Impasti surgelati'],
        temperature: '-19 a -16°C',
        color: 'bg-purple-100',
        borderColor: 'border-purple-300'
      },
      {
        name: 'Scaffale 2',
        products: ['Verdure surgelate', 'Frutta surgelata'],
        temperature: '-19 a -16°C',
        color: 'bg-green-100',
        borderColor: 'border-green-300'
      },
      {
        name: 'Scaffale 3 (Inferiore)',
        products: ['Carne surgelata', 'Pesce surgelato'],
        temperature: '-19 a -16°C',
        color: 'bg-red-100',
        borderColor: 'border-red-300'
      }
    ],
    notes: [
      'Mantenere sempre la temperatura tra -19 e -16°C',
      'Non scongelare e ricongelare prodotti',
      'Controllare la formazione di brina',
      'Organizzare per data di scadenza'
    ]
  },
  'bar-frigoA': {
    title: 'Frigo A - Bar',
    subtitle: 'Latticini (2-4°C)',
    shelves: [
      {
        name: 'Scaffale 1 (Superiore)',
        products: ['Latte', 'Panna da caffè'],
        temperature: '2-4°C',
        color: 'bg-blue-100',
        borderColor: 'border-blue-300'
      },
      {
        name: 'Scaffale 2',
        products: ['Yogurt', 'Formaggi freschi'],
        temperature: '2-4°C',
        color: 'bg-yellow-100',
        borderColor: 'border-yellow-300'
      },
      {
        name: 'Scaffale 3 (Inferiore)',
        products: ['Burro', 'Margarina'],
        temperature: '2-4°C',
        color: 'bg-orange-100',
        borderColor: 'border-orange-300'
      }
    ],
    notes: [
      'Mantenere sempre la temperatura tra 2-4°C',
      'Controllare le scadenze ogni giorno',
      'Non esporre alla luce diretta',
      'Pulire gli scaffali settimanalmente'
    ]
  },
  'bar-frigoB': {
    title: 'Frigo B - Bar',
    subtitle: 'Surgelati (-19 a -16°C)',
    shelves: [
      {
        name: 'Scaffale 1 (Superiore)',
        products: ['Gelati', 'Dolci surgelati'],
        temperature: '-19 a -16°C',
        color: 'bg-pink-100',
        borderColor: 'border-pink-300'
      },
      {
        name: 'Scaffale 2',
        products: ['Frutta surgelata', 'Verdure surgelate'],
        temperature: '-19 a -16°C',
        color: 'bg-green-100',
        borderColor: 'border-green-300'
      },
      {
        name: 'Scaffale 3 (Inferiore)',
        products: ['Snack surgelati', 'Ingredienti surgelati'],
        temperature: '-19 a -16°C',
        color: 'bg-gray-100',
        borderColor: 'border-gray-300'
      }
    ],
    notes: [
      'Mantenere sempre la temperatura tra -19 e -16°C',
      'Non scongelare e ricongelare prodotti',
      'Controllare la formazione di brina',
      'Organizzare per data di scadenza'
    ]
  },
  'abbattitore': {
    title: 'Abbattitore di Temperatura',
    subtitle: 'Raffreddamento rapido (-13.5°C a -80°C)',
    shelves: [
      {
        name: 'Zona Superiore',
        products: ['Piatti pronti caldi', 'Salse calde'],
        temperature: '-13.5°C a -80°C',
        color: 'bg-red-100',
        borderColor: 'border-red-300'
      },
      {
        name: 'Zona Centrale',
        products: ['Carne cotta', 'Pesce cotto'],
        temperature: '-13.5°C a -80°C',
        color: 'bg-orange-100',
        borderColor: 'border-orange-300'
      },
      {
        name: 'Zona Inferiore',
        products: ['Verdure cotte', 'Legumi cotti'],
        temperature: '-13.5°C a -80°C',
        color: 'bg-green-100',
        borderColor: 'border-green-300'
      }
    ],
    notes: [
      'Raffreddamento rapido per prevenire proliferazione batterica',
      'Non superare mai i 4°C entro 2 ore',
      'Controllare la formazione di cristalli di ghiaccio',
      'Pulire dopo ogni ciclo di raffreddamento'
    ]
  },
  'ambiente': {
    title: 'Conservazione a Temperatura Ambiente',
    subtitle: 'Prodotti secchi (15°C a 25°C)',
    shelves: [
      {
        name: 'Scaffale Superiore',
        products: ['Farine', 'Pasta', 'Riso'],
        temperature: '15°C a 25°C',
        color: 'bg-yellow-100',
        borderColor: 'border-yellow-300'
      },
      {
        name: 'Scaffale Centrale',
        products: ['Conserve', 'Oli', 'Aceti'],
        temperature: '15°C a 25°C',
        color: 'bg-blue-100',
        borderColor: 'border-blue-300'
      },
      {
        name: 'Scaffale Inferiore',
        products: ['Spezie', 'Sale', 'Zucchero'],
        temperature: '15°C a 25°C',
        color: 'bg-purple-100',
        borderColor: 'border-purple-300'
      }
    ],
    notes: [
      'Mantenere ambiente asciutto e ben ventilato',
      'Evitare esposizione diretta alla luce solare',
      'Controllare la data di scadenza regolarmente',
      'Organizzare per tipo di prodotto'
    ]
  }
}

function HelpOverlay({ 
  isOpen, 
  onClose, 
  fridgeType = 'pizzeria-frigoA',
  showTemperatureInfo = true 
}) {
  if (!isOpen) return null

  const config = SHELF_CONFIGS[fridgeType] || SHELF_CONFIGS['pizzeria-frigoA']

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
                  <p className="text-gray-600">{config.subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {showTemperatureInfo && (
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">
                <Thermometer className="h-4 w-4" />
                <span className="font-medium">Temperatura critica:</span>
                <span>{config.shelves[0]?.temperature}</span>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Diagramma scaffali */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Organizzazione Scaffali
                </h3>
                
                <div className="space-y-3">
                  {config.shelves.map((shelf, index) => (
                    <Card key={index} className={`border-2 ${shelf.borderColor}`}>
                      <CardContent className="p-4">
                        <div className={`${shelf.color} p-3 rounded-lg`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{shelf.name}</h4>
                            <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                              {shelf.temperature}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            {shelf.products.map((product, pIndex) => (
                              <div key={pIndex} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-700">{product}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Note e raccomandazioni */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Note Importanti
                </h3>
                
                <div className="space-y-4">
                  {config.notes.map((note, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-yellow-800">{note}</span>
                    </div>
                  ))}
                  
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Best Practices HACCP
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Controllare le temperature 2 volte al giorno</li>
                        <li>• Registrare sempre le letture temperature</li>
                        <li>• Segnalare immediatamente temperature fuori range</li>
                        <li>• Mantenere la catena del freddo</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">HACCP:</span> Questa organizzazione garantisce la sicurezza alimentare
              </div>
              
              <Button onClick={onClose}>
                Ho Capito
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HelpOverlay
