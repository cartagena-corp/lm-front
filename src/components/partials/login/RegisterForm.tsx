'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

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

    const inputStyle = (hasError: boolean): React.CSSProperties => ({
        width: '100%', height: 40, padding: '0 12px',
        background: 'var(--ds-background)', color: 'var(--ds-text)',
        border: `1px solid ${hasError ? 'var(--red-700)' : 'var(--ds-border)'}`,
        borderRadius: 'var(--radius-md)', outline: 'none',
        fontFamily: 'var(--font-sans)', fontSize: 14,
    })
    const errStyle: React.CSSProperties = { color: 'var(--red-700)', fontSize: 12, marginTop: 6 }
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }

    return (
        <div className='w-full'>
            <h2 className='font-semibold' style={{ fontSize: 24, letterSpacing: '-0.96px', margin: '0 0 6px' }}>Asociar cuenta</h2>
            <p style={{ fontSize: 14, color: 'var(--ds-text-secondary)', margin: '0 0 24px' }}>Establece una contraseña para tu cuenta.</p>

            <form onSubmit={handleSubmit} className='w-full'>
                {/* Nombre y Apellido en una fila */}
                <div className='flex flex-col sm:flex-row gap-4'>
                    <div className='flex-1'>
                        <label style={labelStyle}>Nombre</label>
                        <input type='text' placeholder='Nombre' value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isLoading} style={inputStyle(!!firstNameError)} />
                        {firstNameError && <p style={errStyle}>{firstNameError}</p>}
                    </div>
                    <div className='flex-1'>
                        <label style={labelStyle}>Apellido</label>
                        <input type='text' placeholder='Apellido' value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isLoading} style={inputStyle(!!lastNameError)} />
                        {lastNameError && <p style={errStyle}>{lastNameError}</p>}
                    </div>
                </div>

                {/* Email */}
                <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>Correo electrónico</label>
                    <input type='email' placeholder='tucorreo@empresa.com' value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} style={inputStyle(!!emailError)} />
                    {emailError && <p style={errStyle}>{emailError}</p>}
                </div>

                {/* Contraseña */}
                <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>Nueva contraseña</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showPassword ? 'text' : 'password'} placeholder='••••••••' value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} style={{ ...inputStyle(!!passwordError), paddingRight: password ? 40 : 12 }} />
                        {password && (
                            <button type='button' onClick={() => setShowPassword(!showPassword)} disabled={isLoading} className='absolute right-3 top-1/2 -translate-y-1/2 flex' style={{ color: 'var(--ds-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                            </button>
                        )}
                    </div>
                    {passwordError && <p style={errStyle}>{passwordError}</p>}
                </div>

                {/* Confirmar contraseña */}
                <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>Confirmar contraseña</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showConfirmPassword ? 'text' : 'password'} placeholder='••••••••' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} style={{ ...inputStyle(!!confirmPasswordError), paddingRight: confirmPassword ? 40 : 12 }} />
                        {confirmPassword && (
                            <button type='button' onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading} className='absolute right-3 top-1/2 -translate-y-1/2 flex' style={{ color: 'var(--ds-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                {showConfirmPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                            </button>
                        )}
                    </div>
                    {confirmPasswordError && <p style={errStyle}>{confirmPasswordError}</p>}
                </div>

                {/* Botones */}
                <div className='flex flex-col sm:flex-row gap-2' style={{ marginTop: 24 }}>
                    <button type='button' onClick={onBack} disabled={isLoading} className='flex-1 disabled:opacity-50 disabled:cursor-not-allowed'
                        style={{ height: 40, borderRadius: 'var(--radius-md)', background: 'var(--ds-background)', color: 'var(--ds-text)', border: '1px solid var(--ds-border-strong)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                        Volver
                    </button>
                    <button type='submit' disabled={isLoading} className='flex-1 disabled:opacity-50 disabled:cursor-not-allowed'
                        style={{ height: 40, borderRadius: 'var(--radius-md)', background: 'var(--ds-text)', color: 'var(--ds-contrast-inverse)', border: '1px solid var(--ds-text)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                        {isLoading ? 'Registrando…' : 'Registrarse'}
                    </button>
                </div>
            </form>
        </div>
    )
}
