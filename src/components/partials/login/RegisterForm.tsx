'use client'

import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from '@/assets/Icon'

interface RegisterFormProps {
    onSubmit: (data: {
        firstName: string
        lastName: string
        email: string
        password: string
        confirmPassword: string
    }) => void
    onBack: () => void
    isLoading?: boolean
}

export default function RegisterForm({ onSubmit, onBack, isLoading = false }: RegisterFormProps) {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Estados para mostrar/ocultar contraseñas
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Estados de error
    const [firstNameError, setFirstNameError] = useState('')
    const [lastNameError, setLastNameError] = useState('')
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [confirmPasswordError, setConfirmPasswordError] = useState('')

    // Función para validar email
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    // Función para validar contraseña
    const validatePassword = (password: string) => {
        // Al menos 6 caracteres
        return password.length >= 6
    }

    // Manejar envío del formulario
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Limpiar errores previos
        setFirstNameError('')
        setLastNameError('')
        setEmailError('')
        setPasswordError('')
        setConfirmPasswordError('')

        let hasErrors = false

        // Validar nombre
        if (!firstName.trim()) {
            setFirstNameError('El nombre es requerido')
            hasErrors = true
        } else if (firstName.trim().length < 2) {
            setFirstNameError('El nombre debe tener al menos 2 caracteres')
            hasErrors = true
        }

        // Validar apellido
        if (!lastName.trim()) {
            setLastNameError('El apellido es requerido')
            hasErrors = true
        } else if (lastName.trim().length < 2) {
            setLastNameError('El apellido debe tener al menos 2 caracteres')
            hasErrors = true
        }

        // Validar email
        if (!email.trim()) {
            setEmailError('El email es requerido')
            hasErrors = true
        } else if (!validateEmail(email)) {
            setEmailError('Por favor ingresa un email válido')
            hasErrors = true
        }

        // Validar contraseña
        if (!password) {
            setPasswordError('La contraseña es requerida')
            hasErrors = true
        } else if (!validatePassword(password)) {
            setPasswordError('La contraseña debe tener al menos 6 caracteres')
            hasErrors = true
        }

        // Validar confirmación de contraseña
        if (!confirmPassword) {
            setConfirmPasswordError('Debes confirmar tu contraseña')
            hasErrors = true
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Las contraseñas no coinciden')
            hasErrors = true
        }

        // Si no hay errores, enviar datos
        if (!hasErrors) {
            onSubmit({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                password,
                confirmPassword
            })
        }
    }

    return (
        <>
            <div className='text-start w-full'>
                <h6 className='font-bold text-xl md:text-2xl'>Asociar cuenta</h6>
                <p className='text-black/50 text-sm md:text-base'>
                    Establece una contraseña para tu cuenta
                </p>
            </div>

            <form onSubmit={handleSubmit} className='w-full space-y-4'>
                {/* Nombre y Apellido en una fila */}
                <div className='flex flex-col sm:flex-row gap-4'>
                    <div className='flex-1'>
                        <input
                            type='text'
                            placeholder='Nombre'
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            disabled={isLoading}
                            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${firstNameError ? 'border-red-500' : 'border-black/15'
                                }`}
                        />
                        {firstNameError && <p className='text-red-500 text-xs mt-1'>{firstNameError}</p>}
                    </div>

                    <div className='flex-1'>
                        <input
                            type='text'
                            placeholder='Apellido'
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            disabled={isLoading}
                            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${lastNameError ? 'border-red-500' : 'border-black/15'
                                }`}
                        />
                        {lastNameError && <p className='text-red-500 text-xs mt-1'>{lastNameError}</p>}
                    </div>
                </div>

                {/* Email */}
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

                {/* Contraseña */}
                <div>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Nueva contraseña'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className={`w-full px-3 py-2 ${password ? 'pr-10' : 'pr-3'} border rounded-md outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${passwordError ? 'border-red-500' : 'border-black/15'
                                }`}
                        />
                        {password && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                            </button>
                        )}
                    </div>
                    {passwordError && <p className='text-red-500 text-xs mt-1'>{passwordError}</p>}
                </div>

                {/* Confirmar contraseña */}
                <div>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder='Confirmar contraseña'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            className={`w-full px-3 py-2 ${confirmPassword ? 'pr-10' : 'pr-3'} border rounded-md outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${confirmPasswordError ? 'border-red-500' : 'border-black/15'
                                }`}
                        />
                        {confirmPassword && (
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoading}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                                {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                            </button>
                        )}
                    </div>
                    {confirmPasswordError && <p className='text-red-500 text-xs mt-1'>{confirmPasswordError}</p>}
                </div>

                {/* Botones */}
                <div className='flex flex-col sm:flex-row gap-2'>
                    <button
                        type='button'
                        onClick={onBack}
                        disabled={isLoading}
                        className='flex-1 px-4 py-2 border border-black/15 rounded-md hover:bg-black/5 duration-150 disabled:opacity-50 disabled:cursor-not-allowed'>
                        Volver
                    </button>

                    <button
                        type='submit'
                        disabled={isLoading}
                        className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 duration-150 disabled:opacity-50 disabled:cursor-not-allowed'>
                        {isLoading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </div>
            </form>
        </>
    )
}
