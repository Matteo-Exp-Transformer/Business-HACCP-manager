import React from 'react'

export function Tabs({ value, onValueChange, children }) {
  return (
    <div className="w-full">
      {React.Children.map(children, child => {
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
    <div className={`flex p-1 bg-gray-100 rounded-xl shadow-sm ${className}`}>
      {React.Children.map(children, child => {
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
        flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
        ${isActive 
          ? 'bg-white text-blue-600 shadow-md transform scale-[1.02]' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 active:scale-[0.98]'
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
    <div className="mt-6 animate-in fade-in-50 duration-200">
      {children}
    </div>
  )
}