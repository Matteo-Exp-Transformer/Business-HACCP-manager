/**
 * Completion Step - Onboarding Wizard
 * 
 * Final review and system activation
 */

import { CheckCircle, Building2, Users, Thermometer, CheckSquare, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { FormSection } from '../../../components/forms/FormField'
import { useFormContext } from 'react-hook-form'

const CompletionStep = ({ onboarding }) => {
  const { watch } = useFormContext()
  
  // Get all form data
  const business = onboarding.formData.business || {}
  const departments = onboarding.formData.departments?.departments || []
  const staff = onboarding.formData.staff?.staff || []
  const conservationPoints = onboarding.formData.conservationPoints?.conservationPoints || []
  const tasks = onboarding.formData.tasks?.tasks || []

  // Calculate compliance score
  const calculateComplianceScore = () => {
    let score = 0
    let maxScore = 0

    // Business info (20 points)
    maxScore += 20
    if (business.name && business.address && business.email) score += 15
    if (business.vatNumber) score += 3
    if (business.phone) score += 2

    // Departments (15 points)
    maxScore += 15
    if (departments.length >= 1) score += 10
    if (departments.length >= 3) score += 5

    // Staff (20 points)
    maxScore += 20
    if (staff.length >= 1) score += 10
    const certifiedStaff = staff.filter(s => s.haccpCertification?.hasValidCertification)
    score += Math.min(10, (certifiedStaff.length / staff.length) * 10)

    // Conservation points (25 points)
    maxScore += 25
    if (conservationPoints.length >= 1) score += 15
    if (conservationPoints.length >= 3) score += 5
    if (conservationPoints.some(p => p.type === 'frigorifero')) score += 3
    if (conservationPoints.some(p => p.type === 'freezer')) score += 2

    // Tasks (20 points)
    maxScore += 20
    if (tasks.length >= 1) score += 10
    if (tasks.some(t => t.type === 'temperature')) score += 5
    if (tasks.some(t => t.type === 'cleaning')) score += 3
    if (tasks.some(t => t.priority === 'critical')) score += 2

    return Math.round((score / maxScore) * 100)
  }

  const complianceScore = calculateComplianceScore()

  // Check for potential issues
  const getComplianceIssues = () => {
    const issues = []
    
    if (!business.vatNumber) {
      issues.push({ type: 'warning', message: 'Partita IVA non inserita - raccomandata per attività commerciali' })
    }
    
    if (staff.filter(s => s.haccpCertification?.hasValidCertification).length === 0) {
      issues.push({ type: 'error', message: 'Nessun membro dello staff ha certificazione HACCP valida' })
    }
    
    if (!conservationPoints.some(p => p.type === 'frigorifero')) {
      issues.push({ type: 'warning', message: 'Nessun frigorifero configurato - raccomandato per la maggior parte delle attività' })
    }
    
    if (!tasks.some(t => t.type === 'temperature')) {
      issues.push({ type: 'error', message: 'Nessuna mansione di controllo temperature - obbligatoria per HACCP' })
    }
    
    if (!tasks.some(t => t.type === 'cleaning')) {
      issues.push({ type: 'warning', message: 'Nessuna mansione di pulizia configurata - raccomandata' })
    }

    return issues
  }

  const complianceIssues = getComplianceIssues()
  const hasErrors = complianceIssues.some(issue => issue.type === 'error')

  return (
    <div className="space-y-8">
      {/* Compliance Score */}
      <FormSection
        title="Punteggio di Conformità HACCP"
        description="Valutazione della configurazione del sistema"
      >
        <Card variant={complianceScore >= 80 ? 'success' : complianceScore >= 60 ? 'warning' : 'error'}>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center">
                <div className="text-3xl font-bold text-neutral-900">
                  {complianceScore}%
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-1">
                  {complianceScore >= 80 ? 'Conformità Eccellente' :
                   complianceScore >= 60 ? 'Conformità Buona' : 'Conformità Da Migliorare'}
                </h3>
                <p className="text-neutral-600">
                  {complianceScore >= 80 ? 
                    'Il tuo sistema HACCP è configurato in modo ottimale' :
                   complianceScore >= 60 ?
                    'Il sistema è funzionale, considera i miglioramenti suggeriti' :
                    'Alcuni elementi critici necessitano attenzione'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FormSection>

      {/* Configuration Summary */}
      <FormSection
        title="Riepilogo Configurazione"
        description="Verifica i dati inseriti prima di completare"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Summary */}
          <Card>
            <CardHeader>
              <CardTitle size="sm">
                <Building2 className="w-5 h-5 text-primary-600" />
                Informazioni Azienda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Nome:</strong> {business.name || 'Non specificato'}</div>
                <div><strong>Tipo:</strong> {business.businessType || 'Non specificato'}</div>
                <div><strong>Indirizzo:</strong> {business.address || 'Non specificato'}</div>
                <div><strong>Email:</strong> {business.email || 'Non specificato'}</div>
                <div><strong>Dipendenti:</strong> {business.employeeCount || 0}</div>
                {business.vatNumber && <div><strong>P.IVA:</strong> {business.vatNumber}</div>}
              </div>
            </CardContent>
          </Card>

          {/* Departments Summary */}
          <Card>
            <CardHeader>
              <CardTitle size="sm">
                <Building2 className="w-5 h-5 text-primary-600" />
                Reparti ({departments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {departments.map((dept, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" size="sm">
                      {dept.name}
                    </Badge>
                    {dept.isCustom && (
                      <span className="text-xs text-neutral-500">Personalizzato</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Staff Summary */}
          <Card>
            <CardHeader>
              <CardTitle size="sm">
                <Users className="w-5 h-5 text-primary-600" />
                Staff ({staff.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {staff.map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">
                      {member.firstName} {member.lastName}
                    </span>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" size="sm">
                        {member.role}
                      </Badge>
                      {member.haccpCertification?.hasValidCertification && (
                        <Badge variant="success" size="sm">HACCP</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conservation Points Summary */}
          <Card>
            <CardHeader>
              <CardTitle size="sm">
                <Thermometer className="w-5 h-5 text-primary-600" />
                Punti Conservazione ({conservationPoints.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {conservationPoints.map((point, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{point.name}</span>
                    <div className="flex items-center gap-1">
                      <Badge variant="primary" size="sm">
                        {point.type}
                      </Badge>
                      <span className="text-xs text-neutral-500">
                        {point.targetTemperatureMin}°C-{point.targetTemperatureMax}°C
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </FormSection>

      {/* Compliance Issues */}
      {complianceIssues.length > 0 && (
        <FormSection
          title="Controllo Conformità"
          description="Verifica dei requisiti HACCP"
        >
          <div className="space-y-3">
            {complianceIssues.map((issue, index) => (
              <Card 
                key={index} 
                variant={issue.type === 'error' ? 'error' : 'warning'}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${issue.type === 'error' ? 'text-error-600' : 'text-warning-600'}`} />
                    <span className="text-sm">
                      {issue.message}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {hasErrors && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-4">
              <p className="text-error-800 text-sm font-medium">
                ⚠️ Correggi gli errori critici prima di completare la configurazione
              </p>
            </div>
          )}
        </FormSection>
      )}

      {/* Next Steps */}
      <FormSection
        title="Prossimi Passi"
        description="Cosa succederà dopo il completamento"
      >
        <Card variant="primary">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-primary-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Sistema HACCP Pronto
              </h4>
              <ul className="text-sm text-primary-700 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2"></div>
                  Il sistema genererà automaticamente i piani di controllo
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2"></div>
                  Le mansioni verranno programmate secondo le frequenze impostate
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2"></div>
                  Il personale riceverà notifiche per le attività assegnate
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2"></div>
                  Il sistema di monitoraggio temperature sarà attivato
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2"></div>
                  Sarai reindirizzato alla dashboard principale
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </FormSection>
    </div>
  )
}

export default CompletionStep