/**
 * Calendar View Component - HACCP Business Manager
 * 
 * FullCalendar integration with HACCP-specific styling and functionality
 */

import { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter,
  Download,
  Settings
} from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { PageLayout, SectionLayout } from '../../components/layouts/PageLayout'
import { useAppStore } from '../../stores/appStore'
import { useTasks } from '../../hooks/useSupabase'

const CalendarView = () => {
  const calendarRef = useRef(null)
  const [currentView, setCurrentView] = useState('dayGridMonth')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    departments: [],
    taskTypes: [],
    priorities: [],
    users: []
  })

  // Get tasks data
  const { tasks, loading, error } = useTasks()
  const { departments, conservationPoints } = useAppStore()

  // Transform tasks to calendar events
  const transformTasksToEvents = (tasks) => {
    return tasks.map(task => {
      const event = {
        id: task.id,
        title: task.name,
        start: task.due_date,
        allDay: !task.due_date?.includes('T'),
        extendedProps: {
          description: task.description,
          type: task.type,
          priority: task.priority,
          assignedTo: task.assigned_user?.first_name + ' ' + task.assigned_user?.last_name,
          department: task.assigned_department?.name,
          conservationPoint: task.conservation_point?.name,
          status: task.completed_at ? 'completed' : 'pending'
        }
      }

      // Color coding based on task type and priority
      switch (task.type) {
        case 'temperature':
          event.backgroundColor = task.priority === 'critical' ? '#dc2626' : '#ea580c'
          event.borderColor = task.priority === 'critical' ? '#b91c1c' : '#c2410c'
          break
        case 'maintenance':
          event.backgroundColor = task.priority === 'critical' ? '#7c2d12' : '#a16207'
          event.borderColor = task.priority === 'critical' ? '#651b0e' : '#854d0e'
          break
        case 'cleaning':
          event.backgroundColor = task.priority === 'critical' ? '#1e40af' : '#2563eb'
          event.borderColor = task.priority === 'critical' ? '#1e3a8a' : '#1d4ed8'
          break
        default:
          event.backgroundColor = task.priority === 'critical' ? '#4338ca' : '#6366f1'
          event.borderColor = task.priority === 'critical' ? '#3730a3' : '#4f46e5'
      }

      // Completed tasks have different styling
      if (task.completed_at) {
        event.backgroundColor = '#16a34a'
        event.borderColor = '#15803d'
        event.textColor = '#ffffff'
      }

      return event
    })
  }

  // Calendar events
  const [events, setEvents] = useState([])

  useEffect(() => {
    if (tasks) {
      const calendarEvents = transformTasksToEvents(tasks)
      setEvents(calendarEvents)
    }
  }, [tasks])

  // Handle event click
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      ...event.extendedProps
    })
    setShowEventModal(true)
  }

  // Handle date click (for creating new events)
  const handleDateClick = (dateClickInfo) => {
    const selectedDate = dateClickInfo.date
    // TODO: Open create task modal with pre-filled date
    console.log('Date clicked:', selectedDate)
  }

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view)
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.changeView(view)
    }
  }

  // Navigation functions
  const goToToday = () => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.today()
    }
  }

  const goToPrevious = () => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.prev()
    }
  }

  const goToNext = () => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.next()
    }
  }

  // Get current date title
  const getCurrentTitle = () => {
    const calendarApi = calendarRef.current?.getApi()
    return calendarApi?.view.title || 'Calendario'
  }

  if (loading) {
    return (
      <PageLayout
        title="Calendario Mansioni"
        subtitle="Caricamento eventi..."
        icon={Calendar}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded"></div>
          <div className="h-96 bg-neutral-200 rounded"></div>
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout
        title="Calendario Mansioni"
        subtitle="Errore nel caricamento"
        icon={Calendar}
      >
        <Card variant="error">
          <CardContent className="p-6 text-center">
            <p>Errore nel caricamento del calendario: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Ricarica
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Calendario Unificato"
      subtitle="Mansioni e manutenzioni programmate"
      icon={Calendar}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
            <Filter className="w-4 h-4" />
            Filtri
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Esporta
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4" />
            Nuova Mansione
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Calendar Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToPrevious}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Oggi
                </Button>
                <Button variant="outline" size="sm" onClick={goToNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <h3 className="text-lg font-semibold text-neutral-900 ml-4">
                  {getCurrentTitle()}
                </h3>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant={currentView === 'dayGridMonth' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleViewChange('dayGridMonth')}
                >
                  Mese
                </Button>
                <Button
                  variant={currentView === 'timeGridWeek' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleViewChange('timeGridWeek')}
                >
                  Settimana
                </Button>
                <Button
                  variant={currentView === 'timeGridDay' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleViewChange('timeGridDay')}
                >
                  Giorno
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-neutral-700">Legenda:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-600"></div>
                <span className="text-sm">Temperature (Critico)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-600"></div>
                <span className="text-sm">Manutenzione</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-600"></div>
                <span className="text-sm">Pulizia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-indigo-600"></div>
                <span className="text-sm">Generale</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-600"></div>
                <span className="text-sm">Completato</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="calendar-container">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={currentView}
                headerToolbar={false} // We use custom header
                events={events}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                height="auto"
                locale="it"
                firstDay={1} // Monday
                slotMinTime="06:00:00"
                slotMaxTime="24:00:00"
                allDaySlot={true}
                weekends={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                eventDisplay="block"
                eventTextColor="#ffffff"
                eventBorderWidth={1}
                eventMouseEnter={(info) => {
                  info.el.style.cursor = 'pointer'
                }}
                eventClassNames={(arg) => {
                  const classes = ['calendar-event']
                  if (arg.event.extendedProps.priority === 'critical') {
                    classes.push('event-critical')
                  }
                  if (arg.event.extendedProps.status === 'completed') {
                    classes.push('event-completed')
                  }
                  return classes
                }}
                dayHeaderFormat={{ weekday: 'short' }}
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <SectionLayout title="Statistiche Rapide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {events.length}
                </div>
                <div className="text-sm text-neutral-600">
                  Totale Eventi
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-error-600">
                  {events.filter(e => e.extendedProps?.priority === 'critical').length}
                </div>
                <div className="text-sm text-neutral-600">
                  Critici
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success-600">
                  {events.filter(e => e.extendedProps?.status === 'completed').length}
                </div>
                <div className="text-sm text-neutral-600">
                  Completati
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning-600">
                  {events.filter(e => 
                    e.extendedProps?.status === 'pending' && 
                    new Date(e.start) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
                  ).length}
                </div>
                <div className="text-sm text-neutral-600">
                  Scadenza 24h
                </div>
              </CardContent>
            </Card>
          </div>
        </SectionLayout>
      </div>

      {/* Event Detail Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title="Dettagli Mansione"
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                {selectedEvent.title}
              </h3>
              {selectedEvent.description && (
                <p className="text-neutral-600 text-sm">
                  {selectedEvent.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-neutral-700">Tipo:</span>
                <Badge variant="secondary" size="sm" className="ml-2">
                  {selectedEvent.type}
                </Badge>
              </div>
              <div>
                <span className="font-medium text-neutral-700">Priorità:</span>
                <Badge 
                  variant={
                    selectedEvent.priority === 'critical' ? 'error' :
                    selectedEvent.priority === 'high' ? 'warning' : 'secondary'
                  } 
                  size="sm" 
                  className="ml-2"
                >
                  {selectedEvent.priority}
                </Badge>
              </div>
              {selectedEvent.assignedTo && (
                <div>
                  <span className="font-medium text-neutral-700">Assegnato a:</span>
                  <span className="ml-2">{selectedEvent.assignedTo}</span>
                </div>
              )}
              {selectedEvent.department && (
                <div>
                  <span className="font-medium text-neutral-700">Reparto:</span>
                  <span className="ml-2">{selectedEvent.department}</span>
                </div>
              )}
            </div>

            {selectedEvent.conservationPoint && (
              <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-warning-900">
                    Punto di Controllo Critico:
                  </span>
                  <Badge variant="warning" size="sm">
                    {selectedEvent.conservationPoint}
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              {selectedEvent.status === 'pending' && (
                <Button variant="success" size="sm">
                  Segna Completato
                </Button>
              )}
              <Button variant="outline" size="sm">
                Modifica
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEventModal(false)}>
                Chiudi
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  )
}

export default CalendarView