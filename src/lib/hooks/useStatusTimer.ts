'use client'

import { useState, useEffect, useCallback } from 'react'

interface TimerResult {
   formatted: string
   compactFormatted: string
   totalSeconds: number
}

/**
 * Hook que calcula y actualiza cada segundo el tiempo transcurrido
 * desde la última actualización de estado de una issue.
 * 
 * @param lastStatusUpdate - Fecha del último cambio de estado (formato yyyy/MM/ddThh:mm:ss)
 * @returns TimerResult con el tiempo formateado en diferentes variantes
 */
export function useStatusTimer(lastStatusUpdate?: string): TimerResult {
   const parseDate = useCallback((dateStr: string): Date => {
      // Soportar formato yyyy/MM/ddThh:mm:ss y también yyyy-MM-ddThh:mm:ss
      let normalized = dateStr.replace(/\//g, '-')
      // El backend envía la fecha en hora de Colombia (UTC-5, sin horario de verano).
      // Si la cadena no trae zona horaria, anclamos el offset de Colombia explícitamente
      // para que el cronómetro sea correcto sin importar la zona del navegador del cliente.
      const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(normalized)
      if (!hasTimezone) {
         normalized += '-05:00'
      }
      return new Date(normalized)
   }, [])

   const calculateElapsed = useCallback((): TimerResult => {
      if (!lastStatusUpdate) {
         return { formatted: 'Sin datos', compactFormatted: 'Sin datos', totalSeconds: 0 }
      }

      const start = parseDate(lastStatusUpdate)
      if (isNaN(start.getTime())) {
         return { formatted: 'Sin datos', compactFormatted: 'Sin datos', totalSeconds: 0 }
      }

      const now = new Date()
      const diffMs = now.getTime() - start.getTime()
      
      if (diffMs < 0) {
         return { formatted: '0s', compactFormatted: '0s', totalSeconds: 0 }
      }

      const totalSeconds = Math.floor(diffMs / 1000)
      const seconds = totalSeconds % 60
      const totalMinutes = Math.floor(totalSeconds / 60)
      const minutes = totalMinutes % 60
      const totalHours = Math.floor(totalMinutes / 60)
      const hours = totalHours % 24
      const totalDays = Math.floor(totalHours / 24)
      const days = totalDays % 7
      const totalWeeks = Math.floor(totalDays / 7)
      const weeks = totalWeeks % 52
      const years = Math.floor(totalWeeks / 52)

      // Formato completo (para el panel de detalles)
      const parts: string[] = []
      if (years > 0) parts.push(`${years}y`)
      if (weeks > 0 || years > 0) parts.push(`${weeks}w`)
      if (days > 0 || weeks > 0 || years > 0) parts.push(`${days}d`)
      if (hours > 0 || days > 0 || weeks > 0 || years > 0) parts.push(`${hours}h`)
      if (minutes > 0 || hours > 0 || days > 0 || weeks > 0 || years > 0) parts.push(`${minutes}m`)
      parts.push(`${seconds}s`)

      const formatted = parts.join(' : ')

      // Formato compacto (para las kanban cards) - solo las 2 unidades más significativas
      const compactParts: string[] = []
      if (years > 0) compactParts.push(`${years}y`, `${weeks}w`)
      else if (weeks > 0) compactParts.push(`${weeks}w`, `${days}d`)
      else if (days > 0) compactParts.push(`${days}d`, `${hours}h`)
      else if (hours > 0) compactParts.push(`${hours}h`, `${minutes}m`)
      else if (minutes > 0) compactParts.push(`${minutes}m`, `${seconds}s`)
      else compactParts.push(`${seconds}s`)

      const compactFormatted = compactParts.join(' : ')

      return { formatted, compactFormatted, totalSeconds }
   }, [lastStatusUpdate, parseDate])

   const [elapsed, setElapsed] = useState<TimerResult>(() => calculateElapsed())

   useEffect(() => {
      if (!lastStatusUpdate) return

      // Recalcular inmediatamente
      setElapsed(calculateElapsed())

      // Actualizar cada segundo
      const interval = setInterval(() => {
         setElapsed(calculateElapsed())
      }, 1000)

      return () => clearInterval(interval)
   }, [lastStatusUpdate, calculateElapsed])

   return elapsed
}
