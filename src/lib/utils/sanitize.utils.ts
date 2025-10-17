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
            // Tags de formato básico
            'b', 'i', 'u', 'strong', 'em', 'mark', 'small', 'del', 'ins', 'sub', 'sup',
            'strike', 's', 'font',
            // Tags de estructura
            'span', 'code', 'br', 'p', 'div', 'pre',
            // Tags de lista
            'ul', 'ol', 'li',
            // Tags de encabezado
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            // Enlaces (para issue badges)
            'a',
            // Otros
            'blockquote', 'hr'
        ],
        ALLOWED_ATTR: [
            'style', 
            'class', 
            'color',  // Para <font color="">
            'face',   // Para <font face="">
            'size',   // Para <font size="">
            'contenteditable',  // Para issue badges no editables
            'href',   // Para enlaces de issues
            'target', // Para abrir en nueva pestaña
            'rel'     // Para seguridad de enlaces (noopener noreferrer)
        ],
        ALLOWED_STYLES: {
            '*': {
                // Colores
                'color': [/.*/],
                'background-color': [/.*/],
                'background': [/.*/],
                
                // Decoración de texto
                'text-decoration': [/.*/],
                'text-decoration-line': [/.*/],
                'text-decoration-color': [/.*/],
                'text-decoration-style': [/.*/],
                
                // Fuente
                'font-weight': [/.*/],
                'font-style': [/.*/],
                'font-family': [/.*/],
                'font-size': [/.*/],
                
                // Espaciado
                'padding': [/.*/],
                'margin': [/.*/],
                'line-height': [/.*/],
                
                // Display
                'display': [/.*/],
                'white-space': [/.*/],
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
