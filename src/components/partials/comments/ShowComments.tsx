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
   const { addComment } = useCommentStore()

   const fileInputRef = useRef<HTMLInputElement>(null)

   const [comments, setComments] = useState<GlobalPagination>(arrayComments)
   const [dragActive, setDragActive] = useState<boolean>(false)
   const [newComment, setNewComment] = useState<string>("")
   const [files, setFiles] = useState<File[]>([])

   useEffect(() => {
      setComments(arrayComments)
   }, [arrayComments])

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

   return (
      <section className="space-y-2 w-full" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
         <h6 className="font-semibold">Comentarios</h6>

         {
            comments.content.length ?
               <div className="border-black/15 flex flex-col gap-6 max-h-60 overflow-y-auto rounded-md w-full border p-4">
                  {comments.content.map((c) => <Comment key={c.id} comment={c as CommentProps} />)}
               </div>
               :
               <div className="border-black/15 text-black/50 flex flex-col justify-center items-center h-40 p-4 border rounded-md w-full">
                  <AlertCircleIcon />
                  <h6 className="text-sm">Aún no hay comentarios</h6>
                  <p className="text-xs">Sé el primero en comentar</p>
               </div>
         }

         <div className="flex flex-col">
            {
               files.length > 0 &&
               <div className="mb-2 flex flex-wrap gap-2">
                  {
                     files.map((file, idx) => {
                        const isImage = file.type.startsWith("image/")
                        const url = isImage ? URL.createObjectURL(file) : null
                        return (
                           <div key={idx} className="border-black/15 relative flex flex-col items-center justify-center overflow-hidden rounded border p-1 text-xs">
                              {
                                 isImage && url ?
                                    <Image src={url} alt={file.name} height={64} width={64} className="object-cover rounded" />
                                    :
                                    <div className="flex flex-col w-fit items-center justify-between rounded px-5">
                                       <span className="truncate">{file.name}</span>
                                       <span className="text-gray-500">
                                          {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                                       </span>
                                    </div>
                              }
                              <button
                                 type="button"
                                 className="bg-gray-800/75 hover:bg-gray-800 absolute top-0 right-0 m-0.5 rounded-full p-0.5 text-white"
                                 onClick={() => removeFile(idx)}
                              >
                                 <XIcon size={12} stroke={2} />
                              </button>
                           </div>
                        )
                     })
                  }
               </div>
            }

            {/* Zona de drop vs textarea + botón */}
            {
               dragActive ?
                  <div className="relative mb-2 flex h-24 w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-blue-500 bg-blue-50 p-4">
                     <p className="text-xs text-gray-500">
                        Arrastra aquí tus archivos
                     </p>
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
                  :
                  <div className="border-black/15 border rounded-md flex flex-col text-xs p-2">
                     <AutoResizeTextarea className="border-0!"
                        value={newComment}
                        onChange={setNewComment}
                        placeholder="Escribe tu comentario..."
                     />
                     <div className="text-black/50 flex justify-between items-center">
                        <button className="text-black/60 hover:text-black hover:bg-black/5 flex p-1.5 rounded-md duration-150 w-fit"
                           onClick={() => openFileDialog()} type="button" title="Adjuntar archivos" >
                           <AttachIcon size={18} stroke={2} />
                        </button>
                        <button className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-md duration-150 w-fit" onClick={handleAddComment} type="button"  >
                           <SendIcon size={18} stroke={2} />
                        </button>
                        <input
                           ref={fileInputRef}
                           type="file"
                           multiple
                           className="hidden"
                           onChange={handleFileChange}
                        />
                     </div>
                  </div>
            }
         </div>
      </section >
   )
}
