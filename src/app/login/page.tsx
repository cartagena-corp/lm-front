'use client'

import { useAuthStore } from '@/lib/store/AuthStore'
import { GoogleLogo } from '@/components/icons/GoogleLogo'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoginForm from '@/components/partials/login/LoginForm'
import OTPForm from '@/components/partials/login/OTPForm'
import RegisterForm from '@/components/partials/login/RegisterForm'
import TypingHeadline from '@/components/partials/login/TypingHeadline'
import toast from 'react-hot-toast'
import { Roboto_Condensed } from 'next/font/google'

const roboto = Roboto_Condensed({ subsets: ['latin'] })

export default function LoginPage() {
  const { isAuthenticated, getGoogleLoginUrl, loginPassword, generateOtp, verifyOtp, clearOtpPhrase } = useAuthStore()
  const [canRender, setCanRender] = useState(false)
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [email, setEmail] = useState('')
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutos en segundos
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/tableros")
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
      registrationData,
      timestamp: Date.now()
    }
    localStorage.setItem('otpLoginData', JSON.stringify(loginData))
  }

  // Función para limpiar datos de LocalStorage
  const clearLocalStorage = () => {
    localStorage.removeItem('otpLoginData')
    // También limpiar la frase OTP del store
    clearOtpPhrase()
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
        if (data.registrationData) {
          setRegistrationData(data.registrationData)
        }

        // Calcular tiempo restante
        const remainingTime = Math.max(0, 120 - Math.floor(timeElapsed / 1000))

        // Restaurar estado del OTP
        setShowOtpForm(true)
        setTimeLeft(remainingTime)

        return true // Datos restaurados
      } else {
        // Datos expirados, limpiar
        clearLocalStorage()
      }
    }
    return false // No hay datos para restaurar
  }

  // Verificar expiración de datos al montar el componente
  useEffect(() => {
    if (!showOtpForm) {
      checkLocalExpiry()
    }
  }, [])

  // Manejar clic en "ingresa aquí" para mostrar formulario de registro
  const handleShowRegisterForm = () => {
    setShowRegisterForm(true)
  }

  // Manejar volver desde el formulario de registro
  const handleBackFromRegister = () => {
    setShowRegisterForm(false)
  }

  // Manejar envío del formulario de login (email/password)
  const handleLoginSubmit = async (email: string, password: string) => {
    if (isLoading) return
    setIsLoading(true)
    setEmail(email)

    try {
      const res = await loginPassword(email, password)
      if (res.isError) {
        toast.error(res.message)
        return
      }

      router.replace("/tableros")
    } catch (error) {
      toast.error("Error al iniciar sesión: " + (error instanceof Error ? error.message : error))
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar envío del formulario de registro
  const handleRegisterSubmit = async (data: { email: string, firstName: string, lastName: string, password: string }) => {
    if (isLoading) return
    setIsLoading(true)
    setEmail(data.email)

    const newRegistrationData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password
    }

    setRegistrationData(newRegistrationData)

    try {
      const response = await generateOtp({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password
      })

      if (!response.isError) {
        setShowRegisterForm(false)
        setShowOtpForm(true)
        setTimeLeft(120)
        saveToLocalStorage()
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      console.error('Error en registro:', error)
      toast.error('Error al generar el código OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (otp: string) => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const response = await verifyOtp(otp, {
        email: registrationData.email,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        password: registrationData.password
      })

      if (!response.isError) {
        toast.success('¡Registro completado exitosamente!')

        clearLocalStorage()

        setShowOtpForm(false)
        setShowRegisterForm(false)
        setEmail('')
        setRegistrationData({
          firstName: '',
          lastName: '',
          email: '',
          password: ''
        })
      } else if (response.message === "INVALIDO") {
        toast.error('Has excedido el número de intentos. Por favor, genera un nuevo código OTP.')
        localStorage.removeItem('otpLoginData')
        setShowRegisterForm(true)
        setShowOtpForm(false)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      console.error('Error en verificación OTP:', error)
      toast.error('Error al verificar el código OTP')
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar cancelación del OTP
  const handleOtpCancel = () => {
    setShowOtpForm(false)
    setShowRegisterForm(false)
    setEmail('')
    setRegistrationData({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    })
    // Limpiar LocalStorage al cancelar (esto también limpia la frase OTP)
    clearLocalStorage()
  }

  // Manejar reenvío de OTP
  const handleOtpResend = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      // Reenviar OTP usando la función del store
      const response = await generateOtp({
        email: registrationData.email,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        password: registrationData.password
      })

      if (!response.isError) {
        setTimeLeft(120)
        saveToLocalStorage()
        toast.success('Código OTP reenviado exitosamente')
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      console.error('Error al reenviar OTP:', error)
      toast.error('Error al reenviar el código OTP')
    } finally {
      setIsLoading(false)
    }
  }

  if (!canRender) return null

  return (
    <main className='min-h-screen grid lg:grid-cols-[1.05fr_1fr]' style={{ background: 'var(--ds-background)', color: 'var(--ds-text)', fontFamily: 'var(--font-sans)' }}>
      {/* Brand panel */}
      <div
        className='hidden lg:flex flex-col justify-between relative overflow-hidden'
        style={{
          background: '#0a0a0a', color: '#ededed', padding: 56,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 80% 0%, rgba(0,112,243,0.18), transparent 60%)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src='/favicon-light.ico' alt='La Muralla' style={{ width: 48, height: 48, objectFit: 'contain', display: 'block' }} />
          <span className={`${roboto.className} pt-0.5`} style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>LA MURALLA</span>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.04em', color: 'var(--blue-600)', textTransform: 'uppercase', marginBottom: 20 }}>Gestión de proyectos</div>
          <TypingHeadline />
          <p style={{ fontSize: 16, lineHeight: '26px', color: 'rgba(237,237,237,0.62)', maxWidth: 420, margin: 0 }}>Tableros, sprints y seguimiento de tu equipo en un solo lugar. Diseñado para moverse a la velocidad de la ingeniería.</p>
        </div>
        <div style={{ position: 'relative', display: 'flex', gap: 28, fontSize: 13, color: 'rgba(237,237,237,0.5)' }}>
          <span><b style={{ color: '#ededed', fontWeight: 600 }}>12</b> tableros activos</span>
          <span><b style={{ color: '#ededed', fontWeight: 600 }}>340</b> tareas</span>
          <span><b style={{ color: '#ededed', fontWeight: 600 }}>99.9%</b> uptime</span>
        </div>
      </div>

      {/* Form panel */}
      <div className='flex items-center justify-center p-6 sm:p-10'>
        <div style={{ width: '100%', maxWidth: 360 }}>
          {/* Formulario de Login - Vista inicial */}
          {!showRegisterForm && !showOtpForm && (
            <>
              <LoginForm
                onSubmit={handleLoginSubmit}
                isLoading={isLoading}
              />

              {/* Separador */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--ds-border)' }} />
                <span style={{ fontSize: 12, color: 'var(--ds-text-muted)' }}>o</span>
                <div style={{ flex: 1, height: 1, background: 'var(--ds-border)' }} />
              </div>

              {/* Botón de Google */}
              <Link href={getGoogleLoginUrl()}
                className='w-full flex justify-center items-center'
                style={{ height: 40, borderRadius: 'var(--radius-md)', background: 'var(--ds-background)', color: 'var(--ds-text)', border: '1px solid var(--ds-border-strong)', fontSize: 14, fontWeight: 500, gap: 10 }}>
                <GoogleLogo size={16} />
                Continuar con Google
              </Link>

              <p style={{ fontSize: 13, color: 'var(--ds-text-secondary)', textAlign: 'center', margin: '24px 0 0' }}>
                ¿Ya tienes una cuenta asociada con Google y deseas completar tu registro?{' '}
                <button onClick={handleShowRegisterForm} style={{ color: 'var(--accent)', fontWeight: 500, cursor: 'pointer', background: 'transparent', border: 'none' }}>Regístrate</button>
              </p>
            </>
          )}

          {/* Formulario de Registro */}
          {showRegisterForm && !showOtpForm && (
            <RegisterForm
              onSubmit={handleRegisterSubmit}
              onBack={handleBackFromRegister}
              isLoading={isLoading}
            />
          )}

          {/* Formulario de OTP */}
          {showOtpForm && (
            <OTPForm
              email={email}
              onSubmit={handleOtpSubmit}
              onCancel={handleOtpCancel}
              onResend={handleOtpResend}
              initialTimeLeft={timeLeft}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </main>
  )
}