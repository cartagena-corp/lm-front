'use client'

import { useState, useEffect } from 'react'

interface OTPFormProps {
  email: string
  onSubmit: (otp: string) => void
  onCancel: () => void
  onResend: () => void
  initialTimeLeft?: number
  isLoading?: boolean
}

export default function OTPForm({ 
  email, 
  onSubmit, 
  onCancel, 
  onResend, 
  initialTimeLeft = 120,
  isLoading = false 
}: OTPFormProps) {
  const [otp, setOtp] = useState('')
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [canResend, setCanResend] = useState(false)

  // Timer para el OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsTimerActive(false)
            setCanResend(true)
            return 0
          }
          return timeLeft - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerActive, timeLeft])

  // Función para formatear el tiempo
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Manejar envío del OTP
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) {
      alert('Por favor ingresa un código OTP válido de 6 dígitos')
      return
    }

    onSubmit(otp)
  }

  // Manejar reenvío de OTP
  const handleResend = () => {
    setTimeLeft(120)
    setIsTimerActive(true)
    setCanResend(false)
    setOtp('')
    onResend()
  }

  // Función para manejar cambios en inputs individuales de OTP
  const handleOtpInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Solo números

    const newOtp = otp.split('')
    newOtp[index] = value

    // Llenar con espacios vacíos si es necesario
    while (newOtp.length < 6) {
      newOtp.push('')
    }

    setOtp(newOtp.join(''))

    // Auto-focus al siguiente input si se ingresó un dígito
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  // Función para manejar pegado de código completo
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()

    const pastedData = e.clipboardData.getData('text')
    const digitsOnly = pastedData.replace(/\D/g, '').slice(0, 6)

    if (digitsOnly.length > 0) {
      // Rellenar con espacios vacíos hasta 6 caracteres
      const paddedOtp = digitsOnly.padEnd(6, '')
      setOtp(paddedOtp)

      // Enfocar el último input con contenido o el último input
      const lastIndex = Math.min(digitsOnly.length - 1, 5)
      const targetInput = document.getElementById(`otp-${lastIndex}`)
      targetInput?.focus()
    }
  }

  // Función para manejar teclas especiales en inputs de OTP
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Si backspace y el input actual está vacío, ir al anterior
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  return (
    <div className='w-full'>
      <div className='text-center'>
        <h2 className='font-semibold' style={{ fontSize: 24, letterSpacing: '-0.96px', margin: '0 0 6px' }}>Verificación OTP</h2>
        <p style={{ fontSize: 14, color: 'var(--ds-text-secondary)', margin: 0 }}>Ingresa el código de 6 dígitos enviado a tu email.</p>
        <p style={{ fontSize: 14, color: 'var(--ds-text)', fontWeight: 500, marginTop: 4, wordBreak: 'break-all' }}>{email}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <div className='flex justify-center gap-1.5 sm:gap-2'>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type='text'
              maxLength={1}
              value={otp[index] || ''}
              onChange={(e) => handleOtpInputChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={handleOtpPaste}
              disabled={isLoading}
              className='w-9 h-11 sm:w-11 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed'
              style={{ textAlign: 'center', fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ds-text)', background: 'var(--ds-background)', border: '1px solid var(--ds-border)', borderRadius: 'var(--radius-md)', outline: 'none' }}
              autoComplete='off'
            />
          ))}
        </div>

        {/* Timer */}
        <div className='text-center' style={{ margin: '16px 0' }}>
          {isTimerActive ? (
            <p style={{ fontSize: 14, color: 'var(--ds-text-secondary)' }}>
              El código expira en: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ds-text)' }}>{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--red-700)' }}>El código ha expirado</p>
          )}
        </div>

        <div className='flex flex-col sm:flex-row gap-2'>
          <button type='button' onClick={onCancel} disabled={isLoading} className='flex-1 disabled:opacity-50 disabled:cursor-not-allowed'
            style={{ height: 40, borderRadius: 'var(--radius-md)', background: 'var(--ds-background)', color: 'var(--ds-text)', border: '1px solid var(--ds-border-strong)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Cancelar
          </button>

          {canResend ? (
            <button type='button' onClick={handleResend} disabled={isLoading} className='flex-1 disabled:opacity-50 disabled:cursor-not-allowed'
              style={{ height: 40, borderRadius: 'var(--radius-md)', background: 'var(--red-700)', color: 'var(--ds-contrast-inverse)', border: '1px solid var(--red-700)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              {isLoading ? 'Reenviando…' : 'Reenviar OTP'}
            </button>
          ) : (
            <button type='submit' disabled={otp.length !== 6 || isLoading} className='flex-1 disabled:opacity-50 disabled:cursor-not-allowed'
              style={{ height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-700)', color: 'var(--primary-contrast-fg)', border: '1px solid var(--primary-700)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              {isLoading ? 'Validando…' : 'Validar OTP'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
