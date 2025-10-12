import { useEffect, useRef, useState } from "react"
import AutoResizeTextarea from "./AutoResizeTextarea"
import { CommentProps } from "@/lib/types/types"
import Image from "next/image"
import { DeleteIcon, DownloadIcon } from "@/assets/Icon"
import Link from "next/link"
import { useCommentStore } from "@/lib/store/CommentStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useModalStore } from "@/lib/hooks/ModalStore"
import DeleteCommentForm from "../partials/comments/DeleteCommentForm"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import DeleteReplyForm from "../partials/comments/DeleteReplyForm"

interface Props {
   comment: CommentProps
}

export default function Comment({ comment }: Props) {
   const { addResponse, getResponses, deleteComment, deleteResponse } = useCommentStore()
   const { getValidAccessToken, user } = useAuthStore()
   const { openModal, closeModal } = useModalStore()

   const [replyId, setReplyId] = useState("")
   const [gonnaReply, setGonnaReply] = useState<boolean>(false)
   const [viewResponses, setViewResponses] = useState<boolean>(false)
   const [newReply, setNewReply] = useState("")
   const [commentResponses, setCommentResponses] = useState<any[]>([])
   const [isLoadingResponses, setIsLoadingResponses] = useState<boolean>(false)

   const gonnaReplyRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => (gonnaReplyRef.current && !gonnaReplyRef.current.contains(event.target as Node)) && setGonnaReply(false)
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [])

   const handleReply = async () => {
      try {
         if (newReply !== "") {
            const token = await getValidAccessToken()
            if (token) {
               await addResponse(token, newReply, comment.id, comment.issueId)
               setNewReply("")
               setGonnaReply(false)
               // Actualizar las respuestas después de agregar una nueva
               if (viewResponses) {
                  loadResponses()
               }
            }
         }
      } catch (error) {
         console.error(error)
      }
   }

   const loadResponses = async () => {
      try {
         setIsLoadingResponses(true)
         const token = await getValidAccessToken()
         if (token) {
            // Llamamos a getResponses pero no usamos el estado global
            const responses = await getResponses(token, comment.id)
            // En su lugar, almacenamos las respuestas localmente para este comentario
            setCommentResponses(responses || [])
         }
      } catch (error) {
         console.error(error)
      } finally {
         setIsLoadingResponses(false)
      }
   }

   const toggleResponses = async () => {
      if (!viewResponses && commentResponses.length === 0) {
         await loadResponses()
      }
      setViewResponses(!viewResponses)
   }

   const handleDeleteComment = async () => {
      const token = await getValidAccessToken()
      if (token) await deleteComment(token, comment.id, comment.issueId)
      closeModal()
   }

   const handleDeleteReply = async (responseId: string) => {
      const token = await getValidAccessToken()
      if (token) await deleteResponse(token, responseId, comment.id)
      closeModal()
      setViewResponses(false)
      setReplyId("")
      loadResponses()
   }

   const formatDate = (dateStr: string) => {
      if (!dateStr) return ''

      let date
      if (dateStr.includes('T')) {
         date = new Date(dateStr)
      } else {
         const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
         date = new Date(year, month - 1, day)
      }

      return date.toLocaleDateString('es-ES', {
         day: '2-digit',
         month: 'short',
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
         hour12: false
      })
   }

   const handleDeleteCommentModal = () => {
      openModal({
         size: "md",
         children: (
            <DeleteCommentForm
               onSubmit={handleDeleteComment}
               onCancel={() => closeModal()}
            />
         ),
         Icon: <DeleteIcon size={20} stroke={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "DELETE"
      })
   }

   const handleDeleteReplyModal = (responseId: string) => {
      setReplyId(responseId)
      openModal({
         size: "md",
         children: (
            <DeleteReplyForm
               responseId={responseId}
               onSubmit={handleDeleteReply}
               onCancel={() => closeModal()}
            />
         ),
         Icon: <DeleteIcon size={20} stroke={1.75} />,
         closeOnBackdrop: false,
         closeOnEscape: true,
         mode: "DELETE"
      })
   }

   return (
      <>
         <div ref={gonnaReplyRef} className="space-y-4">
            <div className="flex items-start gap-2">
               {/* Avatar */}
               <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                     <Image
                        className="w-full h-full object-cover"
                        src={getUserAvatar(comment.user, 32)}
                        alt={`${comment.user.firstName} ${comment.user.lastName}`}
                        width={32}
                        height={32}
                     />
                  </div>
               </div>

               {/* Contenido del comentario */}
               <div className="flex-1 min-w-0">
                  <div className="rounded-xl">
                     {/* Header del comentario */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <h6 className="font-semibold text-xs text-gray-900">
                              {comment.user.firstName} {comment.user.lastName}
                           </h6>
                           <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                           </span>
                        </div>
                        {comment.userId === user?.id && (
                           <button
                              type="button"
                              onClick={handleDeleteCommentModal}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Eliminar comentario"
                           >
                              <DeleteIcon size={16} />
                           </button>
                        )}
                     </div>

                     {/* Texto del comentario */}
                     <p className="text-xs text-gray-700 mb-3 whitespace-pre-wrap">
                        {comment.text}
                     </p>

                     {/* Archivos adjuntos */}
                     {comment.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                           {comment.attachments.map((file, idx) => {
                              const fileSplitted = file.fileName.split(".")
                              const extension = fileSplitted[fileSplitted.length - 1]
                              const isImage = ["jpg", "png", "jpeg", "gif", "bmp", "webp"].includes(extension.toLowerCase())
                              const url = file.fileUrl

                              return (
                                 <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all">
                                    {isImage && url ? (
                                       <Link href={url} target="_blank">
                                          <div className="w-16 h-16 relative">
                                             <Image
                                                src={url}
                                                alt={file.fileName}
                                                fill
                                                className="object-cover hover:scale-105 transition-transform"
                                                unoptimized
                                             />
                                          </div>
                                       </Link>
                                    ) : (
                                       <Link
                                          href={url}
                                          target="_blank"
                                          className="flex items-center gap-2 p-3 min-w-0 hover:bg-gray-50 transition-colors"
                                       >
                                          <div className="flex-shrink-0">
                                             <DownloadIcon size={16} stroke={2} />
                                          </div>
                                          <span className="text-xs text-gray-600 truncate">
                                             {file.fileName}
                                          </span>
                                       </Link>
                                    )}
                                 </div>
                              )
                           })}
                        </div>
                     )}
                  </div>

                  {/* Acciones del comentario */}
                  <div className="flex items-center gap-4 mt-2 text-xs">
                     <button
                        type="button"
                        onClick={() => setGonnaReply(!gonnaReply)}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                     >
                        Responder
                     </button>
                     {comment.responsesCount > 0 && (
                        <button
                           type="button"
                           onClick={toggleResponses}
                           className="text-gray-600 hover:text-gray-700 font-medium transition-colors"
                        >
                           {viewResponses
                              ? "Ocultar respuestas"
                              : `Ver ${comment.responsesCount > 1 ? `${comment.responsesCount} respuestas` : `respuesta`}`
                           }
                        </button>
                     )}
                  </div>
               </div>
            </div>

            {/* Área de respuesta */}
            {gonnaReply && (
               <div className="ml-14 bg-white border border-gray-200 rounded-lg p-2">
                  <div className="flex gap-3">
                     <div className="flex-1">
                        <AutoResizeTextarea
                           value={newReply}
                           onChange={setNewReply}
                           placeholder="Escribe tu respuesta..."
                           className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                        />
                     </div>
                     <button
                        type="button"
                        className="flex-shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleReply}
                        disabled={!newReply.trim()}
                        title="Enviar respuesta"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" className="w-4 h-4">
                           <path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" strokeWidth="2" />
                           <path d="M11.5 12.5L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                     </button>
                  </div>
               </div>
            )}

            {/* Respuestas */}
            {viewResponses && (
               <div className="ml-14 space-y-3">
                  {isLoadingResponses ? (
                     <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        Cargando respuestas...
                     </div>
                  ) : commentResponses.length > 0 ? (
                     commentResponses.map(reply => (
                        <div key={reply.id} className="flex items-start gap-2">
                           {/* Avatar de la respuesta */}
                           <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                                 <Image
                                    className="w-full h-full object-cover"
                                    src={getUserAvatar(reply.user, 32)}
                                    alt={`${reply.user.firstName} ${reply.user.lastName}`}
                                    width={32}
                                    height={32}
                                 />
                              </div>
                           </div>

                           {/* Contenido de la respuesta */}
                           <div className="flex-1 min-w-0">
                              <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                       <h6 className="font-semibold text-xs text-gray-900">
                                          {reply.user.firstName} {reply.user.lastName}
                                       </h6>
                                       <span className="text-xs text-gray-500">
                                          {formatDate(reply.createdAt)}
                                       </span>
                                    </div>
                                    {reply.userId === user?.id && (
                                       <button
                                          type="button"
                                          onClick={() => handleDeleteReplyModal(reply.id)}
                                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                          title="Eliminar respuesta"
                                       >
                                          <DeleteIcon size={12} />
                                       </button>
                                    )}
                                 </div>
                                 <p className="text-xs/tight text-gray-700 whitespace-pre-wrap">
                                    {reply.text}
                                 </p>
                              </div>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-sm text-gray-500 py-4 text-center">
                        No hay respuestas aún
                     </div>
                  )}
               </div>
            )}
         </div>
      </>
   )
}