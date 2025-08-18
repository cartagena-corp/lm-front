"use client"

import { AuditIcon, IAIcon, KeyIcon } from "@/assets/Icon"
import GeminiKeyManager from "@/components/partials/gemini/GeminiKeyManager"
import GeminiUseHistory from "@/components/partials/gemini/GeminiUseHistory"
import { useState } from "react"

const listView = [
    {
        id: 1,
        name: "Gestion de API Keys",
        icon: KeyIcon,
        description: "Gestiona los estados de tus proyectos"
    },
    {
        id: 2,
        name: "Historial de Uso",
        icon: AuditIcon,
        description: "Gestiona los usuarios de la plataforma y sus permisos"
    },
]


export default function GeminiConfig() {
    const [view, setView] = useState(listView[0])
    return (
        <div className=" mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-xl">
                        <IAIcon size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Panel de Configuración de Gemini</h1>
                        <p className="text-gray-600 mt-1">Gestiona las API Key y revisa su historial de uso</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
                <nav className="flex space-x-2">
                    {listView.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setView(tab)}
                                className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${view.id === tab.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="hidden sm:inline">{tab.name}</span>
                                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {/* Current View Description */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${view.id === 1 ? 'bg-blue-50 text-blue-600' :
                            view.id === 2 ? 'bg-green-50 text-green-600' :
                                'bg-purple-50 text-purple-600'
                            }`}>
                            <view.icon size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{view.name}</h2>
                            <p className="text-sm text-gray-600">{view.description}</p>
                        </div>
                    </div>
                </div>

                {/* Dynamic Content */}
                {view.id === 1 ? <GeminiKeyManager /> : <GeminiUseHistory />}
            </div>
        </div>
    )

}