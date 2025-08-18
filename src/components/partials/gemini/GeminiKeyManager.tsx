"use client"

import { useState, useEffect } from 'react'
import { useGeminiStore } from '@/lib/store/GeminiStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { EyeIcon, KeyIcon } from '@/assets/Icon'
import toast from 'react-hot-toast'

export default function GeminiKeyManager() {
    const [showSaved, setShowSaved] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showApiKey, setShowApiKey] = useState(false)
    const { updateConfig, getConfig, apiKey, apiUrl, setApiKey, setApiUrl } = useGeminiStore()
    const { getValidAccessToken } = useAuthStore()

    const isKeyHidden = Boolean(apiKey && /^\*+$/.test(apiKey))

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        // Si la API Key actual es solo asteriscos y se está borrando o agregando caracteres
        if (isKeyHidden) {
            // Si se está borrando (longitud menor que la actual)
            if (newValue.length < apiKey.length) {
                setApiKey('')
            }
            // Si se está agregando un nuevo caracter
            else if (newValue.length > apiKey.length) {
                setApiKey(newValue.slice(-1))
            }
        } else {
            setApiKey(newValue)
        }
    }

    // Cargar configuración inicial de Gemini
    useEffect(() => {
        const loadGeminiConfig = async () => {
            try {
                const token = await getValidAccessToken()
                if (token) {
                    await getConfig(token)
                }
            } catch (error) {
                console.error('Error al cargar la configuración de Gemini:', error)
            }
        }

        loadGeminiConfig()
    }, [getValidAccessToken, getConfig])

    const handleSaveGemini = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const token = await getValidAccessToken()
            if (!token) {
                throw new Error('No se pudo obtener un token válido')
            }
            await updateConfig(token)
            setShowSaved(true)
            toast.success('La configuración de Gemini se ha guardado correctamente')
            setTimeout(() => {
                setShowSaved(false)
            }, 2000)
        } catch (error) {
            console.error('Error:', error)
            toast.error('No se pudo guardar la configuración de Gemini')
        } finally {
            setIsLoading(false)
        }
    }

    const toggleApiKeyVisibility = () => {
        setShowApiKey(!showApiKey)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <KeyIcon size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Configuración de API Key</h3>
                        <p className="text-sm text-gray-600">Configura tu API Key y URL para usar Gemini</p>
                    </div>
                </div>


                {/* Info Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Información importante</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• La API Key se encripta antes de ser almacenada</li>
                                <li>• Asegúrate de que la URL de la API sea correcta y esté disponible</li>
                                <li>• Esta configuración será utilizada en todas las funciones de Gemini</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSaveGemini} className="space-y-6">
                    {/* API Key Field */}
                    <div className="space-y-2">
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                            API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showApiKey ? "text" : "password"}
                                id="apiKey"
                                value={apiKey}
                                onChange={handleApiKeyChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Ingresa tu API Key de Gemini"
                                required
                            />
                            <button
                                type="button"
                                onClick={toggleApiKeyVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                title={showApiKey ? "Ocultar API Key" : "Mostrar API Key"}
                            >
                                {showApiKey ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                ) : (
                                    <EyeIcon size={20} />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            Tu API Key se almacena de forma segura y solo es visible para ti
                        </p>
                    </div>

                    {/* API URL Field */}
                    <div className="space-y-2">
                        <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700">
                            URL de la API
                        </label>
                        <div className="relative">
                            <input
                                type="url"
                                id="apiUrl"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="https://api.gemini.example.com"
                                required
                            />
                            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <p className="text-xs text-gray-500">
                            Ingresa la URL base de la API de Gemini
                        </p>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            {showSaved && (
                                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    ¡Configuración guardada!
                                </span>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || isKeyHidden}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Guardando...
                                </>
                            ) : isKeyHidden ? (
                                'Modifica la API Key para guardar'
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    Guardar Configuración
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}