import { CalendarIcon } from "@/assets/Icon"
import { useConfigStore } from "@/lib/store/ConfigStore"
import { ConfigProjectStatusProps, ProjectProps } from "@/lib/types/types"
import Link from "next/link"
import Modal from "../../layout/Modal"
import { useState } from "react"
import DeleteBoardForm from "../boards/DeleteBoardForm"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useBoardStore } from "@/lib/store/BoardStore"

export default function BoardCard({ board }: { board: ProjectProps }) {
   const { getValidAccessToken } = useAuthStore()
   const { deleteBoard } = useBoardStore()
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
   const { projectStatus } = useConfigStore()

   const formatDate = (fecha: string | null) => {
      if (!fecha) return "No definida"
      else {
         const dateObj = new Date(fecha)
         const day = dateObj.getDate().toString().padStart(2, '0')
         const month = dateObj
            .toLocaleString('es-ES', { month: 'short' })
            .replace('.', '')
            .toLowerCase()

         const year = dateObj.getFullYear()
         return `${day} ${month} ${year}`
      }
   }

   const getStatusName = (statusId: number) => {
      const statusObj = projectStatus?.find(status => status.id === statusId)
      return statusObj?.name || "Estado desconocido"
   }

   const handleDelete = async (gonnaDelete: boolean) => {
      const token = await getValidAccessToken()
      if (token && gonnaDelete) await deleteBoard(token, board.id)
      setIsDeleteModalOpen(false)
   }

   return (
      <div className="bg-white flex flex-col justify-between shadow-md rounded-md h-[260px] p-5">
         <section className='flex flex-col gap-2'>
            <article className='flex justify-between items-start gap-2'>
               <h3 className="text-gray-900 text-xl font-semibold line-clamp-2">{board.name}</h3>
               <div className={`rounded-full text-xs border px-2 translate-y-[5px] whitespace-nowrap
                    ${getStatusName(Number(board.status)).toLowerCase() == "en progreso" ? "bg-sky-100 text-sky-700 border-sky-700" :
                     getStatusName(Number(board.status)).toLowerCase() == "inactivo" ? "bg-zinc-100 text-zinc-700 border-zinc-700" :
                        getStatusName(Number(board.status)).toLowerCase() == "activo" ? "bg-purple-100 text-purple-700 border-purple-700" :
                           getStatusName(Number(board.status)).toLowerCase() == "completado" && "bg-green-100 text-green-700 border-green-700"}`}>
                  {getStatusName(Number(board.status)).charAt(0).toUpperCase() + getStatusName(Number(board.status)).slice(1).toLowerCase()}
               </div>

            </article>
            <p className="text-gray-600 text-sm line-clamp-3">{board.description}</p>
            <article className="text-black/50 flex justify-start items-center text-xs gap-2">
               <CalendarIcon size={16} />
               <div className="flex justify-center items-center gap-1 translate-y-[1px]">
                  {formatDate(board.startDate)}
                  <span>-</span>
                  {formatDate(board.endDate)}
               </div>
            </article>
            <article className="text-black/50 flex justify-start items-center text-xs gap-2">
               <CalendarIcon size={16} />
               <div className="flex justify-center items-center gap-1 translate-y-[1px]">
                  <span>Actualizado:</span>
                  {formatDate(board.updatedAt)}
               </div>
            </article>
         </section>

         <section className="flex items-center gap-2">
            <button onClick={() => setIsDeleteModalOpen(true)}
               type="button"
               className="bg-white hover:bg-red-700 hover:border-red-700 hover:text-white border-black/25 hover:shadow-lg border w-full duration-150 rounded-md text-center text-sm py-2"
            // onClick={onCancel}
            >
               Eliminar
            </button>
            <Link href={`/tableros/${board.id}`} className='bg-blue-900 border-blue-900 hover:bg-gray-900 text-white border hover:shadow-lg w-full duration-150 rounded-md text-center text-sm py-2'>
               Ver detalles
            </Link>
         </section>

         {/* Modal para eliminar el proyecto */}
         <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Eliminar proyecto"
         >
            <DeleteBoardForm
               onSubmit={handleDelete}
               onCancel={() => setIsDeleteModalOpen(false)}
               projectObject={board}
            />
         </Modal>
      </div>
   )
}

export function BoardCardSkeleton(): JSX.Element {
   return (
      <div className="bg-black/15 animate-pulse h-[260px] shadow-md rounded-md p-5" />
   )
}