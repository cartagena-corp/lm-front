import { useState } from "react"
import AutoResizeTextarea from "./AutoResizeTextarea"

interface Reply {
   name: string
   time: string
   comment: string
}

interface CommentProps {
   name: string
   time: string
   comment: string
   replies?: Reply[]
}

export default function Comment({ name, time, comment, replies = [] }: CommentProps) {
   const [gonnaReply, setGonnaReply] = useState<boolean>(false)
   const [newReply, setNewReply] = useState("")

   return (
      <div className="flex flex-col gap-2.5">
         <div className="flex items-start justify-start gap-2">
            <div className={`bg-green-500 h-8 w-8 rounded-full aspect-square mt-0.5`} />

            <div className="flex flex-col overflow-y-auto w-full">
               <div className="flex items-center justify-start gap-4">
                  <h6 className="text-black/50 text-sm"><b className="text-black">{name} · </b>
                     <span className="text-xs">
                        {time}
                     </span>
                  </h6>
               </div>
               <p className="text-xs">{comment}</p>
               {
                  !gonnaReply ?
                     <button type="button" onClick={() => setGonnaReply(true)}
                        className="text-blue-500 hover:text-blue-700 duration-150 text-xs text-start mt-1">
                        Responder
                     </button>
                     :
                     <div className='flex justify-between items-stretch gap-2 text-xs mt-1'>
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
         {
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
         }
      </div >
   )
}