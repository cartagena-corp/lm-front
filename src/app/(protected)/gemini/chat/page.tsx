"use client"

import { IAChatIcon } from "@/assets/Icon"
import ChatWithIA from "@/components/partials/gemini/ChatWithIA"

export default function GeminiChat() {
    return (
        <div className="flex h-full flex-col gap-6">
            {/* Header */}
            <div className="flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-xl text-white">
                        <IAChatIcon size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analista de Pólizas de Cumplimiento</h1>
                        <p className="text-gray-600 mt-1">Analiza contratos, resoluciones y otrosí para la expedición de pólizas: clasifica el documento, extrae los datos y calcula valores y vigencias.</p>
                    </div>
                </div>
            </div>

            {/* Chat */}
            <div className="flex-1 min-h-0">
                <ChatWithIA />
            </div>
        </div>
    )
}
