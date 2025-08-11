import { motion } from "motion/react"

/**
 * Props para el componente LoadingIndicator.
 */
interface LoadingIndicatorProps {
    /** Mensaje a mostrar junto al indicador de carga */
    message?: string
    /** Clases CSS personalizadas para el contenedor */
    className?: string
}

/**
 * Componente que muestra un indicador de carga animado con un mensaje opcional.
 * 
 * Este componente proporciona:
 * - Spinner animado con CSS puro (sin dependencias externas)
 * - Animaciones de entrada/salida con Motion
 * - Mensaje personalizable
 * - Estilos completamente personalizables
 * - Diseño accesible con colores contrastantes
 * 
 * El indicador usa un diseño consistente con el sistema de design:
 * - Fondo azul claro (bg-blue-50)
 * - Borde azul (border-blue-200)
 * - Texto azul (text-blue-600)
 * - Spinner azul con transparencia en el top para el efecto de rotación
 * 
 * @param props - Propiedades del componente
 * @returns Indicador de carga animado con mensaje
 * 
 * @example
 * ```tsx
 * // Uso básico
 * <LoadingIndicator />
 * 
 * // Con mensaje personalizado
 * <LoadingIndicator message="Guardando cambios..." />
 * 
 * // Con estilos personalizados
 * <LoadingIndicator 
 *   message="Procesando..." 
 *   className="p-4 bg-green-50 border-green-200" 
 * />
 * ```
 */
export default function LoadingIndicator({ 
    message = "Actualizando...", 
    className = "flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md" 
}: LoadingIndicatorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={className}
        >
            {/**
             * Spinner animado usando solo CSS.
             * 
             * La animación se logra con:
             * - border: Borde sólido en todos los lados
             * - border-t-transparent: Top transparente para crear el efecto de "carga"
             * - rounded-full: Forma circular
             * - animate-spin: Rotación continua (clase de Tailwind)
             * 
             * El color azul (border-blue-600) coincide con el texto para consistencia visual.
             */}
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            
            {/**
             * Mensaje de estado con estilo consistente.
             * 
             * Usa text-blue-600 para coincidir con el spinner y
             * text-sm font-medium para legibilidad sin ser demasiado prominente.
             */}
            <span className="text-blue-600 text-sm font-medium">{message}</span>
        </motion.div>
    )
}
