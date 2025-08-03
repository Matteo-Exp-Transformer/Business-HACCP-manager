import React from 'react'

export function Tabs({ value, onValueChange, children }) {
  return (
    <div className="w-full">
      {React.Children.map(children, child => {
        // Controllo sicurezza per evitare errori
        if (!child || !child.type) return child
        
        if (child.type === TabsList) {
          return React.cloneElement(child, { value, onValueChange })
        }
        if (child.type === TabsContent) {
          return React.cloneElement(child, { currentValue: value })
        }
        return child
      })}
    </div>
  )
}

export function TabsList({ value, onValueChange, children, className = "" }) {
  return (
    <div className={`flex flex-wrap p-2 bg-gray-100 rounded-xl shadow-sm gap-1 ${className}`}>
      {React.Children.map(children, child => {
        // Controllo sicurezza per evitare errori
        if (!child || !child.type) return child
        
        if (child.type === TabsTrigger) {
          return React.cloneElement(child, { 
            currentValue: value, 
            onValueChange,
            isActive: value === child.props.value
          })
        }
        return child
      })}
    </div>
  )
}

export function TabsTrigger({ 
  value, 
  currentValue, 
  onValueChange, 
  isActive,
  children, 
  className = "" 
}) {
  return (
    <button
      onClick={() => onValueChange(value)}
      className={`
        flex-1 min-h-[48px] px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
        touch-manipulation select-none
        ${isActive 
          ? 'bg-white text-blue-600 shadow-md transform scale-[1.02] ring-2 ring-blue-200' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 active:scale-[0.98] active:bg-gray-200'
        }
        ${className}
      `}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, currentValue, children }) {
  if (currentValue !== value) {
    return null
  }

  return (
    <div className="mt-4 sm:mt-6 animate-in fade-in-50 duration-200">
      {children}
    </div>
  )
}