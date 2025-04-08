"use client"


interface TabSwitchProps {
   value: "Tablero" | "Diagrama de Gantt"
   onChange: (value: "Tablero" | "Diagrama de Gantt") => void
   className?: string
}

export function CustomSwitch({ value, onChange, className = "" }: TabSwitchProps) {
   const tabs = [
      { id: "Tablero", label: "Tablero" },
      { id: "Diagrama de Gantt", label: "Diagrama de Gantt" },
   ]

   return (
      <div className={`border-gray-200 relative ${className} mb-4`}>
         <div className="flex space-x-4">
            {
               tabs.map(tab =>
                  <button className={`duration-300 relative py-2.5 px-1 text-sm font-medium ${value === tab.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                     key={tab.id} onClick={() => onChange(tab.id as "Tablero" | "Diagrama de Gantt")}>
                     {tab.label}
                     <div className={`duration-300 absolute bottom-0 left-0 right-0 h-0.5 ${value === tab.id ? "bg-blue-600" : "bg-transparent"}`} />
                  </button>
               )
            }
         </div>
      </div>
   )
}
