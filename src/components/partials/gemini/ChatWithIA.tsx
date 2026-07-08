import { Send, Paperclip, Sparkles, Copy, CircleCheck, FileText, RefreshCw, FileSearch, ScanSearch, Calculator, FileCheck } from "lucide-react"
import AutoResizeTextarea from "@/components/ui/AutoResizeTextarea"
import { useEffect, useRef, useState } from "react"
import { useGeminiStore } from "@/lib/store/GeminiStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { toast } from "react-hot-toast"

// System prompt: analista jurídico experto en seguros de cumplimiento.
const SYSTEM_PROMPT = `Actúa como un analista jurídico experto en seguros de cumplimiento. Tu objetivo es leer y analizar documentos legales (contratos, resoluciones y adiciones) para extraer los datos, calcular valores/fechas y redactar los textos exactos para la expedición de pólizas.

Los documentos provienen de múltiples entidades. Debes ser tolerante a errores de lectura óptica (OCR) y enfocarte en el contexto.

Tus tareas y reglas estrictas son las siguientes:

1. CLASIFICACIÓN DEL DOCUMENTO (Ruta Lógica):
Analiza los documentos adjuntos y determina si se trata de un "Contrato Nuevo" (Contrato principal, Resolución, Orden de Servicio) o de una "Adición" (Otrosí, Modificatorio).
Aplica el formato de salida correspondiente según esta clasificación.

2. REGLAS PARA CONTRATOS NUEVOS:
Si el documento es un contrato nuevo o resolución, debes extraer y calcular lo siguiente:
- Asegurado / Beneficiario: Entidad que contrata o emite la resolución.
- Afianzado / Contratista: Persona o empresa que ejecutará el objeto.
- Valores y Plazos Base: Valor total del contrato y plazo de ejecución estipulado.
- Búsqueda de Garantías (CRÍTICO): Busca en el texto la cláusula de "Garantías", "Pólizas" o "Requisitos de perfeccionamiento".
- Suma Asegurada: Identifica el porcentaje exigido para el amparo de Cumplimiento (ej. 10%, 20%, 30%). Multiplica el Valor Total del contrato por este porcentaje para obtener la Suma Asegurada.
- Vigencia Desde: Fecha de firma del contrato o resolución, o fecha de inicio indicada.
- Vigencia Hasta: Identifica el tiempo adicional exigido para la póliza (ej. "plazo de ejecución y 4 meses más"). Suma este tiempo adicional a la fecha de terminación del contrato para calcular la fecha exacta de "Vigencia Hasta".
- Texto del Objeto: Debes redactar el objeto de la garantía adaptando estrictamente esta plantilla: "EL OBJETO DE LA PRESENTE POLIZA ES GARANTIZAR EL PAGO DE LOS PERJUICIOS DERIVADOS DEL INCUMPLIMIENTO DE LAS OBLIGACIONES A CARGO DEL CONTRATISTA DERIVADAS DE [TIPO DE DOCUMENTO, ej. LA RESOLUCIÓN / EL CONTRATO] NÚMERO [NÚMERO] DE [AÑO] CELEBRADO ENTRE LAS PARTES RELACIONADO CON [OBJETO DEL CONTRATO O PROPUESTA]."

3. REGLAS PARA ADICIONES (OTROSÍ):
Si el documento es una adición:
- Extrae el Valor Inicial, el Valor de la Adición y calcula el Valor Total.
- Extrae el Plazo Inicial, el Plazo Adicional y calcula el Plazo Total.
- Alerta de Objeto: Verifica si el objeto original fue modificado sustancialmente. Si cambia el alcance, agrega: "⚠️ ALERTA RIESGO DE SUSCRIPCIÓN: La adición modifica el alcance del contrato original. Revisión manual."

4. FORMATO DE SALIDA ESTRICTO:
Tu respuesta debe ser en texto plano, sin negritas ni tablas, ideal para WhatsApp o copiar al sistema. IMPORTANTE: Usa SOLO UNO de los siguientes formatos dependiendo de lo que hayas identificado en el paso 1. Ignora el formato que no aplique.

--- INICIO DEL FORMATO PARA CONTRATOS NUEVOS ---

RESUMEN DE DATOS - PÓLIZA NUEVA

🏢 Asegurado / Beneficiario: [Nombre Entidad] - NIT: [NIT si está disponible]

👷 Afianzado / Contratista: [Nombre] - [Documento/NIT]

📄 Documento: [Tipo y Número] del [Fecha]

💰 DATOS DE LA GARANTÍA (CUMPLIMIENTO):

Exigencia de la entidad: [Porcentaje exigido, ej. 10%] del valor total.

Suma Asegurada: $[Valor calculado]

Vigencia Desde: [Fecha inicio]

Vigencia Hasta: [Fecha calculada según exigencia, ej. 25/02/2026] (Fórmula: Plazo + [X] meses)

🎯 OBJETO PARA EMISIÓN:

[Inserta aquí el Texto del Objeto redactado según la regla 2]

--- FIN DEL FORMATO PARA CONTRATOS NUEVOS ---

--- INICIO DEL FORMATO PARA ADICIONES ---

ACLARACIONES PARA ANEXO

SEGUN [TIPO DE ADICIÓN], DEL [FECHA DEL OTROSÍ] AL CONTRATO [NÚMERO PRINCIPAL], SE MODIFICA LA DURACION DEL CONTRATO, EL PLAZO DE EJECUCION DEL CONTRATO SERA DE [PLAZO TOTAL]. SE ADICIONA AL VALOR DEL CONTRATO LA SUMA DE: $[VALOR DE LA ADICION], SE MODIFICA LA FORMA DE PAGO, LAS OBLIGACIONES ESPECIFICAS DEL CONTRATISTA, Y SE MODIFICAN LAS SANCIONES POR INCUMPLIMIENTO Y LA CLAUSULA PENAL, SEGUN LO ESTABLECIDO EN EL [TIPO DE ADICIÓN].

RESUMEN DE DATOS - ADICIÓN

📄 Tipo de Documento: Adición / Otrosí

🔢 Contrato Principal: [Número] (Modificado por: [Número de Adición])

🏢 Contratante: [Nombre] - NIT: [NIT]

👷 Contratista: [Nombre] - NIT: [NIT]

🎯 Objeto: [Texto del objeto]

💰 VALORES:

Inicial: $[Valor]

Adición: $[Valor]

Total: $[Valor]

⏱️ PLAZOS:

Inicial: [Tiempo]

Adicional: [Tiempo]

Total: [Tiempo]

--- FIN DEL FORMATO PARA ADICIONES ---`

