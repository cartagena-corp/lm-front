import { CheckIcon, ChevronRightIcon, LoaderIcon } from "@/assets/Icon"
import { ConfigProjectStatusProps } from "@/lib/types/types"
import { useId, useState, useEffect, useRef } from "react"

interface TextInputProps {
   variant?: 'blue' | 'gray' | 'red' | 'green' | 'purple'
   onChange: (data: string) => void
   placeholder?: string
   isRequired?: boolean
   fullWidth?: boolean
   maxLength?: number
   value: string
   label: string
   type?: string
}

export function TextInput({ label, onChange, value, isRequired = true, placeholder = "", variant = "blue", type = "text", maxLength, fullWidth = false }: TextInputProps) {
   const id = useId()
   const variants = {
      purple: "placeholder-black/40 border-black/15 focus:border-purple-600",
      green: "placeholder-black/40 border-black/15 focus:border-green-600",
      gray: "placeholder-black/40 border-black/15 focus:border-gray-600",
      blue: "placeholder-black/40 border-black/15 focus:border-blue-600",
      red: "placeholder-black/40 border-black/15 focus:border-red-600",
   }

   const getCounterColor = (_type: string) => {
      if (!maxLength) return ""
      const ratio = value.length / maxLength
      if (_type === "text") {
         if (ratio >= 4 / 5) return "text-red-500"
         if (ratio >= 3 / 5) return "text-orange-400"
         if (ratio >= 2 / 5) return "text-green-500"
         return "text-gray-400"
      }
      if (_type === "dot") {
         if (ratio >= 4 / 5) return "bg-red-500"
         if (ratio >= 3 / 5) return "bg-orange-400"
         if (ratio >= 2 / 5) return "bg-green-500"
         return "bg-gray-400"
      }
   }

   const handleChange = (newValue: string) => { if (maxLength && newValue.length > maxLength) { return } onChange(newValue) }

   return (
      <fieldset className={`flex flex-col ${fullWidth ? 'flex-1' : ''}`}>
         <legend className="flex justify-between items-center font-medium w-full">
            {label && <label htmlFor={id} className="text-sm">{label} {isRequired && <b className='text-red-500'>*</b>}</label>}
            {
               maxLength &&
               <hgroup className={`${getCounterColor("text")} flex items-center text-xs gap-1`}>
                  <div className={`${getCounterColor("dot")} rounded-full w-2 h-2`} />
                  {value.length}/{maxLength}
               </hgroup>
            }
         </legend>
         <input className={`${variants[variant]} bg-transparent outline-none text-xs border rounded w-full px-3 py-2`}
            name={id} id={id} type={type} autoComplete="off" required={isRequired} maxLength={maxLength}
            onChange={(e) => handleChange(e.target.value)} value={value} placeholder={placeholder}
         />
      </fieldset>
   )
}





interface DateInputProps {
   variant?: 'blue' | 'gray' | 'red' | 'green' | 'purple'
   onChange: (data: string) => void
   isRequired?: boolean
   fullWidth?: boolean
   value: string
   label: string
   min?: string
   max?: string
}

export function DateInput({ label, onChange, value, isRequired = true, variant = "blue", min, max, fullWidth = false }: DateInputProps) {
   const id = useId()
   const variants = {
      purple: "placeholder-black/40 border-black/15 focus:border-purple-600",
      green: "placeholder-black/40 border-black/15 focus:border-green-600",
      gray: "placeholder-black/40 border-black/15 focus:border-gray-600",
      blue: "placeholder-black/40 border-black/15 focus:border-blue-600",
      red: "placeholder-black/40 border-black/15 focus:border-red-600",
   }

   return (
      <fieldset className={`flex flex-col ${fullWidth ? 'flex-1' : ''}`}>
         <legend className="flex justify-between items-center font-medium w-full">
            {label && <label htmlFor={id} className="text-sm">{label} {isRequired && <b className='text-red-500'>*</b>}</label>}
         </legend>
         <input className={`${variants[variant]} bg-transparent outline-none text-xs border rounded w-full px-3 py-2`}
            value={value} onChange={(e) => onChange(e.target.value)} required={isRequired}
            name={id} id={id} type="date" autoComplete="off" min={min} max={max}
         />
      </fieldset>
   )
}





