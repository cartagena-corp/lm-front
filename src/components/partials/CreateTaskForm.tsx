'use client'

import { useRef, useState } from 'react'
import AutoResizeTextarea from '../ui/AutoResizeTextarea'

interface FormProps {
  onSubmit: (data: {
    title: string
    desc: string
    priority: string
    limitDate: string
    user: string
  }) => void
  onCancel: () => void
}


export default function CreateTaskForm({ onSubmit, onCancel }: FormProps) {
  const [isPriorityOpen, setIsPriorityOpen] = useState(false)
  const [isUserOpen, setIsUserOpen] = useState(false)
  const [formData, setFormData] = useState<{ title: string, desc: string, priority: string, limitDate: string, user: string }>({
    title: "",
    desc: "",
    priority: "Baja",
    limitDate: "",
    user: "Kenn Marcucci",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const priorityRef = useRef(null)
  const userRef = useRef(null)

  const userSelect = [
    { user: "Kenn Marcucci" },
    { user: "Diego Pedrozo" },
    { user: "Juan Cartagena" },
    { user: "Natalia Ariza" },
  ]

  const prioritySelect = [
    { priority: "Baja" },
    { priority: "Media" },
    { priority: "Alta" },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className='pt-4 pb-14 space-y-4'>
        <div className='space-y-1'>
          <label htmlFor="title" className="text-gray-700 text-sm font-medium">
            Título
          </label>
          <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
            <input onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="outline-none text-sm w-full py-2"
              value={formData.title}
              name="title"
              type="text"
              id="title"
            />
          </div>
        </div>

        <div className='space-y-1'>
          <label htmlFor="desc" className="text-gray-700 text-sm font-medium">
            Descripción
          </label>
          <AutoResizeTextarea
            value={formData.desc}
            onChange={(str) => setFormData({ ...formData, desc: str })}
            className='text-sm'
          />
        </div>

        <div className='space-y-1 relative' ref={priorityRef}>
          <label htmlFor="priority" className="text-gray-700 text-sm font-medium">
            Prioridad
          </label>

          <button onClick={() => {
            setIsPriorityOpen(!isPriorityOpen)
            setIsUserOpen(false)
          }} type='button'
            className='border-gray-300 flex justify-center items-center select-none rounded-md border w-full px-2 gap-2'>
            <p className='py-2 w-full text-start text-sm'>
              {formData.priority}
            </p>

            <svg className={`text-gray-500 size-4 duration-150 ${isPriorityOpen ? "-rotate-180" : ""}`}
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {
            isPriorityOpen &&
            <div className='border-gray-300 bg-white shadow-md absolute z-10 top-[105%] flex flex-col items-start rounded-md border text-sm w-full max-h-28 overflow-y-auto'>{
              prioritySelect.map((obj, i) =>
                <button key={i} onClick={() => { setFormData({ ...formData, priority: obj.priority }), setIsPriorityOpen(false) }} type='button'
                  className='hover:bg-black/5 duration-150 w-full text-start py-2 px-2 flex items-center gap-2'>
                  {
                    obj.priority === formData.priority ?
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      :
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                      </svg>

                  }
                  {obj.priority}
                </button>
              )
            }</div>
          }
        </div>

        <div className='space-y-1 relative' ref={userRef}>
          <label htmlFor="user" className="text-gray-700 text-sm font-medium">
            Asignar a
          </label>

          <button onClick={() => {
            setIsUserOpen(!isUserOpen)
            setIsPriorityOpen(false)
          }} type='button'
            className='border-gray-300 flex justify-center items-center select-none rounded-md border w-full px-2 gap-2'>
            <p className='py-2 w-full text-start text-sm'>
              {formData.user}
            </p>

            <svg className={`text-gray-500 size-4 duration-150 ${isUserOpen ? "-rotate-180" : ""}`}
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {
            isUserOpen &&
            <div className='border-gray-300 bg-white shadow-md absolute z-10 top-[105%] flex flex-col items-start rounded-md border text-sm w-full max-h-28 overflow-y-auto'>{
              userSelect.map((obj, i) =>
                <button key={i} onClick={() => { setFormData({ ...formData, user: obj.user }), setIsUserOpen(false) }} type='button'
                  className='hover:bg-black/5 duration-150 w-full text-start py-2 px-2 flex items-center gap-2'>
                  {
                    obj.user === formData.user ?
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      :
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                      </svg>

                  }
                  {obj.user}
                </button>
              )
            }</div>
          }
        </div>

        <div className='space-y-1'>
          <label htmlFor="limitdate" className="text-gray-700 text-sm font-medium">
            Fecha límite
          </label>
          <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
            <input onChange={(e) => setFormData({ ...formData, limitDate: e.target.value })}
              className="outline-none text-sm w-full py-2"
              value={formData.limitDate}
              name="limitdate"
              type="date"
              id="limitdate"
            />
          </div>
        </div>

      </div>
      <div className="pb-3 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="submit"
          className="text-white inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold textWhite shadow-sm hover:bg-blue-500 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
        >
          Crear Nueva Tarea
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
