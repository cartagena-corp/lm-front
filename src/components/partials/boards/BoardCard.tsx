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

   return (
      <div className="bg-white flex flex-col shadow-md hover:shadow-lg transition-all duration-200 rounded-xl border border-gray-100 h-96 p-6 group hover:border-gray-200">
         <section className='flex flex-col gap-4 flex-1'>
            <article className='flex justify-between items-start gap-3'>
               <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 text-xl font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                     {board.name}
                  </h3>
               </div>
               <div className="flex items-center gap-2">
                  <div
                     className="rounded-full text-xs font-medium px-3 py-1 whitespace-nowrap flex-shrink-0"
                     style={{
                        backgroundColor: `${getStatusColor(Number(board.status))}20`,
                        color: getStatusColor(Number(board.status)),
                        border: `1px solid ${getStatusColor(Number(board.status))}40`
                     }}
                  >
                     {getStatusName(Number(board.status)).charAt(0).toUpperCase() + getStatusName(Number(board.status)).slice(1).toLowerCase()}
                  </div>
                  <div className="relative" ref={menuRef}>
                     <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1 text-gray-900 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                     >
                        <MenuIcon size={16} />
                     </button>
                     {isMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                           <button
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                              onClick={() => {
                                 handleShowHistoryModal()
                                 setIsMenuOpen(false)
                              }}
                           >
                              Ver historial
                           </button>
                           <button
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors border-t border-gray-100"
                              onClick={() => {
                                 handleShowDashboardModal()
                                 setIsMenuOpen(false)
                              }}
                           >
                              Ver dashboard
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </article>

            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
               {board.description}
            </p>

            <div className="space-y-2 mt-auto">
               <article className="text-gray-500 flex justify-start items-center text-xs gap-2">
                  <CalendarIcon size={14} />
                  <div className="flex justify-center items-center gap-1">
                     <span className="font-medium">Período:</span>
                     <span>{formatDate(board.startDate)}</span>
                     <span className="text-gray-400">-</span>
                     <span>{formatDate(board.endDate)}</span>
                  </div>
               </article>

               <article className="text-gray-400 flex justify-start items-center text-xs gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Actualizado {formatDate(board.updatedAt)}</span>
               </article>
            </div>

            {daysRemaining !== null && (
               <div className="text-xs flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isOverdue ? 'bg-red-500' : daysRemaining <= 7 ? 'bg-orange-500' : 'bg-green-500'}`} />
                  <span className={`font-medium ${isOverdue ? 'text-red-600' : daysRemaining <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                     {isOverdue ? 'Vencido' : daysRemaining <= 0 ? 'Vence hoy' : `${daysRemaining} días restantes`}
                  </span>
               </div>
            )}
         </section>

         <section className="flex items-center gap-3 mt-4 flex-shrink-0">
            {user && board.createdBy && user.id === board.createdBy.id && (
               <button
                  onClick={() => handleDeleteBoardModal()}
                  type="button"
                  className="bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
               >
                  Eliminar
               </button>
            )}
            <Link
               href={`/tableros/${board.id}`}
               className={`bg-blue-600 hover:bg-blue-700 text-white border-transparent border hover:shadow-md ${user && board.createdBy && user.id === board.createdBy.id ? 'flex-1' : 'w-full'} duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
               Ver detalles
            </Link>
         </section>
      </div>
   )
}

export function BoardCardSkeleton(): JSX.Element {
   return (
      <div className="bg-gray-100 animate-pulse h-[320px] shadow-md rounded-xl border border-gray-200 p-6">
         <div className="space-y-3">
            <div className="flex justify-between items-start gap-4">
               <div className="h-6 bg-gray-300 rounded w-2/3"></div>
               <div className="h-6 bg-gray-300 rounded-full w-20"></div>
            </div>
            <div className="space-y-2">
               <div className="h-4 bg-gray-300 rounded w-full"></div>
               <div className="h-4 bg-gray-300 rounded w-4/5"></div>
               <div className="h-4 bg-gray-300 rounded w-3/5"></div>
            </div>
            <div className="space-y-2">
               <div className="h-3 bg-gray-300 rounded w-3/4"></div>
               <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
         </div>
         <div className="flex gap-3 mt-6">
            <div className="h-10 bg-gray-300 rounded-lg flex-1"></div>
            <div className="h-10 bg-gray-300 rounded-lg flex-1"></div>
         </div>
      </div>
   )
}