interface DataSelectProps {
   variant?: 'blue' | 'gray' | 'red' | 'green' | 'purple'
   onChange: (data: ConfigProjectStatusProps) => void
   value: ConfigProjectStatusProps | null
   options: ConfigProjectStatusProps[]
   placeholder?: string
   isRequired?: boolean
   fullWidth?: boolean
   label: string
}

export function DataSelect({ label, onChange, value, options, isRequired = true, variant = "blue", placeholder = "Seleccionar...", fullWidth = false }: DataSelectProps) {
   const selectRef = useRef<HTMLFieldSetElement>(null)
   const buttonRef = useRef<HTMLButtonElement>(null)
   const dropdownRef = useRef<HTMLDivElement>(null)
   const [isOpen, setIsOpen] = useState(false)
   const selectedOption = value
   const id = useId()

   const variants = {
      purple: "placeholder-black/40 border-black/15 focus:border-purple-600",
      green: "placeholder-black/40 border-black/15 focus:border-green-600",
      gray: "placeholder-black/40 border-black/15 focus:border-gray-600",
      blue: "placeholder-black/40 border-black/15 focus:border-blue-600",
      red: "placeholder-black/40 border-black/15 focus:border-red-600",
   }

   const optionVariants = {
      purple: "hover:bg-purple-50",
      green: "hover:bg-green-50",
      gray: "hover:bg-gray-50",
      blue: "hover:bg-blue-50",
      red: "hover:bg-red-50",
   }

   const optionSelectedVariants = {
      purple: "bg-purple-50 text-purple-600",
      green: "bg-green-50 text-green-600",
      gray: "bg-gray-50 text-gray-600",
      blue: "bg-blue-50 text-blue-600",
      red: "bg-red-50 text-red-600",
   }

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => { if (selectRef.current && !selectRef.current.contains(event.target as Node) && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false) }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [])

   const getDropdownStyle = () => {
      if (!buttonRef.current) return {}
      const rect = buttonRef.current.getBoundingClientRect()
      return { top: `${rect.bottom + window.scrollY + 5}px`, left: `${rect.left + window.scrollX}px`, width: `${rect.width}px` }
   }

   const handleSelect = (option: ConfigProjectStatusProps) => {
      onChange(option)
      setIsOpen(false)
   }

   return (
      <fieldset className={`flex flex-col ${fullWidth ? 'flex-1' : ''}`} ref={selectRef}>
         <legend className="flex justify-between items-center font-medium w-full">
            {label && <label htmlFor={id} className="text-sm">{label} {isRequired && <b className='text-red-500'>*</b>}</label>}
         </legend>

         <button className={`${variants[variant]} flex items-center justify-between transition-colors text-xs border rounded w-full px-3 py-2 gap-2`}
            onClick={() => setIsOpen(!isOpen)} id={id} type="button" ref={buttonRef}>
            <hgroup className="flex items-center gap-2 flex-1 text-left">
               {selectedOption ?
                  <><div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedOption.color }} /> {selectedOption.name}</>
                  : <span className="text-black/40">{placeholder}</span>
               }
            </hgroup>
            <span className={`${isOpen ? 'rotate-270' : 'rotate-90'} transition-transform`}>
               <ChevronRightIcon size={16} stroke={2} />
            </span>
         </button>

         {isOpen &&
            <section className="border-black/15 bg-white overflow-y-auto shadow-lg border rounded max-h-60 z-[9999] fixed"
               ref={dropdownRef} style={getDropdownStyle()}>
               {options.map((option) => {
                  const isSelected = value?.id === option.id
                  return (
                     <button className={`${isSelected ? optionSelectedVariants[variant] : optionVariants[variant]} flex items-center justify-between transition-colors text-xs w-full px-3 py-2 gap-2`}
                        onClick={() => handleSelect(option)} type="button" key={option.id}>
                        <hgroup className="flex items-center gap-2">
                           <span className="rounded-full w-2 h-2" style={{ backgroundColor: option.color }} /> {option.name}
                        </hgroup>
                        {isSelected && <span className={optionSelectedVariants[variant]}><CheckIcon size={16} /></span>}
                     </button>
                  )
               })}
            </section>
         }
      </fieldset>
   )
}





