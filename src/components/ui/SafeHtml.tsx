'use client'

import { sanitizeHtml } from '@/lib/utils/sanitize.utils'

interface SafeHtmlProps {
    html: string
    className?: string
}

/**
 * Componente que renderiza HTML sanitizado de forma segura
 * Previene ataques XSS mientras mantiene el formato del texto
 */
export default function SafeHtml({ html, className = '' }: SafeHtmlProps) {
    const sanitizedHtml = sanitizeHtml(html)

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    )
}
