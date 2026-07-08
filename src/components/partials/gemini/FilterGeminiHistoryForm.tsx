"use client"

import { FormEvent, useState } from 'react'
import { useGeminiStore } from '@/lib/store/GeminiStore'
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect'

export interface GeminiHistoryFiltersValue {
    feature: string
    projectId: string
    userEmail: string
}

interface FilterGeminiHistoryFormProps {
    onSubmit: (data: GeminiHistoryFiltersValue) => void
    onCancel: () => void
    initialFilters: GeminiHistoryFiltersValue
}

const FEATURE_LABELS: Record<string, string> = {
    chat: 'Chat con IA',
    'detect-issues': 'Detectar Issues',
}

export default function FilterGeminiHistoryForm({ onSubmit, onCancel, initialFilters }: FilterGeminiHistoryFormProps) {
    const { historyFilters } = useGeminiStore()
    const [formData, setFormData] = useState<GeminiHistoryFiltersValue>(initialFilters)

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    const featureOptions: SelectOption[] = (historyFilters?.features || []).map((feature) => ({
        value: feature,
        label: FEATURE_LABELS[feature] || feature,
    }))

    const projectOptions: SelectOption[] = (historyFilters?.projectIds || []).map((project) => ({
        value: project.id,
        label: project.name,
    }))

    const emailOptions: SelectOption[] = (historyFilters?.emails || []).map((email) => ({
        value: email,
        label: email,
    }))

    const labelCls = "block text-[13px] font-medium mb-1.5"

    return (
        <div>
            <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-5">
                    <div>
                        <label className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                            Funcionalidad
                        </label>
                        <CustomSelect
                            value={formData.feature || null}
                            onChange={(value) => setFormData(prev => ({ ...prev, feature: (value as string) || '' }))}
                            options={featureOptions}
                            placeholder="Todas las funcionalidades"
                        />
                    </div>

                    <div>
                        <label className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                            Proyecto
                        </label>
                        <CustomSelect
                            value={formData.projectId || null}
                            onChange={(value) => setFormData(prev => ({ ...prev, projectId: (value as string) || '' }))}
                            options={projectOptions}
                            placeholder="Todos los proyectos"
                        />
                    </div>

                    <div>
                        <label className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
                            Usuario
                        </label>
                        <CustomSelect
                            value={formData.userEmail || null}
                            onChange={(value) => setFormData(prev => ({ ...prev, userEmail: (value as string) || '' }))}
                            options={emailOptions}
                            placeholder="Todos los usuarios"
                            variant="user"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                        style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
                        type="button"
                        onClick={() => onCancel()}>
                        Cancelar
                    </button>
                    <button
                        className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                        style={{ color: "var(--primary-contrast-fg)" }}
                        type="submit">
                        Aplicar filtros
                    </button>
                </div>
            </form>
        </div>
    )
}
