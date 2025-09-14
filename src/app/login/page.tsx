'use client'

import { useAuthStore } from '@/lib/store/AuthStore'
import { GoogleButton } from '../../assets/Icon'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoginForm from '@/components/partials/login/LoginForm'
import OTPForm from '@/components/partials/login/OTPForm'
import RegisterForm from '@/components/partials/login/RegisterForm'
import Image from 'next/image'
import logoImage from '@/assets/favicon-light.jpg'
import { Roboto_Condensed } from 'next/font/google'
import toast from 'react-hot-toast'

const robotoCondensed = Roboto_Condensed({ subsets: ['latin'] })

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
  const handleLoginSubmit = async (email, password) => {
    setIsLoading(true)
    setEmail(email)

    try {
      const res = await loginPassword(email, password)
      if (res.isError) throw new Error(res.message)

      router.push("/tableros")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar envío del formulario de registro
  const handleRegisterSubmit = async (data) => {
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

  const handleOtpSubmit = async (otp) => {
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
    <main className='bg-gray-900 min-h-screen flex justify-center items-center p-4'>
      {/* Container principal con max-width y responsive */}
      <div className='w-full max-w-4xl mx-auto flex flex-col lg:flex-row shadow-2xl rounded-lg overflow-hidden lg:min-h-[500px]'>
        {/* Sección izquierda - Información */}
        <section className='bg-blue-900 text-white flex flex-col justify-center items-center lg:rounded-l-md p-8 lg:p-14 lg:w-1/2 space-y-2'>
          <Image src={logoImage} width={100} alt='logo' />
          <hgroup className={`text-center text-sm md:text-base ${robotoCondensed.className}`}>
            <h5 className='font-semibold text-2xl md:text-3xl lg:text-4xl'>LA MURALLA</h5>
            <p className='text-white/60 text-xs'>CARTAGENACORPORATION.COM</p>
          </hgroup>
        </section>

        {/* Sección derecha - Formulario */}
        <section className='bg-white text-black flex flex-col justify-center items-center lg:rounded-r-md p-8 lg:p-14 space-y-2.5 lg:w-1/2'>
          {/* Formulario de Login - Vista inicial */}
          {!showRegisterForm && !showOtpForm && (
            <>
              <LoginForm
                onSubmit={handleLoginSubmit}
                isLoading={isLoading}
              />

              {/* Separador */}
              <div className='flex items-center w-full'>
                <hr className='flex-1 border-black/15' />
                <span className='px-3 text-black/50 text-sm'>o</span>
                <hr className='flex-1 border-black/15' />
              </div>

              {/* Botón de Google */}
              <Link href={getGoogleLoginUrl()}
                className='border-black/15 hover:bg-black/5 duration-150 border rounded-md py-2 w-full flex justify-center items-center gap-4'>
                <GoogleButton size={18} />
                Iniciar Sesión con Google
              </Link>
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

          {/* Términos de servicio - Solo en vista inicial */}
          {!showRegisterForm && !showOtpForm && (
            <span className='text-black/70 text-xs text-center'>
              ¿Ya tienes una cuenta asociada con Google y deseas completar tu registro? <button onClick={handleShowRegisterForm} className='font-bold hover:underline cursor-pointer'>Ingresa aquí</button>
            </span>
          )}
        </section>
      </div>
    </main>
  )
}