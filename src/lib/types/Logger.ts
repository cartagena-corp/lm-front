type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogData {
    [key: string]: unknown
}

/**
 * Clase Logger para manejar logs de forma segura en diferentes entornos.
 * 
 * **Comportamiento por entorno:**
 * - 🟢 **Desarrollo**: Logs completos en consola con stack traces
 * - 🔴 **Producción**: Solo errores sanitizados en consola, resto silenciado
 * 
 * **Sanitización automática:**
 * - Redacta tokens JWT, passwords y campos sensibles
 * - Oculta stack traces en producción
 * - Formato consistente con timestamps
 * 
 * @example
 * ```typescript
 * import { logger } from '@/lib/types/Logger'
 * 
 * // Información general
 * logger.info('Usuario autenticado', { userId: '123', role: 'admin' })
 * 
 * // Debug (solo desarrollo)
 * logger.debug('Estado del store', { authState: store.getState() })
 * 
 * // Advertencias
 * logger.warn('Token próximo a expirar', { expiresIn: '5 minutes' })
 * 
 * // Errores críticos
 * logger.error('Fallo en autenticación', new Error('Token inválido'), { 
 *   endpoint: '/api/auth/login' 
 * })
 * ```
 */

class Logger {
    private isDevelopment: boolean = process.env.NODE_ENV === 'development'
    private isProduction = process.env.NODE_ENV === 'production'

