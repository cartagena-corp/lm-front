'use client'

import { ProjectProps } from '@/lib/types/types'
import { useEffect, useRef, useState, DragEvent } from 'react'
import AutoResizeTextarea from '../../ui/AutoResizeTextarea'
import { useConfigStore } from '@/lib/store/ConfigStore'

interface CreateBoardFormProps {
  onSubmit: (newBoard: ProjectProps, jiraImport: File | null) => void
  onCancel: () => void
}

export default function CreateBoardForm({ onSubmit, onCancel }: CreateBoardFormProps) {
  const { projectStatus } = useConfigStore()
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [formData, setFormData] = useState<ProjectProps>({
    id: "",
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: { id: 0, name: "", color: "" },
    createdAt: "",
    updatedAt: "",
  })

  const [jiraImport, setJiraImport] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef(null)

  useEffect(() => {
    if (projectStatus) setFormData({
      ...formData,
      status: projectStatus[0]
    })
  }, [projectStatus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, jiraImport)
  }

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setJiraImport(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setJiraImport(e.target.files[0])
    else setJiraImport(null)
  }

  const clearFile = () => {
    setJiraImport(null)
    if (inputRef.current) inputRef.current.value = ''
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className='pt-4 pb-10 space-y-2.5'>
        {/* Nombre del Tablero */}
        <div className='space-y-1'>
          <label htmlFor="name" className="text-gray-700 text-sm font-medium">
            Nombre del Tablero
            <span className='text-red-500 pl-0.5'>*</span>
          </label>
          <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
            <input
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder='Ingresa el nombre del tablero...'
              className="outline-none text-sm w-full py-2"
              value={formData.name}
              name="name"
              type="text"
              id="name"
              required
            />
          </div>
        </div>

        {/* Descripción */}
        <div className='space-y-1'>
          <label htmlFor="desc" className="text-gray-700 text-sm font-medium">
            Descripción
            <span className='text-red-500 pl-0.5'>*</span>
          </label>
          <AutoResizeTextarea
            required
            value={formData.description}
            onChange={(str) => setFormData({ ...formData, description: str })}
            className='text-sm'
            placeholder='Describe el propósito y objetivos del tablero...'
          />
        </div>

        {/* Fecha de Inicio */}
        <div className='space-y-1'>
          <label htmlFor="startDate" className="text-gray-700 text-sm font-medium">
            Fecha de Inicio
            <span className='text-red-500 pl-0.5'>*</span>
          </label>
          <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
            <input
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="outline-none text-sm w-full py-2"
              value={formData.startDate}
              name="startDate"
              type="date"
              id="startDate"
              required
            />
          </div>
        </div>

        {/* Fecha de Finalización */}
        <div className='space-y-1'>
          <label htmlFor="endDate" className="text-gray-700 text-sm font-medium">
            Fecha de Finalización
            <span className='text-red-500 pl-0.5'>*</span>
          </label>
          <div className='border-gray-300 flex justify-center items-center rounded-md border px-2 gap-2'>
            <input
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="outline-none text-sm w-full py-2"
              value={formData.endDate}
              name="endDate"
              type="date"
              id="endDate"
              required
            />
          </div>
        </div>

        {/* Estado */}
        <div className='space-y-1 relative' ref={statusRef}>
          <label htmlFor="state" className="text-gray-700 text-sm font-medium">
            Estado
            <span className='text-red-500 pl-0.5'>*</span>
          </label>
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            type='button'
            className='border-gray-300 flex justify-center items-center select-none rounded-md border w-full px-2 gap-2'
          >
            <p className='py-2 w-full text-start text-sm'>
              {typeof formData.status === 'object' ? formData.status.name : ''}
            </p>
            <svg
              className={`text-gray-500 size-4 duration-150 ${isStatusOpen ? "-rotate-180" : ""}`} xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
            {isStatusOpen && (
              <div className='border-gray-300 bg-white shadow-md absolute z-10 top-[110%] flex flex-col items-start rounded-md border text-sm w-full max-h-28 overflow-y-auto'>
                {projectStatus?.map(obj => (
                  <div
                    key={obj.id}
                    onClick={() => { setFormData({ ...formData, status: obj }); setIsStatusOpen(false) }}
                    className='hover:bg-black/5 duration-150 w-full text-start py-2 px-2 flex items-center gap-2'
                  >
                    {obj === formData.status ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="size-3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="size-3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                      </svg>
                    )}
                    {obj.name}
                  </div>
                ))}
              </div>
            )}
          </button>
        </div>

        <div className='space-y-1'>
          <button type='button' onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className='text-gray-700 text-sm font-medium flex items-center gap-2'>
            Opciones avanzadas
            <svg className={`text-gray-500 size-3 duration-150 ${isAdvancedOpen ? "-rotate-180" : ""}`}
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {
            isAdvancedOpen &&
            <>
              <label htmlFor="importJira" className="text-gray-700 text-sm font-medium">
                Importar desde Jira
              </label>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative cursor-pointer flex justify-center items-center rounded-md border border-dashed border-gray-400 p-6 text-center ${dragActive ? 'bg-gray-50' : ''}`}
              >
                <input
                  ref={inputRef}
                  onChange={handleChange}
                  className="hidden"
                  name="importJira"
                  type="file"
                  id="importJira"
                />
                {jiraImport ? (
                  <div className="flex items-center space-x-2">
                    <p className="text-black/50 text-sm truncate">{jiraImport.name}</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearFile() }}
                      className="text-red-500 hover:text-red-700"
                    >
                      &#10005;
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Arrastra tu archivo aquí o haz click para seleccionar</p>
                )}
              </div>
            </>
          }
        </div>
      </div>

      {/* Botones */}
      <div className="pb-3 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="submit"
          className="text-white inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-blue-500 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
        >
          Crear Tablero
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </form >
  )
}
