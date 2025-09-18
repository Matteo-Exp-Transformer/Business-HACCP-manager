/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo è il COMPONENTE COLLAPSIBLECARD - COMPONENTE RIUTILIZZABILE CRITICO
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE L'USABILITÀ
 * ⚠️ Questo componente gestisce l'interfaccia collassabile per tutte le sezioni
 * ⚠️ Coordina l'esperienza utente e l'organizzazione delle funzionalità
 * 
 * @fileoverview Componente CollapsibleCard - Sistema Critico di Interfaccia
 * @requires AGENT_DIRECTIVES.md
 * @critical Usabilità - Componente Riutilizzabile
 * @version 1.0
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardContent } from './ui/Card'

function CollapsibleCard({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  count = 0,
  children,
  testId,
  className = "",
  defaultExpanded = false,
  onToggle = null,
  // Nuove props per supporto form
  openFormId = null,
  onFormToggle = null,
  formComponent = null
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleToggle = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    if (onToggle) {
      onToggle(newExpanded)
    }
  }

  const handleFormToggle = (formId) => {
    if (onFormToggle) {
      onFormToggle(formId)
    }
  }

  return (
    <div className="rounded-lg border bg-white text-card-foreground shadow-sm transition-all duration-200">
      <div
        className="flex flex-col space-y-1.5 p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleToggle}
        data-testid={testId ? `${testId}-header` : undefined}
      >
        <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
            <span>{title}</span>
            {typeof count === 'number' && count > 0 && (
              <span className="ml-2 text-sm text-gray-500">({count})</span>
            )}
          </div>
          <button className="
            inline-flex items-center justify-center rounded-md text-sm font-medium
            ring-offset-background transition-colors focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:pointer-events-none disabled:opacity-50
            hover:bg-gray-100 h-8 w-8 p-0
          ">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d={isExpanded ? "m6 15 6-6 6 6" : "m18 15-6-6-6 6"} />
            </svg>
          </button>
        </h3>
        {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
      </div>

      {isExpanded && (
        <div className="p-6 pt-0 transition-all duration-200">
          {children}
          
          {/* Form posizionato sotto il contenuto */}
          {openFormId && formComponent && (
            <div className="mt-4 p-4 border-t border-gray-200">
              {formComponent}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CollapsibleCard
