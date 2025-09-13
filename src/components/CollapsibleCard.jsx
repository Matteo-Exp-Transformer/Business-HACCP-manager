/**
 * Componente CollapsibleCard per schede collassabili con riepilogo numerico
 * 
 * @fileoverview Scheda collassabile riutilizzabile con formato standardizzato
 * @version 1.0
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { ChevronDown, ChevronRight, MousePointer } from 'lucide-react'

const CollapsibleCard = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
  count = 0,
  children,
  defaultExpanded = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Card className={`border-2 border-blue-500 hover:border-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl ${className}`}>
      <CardHeader 
        className="cursor-pointer hover:bg-blue-50 transition-all duration-200 group"
        onClick={toggleExpanded}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${iconBgColor} rounded-lg group-hover:${iconBgColor.replace('100', '200')} transition-colors`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <span className="text-lg font-semibold text-gray-900">
                {title}
              </span>
              <p className="text-sm text-gray-600 mt-1">
                {subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {count > 0 && (
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium group-hover:bg-blue-200 transition-colors">
                {count} elementi
              </div>
            )}
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium group-hover:bg-blue-200 transition-colors flex items-center gap-2">
              {!isExpanded && <MousePointer className="h-3 w-3" />}
              {isExpanded ? 'Chiudi' : 'Clicca per aprire'}
            </div>
            <div className="p-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  )
}

export default CollapsibleCard
