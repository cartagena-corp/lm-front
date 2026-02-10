import { ConfigIcon, CalendarIcon, ListIcon, XIcon, UsersIcon } from "@/assets/Icon"
import SprintConfig from "@/components/partials/config/sprints/SprintConfig"
import UserProjectConfig from "./UserProjectConfig"
import IssueConfig from "./IssueConfig"
import { useState } from "react"

interface ProjectConfigModalProps {
    onClose: () => void
    projectId: string
}

const configTabs = [
    { id: 1, icon: CalendarIcon, name: "Configuración de Sprints", description: "Gestiona los estados de tus sprints",  },
    { id: 2, icon: ListIcon, name: "Configuración de Issues", description: "Gestiona tipos, prioridades y estados de issues" },
    { id: 3, icon: UsersIcon, name: "Configuración de Usuarios", description: "Gestiona los participantes del proyecto" },
]

export default function ProjectConfigModal({ onClose, projectId }: ProjectConfigModalProps) {
    const [activeTab, setActiveTab] = useState(configTabs[0])

    return (
        <div className="bg-white">
            <div className="bg-white p-2">
                <nav className="flex space-x-2">
                    {configTabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${activeTab.id === tab.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                <Icon size={18} />
                                <span className="hidden sm:inline">{tab.name}</span>
                                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>

            <div className="overflow-y-auto space-y-6">
                {activeTab.id === 1 ? (<SprintConfig projectId={projectId} />)
                    : activeTab.id === 2 ? (<IssueConfig projectId={projectId} />)
                        : (<UserProjectConfig projectId={projectId} />)}
            </div>
        </div>
    )
}