export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: 'blue' | 'gray' | 'red' | 'green' | 'purple' | 'blue_outline' | 'gray_outline' | 'red_outline' | 'green_outline' | 'purple_outline'
   children: React.ReactNode
   size?: 'sm' | 'md' | 'lg'
   isLoading?: boolean
   fullWidth?: boolean
}

export function Button({ children, onClick, disabled = false, fullWidth = false, isLoading = false, size = 'md', variant = 'blue', type = 'button', className, ...props }: ButtonProps) {
   const variants = {
      purple_outline: "bg-purple-50 hover:bg-purple-600 hover:text-purple-50 border-purple-600 disabled:bg-purple-300 disabled:border-purple-300 text-purple-600",
      green_outline: "bg-green-50 hover:bg-green-600 hover:text-green-50 border-green-600 disabled:bg-green-300 disabled:border-green-300 text-green-600",
      blue_outline: "bg-blue-50 hover:bg-blue-600 hover:text-blue-50 border-blue-600 disabled:bg-blue-300 disabled:border-blue-300 text-blue-600",
      gray_outline: "bg-gray-50 hover:bg-gray-900 hover:text-gray-50 border-gray-600 disabled:bg-gray-300 disabled:border-gray-300 text-gray-600",
      red_outline: "bg-red-50 hover:bg-red-600 hover:text-red-50 border-red-600 disabled:bg-red-300 disabled:border-red-300 text-red-600",
      purple: "bg-purple-600 border-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:border-purple-300 text-white",
      green: "bg-green-600 hover:bg-green-700 border-green-600 disabled:bg-green-300 disabled:border-green-300 text-white",
      blue: "bg-blue-600 hover:bg-blue-800 border-blue-600 disabled:bg-blue-300 disabled:border-blue-300 text-white",
      red: "bg-red-600 hover:bg-red-700 border-red-600 disabled:bg-red-300 disabled:border-red-300 text-white",
      gray: "bg-gray-200 border-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-700",
   }

   const sizes = {
      lg: "px-4 py-2.5 text-sm",
      md: "px-3 py-2 text-xs",
      sm: "px-2.5 py-1.5 text-xs",
   }

   const buttonClassName = className ? className : `
      ${variants[variant]}  ${sizes[size]}  ${fullWidth ? 'w-full' : ''} 
      transition-colors disabled:cursor-not-allowed disabled:opacity-60
      flex items-center justify-center gap-2 font-medium border rounded 
   `

   return (
      <button className={buttonClassName} disabled={disabled || isLoading} onClick={onClick} type={type} {...props}>
         {isLoading && <LoaderIcon />}
         {children}
      </button>
   )
}





interface CheckboxProps {
   variant?: 'blue' | 'gray' | 'red' | 'green' | 'purple'
   onChange: (checked: boolean) => void
   description?: string
   checked: boolean
   label: string
}

export function Checkbox({ label, description, checked, onChange, variant = "blue" }: CheckboxProps) {
   const id = useId()

   const variants = {
      purple: "text-purple-600 border-gray-300 focus:ring-purple-500 accent-purple-600",
      green: "text-green-600 border-gray-300 focus:ring-green-500 accent-green-600",
      blue: "text-blue-600 border-gray-300 focus:ring-blue-500 accent-blue-600",
      gray: "text-gray-600 border-gray-300 focus:ring-gray-500 accent-gray-600",
      red: "text-red-600 border-gray-300 focus:ring-red-500 accent-red-600",
   }

   const contentVariants = {
      purple: "bg-purple-50 border-purple-200",
      green: "bg-green-50 border-green-200",
      blue: "bg-blue-50 border-blue-200",
      gray: "bg-gray-50 border-gray-200",
      red: "bg-red-50 border-red-200",
   }

   const textVariants = {
      purple: "text-purple-600",
      green: "text-green-600",
      blue: "text-blue-600",
      gray: "text-gray-600",
      red: "text-red-600",
   }

   return (
      <fieldset className={`${contentVariants[variant]} flex items-center border rounded p-3 gap-3`}>
         <input className={`${variants[variant]} cursor-pointer w-4 h-4`}
            onChange={(e) => onChange(e.target.checked)} type="checkbox"
            checked={checked} name={id} id={id} />
         <article className="flex-1">
            <label htmlFor={id} className={`${textVariants[variant]} text-sm font-medium cursor-pointer`}>
               {label}
            </label>
            {description && <p className="text-gray-400 text-xs">{description}</p>}
         </article>
      </fieldset>
   )
}





