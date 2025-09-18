/**
 * Staff Step - Onboarding Wizard
 * 
 * Staff management with HACCP certification tracking
 */

import { useState } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { User, Plus, Trash2, Shield, Calendar, Mail, Building2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { InputField, SelectField, CheckboxField, FormSection } from '../../../components/forms/FormField'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'

const StaffStep = () => {
  const { control, register, formState: { errors }, watch } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'staff'
  })

  const [newStaffMember, setNewStaffMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'employee',
    departmentId: '',
    haccpCertification: {
      hasValidCertification: false,
      expiryDate: '',
      certificationBody: ''
    }
  })

  // Watch departments to populate department select
  const departments = watch('departments') || []

  const roles = [
    { value: 'admin', label: 'Amministratore', description: 'Accesso completo al sistema' },
    { value: 'manager', label: 'Responsabile', description: 'Supervisione operativa' },
    { value: 'employee', label: 'Dipendente', description: 'Operazioni quotidiane' },
    { value: 'collaborator', label: 'Collaboratore', description: 'Accesso limitato' }
  ]

  const certificationBodies = [
    { value: 'asl', label: 'ASL Locale' },
    { value: 'haccp_italia', label: 'HACCP Italia' },
    { value: 'bureau_veritas', label: 'Bureau Veritas' },
    { value: 'sgs', label: 'SGS Italia' },
    { value: 'tuv', label: 'TÜV Italia' },
    { value: 'other', label: 'Altro ente certificato' }
  ]

  // Add staff member
  const addStaffMember = () => {
    if (newStaffMember.firstName.trim() && newStaffMember.lastName.trim()) {
      const emailExists = fields.some(field => 
        field.email && field.email.toLowerCase() === newStaffMember.email.toLowerCase()
      )
      
      if (newStaffMember.email && emailExists) {
        alert('Un membro dello staff con questa email esiste già')
        return
      }

      append({
        ...newStaffMember,
        id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isActive: true,
        createdAt: new Date().toISOString()
      })
      
      setNewStaffMember({
        firstName: '',
        lastName: '',
        email: '',
        role: 'employee',
        departmentId: '',
        haccpCertification: {
          hasValidCertification: false,
          expiryDate: '',
          certificationBody: ''
        }
      })
    }
  }

  // Remove staff member
  const removeStaffMember = (index) => {
    if (fields.length > 1) {
      remove(index)
    } else {
      alert('Deve rimanere almeno un membro dello staff')
    }
  }

  // Get department name by ID
  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId)
    return dept?.name || 'Reparto non assegnato'
  }

  // Get role label
  const getRoleLabel = (roleValue) => {
    const role = roles.find(r => r.value === roleValue)
    return role?.label || roleValue
  }

  // Check if certification is expiring soon
  const isCertificationExpiring = (expiryDate) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  return (
    <div className="space-y-8">
      {/* Add New Staff Member */}
      <FormSection
        title="Aggiungi Membro dello Staff"
        description="Configura il personale con ruoli e certificazioni HACCP"
      >
        <Card>
          <CardHeader>
            <CardTitle size="sm">
              <User className="w-5 h-5 text-primary-600" />
              Nuovo Membro dello Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome *"
                  value={newStaffMember.firstName}
                  onChange={(e) => setNewStaffMember(prev => ({ ...prev, firstName: e.target.value }))}
                  className="form-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Cognome *"
                  value={newStaffMember.lastName}
                  onChange={(e) => setNewStaffMember(prev => ({ ...prev, lastName: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email (opzionale)"
                  value={newStaffMember.email}
                  onChange={(e) => setNewStaffMember(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                />
                <select
                  value={newStaffMember.role}
                  onChange={(e) => setNewStaffMember(prev => ({ ...prev, role: e.target.value }))}
                  className="form-input"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Assignment */}
              <select
                value={newStaffMember.departmentId}
                onChange={(e) => setNewStaffMember(prev => ({ ...prev, departmentId: e.target.value }))}
                className="form-input"
                required
              >
                <option value="">Seleziona reparto *</option>
                {departments.map(dept => (
                  <option key={dept.id || dept.name} value={dept.id || dept.name}>
                    {dept.name} - {dept.description}
                  </option>
                ))}
              </select>

              {/* HACCP Certification */}
              <div className="space-y-4 p-4 bg-success-50 border border-success-200 rounded-lg">
                <h5 className="font-medium text-success-900 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Certificazione HACCP
                </h5>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newStaffMember.haccpCertification.hasValidCertification}
                    onChange={(e) => setNewStaffMember(prev => ({
                      ...prev,
                      haccpCertification: {
                        ...prev.haccpCertification,
                        hasValidCertification: e.target.checked
                      }
                    }))}
                    className="w-4 h-4 text-success-600"
                  />
                  <span className="text-sm text-success-800">
                    Ha una certificazione HACCP valida
                  </span>
                </label>

                {newStaffMember.haccpCertification.hasValidCertification && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <input
                      type="date"
                      placeholder="Data scadenza"
                      value={newStaffMember.haccpCertification.expiryDate}
                      onChange={(e) => setNewStaffMember(prev => ({
                        ...prev,
                        haccpCertification: {
                          ...prev.haccpCertification,
                          expiryDate: e.target.value
                        }
                      }))}
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <select
                      value={newStaffMember.haccpCertification.certificationBody}
                      onChange={(e) => setNewStaffMember(prev => ({
                        ...prev,
                        haccpCertification: {
                          ...prev.haccpCertification,
                          certificationBody: e.target.value
                        }
                      }))}
                      className="form-input"
                    >
                      <option value="">Ente certificatore</option>
                      {certificationBodies.map(body => (
                        <option key={body.value} value={body.value}>
                          {body.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <Button
                type="button"
                onClick={addStaffMember}
                disabled={!newStaffMember.firstName.trim() || !newStaffMember.lastName.trim() || !newStaffMember.departmentId}
                className="w-full"
              >
                <Plus className="w-4 h-4" />
                Aggiungi Membro dello Staff
              </Button>
            </div>
          </CardContent>
        </Card>
      </FormSection>

      {/* Staff List */}
      {fields.length > 0 && (
        <FormSection
          title={`Staff Configurato (${fields.length})`}
          description="Membri del team con ruoli e certificazioni"
        >
          <div className="space-y-3">
            {fields.map((field, index) => {
              const certExpiring = field.haccpCertification?.expiryDate && 
                isCertificationExpiring(field.haccpCertification.expiryDate)
              
              return (
                <Card key={field.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">
                              {field.firstName} {field.lastName}
                            </span>
                            <Badge 
                              variant={field.role === 'admin' ? 'admin' : field.role === 'manager' ? 'manager' : 'employee'}
                              size="sm"
                            >
                              {getRoleLabel(field.role)}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-neutral-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {getDepartmentName(field.departmentId)}
                            </div>
                            {field.email && (
                              <div className="flex items-center gap-1 mt-1">
                                <Mail className="w-3 h-3" />
                                {field.email}
                              </div>
                            )}
                          </div>

                          {/* HACCP Certification Status */}
                          <div className="mt-2">
                            {field.haccpCertification?.hasValidCertification ? (
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={certExpiring ? "warning" : "success"} 
                                  size="sm"
                                >
                                  <Shield className="w-3 h-3" />
                                  HACCP Certificato
                                </Badge>
                                {field.haccpCertification.expiryDate && (
                                  <span className="text-xs text-neutral-500">
                                    Scade: {new Date(field.haccpCertification.expiryDate).toLocaleDateString('it-IT')}
                                  </span>
                                )}
                                {certExpiring && (
                                  <Badge variant="warning" size="sm">
                                    <Calendar className="w-3 h-3" />
                                    In scadenza
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <Badge variant="warning" size="sm">
                                Certificazione HACCP richiesta
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {fields.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeStaffMember(index)}
                          className="text-error-600 hover:text-error-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Validation error */}
          {errors.staff && (
            <div className="text-error-600 text-sm mt-2">
              {errors.staff.message}
            </div>
          )}
        </FormSection>
      )}

      {/* HACCP Staff Requirements */}
      <FormSection
        title="Requisiti HACCP per il Personale"
        description="Informazioni sulla formazione e certificazione del personale"
      >
        <Card variant="primary">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-primary-900">
                  Formazione e Certificazione HACCP
                </h4>
                <p className="text-sm text-primary-800">
                  Secondo il Reg. CE 852/2004, tutto il personale deve ricevere formazione HACCP:
                </p>
                <ul className="text-sm text-primary-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Responsabili:</strong> Corso HACCP Manager (16 ore) - validità 5 anni
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Addetti:</strong> Corso HACCP Base (8 ore) - validità 3 anni
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Monitoraggio:</strong> Il sistema invierà alert 30 giorni prima della scadenza
                    </div>
                  </li>
                </ul>
                <div className="pt-3 border-t border-primary-200">
                  <p className="text-xs text-primary-600 font-medium">
                    💡 Puoi aggiungere le certificazioni anche dopo la configurazione iniziale
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FormSection>

      {/* Staff Statistics */}
      {fields.length > 0 && (
        <FormSection
          title="Riepilogo Staff"
          description="Statistiche del personale configurato"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {fields.length}
                </div>
                <div className="text-sm text-neutral-600">
                  Totale Staff
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success-600">
                  {fields.filter(f => f.haccpCertification?.hasValidCertification).length}
                </div>
                <div className="text-sm text-neutral-600">
                  Certificati HACCP
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning-600">
                  {fields.filter(f => 
                    f.haccpCertification?.expiryDate && 
                    isCertificationExpiring(f.haccpCertification.expiryDate)
                  ).length}
                </div>
                <div className="text-sm text-neutral-600">
                  In scadenza
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-neutral-600">
                  {new Set(fields.map(f => f.departmentId)).size}
                </div>
                <div className="text-sm text-neutral-600">
                  Reparti coperti
                </div>
              </CardContent>
            </Card>
          </div>
        </FormSection>
      )}
    </div>
  )
}

export default StaffStep