const DEFAULT_INSTRUCTION = "Analiza los documentos adjuntos y genera el resumen para la expedición de la póliza según tus reglas y el formato de salida estricto."

// Capacidades mostradas en el estado inicial (sin análisis todavía).
const CAPABILITIES = [
    { icon: FileSearch, bg: "var(--blue-100)", fg: "var(--blue-900)", title: "Clasifica el documento", desc: "Distingue entre Contrato Nuevo (contrato, resolución, orden) y Adición (otrosí, modificatorio)." },
    { icon: ScanSearch, bg: "var(--purple-100)", fg: "var(--purple-900)", title: "Extrae los datos clave", desc: "Asegurado, afianzado, garantías exigidas, valores y plazos, tolerante a errores de OCR." },
    { icon: Calculator, bg: "var(--amber-100)", fg: "var(--amber-900)", title: "Calcula valores y vigencias", desc: "Suma asegurada según el porcentaje y la fecha exacta de vigencia hasta." },
    { icon: FileCheck, bg: "var(--green-100)", fg: "var(--green-900)", title: "Redacta y deja listo para copiar", desc: "Texto del objeto y resumen en texto plano, ideal para WhatsApp o el sistema." },
]

interface Message {
    text: string
    isUser: boolean
    role: string
    files?: { name: string }[]
}

// Renderiza el análisis en texto plano, resaltando las líneas de alerta de riesgo.
function renderAnalysisText(text: string) {
    const lines = text.split(/\r?\n/)
    const blocks: JSX.Element[] = []
    let buffer: string[] = []

    const flush = (key: string) => {
        if (buffer.length === 0) return
        blocks.push(
            <p key={key} className="whitespace-pre-wrap break-words text-sm leading-relaxed" style={{ color: "var(--ds-text)" }}>
                {buffer.join("\n")}
            </p>
        )
        buffer = []
    }

    lines.forEach((line, idx) => {
        const trimmed = line.trim()
        if (trimmed.startsWith("⚠️")) {
            flush(`p-${idx}`)
            blocks.push(
                <div
                    key={`alert-${idx}`}
                    className="whitespace-pre-wrap break-words rounded-md px-3 py-2 text-sm font-medium"
                    style={{ background: "var(--amber-100)", color: "var(--amber-900)", borderLeft: "3px solid var(--amber-700)" }}
                >
                    {trimmed}
                </div>
            )
        } else {
            buffer.push(line)
        }
    })
    flush("p-end")

    return <div className="flex flex-col gap-2">{blocks}</div>
}

