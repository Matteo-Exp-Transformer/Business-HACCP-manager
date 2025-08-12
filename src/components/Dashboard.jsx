/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo componente gestisce la DASHBOARD - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo componente gestisce monitoraggio e statistiche critiche
 * ⚠️ Visualizza allarmi e stato generale del sistema HACCP
 * 
 * @fileoverview Componente Dashboard HACCP - Sistema Critico di Monitoraggio
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Monitoraggio Generale
 * @version 1.1 - Aggiornato con widget prodotti in scadenza
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { CheckCircle, AlertTriangle, Package, Calendar, Clock, AlertCircle } from 'lucide-react'
import { Button } from './ui/Button'

function Dashboard({ temperatures = [], cleaning = [], staff = [], products = [], currentUser }) {
  // Statistiche semplici
  const tempOk = temperatures.filter(t => t.status === 'ok').length
  const tempProblems = temperatures.filter(t => t.status === 'danger').length
  const cleaningPending = cleaning.filter(c => !c.completed).length

  // Calcolo prodotti in scadenza (entro 7 giorni)
  const today = new Date()
  const sevenDaysFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000))
  
  const expiringProducts = products.filter(product => {
    if (!product.expiryDate) return false
    const expiryDate = new Date(product.expiryDate)
    return expiryDate <= sevenDaysFromNow && expiryDate >= today
  })

  const expiredProducts = products.filter(product => {
    if (!product.expiryDate) return false
    const expiryDate = new Date(product.expiryDate)
    return expiryDate < today
  })

  return (
    <div className="space-y-6">
      {/* Statistiche Principali */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center text-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">{tempOk}</p>
                <p className="text-sm text-gray-600">Temperature OK</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center text-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-red-600">{tempProblems}</p>
                <p className="text-sm text-gray-600">Problemi Temp.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center text-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">{cleaningPending}</p>
                <p className="text-sm text-gray-600">Pulizie Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center text-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-purple-600">{products.length}</p>
                <p className="text-sm text-gray-600">Prodotti</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widget Prodotti in Scadenza */}
      {(expiringProducts.length > 0 || expiredProducts.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Clock className="h-5 w-5" />
              ⚠️ Prodotti in Scadenza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiredProducts.length > 0 && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Prodotti Scaduti ({expiredProducts.length})
                  </h4>
                  <div className="space-y-1">
                    {expiredProducts.slice(0, 3).map(product => (
                      <div key={product.id} className="text-sm text-red-700 flex justify-between">
                        <span>{product.name}</span>
                        <span className="font-medium">Scaduto il {new Date(product.expiryDate).toLocaleDateString('it-IT')}</span>
                      </div>
                    ))}
                    {expiredProducts.length > 3 && (
                      <p className="text-xs text-red-600">...e altri {expiredProducts.length - 3} prodotti</p>
                    )}
                  </div>
                </div>
              )}
              
              {expiringProducts.length > 0 && (
                <div className="p-3 bg-orange-100 border border-orange-300 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Scadenza Imminente ({expiringProducts.length})
                  </h4>
                  <div className="space-y-1">
                    {expiringProducts.slice(0, 3).map(product => {
                      const daysUntilExpiry = Math.ceil((new Date(product.expiryDate) - today) / (1000 * 60 * 60 * 24))
                      return (
                        <div key={product.id} className="text-sm text-orange-700 flex justify-between">
                          <span>{product.name}</span>
                          <span className="font-medium">Tra {daysUntilExpiry} giorni</span>
                        </div>
                      )
                    })}
                    {expiringProducts.length > 3 && (
                      <p className="text-xs text-orange-600">...e altri {expiringProducts.length - 3} prodotti</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.hash = '#inventory'}
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                >
                  Vai all'Inventario
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benvenuto */}
      <Card>
        <CardHeader>
          <CardTitle>Benvenuto, {currentUser?.name}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Dashboard Business HACCP Manager</p>
          <p className="text-sm text-gray-500 mt-2">
            Ruolo: {currentUser?.role === 'admin' ? 'Amministratore' : 'Dipendente'} • 
            Reparto: {currentUser?.department}
          </p>
        </CardContent>
      </Card>
      
      {/* Nuove funzionalità */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            🆕 Nuove Funzionalità HACCP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Validazione Automatica Prodotti-Frigoriferi</h4>
              <p className="text-sm text-blue-700">
                L'applicazione ora verifica automaticamente la compatibilità tra categorie di prodotti e punti di conservazione, 
                prevenendo errori di conservazione e migliorando la sicurezza alimentare.
              </p>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Gestione Categorie Personalizzate</h4>
              <p className="text-sm text-green-700">
                Puoi creare nuove categorie di prodotti direttamente dall'interfaccia, 
                rendendo il sistema più flessibile e adattabile alle tue esigenze specifiche.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Prevenzione Contaminazioni</h4>
              <p className="text-sm text-purple-700">
                I frigoriferi possono essere dedicati a categorie specifiche, 
                riducendo il rischio di contaminazioni incrociate e migliorando la tracciabilità.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard