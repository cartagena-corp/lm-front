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

/**
 * Verifica si un usuario tiene un permiso específico
 * @param user - El usuario a verificar (puede ser null o undefined)
 * @param permissionName - El nombre del permiso a verificar
 * @returns true si el usuario tiene el permiso, false en caso contrario
 */
export function hasPermission(user: UserProps | null | undefined, permissionName: string): boolean {
   if (!user || !user.role) return false
   
   // Si el rol es un string, no podemos verificar permisos
   if (typeof user.role === 'string') return false
   
   // Verificar si el usuario tiene el permiso
   return user.role.permissions.some(permission => permission.name === permissionName)
}

/**
 * Verifica si un usuario tiene alguno de los permisos especificados
 * @param user - El usuario a verificar (puede ser null o undefined)
 * @param permissionNames - Array de nombres de permisos a verificar
 * @returns true si el usuario tiene al menos uno de los permisos, false en caso contrario
 */
export function hasAnyPermission(user: UserProps | null | undefined, permissionNames: string[]): boolean {
   if (!user || !user.role) return false
   
   // Si el rol es un string, no podemos verificar permisos
   if (typeof user.role === 'string') return false
   
   // Verificar si el usuario tiene alguno de los permisos
   return permissionNames.some(permissionName => 
      user.role && typeof user.role !== 'string' && 
      user.role.permissions.some(permission => permission.name === permissionName)
   )
}

/**
 * Verifica si un usuario tiene todos los permisos especificados
 * @param user - El usuario a verificar (puede ser null o undefined)
 * @param permissionNames - Array de nombres de permisos a verificar
 * @returns true si el usuario tiene todos los permisos, false en caso contrario
 */
export function hasAllPermissions(user: UserProps | null | undefined, permissionNames: string[]): boolean {
   if (!user || !user.role) return false
   
   // Si el rol es un string, no podemos verificar permisos
   if (typeof user.role === 'string') return false
   
   // Verificar si el usuario tiene todos los permisos
   return permissionNames.every(permissionName => 
      user.role && typeof user.role !== 'string' && 
      user.role.permissions.some(permission => permission.name === permissionName)
   )
}
