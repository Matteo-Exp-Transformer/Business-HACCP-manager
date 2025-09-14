import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { Button } from './Button'
import { ChevronDown, ChevronUp } from 'lucide-react'

function CollapseCard({ 
  title, 
  icon: Icon, 
  children, 
  defaultExpanded = false, 
  className = "",
  headerClassName = "",
  contentClassName = "",
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
    <Card className={`transition-all duration-200 ${className}`}>
      <CardHeader 
        className={`cursor-pointer hover:bg-gray-50 transition-colors ${headerClassName}`}
        onClick={handleToggle}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            <span>{title}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation()
              handleToggle()
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className={`transition-all duration-200 ${contentClassName}`}>
          {children}
        </CardContent>
      )}
    </Card>
  )
}

export default CollapseCard

