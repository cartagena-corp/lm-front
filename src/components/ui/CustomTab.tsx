"use client"

import { ReactNode, useId } from "react"
import { motion } from "motion/react"

export interface TabOption {
   view: React.ComponentType
   icon?: ReactNode
   name: string
   id: number
}

interface CustomTabProps {
   onChange: (value: TabOption) => void
   options: TabOption[]
   className?: string
   value: TabOption
}

export function CustomTab({ value, onChange, options, className = "" }: CustomTabProps) {
   const layoutId = useId()

   return (
      <div className={`p-1 rounded-xl inline-flex ${className}`}>
         <nav className="flex gap-1 relative" role="tablist" aria-label="Tabs">
            {options.map(tab => {
               const isActive = value.id === tab.id
               return (
                  <button
                     key={tab.id}
                     onClick={() => onChange(tab)}
                     id={`tab-${tab.id}`}
                     type="button"
                     role="tab"
                     aria-controls={`panel-${tab.id}`}
                     aria-selected={isActive}
                     className={`
                        relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                        flex items-center gap-2 z-10
                        ${isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}
                     `}
                  >
                     {isActive && (
                        <motion.div
                           layoutId={`active-tab-${layoutId}`}
                           className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200/50 -z-10"
                           transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                     )}

                     <span className="relative z-10 flex items-center gap-2">
                        {tab.icon && (
                           <span className={`transition-colors ${isActive ? "text-blue-600" : ""}`}>
                              {tab.icon}
                           </span>
                        )}
                        <span>{tab.name}</span>
                     </span>
                  </button>
               )
            })}
         </nav>
      </div>
   )
}
