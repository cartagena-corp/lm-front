"use client"

import { useState } from 'react'

interface SwitchProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

export default function Switch({
  id,
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className = ''
}: SwitchProps) {
  const sizeClasses = {
    sm: {
      switch: 'h-4 w-7',
      toggle: 'h-3 w-3',
      translate: 'translate-x-3'
    },
    md: {
      switch: 'h-6 w-11',
      toggle: 'h-5 w-5',
      translate: 'translate-x-5'
    },
    lg: {
      switch: 'h-8 w-14',
      toggle: 'h-7 w-7',
      translate: 'translate-x-6'
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={`flex items-center ${className}`}>
      {label && (
        <label 
          htmlFor={id}
          className={`text-sm font-medium text-gray-700 mr-3 ${disabled ? 'opacity-50' : ''}`}
        >
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex ${currentSize.switch} items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-200 hover:bg-gray-300'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block ${currentSize.toggle} transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out
            ${checked ? currentSize.translate : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  )
}