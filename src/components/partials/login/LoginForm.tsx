'use client'

import { useState } from 'react'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void
  isLoading?: boolean
}

export default function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Función para validar email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Manejar envío del formulario de email/password
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setPasswordError('')

    // Validar email
    if (!email.trim()) {
      setEmailError('El email es requerido')
      return
    }
    if (!validateEmail(email)) {
      setEmailError('Por favor ingresa un email válido')
      return
    }

    // Validar password
    if (!password.trim()) {
      setPasswordError('La contraseña es requerida')
      return
    }

    // Si todo está bien, ejecutar callback
    onSubmit(email, password)
  }

  return (
    <>
      <div className='text-start w-full'>
        <h6 className='font-bold text-xl md:text-2xl'>Bienvenido</h6>
        <p className='text-black/50 text-sm md:text-base'>Inicia sesión para acceder a tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className='w-full space-y-4'>
        <div>
          <input
            type='email'
            placeholder='Correo electrónico'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${emailError ? 'border-red-500' : 'border-black/15'
              }`}
          />
          {emailError && <p className='text-red-500 text-xs mt-1'>{emailError}</p>}
        </div>

        <div>
          <input
            type='password'
            placeholder='Contraseña'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${passwordError ? 'border-red-500' : 'border-black/15'
              }`}
          />
          {passwordError && <p className='text-red-500 text-xs mt-1'>{passwordError}</p>}
        </div>

        <div className='flex flex-col sm:flex-row gap-2'>
          <button
            type='submit'
            disabled={isLoading}
            className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 duration-150 disabled:opacity-50 disabled:cursor-not-allowed'>
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </div>
      </form>
    </>
  )
}