    /**
     * Sanitiza datos sensibles antes del logging.
     * Redacta tokens JWT, passwords y otros campos críticos.
     * 
     * @private
     * @param data - Cualquier tipo de dato a sanitizar
     * @returns Datos sanitizados con campos sensibles redactados
     */
    private sanitizeData(data: any): any {
        if (typeof data === "string") {
            return data
                .replace(/Bearer [A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, 'Bearer [REDACTED]')
                .replace(/token=[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, 'token=[REDACTED]')
                .replace(/accessToken["':\s]+["']?[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, 'accessToken: [REDACTED]')
        }

        if (typeof data === 'object' && data !== null) {
            const sanitized = { ...data }
            const sensitiveFields = ['token', 'accessToken', 'refreshToken', 'password', 'authorization']

            sensitiveFields.forEach(field => {
                if (sanitized[field]) {
                    sanitized[field] = '[REDACTED]'
                }
            })
            return sanitized
        }
        return data
    }

    /**
     * Formatea el mensaje de log con timestamp y nivel.
     * 
     * @private
     * @param level - Nivel del log (debug, info, warn, error)
     * @param message - Mensaje principal del log
     * @param data - Datos adicionales opcionales
     * @returns String formateado para logging
     */
    private formatMessage(level: LogLevel, message: string, data?: LogData): string {
        const timestamp = new Date().toISOString()
        const sanitizedData = data ? this.sanitizeData(data) : ''
        return `[${timestamp}] ${level.toUpperCase()}: ${message} ${sanitizedData ? JSON.stringify(sanitizedData) : ''}`
    }

    /**
     * Registra información general de la aplicación.
     * 
     * **Desarrollo:** ✅ Muestra en consola con `console.log()`
     * **Producción:** ❌ Silenciado (futuro: servicio externo)
     * 
     * @param message - Mensaje descriptivo de la información
     * @param data - Datos adicionales opcionales (serán sanitizados)
     * 
     * @example
     * ```typescript
     * // ✅ Desarrollo: [2024-01-15T10:30:00.000Z] INFO: Usuario autenticado {"userId":"123","role":"admin"}
     * // ❌ Producción: (silenciado)
     * logger.info('Usuario autenticado', { userId: '123', role: 'admin' })
     * 
     * // ✅ Desarrollo: [2024-01-15T10:30:00.000Z] INFO: Sesión inicializada {"accessToken":"[REDACTED]"}
     * // ❌ Producción: (silenciado)
     * logger.info('Sesión inicializada', { accessToken: 'eyJhbGci...' })
     * ```
     */
    info(message: string, data?: LogData) {
        if (this.isDevelopment) console.log(this.formatMessage('info', message, data))

        // TODO: Pa cuando se use el servicio para logs en producción, se implementa aqui. TIPO INFO
        // * if (this.isProduction) this.sendToExternalService('info', message, data)
    }

    /**
     * Registra advertencias no críticas que requieren atención.
     * 
     * **Desarrollo:** ✅ Muestra en consola con `console.warn()`
     * **Producción:** ❌ Silenciado (futuro: servicio externo)
     * 
     * @param message - Mensaje descriptivo de la advertencia
     * @param data - Datos adicionales opcionales (serán sanitizados)
     * 
     * @example
     * ```typescript
     * // ✅ Desarrollo: [2024-01-15T10:30:00.000Z] WARN: Token próximo a expirar {"expiresIn":"5 minutes"}
     * // ❌ Producción: (silenciado)
     * logger.warn('Token próximo a expirar', { expiresIn: '5 minutes' })
     * 
     * // ✅ Desarrollo: [2024-01-15T10:30:00.000Z] WARN: API lenta {"responseTime":"5000ms","endpoint":"/api/users"}
     * // ❌ Producción: (silenciado)
     * logger.warn('API lenta', { responseTime: '5000ms', endpoint: '/api/users' })
     * ```
     */
    warn(message: string, data?: LogData) {
        if (this.isDevelopment) console.warn(this.formatMessage('warn', message, data))

        // TODO: Pa cuando se use el servicio para logs en producción, se implementa aqui. TIPO WARN
        // * if (this.isProduction) this.sendToExternalService('warn', message, data)
    }

    /**
     * Registra errores críticos que requieren atención inmediata.
     * 
     * **Desarrollo:** ✅ Muestra en consola con `console.error()` + stack trace completo
     * **Producción:** ✅ Muestra en consola SANITIZADO sin stack trace (futuro: servicio externo)
     * 
     * @param message - Mensaje descriptivo del error
     * @param error - Objeto Error o cualquier tipo de error
     * @param data - Datos adicionales opcionales (serán sanitizados)
     * 
     * @example
     * ```typescript
     * // ✅ Desarrollo: [2024-01-15T10:30:00.000Z] ERROR: Fallo en autenticación {"endpoint":"/api/auth","error":{"message":"Token inválido","stack":"Error: Token inválido\n    at..."}}
     * // ✅ Producción: [2024-01-15T10:30:00.000Z] ERROR: Fallo en autenticación {"endpoint":"/api/auth","error":{"message":"Token inválido"}}
     * logger.error('Fallo en autenticación', new Error('Token inválido'), { 
     *   endpoint: '/api/auth' 
     * })
     * 
     * // ✅ Desarrollo: [2024-01-15T10:30:00.000Z] ERROR: Error de conexión {"url":"https://api.example.com","error":"Network timeout"}
     * // ✅ Producción: [2024-01-15T10:30:00.000Z] ERROR: Error de conexión {"url":"https://api.example.com","error":"Network timeout"}
     * logger.error('Error de conexión', 'Network timeout', { 
     *   url: 'https://api.example.com' 
     * })
     * ```
     */
    error(message: string, error?: Error | any, data?: LogData) {
        const errorData = {
            ...data, error: error instanceof Error ? {
                message: error.message,
                stack: this.isDevelopment ? error.stack : undefined
            } : error
        }

        if (this.isDevelopment) console.error(this.formatMessage('error', message, errorData))

        if (this.isProduction) {
            console.error(this.formatMessage('error', message, this.sanitizeData(errorData)))

            // TODO: Pa cuando se use el servicio para logs en producción, se implementa aqui. TIPO ERROR
            // * this.sendToExternalService('error', message, errorData)
        }
    }

    /**
     * Registra información detallada para debugging y desarrollo.
     * 
     * **Desarrollo:** ✅ Muestra en consola con `console.debug()`
     * **Producción:** ❌ Completamente silenciado
     * 
     * @param message - Mensaje descriptivo del debug
     * @param data - Datos adicionales opcionales (serán sanitizados)
     * 
     * @example
     * ```typescript
     * // ✅ Desarrollo: [2024-01-15T10:30:00.000Z] DEBUG: Estado del store {"authState":{"isAuthenticated":true,"user":"[REDACTED]"}}
     * // ❌ Producción: (completamente silenciado)
     * logger.debug('Estado del store', { authState: store.getState() })
     * 
     * // ✅ Desarrollo: [2024-01-15T10:30:00.000Z] DEBUG: Respuesta de API {"status":200,"headers":{"content-type":"application/json"}}
     * // ❌ Producción: (completamente silenciado)
     * logger.debug('Respuesta de API', { 
     *   status: response.status, 
     *   headers: response.headers 
     * })
     * ```
     */
    debug(message: string, data?: LogData) {
        if (this.isDevelopment) console.debug(this.formatMessage('debug', message, data))
    }
}

export const logger = new Logger()