export default function ChatWithIA() {
    const [isDragActive, setIsDragActive] = useState(false)
    const [dragCounter, setDragCounter] = useState(0) // Contador para manejar drag events anidados
    const [files, setFiles] = useState<File[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [inputText, setInputText] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    const { chatWithGemini } = useGeminiStore()
    const { getValidAccessToken } = useAuthStore()

    const scrollRef = useRef<HTMLDivElement>(null)

    // Autoscroll al final cuando llegan nuevos mensajes o cambia el estado de procesamiento.
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }, [messages, isProcessing])

    const removeFile = (indexToRemove: number) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove))
    }

    const addFiles = (incoming: File[]) => {
        if (incoming.length === 0) return
        setFiles(prev => [...prev, ...incoming])
        toast.success(`${incoming.length} documento(s) adjuntado(s).`)
    }

    const resetAnalysis = () => {
        if (isProcessing) return
        setMessages([])
        setFiles([])
        setInputText("")
        setCopiedIndex(null)
    }

    const handleCopy = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedIndex(index)
            toast.success("Resultado copiado al portapapeles.")
            setTimeout(() => setCopiedIndex(prev => (prev === index ? null : prev)), 2000)
        } catch {
            toast.error("No se pudo copiar. Copia el texto manualmente.")
        }
    }

    const handleSubmit = async () => {
        if ((!inputText.trim() && files.length === 0) || isProcessing) return
        setIsProcessing(true)

        const hasFiles = files.length > 0
        // Si solo hay archivos sin instrucción, usar la instrucción por defecto.
        const userMessage = inputText.trim() || DEFAULT_INSTRUCTION

        const newUserMessage: Message = {
            text: inputText.trim(),
            isUser: true,
            role: "user",
            files: hasFiles ? files.map(f => ({ name: f.name })) : undefined,
        }
        setMessages(prev => [...prev, newUserMessage])

        try {
            const token = await getValidAccessToken()
            if (!token) throw new Error("No se pudo obtener el token de autenticación")

            const formattedMessages = [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages.map(msg => ({ role: msg.role, content: msg.text || DEFAULT_INSTRUCTION })),
                { role: "user", content: userMessage },
            ]

            const response = await chatWithGemini(token, formattedMessages, hasFiles ? files : undefined)
            const iaText = typeof response === "string" ? response : response?.text || "Análisis no disponible."

            setMessages(prev => [...prev, { text: iaText, isUser: false, role: "assistant" }])
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Hubo un error al procesar el documento.")
            setMessages(prev => [...prev, {
                text: "Lo siento, hubo un error al analizar el documento. Intenta de nuevo o recarga la página para empezar un nuevo análisis.",
                isUser: false,
                role: "assistant",
            }])
        } finally {
            setIsProcessing(false)
            setInputText("")
            setFiles([])
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)
        setDragCounter(0)
        if (isProcessing) return
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(Array.from(e.dataTransfer.files))
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragCounter(prev => prev + 1)
        if (!isProcessing) setIsDragActive(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragCounter(prev => {
            const newCounter = prev - 1
            if (newCounter <= 0) {
                setIsDragActive(false)
                return 0
            }
            return newCounter
        })
    }

    const hasMessages = messages.length > 0

    return (
        <div
            className="flex flex-col relative overflow-hidden h-full transition-colors"
            style={{
                background: "var(--ds-background)",
                border: isDragActive ? "2px dashed var(--blue-700)" : "2px solid transparent",
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            {isDragActive && (
                <div
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
                    style={{ background: "color-mix(in srgb, var(--blue-100) 92%, transparent)" }}
                >
                    <span className="mb-4" style={{ color: "var(--blue-700)" }}>
                        <Paperclip size={48} strokeWidth={2} />
                    </span>
                    <span className="text-lg font-semibold" style={{ color: "var(--blue-900)" }}>Suelta aquí los documentos a analizar</span>
                </div>
            )}

            {/* Barra superior: título de la página + acción de reinicio */}
            <div className="flex flex-shrink-0 flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between" >
                <div>
                    <h1 className="font-semibold" style={{ fontSize: 28, letterSpacing: "-1.1px", color: "var(--ds-text)", margin: "0 0 4px" }}>Analista de Pólizas</h1>
                    <p style={{ fontSize: 14, color: "var(--ds-text-secondary)", margin: 0 }}>
                        Analiza contratos, resoluciones y otrosí, y genera el resumen listo para la expedición de la póliza
                    </p>
                </div>
                {hasMessages && (
                    <button
                        onClick={resetAnalysis}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-[7px] transition-colors text-sm font-medium hover:bg-[var(--gray-alpha-100)] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        style={{ height: 36, padding: "0 12px", color: "var(--ds-text)", background: "var(--ds-background)", border: "1px solid var(--ds-border-strong)", borderRadius: "var(--radius-md)" }}
                        type="button"
                    >
                        <RefreshCw size={15} strokeWidth={2} />
                        Nuevo análisis
                    </button>
                )}
            </div>

            {/* Contenido */}
            <section ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {!hasMessages ? (
                    // Estado inicial: presentación del experto y capacidades.
                    <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center py-10 text-center">
                        <span className="mb-5 flex h-20 w-20 items-center justify-center" style={{ borderRadius: "var(--radius-xl)", background: "var(--blue-200)", color: "var(--blue-900)" }}>
                            <Sparkles size={40} strokeWidth={1.5} />
                        </span>
                        <h2 className="text-3xl font-semibold" style={{ color: "var(--ds-text)", letterSpacing: "-0.03em" }}>¿Qué documento vamos a analizar?</h2>
                        <p className="mt-3 max-w-2xl text-base leading-relaxed" style={{ color: "var(--ds-text-secondary)" }}>
                            Adjunta o pega el contrato, resolución u otrosí y me encargo de clasificarlo, extraer los datos,
                            calcular valores y vigencias, y redactar el texto listo para la expedición de la póliza.
                        </p>

                        <div className="mt-10 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-2">
                            {CAPABILITIES.map(cap => {
                                const Icon = cap.icon
                                return (
                                    <div key={cap.title} className="flex gap-3.5 rounded-md p-5" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md" style={{ background: cap.bg, color: cap.fg }}>
                                            <Icon size={19} strokeWidth={1.5} />
                                        </span>
                                        <div>
                                            <h3 className="text-sm font-semibold" style={{ color: "var(--ds-text)" }}>{cap.title}</h3>
                                            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--ds-text-secondary)" }}>{cap.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <p className="mt-10 text-xs" style={{ color: "var(--ds-text-muted)" }}>
                            Adjunta el documento (PDF, Word, imagen o texto) o pega su contenido abajo y presiona <span className="font-medium" style={{ color: "var(--ds-text-secondary)" }}>Analizar</span>.
                        </p>
                    </div>
                ) : (
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                        {messages.map((message, index) => (
                        message.isUser ? (
                            // Solicitud del usuario: documentos e instrucciones enviadas.
                            <div key={index} className="flex justify-end">
                                <div className="flex max-w-[85%] flex-col items-end gap-2">
                                    {message.files && message.files.length > 0 && (
                                        <div className="flex flex-wrap justify-end gap-1.5">
                                            {message.files.map((file, fileIndex) => (
                                                <span
                                                    key={fileIndex}
                                                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium"
                                                    style={{ background: "var(--blue-100)", color: "var(--blue-900)", boxShadow: "0 0 0 1px var(--blue-400)" }}
                                                >
                                                    <FileText size={13} strokeWidth={1.75} />
                                                    {file.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {message.text && (
                                        <div
                                            className="whitespace-pre-wrap break-words rounded-md px-4 py-2.5 text-sm"
                                            style={{ background: "var(--gray-alpha-200)", color: "var(--ds-text)" }}
                                        >
                                            {message.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Resultado del análisis: tarjeta con encabezado y botón de copiar.
                            <div key={index} className="rounded-md" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                                <div className="flex items-center justify-between gap-3 px-4 py-2.5" style={{ borderBottom: "1px solid var(--ds-border)" }}>
                                    <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--ds-text)" }}>
                                        <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: "var(--blue-200)", color: "var(--blue-900)" }}>
                                            <Sparkles size={15} strokeWidth={1.75} />
                                        </span>
                                        Resultado del análisis
                                    </div>
                                    <button
                                        onClick={() => handleCopy(message.text, index)}
                                        type="button"
                                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2
                                            ${copiedIndex === index ? "" : "hover:bg-[var(--gray-alpha-100)]"}`}
                                        style={copiedIndex === index
                                            ? { background: "var(--green-100)", color: "var(--green-900)", boxShadow: "0 0 0 1px var(--green-400)" }
                                            : { color: "var(--ds-text-secondary)", boxShadow: "var(--shadow-border)" }}
                                    >
                                        {copiedIndex === index ? (
                                            <>
                                                <CircleCheck size={14} strokeWidth={2} />
                                                Copiado
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} strokeWidth={1.75} />
                                                Copiar
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="p-4">
                                    {renderAnalysisText(message.text)}
                                </div>
                            </div>
                        )
                        ))}

                        {/* Loader mientras se procesa el análisis */}
                        {isProcessing && (
                            <div className="rounded-md" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                                <div className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium" style={{ color: "var(--ds-text)", borderBottom: "1px solid var(--ds-border)" }}>
                                    <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: "var(--blue-200)", color: "var(--blue-900)" }}>
                                        <Sparkles size={15} strokeWidth={1.75} />
                                    </span>
                                    Analizando documentos…
                                </div>
                                <div className="flex items-center gap-1.5 p-4">
                                    <span className="inline-block h-2 w-2 animate-bounce rounded-full" style={{ background: "var(--ds-text-muted)", animationDelay: "0ms" }}></span>
                                    <span className="inline-block h-2 w-2 animate-bounce rounded-full" style={{ background: "var(--ds-text-muted)", animationDelay: "200ms" }}></span>
                                    <span className="inline-block h-2 w-2 animate-bounce rounded-full" style={{ background: "var(--ds-text-muted)", animationDelay: "400ms" }}></span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Zona de carga e instrucciones */}
            <div className="flex-shrink-0 p-6 pb-0" style={{ borderTop: "1px solid var(--ds-border)" }}>
                <div className="mx-auto flex w-full max-w-4xl flex-col items-stretch gap-2">
                    {files.length > 0 && !isProcessing && (
                        <div className="flex flex-wrap gap-2 rounded-md p-2" style={{ background: "var(--gray-alpha-100)" }}>
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs" style={{ background: "var(--ds-card)", color: "var(--ds-text-secondary)", boxShadow: "var(--shadow-border)" }}>
                                    <FileText size={14} strokeWidth={1.75} />
                                    <span className="max-w-[220px] truncate" title={file.name}>{file.name}</span>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="font-medium text-[var(--red-700)] hover:text-[var(--red-900)] transition-colors"
                                        disabled={isProcessing}
                                        type="button"
                                        aria-label={`Quitar ${file.name}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <AutoResizeTextarea
                        className="w-full max-h-28! resize-none p-2.5 text-sm placeholder:text-[var(--ds-text-muted)] transition-all focus:ring-2 focus:ring-[var(--blue-700)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ background: "var(--ds-card)", color: "var(--ds-text)", border: "1px solid var(--ds-border)", borderRadius: "var(--radius-md)" }}
                        value={inputText}
                        onChange={setInputText}
                        placeholder="Pega aquí el contrato, resolución u otrosí, o adjúntalo. Puedes agregar instrucciones opcionales (ej. el porcentaje de garantía exigido)…"
                        onPaste={() => { }}
                        disabled={isProcessing}
                    />
                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <input
                                id="file-upload"
                                type="file"
                                accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        addFiles(Array.from(e.target.files))
                                        e.target.value = ""
                                    }
                                }}
                                disabled={isProcessing}
                            />
                            <label
                                htmlFor="file-upload"
                                className={`${isProcessing ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-[var(--gray-alpha-100)]"} flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-150`}
                                style={{ color: "var(--ds-text)", background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}
                            >
                                <Paperclip size={16} strokeWidth={2} />
                                Adjuntar documento
                            </label>
                        </div>

                        <button
                            className="flex h-9 items-center gap-2 rounded-md px-5 text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            style={{ color: "var(--primary-contrast-fg)" }}
                            onClick={handleSubmit}
                            type="button"
                            disabled={(!inputText.trim() && files.length === 0) || isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                    Analizando…
                                </>
                            ) : (
                                <>
                                    <Send size={16} strokeWidth={2} />
                                    Analizar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
