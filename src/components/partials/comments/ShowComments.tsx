import { AlertCircleIcon, AttachIcon, SendIcon, XIcon } from "@/assets/Icon"
import TextArea from "@/components/ui/TextArea"
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

   const scrollContainerRef = useRef<HTMLDivElement>(null)

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

   const handleAddComment = async () => {
      if (!newComment.trim() && files.length === 0) return
      const token = await getValidAccessToken()
      if (!token) return

      await addComment(token, task.id as string, newComment, files)
      setNewComment("")
      setFiles([])
   }

   return (
      <section className="space-y-4 w-full">
         <div className="flex items-center gap-2">
            <h6 className="text-lg font-semibold text-gray-900">Comentarios</h6>
            <span className="bg-gray-100 text-gray-600 flex justify-center items-center text-xs font-bold rounded-full w-6 h-6">
               {comments.totalElements}
            </span>
         </div>

         {/* Lista de comentarios */}
         {comments.content.length ? (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
               <div ref={scrollContainerRef}>
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
         <div className="bg-white border border-gray-100 rounded-xl p-4">
            <TextArea
               title=""
               value={newComment}
               onChange={setNewComment}
               placeholder="Escribe tu comentario..."
               maxLength={5000}
               minHeight='100px'
               maxHeight='200px'
               files={files}
               onFilesChange={setFiles}
               onRemoveFile={(index) => {
                  setFiles(prev => prev.filter((_, i) => i !== index))
               }}
               extensionAllowed="*"
               projectId={task.projectId as string}
            />

            <div className="flex justify-end items-center mt-3">
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
      </section>
   )
}
