import { useEffect, useRef, useState } from "react"
import AutoResizeTextarea from "./AutoResizeTextarea"
import { CommentProps } from "@/lib/types/types"
import Image from "next/image"
import { DownloadIcon } from "@/assets/Icon"
import Link from "next/link"
import { useCommentStore } from "@/lib/store/CommentStore"
import { useAuthStore } from "@/lib/store/AuthStore"

interface Props {
   comment: CommentProps
}

export default function Comment({ comment }: Props) {
   const { addResponse, getResponses } = useCommentStore()
   const { getValidAccessToken } = useAuthStore()

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

   // Función para formatear la fecha
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

   return (
      <div ref={gonnaReplyRef} className="flex flex-col gap-2.5">
         <div className="flex items-start justify-start gap-2">
            <div className={`bg-green-500 h-8 w-8 rounded-full aspect-square mt-0.5`}>
               <Image className="rounded-full"
                  src={comment.user.picture}
                  alt={comment.id}
                  width={32}
                  height={32}
               />
            </div>
            <div className="flex flex-col w-full">
               <div className={`border-black/15 ${gonnaReply && !viewResponses && "bg-sky-100"} duration-150 border rounded-md flex flex-col overflow-y-auto p-2`}>
                  <h6 className="font-bold text-sm">{comment.user.firstName} {comment.user.lastName}</h6>
                  <p className="text-black/75 text-xs mt-1 mb-2">{comment.text}</p>
                  <div className="flex flex-wrap gap-2">
                     {
                        comment.attachments.map((file, idx) => {
                           const fileSplitted = file.fileName.split(".")
                           const extension = fileSplitted[fileSplitted.length - 1]

                           const isImage = ["jpg", "png", "jpeg", "gif", "bmp", "webp"].includes(extension.toLowerCase())
                           const url = file.fileUrl
                           return (
                              <div key={idx} className="border-black/15 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 duration-150 cursor-pointer relative flex flex-col items-center justify-center overflow-hidden rounded border p-1 text-xs">
                                 {
                                    isImage && url ?
                                       <Link href={url} target="_blank">
                                          <Image src={url} alt={file.fileName} height={64} width={64} className="object-cover rounded h-16 w-16" />
                                       </Link>
                                       :
                                       <Link href={url} target="_blank" className="flex w-full items-center justify-between rounded px-1 gap-2">
                                          <span className="truncate">{file.fileName}</span>
                                          <DownloadIcon size={16} stroke={2} />
                                       </Link>
                                 }
                              </div>
                           )
                        })
                     }
                  </div>
               </div>

               {/* Acciones de comentario */}
               <div className={`flex items-center gap-2 text-xs mt-1`}>
                  <span className="text-black/25">
                     {formatDate(comment.createdAt)}
                  </span>
                  <button
                     type="button"
                     onClick={() => setGonnaReply(!gonnaReply)}
                     className="text-blue-500 hover:text-blue-700 duration-150">
                     Responder
                  </button>
                  {
                     comment.responsesCount > 0 &&
                     <button
                        type="button"
                        onClick={toggleResponses}
                        className="text-black/75 hover:text-black duration-150">
                        {viewResponses
                           ? "Ocultar respuestas"
                           : `Ver ${comment.responsesCount > 1 ? `${comment.responsesCount} respuestas` : `respuesta`}`
                        }
                     </button>
                  }
               </div>
            </div>
         </div>

         {
            gonnaReply && (
               <div className="ml-10 flex justify-between items-stretch gap-2 text-xs mt-2">
                  <AutoResizeTextarea
                     value={newReply}
                     onChange={setNewReply}
                     placeholder="Escribe tu respuesta..."
                  />

                  <button
                     type="button"
                     className="bg-blue-600 hover:bg-blue-800 text-white duration-150 rounded-md border aspect-square p-2"
                     onClick={handleReply}>
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" className="size-4">
                        <path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" strokeWidth="2" />
                        <path d="M11.5 12.5L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                  </button>
               </div>
            )
         }

         {/* Área de respuestas */}
         {viewResponses && (
            <div className="ml-10 flex flex-col gap-2">
               {isLoadingResponses ? (
                  <div className="text-xs text-black/50">Cargando respuestas...</div>
               ) : commentResponses.length > 0 ? (
                  commentResponses.map(reply => (
                     <div key={reply.id} className="flex items-start justify-start gap-2">
                        <div className="bg-yellow-500 h-8 w-8 rounded-full aspect-square mt-0.5">
                           <Image
                              className="rounded-full"
                              src={reply.user.picture}
                              alt={reply.id}
                              width={32}
                              height={32}
                           />
                        </div>

                        <div className="border-black/15 border rounded-md flex flex-col overflow-y-auto p-2 w-full">
                           <div className="flex items-center">
                              <h6 className="font-bold text-sm">{reply.user.firstName} {reply.user.lastName}</h6>
                              <span className="text-black/25 text-xs">
                                 &nbsp;•&nbsp;{formatDate(reply.createdAt)}
                              </span>
                           </div>
                           <p className="text-black/75 text-xs mt-1 mb-2">{reply.text}</p>
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="text-xs text-black/50">No hay respuestas aún</div>
               )}
            </div>
         )}
      </div>
   )
}