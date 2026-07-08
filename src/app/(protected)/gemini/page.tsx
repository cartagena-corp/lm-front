"use client"

import GeminiKeyManager from "@/components/partials/gemini/GeminiKeyManager"
import GeminiUseHistory from "@/components/partials/gemini/GeminiUseHistory"
import { CustomSwitch, valueProps } from "@/components/ui/CustomSwitch"
import { useState } from "react"

const GEMINI_TABS: valueProps[] = [
    { id: 1, name: "Gestión de API Keys", shortName: "API Keys", view: () => <></> },
    { id: 2, name: "Historial de Uso", shortName: "Historial", view: () => <></> },
]

export default function GeminiConfig() {
    const [activeTab, setActiveTab] = useState<valueProps>(GEMINI_TABS[0])

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="font-semibold" style={{ fontSize: 28, letterSpacing: "-1.1px", color: "var(--ds-text)", margin: "0 0 4px" }}>Panel de Configuración de Gemini</h1>
                <p style={{ fontSize: 14, color: "var(--ds-text-secondary)", margin: 0 }}>Gestiona las API Key y revisa su historial de uso</p>
            </div>

            {/* Navigation Tabs */}
            <CustomSwitch tabs={GEMINI_TABS} value={activeTab} onChange={setActiveTab} />

            {/* Dynamic Content */}
            {activeTab.id === 1 ? <GeminiKeyManager /> : <GeminiUseHistory />}
        </div>
    )
}