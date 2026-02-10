'use client'

import { useConfigStore } from '@/lib/store/ConfigStore'

interface BadgeProps {
   type?: 'status' | 'priority' | 'type' | 'projectStatus' | 'sprintStatus'
   className?: string
   color?: string
   name?: string
   id?: number
}

/**
 * Badge component that displays a styled badge with color and text
 * 
 * @param id - Optional ID to fetch the badge data from ConfigStore
 * @param name - Optional name to display directly
 * @param color - Optional color to use directly
 * @param type - Type of badge to determine which store data to use (required if using id)
 * @param className - Additional CSS classes
 * 
 * @example
 * // Direct usage with name and color
 * <Badge name="En progreso" color="#3B82F6" />
 * 
 * // Usage with ID (fetches from store)
 * <Badge id={1} type="status" />
 * 
 * // Usage with project status
 * <Badge id={2} type="projectStatus" />
 */
export default function Badge({ id, name, color, type, className = '' }: BadgeProps) {
   const { projectStatus, projectConfig } = useConfigStore()
   if (name && color) {
      return (
         <span className={`rounded-full text-xs font-medium px-2.5 py-1 whitespace-nowrap flex-shrink-0 ${className}`}
            style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}>
            {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}
         </span>
      )
   }

   if (id !== undefined && type) {
      let badgeData: { name: string; color: string } | undefined

      switch (type) {
         case 'status':
            badgeData = projectConfig?.issueStatuses?.find(item => item.id === id)
            break
         case 'priority':
            badgeData = projectConfig?.issuePriorities?.find(item => item.id === id)
            break
         case 'type':
            badgeData = projectConfig?.issueTypes?.find(item => item.id === id)
            break
         case 'projectStatus':
            badgeData = projectStatus?.find(item => item.id === id)
            break
         case 'sprintStatus':
            badgeData = projectConfig?.sprintStatuses?.find(item => item.id === id)
            break
         default:
            break
      }

      if (badgeData) {
         return (
            <span className={`rounded-full text-xs font-medium px-2.5 py-1 whitespace-nowrap flex-shrink-0 ${className}`}
               style={{ backgroundColor: `${badgeData.color}20`, color: badgeData.color, border: `1px solid ${badgeData.color}40` }}>
               {badgeData.name.charAt(0).toUpperCase() + badgeData.name.slice(1).toLowerCase()}
            </span>
         )
      }
   }

   return (
      <span className={`rounded-full text-xs font-medium px-2.5 py-1 whitespace-nowrap flex-shrink-0 ${className}`}
         style={{ backgroundColor: '#00000020', color: '#000000', border: '1px solid #00000040' }}>
         No asignado
      </span>
   )
}
