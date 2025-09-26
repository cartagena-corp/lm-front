import { useRef, useEffect } from 'react'

import type { TextareaHTMLAttributes } from 'react'

type Props = {
   value: string
   onChange: (value: string) => void
   className?: string
   rows?: number
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange' | 'className'>

const AutoResizeTextarea = ({ value, onChange, className = '', rows = 1, ...rest }: Props) => {
   const textareaRef = useRef<HTMLTextAreaElement>(null)

   useEffect(() => {
      const textarea = textareaRef.current
      if (textarea) {
         textarea.style.height = 'auto'

         const scrollHeight = textarea.scrollHeight
         const maxHeight = 112 // Tailwind's h-28 = 7rem = 112px

         textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
         textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`
      }
   }, [value])

   return (
      <textarea
         ref={textareaRef}
         className={`w-full border border-black/15 rounded-md p-2 resize-none outline-none transition-all duration-150 max-h-28 overflow-y-auto ${className}`}
         value={value}
         rows={rows}
         onChange={(e) => onChange(e.target.value)}
         {...rest}
      />
   )
}

export default AutoResizeTextarea
