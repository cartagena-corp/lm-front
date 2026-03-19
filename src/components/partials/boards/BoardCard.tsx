import { CalendarIcon, ClockIcon, DashboardIcon, DeleteIcon, VerticalEllipsisIcon } from "@/assets/Icon"
import { ButtonWithOptions } from "@/components/ui/FormUI"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import DeleteBoardForm from "../boards/DeleteBoardForm"
import { useBoardStore } from "@/lib/store/BoardStore"
import { useModalStore } from "@/lib/hooks/ModalStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { formatDate } from "@/lib/utils/date.utils"
import AuditHistory from "../audit/AuditHistory"
import { ProjectProps } from "@/lib/types/types"
import Dashboard from "../audit/Dashboard"
import Badge from "@/components/ui/Badge"
import Image from "next/image"
import Link from "next/link"

export default function BoardCard({ board }: { board: ProjectProps }) {
   const { openModal, closeModal } = useModalStore()
   const { getValidAccessToken } = useAuthStore()
   const { deleteBoard } = useBoardStore()

   const handleDelete = async (gonnaDelete: boolean) => {
      const token = await getValidAccessToken()
      if (token && gonnaDelete) await deleteBoard(token, board.id)
      closeModal()
   }

   const handleShowHistoryModal = () => {
      openModal({
         children: <AuditHistory onCancel={() => closeModal()} projectId={board.id} />,
         title: `Historial del proyecto: ${board.name}`,
         Icon: <ClockIcon size={20} stroke={1.75} />,
         desc: "Historial de cambios y actividades",
         closeOnBackdrop: false,
         closeOnEscape: false,
         size: "xl",
      })
   }

   const handleShowDashboardModal = async () => {
      const token = await getValidAccessToken()
      if (token) {
         openModal({
            children: <Dashboard projectId={board.id} token={token} />,
            title: `Dashboard del proyecto: ${board.name}`,
            desc: "Estadísticas y métricas del proyecto",
            Icon: <DashboardIcon size={20} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            size: "xxl",
         })
      }
   }

   const handleDeleteBoardModal = () => {
      openModal({
         children: <DeleteBoardForm onSubmit={handleDelete} onCancel={() => closeModal()} projectObject={board} />,
         Icon: <DeleteIcon size={20} stroke={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "DELETE",
         size: "md",
      })
   }

   const userProject = {
      firstName: board.createdBy?.firstName,
      lastName: board.createdBy?.lastName,
      picture: board.createdBy?.picture,
      email: board.createdBy?.email,
   }

   const options = [
      {
         onClick: () => handleShowDashboardModal(),
         icon: <DashboardIcon size={16} />,
         textVariant: 'gray' as const,
         label: 'Ver Dashboard',
         id: 'dashboard',
      },
      {
         onClick: () => handleShowHistoryModal(),
         icon: <ClockIcon size={16} />,
         textVariant: 'gray' as const,
         label: 'Ver Historial',
         id: 'history',
      },
      {
         onClick: () => handleDeleteBoardModal(),
         icon: <DeleteIcon size={16} stroke={1.5} />,
         textVariant: 'red' as const,
         label: 'Eliminar Tablero',
         id: 'delete',
      }
   ]

   return (
      <Link href={`/tableros/${board.id}`} className="bg-white border-black/15 hover:shadow-lg flex flex-col overflow-hidden transition-all duration-200 relative rounded-md border group gap-2 p-6">
         <header className="flex items-start justify-between">
            <picture className="flex items-center gap-3">
               <Image className="object-cover rounded-full" src={getUserAvatar(userProject, 40)} width={40} height={40} alt="User Avatar" />
               <hgroup className="flex flex-col">
                  <strong className="font-medium text-sm">{board.createdBy?.firstName} {board.createdBy?.lastName}</strong>
                  <p className="text-black/50 text-xs">{board.createdBy?.role}</p>
               </hgroup>
            </picture>
            <div onClick={(e) => e.preventDefault()}>
               <ButtonWithOptions options={options} size="sm" className="hover:bg-black/5 bg-transparent rounded-md p-2">
                  <VerticalEllipsisIcon size={16} stroke={2} />
               </ButtonWithOptions>
            </div>
         </header>

         <main className="flex flex-col flex-1">
            <h3 className="group-hover:text-blue-600 transition-colors line-clamp-2 font-bold text-xl mb-2">{board.name}</h3>
            <p className="text-black/50 line-clamp-3 text-sm">{board.description}</p>
         </main>

         <footer className="flex flex-wrap justify-between items-center gap-2 text-xs">
            <hgroup className="text-black/50 flex gap-2">
               <span className="whitespace-nowrap flex items-center gap-1">
                  <CalendarIcon size={16} stroke={2} /> {formatDate(board.startDate)}
               </span>
               <span className="whitespace-nowrap flex items-center gap-1">
                  <ClockIcon size={16} stroke={2} /> {formatDate(board.endDate)}
               </span>
            </hgroup>
            <Badge id={Number(board.status)} type="projectStatus" />
         </footer>
      </Link>
   )
}

export function BoardCardSkeleton(): JSX.Element {
   return (
      <div className="bg-gray-100 animate-pulse h-[320px] shadow-md rounded-xl border border-gray-200 p-6">
         <div className="space-y-3">
            <div className="flex justify-between items-start gap-4">
               <div className="h-6 bg-gray-300 rounded w-2/3" />
               <div className="h-6 bg-gray-300 rounded-full w-20" />
            </div>
            <div className="space-y-2">
               <div className="h-4 bg-gray-300 rounded w-full" />
               <div className="h-4 bg-gray-300 rounded w-4/5" />
               <div className="h-4 bg-gray-300 rounded w-3/5" />
            </div>
            <div className="space-y-2">
               <div className="h-3 bg-gray-300 rounded w-3/4" />
               <div className="h-3 bg-gray-300 rounded w-2/3" />
            </div>
         </div>
         <div className="flex gap-3 mt-6">
            <div className="h-10 bg-gray-300 rounded-lg flex-1" />
            <div className="h-10 bg-gray-300 rounded-lg flex-1" />
         </div>
      </div>
   )
}