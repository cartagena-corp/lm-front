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
    <div className='w-full space-y-4'>
      <div className='text-center'>
        <h3 className='font-bold text-xl md:text-2xl'>Verificación OTP</h3>
        <p className='text-black/50 text-sm'>
          Ingresa el código de 6 dígitos enviado a tu email
        </p>
        <p className='text-black/70 text-sm font-medium break-all'>
          {email}
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='flex justify-center gap-1 md:gap-2'>
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
              className='w-10 h-10 md:w-12 md:h-12 border border-black/15 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg md:text-xl font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed'
              autoComplete='off'
            />
          ))}
        </div>

        {/* Timer */}
        <div className='text-center'>
          {isTimerActive ? (
            <p className='text-black/50 text-sm'>
              El código expira en: <span className='font-mono font-semibold'>{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className='text-red-500 text-sm'>
              El código ha expirado
            </p>
          )}
        </div>

        <div className='flex flex-col sm:flex-row gap-2'>
          <button
            type='button'
            onClick={onCancel}
            disabled={isLoading}
            className='flex-1 px-4 py-2 border border-black/15 rounded-md hover:bg-black/5 duration-150 disabled:opacity-50 disabled:cursor-not-allowed'>
            Cancelar
          </button>

          {canResend ? (
            <button
              type='button'
              onClick={handleResend}
              disabled={isLoading}
              className='flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 duration-150 disabled:opacity-50 disabled:cursor-not-allowed'>
              {isLoading ? 'Reenviando...' : 'Reenviar OTP'}
            </button>
          ) : (
            <button
              type='submit'
              disabled={otp.length !== 6 || isLoading}
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 duration-150 disabled:opacity-50 disabled:cursor-not-allowed'>
              {isLoading ? 'Validando...' : 'Validar OTP'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
