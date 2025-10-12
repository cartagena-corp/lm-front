import IssuePriorities from "../issues/IssuePriorities"
import IssueStatuses from "../issues/IssueStatuses"
import IssueTypes from "../issues/IssueTypes"
import IssueDescriptions from "../issues/IssueDescriptions"
import { useState } from "react"
import { ConfigIcon } from "@/assets/Icon"

interface IssueConfigProps {
   projectId: string
}

const listView = [
   {
      id: 1,
      name: "Estados",
      view: IssueStatuses,
      icon: "🎯"
   },
   {
      id: 2,
      name: "Tipos",
      view: IssueTypes,
      icon: "📋"
   },
   {
      id: 3,
      name: "Prioridades",
      view: IssuePriorities,
      icon: "⚡"
   },
   {
      id: 4,
      name: "Descripciones",
      view: IssueDescriptions,
      icon: "📝"
   },
]

export default function IssueConfig({ projectId }: IssueConfigProps) {
   const [view, setView] = useState(listView[0])
   
   return (
      <div className="bg-white">
         {/* Header */}
         <div className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
               <div className="bg-purple-50 text-purple-600 rounded-lg p-2">
                  <ConfigIcon size={24} />
               </div>
               <div>
                  <h3 className="text-lg font-semibold text-gray-900">Configuración de Tareas</h3>
                  <p className="text-sm text-gray-500">Gestiona los estados, tipos y prioridades de las tareas</p>
               </div>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="border-b border-gray-200">
            <nav className="flex justify-between" aria-label="Tabs">
               {listView.map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setView(tab)}
                     className={`${
                        view.id === tab.id
                           ? 'border-purple-500 text-purple-600 bg-purple-50'
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                     } whitespace-nowrap w-full py-4 px-3 border-b-2 font-medium text-sm transition-all duration-200 flex justify-center items-center gap-2`}
                  >
                     <span className="text-base">{tab.icon}</span>
                     {tab.name}
                  </button>
               ))}
            </nav>
         </div>

         {/* Content */}
         <div className="p-6">
            <view.view projectId={projectId} onClose={() => {}} />
         </div>
      </div>
   )
}
