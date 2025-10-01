'use client'

import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from '@/assets/Icon'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void
  isLoading?: boolean
}

export default function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Contraseña'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={`w-full px-3 py-2 ${password.length > 0 ? 'pr-10' : 'pr-3'} border rounded-md outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${passwordError ? 'border-red-500' : 'border-black/15'
                }`}
            />
            {password.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
              >
                {showPassword ? (
                  <EyeOffIcon size={20} stroke={1.5} />
                ) : (
                  <EyeIcon size={20} stroke={1.5} />
                )}
              </button>
            )}
          </div>
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
