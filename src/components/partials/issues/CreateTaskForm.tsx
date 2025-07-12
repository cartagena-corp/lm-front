'use client'

import React, { useRef, useState, useEffect } from 'react'
import { TaskProps } from '@/lib/types/types'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import Image from 'next/image'
import { PlusIcon, XIcon } from '@/assets/Icon'
import { useBoardStore } from '@/lib/store/BoardStore'
import AutoResizeTextarea from '@/components/ui/AutoResizeTextarea'
import { getUserAvatar } from '@/lib/utils/avatar.utils'

interface FormProps {
  onSubmit: (data: TaskProps) => void
  onCancel: () => void
  taskObject?: TaskProps // Optional task object for editing
  isEdit?: boolean // Flag to determine if we're editing
}

export default function CreateTaskForm({ onSubmit, onCancel, taskObject, isEdit = false }: FormProps) {
  const { projectConfig, projectParticipants } = useConfigStore()
  const { selectedBoard } = useBoardStore()
  const { listUsers } = useAuthStore()

  // Combine project participants with the project creator (avoid duplicates)
  const allProjectUsers = React.useMemo(() => {
    const participants = [...projectParticipants]
    
    // Add project creator if not already in participants
    if (selectedBoard?.createdBy && !participants.some(p => p.id === selectedBoard.createdBy?.id)) {
      // Find the creator in the full user list to get complete information including email
      const creatorFromUserList = listUsers.find(user => user.id === selectedBoard.createdBy?.id)
      
      participants.push({
        id: selectedBoard.createdBy.id,
        firstName: selectedBoard.createdBy.firstName,
        lastName: selectedBoard.createdBy.lastName,
        email: creatorFromUserList?.email || '', // Get email from full user list
        picture: selectedBoard.createdBy.picture
      })
    }
    
    return participants
  }, [projectParticipants, selectedBoard?.createdBy, listUsers])

  // Initialize user selection - if editing, find the assigned user, otherwise use first participant
  const initialUser = isEdit && taskObject?.assignedId
    ? allProjectUsers.find(user => user.id === (typeof taskObject.assignedId === 'string' ? taskObject.assignedId : taskObject.assignedId?.id)) || allProjectUsers[0]
    : allProjectUsers[0]

  const [userSelected, setUserSelected] = useState(initialUser)

  // Initialize descriptions with project descriptions and their values
  const [descriptionValues, setDescriptionValues] = useState<{ [key: string]: string }>({})

  // Effect to populate description values when editing and projectConfig is available
  useEffect(() => {
    if (isEdit && taskObject?.descriptions && projectConfig?.issueDescriptions) {
      const initialValues: { [key: string]: string } = {}
      
      // For editing, populate with existing description values by matching titles
      taskObject.descriptions.forEach(taskDesc => {
        // Find the project description that matches this task description by title
        const projectDesc = projectConfig.issueDescriptions.find(
          projDesc => projDesc.name === taskDesc.title
        )
        if (projectDesc) {
          initialValues[projectDesc.id] = taskDesc.text || ''
        }
      })
      
      setDescriptionValues(initialValues)
    }
  }, [isEdit, taskObject, projectConfig])

  const [isPriorityOpen, setIsPriorityOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isUserOpen, setIsUserOpen] = useState(false)
  const [isTypeOpen, setIsTypeOpen] = useState(false)

  const [formData, setFormData] = useState<TaskProps>({
    id: isEdit ? taskObject?.id : undefined,
    title: isEdit ? taskObject?.title || "" : "",
    descriptions: isEdit ? taskObject?.descriptions || [] : [],
    priority: isEdit ? taskObject?.priority || Number(projectConfig?.issuePriorities[0]?.id) : Number(projectConfig?.issuePriorities[0]?.id),
    status: isEdit ? taskObject?.status || Number(projectConfig?.issueStatuses[0]?.id) : Number(projectConfig?.issueStatuses[0]?.id),
    type: isEdit ? taskObject?.type || Number(projectConfig?.issueTypes[0]?.id) : Number(projectConfig?.issueTypes[0]?.id),
    projectId: isEdit ? taskObject?.projectId || selectedBoard?.id as string : selectedBoard?.id as string,
    assignedId: isEdit ? taskObject?.assignedId || "" : "",
    estimatedTime: isEdit ? taskObject?.estimatedTime || 0 : 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let descriptions: any[] = []

    if (isEdit) {
      // For editing, maintain original description IDs and update only the text
      descriptions = taskObject?.descriptions?.map(originalDesc => {
        // Find the corresponding project description to get the current text value
        const projectDesc = projectConfig?.issueDescriptions?.find(
          projDesc => projDesc.name === originalDesc.title
        )
        
        if (projectDesc && descriptionValues[projectDesc.id] && descriptionValues[projectDesc.id].trim()) {
          // Keep original ID but update text
          return {
            id: originalDesc.id, // Keep the original ID from the task
            title: originalDesc.title,
            text: descriptionValues[projectDesc.id]
          }
        }
        return null
      }).filter(Boolean) || []

      // Also add any new descriptions that weren't in the original task
      const newDescriptions = projectConfig?.issueDescriptions
        ?.filter(projDesc => {
          // Check if this project description doesn't exist in original task descriptions
          const existsInOriginal = taskObject?.descriptions?.some(
            originalDesc => originalDesc.title === projDesc.name
          )
          return !existsInOriginal && descriptionValues[projDesc.id] && descriptionValues[projDesc.id].trim()
        })
        ?.map(projDesc => ({
          title: projDesc.name,
          text: descriptionValues[projDesc.id]
        })) || []

      descriptions = [...descriptions, ...newDescriptions]
    } else {
      // For creating, build descriptions array from the values entered by the user
      descriptions = projectConfig?.issueDescriptions
        ?.filter(desc => descriptionValues[desc.id] && descriptionValues[desc.id].trim()) // Only include descriptions with content
        ?.map(desc => ({
          title: desc.name,
          text: descriptionValues[desc.id]
        })) || []
    }

    if (isEdit) {
      // For editing, we need to format the data differently and exclude assignedId
      const editData = {
        ...formData,
        descriptions
        // assignedId is intentionally excluded for edits
      }
      onSubmit(editData)
    } else {
      // For creating, use the original format including assignedId
      onSubmit({ ...formData, descriptions, assignedId: userSelected.id })
    }
  }

  const handleDescriptionChange = (descriptionId: string, value: string) => {
    setDescriptionValues(prev => ({
      ...prev,
      [descriptionId]: value
    }))
  }

  const priorityRef = useRef(null)
  const statusRef = useRef(null)
  const userRef = useRef(null)
  const typeRef = useRef(null)

  // Effect to handle clicks outside of selects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priorityRef.current && !(priorityRef.current as HTMLElement).contains(event.target as Node)) {
        setIsPriorityOpen(false)
      }
      if (statusRef.current && !(statusRef.current as HTMLElement).contains(event.target as Node)) {
        setIsStatusOpen(false)
      }
      if (userRef.current && !(userRef.current as HTMLElement).contains(event.target as Node)) {
        setIsUserOpen(false)
      }
      if (typeRef.current && !(typeRef.current as HTMLElement).contains(event.target as Node)) {
        setIsTypeOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
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
                  {isEdit ? 'Editar Tarea' : 'Crear Nueva Tarea'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isEdit ? 'Modifica los detalles de la tarea' : 'Completa los detalles de la nueva tarea'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="bg-white text-gray-400 hover:text-gray-700 rounded-md cursor-pointer p-2 hover:bg-gray-50 transition-all duration-200"
            >
              <XIcon size={20} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className='space-y-3'>
            {/* Asignar a - Solo mostrar cuando no se está editando */}
            {!isEdit && (
              <div className='relative' ref={userRef}>
                <label className="text-gray-900 text-sm font-semibold">
                  Asignar a
                  <span className='text-red-500 ml-1'>*</span>
                </label>
              <div className="relative">
                <button 
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  type='button'
                  className='w-full text-left bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                        {userSelected ? (
                          <img 
                            src={getUserAvatar(userSelected, 32)}
                            alt='Usuario seleccionado'
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className='text-sm font-medium text-gray-600'>
                            ?
                          </span>
                        )}
                      </div>
                      <div>
                        <span className='text-sm font-medium text-gray-900'>
                          {userSelected?.firstName} {userSelected?.lastName}
                        </span>
                        <p className="text-xs text-gray-500">
                          {userSelected?.email || 'Sin email'}
                        </p>
                      </div>
                    </div>
                    <svg className={`text-gray-400 w-5 h-5 transition-transform duration-200 ${isUserOpen ? "rotate-180" : ""}`}
                      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </button>
                
                {isUserOpen && (
                  <div className='absolute z-[9999] top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto'>
                    {allProjectUsers.map((obj, i) => (
                      <button
                        key={i} 
                        type="button"
                        onClick={() => { 
                          setUserSelected(obj)
                          setIsUserOpen(false) 
                        }}
                        className='w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg'
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${obj.id === userSelected?.id ? 'bg-blue-600' : 'bg-transparent'}`} />
                          <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                            <img 
                              src={getUserAvatar(obj, 32)}
                              alt={obj.id}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <div className="flex-1">
                            <span className='text-sm font-medium text-gray-900 block'>
                              {obj.firstName} {obj.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {obj.email || 'Sin email'}
                            </span>
                          </div>
                          {obj.id === userSelected?.id && (
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Título de la Tarea */}
            <div>
              <label htmlFor="title" className="text-gray-900 text-sm font-semibold">
                Título de la Tarea
                <span className='text-red-500 ml-1'>*</span>
              </label>
              <div className='border-gray-200 flex items-center rounded-lg border px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
                <input
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="outline-none text-sm w-full bg-transparent placeholder-gray-400"
                  placeholder="Ej: Implementar sistema de autenticación"
                  value={formData.title}
                  name="title"
                  type="text"
                  id="title"
                  required
                />
              </div>
            </div>

            {/* Lista de Descripciones del Proyecto */}
            {projectConfig?.issueDescriptions && projectConfig.issueDescriptions.length > 0 && (
              <div className=''>
                <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                  <h6 className='text-sm font-semibold text-gray-900'>Descripciones Disponibles</h6>
                  <p className="text-xs text-gray-500 mb-3">
                    Completa las descripciones que apliquen para esta tarea
                  </p>
                  <div className='space-y-4 max-h-52 overflow-y-auto'>
                    {projectConfig.issueDescriptions.map((description) => (
                      <div key={description.id} className='bg-white border border-gray-200 rounded-lg p-3'>
                        <label className='text-sm font-medium text-gray-900 mb-2 block'>
                          {description.name}
                        </label>
                        <AutoResizeTextarea
                          value={descriptionValues[description.id] || ''}
                          onChange={(value) => handleDescriptionChange(description.id.toString(), value)}
                          placeholder={`Describe los detalles para: ${description.name}`}
                          required={true}
                          className="w-full border border-gray-200 rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Estado y Prioridad - Misma línea */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Estado */}
              <div className='relative' ref={statusRef}>
                <label className="text-gray-900 text-sm font-semibold block">
                  Estado
                  <span className='text-red-500 ml-1'>*</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                    type='button'
                    className='w-full text-left bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: projectConfig?.issueStatuses.find(status => formData.status === status.id)?.color }}
                        />
                        <span className='text-sm text-gray-700'>
                          {projectConfig?.issueStatuses.find(status => formData.status === status.id)?.name}
                        </span>
                      </div>
                      <svg className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isStatusOpen ? "rotate-180" : ""}`}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </button>
                  {isStatusOpen && (
                    <div className='absolute z-[9999] top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-28 overflow-y-auto'>
                      {projectConfig && projectConfig.issueStatuses.map((obj, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setFormData({ ...formData, status: obj.id }); setIsStatusOpen(false) }}
                          className='w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg'
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: obj.color }}
                            />
                            <span className="text-sm text-gray-700">{obj.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Prioridad */}
              <div className='relative' ref={priorityRef}>
                <label className="text-gray-900 text-sm font-semibold block">
                  Prioridad
                  <span className='text-red-500 ml-1'>*</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                    type='button'
                    className='w-full text-left bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: projectConfig?.issuePriorities.find(priority => formData.priority === priority.id)?.color }}
                        />
                        <span className='text-sm text-gray-700'>
                          {projectConfig?.issuePriorities.find(priority => formData.priority === priority.id)?.name}
                        </span>
                      </div>
                      <svg className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isPriorityOpen ? "rotate-180" : ""}`}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </button>
                  {isPriorityOpen && (
                    <div className='absolute z-[9999] top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-28 overflow-y-auto'>
                      {projectConfig && projectConfig.issuePriorities.map((obj, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setFormData({ ...formData, priority: obj.id }); setIsPriorityOpen(false) }}
                          className='w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg'
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: obj.color }}
                            />
                            <span className="text-sm text-gray-700">{obj.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tipo de Tarea y Tiempo Estimado - Misma línea */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Tipo */}
              <div className='relative' ref={typeRef}>
                <label className="text-gray-900 text-sm font-semibold block">
                  Tipo de Tarea
                  <span className='text-red-500 ml-1'>*</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsTypeOpen(!isTypeOpen)}
                    type='button'
                    className='w-full text-left bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: projectConfig?.issueTypes.find(type => formData.type === type.id)?.color }}
                        />
                        <span className='text-sm text-gray-700'>
                          {projectConfig?.issueTypes.find(type => formData.type === type.id)?.name}
                        </span>
                      </div>
                      <svg className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isTypeOpen ? "rotate-180" : ""}`}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </button>
                  {isTypeOpen && (
                    <div className='absolute z-[9999] top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-28 overflow-y-auto'>
                      {projectConfig && projectConfig.issueTypes.map((obj, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setFormData({ ...formData, type: obj.id }); setIsTypeOpen(false) }}
                          className='w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg'
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: obj.color }}
                            />
                            <span className="text-sm text-gray-700">{obj.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tiempo estimado */}
              <div className='space-y-2 -translate-y-1'>
                <label htmlFor="estimatedTime" className="text-gray-900 text-sm font-semibold">
                  Tiempo Estimado (horas)
                  <span className='text-red-500 ml-1'>*</span>
                </label>
                <div className='border-gray-200 flex items-center rounded-lg border px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
                  <input
                    onChange={(e) => setFormData({ ...formData, estimatedTime: Number(e.target.value) })}
                    className="outline-none text-xs w-full bg-transparent placeholder-gray-400"
                    value={formData.estimatedTime == 0 ? "" : formData.estimatedTime}
                    placeholder='Ej: 8 horas'
                    name="estimatedTime"
                    id="estimatedTime"
                    type="number"
                    required
                    min={0}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3 pt-6 border-gray-100">
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
              {isEdit ? 'Actualizar Tarea' : 'Crear Nueva Tarea'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
