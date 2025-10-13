import DOMPurify from 'dompurify'

/**
 * Sanitiza HTML para prevenir ataques XSS
 * Permite tags seguros de formato pero elimina scripts y contenido peligroso
 */
export const sanitizeHtml = (dirty: string): string => {
    if (typeof window === 'undefined') {
        // En el servidor, retornar texto plano
        return dirty.replace(/<[^>]*>/g, '')
    }

    // Configuración de DOMPurify para permitir solo tags de formato seguros
    const config = {
        ALLOWED_TAGS: [
            'b', 'i', 'u', 'strong', 'em', 'mark', 'small', 'del', 'ins', 'sub', 'sup',
            'span', 'code', 'br', 'p', 'div'
        ],
        ALLOWED_ATTR: ['style', 'class'],
        ALLOWED_STYLES: {
            '*': {
                'color': [/^#[0-9a-fA-F]{3,6}$/],
                'background-color': [/^#[0-9a-fA-F]{3,6}$/],
                'text-decoration': [/^(underline|line-through|none)$/],
                'font-weight': [/^(bold|normal|[1-9]00)$/],
                'font-style': [/^(italic|normal)$/],
            }
        },
        KEEP_CONTENT: true,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
    }

    return DOMPurify.sanitize(dirty, config)
}

/**
 * Convierte HTML a texto plano (sin tags)
 */
export const htmlToPlainText = (html: string): string => {
    if (typeof window === 'undefined') {
        return html.replace(/<[^>]*>/g, '')
    }

    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
}
