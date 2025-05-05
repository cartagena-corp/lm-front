import { useState } from "react"
import AutoResizeTextarea from "./AutoResizeTextarea"
import { CommentProps } from "@/lib/types/types"
import Image from "next/image"
import { DownloadIcon } from "@/assets/Icon"
import Link from "next/link"

interface Props {
   comment: CommentProps
}

export default function Comment({ comment }: Props) {
   const [gonnaReply, setGonnaReply] = useState<boolean>(false)
   const [newReply, setNewReply] = useState("")

   return (
      <div className="flex flex-col gap-2.5">
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
               <div className={`border-black/15 ${gonnaReply && "bg-sky-100"} duration-150 border rounded-md flex flex-col overflow-y-auto p-2`}>
                  <h6 className="font-bold text-sm">{comment.user.firstName} {comment.user.lastName}</h6>
                  <p className="text-black/75 text-xs mt-1 mb-2">{comment.text}</p>
                  <div className="flex flex-wrap gap-2">
                     {
                        comment.attachments.map((file, idx) => {
                           const fileSplitted = file.fileName.split(".")
                           const extension = fileSplitted[fileSplitted.length - 1]

                           const isImage = ["jpg", "png", "jpeg", "gif", "bmp", "webp"].includes(extension.toLowerCase())
                           const url = file.fileUrl

                           console.log("isImage", isImage)
                           console.log("url", url)
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
               <div className={`flex items-center gap-2 text-xs mt-1`}>
                  <span className="text-black/25">
                     {
                        (() => {
                           const dateStr = comment.createdAt
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
                        })()
                     }
                  </span>
                  <button type="button" onClick={() => setGonnaReply(!gonnaReply)}
                     className="text-blue-500 hover:text-blue-700 duration-150">
                     Responder
                  </button>
               </div>
               {
                  gonnaReply &&
                  <div className='flex justify-between items-stretch gap-2 text-xs mt-2'>
                     <AutoResizeTextarea
                        value={newReply}
                        onChange={setNewReply}
                        placeholder="Escribe tu respuesta..."
                     />

                     <button type="button" onClick={() => setGonnaReply(false)} className='bg-blue-600 hover:bg-blue-800 text-white duration-150 rounded-md border aspect-square p-2'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" className='size-4'>
                           <path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" strokeWidth="2" />
                           <path d="M11.5 12.5L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                     </button>
                  </div>
               }
            </div>
         </div>
         {/* {
            replies.length > 0 && replies.map((reply, i) =>
               <div key={i} className="flex items-start justify-start gap-2 ml-4">
                  <div className={`bg-yellow-500 h-8 w-8 rounded-full aspect-square mt-0.5`} />

                  <div className="flex flex-col">
                     <div className="flex items-center justify-start gap-4">
                        <h6 className="text-black/50 text-sm"><b className="text-black">{reply.name} · </b>
                           <span className="text-xs">
                              {reply.time}
                           </span>
                        </h6>
                     </div>
                     <p className="text-xs">{reply.comment}</p>
                  </div>
               </div>
            )
         } */}
      </div>
   )
}