import { useState } from "react"
import SprintConfig from "@/components/partials/config/sprints/SprintConfig"
import IssueConfig from "./IssueConfig"
import UserProjectConfig from "./UserProjectConfig"
import { CustomSwitch, valueProps } from "@/components/ui/CustomSwitch"

interface ProjectConfigModalProps {
    onClose: () => void
    projectId: string
}

const CONFIG_TABS: valueProps[] = [
    { id: 1, name: "Sprints", view: () => <></> },
    { id: 2, name: "Tareas", view: () => <></> },
    { id: 3, name: "Usuarios", view: () => <></> },
]

export default function ProjectConfigModal({ onClose, projectId }: ProjectConfigModalProps) {
    const [activeTab, setActiveTab] = useState<valueProps>(CONFIG_TABS[0])

    return (
        <div className="px-6 py-5">
            <CustomSwitch tabs={CONFIG_TABS} value={activeTab} onChange={setActiveTab} />

            {activeTab.id === 1 ? (
                <SprintConfig projectId={projectId} />
            ) : activeTab.id === 2 ? (
                <IssueConfig projectId={projectId} />
            ) : (
                <UserProjectConfig projectId={projectId} />
            )}
        </div>
    )
}
