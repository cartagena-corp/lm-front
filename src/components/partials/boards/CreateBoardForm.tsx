'use client'

import { ProjectProps } from '@/lib/types/types'
import { useEffect, useRef, useState, DragEvent } from 'react'
import AutoResizeTextarea from '../../ui/AutoResizeTextarea'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { XIcon, PlusIcon } from '@/assets/Icon'

interface CreateBoardFormProps {
  onSubmit: (newBoard: ProjectProps, jiraImport: File | null) => void
  onCancel: () => void
  editData?: ProjectProps | null // Para modo edición
  isEdit?: boolean // Para determinar si es edición o creación
}

export default function CreateBoardForm({ onSubmit, onCancel, editData = null, isEdit = false }: CreateBoardFormProps) {
  const { projectStatus } = useConfigStore()
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [formData, setFormData] = useState<ProjectProps>({
    id: editData?.id || "",
    name: editData?.name || "",
    description: editData?.description || "",
    startDate: editData?.startDate || "",
    endDate: editData?.endDate || "",
    status: editData?.status || { id: 0, name: "", color: "" },
    createdAt: editData?.createdAt || "",
    updatedAt: editData?.updatedAt || "",
  })

  const [jiraImport, setJiraImport] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef(null)

  useEffect(() => {
    if (projectStatus && !isEdit) {
      setFormData({
        ...formData,
        status: projectStatus[0]
      })
    } else if (projectStatus && isEdit && editData) {
      // En modo edición, mantener el estado actual del proyecto
      const currentStatus = projectStatus.find(status => 
        (typeof editData.status === 'object' && (editData.status !== null && status.id === editData.status.id)) ||
        (typeof editData.status === 'number' && status.id === editData.status) || { id: 0, name: "", color: "" }
      )
      if (currentStatus) {
        setFormData(prev => ({
          ...prev,
          status: currentStatus
        }))
      }
    }
  }, [projectStatus, isEdit, editData])

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
    <div className="bg-white border-gray-100 rounded-xl shadow-sm border">
      {/* Header */}
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 rounded-lg p-2">
              <PlusIcon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isEdit ? 'Editar Tablero' : 'Crear Nuevo Tablero'}
              </h3>
              <p className="text-sm text-gray-500">
                {isEdit ? 'Modifica los detalles del tablero' : 'Completa los detalles del nuevo tablero'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <XIcon />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className='space-y-5 mt-4'>
        {/* Nombre del Tablero */}
        <div className='space-y-2'>
          <label htmlFor="name" className="text-gray-900 text-sm font-semibold">
            Nombre del Tablero
            <span className='text-red-500 ml-1'>*</span>
          </label>
          <div className='border-gray-200 flex items-center rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
            <input
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={isEdit ? (editData?.name || 'Nombre del tablero') : 'Ej: Proyecto Marketing Digital 2025'}
              className="outline-none text-sm w-full bg-transparent placeholder-gray-400"
              value={formData.name}
              name="name"
              type="text"
              id="name"
              required
            />
          </div>
        </div>

        {/* Descripción */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm gap-2'>
            <label htmlFor="desc" className="text-gray-900 font-semibold">
              Descripción
              <span className='text-red-500 ml-1'>*</span>
            </label>

            <div className='flex items-center gap-2 text-xs'>
              <div className={`w-2 h-2 rounded-full ${formData.description.length > 280 ? 'bg-red-500' : formData.description.length > 250 ? 'bg-orange-500' : 'bg-green-500'}`} />
              <span className={`font-medium ${formData.description.length > 280 ? 'text-red-600' : formData.description.length > 250 ? 'text-orange-600' : 'text-green-600'}`}>
                {formData.description.length}/300
              </span>
            </div>
          </div>
          <div className='space-y-2'>
            <div className='border-gray-200 flex items-center rounded-lg border focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
              <AutoResizeTextarea
                required
                value={formData.description}
                onChange={(str) => {
                  if (str.length <= 300) {
                    setFormData({ ...formData, description: str })
                  }
                }}
                className='text-sm! px-4 py-2 w-full resize-none bg-transparent placeholder-gray-400 border-0!'
                placeholder='Describe el propósito, objetivos y alcance del tablero...'
              />
            </div>
            <p className='text-gray-500 leading-relaxed text-xs'>
              💡 Una descripción clara ayuda al equipo a entender el propósito del proyecto
            </p>
          </div>
        </div>

        {/* Fechas en Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha de Inicio */}
          <div className='space-y-2'>
            <label htmlFor="startDate" className="text-gray-900 text-sm font-semibold">
              Fecha de Inicio
              <span className='text-red-500 ml-1'>*</span>
            </label>
            <div className='border-gray-200 flex items-center rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
              <input
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="outline-none text-sm w-full bg-transparent"
                value={formData.startDate}
                name="startDate"
                type="date"
                id="startDate"
                required
              />
            </div>
          </div>

          {/* Fecha de Finalización */}
          <div className='space-y-2'>
            <label htmlFor="endDate" className="text-gray-900 text-sm font-semibold">
              Fecha de Finalización
              <span className='text-red-500 ml-1'>*</span>
            </label>
            <div className='border-gray-200 flex items-center rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
              <input
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="outline-none text-sm w-full bg-transparent"
                value={formData.endDate}
                name="endDate"
                type="date"
                id="endDate"
                required
              />
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className='space-y-2 relative' ref={statusRef}>
          <label htmlFor="state" className="text-gray-900 text-sm font-semibold">
            Estado
            <span className='text-red-500 ml-1'>*</span>
          </label>
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            type='button'
            className='border-gray-200 flex items-center justify-between rounded-lg border w-full px-4 py-3 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
          >
            <div className="flex items-center gap-3">
              {typeof formData.status === 'object' && formData.status.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: formData.status.color }}
                />
              )}
              <span className='text-sm text-gray-700'>
                {typeof formData.status === 'object' ? formData.status.name : 'Seleccionar estado'}
              </span>
            </div>
            <svg
              className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isStatusOpen ? "rotate-180" : ""}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {isStatusOpen && (
            <div className='border-gray-200 bg-white shadow-lg absolute z-10 top-full mt-1 flex flex-col rounded-lg border text-sm w-full max-h-32 overflow-y-auto'>
              {projectStatus?.map(obj => (
                <div
                  key={obj.id}
                  onClick={() => { setFormData({ ...formData, status: obj }); setIsStatusOpen(false) }}
                  className='hover:bg-blue-50 duration-150 w-full text-start py-3 px-4 flex items-center gap-3 cursor-pointer'
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: obj.color }}
                    />
                    <span className="text-gray-700">{obj.name}</span>
                  </div>
                  {(typeof formData.status === 'object' && obj.id === formData.status.id) && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4 text-blue-600"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Opciones Avanzadas - Solo mostrar en modo creación */}
        {!isEdit && (
          <div className='space-y-3'>
            <button
              type='button'
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className='text-gray-700 text-sm font-medium flex items-center gap-2 hover:text-gray-900 transition-colors duration-200'
            >
              <svg className={`text-gray-500 w-4 h-4 transition-transform duration-200 ${isAdvancedOpen ? "rotate-180" : ""}`}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
              Opciones avanzadas
            </button>
            {isAdvancedOpen && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <label htmlFor="importJira" className="text-gray-900 text-sm font-semibold">
                    Importar desde Jira
                  </label>
                </div>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`relative cursor-pointer flex flex-col justify-center items-center rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <input
                    ref={inputRef}
                    onChange={handleChange}
                    className="hidden"
                    name="importJira"
                    type="file"
                    id="importJira"
                    accept=".json,.csv,.xlsx"
                  />
                  {jiraImport ? (
                    <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-gray-200">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700 text-sm font-medium truncate">{jiraImport.name}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); clearFile() }}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Arrastra tu archivo</span> o haz click para seleccionar
                      </p>
                      <p className="text-xs text-gray-500">
                        Soporta archivos JSON, CSV y XLSX
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white hover:bg-gray-50 hover:border-gray-300 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isEdit ? 'Actualizar Tablero' : 'Crear Tablero'}
        </button>
      </div>
      </form>
    </div>
  )
}
