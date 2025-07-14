import { AlertCircleIcon, AttachIcon, SendIcon, XIcon } from "@/assets/Icon"
import AutoResizeTextarea from "@/components/ui/AutoResizeTextarea"
import Comment from "@/components/ui/Comment"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useCommentStore } from "@/lib/store/CommentStore"
import { GlobalPagination, CommentProps, TaskProps } from "@/lib/types/types"
import Image from "next/image"
import { useEffect, useState, useCallback, DragEvent, useRef } from "react"

interface ShowCommentsProps {
   arrayComments: GlobalPagination
   task: TaskProps
}

export default function ShowComments({ arrayComments, task }: ShowCommentsProps) {
   const { getValidAccessToken } = useAuthStore()
   const { addComment, loadMoreComments, isLoading, isLoadingMore, hasMoreComments, comments: storeComments } = useCommentStore()

   const fileInputRef = useRef<HTMLInputElement>(null)
   const scrollContainerRef = useRef<HTMLDivElement>(null)

   const [dragActive, setDragActive] = useState<boolean>(false)
   const [newComment, setNewComment] = useState<string>("")
   const [files, setFiles] = useState<File[]>([])

   // Use store comments if available, otherwise use prop comments
   const comments = storeComments.content.length > 0 ? storeComments : arrayComments

   // Infinite scroll effect
   useEffect(() => {
      const scrollContainer = scrollContainerRef.current
      if (!scrollContainer) return

      let isThrottled = false
      
      const handleScroll = () => {
         if (isThrottled) return
         
         const { scrollTop, scrollHeight, clientHeight } = scrollContainer
         const threshold = 100 // pixels from bottom to trigger load
         
         if (scrollHeight - scrollTop - clientHeight < threshold && hasMoreComments && !isLoadingMore) {
            isThrottled = true
            handleLoadMore().finally(() => {
               setTimeout(() => {
                  isThrottled = false
               }, 1000) // Throttle for 1 second
            })
         }
      }

      scrollContainer.addEventListener('scroll', handleScroll)
      return () => {
         scrollContainer.removeEventListener('scroll', handleScroll)
         isThrottled = false
      }
   }, [hasMoreComments, isLoadingMore, task.id])

   const handleLoadMore = async () => {
      const token = await getValidAccessToken()
      if (token) {
         await loadMoreComments(token, task.id as string)
      }
   }

   const handleDragOver = (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      setDragActive(true)
   }
   const handleDragLeave = (e: DragEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      if (
         e.clientX < rect.left ||
         e.clientX > rect.right ||
         e.clientY < rect.top ||
         e.clientY > rect.bottom
      ) {
         setDragActive(false)
      }
   }
   const handleDrop = (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      setDragActive(false)
      const dropped = Array.from(e.dataTransfer.files)
      setFiles(prev => [...prev, ...dropped])
   }

   const removeFile = useCallback((idx: number) => {
      setFiles(prev => prev.filter((_, i) => i !== idx))
   }, [])

   const handleAddComment = async () => {
      if (!newComment.trim() && files.length === 0) return
      const token = await getValidAccessToken()
      if (!token) return

      await addComment(token, task.id as string, newComment, files)
      setNewComment("")
      setFiles([])
   }

   const openFileDialog = () => {
      fileInputRef.current?.click()
   }

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const chosen = Array.from(e.target.files || [])
      setFiles(prev => [...prev, ...chosen])
      setDragActive(false)
      e.target.value = ""
   }

   // Manejar pegado de imágenes desde el portapapeles
   const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (e.clipboardData && e.clipboardData.items) {
         const items = Array.from(e.clipboardData.items)
         const imageFiles: File[] = []
         items.forEach(item => {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
               const file = item.getAsFile()
               if (file) {
                  imageFiles.push(file)
               }
            }
         })
         if (imageFiles.length > 0) {
            setFiles(prev => [...prev, ...imageFiles])
            // Opcional: evitar que la imagen se pegue como base64 en el textarea
            e.preventDefault()
         }
      }
   }

   return (
      <section className="space-y-4 w-full" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
         <div className="flex items-center gap-2">
            <h6 className="text-lg font-semibold text-gray-900">Comentarios</h6>
            <span className="bg-gray-100 text-gray-600 flex justify-center items-center text-xs font-bold rounded-full w-6 h-6">
               {comments.totalElements}
            </span>
         </div>

         {/* Lista de comentarios */}
         {comments.content.length ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
               <div 
                  ref={scrollContainerRef}
                  className="max-h-60 overflow-y-auto"
               >
                  <div className="divide-y divide-gray-100">
                     {comments.content.map((c) => (
                        <div key={c.id} className="p-4">
                           <Comment comment={c as CommentProps} />
                        </div>
                     ))}
                  </div>
                  
                  {/* Loading indicator for infinite scroll */}
                  {isLoadingMore && (
                     <div className="flex items-center justify-center py-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                           <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                           Cargando más comentarios...
                        </div>
                     </div>
                  )}
                  
                  {/* Load more button - shown when there are more comments and not loading */}
                  {hasMoreComments && !isLoadingMore && (
                     <div className="flex items-center justify-center py-4 border-t border-gray-100">
                        <button
                           onClick={handleLoadMore}
                           className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                           Cargar más comentarios
                        </button>
                     </div>
                  )}
                  
                  {/* End of comments indicator */}
                  {!hasMoreComments && comments.content.length > 0 && (
                     <div className="flex items-center justify-center py-4 border-t border-gray-100">
                        <div className="text-xs text-gray-400">
                           No hay más comentarios
                        </div>
                     </div>
                  )}
               </div>
            </div>
         ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
               <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                     <AlertCircleIcon size={24} />
                  </div>
                  <h6 className="text-sm font-medium text-gray-900 mb-1">Aún no hay comentarios</h6>
                  <p className="text-xs text-gray-500">Sé el primero en comentar esta tarea</p>
               </div>
            </div>
         )}

         {/* Área de nuevo comentario */}
         <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            {/* Archivos adjuntos */}
            {files.length > 0 && (
               <div className="mb-4">
                  <div className="flex flex-wrap gap-3">
                     {files.map((file, idx) => {
                        const isImage = file.type.startsWith("image/")
                        const url = isImage ? URL.createObjectURL(file) : null
                        return (
                           <div key={idx} className="relative group">
                              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
                                 {isImage && url ? (
                                    <div className="w-16 h-16 relative">
                                       <Image
                                          src={url}
                                          alt={file.name}
                                          fill
                                          className="object-cover"
                                       />
                                    </div>
                                 ) : (
                                    <div className="w-16 h-16 flex flex-col items-center justify-center p-2">
                                       <div className="text-xs font-medium text-gray-600 truncate max-w-full">
                                          {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                                       </div>
                                       <div className="text-xs text-gray-400 truncate max-w-full mt-1">
                                          {file.name}
                                       </div>
                                    </div>
                                 )}
                              </div>
                              <button
                                 type="button"
                                 className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                 onClick={() => removeFile(idx)}
                              >
                                 <XIcon size={12} stroke={2} />
                              </button>
                           </div>
                        )
                     })}
                  </div>
               </div>
            )}

            {/* Zona de drop vs textarea + botón */}
            {dragActive ? (
               <div className="relative mb-4 flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 transition-colors">
                  <div className="text-center">
                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <AttachIcon size={20} />
                     </div>
                     <p className="text-sm font-medium text-blue-900 mb-1">Arrastra aquí tus archivos</p>
                     <p className="text-xs text-blue-700">O haz clic para seleccionar</p>
                  </div>
                  <input
                     type="file"
                     multiple
                     className="absolute inset-0 opacity-0 cursor-pointer"
                     onChange={(e) => {
                        const chosen = Array.from(e.target.files || [])
                        setFiles(prev => [...prev, ...chosen])
                        setDragActive(false)
                     }}
                  />
               </div>
            ) : (
               <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                     <AutoResizeTextarea
                        className="max-h-28! w-full p-2 text-sm border-0 resize-none focus:ring-0 focus:outline-none placeholder-gray-500"
                        value={newComment}
                        onChange={setNewComment}
                        placeholder="Escribe tu comentario..."
                        onPaste={handlePaste}
                     />
                  </div>
                  
                  <div className="flex justify-between items-center">
                     <button
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        onClick={openFileDialog}
                        type="button"
                        title="Adjuntar archivos"
                     >
                        <AttachIcon size={16} stroke={2} />
                        Adjuntar
                     </button>
                     
                     <button
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAddComment}
                        type="button"
                        disabled={(!newComment.trim() && files.length === 0) || isLoading}
                     >
                        {isLoading ? (
                           <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Enviando...
                           </>
                        ) : (
                           <>
                              <SendIcon size={16} stroke={2} />
                              Comentar
                           </>
                        )}
                     </button>
                  </div>
               </div>
            )}
            
            <input
               ref={fileInputRef}
               type="file"
               multiple
               className="hidden"
               onChange={handleFileChange}
            />
         </div>
      </section>
   )
}
