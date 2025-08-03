import React from 'react'

const buttonVariants = {
  default: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  outline: 'border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
  ghost: 'hover:bg-gray-100 active:bg-gray-200',
  link: 'text-primary-500 underline-offset-4 hover:underline'
}

const buttonSizes = {
  default: 'min-h-[44px] px-4 py-2',
  sm: 'min-h-[40px] px-3 py-2',
  lg: 'min-h-[48px] px-6 py-3',
  icon: 'min-h-[44px] min-w-[44px] p-2'
}

export function Button({ 
  className, 
  variant = 'default', 
  size = 'default', 
  asChild = false,
  ...props 
}) {
  const Component = asChild ? 'span' : 'button'
  
  return (
    <Component
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium
        ring-offset-background transition-all duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
        focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        touch-manipulation select-none active:scale-[0.98]
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        ${className}
      `}
      {...props}
    />
  )
}