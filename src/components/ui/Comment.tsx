import { useEffect, useRef, useState } from "react"
import TextArea from "./TextArea"
import SafeHtml from "./SafeHtml"
import { CommentProps } from "@/lib/types/types"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import CommentAttachments from "./CommentAttachments"
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
   const [replyFiles, setReplyFiles] = useState<File[]>([])
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
         Icon: <Trash2 size={20} strokeWidth={1.75} />,
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
         Icon: <Trash2 size={20} strokeWidth={1.75} />,
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
                  <div className="w-8 h-8 rounded-full overflow-hidden" style={{ background: "var(--gray-alpha-200)" }}>
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
                  <div className="rounded-md">
                     {/* Header del comentario */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <h6 className="font-medium text-xs" style={{ color: "var(--ds-text)" }}>
                              {comment.user.firstName} {comment.user.lastName}
                           </h6>
                           <span className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
                              {formatDate(comment.createdAt)}
                           </span>
                        </div>
                        {comment.userId === user?.id && (
                           <button
                              type="button"
                              onClick={handleDeleteCommentModal}
                              className="p-1 text-[var(--ds-text-muted)] hover:text-[var(--red-800)] hover:bg-[var(--red-100)] rounded-md transition-colors duration-150"
                              title="Eliminar comentario"
                           >
                              <Trash2 size={16} strokeWidth={1.5} />
                           </button>
                        )}
                     </div>

                     {/* Texto del comentario */}
                     <SafeHtml
                        html={comment.text}
                        className="text-xs text-[var(--ds-text-secondary)] mb-3 [&_code]:font-mono [&_code]:bg-[var(--gray-alpha-200)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
                     />

                     {/* Archivos adjuntos */}
                     {comment.attachments && comment.attachments.length > 0 && (
                        <CommentAttachments attachments={comment.attachments} />
                     )}
                  </div>

                  {/* Acciones del comentario */}
                  <div className="flex items-center gap-4 mt-2 text-xs">
                     <button
                        type="button"
                        onClick={() => setGonnaReply(!gonnaReply)}
                        className="text-[var(--blue-700)] hover:text-[var(--blue-800)] font-medium transition-colors"
                     >
                        Responder
                     </button>
                     {comment.responsesCount > 0 && (
                        <button
                           type="button"
                           onClick={toggleResponses}
                           className="text-[var(--ds-text-secondary)] hover:text-[var(--ds-text)] font-medium transition-colors"
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
               <div className="ml-14">
                  <TextArea
                     title=""
                     value={newReply}
                     onChange={setNewReply}
                     placeholder="Escribe tu respuesta..."
                     maxLength={2000}
                     minHeight='60px'
                     maxHeight='150px'
                     files={replyFiles}
                     onFilesChange={setReplyFiles}
                     onRemoveFile={(index) => {
                        setReplyFiles(prev => prev.filter((_, i) => i !== index))
                     }}
                     extensionAllowed="*"
                  />
                  <button
                     type="button"
                     className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] disabled:opacity-50 disabled:cursor-not-allowed"
                     style={{ color: "var(--primary-contrast-fg)" }}
                     onClick={handleReply}
                     disabled={!newReply.trim()}
                     title="Enviar respuesta"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" className="w-4 h-4">
                        <path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" strokeWidth="2" />
                        <path d="M11.5 12.5L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                     Responder
                  </button>
               </div>
            )}

            {/* Respuestas */}
            {viewResponses && (
               <div className="ml-14 space-y-3">
                  {isLoadingResponses ? (
                     <div className="flex items-center gap-2 text-sm py-4" style={{ color: "var(--ds-text-muted)" }}>
                        <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "2px solid var(--ds-border)", borderTopColor: "var(--blue-700)" }}></div>
                        Cargando respuestas...
                     </div>
                  ) : commentResponses.length > 0 ? (
                     commentResponses.map(reply => (
                        <div key={reply.id} className="flex items-start gap-2">
                           {/* Avatar de la respuesta */}
                           <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full overflow-hidden" style={{ background: "var(--gray-alpha-200)" }}>
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
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <h6 className="font-semibold text-xs" style={{ color: "var(--ds-text)" }}>
                                       {reply.user.firstName} {reply.user.lastName}
                                    </h6>
                                    <span className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
                                       {formatDate(reply.createdAt)}
                                    </span>
                                 </div>
                                 {reply.userId === user?.id && (
                                    <button
                                       type="button"
                                       onClick={() => handleDeleteReplyModal(reply.id)}
                                       className="p-1 text-[var(--ds-text-muted)] hover:text-[var(--red-800)] hover:bg-[var(--red-100)] rounded-md transition-colors duration-150"
                                       title="Eliminar respuesta"
                                    >
                                       <Trash2 size={12} strokeWidth={1.5} />
                                    </button>
                                 )}
                              </div>
                              <SafeHtml
                                 html={reply.text}
                                 className="text-xs/tight text-[var(--ds-text-secondary)] [&_code]:font-mono [&_code]:bg-[var(--gray-alpha-200)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
                              />
                              {reply.attachments && reply.attachments.length > 0 && (
                                 <div className="mt-2">
                                    <CommentAttachments attachments={reply.attachments} />
                                 </div>
                              )}
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-sm py-4 text-center" style={{ color: "var(--ds-text-muted)" }}>
                        No hay respuestas aún
                     </div>
                  )}
               </div>
            )}
         </div>
      </>
   )
}