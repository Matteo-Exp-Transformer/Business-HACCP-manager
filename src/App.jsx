import React, { useState, useEffect } from 'react'
import { BarChart3, Thermometer, Sparkles, Users, Download, Upload } from 'lucide-react'
import Dashboard from './components/Dashboard'
import Temperature from './components/Temperature'
import Cleaning from './components/Cleaning'
import Staff from './components/Staff'
import PDFExport from './components/PDFExport'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card'
import { Button } from './components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [temperatures, setTemperatures] = useState([])
  const [cleaning, setCleaning] = useState([])
  const [staff, setStaff] = useState([])

  // Load data from localStorage on app start
  useEffect(() => {
    const temps = localStorage.getItem('haccp-temperatures')
    const cleanData = localStorage.getItem('haccp-cleaning')
    const staffData = localStorage.getItem('haccp-staff')
    
    if (temps) setTemperatures(JSON.parse(temps))
    if (cleanData) setCleaning(JSON.parse(cleanData))
    if (staffData) setStaff(JSON.parse(staffData))
  }, [])

  // Export all data
  const exportData = () => {
    const data = {
      temperatures,
      cleaningTasks: cleaning,
      staff,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `haccp-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Import data
  const importData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.temperatures) {
          setTemperatures(data.temperatures)
          localStorage.setItem('haccp-temperatures', JSON.stringify(data.temperatures))
        }
        if (data.cleaningTasks) {
          setCleaning(data.cleaningTasks)
          localStorage.setItem('haccp-cleaning', JSON.stringify(data.cleaningTasks))
        }
        if (data.staff) {
          setStaff(data.staff)
          localStorage.setItem('haccp-staff', JSON.stringify(data.staff))
        }
        alert('Dati importati con successo!')
      } catch (error) {
        alert('Errore durante l\'importazione del file')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  return (
    <div className="min-h-screen bg-gray-50 safe-area-top">
      <div className="container mx-auto max-w-4xl p-4">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-primary-700">
                  Mini-ePackPro
                </CardTitle>
                <p className="text-gray-600 mt-1">Sistema HACCP Digitale</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={exportData}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Esporta
                </Button>
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4" />
                      Importa
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="temperature" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              <span className="hidden sm:inline">Temperature</span>
            </TabsTrigger>
            <TabsTrigger value="cleaning" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Pulizie</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Personale</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard
              temperatures={temperatures}
              cleaning={cleaning}
              staff={staff}
            />
          </TabsContent>

          <TabsContent value="temperature">
            <Temperature
              temperatures={temperatures}
              setTemperatures={setTemperatures}
            />
          </TabsContent>

          <TabsContent value="cleaning">
            <Cleaning
              cleaning={cleaning}
              setCleaning={setCleaning}
            />
          </TabsContent>

          <TabsContent value="staff">
            <Staff
              staff={staff}
              setStaff={setStaff}
            />
          </TabsContent>
        </Tabs>

        {/* PDF Export Floating Button */}
        <PDFExport 
          activeTab={activeTab}
          temperatures={temperatures}
        />
      </div>
    </div>
  )
}

export default App