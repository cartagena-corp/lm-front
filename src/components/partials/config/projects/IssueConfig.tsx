import IssuePriorities from "../issues/IssuePriorities"
import IssueStatuses from "../issues/IssueStatuses"
import IssueTypes from "../issues/IssueTypes"
import IssueDescriptions from "../issues/IssueDescriptions"
import { useState } from "react"
import { CustomSwitch, valueProps } from "@/components/ui/CustomSwitch"

interface IssueConfigProps {
   projectId: string
}

const ISSUE_TABS: valueProps[] = [
   { id: 1, name: "Estados", view: () => <></> },
   { id: 2, name: "Tipos", view: () => <></> },
   { id: 3, name: "Prioridades", view: () => <></> },
   { id: 4, name: "Descripciones", view: () => <></> },
]

export default function IssueConfig({ projectId }: IssueConfigProps) {
   const [activeTab, setActiveTab] = useState<valueProps>(ISSUE_TABS[0])

   return (
      <div className="mt-6">
         <CustomSwitch tabs={ISSUE_TABS} value={activeTab} onChange={setActiveTab} />

         {activeTab.id === 1 ? (
            <IssueStatuses projectId={projectId} onClose={() => {}} />
         ) : activeTab.id === 2 ? (
            <IssueTypes projectId={projectId} onClose={() => {}} />
         ) : activeTab.id === 3 ? (
            <IssuePriorities projectId={projectId} onClose={() => {}} />
         ) : (
            <IssueDescriptions projectId={projectId} onClose={() => {}} />
         )}
      </div>
   )
}
