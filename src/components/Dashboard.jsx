import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { CheckCircle, AlertTriangle, Package, Calendar } from 'lucide-react'

function Dashboard({ temperatures = [], cleaning = [], staff = [], products = [], currentUser }) {
  // Statistiche semplici
  const tempOk = temperatures.filter(t => t.status === 'ok').length
  const tempProblems = temperatures.filter(t => t.status === 'danger').length
  const cleaningPending = cleaning.filter(c => !c.completed).length

  return (
    <div className="space-y-6">
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
    </div>
  )
}

export default Dashboard