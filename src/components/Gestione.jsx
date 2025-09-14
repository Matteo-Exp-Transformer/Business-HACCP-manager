/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo componente gestisce PERSONALE e REPARTI - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo componente gestisce certificazioni, ruoli critici e reparti
 * ⚠️ Coordina formazione, compliance del personale e organizzazione reparti HACCP
 * 
 * @fileoverview Componente Gestione HACCP - Sistema Critico di Gestione Personale e Reparti
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Gestione Personale, Reparti e Certificazioni
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import CollapseCard from './ui/CollapseCard'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs'
// Select component not available, using native HTML select
import { Trash2, Users, UserCheck, GraduationCap, Edit3, StickyNote, ArrowRightLeft, RotateCw, Building2, QrCode, Bot, BarChart3 } from 'lucide-react'
import Departments from './Departments'
import ProductLabels from './ProductLabels'
import AIAssistantSection from './AIAssistantSection'

function Gestione({ 
  staff, 
  setStaff, 
  users, 
  setUsers, 
  currentUser, 
  isAdmin, 
  departments, 
  setDepartments,
  // Props per le sottosezioni
  productLabels,
  setProductLabels,
  products,
  temperatures,
  cleaning,
  onAction
}) {
  const [formData, setFormData] = useState({
    name: '',
    roles: [''],
    certification: '',
    notes: ''
  })

  // Department/Category management
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
  
  // Tab management
  const [activeTab, setActiveTab] = useState('staff')
  
  // Role distribution expansion
  const [expandedRoles, setExpandedRoles] = useState({})
  
  // Role reassignment modal
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [memberToReassign, setMemberToReassign] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

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
    if (departments.length > 0 && staff && Array.isArray(staff) && staff.length >= 0) {
      const updatedDepartments = departments.map(dept => ({
        ...dept,
        members: staff.filter(member => 
          member && (
            (member.roles && member.roles.includes(dept.name)) || 
            member.role === dept.name ||
            member.primaryRole === dept.name
          )
        ).map(member => member.id)
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
    if (!formData.name.trim() || formData.roles.every(role => !role.trim())) return

    // Controllo per nomi duplicati
    const nameExists = staff && Array.isArray(staff) ? staff.some(member => 
      member && member.name && member.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
    ) : false
    
    if (nameExists) {
      alert('⚠️ Attenzione: Esiste già un utente con questo nome.\nScegli un nome diverso per procedere con la registrazione.')
      return
    }

    // Filtra ruoli vuoti e duplicati
    const validRoles = [...new Set(formData.roles.filter(role => role.trim()))]

    const newStaff = {
      id: Date.now(),
      name: formData.name.trim(),
      roles: validRoles,
      primaryRole: validRoles[0], // Ruolo principale (primo selezionato)
      certification: formData.certification.trim(),
      notes: formData.notes.trim(),
      addedDate: new Date().toLocaleDateString('it-IT'),
      addedTime: new Date().toLocaleString('it-IT')
    }

    setStaff([...staff, newStaff])
    setFormData({ name: '', roles: [''], certification: '', notes: '' })
  }

  const deleteStaffMember = (id) => {
    if (confirm('Sei sicuro di voler rimuovere questo membro del personale?')) {
      setStaff(staff && Array.isArray(staff) ? staff.filter(member => member && member.id !== id) : [])
    }
  }

  // Funzioni per gestire ruoli multipli
  const addRoleField = () => {
    setFormData(prev => ({
      ...prev,
      roles: [...prev.roles, '']
    }))
  }

  const removeRoleField = (index) => {
    if (formData.roles.length > 1) {
      setFormData(prev => ({
        ...prev,
        roles: prev.roles.filter((_, i) => i !== index)
      }))
    }
  }

  const updateRole = (index, value) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.map((role, i) => i === index ? value : role)
    }))
  }

  // Get unique roles for statistics
  const roles = staff && Array.isArray(staff) ? [...new Set(staff.map(member => member?.role).filter(Boolean))] : []
  const certifiedStaff = staff && Array.isArray(staff) ? staff.filter(member => member && member.certification && member.certification.trim() !== '') : []

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
    // Validate role parameter
    if (!role || typeof role !== 'string') {
      return 'bg-gray-100 text-gray-800' // Default color for invalid roles
    }
    
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
      'bg-rose-100 text-rose-800',
      'bg-lime-100 text-lime-800',
      'bg-amber-100 text-amber-800',
      'bg-sky-100 text-sky-800',
      'bg-fuchsia-100 text-fuchsia-800',
      'bg-slate-100 text-slate-800',
      'bg-stone-100 text-stone-800',
      'bg-zinc-100 text-zinc-800',
      'bg-neutral-100 text-neutral-800',
      'bg-red-200 text-red-900',
      'bg-blue-200 text-blue-900',
      'bg-green-200 text-green-900',
      'bg-purple-200 text-purple-900',
      'bg-yellow-200 text-yellow-900',
      'bg-indigo-200 text-indigo-900',
      'bg-pink-200 text-pink-900',
      'bg-teal-200 text-teal-900'
    ]
    
    // Use hash of role name to pick consistent color
    const hash = role.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    return customColors[Math.abs(hash) % customColors.length]
  }

  // Get background color for category cards
  const getCategoryCardColor = (role) => {
    const roleColor = getRoleColor(role)
    // Convert text color to card background color
    if (roleColor.includes('text-red-800')) return 'bg-red-50 border-red-200'
    if (roleColor.includes('text-purple-800')) return 'bg-purple-50 border-purple-200'
    if (roleColor.includes('text-blue-800')) return 'bg-blue-50 border-blue-200'
    if (roleColor.includes('text-yellow-800')) return 'bg-yellow-50 border-yellow-200'
    if (roleColor.includes('text-green-800')) return 'bg-green-50 border-green-200'
    if (roleColor.includes('text-indigo-800')) return 'bg-indigo-50 border-indigo-200'
    if (roleColor.includes('text-pink-800')) return 'bg-pink-50 border-pink-200'
    if (roleColor.includes('text-teal-800')) return 'bg-teal-50 border-teal-200'
    if (roleColor.includes('text-orange-800')) return 'bg-orange-50 border-orange-200'
    if (roleColor.includes('text-emerald-800')) return 'bg-emerald-50 border-emerald-200'
    if (roleColor.includes('text-violet-800')) return 'bg-violet-50 border-violet-200'
    if (roleColor.includes('text-cyan-800')) return 'bg-cyan-50 border-cyan-200'
    if (roleColor.includes('text-rose-800')) return 'bg-rose-50 border-rose-200'
    if (roleColor.includes('text-lime-800')) return 'bg-lime-50 border-lime-200'
    if (roleColor.includes('text-amber-800')) return 'bg-amber-50 border-amber-200'
    if (roleColor.includes('text-sky-800')) return 'bg-sky-50 border-sky-200'
    if (roleColor.includes('text-fuchsia-800')) return 'bg-fuchsia-50 border-fuchsia-200'
    if (roleColor.includes('text-slate-800')) return 'bg-slate-50 border-slate-200'
    if (roleColor.includes('text-stone-800')) return 'bg-stone-50 border-stone-200'
    if (roleColor.includes('text-zinc-800')) return 'bg-zinc-50 border-zinc-200'
    if (roleColor.includes('text-neutral-800')) return 'bg-neutral-50 border-neutral-200'
    if (roleColor.includes('text-red-900')) return 'bg-red-100 border-red-300'
    if (roleColor.includes('text-blue-900')) return 'bg-blue-100 border-blue-300'
    if (roleColor.includes('text-green-900')) return 'bg-green-100 border-green-300'
    if (roleColor.includes('text-purple-900')) return 'bg-purple-100 border-purple-300'
    if (roleColor.includes('text-yellow-900')) return 'bg-yellow-100 border-yellow-300'
    if (roleColor.includes('text-indigo-900')) return 'bg-indigo-100 border-indigo-300'
    if (roleColor.includes('text-pink-900')) return 'bg-pink-100 border-pink-300'
    if (roleColor.includes('text-teal-900')) return 'bg-teal-100 border-teal-300'
    return 'bg-gray-50 border-gray-200'
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
      roles: member.roles && member.roles.length > 0 ? member.roles : [member.role || ''],
      certification: member.certification || '',
      notes: member.notes || ''
    })
    setShowEditForm(true)
  }

  const updateStaffMember = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || formData.roles.every(role => !role.trim())) return

    // Controllo per nomi duplicati (escludendo l'utente che stiamo modificando)
    const nameExists = staff.some(member => 
      member.id !== editingMember.id && 
      member.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
    )
    
    if (nameExists) {
      alert('⚠️ Attenzione: Esiste già un utente con questo nome.\nScegli un nome diverso per procedere con la modifica.')
      return
    }

    // Filtra ruoli vuoti e duplicati
    const validRoles = [...new Set(formData.roles.filter(role => role.trim()))]

    const updatedStaff = staff.map(member =>
      member.id === editingMember.id
        ? {
            ...member,
            name: formData.name.trim(),
            roles: validRoles,
            primaryRole: validRoles[0], // Ruolo principale (primo selezionato)
            certification: formData.certification.trim(),
            notes: formData.notes.trim(),
            lastModified: new Date().toLocaleString('it-IT')
          }
        : member
    )

    setStaff(updatedStaff)
    setFormData({ name: '', roles: [''], certification: '', notes: '' })
    setEditingMember(null)
    setShowEditForm(false)
  }

  const cancelEdit = () => {
    setEditingMember(null)
    setShowEditForm(false)
    setFormData({ name: '', roles: [''], certification: '', notes: '' })
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
      
      // Close modal and reset
      setShowReassignModal(false)
      setMemberToReassign(null)
      setNewRole('')
    }
  }

  const requestDelete = () => {
    setShowDeleteConfirmation(true)
  }

  const confirmDelete = () => {
    if (!memberToReassign) return
    
    // Remove permanently
          setStaff(staff && Array.isArray(staff) ? staff.filter(member => member && member.id !== memberToReassign.id) : [])
    
    // Close all modals and reset
    setShowReassignModal(false)
    setShowDeleteConfirmation(false)
    setMemberToReassign(null)
    setNewRole('')
  }

  const cancelReassignment = () => {
    setShowReassignModal(false)
    setShowDeleteConfirmation(false)
    setMemberToReassign(null)
    setNewRole('')
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Reparti
          </TabsTrigger>
          <TabsTrigger value="labels" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Etichette
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            IA Assistant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-6">
          {/* Category Management - Only for Admin */}
          {currentUser && currentUser.role === 'admin' && (
            <CollapseCard 
              title="Gestione Categorie Ruoli" 
              icon={Users}
              defaultExpanded={true}
            >
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
                  {departments.filter(dept => dept && dept.id && dept.name && typeof dept.name === 'string').map(dept => (
                    <div key={dept.id} className={`p-4 border rounded-lg ${getCategoryCardColor(dept.name)}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-lg">{dept.name || 'Nome non disponibile'}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(dept.name || '')}`}>
                            {dept.name || 'Nome non disponibile'}
                          </span>
                        </div>
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
                        <span>👥 {staff && Array.isArray(staff) ? staff.filter(member => 
                          member && (
                            (member.roles && member.roles.includes(dept.name)) || 
                            member.role === dept.name ||
                            member.primaryRole === dept.name
                          )
                        ).length : 0} membri</span>
                        <span>📋 {dept.assignedTasks?.length || 0} compiti</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </CardContent>
          </CollapseCard>
          )}

          {/* Add Staff Form */}
          <CollapseCard 
            title={editingMember ? 'Modifica Membro del Personale' : 'Aggiungi Membro del Personale'}
            icon={Users}
            defaultExpanded={true}
          >
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
                <Label htmlFor="roles">Ruoli</Label>
                <div className="space-y-2">
                  {formData.roles.map((role, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <select
                        value={role}
                        onChange={(e) => updateRole(index, e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required={index === 0}
                      >
                        <option value="">Seleziona un ruolo...</option>
                        {departments.filter(dept => dept && dept.id && dept.name && typeof dept.name === 'string').map(dept => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      {formData.roles.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeRoleField(index)}
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0 text-red-600 hover:text-red-800"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addRoleField}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    + Aggiungi Ruolo
                  </Button>
                </div>
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
          </CollapseCard>

          {/* Statistics */}
          <CollapseCard 
            title="Statistiche" 
            icon={BarChart3}
            defaultExpanded={false}
          >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        
        

            </div>
          </CollapseCard>

          {/* Categorie Personale - Card Individuali */}
          {departments.length > 0 && (
            <CollapseCard 
              title="Categorie Personale" 
              icon={Users}
              defaultExpanded={true}
            >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments
            .filter(dept => dept && dept.id && dept.name && typeof dept.name === 'string')
            .slice()
            .sort((a, b) => {
              const nameA = (a && a.name) ? String(a.name) : ''
              const nameB = (b && b.name) ? String(b.name) : ''
              return nameA.localeCompare(nameB)
            })
            .map(department => {
              const roleMembers = staff && Array.isArray(staff) ? staff.filter(member => 
                member && (
                  (member.roles && member.roles.includes(department.name)) || 
                  member.role === department.name ||
                  member.primaryRole === department.name
                )
              ) : []
              const count = roleMembers.length
              const isExpanded = expandedRoles[department.name]
              
              return (
                <div key={department.id}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <button
                        onClick={() => setExpandedRoles(prev => ({...prev, [department.name]: !prev[department.name]}))}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm text-gray-600">{department.name || 'Nome non disponibile'}</p>
                            <p className="text-2xl font-bold text-blue-600">{count}</p>
                          </div>
                          <Users className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="text-xs text-gray-500 flex items-center justify-between">
                          <span>{count === 1 ? 'utente' : 'utenti'}</span>
                          <span>{isExpanded ? '▼' : '▶'}</span>
                        </div>
                      </button>
                    </CardContent>
                  </Card>
                  
                  {/* Elenco utenti espanso */}
                  {isExpanded && (
                    <Card className="mt-2">
                      <CardContent className="pt-4">
                        {count === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <Users className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">Nessun dipendente in questa categoria</p>
                            <p className="text-xs">Aggiungi membri selezionando "{department.name || 'questo reparto'}" nel form sopra</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {roleMembers.map(member => (
                              <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                <div className="flex-1">
                                  <div className="font-medium">{member.fullName || member.name}</div>
                                  <div className="text-xs text-gray-600">
                                    <div className="flex flex-wrap gap-1">
                                      {(member.roles && member.roles.length > 0 ? member.roles : [member.role || 'Non assegnato']).map((role, index) => (
                                        <span key={index} className={`px-1 py-0.5 rounded text-xs ${getRoleColor(role)}`}>
                                          {role}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
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
                                <div className="flex justify-center">
                                  <Button
                                    onClick={() => removeFromRole(member)}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-orange-700 border-orange-300 hover:bg-orange-100 hover:border-orange-400 bg-white shadow-sm"
                                    title="Rimuovi da questo ruolo o riassegna"
                                  >
                                    <ArrowRightLeft className="h-7.5 w-7.5 stroke-1.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )
            })}
            </div>
            </CollapseCard>
          )}

          {/* Compact Staff List - Optimized for 35+ employees */}
          <CollapseCard 
            title={`Elenco Staff Completo (${staff.length})`}
            icon={Users}
            defaultExpanded={true}
          >
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
                <div className="col-span-2">Categoria</div>
                <div className="col-span-2">Data Registrazione</div>
                <div className="col-span-2">Note</div>
                <div className="col-span-1">Azioni</div>
              </div>
              
              {staff.map(member => (
                <div key={member.id} className={`grid grid-cols-12 gap-2 px-3 py-2 rounded border transition-colors text-sm ${
                  member.isRegisteredUser ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}>
                  <div className="col-span-3 flex items-center">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {member.name || 'Nome non disponibile'}
                        {member.isRegisteredUser && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Utente
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.addedDate}
                        {member.lastModified && ' • Mod.'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <div className="flex flex-wrap gap-1">
                      {(member.roles && member.roles.length > 0 ? member.roles : [member.role || 'Non assegnato']).map((role, index) => (
                        <span key={index} className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <span className="text-xs text-gray-600">
                      {member.roles && member.roles.length > 1 ? `${member.roles.length} ruoli` : '1 ruolo'}
                    </span>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <div className="text-xs text-gray-600">
                      {member.addedDate}
                      {member.addedTime && (
                        <div className="text-xs text-gray-400">
                          {member.addedTime.split(' ')[1]}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    {member.notes ? (
                      <div className="flex items-center gap-1 text-blue-700">
                        <StickyNote className="h-3 w-3" />
                        <span className="truncate text-xs">{member.notes}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </div>
                  
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="flex gap-1">
                      <Button
                        onClick={() => editStaffMember(member)}
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 text-blue-700 border-blue-300 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-400 bg-white shadow-sm"
                        title="Modifica dipendente"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteStaffMember(member.id)}
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-700 border-red-300 hover:bg-red-100 hover:text-red-800 hover:border-red-400 bg-white shadow-sm"
                        title="Elimina dipendente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              )}
          </CollapseCard>

          {/* Quick Add Suggestions */}
          {staff.length === 0 && (
            <CollapseCard 
              title="Suggerimenti Ruoli Comuni"
              icon={Users}
              defaultExpanded={true}
              className="border-blue-200 bg-blue-50"
            >
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
            </CollapseCard>
          )}

      {/* Role Reassignment Modal */}
      {showReassignModal && memberToReassign && !showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Rimuovi "{memberToReassign.name}" da "{memberToReassign.role}"
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Scegliere <strong>obbligatoriamente</strong> un altro ruolo per questo dipendente, 
              oppure rimuovi dipendente dall'applicazione.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nuovo ruolo per {memberToReassign.name}:
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Seleziona nuovo ruolo --</option>
                  {departments
                    .filter(dept => dept && dept.id && dept.name && typeof dept.name === 'string' && dept.name !== memberToReassign.role)
                    .map(dept => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                </select>
              </div>
              
              {newRole && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800">
                    <strong>✅ Confermato:</strong> {memberToReassign.name} verrà spostato 
                    da "{memberToReassign.role}" a "<strong>{newRole}</strong>".
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleReassignment}
                className="flex-1"
                disabled={!newRole}
                variant={newRole ? "default" : "outline"}
              >
                {newRole ? "Conferma" : "Seleziona un ruolo"}
              </Button>
              <Button 
                onClick={requestDelete}
                variant="destructive"
                className="flex-1"
              >
                Rimuovi Dipendente
              </Button>
            </div>
            
            <div className="mt-3">
              <Button 
                onClick={cancelReassignment}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Annulla
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && memberToReassign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              ⚠️ Conferma Eliminazione
            </h3>
            
            <p className="text-sm text-gray-700 mb-4">
              Sei sicuro di voler <strong>eliminare definitivamente</strong> il dipendente 
              <strong className="text-red-600"> "{memberToReassign.name}"</strong> dall'applicazione?
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-sm text-red-800">
                <strong>⚠️ Attenzione:</strong> Questa azione è <strong>irreversibile</strong>. 
                Tutti i dati associati a questo dipendente verranno persi permanentemente.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowDeleteConfirmation(false)}
                variant="outline"
                className="flex-1"
              >
                Annulla
              </Button>
              <Button 
                onClick={confirmDelete}
                variant="destructive"
                className="flex-1"
              >
                Elimina Definitivamente
              </Button>
            </div>
          </div>
        </div>
      )}
        </TabsContent>

        <TabsContent value="departments">
          <Departments 
            currentUser={currentUser}
            departments={departments}
            setDepartments={setDepartments}
          />
        </TabsContent>

        <TabsContent value="labels">
          <ProductLabels 
            productLabels={productLabels}
            setProductLabels={setProductLabels}
            products={products}
            currentUser={currentUser}
          />
        </TabsContent>

        <TabsContent value="ai-assistant">
          <AIAssistantSection 
            currentUser={currentUser}
            products={products}
            temperatures={temperatures}
            cleaning={cleaning}
            staff={staff}
            onAction={onAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Gestione