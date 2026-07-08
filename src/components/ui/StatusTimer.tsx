'use client'

import { useStatusTimer } from '@/lib/hooks/useStatusTimer'
import { Clock } from 'lucide-react'

interface StatusTimerProps {
   lastStatusUpdate?: string
   variant?: 'card' | 'detail'
}

/**
 * Componente que muestra un cronómetro en tiempo real indicando
 * cuánto tiempo lleva una issue en su estado actual.
 *
 * - variant="card": pill compacto (2 unidades más significativas) para kanban cards
 * - variant="detail": texto completo con todas las unidades para el panel de detalles
 */
export default function StatusTimer({ lastStatusUpdate, variant = 'detail' }: StatusTimerProps) {
   const { formatted } = useStatusTimer(lastStatusUpdate)

   if (!lastStatusUpdate) {
      return <span className="text-sm font-medium" style={{ color: "var(--ds-text-muted)" }}>—</span>
   }

   if (variant === 'card') {
      return (
         <div
            className="flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5"
            style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-secondary)" }}
            title={`Tiempo en estado actual: ${formatted}`}
         >
            <Clock size={12} strokeWidth={1.5} />
            <span className="whitespace-nowrap text-[11px] font-medium tabular-nums">
               {formatted}
            </span>
         </div>
      )
   }

   // variant "detail"
   return (
      <span
         className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium"
         style={{ color: "var(--ds-text)" }}
         title="Tiempo en estado actual (en tiempo real)"
      >
         <span className="relative flex h-1.5 w-1.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "var(--green-600)" }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "var(--green-700)" }} />
         </span>
         <span className="tabular-nums">{formatted}</span>
      </span>
   )
}
