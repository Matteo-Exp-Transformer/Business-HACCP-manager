import React from 'react'

const buttonVariants = {
  default: 'bg-primary-500 text-white hover:bg-primary-600',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'border border-gray-300 bg-white hover:bg-gray-50',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'hover:bg-gray-100',
  link: 'text-primary-500 underline-offset-4 hover:underline'
}

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8',
  icon: 'h-10 w-10'
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
        ring-offset-background transition-colors focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        ${className}
      `}
      {...props}
    />
  )
}