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

  const fieldBox = (hasError: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 12px',
    background: 'var(--ds-background)',
    border: `1px solid ${hasError ? 'var(--red-700)' : 'var(--ds-border)'}`,
    borderRadius: 'var(--radius-md)',
  })
  const inputReset: React.CSSProperties = {
    flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
    color: 'var(--ds-text)', fontFamily: 'var(--font-sans)', fontSize: 14,
  }

  return (
    <div className='w-full'>
      <h2 className='font-semibold' style={{ fontSize: 24, letterSpacing: '-0.96px', margin: '0 0 6px' }}>Inicia sesión</h2>
      <p style={{ fontSize: 14, color: 'var(--ds-text-secondary)', margin: '0 0 28px' }}>Bienvenido de nuevo. Ingresa tus credenciales.</p>

      <form onSubmit={handleSubmit} className='w-full'>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Correo electrónico</label>
        <div style={fieldBox(!!emailError)}>
          <svg width='16' height='16' style={{ display: 'block', color: 'var(--ds-text-muted)' }}><use href='#geist-inbox' /></svg>
          <input
            type='email'
            placeholder='tucorreo@empresa.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            style={inputReset}
          />
        </div>
        {emailError && <p style={{ color: 'var(--red-700)', fontSize: 12, marginTop: 6 }}>{emailError}</p>}

        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, margin: '16px 0 6px' }}>Contraseña</label>
        <div style={fieldBox(!!passwordError)}>
          <svg width='16' height='16' style={{ display: 'block', color: 'var(--ds-text-muted)' }}><use href='#geist-lock-closed' /></svg>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='••••••••'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            style={inputReset}
          />
          {password.length > 0 && (
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className='flex-shrink-0'
              style={{ background: 'transparent', border: 'none', color: 'var(--ds-text-muted)', cursor: 'pointer', display: 'flex' }}
            >
              {showPassword ? <EyeOffIcon size={18} stroke={1.5} /> : <EyeIcon size={18} stroke={1.5} />}
            </button>
          )}
        </div>
        {passwordError && <p style={{ color: 'var(--red-700)', fontSize: 12, marginTop: 6 }}>{passwordError}</p>}

        <div style={{ textAlign: 'right', margin: '8px 0 18px' }}>
          <a style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', cursor: 'pointer' }}>¿Olvidaste tu contraseña?</a>
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='disabled:opacity-50 disabled:cursor-not-allowed'
          style={{
            width: '100%', height: 40, borderRadius: 'var(--radius-md)',
            background: 'var(--ds-text)', color: 'var(--ds-contrast-inverse)', border: '1px solid var(--ds-text)',
            fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          {isLoading ? 'Iniciando…' : 'Iniciar sesión'}
          {!isLoading && <svg width='16' height='16' style={{ display: 'block' }}><use href='#geist-arrow-right' /></svg>}
        </button>
      </form>
    </div>
  )
}
