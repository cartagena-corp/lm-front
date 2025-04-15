'use client'

import { FormEvent, useState, useEffect, useRef } from 'react'
import Comment from '../ui/Comment'
import AutoResizeTextarea from '../ui/AutoResizeTextarea'

interface Task {
   id: string
   task: string
   desc: string
   priority: string
}

interface TaskDetailsFormProps {
   onSubmit: (
      data: {
         keyword: string
         state: string
         sort: string
         isAsc: boolean
      }) => void
   onCancel: () => void
   task: Task

}

export default function TaskDetailsForm({ onSubmit, onCancel, task }: TaskDetailsFormProps) {
   const [formData, setFormData] = useState<{ keyword: string, state: string, sort: string, isAsc: boolean }>({
      keyword: "",
      state: "Cualquier estado",
      sort: "Fecha de creación",
      isAsc: false,
   })

   const handleSubmit = (e: FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
   }

   const comments = [
      {
         name: "Kenn Marcucci",
         time: "Hace 2 horas",
         comment: "Esto es un comentario de prueba, por favor omite este comentario.",
         replies: [
            {
               name: "Diego Pedrozo",
               time: "hace 1 hora",
               comment: "Esto es una respuesta de prueba al comentario de prueba, por favor omite esta respuesta de comentario también. Tal vez este mensaje es más largo de lo que parece pero al final nos daremos cuenta de que si este mensaje es largo, el comentario mantiene su responsive, asi que personalmente y genuinamente necesito este comentario demasiado largo para probar si el diseño está bien o no.",
            }
         ]
      },
      {
         name: "Diego Pedrozo",
         time: "Hace 4 horas",
         comment: "Esta tarea no me pertenece, está enfocada en el frontend y yo soy backend.",
         replies: [
            {
               name: "Kenn Marcucci",
               time: "hace 2 minutos",
               comment: "Tienes razón, esta tarea me pertenece, ",
            },
            {
               name: "Juan Cartagena",
               time: "hace 30 segundos",
               comment: "Esto es una segunda respuesta para probar si se pueden ver de manera bien todas las respuestas y si se diferencian de los otros comentarios.",
            },
         ]
      },
   ]

   const [newComment, setNewComment] = useState("")

   return (
      <form onSubmit={handleSubmit}>
         <article className='flex justify-between items-stretch gap-5 mt-4'>
            <aside className='flex flex-col'>
               <section className='flex flex-col gap-2 mb-3'>
                  <article className='space-y-1'>
                     <h6 className='font-semibold'>Descripción</h6>
                     <div className='border-black/15 text-black/75 rounded-md text-sm border p-4 h-32 overflow-y-auto'>
                        {task.desc}
                     </div>
                  </article>
               </section>

               <section className='space-y-2'>
                  <h6 className='font-semibold'>Comentarios</h6>
                  <div className='border-black/15 flex flex-col justify-stretch gap-6 max-h-[340px] overflow-y-auto p-4 border rounded-md'>
                     {
                        comments.map((cmt, i) =>
                           <Comment key={i}
                              name={cmt.name}
                              time={cmt.time}
                              comment={cmt.comment}
                              replies={cmt.replies}
                           />
                        )
                     }
                  </div>
                  <div className='flex justify-between items-stretch gap-2 text-xs overflow-y-auto'>
                     <AutoResizeTextarea
                        value={newComment}
                        onChange={setNewComment}
                        placeholder="Escribe tu comentario..."
                     />

                     <button type='button' className='bg-blue-600 hover:bg-blue-800 text-white duration-150 rounded-md border aspect-square p-2'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" className='size-4'>
                           <path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" strokeWidth="2" />
                           <path d="M11.5 12.5L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                     </button>
                  </div>
               </section>
            </aside>

            <span className='bg-black/10 w-1' />

            <aside className='flex flex-col space-y-4 min-w-[25%]'>
               <article className='space-y-1 whitespace-nowrap'>
                  <h6 className='font-semibold'>Estado</h6>
                  <div className='border-black/15 text-black/75 rounded-md text-sm border p-2.5'>
                     En progreso
                  </div>
               </article>
               <article className='space-y-1 whitespace-nowrap'>
                  <h6 className='font-semibold'>Asignado a</h6>
                  <div className='border-black/15 text-black/75 rounded-md text-sm border p-2.5'>
                     Kenn Marcucci
                  </div>
               </article>
               <article className='space-y-1 whitespace-nowrap'>
                  <h6 className='font-semibold'>Informador</h6>
                  <div className='border-black/15 text-black/75 rounded-md text-sm border p-2.5'>
                     Diego Pedrozo
                  </div>
               </article>
               <article className='space-y-1 whitespace-nowrap'>
                  <h6 className='font-semibold'>Prioridad</h6>
                  <div className='border-black/15 text-black/75 rounded-md text-sm border p-2.5'>
                     <span className={`${task.priority === "Low" ? "bg-green-200 text-green-700" : task.priority === "Medium" ?
                        "bg-yellow-100 text-yellow-700" : "bg-red-200 text-red-700"} text-xs rounded-full px-2.5 py-0.5`}>
                        {task.priority}
                     </span>
                  </div>
               </article>
               <article className='space-y-1 whitespace-nowrap'>
                  <h6 className='font-semibold'>Fecha creación</h6>
                  <div className='border-black/15 text-black/75 rounded-md text-sm border p-2.5'>
                     01 de enero, 2025
                  </div>
               </article>
               <article className='space-y-1 whitespace-nowrap'>
                  <h6 className='font-semibold'>Última actualización</h6>
                  <div className='border-black/15 text-black/75 rounded-md text-sm border p-2.5'>
                     15 de marzo, 2025
                  </div>
               </article>
               <article className='space-y-1 whitespace-nowrap'>
                  <h6 className='font-semibold'>Tiempo estimado</h6>
                  <div className='border-black/15 text-black/75 rounded-md text-sm border p-2.5'>
                     8 horas y 45 minutos
                  </div>
               </article>
            </aside>
         </article>
         <div className="flex gap-4 mt-6">
            <button
               type="button"
               className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
               onClick={onCancel}
            >
               Cancelar
            </button>
            <button
               type="submit"
               className="text-white inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold textWhite shadow-sm hover:bg-blue-800 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
            >
               Guardar Cambios
            </button>
         </div>
      </form>
   )
}
