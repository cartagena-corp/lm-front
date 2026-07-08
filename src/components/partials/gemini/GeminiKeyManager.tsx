"use client"

import { useState, useEffect } from 'react'
import { useGeminiStore } from '@/lib/store/GeminiStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { Building2, CircleCheck, Eye, EyeOff, Info, Plus, Trash2 } from 'lucide-react'
import Switch from '@/components/ui/Switch'
import toast from 'react-hot-toast'

export default function GeminiKeyManager() {
    const [showSaved, setShowSaved] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showApiKey, setShowApiKey] = useState(false)
    const [newModelName, setNewModelName] = useState('')
    const [newModelDisplayName, setNewModelDisplayName] = useState('')
    const {
        updateConfig, getConfig, apiKey, models, organizationName, setApiKey,
        addModel, removeModel, updateModelField, updateModelEnabled, updateModelMethod
    } = useGeminiStore()
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

    const handleAddModel = () => {
        const added = addModel({ name: newModelName, displayName: newModelDisplayName })
        if (!added) {
            toast.error(newModelName.trim() ? 'Ya existe un modelo con ese ID técnico' : 'Ingresa el ID técnico del modelo')
            return
        }
        setNewModelName('')
        setNewModelDisplayName('')
        toast.success('Modelo agregado. Recuerda guardar la configuración.')
    }

    const handleRemoveModel = (modelId: string, displayName: string) => {
        removeModel(modelId)
        toast.success(`"${displayName}" eliminado. Recuerda guardar la configuración.`)
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h2 className="font-semibold" style={{ fontSize: 20, letterSpacing: "-0.02em", color: "var(--ds-text)", margin: "0 0 4px" }}>Configuración de Gemini</h2>
                <p style={{ fontSize: 14, color: "var(--ds-text-secondary)", margin: 0 }}>Configura tu API Key y selecciona los modelos de Gemini a usar</p>
            </div>

            {/* Organization Info */}
            {organizationName && (
                <div className="rounded-md p-4 mb-6" style={{ background: "var(--purple-100)", border: "1px solid var(--purple-400)" }}>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0" style={{ color: "var(--purple-900)" }}>
                            <Building2 size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium mb-1" style={{ color: "var(--purple-900)" }}>Organización Activa</h4>
                            <p className="text-lg font-semibold" style={{ color: "var(--purple-900)" }}>{organizationName}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveGemini} className="space-y-6">
                    {/* API Key Field */}
                    <div className="space-y-2">
                        <label htmlFor="apiKey" className="block text-sm font-medium" style={{ color: "var(--ds-text)" }}>
                            API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showApiKey ? "text" : "password"}
                                id="apiKey"
                                value={apiKey || ''}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full h-9 px-3 pr-11 rounded-md text-sm placeholder:text-[var(--ds-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-700)] transition-colors"
                                style={{ background: "var(--ds-card)", color: "var(--ds-text)", border: "1px solid var(--ds-border)" }}
                                placeholder="Ingresa tu API Key de Gemini"
                                required
                            />
                            <button
                                type="button"
                                onClick={toggleApiKeyVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--ds-text-muted)] hover:text-[var(--ds-text-secondary)] transition-colors"
                                title={showApiKey ? "Ocultar API Key" : "Mostrar API Key"}
                            >
                                {showApiKey ? (
                                    <EyeOff size={20} strokeWidth={1.5} />
                                ) : (
                                    <Eye size={20} strokeWidth={1.5} />
                                )}
                            </button>
                        </div>
                        <p className="text-xs" style={{ color: "var(--ds-text-muted)" }}>Tu API Key se almacena de forma segura y solo es visible para ti</p>
                    </div>

                    {/* Models Configuration */}
                    <div className="space-y-4">
                        <div className="pb-2">
                            <h4 className="text-sm font-medium mb-1" style={{ color: "var(--ds-text)" }}>Modelos de Gemini</h4>
                            <p className="text-xs" style={{ color: "var(--ds-text-secondary)" }}>Agrega, edita o elimina los modelos disponibles y selecciona el que deseas usar. No es necesario modificar código cuando Google cambie o renombre un modelo.</p>
                        </div>

                        <div className="space-y-4">
                            {models.length === 0 && (
                                <div className="text-center text-sm rounded-md py-6" style={{ color: "var(--ds-text-muted)", border: "1px dashed var(--ds-border-strong)" }}>
                                    Aún no hay modelos configurados. Agrega uno abajo con su ID técnico.
                                </div>
                            )}
                            {models.map((model) => (
                                <div key={model.id} className="rounded-md p-4 space-y-3" style={{ background: "var(--gray-alpha-100)" }}>
                                    {/* Model Toggle */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: model.enabled ? "var(--green-700)" : "var(--gray-alpha-400)" }}></div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <input
                                                    type="text"
                                                    value={model.displayName}
                                                    onChange={(e) => updateModelField(model.id, 'displayName', e.target.value)}
                                                    className="w-full text-sm font-medium text-[var(--ds-text)] placeholder:text-[var(--ds-text-muted)] bg-transparent border-b border-transparent hover:border-[var(--ds-border-strong)] focus:border-[var(--blue-700)] focus:outline-none transition-colors px-0.5"
                                                    placeholder="Nombre para mostrar"
                                                />
                                                <input
                                                    type="text"
                                                    value={model.name}
                                                    onChange={(e) => updateModelField(model.id, 'name', e.target.value)}
                                                    className="w-full text-xs text-[var(--ds-text-muted)] placeholder:text-[var(--ds-text-muted)] font-mono bg-transparent border-b border-transparent hover:border-[var(--ds-border-strong)] focus:border-[var(--blue-700)] focus:outline-none transition-colors px-0.5"
                                                    placeholder="id-tecnico-del-modelo"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <Switch
                                                id={`model-${model.id}`}
                                                checked={model.enabled}
                                                onChange={(enabled) => updateModelEnabled(model.id, enabled)}
                                                size="md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveModel(model.id, model.displayName)}
                                                className="text-[var(--ds-text-muted)] hover:text-[var(--red-700)] transition-colors"
                                                title="Eliminar modelo"
                                            >
                                                <Trash2 size={18} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Methods Configuration */}
                                    {model.enabled && (
                                        <div className="ml-6 space-y-3 pl-4" style={{ borderLeft: "2px solid var(--green-400)" }}>
                                            <p className="text-xs font-medium mb-2" style={{ color: "var(--ds-text)" }}>Métodos disponibles:</p>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>Generate Content</span>
                                                    <p className="text-xs" style={{ color: "var(--ds-text-secondary)" }}>Crea contenido como texto, código, resúmenes o historias. Es lo que usas para pedirle a Gemini que escriba algo.</p>
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
                                                    <span className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>Embed Content</span>
                                                    <p className="text-xs" style={{ color: "var(--ds-text-secondary)" }}>Crea vectores numéricos (embeddings) a partir de texto. Esto es para que una computadora entienda el significado de tus palabras y pueda hacer cosas como buscar información relacionada o comparar documentos.</p>
                                                </div>
                                                <Switch
                                                    id={`${model.id}-embedContent`}
                                                    checked={model.methods.embedContent}
                                                    onChange={(enabled) => updateModelMethod(model.id, 'embedContent', enabled)}
                                                    size="md"
                                                />
                                            </div>

                                            {/* URLs Preview */}
                                            <div className="mt-3 p-3 rounded-md" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                                                <p className="text-sm font-medium mb-2" style={{ color: "var(--ds-text)" }}>URL generada:</p>
                                                {model.methods.generateContent && (
                                                    <p className="text-sm font-mono p-2 rounded break-all" style={{ color: "var(--green-900)", background: "var(--green-100)" }}>
                                                        https://generativelanguage.googleapis.com/v1beta/models/{model.name}:generateContent
                                                    </p>
                                                )}
                                                {model.methods.embedContent && (
                                                    <p className="text-sm font-mono p-2 rounded break-all" style={{ color: "var(--blue-900)", background: "var(--blue-100)" }}>
                                                        https://generativelanguage.googleapis.com/v1beta/models/{model.name}:embedContent
                                                    </p>
                                                )}
                                                {!model.methods.generateContent && !model.methods.embedContent && (
                                                    <p className="text-sm font-mono p-2 rounded break-all" style={{ color: "var(--ds-text-secondary)", background: "var(--gray-alpha-100)" }}>
                                                        https://generativelanguage.googleapis.com/v1beta/models/{model.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add new model */}
                        <div className="rounded-md p-4 space-y-3" style={{ border: "1px dashed var(--ds-border-strong)" }}>
                            <p className="text-xs font-medium" style={{ color: "var(--ds-text)" }}>Agregar nuevo modelo</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={newModelName}
                                    onChange={(e) => setNewModelName(e.target.value)}
                                    placeholder="ID técnico (ej. gemini-3.5-flash)"
                                    className="flex-1 h-9 px-3 text-sm rounded-md placeholder:text-[var(--ds-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-700)] transition-colors"
                                    style={{ background: "var(--ds-card)", color: "var(--ds-text)", border: "1px solid var(--ds-border)" }}
                                />
                                <input
                                    type="text"
                                    value={newModelDisplayName}
                                    onChange={(e) => setNewModelDisplayName(e.target.value)}
                                    placeholder="Nombre para mostrar (opcional)"
                                    className="flex-1 h-9 px-3 text-sm rounded-md placeholder:text-[var(--ds-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-700)] transition-colors"
                                    style={{ background: "var(--ds-card)", color: "var(--ds-text)", border: "1px solid var(--ds-border)" }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddModel}
                                    className="flex h-9 items-center justify-center gap-1.5 px-4 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] flex-shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                                    style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                                >
                                    <Plus size={16} strokeWidth={1.5} />
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="rounded-md p-4" style={{ background: "var(--blue-100)", border: "1px solid var(--blue-400)" }}>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5" style={{ color: "var(--blue-900)" }}>
                                <Info size={18} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium mb-1" style={{ color: "var(--blue-900)" }}>Información importante</h4>
                                <ul className="text-sm space-y-1" style={{ color: "var(--blue-900)" }}>
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
                    <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--ds-border)" }}>
                        <div className="flex items-center gap-2">
                            {showSaved && (
                                <span className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--green-900)" }}>
                                    <CircleCheck size={16} strokeWidth={1.75} />
                                    ¡Configuración guardada!
                                </span>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2 flex items-center gap-2"
                            style={{ color: "var(--primary-contrast-fg)" }}
                        >
                            {isLoading ? <>Guardando...</> : <>Guardar Configuración</>}
                        </button>
                    </div>
                </form>
            </div>
    )
}