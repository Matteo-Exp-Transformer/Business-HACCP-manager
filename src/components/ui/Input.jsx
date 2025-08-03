import React from 'react'

export function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      className={`
        flex min-h-[44px] w-full rounded-md border border-gray-300 bg-white px-3 py-2
        text-base ring-offset-background file:border-0 file:bg-transparent
        file:text-sm file:font-medium placeholder:text-gray-500
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
        focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        touch-manipulation
        ${className}
      `}
      {...props}
    />
  )
}