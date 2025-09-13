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
 * @version 1.0
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { CheckCircle, AlertTriangle, Package, Calendar } from 'lucide-react'
import { errorLog } from '../utils/debug'

function Dashboard({ temperatures = [], cleaning = [], staff = [], products = [], currentUser }) {
  // Statistiche semplici
  const tempOk = temperatures.filter(t => t.status === 'ok').length
  const tempProblems = temperatures.filter(t => t.status === 'danger').length
  const cleaningPending = cleaning.filter(c => !c.completed).length

  return (
    <div className="space-y-6">
      {/* @lock:start(Home-KPI) DO NOT EDIT – KPI remain plain cards */}
      {/* Statistiche Principali */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
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
            <div className="flex items-center">
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
            <div className="flex items-center">
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
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-purple-600">{products.length}</p>
                <p className="text-sm text-gray-600">Prodotti</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* @lock:end(Home-KPI) */}

      {/* @lock:start(Home-Welcome) DO NOT EDIT – Welcome section */}
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
          
          {/* Informazioni Business dall'Onboarding */}
          {(() => {
            const savedOnboarding = localStorage.getItem('haccp-onboarding');
            if (!savedOnboarding || savedOnboarding === '[object Object]') {
              return null;
            }
            
            let businessInfo = {};
            try {
              businessInfo = JSON.parse(savedOnboarding);
            } catch (error) {
              errorLog('Errore parsing onboarding data:', error);
              return null;
            }
            
            if (businessInfo.businessInfo) {
              return (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Informazioni Azienda</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {businessInfo.businessInfo.businessName && (
                      <div>
                        <span className="text-blue-700 font-medium">Nome Azienda:</span>
                        <span className="ml-2 text-blue-600">{businessInfo.businessInfo.businessName}</span>
                      </div>
                    )}
                    {businessInfo.businessInfo.businessType && (
                      <div>
                        <span className="text-blue-700 font-medium">Tipo Attività:</span>
                        <span className="ml-2 text-blue-600">{businessInfo.businessInfo.businessType}</span>
                      </div>
                    )}
                    {businessInfo.businessInfo.address && (
                      <div>
                        <span className="text-blue-700 font-medium">Indirizzo:</span>
                        <span className="ml-2 text-blue-600">{businessInfo.businessInfo.address}</span>
                      </div>
                    )}
                    {businessInfo.businessInfo.phone && (
                      <div>
                        <span className="text-blue-700 font-medium">Telefono:</span>
                        <span className="ml-2 text-blue-600">{businessInfo.businessInfo.phone}</span>
                      </div>
                    )}
                    {businessInfo.businessInfo.email && (
                      <div>
                        <span className="text-blue-700 font-medium">Email:</span>
                        <span className="ml-2 text-blue-600">{businessInfo.businessInfo.email}</span>
                      </div>
                    )}
                    {businessInfo.businessInfo.vatNumber && (
                      <div>
                        <span className="text-blue-700 font-medium">P.IVA:</span>
                        <span className="ml-2 text-blue-600">{businessInfo.businessInfo.vatNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </CardContent>
      </Card>
      {/* @lock:end(Home-Welcome) */}
      
      {/* @lock:start(Home-News) DO NOT EDIT – HACCP news */}
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
      {/* @lock:end(Home-News) */}
    </div>
  )
}

export default Dashboard