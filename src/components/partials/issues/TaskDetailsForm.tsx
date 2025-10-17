'use client'

import { TaskProps } from '@/lib/types/types'
import { useEffect, useState } from 'react'
import { useConfigStore } from '@/lib/store/ConfigStore'
import ShowComments from '../comments/ShowComments'
import { useCommentStore } from '@/lib/store/CommentStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { CalendarIcon, ClockIcon, UsersIcon, XIcon, ChevronRightIcon, EditIcon, DownloadIcon, EyeIcon, DeleteIcon, FilterIcon, PlusIcon, LinkRedirect } from '@/assets/Icon'
import Link from 'next/link'
import Image from 'next/image'
import SafeHtml from '@/components/ui/SafeHtml'
import { useModalStore } from '@/lib/hooks/ModalStore'
import CreateTaskForm from './CreateTaskForm'
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import AuditHistory from '../audit/AuditHistory'
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'
import { API_ROUTES } from '@/lib/routes/issues.routes'
import { useIssueStore } from '@/lib/store/IssueStore'

interface TaskDetailsFormProps {
   onSubmit: () => void
   onCancel: () => void
   task: TaskProps
}

export default function TaskDetailsForm({ onSubmit, onCancel, task }: TaskDetailsFormProps) {
   const { comments, getComments } = useCommentStore()
   const { getValidAccessToken } = useAuthStore()
   const { projectConfig } = useConfigStore()
   const { updateIssue, getSpecificIssue, selectedIssue } = useIssueStore()
   const { openModal, closeModal } = useModalStore()
   const [isSidebarVisible, setIsSidebarVisible] = useState(true)
   const [isSubtasksOpen, setIsSubtasksOpen] = useState(false)
   const [selectedSubtasks, setSelectedSubtasks] = useState<string[]>([])
   const [showFilters, setShowFilters] = useState(false)
   const [typeFilter, setTypeFilter] = useState<number | null>(null)
   const [statusFilter, setStatusFilter] = useState<number | null>(null)
   const [priorityFilter, setPriorityFilter] = useState<number | null>(null)
   const [assignedFilter, setAssignedFilter] = useState<string | null>(null)
   const [subtasks, setSubtasks] = useState<TaskProps[]>([])
   const [loadingSubtasks, setLoadingSubtasks] = useState(false)

   // Usar selectedIssue del store si está disponible, sino usar la prop task
   const currentTask = (selectedIssue?.id === task.id ? selectedIssue : task)

   // Función para obtener subtareas desde el backend
   const fetchSubtasks = async (token: string, issueId: string) => {
      setLoadingSubtasks(true)
      try {
         const response = await fetch(API_ROUTES.CRUD_SUBTASKS(issueId), {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error('Error al obtener las subtareas')
         }

         const data: TaskProps[] = await response.json()
         setSubtasks(data)
      } catch (error) {
         console.error('Error al cargar subtareas:', error)
         setSubtasks([])
      } finally {
         setLoadingSubtasks(false)
      }
   }

   useEffect(() => {
      const getCommentsByIssueId = async () => {
         const token = await getValidAccessToken()
         if (token) {
            await getComments(token, currentTask?.id as string)
            await fetchSubtasks(token, currentTask?.id as string)
         }
      }

      getCommentsByIssueId()
   }, [currentTask?.id])

   const handleUpdate = async (formData: {
      descriptions: { id?: string, title: string, text: string }[],
      estimatedTime: number,
      priority: number,
      status: number,
      title: string,
      type: number
   }, filesMap?: Map<string, File[]>) => {
      const token = await getValidAccessToken()
      if (token && currentTask?.id) {
         await updateIssue(token, formData, filesMap)
         await getSpecificIssue(token, currentTask.id as string)
      }
      closeModal()
   }

   const handleUpdateBoardModal = () => {
      openModal({
         size: "lg",
         title: "Editar Tarea",
         desc: "Modifica los detalles de la tarea",
         Icon: <EditIcon size={20} stroke={1.75} />,
         children: <CreateTaskForm onSubmit={handleUpdate} onCancel={() => closeModal()} taskObject={currentTask || undefined} isEdit={true} />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "UPDATE"
      })
   }

   // Helper functions para obtener estilos
   const getTypeStyle = (typeId: number) => {
      return projectConfig?.issueTypes?.find((t: any) => t.id === typeId)
   }

   const getStatusStyle = (statusId: number) => {
      return projectConfig?.issueStatuses?.find((s: any) => s.id === statusId)
   }

   const getPriorityStyle = (priorityId: number) => {
      return projectConfig?.issuePriorities?.find((p: any) => p.id === priorityId)
   }

   // Toggle de selección de subtareas
   const toggleSubtaskSelect = (id: string) => {
      setSelectedSubtasks(prev =>
         prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
      )
   }

   // Filtrar subtareas
   const filteredSubtasks = subtasks.filter(subtask => {
      if (typeFilter !== null && subtask.type !== typeFilter) return false
      if (statusFilter !== null && subtask.status !== statusFilter) return false
      if (priorityFilter !== null && subtask.priority !== priorityFilter) return false
      if (assignedFilter !== null && typeof subtask.assignedId === 'object' && subtask.assignedId?.id !== assignedFilter) return false
      return true
   })

   // Handlers para acciones de subtareas
   const handleViewSubtask = (subtaskId: string) => {
      console.log('Ver detalles de subtarea:', subtaskId)
   }

   const handleEditSubtask = (subtaskId: string) => {
      console.log('Editar subtarea:', subtaskId)
   }

   const handleDeleteSubtask = (subtaskId: string) => {
      console.log('Eliminar subtarea:', subtaskId)
   }

   const handleHistorySubtask = (subtaskId: string) => {
      openModal({
         size: "xl",
         title: "Historial de Auditoría",
         desc: "Consulta el historial de cambios",
         Icon: <ClockIcon size={20} stroke={1.75} />,
         children: <AuditHistory issueId={subtaskId} onCancel={() => closeModal()} />,
         closeOnBackdrop: true,
         closeOnEscape: true,
      })
   }

   const handleReassignSubtask = (subtaskId: string) => {
      console.log('Reasignar subtarea:', subtaskId)
   }

   const handleDeleteSelected = () => {
      console.log('Eliminar subtareas seleccionadas:', selectedSubtasks)
   }

   // Función para crear una subtarea
   const handleCreateSubtask = async (formData: TaskProps, filesMap?: Map<string, File[]>) => {
      const token = await getValidAccessToken()
      if (!token || !currentTask?.id) return

      try {
         // Preparar el payload para crear la subtarea
         const payload = {
            title: formData.title,
            descriptions: formData.descriptions,
            estimatedTime: formData.estimatedTime,
            priority: formData.priority,
            status: formData.status,
            type: formData.type,
            projectId: formData.projectId,
            assignedId: typeof formData.assignedId === 'string' ? formData.assignedId : formData.assignedId?.id,
            ...(formData.startDate ? { startDate: formData.startDate } : {}),
            ...(formData.endDate ? { endDate: formData.endDate } : {})
         }

         const response = await fetch(API_ROUTES.CRUD_SUBTASKS(currentTask.id), {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
         })

         if (!response.ok) {
            throw new Error('Error al crear la subtarea')
         }

         const newSubtask: TaskProps = await response.json()

         // Si hay archivos, subirlos a las descripciones correspondientes
         if (filesMap && filesMap.size > 0 && newSubtask.id) {
            for (const [descTitle, files] of filesMap.entries()) {
               // Encontrar la descripción que coincide con el título
               const description = newSubtask.descriptions.find(d => d.title === descTitle)

               if (description && description.id && files.length > 0) {
                  const formData = new FormData()
                  files.forEach(file => {
                     formData.append('files', file)
                  })

                  try {
                     await fetch(API_ROUTES.ADD_FILES_TO_DESCRIPTION(newSubtask.id, description.id), {
                        method: 'POST',
                        headers: {
                           'Authorization': `Bearer ${token}`
                        },
                        body: formData
                     })
                  } catch (error) {
                     console.error(`Error al subir archivos para la descripción ${descTitle}:`, error)
                  }
               }
            }
         }

         // Agregar la nueva subtarea al estado local
         setSubtasks(prev => [newSubtask, ...prev])

         // Cerrar el modal
         closeModal()
      } catch (error) {
         console.error('Error al crear la subtarea:', error)
      }
   }

   // Función para abrir el modal de crear subtarea
   const handleOpenCreateSubtaskModal = () => {
      openModal({
         size: "xl",
         title: "Crear Subtarea",
         desc: "Crea una nueva subtarea para esta tarea",
         Icon: <PlusIcon size={20} stroke={1.75} />,
         children: <CreateTaskForm
            onSubmit={handleCreateSubtask}
            onCancel={() => closeModal()}
            taskObject={{
               title: "",
               descriptions: [],
               projectId: currentTask?.projectId || "",
               priority: projectConfig?.issuePriorities?.[0]?.id || 1,
               status: projectConfig?.issueStatuses?.[0]?.id || 1,
               type: projectConfig?.issueTypes?.[0]?.id || 1,
               assignedId: "",
               estimatedTime: 0
            }}
            isEdit={false}
         />,
         closeOnBackdrop: false,
         closeOnEscape: false,
         mode: "CREATE"
      })
   }

   // Generar opciones para los selects
   const getTypeOptions = (): SelectOption[] => {
      if (!projectConfig?.issueTypes) return []
      return projectConfig.issueTypes.map((type: any) => ({
         value: type.id,
         label: type.name,
         color: type.color
      }))
   }

   const getStatusOptions = (): SelectOption[] => {
      if (!projectConfig?.issueStatuses) return []
      return projectConfig.issueStatuses.map((status: any) => ({
         value: status.id,
         label: status.name,
         color: status.color
      }))
   }

   const getPriorityOptions = (): SelectOption[] => {
      if (!projectConfig?.issuePriorities) return []
      return projectConfig.issuePriorities.map((priority: any) => ({
         value: priority.id,
         label: priority.name,
         color: priority.color
      }))
   }

   const getAssignedOptions = (): SelectOption[] => {
      const uniqueUsers = Array.from(
         new Set(subtasks.map(s => typeof s.assignedId === 'object' ? s.assignedId?.id : null).filter(Boolean))
      )

      return uniqueUsers.map((userId) => {
         const user = subtasks.find(s => typeof s.assignedId === 'object' && s.assignedId?.id === userId)?.assignedId
         if (!user || typeof user !== 'object') return null

         return {
            value: user.id,
            label: user.firstName || user.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : user.email || 'Sin nombre',
            image: user.picture || undefined,
            subtitle: user.email
         }
      }).filter(Boolean) as SelectOption[]
   }

   // Contar filtros activos
   const activeFiltersCount = [typeFilter, statusFilter, priorityFilter, assignedFilter].filter(f => f !== null).length

   // Validación temprana - si no hay tarea, no renderizar nada
   if (!currentTask) {
      return null
   }

   return (
      <div className="bg-white border-gray-100 rounded-xl shadow-sm border flex flex-col overflow-hidden h-full">
         {/* Header */}
         <div className="px-6 py-4 flex-shrink-0 border-b border-gray-100">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Link
                     href={`/tableros/${currentTask.projectId}/${currentTask.id}`}
                     className="text-gray-900 hover:text-blue-600 flex gap-2 pr-4 items-center text-lg font-semibold transition-colors min-w-0 flex-1"
                     onClick={() => onCancel()}
                     target="_blank"
                  >
                     <span className="truncate">{currentTask.title}</span>
                     <span className="flex-shrink-0"><LinkRedirect size={18} stroke={2} /></span>
                  </Link>
               </div>
               <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                     onClick={() => handleUpdateBoardModal()}
                     className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                     title="Editar tarea"
                  >
                     <EditIcon size={20} />
                  </button>
                  <button
                     type="button"
                     onClick={onCancel}
                     className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                     <XIcon size={20} />
                  </button>
               </div>
            </div>
         </div>

         {/* Contenido principal */}
         <div className="flex-1 overflow-hidden min-h-0">
            <div className="flex items-stretch h-full gap-4 px-6">
               {/* Contenido principal - con scroll independiente */}
               <div className={`flex-1 overflow-y-auto py-4 ${!isSidebarVisible ? 'pr-0' : 'pr-2'}`}>
                  <div className="flex flex-col space-y-4">
                     {/* Sección de descripción */}
                     <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        {currentTask.descriptions.length > 0 ? (
                           <div className="space-y-4">
                              {currentTask.descriptions.map((desc, id) => (
                                 <div key={id} className="space-y-1">
                                    <h4 className="font-semibold text-gray-900 text-sm">{desc.title}</h4>
                                    <SafeHtml
                                       html={desc.text}
                                       className="text-xs text-gray-600 leading-relaxed [&_code]:font-mono [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
                                    />
                                    {/* Mostrar imágenes si existen */}
                                    {desc.attachments && desc.attachments.length > 0 && (
                                       <div className="flex flex-wrap gap-2 mt-3">
                                          {desc.attachments.map((file) => {
                                             const fileSplitted = file.fileName.split(".")
                                             const extension = fileSplitted[fileSplitted.length - 1]
                                             const isImage = ["jpg", "png", "jpeg", "gif", "bmp", "webp"].includes(extension.toLowerCase())
                                             const url = file.fileUrl

                                             return (
                                                <div key={file.id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all">
                                                   {isImage && url ? (
                                                      <Link href={url} target="_blank">
                                                         <div className="w-16 h-16 relative">
                                                            <Image
                                                               src={url}
                                                               alt={file.fileName}
                                                               fill
                                                               className="object-cover hover:scale-105 transition-transform"
                                                               unoptimized
                                                            />
                                                         </div>
                                                      </Link>
                                                   ) : (
                                                      <Link
                                                         href={url}
                                                         target="_blank"
                                                         className="flex items-center gap-2 p-3 min-w-0 hover:bg-gray-50 transition-colors"
                                                      >
                                                         <div className="flex-shrink-0">
                                                            <DownloadIcon size={16} stroke={2} />
                                                         </div>
                                                         <span className="text-xs text-gray-600 truncate">
                                                            {file.fileName}
                                                         </span>
                                                      </Link>
                                                   )}
                                                </div>
                                             )
                                          })}
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="flex items-center justify-center text-gray-500 py-8">
                              <p className="text-sm">No hay descripción disponible</p>
                           </div>
                        )}
                     </div>

                     {/* Sección de subtareas (Acordeón) - Solo mostrar si NO es una subtarea */}
                     {!currentTask.parent && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                           {/* Header del acordeón */}
                           <button
                              onClick={() => setIsSubtasksOpen(!isSubtasksOpen)}
                              className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${isSubtasksOpen ? 'bg-gray-50' : ''}`}
                           >
                              <div className="flex items-center gap-3">
                                 <div className={`transform transition-transform duration-200 ${isSubtasksOpen ? 'rotate-90' : ''}`}>
                                    <ChevronRightIcon size={20} stroke={2} />
                                 </div>
                                 <h3 className="text-lg font-semibold text-gray-900">
                                    Subtareas ({filteredSubtasks.length})
                                 </h3>
                              </div>
                              {selectedSubtasks.length > 0 && (
                                 <div
                                    onClick={(e) => {
                                       e.stopPropagation()
                                       handleDeleteSelected()
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                                 >
                                    <DeleteIcon size={16} />
                                    Eliminar ({selectedSubtasks.length})
                                 </div>
                              )}
                           </button>

                           {/* Contenido del acordeón */}
                           {isSubtasksOpen && (
                              <div className="border-t border-gray-200 p-4">
                                 {loadingSubtasks ? (
                                    <div className="flex items-center justify-center py-8">
                                       <div className="text-gray-500">Cargando subtareas...</div>
                                    </div>
                                 ) : (
                                    <>
                                       {/* Botón de filtros con expansión horizontal */}
                                       <div className="mb-3">
                                          <motion.div
                                             initial={false}
                                             animate={{
                                                width: showFilters ? '100%' : 'auto'
                                             }}
                                             transition={{ duration: 0.3, ease: 'easeInOut' }}
                                             className="flex items-center gap-2"
                                          >
                                             <button type='button'
                                                onClick={() => handleOpenCreateSubtaskModal()}
                                                className="hover:bg-blue-700 bg-blue-600 border-blue-600 text-white flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md transition-all shadow-sm hover:shadow text-xs flex-shrink-0"
                                             >
                                                <PlusIcon size={14} stroke={2} />
                                                <span className="font-semibold">Crear Subtarea</span>
                                             </button>
                                             <button type='button'
                                                onClick={() => setShowFilters(!showFilters)}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 transition-all shadow-sm hover:shadow text-xs flex-shrink-0"
                                             >
                                                <FilterIcon size={14} stroke={2} />
                                                <span className="font-semibold">Filtros</span>
                                                {activeFiltersCount > 0 && (
                                                   <motion.span
                                                      initial={{ scale: 0 }}
                                                      animate={{ scale: 1 }}
                                                      className="bg-blue-500 text-white flex justify-center items-center text-center rounded-full leading-0 text-[10px] aspect-square font-bold min-w-4 p-1"
                                                   >
                                                      {activeFiltersCount}
                                                   </motion.span>
                                                )}
                                                <motion.div
                                                   animate={{ rotate: showFilters ? 90 : 0 }}
                                                   transition={{ duration: 0.2 }}
                                                >
                                                   <ChevronRightIcon size={12} stroke={2.5} />
                                                </motion.div>
                                             </button>

                                             {/* Panel de filtros inline con animación de barrido */}
                                             <AnimatePresence>
                                                {showFilters && (
                                                   <motion.div
                                                      initial={{ x: -20, opacity: 0 }}
                                                      animate={{ x: 0, opacity: 1 }}
                                                      exit={{ x: -20, opacity: 0 }}
                                                      transition={{
                                                         duration: 0.4,
                                                         ease: [0.4, 0, 0.2, 1],
                                                         opacity: { duration: 0.3 }
                                                      }}
                                                      className="flex-1 flex items-center gap-2"
                                                   >
                                                      {/* Filtro por tipo */}
                                                      <motion.div
                                                         initial={{ opacity: 0, x: -10 }}
                                                         animate={{ opacity: 1, x: 0 }}
                                                         transition={{ delay: 0.1 }}
                                                         className="flex-1"
                                                      >
                                                         <CustomSelect
                                                            value={typeFilter}
                                                            onChange={(value) => setTypeFilter(value as number | null)}
                                                            options={getTypeOptions()}
                                                            placeholder="Tipo"
                                                            variant="colored"
                                                         />
                                                      </motion.div>

                                                      {/* Filtro por estado */}
                                                      <motion.div
                                                         initial={{ opacity: 0, x: -10 }}
                                                         animate={{ opacity: 1, x: 0 }}
                                                         transition={{ delay: 0.15 }}
                                                         className="flex-1"
                                                      >
                                                         <CustomSelect
                                                            value={statusFilter}
                                                            onChange={(value) => setStatusFilter(value as number | null)}
                                                            options={getStatusOptions()}
                                                            placeholder="Estado"
                                                            variant="colored"
                                                         />
                                                      </motion.div>

                                                      {/* Filtro por prioridad */}
                                                      <motion.div
                                                         initial={{ opacity: 0, x: -10 }}
                                                         animate={{ opacity: 1, x: 0 }}
                                                         transition={{ delay: 0.2 }}
                                                         className="flex-1"
                                                      >
                                                         <CustomSelect
                                                            value={priorityFilter}
                                                            onChange={(value) => setPriorityFilter(value as number | null)}
                                                            options={getPriorityOptions()}
                                                            placeholder="Prioridad"
                                                            variant="colored"
                                                         />
                                                      </motion.div>

                                                      {/* Filtro por asignado */}
                                                      <motion.div
                                                         initial={{ opacity: 0, x: -10 }}
                                                         animate={{ opacity: 1, x: 0 }}
                                                         transition={{ delay: 0.25 }}
                                                         className="flex-1"
                                                      >
                                                         <CustomSelect
                                                            value={assignedFilter}
                                                            onChange={(value) => setAssignedFilter(value as string | null)}
                                                            options={getAssignedOptions()}
                                                            placeholder="Asignado"
                                                            variant="user"
                                                         />
                                                      </motion.div>

                                                      {/* Botón limpiar filtros */}
                                                      {activeFiltersCount > 0 && (
                                                         <button
                                                            onClick={() => {
                                                               setTypeFilter(null)
                                                               setStatusFilter(null)
                                                               setPriorityFilter(null)
                                                               setAssignedFilter(null)
                                                            }}
                                                            className="px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors border border-red-200 flex-shrink-0"
                                                         >
                                                            Limpiar
                                                         </button>
                                                      )}
                                                   </motion.div>
                                                )}
                                             </AnimatePresence>
                                          </motion.div>
                                       </div>

                                       {/* Header de columnas */}
                                       <div className="grid grid-cols-18 items-center gap-4 p-2 text-xs/tight font-semibold text-gray-600 border border-gray-200 bg-gray-50 rounded-t">
                                          <div className="col-span-1 text-center">
                                             <input
                                                type="checkbox"
                                                checked={selectedSubtasks.length === filteredSubtasks.length && filteredSubtasks.length > 0}
                                                onChange={(e) => {
                                                   if (e.target.checked) {
                                                      setSelectedSubtasks(filteredSubtasks.map(s => s.id).filter((id): id is string => id !== undefined))
                                                   } else {
                                                      setSelectedSubtasks([])
                                                   }
                                                }}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                             />
                                          </div>
                                          <div className="col-span-1">Tipo</div>
                                          <div className="col-span-5">Título</div>
                                          <div className="col-span-2">Estado</div>
                                          <div className="col-span-2">Prioridad</div>
                                          <div className="col-span-5">Asignado a</div>
                                          <div className="col-span-2 text-center">Acciones</div>
                                       </div>

                                       {/* Lista de subtareas */}
                                       <div className="space-y-2 mt-2">
                                          {filteredSubtasks.length > 0 ? (
                                             filteredSubtasks.map((subtask) => (
                                                <Link
                                                   key={subtask.id}
                                                   href={`/tableros/${currentTask.projectId}/${subtask.id}`}
                                                   target="_blank"
                                                   className="block"
                                                >
                                                   <div className="grid grid-cols-18 gap-4 p-2 items-center hover:bg-blue-50/30 rounded-lg border border-gray-100 hover:border-blue-200 transition-all bg-white shadow-sm hover:shadow-md">
                                                      {/* Checkbox */}
                                                      <div className="col-span-1 flex justify-center">
                                                         <input
                                                            type="checkbox"
                                                            checked={subtask.id ? selectedSubtasks.includes(subtask.id) : false}
                                                            onChange={(e) => {
                                                               e.stopPropagation()
                                                               if (subtask.id) {
                                                                  toggleSubtaskSelect(subtask.id)
                                                               }
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                         />
                                                      </div>

                                                      {/* Tipo */}
                                                      <div
                                                         className="col-span-1 rounded-full text-[10px] border px-2 whitespace-nowrap w-fit"
                                                         style={{
                                                            backgroundColor: `${getTypeStyle(subtask.type)?.color ?? "#000000"}0f`,
                                                            color: getTypeStyle(subtask.type)?.color ?? "#000000"
                                                         }}
                                                      >
                                                         {getTypeStyle(subtask.type)?.name ?? "Sin tipo"}
                                                      </div>

                                                      {/* Título */}
                                                      <div className="col-span-5">
                                                         <h6 className="font-medium text-gray-900 text-sm line-clamp-1" title={subtask.title}>
                                                            {subtask.title}
                                                         </h6>
                                                         {subtask.descriptions.length > 0 ? (
                                                            <SafeHtml
                                                               html={subtask.descriptions[0].text}
                                                               className="line-clamp-1 text-xs text-gray-600 leading-relaxed"
                                                            />
                                                         ) : (
                                                            <p className="text-xs text-gray-500 line-clamp-1">Sin descripción</p>
                                                         )}
                                                      </div>

                                                      {/* Estado */}
                                                      <div className="col-span-2">
                                                         <span
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
                                                            style={{
                                                               backgroundColor: `${getStatusStyle(subtask.status)?.color ?? "#6B7280"}15`,
                                                               color: getStatusStyle(subtask.status)?.color ?? "#6B7280",
                                                               borderColor: `${getStatusStyle(subtask.status)?.color ?? "#6B7280"}30`
                                                            }}
                                                         >
                                                            <div
                                                               className="w-1.5 h-1.5 rounded-full"
                                                               style={{ backgroundColor: getStatusStyle(subtask.status)?.color ?? "#6B7280" }}
                                                            />
                                                            {getStatusStyle(subtask.status)?.name ?? "Sin estado"}
                                                         </span>
                                                      </div>

                                                      {/* Prioridad */}
                                                      <div className="col-span-2">
                                                         <span
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
                                                            style={{
                                                               backgroundColor: `${getPriorityStyle(subtask.priority)?.color ?? "#6B7280"}15`,
                                                               color: getPriorityStyle(subtask.priority)?.color ?? "#6B7280",
                                                               borderColor: `${getPriorityStyle(subtask.priority)?.color ?? "#6B7280"}30`
                                                            }}
                                                         >
                                                            <div
                                                               className="w-1.5 h-1.5 rounded-full"
                                                               style={{ backgroundColor: getPriorityStyle(subtask.priority)?.color ?? "#6B7280" }}
                                                            />
                                                            {getPriorityStyle(subtask.priority)?.name ?? "Sin prioridad"}
                                                         </span>
                                                      </div>

                                                      {/* Asignado a */}
                                                      <div className="col-span-5">
                                                         <button
                                                            className="flex items-center gap-2 w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
                                                            onClick={(e) => {
                                                               e.preventDefault()
                                                               e.stopPropagation()
                                                               if (subtask.id) {
                                                                  handleReassignSubtask(subtask.id)
                                                               }
                                                            }}
                                                         >
                                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                               {typeof subtask.assignedId === 'object' && subtask.assignedId ? (
                                                                  <img
                                                                     src={getUserAvatar({
                                                                        picture: subtask.assignedId.picture || undefined,
                                                                        firstName: subtask.assignedId.firstName || undefined,
                                                                        lastName: subtask.assignedId.lastName || undefined,
                                                                        email: subtask.assignedId.email || undefined
                                                                     }, 24)}
                                                                     alt="Asignado a"
                                                                     className="w-full h-full object-cover rounded-full"
                                                                  />
                                                               ) : (
                                                                  <span className="text-xs text-gray-500">N/A</span>
                                                               )}
                                                            </div>
                                                            <span className="text-xs text-gray-700 line-clamp-1">
                                                               {typeof subtask.assignedId === 'object' && subtask.assignedId
                                                                  ? (
                                                                     subtask.assignedId.firstName || subtask.assignedId.lastName
                                                                        ? `${subtask.assignedId.firstName ?? ''} ${subtask.assignedId.lastName ?? ''}`.trim()
                                                                        : (subtask.assignedId.email || 'Sin asignar')
                                                                  )
                                                                  : 'Sin asignar'
                                                               }
                                                            </span>
                                                         </button>
                                                      </div>

                                                      {/* Acciones */}
                                                      <div className="col-span-2 flex justify-center gap-1">
                                                         <button
                                                            onClick={(e) => {
                                                               e.preventDefault()
                                                               e.stopPropagation()
                                                               if (subtask.id) {
                                                                  handleViewSubtask(subtask.id)
                                                               }
                                                            }}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Ver detalles"
                                                         >
                                                            <EyeIcon size={16} />
                                                         </button>
                                                         <button
                                                            onClick={(e) => {
                                                               e.preventDefault()
                                                               e.stopPropagation()
                                                               if (subtask.id) {
                                                                  handleEditSubtask(subtask.id)
                                                               }
                                                            }}
                                                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                            title="Editar"
                                                         >
                                                            <EditIcon size={16} />
                                                         </button>
                                                         <button
                                                            onClick={(e) => {
                                                               e.preventDefault()
                                                               e.stopPropagation()
                                                               if (subtask.id) {
                                                                  handleHistorySubtask(subtask.id)
                                                               }
                                                            }}
                                                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                                            title="Historial"
                                                         >
                                                            <ClockIcon size={16} />
                                                         </button>
                                                         <button
                                                            onClick={(e) => {
                                                               e.preventDefault()
                                                               e.stopPropagation()
                                                               if (subtask.id) {
                                                                  handleDeleteSubtask(subtask.id)
                                                               }
                                                            }}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Eliminar"
                                                         >
                                                            <DeleteIcon size={16} />
                                                         </button>
                                                      </div>
                                                   </div>
                                                </Link>
                                             ))
                                          ) : (
                                             <div className="flex items-center justify-center text-gray-500 py-8">
                                                <p className="text-sm">No hay subtareas que coincidan con los filtros</p>
                                             </div>
                                          )}
                                       </div>
                                    </>
                                 )}
                              </div>
                           )}
                        </div>
                     )}

                     {/* Sección de comentarios */}
                     <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <ShowComments arrayComments={comments} task={currentTask} />
                     </div>
                  </div>
               </div>

               {/* Divider Line with Toggle Button */}
               <div
                  className="relative flex items-start justify-center group cursor-pointer flex-shrink-0 py-4"
                  onClick={() => setIsSidebarVisible(!isSidebarVisible)}
               >
                  <div className="w-px bg-gray-200 h-full absolute top-0" />
                  <div className="sticky top-8 flex items-center justify-center w-6 h-8 bg-white border border-gray-200 rounded-md shadow-sm group-hover:bg-gray-50 group-hover:border-gray-300 transition-all duration-200">
                     <div className={`text-gray-400 group-hover:text-gray-600 transition-all duration-300 ${isSidebarVisible ? 'transform' : 'transform rotate-180'}`}>
                        <ChevronRightIcon
                           size={14}
                           stroke={2}
                        />
                     </div>
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                     {isSidebarVisible ? 'Ocultar panel' : 'Mostrar panel'}
                  </div>
               </div>

               {/* Sidebar - con scroll independiente */}
               <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarVisible ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                  <div className={`h-full overflow-y-auto py-4 ${isSidebarVisible ? 'pl-2' : 'pl-0'}`}>
                     <div className="space-y-4">
                        {/* Sección de personas */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                 <UsersIcon size={18} />
                              </div>
                              <h3 className="font-semibold text-gray-900">Personas</h3>
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                 <span className="text-sm text-gray-500">Asignado a:&nbsp;&nbsp;</span>
                                 <span className="text-sm font-medium text-gray-900">
                                    {typeof currentTask.assignedId === 'object'
                                       ? `${currentTask.assignedId.firstName ?? "Sin"} ${currentTask.assignedId.lastName ?? "asignar"}`
                                       : currentTask.assignedId || 'No asignado'}
                                 </span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                 <span className="text-sm text-gray-500">Informador:&nbsp;&nbsp;</span>
                                 <span className="text-sm font-medium text-gray-900">
                                    {currentTask.reporterId ? `${currentTask.reporterId.firstName} ${currentTask.reporterId.lastName}` : 'No especificado'}
                                 </span>
                              </div>
                           </div>
                        </div>

                        {/* Sección de detalles */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                 <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                 </svg>
                              </div>
                              <h3 className="font-semibold text-gray-900">Detalles</h3>
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                 <span className="text-sm text-gray-500">Estado:&nbsp;&nbsp;</span>
                                 {(() => {
                                    const status = projectConfig?.issueStatuses?.find((s: { id: number }) => s.id === currentTask.status)
                                    return status ? (
                                       <span
                                          className="px-3 py-1 rounded-full text-xs font-medium"
                                          style={{
                                             backgroundColor: `${status.color}20`,
                                             color: status.color,
                                             border: `1px solid ${status.color}40`
                                          }}
                                       >
                                          {status.name}
                                       </span>
                                    ) : (
                                       <span className="text-sm font-medium text-gray-400">No especificado</span>
                                    )
                                 })()}
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                 <span className="text-sm text-gray-500">Tipo:&nbsp;&nbsp;</span>
                                 {(() => {
                                    const type = projectConfig?.issueTypes?.find((t: { id: number }) => t.id === currentTask.type)
                                    return type ? (
                                       <span
                                          className="px-3 py-1 rounded-full text-xs font-medium"
                                          style={{
                                             backgroundColor: `${type.color}20`,
                                             color: type.color,
                                             border: `1px solid ${type.color}40`
                                          }}
                                       >
                                          {type.name}
                                       </span>
                                    ) : (
                                       <span className="text-sm font-medium text-gray-400">No especificado</span>
                                    )
                                 })()}
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                 <span className="text-sm text-gray-500">Prioridad:&nbsp;&nbsp;</span>
                                 {(() => {
                                    const priority = projectConfig?.issuePriorities?.find((p: { id: number }) => p.id === currentTask.priority)
                                    return priority ? (
                                       <span
                                          className="px-3 py-1 rounded-full text-xs font-medium"
                                          style={{
                                             backgroundColor: `${priority.color}20`,
                                             color: priority.color,
                                             border: `1px solid ${priority.color}40`
                                          }}
                                       >
                                          {priority.name}
                                       </span>
                                    ) : (
                                       <span className="text-sm font-medium text-gray-400">No especificado</span>
                                    )
                                 })()}
                              </div>
                           </div>
                        </div>

                        {/* Sección de fechas */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                 <CalendarIcon size={18} />
                              </div>
                              <h3 className="font-semibold text-gray-900">Fechas</h3>
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                 <span className="text-sm text-gray-500">Creación:&nbsp;&nbsp;</span>
                                 <span className="text-sm font-medium text-gray-900">
                                    {formatDate(currentTask.createdAt)}
                                 </span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                 <span className="text-sm text-gray-500">Actualización:&nbsp;&nbsp;</span>
                                 <span className="text-sm font-medium text-gray-900">
                                    {formatDate(currentTask.updatedAt)}
                                 </span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                 <span className="text-sm text-gray-500">Fecha de inicio:&nbsp;&nbsp;</span>
                                 <span className="text-sm font-medium text-gray-900">{formatDate(currentTask.startDate, false, true)}</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                 <span className="text-sm text-gray-500">Fecha de fin:&nbsp;&nbsp;</span>
                                 <span className="text-sm font-medium text-gray-900">{formatDate(currentTask.endDate, false, true)}</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                 <span className="text-sm text-gray-500">Fecha real de finalización:&nbsp;&nbsp;</span>
                                 <span className="text-sm font-medium text-gray-900">{formatDate(currentTask.realDate, false, true)}</span>
                              </div>
                           </div>
                        </div>

                        {/* Sección de tiempo */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                 <ClockIcon size={18} />
                              </div>
                              <h3 className="font-semibold text-gray-900">Tiempo</h3>
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                 <span className="text-sm text-gray-500">Estimado:&nbsp;&nbsp;</span>
                                 <span className="text-sm font-medium text-gray-900">
                                    {currentTask.estimatedTime ? `${currentTask.estimatedTime} horas` : 'No especificado'}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )

}

// Formatea fechas a formato legible
function formatDate(dateStr?: string, includeTime = false, onlyDate = false): string {
   if (!dateStr) return 'No especificado';
   let date: Date;
   if (dateStr.includes('T')) {
      date = new Date(dateStr);
   } else {
      const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
      date = new Date(year, month - 1, day);
   }
   if (onlyDate) {
      return date.toLocaleDateString('es-ES', {
         day: '2-digit',
         month: 'long',
         year: 'numeric',
      });
   }
   return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: includeTime ? '2-digit' : undefined,
      minute: includeTime ? '2-digit' : undefined,
      hour12: includeTime ? true : undefined
   });
}
