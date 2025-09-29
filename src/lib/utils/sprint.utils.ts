import { SprintProps } from '@/lib/types/types'

/**
 * Función para ordenar sprints con la siguiente prioridad:
 * 1. Sprint activo siempre primero
 * 2. Resto de sprints ordenados por fecha de inicio (más reciente primero)
 * 3. Backlog (id === 'null') siempre al final
 */
export const sortSprints = (sprints: SprintProps[]): SprintProps[] => {
  return sprints.sort((a, b) => {
    // El Backlog (id === 'null') siempre va al final
    if (a.id === 'null') return 1
    if (b.id === 'null') return -1
    
    // El sprint activo va primero
    if (a.active && !b.active) return -1
    if (!a.active && b.active) return 1
    
    // Si ambos están activos o inactivos, ordenar por fecha de inicio (más reciente primero)
    if (a.startDate && b.startDate) {
      const dateA = new Date(a.startDate).getTime()
      const dateB = new Date(b.startDate).getTime()
      return dateB - dateA // Orden descendente (más reciente primero)
    }
    
    // Si solo uno tiene fecha de inicio, ese va primero
    if (a.startDate && !b.startDate) return -1
    if (!a.startDate && b.startDate) return 1
    
    // Como fallback, ordenar por ID o title
    if (a.id && b.id) {
      return a.id.toString().localeCompare(b.id.toString())
    }
    
    return a.title.localeCompare(b.title)
  })
}
