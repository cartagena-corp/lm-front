"use client"

import { useState, useEffect, useRef, useCallback } from "react"

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
   const colorInputRef = useRef<HTMLInputElement>(null)
   const textInputRef = useRef<HTMLInputElement>(null)
   const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

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

   // Manejar clicks fuera del color picker para cerrarlo
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
            setIsColorPickerOpen(false)
         }
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
            className="border-black/15 cursor-pointer w-full justify-start text-left duration-200 border rounded-md py-2 px-4"
         >
            <span className="flex items-center gap-2">
               <div className="border-black/15 rounded-full border h-5 w-5" style={{ backgroundColor: value }} />
               {value}
            </span>
         </button>

         {isColorPickerOpen && (
            <div className="bg-white border-black/15 border absolute top-16 left-0 p-4 w-64 rounded-md shadow-lg">
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
                        className="border-black/15 rounded-md border w-full py-1.5 px-4"
                        type="text"
                     />
                  </div>

                  <div className="grid grid-cols-8 gap-1 mt-2">
                     {["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"].map(
                        (presetColor) => (
                           <button
                              type="button"
                              key={presetColor}
                              className="border-black/15 w-6 h-6 rounded-full border overflow-hidden cursor-pointer"
                              style={{ backgroundColor: presetColor }}
                              onClick={() => handlePresetClick(presetColor)}
                           />
                        ),
                     )}
                  </div>
               </div>
            </div>
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