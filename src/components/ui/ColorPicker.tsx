"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { computeDropdownPosition } from "@/lib/utils/dropdown.utils"

const COLOR_PICKER_MAX_HEIGHT = 280 // px, debe coincidir aprox. con el contenido del panel
const COLOR_PICKER_WIDTH = 256 // px, w-64

interface ColorPickerProps {
   inputRef: React.RefObject<HTMLInputElement>
   onChange: (color: string) => void
   label?: string
   value: string
   id: string
}

export function ColorPicker({ id, label, value = "#000000", inputRef, onChange }: ColorPickerProps) {
   const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
   const pickerRef = useRef<HTMLDivElement>(null)
   const panelRef = useRef<HTMLDivElement>(null)
   const colorInputRef = useRef<HTMLInputElement>(null)
   const textInputRef = useRef<HTMLInputElement>(null)
   const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
   const [mounted, setMounted] = useState(false)
   const [panelPosition, setPanelPosition] = useState<{ top?: number, bottom?: number, left: number, openUpward: boolean }>({ left: 0, openUpward: false })

   // Necesario para el portal del panel: document solo existe en el cliente
   useEffect(() => {
      setMounted(true)
   }, [])

   // El panel se porta a document.body para no quedar recortado por el overflow-y-auto
   // del contenido de la modal (Modal.tsx), que además rompe position:fixed al animar con
   // un transform en framer-motion. Si no cabe debajo antes del borde inferior del
   // viewport, se abre hacia arriba (ver dropdown.utils.ts)
   useEffect(() => {
      if (isColorPickerOpen && pickerRef.current) {
         const rect = pickerRef.current.getBoundingClientRect()
         const position = computeDropdownPosition(rect, { maxHeight: COLOR_PICKER_MAX_HEIGHT, gap: 4 })
         setPanelPosition({
            ...position,
            left: Math.min(position.left, window.innerWidth - COLOR_PICKER_WIDTH - 16)
         })
      }
   }, [isColorPickerOpen])

   useEffect(() => {
      if (!isColorPickerOpen) return
      const handleScroll = (event: Event) => {
         const target = event.target as Node
         if (panelRef.current?.contains(target)) return
         setIsColorPickerOpen(false)
      }
      window.addEventListener('scroll', handleScroll, true)
      return () => window.removeEventListener('scroll', handleScroll, true)
   }, [isColorPickerOpen])

   // Memoizar la función onChange para evitar re-renders innecesarios
   const debouncedOnChange = useCallback((newColor: string) => {
      // Cancelar cualquier timer de debounce pendiente
      if (debounceTimerRef.current) {
         clearTimeout(debounceTimerRef.current)
      }

      // Actualizar inmediatamente la UI del propio componente
      if (colorInputRef.current) {
         colorInputRef.current.value = newColor
      }
      if (textInputRef.current) {
         textInputRef.current.value = newColor
      }

      // Debounce antes de propagar el cambio al componente padre
      debounceTimerRef.current = setTimeout(() => {
         onChange(newColor)
      }, 10) // Un pequeño debounce para mejorar el rendimiento
   }, [onChange])

   // Solo actualizar el valor del inputRef cuando cambia value
   useEffect(() => {
      if (inputRef.current) {
         inputRef.current.value = value
      }

      // Sincronizar las referencias internas con el valor externo
      if (colorInputRef.current && colorInputRef.current.value !== value) {
         colorInputRef.current.value = value
      }
      if (textInputRef.current && textInputRef.current.value !== value) {
         textInputRef.current.value = value
      }
   }, [value, inputRef])

   // Cleanup del timer de debounce al desmontar
   useEffect(() => {
      return () => {
         if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
         }
      }
   }, [])

   // Manejar clicks fuera del color picker (trigger o panel portado) para cerrarlo
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         const target = event.target as Node
         if (pickerRef.current?.contains(target)) return
         if (panelRef.current?.contains(target)) return
         setIsColorPickerOpen(false)
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
         document.removeEventListener("mousedown", handleClickOutside)
      }
   }, [])

   // Optimizar el manejo de input de color para mejor rendimiento
   const handleInputColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = e.target.value
      debouncedOnChange(newColor)
   }

   // Manejar cambios en el input de texto
   const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = e.target.value
      debouncedOnChange(newColor)
   }

   // Manejar click en color preestablecido
   const handlePresetClick = (presetColor: string) => {
      debouncedOnChange(presetColor)
   }

   return (
      <div className="relative flex flex-col gap-1 text-sm" ref={pickerRef}>
         {label && <label htmlFor={id} className="font-semibold text-sm">{label}</label>}
         <button
            id={id}
            type="button"
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            className="cursor-pointer w-full justify-start text-left transition-colors duration-150 rounded-md py-2 px-4 focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
            style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
         >
            <span className="flex items-center gap-2">
               <div className="rounded-full h-5 w-5" style={{ backgroundColor: value, border: "1px solid var(--ds-border-strong)" }} />
               {value}
            </span>
         </button>

         {isColorPickerOpen && mounted && createPortal(
            <div
               ref={panelRef}
               className="fixed z-[9999] p-4 w-64 rounded-md"
               style={{
                  ...(panelPosition.openUpward ? { bottom: panelPosition.bottom } : { top: panelPosition.top }),
                  left: panelPosition.left,
                  background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)"
               }}
            >
               <div className="flex flex-col gap-2">
                  <div className="w-full h-10">
                     <input
                        ref={colorInputRef}
                        className="w-full h-full cursor-pointer"
                        onChange={handleInputColorChange}
                        defaultValue={value}
                        type="color"
                     />
                  </div>

                  <div className="flex gap-2">
                     <input
                        ref={textInputRef}
                        defaultValue={value}
                        onChange={handleTextInputChange}
                        className="rounded-md w-full py-1.5 px-4 text-sm outline-none transition-shadow duration-150 focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                        style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                        type="text"
                     />
                  </div>

                  <div className="grid grid-cols-8 gap-1 mt-2">
                     {["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"].map(
                        (presetColor) => (
                           <button
                              type="button"
                              key={presetColor}
                              className="w-6 h-6 rounded-full overflow-hidden cursor-pointer"
                              style={{ backgroundColor: presetColor, border: "1px solid var(--ds-border-strong)" }}
                              onClick={() => handlePresetClick(presetColor)}
                           />
                        ),
                     )}
                  </div>
               </div>
            </div>,
            document.body
         )}

         <input
            type="hidden"
            ref={inputRef}
            value={value}
            readOnly
         />
      </div>
   )
}
