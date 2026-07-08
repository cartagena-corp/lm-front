"use client"

export interface valueProps {
   id: number,
   name: string,
   shortName?: string,
   view: () => JSX.Element
}

interface TabSwitchProps {
   tabs: valueProps[]
   value: valueProps
   onChange: (value: valueProps) => void
   className?: string
}

export function CustomSwitch({ tabs, value, onChange, className = "" }: TabSwitchProps) {
   return (
      <div className={`border-[var(--ds-border)] relative ${className} mb-4`}>
         <div className="flex space-x-4">
            {
               tabs.map(tab =>
                  <button className={`cursor-pointer transition-colors duration-150 relative py-2.5 px-1 text-sm font-medium ${value.id === tab.id ? "text-[var(--blue-700)]" : "text-[var(--ds-text-muted)] hover:text-[var(--ds-text-secondary)]"}`}
                     key={tab.id} onClick={() => onChange(tab)}>
                     {tab.shortName ? (
                        <>
                           <span className="hidden sm:inline">{tab.name}</span>
                           <span className="sm:hidden">{tab.shortName}</span>
                        </>
                     ) : tab.name}
                     <div className={`transition-colors duration-150 absolute bottom-0 left-0 right-0 h-0.5 ${value.id === tab.id ? "bg-[var(--blue-700)]" : "bg-transparent"}`} />
                  </button>
               )
            }
         </div>
      </div>
   )
}
