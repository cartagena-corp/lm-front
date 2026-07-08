import { Send } from "lucide-react"
import TextArea from "@/components/ui/TextArea"
import Comment from "@/components/ui/Comment"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useCommentStore } from "@/lib/store/CommentStore"
import { GlobalPagination, CommentProps, TaskProps } from "@/lib/types/types"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import { useEffect, useState, useRef } from "react"

interface ShowCommentsProps {
   arrayComments: GlobalPagination
   task: TaskProps
}

export default function ShowComments({ arrayComments, task }: ShowCommentsProps) {
   const { getValidAccessToken, user } = useAuthStore()
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
      <section className="space-y-2 w-full px-0.5">
         <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold" style={{ color: "var(--ds-text)" }}>Comentarios</h3>
            <span className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
               {comments.totalElements}
            </span>
         </div>

         {/* Lista de comentarios */}
         {comments.content.length ? (
            <div className="overflow-hidden" style={{ background: "var(--ds-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-border)" }}>
               <div ref={scrollContainerRef} className="max-h-[60vh] overflow-y-auto">
                  <div>
                     {comments.content.map((c, idx) => (
                        <div key={c.id} className="p-4" style={idx > 0 ? { borderTop: "1px solid var(--ds-border)" } : undefined}>
                           <Comment comment={c as CommentProps} />
                        </div>
                     ))}
                  </div>

                  {/* Loading indicator for infinite scroll */}
                  {isLoadingMore && (
                     <div className="flex items-center justify-center py-4" style={{ borderTop: "1px solid var(--ds-border)" }}>
                        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ds-text-secondary)" }}>
                           <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "2px solid var(--ds-border)", borderTopColor: "var(--blue-700)" }}></div>
                           Cargando más comentarios...
                        </div>
                     </div>
                  )}

                  {/* Load more button - shown when there are more comments and not loading */}
                  {hasMoreComments && !isLoadingMore && (
                     <div className="flex items-center justify-center py-4" style={{ borderTop: "1px solid var(--ds-border)" }}>
                        <button
                           onClick={handleLoadMore}
                           className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
                           style={{ color: "var(--blue-700)" }}
                        >
                           Cargar más comentarios
                        </button>
                     </div>
                  )}

                  {/* End of comments indicator */}
                  {!hasMoreComments && comments.content.length > 0 && (
                     <div className="flex items-center justify-center py-4" style={{ borderTop: "1px solid var(--ds-border)" }}>
                        <div className="text-xs" style={{ color: "var(--ds-text-muted)" }}>
                           No hay más comentarios
                        </div>
                     </div>
                  )}
               </div>
            </div>
         ) : (
            <p className="text-sm" style={{ color: "var(--ds-text-muted)" }}>Aún no hay comentarios. Sé el primero en comentar.</p>
         )}

         {/* Área de nuevo comentario */}
         <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5" style={{ background: "var(--gray-alpha-200)" }}>
               {user && (
                  <img
                     src={getUserAvatar({ picture: user.picture || undefined, firstName: user.firstName, lastName: user.lastName, email: user.email }, 32)}
                     alt=""
                     className="w-full h-full object-cover"
                  />
               )}
            </div>
            <div className="flex-1 min-w-0">
               <TextArea
                  title=""
                  value={newComment}
                  onChange={setNewComment}
                  placeholder="Escribe tu comentario..."
                  maxLength={5000}
                  minHeight='44px'
                  maxHeight='160px'
                  files={files}
                  onFilesChange={setFiles}
                  onRemoveFile={(index) => {
                     setFiles(prev => prev.filter((_, i) => i !== index))
                  }}
                  extensionAllowed="*"
                  projectId={task.projectId as string}
               />

               <div className="flex justify-end items-center mt-2">
                  <button
                     className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                     style={{ color: "var(--primary-contrast-fg)" }}
                     onClick={handleAddComment}
                     type="button"
                     disabled={(!newComment.trim() && files.length === 0) || isLoading}
                  >
                     {isLoading ? (
                        <>
                           <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "2px solid var(--gray-alpha-400)", borderTopColor: "transparent" }}></div>
                           Enviando...
                        </>
                     ) : (
                        <>
                           <Send size={14} strokeWidth={2} />
                           Comentar
                        </>
                     )}
                  </button>
               </div>
            </div>
         </div>
      </section>
   )
}
