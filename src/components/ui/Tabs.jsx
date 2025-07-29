import React, { createContext, useContext } from 'react'

const TabsContext = createContext()

export function Tabs({ value, onValueChange, children, className, ...props }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }) {
  return (
    <div
      className={`
        inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1
        text-gray-500 ${className}
      `}
      {...props}
    />
  )
}

export function TabsTrigger({ value, className, children, ...props }) {
  const { value: selectedValue, onValueChange } = useContext(TabsContext)
  const isActive = value === selectedValue

  return (
    <button
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5
        text-sm font-medium ring-offset-background transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${isActive 
          ? 'bg-white text-gray-950 shadow-sm tab-active' 
          : 'hover:bg-white/50'
        }
        ${className}
      `}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children, ...props }) {
  const { value: selectedValue } = useContext(TabsContext)
  
  if (value !== selectedValue) return null

  return (
    <div
      className={`
        mt-2 ring-offset-background focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}