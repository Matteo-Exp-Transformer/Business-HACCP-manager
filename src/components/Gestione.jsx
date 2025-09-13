/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo è il COMPONENTE GESTIONE - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo componente gestisce staff, reparti, fornitori e IA Assistant
 * ⚠️ Coordina la gestione del personale e delle risorse aziendali
 * 
 * @fileoverview Componente Gestione HACCP - Sistema Critico di Amministrazione
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Gestione Personale
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import { Users, Building2, Truck, Bot, QrCode, Plus, Edit, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs'
import CollapsibleCard from './CollapsibleCard'
import AIAssistantSection from './AIAssistantSection'
import ProductLabels from './ProductLabels'
import Suppliers from './Suppliers'
import { useScrollToForm } from '../hooks/useScrollToForm'

function Gestione({ 
  staff = [], 
  setStaff, 
  users = [], 
  setUsers, 
  currentUser, 
  isAdmin, 
  departments = [], 
  setDepartments,
  products = [],
  temperatures = [],
  cleaning = [],
  productLabels = [],
  setProductLabels
}) {
  const [activeSubTab, setActiveSubTab] = useState('staff')
  const [showAddStaffForm, setShowAddStaffForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)

  // Hook per scroll automatico al form staff
  const { formRef: staffFormRef, scrollToForm: scrollToStaffForm } = useScrollToForm(showAddStaffForm, 'staff-form')
  
  // Effetto per scroll automatico quando il form staff si apre
  useEffect(() => {
    if (showAddStaffForm) {
      scrollToStaffForm()
    }
  }, [showAddStaffForm, scrollToStaffForm])

  const [newStaff, setNewStaff] = useState({
    name: '',
    surname: '',
    role: 'Dipendente',
    department: '',
    certification: '',
    notes: ''
  })

  // Category management states
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    members: [],
    assignedTasks: []
  })

  // Ruoli comuni HACCP
  const commonRoles = [
    'Responsabile HACCP',
    'Amministratore',
    'Cuoco',
    'Cameriere',
    'Banconista',
    'Addetto Pulizie',
    'Magazziniere',
    'Collaboratore Occasionale'
  ]

  // Calcola statistiche staff
  const getStaffStats = () => {
    const totalStaff = staff.length
    const certifiedStaff = staff.filter(member => member.certification && member.certification.trim() !== '').length
    const activeStaff = staff.filter(member => !member.isInactive).length
    const byRole = staff.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1
      return acc
    }, {})

    return {
      total: totalStaff,
      certified: certifiedStaff,
      active: activeStaff,
      byRole
    }
  }

  const staffStats = getStaffStats()

  // Gestione form staff
  const handleStaffSubmit = (e) => {
    e.preventDefault()
    
    if (editingStaff) {
      // Modifica staff esistente
      const updatedStaff = staff.map(member => 
        member.id === editingStaff.id 
          ? { ...member, ...newStaff, fullName: `${newStaff.name} ${newStaff.surname}` }
          : member
      )
      setStaff(updatedStaff)
      setEditingStaff(null)
    } else {
      // Aggiungi nuovo staff
      const newMember = {
        ...newStaff,
        id: `staff_${Date.now()}`,
        fullName: `${newStaff.name} ${newStaff.surname}`,
        addedDate: new Date().toLocaleDateString('it-IT'),
        addedTime: new Date().toLocaleString('it-IT'),
        createdAt: new Date().toISOString()
      }
      setStaff([...staff, newMember])
    }
    
    setNewStaff({
      name: '',
      surname: '',
      role: 'Dipendente',
      department: '',
      certification: '',
      notes: ''
    })
    setShowAddStaffForm(false)
  }

  const handleEditStaff = (member) => {
    setEditingStaff(member)
    setNewStaff({
      name: member.name || '',
      surname: member.surname || '',
      role: member.role || 'Dipendente',
      department: member.department || '',
      certification: member.certification || '',
      notes: member.notes || ''
    })
    setShowAddStaffForm(true)
  }

  const handleDeleteStaff = (memberId) => {
    if (confirm('Sei sicuro di voler eliminare questo membro dello staff?')) {
      setStaff(staff.filter(member => member.id !== memberId))
    }
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
      assignedTasks: []
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
    setShowCategoryForm(false)
    setEditingCategory(null)
  }

  const deleteCategory = (categoryId) => {
    if (confirm('Sei sicuro di voler eliminare questa categoria?')) {
      setDepartments(departments.filter(dept => dept.id !== categoryId))
    }
  }

  // Get role color for categories
  const getRoleColor = (role) => {
    const roleColors = {
      'Amministratori': 'bg-red-100 text-red-800',
      'Responsabili': 'bg-purple-100 text-purple-800',
      'Dipendenti': 'bg-blue-100 text-blue-800',
      'Collaboratore Occasionale': 'bg-yellow-100 text-yellow-800',
      'default': 'bg-gray-100 text-gray-800'
    }
    return roleColors[role] || roleColors.default
  }

  // Get background color for category cards
  const getCategoryCardColor = (role) => {
    const roleColor = getRoleColor(role)
    if (roleColor.includes('text-red-800')) return 'bg-red-50 border-red-200'
    if (roleColor.includes('text-purple-800')) return 'bg-purple-50 border-purple-200'
    if (roleColor.includes('text-blue-800')) return 'bg-blue-50 border-blue-200'
    if (roleColor.includes('text-yellow-800')) return 'bg-yellow-50 border-yellow-200'
    if (roleColor.includes('text-green-800')) return 'bg-green-50 border-green-200'
    return 'bg-gray-50 border-gray-200'
  }

  return (
    <div className="space-y-6">
      {/* Tab principale */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Staff</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Reparti</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Fornitori</span>
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">IA Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="labels" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Etichette</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Staff */}
        <TabsContent value="staff" className="space-y-6">
          {/* Gestione Categorie Ruoli - Solo per Admin */}
          {currentUser && currentUser.role === 'admin' && (
            <CollapsibleCard
              title="Gestione Categorie Ruoli"
              subtitle="Organizzazione categorie e ruoli del personale"
              icon={Users}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100"
              count={departments.length}
              testId="role-categories"
              defaultExpanded={true}
            >
              <div className="space-y-4">
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
              </div>
            </CollapsibleCard>
          )}

          {/* Elenco Staff Completo */}
          <CollapsibleCard
            title="Elenco Staff Completo"
            subtitle="Gestione personale e certificazioni"
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            count={staffStats.total}
            testId="staff-list"
            defaultExpanded={true}
          >
            <div className="space-y-4">
              {/* Lista staff */}
              <div className="space-y-3">
                {staff.map(member => (
                  <Card key={member.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{member.fullName}</h4>
                          <p className="text-sm text-gray-600">Ruolo: {member.role}</p>
                          <p className="text-sm text-gray-600">Reparto: {member.department || 'Non assegnato'}</p>
                          
                          {member.certification && (
                            <div className="mt-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-700">{member.certification}</span>
                            </div>
                          )}
                          
                          {member.notes && (
                            <p className="text-sm text-gray-500 mt-1">{member.notes}</p>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-2">
                            Aggiunto: {member.addedDate} alle {member.addedTime}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStaff(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStaff(member.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pulsante aggiungi */}
              <Button
                onClick={() => setShowAddStaffForm(true)}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Membro Staff
              </Button>
            </div>
          </CollapsibleCard>

          {/* Suggerimenti Ruoli Comuni */}
          <CollapsibleCard
            title="Suggerimenti Ruoli Comuni"
            subtitle="Ruoli standard per il settore alimentare"
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            count={commonRoles.length}
            testId="staff-roles"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonRoles.map(role => (
                <div key={role} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">{role}</p>
                </div>
              ))}
            </div>
          </CollapsibleCard>
        </TabsContent>

        {/* Tab Reparti */}
        <TabsContent value="departments" className="space-y-6">
          <CollapsibleCard
            title="Gestione Reparti"
            subtitle="Organizzazione aziendale e divisioni"
            icon={Building2}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            count={departments.length}
            testId="departments-list"
            defaultExpanded={true}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments.map(dept => (
                  <Card key={dept.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900">{dept.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {dept.description || 'Nessuna descrizione disponibile'}
                      </p>
                      {dept.location && (
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {dept.location}
                        </p>
                      )}
                      {dept.manager && (
                        <p className="text-sm text-gray-500 mt-1">
                          👤 Responsabile: {dept.manager}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CollapsibleCard>
        </TabsContent>

        {/* Tab Fornitori */}
        <TabsContent value="suppliers" className="space-y-6">
          <CollapsibleCard
            title="Gestione Fornitori"
            subtitle="Fornitori e certificazioni"
            icon={Truck}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
            count={0}
            testId="suppliers-list"
            defaultExpanded={true}
          >
            <Suppliers currentUser={currentUser} />
          </CollapsibleCard>
        </TabsContent>

        {/* Tab IA Assistant */}
        <TabsContent value="ai-assistant" className="space-y-6">
          <CollapsibleCard
            title="IA Assistant e Azioni Rapide"
            subtitle="Assistente intelligente e automatizzazioni HACCP"
            icon={Bot}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-100"
            count={4}
            testId="ai-assistant"
            defaultExpanded={true}
          >
            <AIAssistantSection 
              currentUser={currentUser}
              products={products}
              temperatures={temperatures}
              cleaning={cleaning}
              staff={staff}
              onAction={(action) => {
                console.log('AI Action:', action)
                // Qui implementeremo le azioni dell'IA
              }}
            />
          </CollapsibleCard>
        </TabsContent>

        {/* Tab Etichette */}
        <TabsContent value="labels" className="space-y-6">
          <CollapsibleCard
            title="Gestione Etichette e Scanner"
            subtitle="Creazione etichette e scansione codici a barre"
            icon={QrCode}
            iconColor="text-teal-600"
            iconBgColor="bg-teal-100"
            count={productLabels.length}
            testId="labels-management"
            defaultExpanded={true}
          >
            <ProductLabels 
              productLabels={productLabels}
              setProductLabels={setProductLabels}
              products={products}
              currentUser={currentUser}
            />
          </CollapsibleCard>
        </TabsContent>
      </Tabs>

      {/* Form aggiungi/modifica staff */}
      {showAddStaffForm && (
        <Card ref={staffFormRef} id="staff-form" className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {editingStaff ? 'Modifica Membro Staff' : 'Aggiungi Nuovo Membro Staff'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cognome
                  </label>
                  <input
                    type="text"
                    value={newStaff.surname}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, surname: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ruolo
                  </label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {commonRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reparto
                  </label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleziona reparto</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certificazione HACCP
                  </label>
                  <input
                    type="text"
                    value={newStaff.certification}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, certification: e.target.value }))}
                    placeholder="es. HACCP Base, HACCP Avanzato, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <textarea
                    value={newStaff.notes}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingStaff ? 'Aggiorna' : 'Aggiungi'} Membro Staff
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddStaffForm(false)
                    setEditingStaff(null)
                    setNewStaff({
                      name: '',
                      surname: '',
                      role: 'Dipendente',
                      department: '',
                      certification: '',
                      notes: ''
                    })
                  }}
                >
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Gestione
