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

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from './ui/Card'

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
  onToggle = null
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleToggle = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    if (onToggle) {
      onToggle(newExpanded)
    }
  }

  return (
    <Card className={`border-2 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-200 bg-white ${className}`}>
      <CardHeader 
        className="cursor-pointer hover:bg-blue-50 transition-all duration-200 border-b border-blue-100"
        onClick={handleToggle}
        data-testid={testId ? `${testId}-header` : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-3 rounded-xl ${iconBgColor} shadow-sm`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {count > 0 && (
              <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm">
                {count}
              </span>
            )}
            <ChevronDown className={`h-5 w-5 text-blue-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent 
          className="pt-8 px-12 pb-12 animate-in slide-in-from-top-2 fade-in-50 duration-300"
          data-testid={testId ? `${testId}-content` : undefined}
        >
          {children}
        </CardContent>
      )}
    </Card>
  )
}

export default CollapsibleCard