interface ButtonWithOptionsProps {
   variant?: 'blue' | 'gray' | 'red' | 'green' | 'purple'
   children: React.ReactNode
   size?: 'sm' | 'md' | 'lg'
   className?: string
   disabled?: boolean
   options: Array<{
      textVariant?: 'blue' | 'gray' | 'red' | 'green' | 'purple' | 'black'
      icon?: React.ReactNode
      onClick: () => void
      id: string | number
      label: string
   }>
}

export function ButtonWithOptions({ children, options, disabled = false, size = 'md', variant = 'blue', className }: ButtonWithOptionsProps) {
   const buttonRef = useRef<HTMLButtonElement>(null)
   const dropdownRef = useRef<HTMLDivElement>(null)
   const [isOpen, setIsOpen] = useState(false)

   const variants = {
      purple: "bg-purple-600 border-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:border-purple-300 text-white",
      green: "bg-green-600 hover:bg-green-700 border-green-600 disabled:bg-green-300 disabled:border-green-300 text-white",
      blue: "bg-blue-600 hover:bg-blue-700 border-blue-600 disabled:bg-blue-300 disabled:border-blue-300 text-white",
      red: "bg-red-600 hover:bg-red-700 border-red-600 disabled:bg-red-300 disabled:border-red-300 text-white",
      gray: "bg-gray-200 border-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-700",
   }

   const sizes = {
      lg: "px-4 py-2.5 text-sm",
      md: "px-3 py-2 text-xs",
      sm: "px-2.5 py-1.5 text-xs",
   }

   const optionHoverVariants = {
      purple: "hover:bg-purple-50",
      green: "hover:bg-green-50",
      black: "hover:bg-gray-50",
      gray: "hover:bg-gray-50",
      blue: "hover:bg-blue-50",
      red: "hover:bg-red-50",
   }

   const textColorVariants = {
      purple: "text-purple-600",
      green: "text-green-600",
      black: "text-gray-900",
      blue: "text-blue-600",
      gray: "text-black",
      red: "text-red-600",
   }

   const defaultOptionVariant = {
      purple: "hover:bg-purple-50",
      green: "hover:bg-green-50",
      gray: "hover:bg-gray-50",
      blue: "hover:bg-blue-50",
      red: "hover:bg-red-50",
   }

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
            dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false)
         }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [])

   const getDropdownStyle = () => {
      if (!buttonRef.current) return {}
      const rect = buttonRef.current.getBoundingClientRect()
      return {
         top: `${rect.bottom + window.scrollY + 5}px`,
         right: `${window.innerWidth - rect.right - window.scrollX}px`
      }
   }

   const handleOptionClick = (option: ButtonWithOptionsProps['options'][0]) => {
      option.onClick()
      setIsOpen(false)
   }

   const buttonClassName = className ? className : `
      ${variants[variant]} ${sizes[size]}
      transition-colors disabled:cursor-not-allowed disabled:opacity-60
      flex items-center justify-center gap-2 font-medium border rounded 
   `

   return (
      <div className="relative">
         <button className={buttonClassName} disabled={disabled} onClick={() => setIsOpen(!isOpen)} type="button" ref={buttonRef}>
            {children}
         </button>

         {isOpen && (
            <section className="border-black/15 bg-white overflow-y-auto shadow-lg border rounded max-h-60 z-[9999] fixed" ref={dropdownRef} style={getDropdownStyle()}>
               {options.map((option) => {
                  const hoverClass = option.textVariant ? optionHoverVariants[option.textVariant] : defaultOptionVariant[variant]
                  const textClass = option.textVariant ? textColorVariants[option.textVariant] : ''

                  return (
                     <button className={`${hoverClass} ${textClass} flex items-center transition-colors text-xs px-3 py-2 gap-2 whitespace-nowrap w-full text-left`}
                        onClick={() => handleOptionClick(option)} type="button" key={option.id}>
                        {option.icon && <span className="flex-shrink-0">{option.icon}</span>} {option.label}
                     </button>
                  )
               })}
            </section>
         )}
      </div>
   )
}