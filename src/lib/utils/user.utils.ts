import { UserProps, RoleProps } from '@/lib/types/types'

/**
 * Obtiene el nombre del rol de un usuario, manejando tanto string como objeto RoleProps
 * @param user - El usuario del cual obtener el rol
 * @returns El nombre del rol o 'Sin rol' si no tiene
 */
export function getUserRoleName(user: UserProps): string {
   if (!user.role) return 'Sin rol'
   
   return typeof user.role === 'string' ? user.role : user.role.name
}
