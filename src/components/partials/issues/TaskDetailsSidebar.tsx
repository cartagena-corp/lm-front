'use client'

import { TaskProps } from '@/lib/types/types'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import StatusTimer from '@/components/ui/StatusTimer'

interface TaskDetailsSidebarProps {
   task: TaskProps
}

function Panel({ title, children }: { title: string, children: React.ReactNode }) {
   return (
      <div className="rounded-md p-3" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
         <h3 className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--ds-text-secondary)" }}>{title}</h3>
         <div>{children}</div>
      </div>
   )
}

function Row({ label, children }: { label: string, children: React.ReactNode }) {
   return (
      <div className="grid items-center gap-2 py-1" style={{ gridTemplateColumns: "84px 1fr" }}>
         <span className="text-xs truncate" style={{ color: "var(--ds-text-muted)" }}>{label}</span>
         {children}
      </div>
   )
}

function PersonInline({ user }: {
   user?: { firstName?: string | null, lastName?: string | null, email?: string | null, picture?: string | null } | string | null
}) {
   const isObject = typeof user === 'object' && user !== null
   const name = isObject
      ? (user.firstName || user.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : (user.email || 'Sin asignar'))
      : (user || 'No asignado')

   return (
      <div className="flex items-center gap-1.5 min-w-0" title={isObject ? user.email ?? undefined : undefined}>
         <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0" style={{ background: "var(--gray-alpha-200)" }}>
            {isObject && (
               <img
                  src={getUserAvatar({
                     picture: user.picture || undefined,
                     firstName: user.firstName || undefined,
                     lastName: user.lastName || undefined,
                     email: user.email || undefined
                  }, 20)}
                  alt=""
                  className="w-full h-full object-cover"
               />
            )}
         </div>
         <span className="text-sm truncate" style={{ color: "var(--ds-text)" }}>{name}</span>
      </div>
   )
}

function ConfigBadge({ item }: { item?: { name: string, color: string } }) {
   if (!item) {
      return <span className="text-sm" style={{ color: "var(--ds-text-muted)" }}>—</span>
   }
   return (
      <span
         className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium w-fit"
         style={{ backgroundColor: `${item.color}15`, color: item.color }}
      >
         <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
         {item.name}
      </span>
   )
}

export default function TaskDetailsSidebar({ task }: TaskDetailsSidebarProps) {
   const { projectConfig } = useConfigStore()

   const status = projectConfig?.issueStatuses?.find((s: { id: number }) => s.id === task.status)
   const type = projectConfig?.issueTypes?.find((t: { id: number }) => t.id === task.type)
   const priority = projectConfig?.issuePriorities?.find((p: { id: number }) => p.id === task.priority)

   return (
      <div className="space-y-2 pr-0.5">
         <Panel title="Detalles">
            <Row label="Asignado"><PersonInline user={task.assignedId} /></Row>
            <Row label="Informador"><PersonInline user={task.reporterId} /></Row>
            <Row label="Estado"><ConfigBadge item={status} /></Row>
            <Row label="Tipo"><ConfigBadge item={type} /></Row>
            <Row label="Prioridad"><ConfigBadge item={priority} /></Row>
         </Panel>

         <Panel title="Fechas">
            <Row label="Creación">
               <span className="text-sm" style={{ color: "var(--ds-text)" }}>{formatDate(task.createdAt)}</span>
            </Row>
            <Row label="Actualización">
               <span className="text-sm" style={{ color: "var(--ds-text)" }}>{formatDate(task.updatedAt)}</span>
            </Row>
            <Row label="Inicio">
               <span className="text-sm" style={{ color: "var(--ds-text)" }}>{formatDate(task.startDate, false, true)}</span>
            </Row>
            <Row label="Fin">
               <span className="text-sm" style={{ color: "var(--ds-text)" }}>{formatDate(task.endDate, false, true)}</span>
            </Row>
            <Row label="Finalización">
               <span className="text-sm" style={{ color: "var(--ds-text)" }}>{formatDate(task.realDate, false, true)}</span>
            </Row>
            <Row label="Estimado">
               <span className="text-sm" style={{ color: "var(--ds-text)" }}>
                  {task.estimatedTime ? `${task.estimatedTime} horas` : '—'}
               </span>
            </Row>
            <Row label="En estado">
               <StatusTimer lastStatusUpdate={task.lastStatusUpdate} variant="detail" />
            </Row>
         </Panel>
      </div>
   )
}

// Formatea fechas a formato legible
function formatDate(dateStr?: string, includeTime = false, onlyDate = false): string {
   if (!dateStr) return '—'
   let date: Date
   if (dateStr.includes('T')) {
      date = new Date(dateStr)
   } else {
      const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
      date = new Date(year, month - 1, day)
   }
   if (onlyDate) {
      return date.toLocaleDateString('es-ES', {
         day: '2-digit',
         month: 'short',
         year: 'numeric',
      })
   }
   return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: includeTime ? '2-digit' : undefined,
      minute: includeTime ? '2-digit' : undefined,
      hour12: includeTime ? true : undefined
   })
}
