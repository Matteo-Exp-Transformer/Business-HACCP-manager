/**
 * Tasks Page - HACCP Business Manager
 * 
 * Main tasks page with unified calendar view
 */

import { useState } from 'react'
import { CheckSquare, Plus, Filter, BarChart3 } from 'lucide-react'
import { CalendarView, CalendarFilters, EventDetail, useCalendar } from '../features/calendar'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { PageLayout, SectionLayout, GridLayout } from '../components/layouts/PageLayout'
import { Badge } from '../components/ui/Badge'

const TasksPage = () => {
  const {
    events,
    isLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
    completeTask,
    getStatistics,
    getUpcomingEvents,
    isCompletingTask
  } = useCalendar()

  const [showFilters, setShowFilters] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventDetail, setShowEventDetail] = useState(false)

  const statistics = getStatistics()
  const upcomingEvents = getUpcomingEvents(7)

  // Handle event selection
  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setShowEventDetail(true)
  }

  // Handle task completion
  const handleCompleteTask = async (taskId, notes, photos) => {
    await completeTask(taskId, notes, photos)
  }

  return (
    <PageLayout
      title="Attività e Mansioni"
      subtitle="Calendario unificato per mansioni e manutenzioni"
      icon={CheckSquare}
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(true)}
          >
            <Filter className="w-4 h-4" />
            Filtri
            {(filters.departments.length + filters.taskTypes.length + filters.priorities.length) > 0 && (
              <Badge variant="primary" size="sm" className="ml-1">
                {filters.departments.length + filters.taskTypes.length + filters.priorities.length}
              </Badge>
            )}
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4" />
            Nuova Mansione
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <SectionLayout
          title="Panoramica"
          subtitle="Statistiche delle mansioni e performance"
        >
          <GridLayout columns={4} gap="default">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {statistics.total}
                </div>
                <div className="text-sm text-neutral-600">
                  Totale Mansioni
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-success-600 mb-2">
                  {statistics.completionRate}%
                </div>
                <div className="text-sm text-neutral-600">
                  Tasso Completamento
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-error-600 mb-2">
                  {statistics.critical}
                </div>
                <div className="text-sm text-neutral-600">
                  Mansioni Critiche
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-warning-600 mb-2">
                  {statistics.dueSoon}
                </div>
                <div className="text-sm text-neutral-600">
                  Scadenza 24h
                </div>
              </CardContent>
            </Card>
          </GridLayout>
        </SectionLayout>

        {/* Upcoming Tasks Alert */}
        {upcomingEvents.length > 0 && (
          <SectionLayout title="Mansioni Imminenti">
            <Card variant="warning">
              <CardHeader>
                <CardTitle size="sm">
                  <CheckSquare className="w-5 h-5 text-warning-600" />
                  {upcomingEvents.length} mansioni nei prossimi 7 giorni
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 5).map((event) => (
                    <div 
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-warning-200 cursor-pointer hover:bg-warning-50"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: event.backgroundColor }}></div>
                        <div>
                          <div className="font-medium text-neutral-900">
                            {event.title}
                          </div>
                          <div className="text-sm text-neutral-600">
                            {new Date(event.start).toLocaleDateString('it-IT')} - {event.extendedProps.assignedDepartment?.name}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          event.extendedProps.priority === 'critical' ? 'error' :
                          event.extendedProps.priority === 'high' ? 'warning' : 'secondary'
                        }
                        size="sm"
                      >
                        {event.extendedProps.priority}
                      </Badge>
                    </div>
                  ))}
                  {upcomingEvents.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="link" size="sm">
                        Vedi tutte ({upcomingEvents.length - 5} altre)
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </SectionLayout>
        )}

        {/* Main Calendar */}
        <SectionLayout title="Calendario Mansioni">
          <CalendarView 
            onEventClick={handleEventClick}
            loading={isLoading}
            error={error}
          />
        </SectionLayout>
      </div>

      {/* Modals */}
      <CalendarFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={updateFilters}
        departments={[]} // Will be populated from store
        users={[]} // Will be populated from store
      />

      <EventDetail
        event={selectedEvent}
        isOpen={showEventDetail}
        onClose={() => setShowEventDetail(false)}
        onComplete={handleCompleteTask}
        isCompleting={isCompletingTask}
      />
    </PageLayout>
  )
}

export default TasksPage