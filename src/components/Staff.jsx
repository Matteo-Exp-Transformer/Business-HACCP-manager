import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
// Select component not available, using native HTML select
import { Trash2, Users, UserCheck, GraduationCap, Edit3, StickyNote } from 'lucide-react'

function Staff({ staff, setStaff, users, setUsers, currentUser, isAdmin }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    certification: '',
    notes: ''
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

  // Staff member editing
  const [editingMember, setEditingMember] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)
  
  // Role distribution expansion
  const [expandedRoles, setExpandedRoles] = useState({})
  
  // Role reassignment modal
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [memberToReassign, setMemberToReassign] = useState(null)
  const [newRole, setNewRole] = useState('')

  // Persist to localStorage whenever staff data changes
  useEffect(() => {
    localStorage.setItem('haccp-staff', JSON.stringify(staff))
  }, [staff])

  // Load departments from localStorage
  useEffect(() => {
    const departmentsData = localStorage.getItem('haccp-departments')
    const departmentsVersion = localStorage.getItem('haccp-departments-version')
    
    const defaultDepartments = [
      { id: 'amministratori', name: 'Amministratori', description: 'Gestione e supervisione completa', members: [], assignedTasks: [] },
      { id: 'responsabili', name: 'Responsabili', description: 'Responsabili di reparto e coordinamento', members: [], assignedTasks: [] },
      { id: 'dipendenti', name: 'Dipendenti', description: 'Staff fisso e personale regolare', members: [], assignedTasks: [] },
      { id: 'collaboratori', name: 'Collaboratore Occasionale', description: 'Personale temporaneo e collaborazioni esterne', members: [], assignedTasks: [] }
    ]
    
    if (departmentsVersion !== '2.0' || !departmentsData) {
      // First time or old version - set defaults
      setDepartments(defaultDepartments)
      localStorage.setItem('haccp-departments', JSON.stringify(defaultDepartments))
      localStorage.setItem('haccp-departments-version', '2.0')
    } else {
      // Load existing data but ensure default categories exist
      const existingDepartments = JSON.parse(departmentsData)
      const mergedDepartments = [...defaultDepartments]
      
      // Add custom categories that don't conflict with defaults
      existingDepartments.forEach(dept => {
        if (!defaultDepartments.find(def => def.id === dept.id)) {
          mergedDepartments.push(dept)
        }
      })
      
      setDepartments(mergedDepartments)
    }
  }, [])

  // Persist departments
  useEffect(() => {
    localStorage.setItem('haccp-departments', JSON.stringify(departments))
  }, [departments])

  // Sync department member counts with actual staff
  useEffect(() => {
    if (departments.length > 0 && staff.length >= 0) {
      const updatedDepartments = departments.map(dept => ({
        ...dept,
        members: staff.filter(member => member.role === dept.name).map(member => member.id)
      }))
      
      // Only update if there's actually a change to avoid infinite loops
      const hasChanges = updatedDepartments.some((dept, index) => 
        JSON.stringify(dept.members) !== JSON.stringify(departments[index]?.members || [])
      )
      
      if (hasChanges) {
        setDepartments(updatedDepartments)
      }
    }
  }, [staff]) // Only depend on staff changes

  const addStaffMember = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.role.trim()) return

    const newStaff = {
      id: Date.now(),
      name: formData.name.trim(),
      role: formData.role.trim(),
      certification: formData.certification.trim(),
      notes: formData.notes.trim(),
      addedDate: new Date().toLocaleDateString('it-IT'),
      addedTime: new Date().toLocaleString('it-IT')
    }

    setStaff([...staff, newStaff])
    setFormData({ name: '', role: '', certification: '', notes: '' })
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
    'Amministratori': 'bg-red-100 text-red-800',
    'Responsabili': 'bg-purple-100 text-purple-800',
    'Dipendenti': 'bg-blue-100 text-blue-800',
    'Collaboratore Occasionale': 'bg-yellow-100 text-yellow-800',
    // Legacy colors for backward compatibility
    'Cuoco': 'bg-blue-100 text-blue-800',
    'Sous Chef': 'bg-purple-100 text-purple-800',
    'Chef': 'bg-red-100 text-red-800',
    'Cameriere': 'bg-green-100 text-green-800',
    'Addetto cucina': 'bg-yellow-100 text-yellow-800',
    'Manager': 'bg-gray-100 text-gray-800',
    'default': 'bg-gray-100 text-gray-800'
  }

  const getRoleColor = (role) => {
    if (roleColors[role]) {
      return roleColors[role]
    }
    
    // Generate consistent colors for custom roles based on their name
    const customColors = [
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-teal-100 text-teal-800',
      'bg-orange-100 text-orange-800',
      'bg-emerald-100 text-emerald-800',
      'bg-violet-100 text-violet-800',
      'bg-cyan-100 text-cyan-800',
      'bg-rose-100 text-rose-800'
    ]
    
    // Use hash of role name to pick consistent color
    const hash = role.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    return customColors[Math.abs(hash) % customColors.length]
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

  // Staff member editing functions
  const editStaffMember = (member) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      certification: member.certification || '',
      notes: member.notes || ''
    })
    setShowEditForm(true)
  }

  const updateStaffMember = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.role.trim()) return

    const updatedStaff = staff.map(member =>
      member.id === editingMember.id
        ? {
            ...member,
            name: formData.name.trim(),
            role: formData.role.trim(),
            certification: formData.certification.trim(),
            notes: formData.notes.trim(),
            lastModified: new Date().toLocaleString('it-IT')
          }
        : member
    )

    setStaff(updatedStaff)
    setFormData({ name: '', role: '', certification: '', notes: '' })
    setEditingMember(null)
    setShowEditForm(false)
  }

  const cancelEdit = () => {
    setEditingMember(null)
    setShowEditForm(false)
    setFormData({ name: '', role: '', certification: '', notes: '' })
  }

  // Role reassignment functions
  const removeFromRole = (member) => {
    setMemberToReassign(member)
    setNewRole('')
    setShowReassignModal(true)
  }

  const handleReassignment = () => {
    if (!memberToReassign) return

    if (newRole) {
      // Reassign to new role
      const updatedStaff = staff.map(member =>
        member.id === memberToReassign.id
          ? { ...member, role: newRole, lastModified: new Date().toLocaleString('it-IT') }
          : member
      )
      setStaff(updatedStaff)
    } else {
      // Remove permanently
      setStaff(staff.filter(member => member.id !== memberToReassign.id))
    }

    setShowReassignModal(false)
    setMemberToReassign(null)
    setNewRole('')
  }

  const cancelReassignment = () => {
    setShowReassignModal(false)
    setMemberToReassign(null)
    setNewRole('')
  }

  return (
    <div className="space-y-6">
      {/* Add Staff Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {editingMember ? 'Modifica Membro del Personale' : 'Aggiungi Membro del Personale'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showEditForm && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Stai modificando:</strong> {editingMember?.name}
              </p>
            </div>
          )}
          <form onSubmit={editingMember ? updateStaffMember : addStaffMember} className="space-y-4">
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
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Seleziona un ruolo...</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certification">Certificazioni HACCP (opzionale)</Label>
                <Input
                  id="certification"
                  placeholder="Es: Certificato HACCP livello 2, Corso sicurezza alimentare..."
                  value={formData.certification}
                  onChange={(e) => setFormData({...formData, certification: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Note (opzionale)</Label>
                <Input
                  id="notes"
                  placeholder="Es: Turno preferito, competenze particolari..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingMember ? 'Salva Modifiche' : 'Aggiungi al Team'}
              </Button>
              {editingMember && (
                <Button type="button" variant="outline" onClick={cancelEdit} className="flex-1">
                  Annulla
                </Button>
              )}
            </div>
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

      {/* Interactive Roles Distribution */}
      {departments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione Ruoli</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departments.map(department => {
                const roleMembers = staff.filter(member => member.role === department.name)
                const count = roleMembers.length
                const isExpanded = expandedRoles[department.name]
                
                return (
                  <div key={department.id} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedRoles(prev => ({...prev, [department.name]: !prev[department.name]}))}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${getRoleColor(department.name)} border-none`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{department.name} ({count})</span>
                        <span className="text-xs">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="px-4 py-3 bg-gray-50 border-t">
                        {count === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <Users className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">Nessun dipendente in questo ruolo</p>
                            <p className="text-xs">Aggiungi membri selezionando "{department.name}" nel form sopra</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {roleMembers.map(member => (
                              <div key={member.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex-1">
                                  <div className="font-medium">{member.name}</div>
                                  {member.certification && (
                                    <div className="text-xs text-green-600 flex items-center gap-1">
                                      <GraduationCap className="h-3 w-3" />
                                      {member.certification}
                                    </div>
                                  )}
                                  {member.notes && (
                                    <div className="text-xs text-blue-600 flex items-center gap-1">
                                      <StickyNote className="h-3 w-3" />
                                      {member.notes}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => editStaffMember(member)}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-blue-600 border-blue-200 hover:bg-blue-50"
                                    title="Modifica dipendente"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    onClick={() => removeFromRole(member)}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-orange-600 border-orange-200 hover:bg-orange-50"
                                    title="Rimuovi da questo ruolo"
                                  >
                                    <Users className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    onClick={() => deleteStaffMember(member.id)}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-red-600 border-red-200 hover:bg-red-50"
                                    title="Elimina definitivamente"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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
                        <span>👥 {staff.filter(member => member.role === dept.name).length} membri</span>
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

      {/* Compact Staff List - Optimized for 35+ employees */}
      <Card>
        <CardHeader>
          <CardTitle>Elenco Personale Completo ({staff.length})</CardTitle>
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
            <div className="space-y-2">
              {/* Compact table-like layout */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-100 rounded text-xs font-medium text-gray-600">
                <div className="col-span-3">Nome</div>
                <div className="col-span-2">Ruolo</div>
                <div className="col-span-3">Certificazione</div>
                <div className="col-span-3">Note</div>
                <div className="col-span-1">Azioni</div>
              </div>
              
              {staff.map(member => (
                <div key={member.id} className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors text-sm">
                  <div className="col-span-3 flex items-center">
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-gray-500">
                        {member.addedDate}
                        {member.lastModified && ' • Mod.'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                  
                  <div className="col-span-3 flex items-center">
                    {member.certification ? (
                      <div className="flex items-center gap-1 text-green-700">
                        <GraduationCap className="h-3 w-3" />
                        <span className="truncate">{member.certification}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Nessuna</span>
                    )}
                  </div>
                  
                  <div className="col-span-3 flex items-center">
                    {member.notes ? (
                      <div className="flex items-center gap-1 text-blue-700">
                        <StickyNote className="h-3 w-3" />
                        <span className="truncate">{member.notes}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </div>
                  
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <Button
                      onClick={() => editStaffMember(member)}
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => deleteStaffMember(member.id)}
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
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

      {/* Role Reassignment Modal */}
      {showReassignModal && memberToReassign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Rimuovi "{memberToReassign.name}" da "{memberToReassign.role}"
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Cosa vuoi fare con questo dipendente?
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Riassegna a nuovo ruolo:
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Seleziona nuovo ruolo --</option>
                  {departments
                    .filter(dept => dept.name !== memberToReassign.role)
                    .map(dept => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                </select>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Attenzione:</strong> Se non selezioni un nuovo ruolo, 
                  il dipendente verrà <strong>eliminato definitivamente</strong> dall'app.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleReassignment}
                className="flex-1"
                variant={newRole ? "default" : "destructive"}
              >
                {newRole ? `Riassegna a "${newRole}"` : "Elimina Definitivamente"}
              </Button>
              <Button 
                onClick={cancelReassignment}
                variant="outline"
                className="flex-1"
              >
                Annulla
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Staff