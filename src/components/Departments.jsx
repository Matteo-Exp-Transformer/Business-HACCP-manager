import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Building2, Plus, Edit2, Trash2, Users, Save, X } from 'lucide-react'

function Departments({ departments, setDepartments }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: ''
  })

  // Inizializza reparti default se non esistono
  useEffect(() => {
    if (!departments || departments.length === 0) {
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
  }, [departments, setDepartments])

  // Persist to localStorage whenever departments data changes
  useEffect(() => {
    if (departments && departments.length > 0) {
      localStorage.setItem('haccp-departments', JSON.stringify(departments))
    }
  }, [departments])

  const addDepartment = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    // Verifica che il nome sia unico
    const nameExists = departments.some(dept => 
      dept.name.toLowerCase() === formData.name.trim().toLowerCase()
    )
    
    if (nameExists) {
      alert('Esiste già un reparto con questo nome. Scegli un nome diverso.')
      return
    }

    const newDepartment = {
      id: `dept_${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      createdAt: new Date().toLocaleString('it-IT'),
      isCustom: true
    }

    setDepartments([...departments, newDepartment])
    setFormData({ name: '', description: '' })
  }

  const startEdit = (department) => {
    setEditingId(department.id)
    setEditFormData({
      name: department.name,
      description: department.description
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditFormData({ name: '', description: '' })
  }

  const saveEdit = (id) => {
    if (!editFormData.name.trim()) return

    // Verifica che il nome sia unico (escludendo il reparto corrente)
    const nameExists = departments.some(dept => 
      dept.id !== id && dept.name.toLowerCase() === editFormData.name.trim().toLowerCase()
    )
    
    if (nameExists) {
      alert('Esiste già un reparto con questo nome. Scegli un nome diverso.')
      return
    }

    setDepartments(departments.map(dept =>
      dept.id === id
        ? {
            ...dept,
            name: editFormData.name.trim(),
            description: editFormData.description.trim(),
            updatedAt: new Date().toLocaleString('it-IT')
          }
        : dept
    ))
    setEditingId(null)
    setEditFormData({ name: '', description: '' })
  }

  const deleteDepartment = (id) => {
    const department = departments.find(dept => dept.id === id)
    
    // Non permettere eliminazione dei reparti default
    if (!department.isCustom) {
      alert('Non puoi eliminare i reparti predefiniti del sistema.')
      return
    }

    if (confirm(`Sei sicuro di voler eliminare il reparto "${department.name}"? Questa azione non può essere annullata.`)) {
      setDepartments(departments.filter(dept => dept.id !== id))
      
      // Se ci sono task di pulizia assegnati a questo reparto, potrebbero rimanere orfani
      // Dovremmo gestire questa casistica (opzionale: riassegnare o eliminare)
      const cleaningTasks = JSON.parse(localStorage.getItem('haccp-cleaning') || '[]')
      const orphanedTasks = cleaningTasks.filter(task => task.departmentId === id)
      
      if (orphanedTasks.length > 0) {
        alert(`Attenzione: ci sono ${orphanedTasks.length} attività di pulizia assegnate a questo reparto. Verifica le assegnazioni nel modulo Pulizia.`)
      }
    }
  }

  // Calcola statistiche
  const totalDepartments = departments.length
  const customDepartments = departments.filter(dept => dept.isCustom).length
  const defaultDepartments = departments.filter(dept => !dept.isCustom).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            Gestione Reparti
          </h1>
          <p className="text-gray-600 mt-1">
            Business HACCP Manager - Configura e gestisci i reparti aziendali
          </p>
        </div>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Totale Reparti</p>
                <p className="text-2xl font-bold text-gray-900">{totalDepartments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reparti Predefiniti</p>
                <p className="text-2xl font-bold text-gray-900">{defaultDepartments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Plus className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reparti Personalizzati</p>
                <p className="text-2xl font-bold text-gray-900">{customDepartments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form per aggiungere nuovo reparto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Aggiungi Nuovo Reparto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addDepartment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Reparto *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="es. Pasticceria"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="es. Preparazione dolci e dessert"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Reparto
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista reparti esistenti */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Reparti Configurati ({departments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departments.map((department) => (
              <div
                key={department.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                {editingId === department.id ? (
                  // Modalità editing
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 mr-4">
                    <Input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      placeholder="Nome reparto"
                    />
                    <Input
                      type="text"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      placeholder="Descrizione"
                    />
                  </div>
                ) : (
                  // Modalità visualizzazione
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{department.name}</h3>
                        {!department.isCustom && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Predefinito
                          </span>
                        )}
                      </div>
                    </div>
                    {department.description && (
                      <p className="text-sm text-gray-600 mt-1">{department.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {department.id}
                      {department.createdAt && ` • Creato: ${department.createdAt}`}
                      {department.updatedAt && ` • Aggiornato: ${department.updatedAt}`}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {editingId === department.id ? (
                    // Pulsanti salva/annulla
                    <>
                      <Button
                        size="sm"
                        onClick={() => saveEdit(department.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    // Pulsanti modifica/elimina
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(department)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {department.isCustom && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteDepartment(department.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {departments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>Nessun reparto configurato</p>
                <p className="text-sm">Aggiungi il primo reparto utilizzando il form sopra</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informazioni sistema */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Informazioni sui Reparti</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• I reparti predefiniti (Banconisti, Cuochi, Amministrazione) non possono essere eliminati</li>
                <li>• Ogni reparto deve avere un nome unico nel sistema</li>
                <li>• I task di pulizia vengono assegnati ai reparti, non ai singoli utenti</li>
                <li>• L'eliminazione di un reparto potrebbe lasciare attività orfane da riassegnare</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Departments