"use client"

import { useState, useEffect } from 'react'
import { useGeminiStore } from '@/lib/store/GeminiStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { EyeIcon, KeyIcon } from '@/assets/Icon'
import Switch from '@/components/ui/Switch'
import toast from 'react-hot-toast'

export default function GeminiKeyManager() {
    const [showSaved, setShowSaved] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showApiKey, setShowApiKey] = useState(false)
    const { updateConfig, getConfig, apiKey, models, organizationName, setApiKey, updateModelEnabled, updateModelMethod } = useGeminiStore()
    const { getValidAccessToken } = useAuthStore()

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
                        <h3 className="text-lg font-semibold text-gray-900">Configuración de Gemini</h3>
                        <p className="text-sm text-gray-600">Configura tu API Key y selecciona los modelos de Gemini a usar</p>
                    </div>
                </div>

                {/* Organization Info */}
                {organizationName && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-purple-900 mb-1">Organización Activa</h4>
                                <p className="text-lg font-semibold text-purple-800">{organizationName}</p>
                            </div>
                        </div>
                    </div>
                )}

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
                                value={apiKey || ''}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                        <p className="text-xs text-gray-600">Tu API Key se almacena de forma segura y solo es visible para ti</p>
                    </div>

                    {/* Models Configuration */}
                    <div className="space-y-4">
                        <div className="pb-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Modelos de Gemini</h4>
                            <p className="text-xs text-gray-600">Selecciona el modelo que deseas usar </p>
                        </div>

                        <div className="space-y-4">
                            {models.map((model) => (
                                <div key={model.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    {/* Model Toggle */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${model.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-900">{model.displayName}</h5>
                                                <p className="text-xs text-gray-500">{model.name}</p>
                                                {/* {model.desc && (
                                                    <p className="text-xs text-gray-600 mt-1 max-w-md">{model.desc}</p>
                                                )} */}
                                            </div>
                                        </div>
                                        <Switch
                                            id={`model-${model.id}`}
                                            checked={model.enabled}
                                            onChange={(enabled) => updateModelEnabled(model.id, enabled)}
                                            size="md"
                                        />
                                    </div>

                                    {/* Methods Configuration */}
                                    {model.enabled && (
                                        <div className="ml-6 space-y-3 border-l-2 border-green-200 pl-4">
                                            <p className="text-xs font-medium text-gray-700 mb-2">Métodos disponibles:</p>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Generate Content</span>
                                                    <p className="text-xs text-gray-500">Crea contenido como texto, código, resúmenes o historias. Es lo que usas para pedirle a Gemini que escriba algo.</p>
                                                </div>
                                                <Switch
                                                    id={`${model.id}-generateContent`}
                                                    checked={model.methods.generateContent}
                                                    onChange={(enabled) => updateModelMethod(model.id, 'generateContent', enabled)}
                                                    size="md"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Embed Content</span>
                                                    <p className="text-xs text-gray-500">Crea vectores numéricos (embeddings) a partir de texto. Esto es para que una computadora entienda el significado de tus palabras y pueda hacer cosas como buscar información relacionada o comparar documentos.</p>
                                                </div>
                                                <Switch
                                                    id={`${model.id}-embedContent`}
                                                    checked={model.methods.embedContent}
                                                    onChange={(enabled) => updateModelMethod(model.id, 'embedContent', enabled)}
                                                    size="md"
                                                />
                                            </div>

                                            {/* URLs Preview */}
                                            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                                                <p className="text-sm font-medium text-gray-700 mb-2">URL generada:</p>
                                                {model.methods.generateContent && (
                                                    <p className="text-sm text-green-700 font-mono bg-green-50 p-2 rounded break-all">
                                                        https://generativelanguage.googleapis.com/v1beta/models/{model.name}:generateContent
                                                    </p>
                                                )}
                                                {model.methods.embedContent && (
                                                    <p className="text-sm text-blue-700 font-mono bg-blue-50 p-2 rounded break-all">
                                                        https://generativelanguage.googleapis.com/v1beta/models/{model.name}:embedContent
                                                    </p>
                                                )}
                                                {!model.methods.generateContent && !model.methods.embedContent && (
                                                    <p className="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded break-all">
                                                        https://generativelanguage.googleapis.com/v1beta/models/{model.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
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
                                    <li>• Solo puede haber un modelo activo a la vez</li>
                                    <li>• Solo puede haber un método activo por modelo a la vez</li>
                                    <li>• Las URLs se generan automáticamente basadas en el modelo y método seleccionado</li>
                                    <li>• Esta configuración será utilizada en todas las funciones de Gemini</li>
                                </ul>
                            </div>
                        </div>
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
                            disabled={isLoading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                        >
                            {isLoading ? <>Guardando...</> : <>Guardar Configuración</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}