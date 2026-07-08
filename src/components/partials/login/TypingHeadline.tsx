"use client"

import { useEffect, useState } from "react"

// Beneficios ("pros") de La Muralla que se escriben uno a uno.
const MESSAGES = [
    "Organiza tu trabajo en tableros.",
    "Planifica sprints sin esfuerzo.",
    "Sigue cada tarea en tiempo real.",
    "Colabora con todo tu equipo.",
    "Visualiza el progreso al instante.",
    "Prioriza lo que de verdad importa.",
    "Crea tareas con ayuda de la IA.",
    "Mide el rendimiento con auditorías.",
    "Entrega tus proyectos a tiempo.",
    "Construye en orden. Crece sin límites.",
]

const TYPE_MS = 45      // velocidad de escritura por caracter
const DELETE_MS = 22    // velocidad de borrado por caracter
const HOLD_MS = 3000    // tiempo que permanece visible cada mensaje

export default function TypingHeadline() {
    const [index, setIndex] = useState(0)
    const [text, setText] = useState("")
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        const full = MESSAGES[index]
        let timeout: ReturnType<typeof setTimeout>

        if (!deleting) {
            if (text.length < full.length) {
                timeout = setTimeout(() => setText(full.slice(0, text.length + 1)), TYPE_MS)
            } else {
                timeout = setTimeout(() => setDeleting(true), HOLD_MS)
            }
        } else {
            if (text.length > 0) {
                timeout = setTimeout(() => setText(full.slice(0, text.length - 1)), DELETE_MS)
            } else {
                timeout = setTimeout(() => {
                    setDeleting(false)
                    setIndex((i) => (i + 1) % MESSAGES.length)
                }, 250)
            }
        }

        return () => clearTimeout(timeout)
    }, [text, deleting, index])

    return (
        <h1
            aria-label="Beneficios de La Muralla"
            style={{
                fontSize: 52,
                lineHeight: "54px",
                letterSpacing: "-2.4px",
                fontWeight: 600,
                margin: "0 0 20px",
            }}
        >
            {text}
            <span className="lm-caret" aria-hidden style={{ color: "var(--blue-600)", fontWeight: 400 }}>|</span>
        </h1>
    )
}
