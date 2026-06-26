import { CalendarIcon, ClockIcon, DeleteIcon, MenuIcon } from "@/assets/Icon"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { ProjectProps } from "@/lib/types/types"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import DeleteBoardForm from "../boards/DeleteBoardForm"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useBoardStore } from "@/lib/store/BoardStore"
import AuditHistory from "../audit/AuditHistory"
import Dashboard from "../audit/Dashboard"
import { useModalStore } from "@/lib/hooks/ModalStore"

export default function BoardCard({ board }: { board: ProjectProps }) {
   const { getValidAccessToken, user } = useAuthStore()
   const { deleteBoard } = useBoardStore()
   const [isMenuOpen, setIsMenuOpen] = useState(false)
   const { projectStatus } = useConfigStore()
   const menuRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false)
         }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [])

   const formatDate = (fecha: string | null) => {
      if (!fecha) return "No definida"
      else {
         // Para fechas en formato ISO (YYYY-MM-DD), creamos la fecha directamente
         // para evitar problemas de zona horaria
         const [year, month, day] = fecha.split('T')[0].split('-')
         const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

         const dayFormatted = dateObj.getDate().toString().padStart(2, '0')
         const monthFormatted = dateObj
            .toLocaleString('es-ES', { month: 'short' })
            .replace('.', '')
            .toLowerCase()

         const yearFormatted = dateObj.getFullYear()
         return `${dayFormatted} ${monthFormatted} ${yearFormatted}`
      }
   }

   const getStatusName = (statusId: number) => {
      const statusObj = projectStatus?.find(status => status.id === statusId)
      return statusObj?.name || "Estado desconocido"
   }

   const getStatusColor = (statusId: number) => {
      const statusObj = projectStatus?.find(status => status.id === statusId)
      return statusObj?.color || "#6B7280"
   }

   const handleDelete = async (gonnaDelete: boolean) => {
      const token = await getValidAccessToken()
      if (token && gonnaDelete) await deleteBoard(token, board.id)
      closeModal()
   }

   const isOverdue = board.endDate && new Date(board.endDate) < new Date()
   const daysRemaining = board.endDate ? Math.ceil((new Date(board.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null

   // Derive a short mono "key" from the board name (e.g. "Plataforma de Pagos" -> "PP").
   const boardKey = (board.name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map(w => w[0])
      .join("")
      .toUpperCase() || (board.name || "?").slice(0, 2).toUpperCase()

   const { openModal, closeModal } = useModalStore()

   const handleShowHistoryModal = () => {
      openModal({
         size: "xl",
         title: `Historial del proyecto: ${board.name}`,
         desc: "Historial de cambios y actividades",
         Icon: <ClockIcon size={20} stroke={1.75} />,
         children: <AuditHistory onCancel={() => closeModal()} projectId={board.id} />,
         closeOnBackdrop: false,
         closeOnEscape: false,

      })
   }

   const handleShowDashboardModal = async () => {
      const token = await getValidAccessToken()
      if (token) {
         openModal({
            size: "xxl",
            title: `Dashboard del proyecto: ${board.name}`,
            desc: "Estadísticas y métricas del proyecto",
            Icon: (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
            ),
            children: <Dashboard projectId={board.id} token={token} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
         })
      }
   }

   const handleDeleteBoardModal = () => {
      openModal({
         size: "md",
         Icon: <DeleteIcon size={20} stroke={1.75} />,
         children: <DeleteBoardForm onSubmit={handleDelete} onCancel={() => closeModal()} projectObject={board} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "DELETE"
      })
   }

   const statusColor = getStatusColor(Number(board.status))
   const statusName = getStatusName(Number(board.status))
   const statusLabel = statusName.charAt(0).toUpperCase() + statusName.slice(1).toLowerCase()

   return (
      <div
         className="lm-board-card flex flex-col group transition-shadow duration-150 p-[18px]"
         style={{ background: "var(--ds-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-border)", minHeight: 220 }}
      >
         <section className='flex flex-col gap-[14px] flex-1'>
            <article className='flex justify-between items-start gap-[10px]'>
               <div className="flex items-center gap-[10px] min-w-0">
                  <div
                     className="flex items-center justify-center flex-shrink-0"
                     style={{ width: 36, height: 36, borderRadius: 8, background: "var(--gray-alpha-100)", color: "var(--ds-text-secondary)", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}
                  >
                     {boardKey}
                  </div>
                  <div className="min-w-0">
                     <h3 className="font-semibold line-clamp-1 transition-colors duration-150" style={{ fontSize: 15, letterSpacing: "-0.01em", color: "var(--ds-text)" }}>
                        {board.name}
                     </h3>
                     <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ds-text-muted)" }}>{boardKey}</div>
                  </div>
               </div>
               <div className="flex items-center gap-1 flex-shrink-0">
                  <span
                     className="inline-flex items-center gap-[5px] whitespace-nowrap"
                     style={{ height: 22, padding: "0 8px", borderRadius: 9999, background: `${statusColor}1f`, color: statusColor, fontSize: 11, fontWeight: 500 }}
                  >
                     <span style={{ width: 6, height: 6, borderRadius: 9999, background: statusColor }} />
                     {statusLabel}
                  </span>
                  <div className="relative" ref={menuRef}>
                     <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1 rounded-md transition-colors hover:bg-[var(--gray-alpha-100)]"
                        style={{ color: "var(--ds-text-muted)" }}
                     >
                        <MenuIcon size={16} />
                     </button>
                     {isMenuOpen && (
                        <div
                           className="absolute top-full right-0 mt-2 w-40 z-50 overflow-hidden"
                           style={{ background: "var(--ds-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)" }}
                        >
                           <button
                              className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--gray-alpha-100)]"
                              style={{ color: "var(--ds-text)" }}
                              onClick={() => { handleShowHistoryModal(); setIsMenuOpen(false) }}
                           >
                              Ver historial
                           </button>
                           <button
                              className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--gray-alpha-100)]"
                              style={{ color: "var(--ds-text)", borderTop: "1px solid var(--ds-border)" }}
                              onClick={() => { handleShowDashboardModal(); setIsMenuOpen(false) }}
                           >
                              Ver dashboard
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </article>

            <p className="line-clamp-2" style={{ fontSize: 13, lineHeight: "19px", color: "var(--ds-text-secondary)", minHeight: 38 }}>
               {board.description}
            </p>

            <div className="flex flex-col gap-2 mt-auto">
               <article className="flex justify-start items-center text-xs gap-2" style={{ color: "var(--ds-text-muted)" }}>
                  <CalendarIcon size={14} />
                  <div className="flex items-center gap-1">
                     <span className="font-medium">Período:</span>
                     <span>{formatDate(board.startDate)}</span>
                     <span style={{ color: "var(--ds-text-muted)" }}>-</span>
                     <span>{formatDate(board.endDate)}</span>
                  </div>
               </article>

               <article className="flex justify-start items-center text-xs gap-2" style={{ color: "var(--ds-text-muted)" }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Actualizado {formatDate(board.updatedAt)}</span>
               </article>
            </div>

            {daysRemaining !== null && (
               <div className="text-xs flex items-center gap-2" style={{ paddingTop: 4, borderTop: "1px solid var(--ds-border)" }}>
                  <span className="rounded-full" style={{ width: 6, height: 6, background: isOverdue ? "var(--red-700)" : daysRemaining <= 7 ? "var(--amber-700)" : "var(--green-700)" }} />
                  <span className="font-medium" style={{ color: isOverdue ? "var(--red-700)" : daysRemaining <= 7 ? "var(--amber-700)" : "var(--green-700)" }}>
                     {isOverdue ? 'Vencido' : daysRemaining <= 0 ? 'Vence hoy' : `${daysRemaining} días restantes`}
                  </span>
               </div>
            )}
         </section>

         <section className="flex items-center gap-2 mt-4 flex-shrink-0">
            {user && board.createdBy && user.id === board.createdBy.id && (
               <button
                  onClick={() => handleDeleteBoardModal()}
                  type="button"
                  className="flex-1 transition-colors text-center text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  style={{ height: 36, borderRadius: "var(--radius-md)", background: "var(--ds-background)", color: "var(--ds-text)", border: "1px solid var(--ds-border-strong)" }}
               >
                  Eliminar
               </button>
            )}
            <Link
               href={`/tableros/${board.id}`}
               className={`${user && board.createdBy && user.id === board.createdBy.id ? 'flex-1' : 'w-full'} flex items-center justify-center text-center text-sm font-medium transition-opacity hover:opacity-90`}
               style={{ height: 36, borderRadius: "var(--radius-md)", background: "var(--ds-text)", color: "var(--ds-contrast-inverse)", border: "1px solid var(--ds-text)" }}
            >
               Ver detalles
            </Link>
         </section>
      </div>
   )
}

export function BoardCardSkeleton(): JSX.Element {
   const bar = (w: string, h = 14): JSX.Element => (
      <div className="animate-pulse rounded" style={{ width: w, height: h, background: "var(--gray-alpha-200)" }} />
   )
   return (
      <div className="flex flex-col p-[18px]" style={{ background: "var(--ds-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-border)", minHeight: 220 }}>
         <div className="flex items-start gap-[10px]">
            <div className="animate-pulse flex-shrink-0" style={{ width: 36, height: 36, borderRadius: 8, background: "var(--gray-alpha-200)" }} />
            <div className="flex flex-col gap-2 flex-1">
               {bar("60%", 15)}
               {bar("30%", 11)}
            </div>
            <div className="animate-pulse" style={{ width: 70, height: 22, borderRadius: 9999, background: "var(--gray-alpha-200)" }} />
         </div>
         <div className="flex flex-col gap-2 mt-4">
            {bar("100%")}
            {bar("80%")}
         </div>
         <div className="flex flex-col gap-2 mt-auto pt-4">
            {bar("70%", 11)}
            {bar("55%", 11)}
         </div>
         <div className="flex gap-2 mt-4">
            <div className="animate-pulse flex-1" style={{ height: 36, borderRadius: "var(--radius-md)", background: "var(--gray-alpha-200)" }} />
            <div className="animate-pulse flex-1" style={{ height: 36, borderRadius: "var(--radius-md)", background: "var(--gray-alpha-200)" }} />
         </div>
      </div>
   )
}