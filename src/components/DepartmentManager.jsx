import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs'
import Departments from './Departments'
import CleaningDepartments from './CleaningDepartments'
import { Building2, Sparkles, Settings } from 'lucide-react'

function DepartmentManager() {
  const [departments, setDepartments] = useState([])
  const [cleaning, setCleaning] = useState([])
  const [activeTab, setActiveTab] = useState('departments')

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load departments
    const deptData = localStorage.getItem('haccp-departments')
    if (deptData) {
      try {
        setDepartments(JSON.parse(deptData))
      } catch (error) {
        console.error('Error loading departments:', error)
        // Initialize with default departments if error
        const defaultDepartments = [
          {
            id: "banconisti",
            name: "Banconisti",
            description: "Gestione bancone e servizio clienti"
          },
          {
            id: "cuochi",
            name: "Cuochi",
            description: "Preparazione e cucina"
          },
          {
            id: "amministrazione",
            name: "Amministrazione",
            description: "Gestione e supervisione"
          }
        ]
        setDepartments(defaultDepartments)
      }
    }

    // Load cleaning tasks
    const cleanData = localStorage.getItem('haccp-cleaning')
    if (cleanData) {
      try {
        setCleaning(JSON.parse(cleanData))
      } catch (error) {
        console.error('Error loading cleaning data:', error)
        setCleaning([])
      }
    }
  }, [])

  // Calculate statistics
  const totalDepartments = departments.length
  const customDepartments = departments.filter(dept => dept.isCustom).length
  const totalTasks = cleaning.length
  const pendingTasks = cleaning.filter(task => !task.completed).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            Sistema Reparti
          </h1>
          <p className="text-gray-600 mt-1">
            Business HACCP Manager - Gestione reparti e attività aziendali
          </p>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reparti Totali</p>
                <p className="text-2xl font-bold text-gray-900">{totalDepartments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Personalizzati</p>
                <p className="text-2xl font-bold text-gray-900">{customDepartments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Attività Totali</p>
                <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Sospeso</p>
                <p className="text-2xl font-bold text-orange-600">{pendingTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Gestione Reparti
          </TabsTrigger>
          <TabsTrigger value="cleaning" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Pulizia Reparti
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="mt-6">
          <Departments
            departments={departments}
            setDepartments={setDepartments}
          />
        </TabsContent>

        <TabsContent value="cleaning" className="mt-6">
          {departments.length === 0 ? (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6 text-center">
                <Building2 className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-yellow-900 mb-2">
                  Nessun reparto configurato
                </h3>
                <p className="text-yellow-800 mb-4">
                  Prima di assegnare attività di pulizia, devi configurare almeno un reparto.
                </p>
                <Button 
                  onClick={() => setActiveTab('departments')}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Configura Reparti
                </Button>
              </CardContent>
            </Card>
          ) : (
            <CleaningDepartments
              cleaning={cleaning}
              setCleaning={setCleaning}
              departments={departments}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">Sistema Reparti Business HACCP Manager</h4>
              <p className="text-sm text-blue-800 mb-3">
                Gestisci reparti e attività di pulizia in modo organizzato e professionale
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab('departments')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Building2 className="h-3 w-3 mr-1" />
                  Configura Reparti
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab('cleaning')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  disabled={departments.length === 0}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Gestisci Pulizia
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DepartmentManager