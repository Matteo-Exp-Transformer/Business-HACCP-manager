/**
 * Event Detail Component - HACCP Business Manager
 * 
 * Detailed view and actions for calendar events (tasks)
 */

import { useState } from 'react'
import { 
  CheckCircle, 
  Clock, 
  User, 
  Building2, 
  Thermometer, 
  AlertTriangle,
  Camera,
  FileText,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge, TemperatureBadge } from '../../components/ui/Badge'
import { Modal, ModalFooter } from '../../components/ui/Modal'
import { TextareaField } from '../../components/forms/FormField'
import { showToast } from '../../components/ui/Toast'

const EventDetail = ({ 
  event, 
  isOpen, 
  onClose, 
  onComplete,
  onEdit,
  onDelete,
  isCompleting = false 
}) => {
  const [showCompleteForm, setShowCompleteForm] = useState(false)
  const [completionNotes, setCompletionNotes] = useState('')
  const [completionPhotos, setCompletionPhotos] = useState([])

  if (!event) return null

  // Handle task completion
  const handleComplete = async () => {
    try {
      await onComplete(event.id, completionNotes, completionPhotos)
      setShowCompleteForm(false)
      setCompletionNotes('')
      setCompletionPhotos([])
      onClose()
      showToast.compliance('Mansione completata', event.title)
    } catch (error) {
      showToast.error('Errore', 'Impossibile completare la mansione')
    }
  }

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    // TODO: Upload to Supabase Storage and get URLs
    // For now, create preview URLs
    const photoUrls = files.map(file => URL.createObjectURL(file))
    setCompletionPhotos(prev => [...prev, ...photoUrls])
  }

  // Get status badge
  const getStatusBadge = () => {
    if (event.extendedProps.status === 'completed') {
      return <Badge variant="success">Completata</Badge>
    }
    
    const dueDate = new Date(event.start)
    const now = new Date()
    
    if (dueDate < now) {
      return <Badge variant="error">Scaduta</Badge>
    }
    
    const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60)
    if (hoursUntilDue <= 24) {
      return <Badge variant="warning">Scade presto</Badge>
    }
    
    return <Badge variant="primary">In programma</Badge>
  }

  // Get priority badge
  const getPriorityBadge = () => {
    const variants = {
      critical: 'error',
      high: 'warning', 
      medium: 'primary',
      low: 'secondary'
    }
    
    return (
      <Badge variant={variants[event.extendedProps.priority] || 'secondary'}>
        {event.extendedProps.priority}
      </Badge>
    )
  }

  // Get type badge
  const getTypeBadge = () => {
    const typeIcons = {
      temperature: '🌡️',
      cleaning: '🧽',
      maintenance: '🔧',
      general: '📋'
    }
    
    return (
      <Badge variant="secondary">
        {typeIcons[event.extendedProps.type]} {event.extendedProps.type}
      </Badge>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dettagli Mansione"
      size="lg"
    >
      <div className="space-y-6">
        {/* Event Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold text-neutral-900">
              {event.title}
            </h3>
            {getStatusBadge()}
          </div>
          
          {event.extendedProps.description && (
            <p className="text-neutral-600">
              {event.extendedProps.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {getTypeBadge()}
            {getPriorityBadge()}
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-neutral-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Programmazione
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Data e ora:</span>
                  <span className="ml-2">
                    {new Date(event.start).toLocaleString('it-IT')}
                  </span>
                </div>
                {event.end && (
                  <div>
                    <span className="font-medium">Fine:</span>
                    <span className="ml-2">
                      {new Date(event.end).toLocaleString('it-IT')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-neutral-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Assegnazione
              </h4>
              <div className="space-y-2 text-sm">
                {event.extendedProps.assignedUser && (
                  <div>
                    <span className="font-medium">Assegnato a:</span>
                    <span className="ml-2">
                      {event.extendedProps.assignedUser.first_name} {event.extendedProps.assignedUser.last_name}
                    </span>
                  </div>
                )}
                {event.extendedProps.assignedDepartment && (
                  <div>
                    <span className="font-medium">Reparto:</span>
                    <span className="ml-2">
                      {event.extendedProps.assignedDepartment.name}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conservation Point Info (for temperature tasks) */}
        {event.extendedProps.conservationPoint && (
          <Card variant="warning">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Thermometer className="w-5 h-5 text-warning-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning-900 mb-1">
                    Punto di Controllo Critico
                  </h4>
                  <p className="text-sm text-warning-700">
                    <strong>{event.extendedProps.conservationPoint.name}</strong>
                    {' '}({event.extendedProps.conservationPoint.type})
                  </p>
                  {event.extendedProps.conservationPoint.target_temperature_min && (
                    <div className="mt-2">
                      <TemperatureBadge
                        temperature={(event.extendedProps.conservationPoint.target_temperature_min + event.extendedProps.conservationPoint.target_temperature_max) / 2}
                        minTemp={event.extendedProps.conservationPoint.target_temperature_min}
                        maxTemp={event.extendedProps.conservationPoint.target_temperature_max}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion History */}
        {event.extendedProps.status === 'completed' && (
          <Card variant="success">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-success-900 mb-1">
                    Mansione Completata
                  </h4>
                  <p className="text-sm text-success-700">
                    Completata il {new Date(event.extendedProps.completedAt).toLocaleString('it-IT')}
                  </p>
                  {event.extendedProps.completionNotes && (
                    <p className="text-sm text-success-700 mt-2">
                      <strong>Note:</strong> {event.extendedProps.completionNotes}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Form */}
        {showCompleteForm && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="font-medium text-neutral-900">
                Completa Mansione
              </h4>
              
              <TextareaField
                label="Note di completamento"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Descrivi come è stata svolta la mansione, eventuali osservazioni..."
                rows={3}
              />

              {/* Photo upload */}
              <div>
                <label className="form-label">
                  Foto di verifica (opzionale)
                </label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="sr-only"
                    id="completion-photos"
                  />
                  <label htmlFor="completion-photos">
                    <Button variant="outline" size="sm" as="span" className="cursor-pointer">
                      <Camera className="w-4 h-4" />
                      Aggiungi Foto
                    </Button>
                  </label>
                  
                  {completionPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {completionPhotos.map((photo, index) => (
                        <img 
                          key={index}
                          src={photo} 
                          alt={`Foto ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCompleteForm(false)}
                >
                  Annulla
                </Button>
                <Button 
                  variant="success" 
                  onClick={handleComplete}
                  loading={isCompleting}
                >
                  <CheckCircle className="w-4 h-4" />
                  Completa
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ModalFooter>
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
                <Edit className="w-4 h-4" />
                Modifica
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={() => onDelete(event.id)}>
                <Trash2 className="w-4 h-4" />
                Elimina
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {event.extendedProps.status === 'pending' && !showCompleteForm && (
              <Button 
                variant="success" 
                size="sm"
                onClick={() => setShowCompleteForm(true)}
              >
                <CheckCircle className="w-4 h-4" />
                Completa
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Chiudi
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  )
}

export default EventDetail