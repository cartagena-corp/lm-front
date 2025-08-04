import type { InputProps } from '@/lib/types/ui'
import { useId } from 'react'

export default function Input({ label, icon: Icon, error, containerClassName, ...props }: InputProps) {
    const id = useId()

    return (
        <div className={`flex flex-col w-full gap-1.5 ${containerClassName || ''}`}>
            {label && <label htmlFor={id} className="text-background-text font-medium text-sm">{label}</label>}

            <div className="relative w-full">
                {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><Icon size={20} className="text-background-text/60" /></div>}
                <input id={id} {...props} aria-describedby={error ? `${id}-error` : undefined}
                    className={`border-button-secondary-border bg-button-secondary-background rounded-md text-sm border w-full pr-4 py-2 transition-colors outline-none
                            ${Icon ? "pl-10" : "pl-4"} ${error ? "border-red-500" : "focus:border-primary"} ${props.className || ''}`}
                />
            </div>

            {error && <p id={`${id}-error`} className="text-red-600 text-xs">{error}</p>}
        </div>
    )
}