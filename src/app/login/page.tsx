'use client'

import { useAuthStore } from '@/lib/store/AuthStore'
import { GoogleButton } from '../../assets/Icon'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const { isAuthenticated, getGoogleLoginUrl } = useAuthStore()
  const [canRender, setCanRender] = useState(false)
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutos en segundos
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/tableros")
    } else {
      // Intentar restaurar datos de LocalStorage al cargar
      const restored = restoreFromLocalStorage()
      setCanRender(true)
    }
  }, [isAuthenticated, router])

  // Función para guardar datos en LocalStorage
  const saveToLocalStorage = () => {
    const loginData = {
      email,
      timestamp: Date.now()
    }
    localStorage.setItem('otpLoginData', JSON.stringify(loginData))
  }

  // Función para limpiar datos de LocalStorage
  const clearLocalStorage = () => {
    localStorage.removeItem('otpLoginData')
  }

  // Función para verificar si los datos han expirado (2 minutos)
  const checkLocalExpiry = () => {
    const stored = localStorage.getItem('otpLoginData')
    if (stored) {
      const data = JSON.parse(stored)
      const now = Date.now()
      const timeElapsed = now - data.timestamp
      const twoMinutes = 2 * 60 * 1000 // 2 minutos en milisegundos

      if (timeElapsed >= twoMinutes) {
        clearLocalStorage()
        return true // Datos expirados
      }
    }
    return false // Datos válidos o no existen
  }

  // Función para restaurar estado desde LocalStorage
  const restoreFromLocalStorage = () => {
    const stored = localStorage.getItem('otpLoginData')
    if (stored) {
      const data = JSON.parse(stored)
      const now = Date.now()
      const timeElapsed = now - data.timestamp
      const twoMinutes = 2 * 60 * 1000 // 2 minutos en milisegundos

      if (timeElapsed < twoMinutes) {
        // Restaurar datos del formulario
        setEmail(data.email)
        // No restauramos la contraseña por seguridad

        // Calcular tiempo restante
        const remainingTime = Math.max(0, 120 - Math.floor(timeElapsed / 1000))

        // Restaurar estado del OTP
        setShowOtpForm(true)
        setTimeLeft(remainingTime)
        setIsTimerActive(remainingTime > 0)
        setCanResend(remainingTime === 0)

        return true // Datos restaurados
      } else {
        // Datos expirados, limpiar
        clearLocalStorage()
      }
    }
    return false // No hay datos para restaurar
  }

  // Timer para el OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsTimerActive(false)
            setCanResend(true)
            // Limpiar LocalStorage cuando expire el tiempo
            clearLocalStorage()
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

  // Verificar expiración de datos al montar el componente
  useEffect(() => {
    // Esta verificación ya se hace en restoreFromLocalStorage
    // Solo verificar si no se pudo restaurar
    if (!showOtpForm) {
      checkLocalExpiry()
    }
  }, [])

  // Función para validar email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Función para formatear el tiempo
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Manejar envío del formulario de email/password
  const handleEmailSubmit = (e: React.FormEvent) => {
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

    // Si todo está bien, mostrar formulario OTP
    setShowOtpForm(true)
    setTimeLeft(120)
    setIsTimerActive(true)
    setCanResend(false)
    // Guardar datos en LocalStorage
    saveToLocalStorage()
  }

  // Manejar envío del OTP
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 5) {
      alert('Por favor ingresa un código OTP válido de 5 dígitos')
      return
    }

    // Aquí iría la lógica para validar el OTP
    console.log('OTP enviado:', otp)
    alert('OTP validado correctamente')

    // Limpiar LocalStorage al validar correctamente
    clearLocalStorage()

    // Reset del formulario
    setShowOtpForm(false)
    setOtp('')
    setEmail('')
    setPassword('')
  }

  // Manejar reenvío de OTP
  const handleResendOtp = () => {
    setTimeLeft(120)
    setIsTimerActive(true)
    setCanResend(false)
    setOtp('')
    // Actualizar timestamp en LocalStorage al reenviar
    saveToLocalStorage()
    alert('Código OTP reenviado')
  }

  // Función para manejar cambios en el input de OTP (solo números)
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5)
    setOtp(value)
  }

  // Función para manejar cambios en inputs individuales de OTP
  const handleOtpInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Solo números

    const newOtp = otp.split('')
    newOtp[index] = value

    // Llenar con espacios vacíos si es necesario
    while (newOtp.length < 5) {
      newOtp.push('')
    }

    setOtp(newOtp.join(''))

    // Auto-focus al siguiente input si se ingresó un dígito
    if (value && index < 4) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  // Función para manejar pegado de código completo
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()

    const pastedData = e.clipboardData.getData('text')
    const digitsOnly = pastedData.replace(/\D/g, '').slice(0, 5)

    if (digitsOnly.length > 0) {
      // Rellenar con espacios vacíos hasta 5 caracteres
      const paddedOtp = digitsOnly.padEnd(5, '')
      setOtp(paddedOtp)

      // Enfocar el último input con contenido o el último input
      const lastIndex = Math.min(digitsOnly.length - 1, 4)
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

  if (!canRender) return null
  let loginDemo = true
  return (
    <main className='bg-gray-900 min-h-screen flex justify-center items-center p-4'>
      {/* Container principal con max-width y responsive */}
      <div className='w-full max-w-4xl mx-auto flex flex-col lg:flex-row shadow-2xl rounded-lg overflow-hidden min-h-[600px] lg:min-h-[500px]'>
        {/* Sección izquierda - Información */}
        <section className='bg-blue-900 text-white flex flex-col justify-center items-center lg:rounded-l-md p-8 lg:p-14 lg:w-1/2'>
          <h5 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-4'>La Muralla</h5>
          <p className='text-center text-sm md:text-base'>
            Logo, Lema, Tema Principal, etc <br />
            <b className='text-white/75 italic font-extralight'>(info de la WebApp)</b>
          </p>
        </section>

        {/* Sección derecha - Formulario */}
        <section className='bg-white text-black flex flex-col justify-center items-center lg:rounded-r-md p-8 lg:p-14 space-y-4 lg:w-1/2'>
          {!showOtpForm && (
            <div className='text-start w-full'>
              <h6 className='font-bold text-xl md:text-2xl'>Bienvenido</h6>
              <p className='text-black/50 text-sm md:text-base'>Inicia sesión para acceder a tu cuenta</p>
            </div>
          )}

          {/* Formulario de Email y Contraseña */}
          {!showOtpForm && !loginDemo && (
            <form onSubmit={handleEmailSubmit} className='w-full space-y-4'>
              <div>
                <input
                  type='email'
                  placeholder='Correo electrónico'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 ${emailError ? 'border-red-500' : 'border-black/15'
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
                  className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 ${passwordError ? 'border-red-500' : 'border-black/15'
                    }`}
                />
                {passwordError && <p className='text-red-500 text-xs mt-1'>{passwordError}</p>}
              </div>

              <div className='flex flex-col sm:flex-row gap-2'>
                <button
                  type='submit'
                  className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 duration-150'>
                  Iniciar Sesión
                </button>
              </div>
            </form>
          )}

          {/* Formulario de OTP */}
          {showOtpForm && (
            <div className='w-full space-y-4'>
              <div className='text-center'>
                <h3 className='font-bold text-xl md:text-2xl'>Verificación OTP</h3>
                <p className='text-black/50 text-sm'>
                  Ingresa el código de 5 dígitos enviado a tu email
                </p>
                <p className='text-black/70 text-sm font-medium break-all'>
                  {email}
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className='space-y-4'>
                <div className='flex justify-center gap-1 md:gap-2'>
                  {[0, 1, 2, 3, 4].map((index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type='text'
                      maxLength={1}
                      value={otp[index] || ''}
                      onChange={(e) => handleOtpInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className='w-10 h-10 md:w-12 md:h-12 border border-black/15 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg md:text-xl font-semibold'
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
                    onClick={() => {
                      setShowOtpForm(false)
                      setOtp('')
                      setIsTimerActive(false)
                      setCanResend(false)
                      // Limpiar LocalStorage al cancelar
                      clearLocalStorage()
                    }}
                    className='flex-1 px-4 py-2 border border-black/15 rounded-md hover:bg-black/5 duration-150'>
                    Cancelar
                  </button>

                  {canResend ? (
                    <button
                      type='button'
                      onClick={handleResendOtp}
                      className='flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 duration-150'>
                      Reenviar OTP
                    </button>
                  ) : (
                    <button
                      type='submit'
                      disabled={otp.length !== 5}
                      className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 duration-150 disabled:opacity-50 disabled:cursor-not-allowed'>
                      Validar OTP
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}


          {/* Separador */}
          {!showOtpForm && !loginDemo && (
            <div className='flex items-center w-full'>
              <hr className='flex-1 border-black/15' />
              <span className='px-3 text-black/50 text-sm'>o</span>
              <hr className='flex-1 border-black/15' />
            </div>
          )}

          {!showOtpForm && (
            <Link href={getGoogleLoginUrl()}
              className='border-black/15 hover:bg-black/5 duration-150 border rounded-md py-2 w-full flex justify-center items-center gap-4'>
              <GoogleButton size={18} />
              Iniciar Sesión con Google
            </Link>
          )}

          <p className='text-xs text-center'>
            Al iniciar sesión, aceptas nuestros <b className='hover:underline cursor-pointer'>Términos de servicio</b> y <b className='hover:underline cursor-pointer'>Política de privacidad</b>
          </p>
        </section>
      </div>
    </main>
  )
}