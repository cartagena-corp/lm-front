import { useAuthStore } from '@/lib/store/AuthStore'

const DEFAULT_TIMEOUT_MS = 15_000

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number): Promise<Response> {
   const controller = new AbortController()
   const timer = setTimeout(() => controller.abort(), timeoutMs)
   try {
      return await fetch(input, { ...init, signal: controller.signal })
   } finally {
      clearTimeout(timer)
   }
}

/**
 * fetch autenticado centralizado para todos los stores.
 *
 * - Agrega el header Authorization a partir del `token` recibido.
 * - Aplica timeout (AbortController) para no dejar el loading colgado si el backend no responde.
 * - Si el backend responde 401 (token rechazado pese a parecer vigente localmente: revocado,
 *   reloj desincronizado, etc.), intenta refrescar una sola vez (refreshToken ya es idempotente/
 *   deduplicado a nivel de AuthStore) y reintenta la petición original con el token nuevo.
 *
 * El `token` se sigue recibiendo por parámetro (igual que antes) para no romper la firma pública
 * de las acciones de cada store; internamente ya no hace falta armar el header a mano.
 */
export async function authFetch(
   input: string,
   token: string,
   init: RequestInit = {},
   timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
   const headers = new Headers(init.headers)
   if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

   const response = await fetchWithTimeout(input, { ...init, headers }, timeoutMs)

   if (response.status !== 401) return response

   const refreshedToken = await useAuthStore.getState().refreshToken()
   if (!refreshedToken) return response

   const retryHeaders = new Headers(init.headers)
   retryHeaders.set('Authorization', `Bearer ${refreshedToken}`)
   return fetchWithTimeout(input, { ...init, headers: retryHeaders }, timeoutMs)
}
