'use client'

import { useStatusTimer } from '@/lib/hooks/useStatusTimer'

interface StatusTimerProps {
   lastStatusUpdate?: string
   variant?: 'card' | 'detail'
}

/**
 * Componente que muestra un cronómetro en tiempo real indicando
 * cuánto tiempo lleva una issue en su estado actual.
 * 
 * - variant="card": compacto, solo 2 unidades más significativas (para kanban cards)
 * - variant="detail": completo con todas las unidades (para panel de detalles)
 */
export default function StatusTimer({ lastStatusUpdate, variant = 'detail' }: StatusTimerProps) {
   const { formatted, compactFormatted, totalSeconds } = useStatusTimer(lastStatusUpdate)

   if (!lastStatusUpdate) {
      return <span className="text-xs text-gray-400 italic">Sin datos</span>
   }

   const displayText = variant === 'card' ? compactFormatted : formatted

   // Color dinámico basado en el tiempo transcurrido
   const getTimerColor = () => {
      if (totalSeconds < 3600) return 'text-emerald-600'        // < 1 hora: verde
      if (totalSeconds < 86400) return 'text-blue-600'          // < 1 día: azul
      if (totalSeconds < 604800) return 'text-amber-600'        // < 1 semana: ámbar
      return 'text-red-500'                                      // >= 1 semana: rojo
   }

   if (variant === 'card') {
      return (
         <div className="flex items-center gap-1 flex-shrink-0" title="Tiempo en estado actual">
            {/* Ícono de reloj con animación de pulso */}
            <div className="relative flex-shrink-0">
               <svg
                  className={`w-3.5 h-3.5 ${getTimerColor()}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
               </svg>
               {/* Punto de pulso animado */}
               <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
               </span>
            </div>
            <span className={`text-[11px] font-mono font-medium tabular-nums ${getTimerColor()}`}>
               {displayText}
            </span>
         </div>
      )
   }

   // Variant "detail"
   return (
      <div className="flex items-center gap-2" title="Tiempo en estado actual (actualizándose en tiempo real)">
         {/* Ícono con animación */}
         <div className="relative">
            <svg
               className={`w-4 h-4 ${getTimerColor()}`}
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
               />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5">
               <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
               <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
         </div>
         <span className={`text-sm font-mono font-semibold tabular-nums ${getTimerColor()}`}>
            {displayText}
         </span>
      </div>
   )
}
