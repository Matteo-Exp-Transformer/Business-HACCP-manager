import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Trash2, Users, UserCheck, GraduationCap } from 'lucide-react'

function Staff({ staff, setStaff, users, setUsers, currentUser, isAdmin }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    certification: ''
  })

  // Department/Category management
  const [departments, setDepartments] = useState([])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    members: [],
    assignedTasks: []
  })

  // Persist to localStorage whenever staff data changes
  useEffect(() => {
    localStorage.setItem('haccp-staff', JSON.stringify(staff))
  }, [staff])

  // Load departments from localStorage
  useEffect(() => {
    const departmentsData = localStorage.getItem('haccp-departments')
    if (departmentsData) {
      setDepartments(JSON.parse(departmentsData))
    } else {
      // Initialize default departments
      const defaultDepartments = [
        { id: 'banconisti', name: 'Banconisti', description: 'Gestione bancone e servizio clienti', members: [], assignedTasks: [] },
        { id: 'cuochi', name: 'Cuochi', description: 'Preparazione e cucina', members: [], assignedTasks: [] },
        { id: 'amministrazione', name: 'Amministrazione', description: 'Gestione e supervisione', members: [], assignedTasks: [] }
      ]
      setDepartments(defaultDepartments)
      localStorage.setItem('haccp-departments', JSON.stringify(defaultDepartments))
    }
  }, [])

  // Persist departments
  useEffect(() => {
    localStorage.setItem('haccp-departments', JSON.stringify(departments))
  }, [departments])

  const addStaffMember = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.role.trim()) return

    const newStaff = {
      id: Date.now(),
      name: formData.name.trim(),
      role: formData.role.trim(),
      certification: formData.certification.trim(),
      addedDate: new Date().toLocaleDateString('it-IT'),
      addedTime: new Date().toLocaleString('it-IT')
    }

    setStaff([...staff, newStaff])
    setFormData({ name: '', role: '', certification: '' })
  }

  const deleteStaffMember = (id) => {
    if (confirm('Sei sicuro di voler rimuovere questo membro del personale?')) {
      setStaff(staff.filter(member => member.id !== id))
    }
  }

  // Get unique roles for statistics
  const roles = [...new Set(staff.map(member => member.role))]
  const certifiedStaff = staff.filter(member => member.certification.trim() !== '')

  const roleColors = {
    'Cuoco': 'bg-blue-100 text-blue-800',
    'Sous Chef': 'bg-purple-100 text-purple-800',
    'Chef': 'bg-red-100 text-red-800',
    'Cameriere': 'bg-green-100 text-green-800',
    'Addetto cucina': 'bg-yellow-100 text-yellow-800',
    'Manager': 'bg-gray-100 text-gray-800',
    'default': 'bg-gray-100 text-gray-800'
  }

  const getRoleColor = (role) => {
    return roleColors[role] || roleColors.default
  }

  // Category management functions
  const addCategory = (e) => {
    e.preventDefault()
    if (!categoryFormData.name.trim()) return

    const newCategory = {
      id: Date.now(),
      name: categoryFormData.name.trim(),
      description: categoryFormData.description.trim(),
      members: [],
      assignedTasks: [],
      createdAt: new Date().toISOString()
    }

    setDepartments([...departments, newCategory])
    setCategoryFormData({ name: '', description: '', members: [], assignedTasks: [] })
    setShowCategoryForm(false)
  }

  const editCategory = (category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description,
      members: category.members || [],
      assignedTasks: category.assignedTasks || []
    })
    setShowCategoryForm(true)
  }

  const updateCategory = (e) => {
    e.preventDefault()
    if (!categoryFormData.name.trim()) return

    const updatedDepartments = departments.map(dept =>
      dept.id === editingCategory.id 
        ? { ...dept, name: categoryFormData.name.trim(), description: categoryFormData.description.trim() }
        : dept
    )
    
    setDepartments(updatedDepartments)
    setCategoryFormData({ name: '', description: '', members: [], assignedTasks: [] })
    setEditingCategory(null)
    setShowCategoryForm(false)
  }

  const deleteCategory = (categoryId) => {
    if (confirm('Sei sicuro di voler eliminare questa categoria?')) {
      setDepartments(departments.filter(dept => dept.id !== categoryId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Staff Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Aggiungi Membro del Personale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addStaffMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Es: Mario Rossi"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Ruolo</Label>
                <Input
                  id="role"
                  placeholder="Es: Cuoco, Chef, Cameriere..."
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certification">Certificazioni HACCP (opzionale)</Label>
              <Input
                id="certification"
                placeholder="Es: Certificato HACCP livello 2, Corso sicurezza alimentare..."
                value={formData.certification}
                onChange={(e) => setFormData({...formData, certification: e.target.value})}
              />
            </div>
            <Button type="submit" className="w-full">
              Aggiungi al Team
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totale Personale</p>
                <p className="text-2xl font-bold">{staff.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Con Certificazioni</p>
                <p className="text-2xl font-bold text-green-600">{certifiedStaff.length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ruoli Diversi</p>
                <p className="text-2xl font-bold text-purple-600">{roles.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Overview */}
      {roles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione Ruoli</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {roles.map(role => {
                const count = staff.filter(member => member.role === role).length
                return (
                  <div
                    key={role}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(role)}`}
                  >
                    {role} ({count})
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Management - Only for Admin */}
      {currentUser && currentUser.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestione Categorie Ruoli
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Category Form */}
            {showCategoryForm && (
              <form onSubmit={editingCategory ? updateCategory : addCategory} className="space-y-4 mb-6 p-4 bg-blue-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoryName">Nome Categoria</Label>
                    <Input
                      id="categoryName"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                      placeholder="es. Cucina, Sala, Amministrazione"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryDescription">Descrizione</Label>
                    <Input
                      id="categoryDescription"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                      placeholder="Descrizione della categoria"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    {editingCategory ? 'Aggiorna Categoria' : 'Aggiungi Categoria'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowCategoryForm(false)
                      setEditingCategory(null)
                      setCategoryFormData({ name: '', description: '', members: [], assignedTasks: [] })
                    }}
                  >
                    Annulla
                  </Button>
                </div>
              </form>
            )}

            {/* Categories List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Categorie Disponibili ({departments.length})</h4>
                <Button 
                  onClick={() => setShowCategoryForm(true)}
                  size="sm"
                  variant="outline"
                >
                  Nuova Categoria
                </Button>
              </div>

              {departments.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Nessuna categoria creata</p>
                  <p className="text-sm">Crea la prima categoria per organizzare i ruoli</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {departments.map(dept => (
                    <div key={dept.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-lg">{dept.name}</h5>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => editCategory(dept)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            ✏️
                          </Button>
                          <Button
                            onClick={() => deleteCategory(dept.id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                      {dept.description && (
                        <p className="text-sm text-gray-600 mb-2">{dept.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>👥 {dept.members?.length || 0} membri</span>
                        <span>📋 {dept.assignedTasks?.length || 0} compiti</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Elenco Personale ({staff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Nessun membro del personale registrato</p>
              <p className="text-sm text-gray-500">
                Aggiungi il primo membro del team per iniziare la gestione del personale HACCP
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {staff.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium text-lg">{member.name}</div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {member.role}
                      </div>
                    </div>
                    
                    {member.certification && (
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">
                          {member.certification}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Aggiunto: {member.addedTime}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => deleteStaffMember(member.id)}
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Add Suggestions */}
      {staff.length === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Suggerimenti Ruoli Comuni</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700 mb-3">
              Ecco alcuni ruoli comuni nella ristorazione che potresti voler aggiungere:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Chef', 'Sous Chef', 'Cuoco', 'Addetto cucina', 'Cameriere', 'Barista', 'Manager'].map(role => (
                <button
                  key={role}
                  onClick={() => setFormData({...formData, role})}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {role}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Staff