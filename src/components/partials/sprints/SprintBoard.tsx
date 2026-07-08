'use client'

import { useMemo } from 'react'
import { useSprintStore } from '@/lib/store/SprintStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { AlertCircle, RefreshCw } from 'lucide-react'
import SprintKanbanCard from './SprintKanbanCard'

export default function SprintBoard() {
   const { sprints, activeSprint } = useSprintStore()
   const { selectedBoard } = useBoardStore()

   // Sprint activo: preferir la entrada ya enriquecida (con `tasks.content`) de
   // `sprints` — `activeSprint` viene de un endpoint aparte que no trae tareas,
   // solo se usa para saber cuál id está activo si `sprints` todavía no lo marca.
   const activeSprintId = activeSprint?.id ?? sprints.find(sprint => sprint.active && sprint.id !== 'null')?.id
   const activeSprintWithIssues = useMemo(
      () => sprints.find(sprint => sprint.id === activeSprintId) ?? null,
      [sprints, activeSprintId]
   )

   // Mientras no haya tablero/sprints cargados para el proyecto actual (incluye
   // el momento justo después de cambiar de tablero, antes de que llegue la
   // data nueva), mostrar el skeleton en vez de lo que haya en el store.
   if (!selectedBoard || sprints.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 mb-4" style={{ borderColor: "var(--gray-alpha-200)", borderTopColor: "var(--gray-700)" }}></div>
            <p className="text-sm" style={{ color: "var(--ds-text-muted)" }}>Cargando tablero…</p>
         </div>
      )
   }

   if (!activeSprintWithIssues) {
      return (
         <div className="p-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-md flex items-center justify-center mb-4" style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}>
               <AlertCircle size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--ds-text)" }}>No hay sprint activo</h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--ds-text-secondary)" }}>
               Para usar la vista de tablero, necesitas activar un sprint desde la vista de lista.
            </p>
            <button
               onClick={() => window.location.reload()}
               className="inline-flex items-center gap-2 px-3 h-9 rounded-md transition-colors duration-150 text-sm font-medium bg-[var(--primary-700)] hover:bg-[var(--primary-800)]"
               style={{ color: "var(--primary-contrast-fg)" }}
            >
               <RefreshCw size={16} strokeWidth={1.5} />
               Actualizar
            </button>
         </div>
      )
   }

   return <SprintKanbanCard key={activeSprintWithIssues.id} spr={activeSprintWithIssues} />
}
