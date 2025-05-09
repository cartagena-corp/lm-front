import IssuePriorities from "./IssuePriorities"
import IssueStatuses from "./IssueStatuses"
import IssueTypes from "./IssueTypes"
import { useState } from "react"

interface IssueConfigProps {
   projectId: string
   onClose: () => void
}

const listView = [
   {
      id: 1,
      name: "Estados",
      view: IssueStatuses
   },
   {
      id: 2,
      name: "Tipos",
      view: IssueTypes
   },
   {
      id: 3,
      name: "Prioridades",
      view: IssuePriorities
   },
]

export default function IssueConfig({ projectId, onClose }: IssueConfigProps) {
   const [view, setView] = useState(listView[0])
   return (
      <main className="flex flex-col gap-2 pt-4 pb-14">
         <section className="bg-black/10 flex justify-between text-sm rounded-md gap-2 p-1.5">
            {
               listView.map(lv =>
                  <button key={lv.id} className={`${view.id === lv.id && "bg-white font-semibold"} duration-150 select-none text-center rounded-md w-full py-1.5`}
                     onClick={() => setView(lv)}>
                     {lv.name}
                  </button>
               )
            }
         </section>

         <view.view projectId={projectId} onClose={onClose} />
      </main>
   )
}