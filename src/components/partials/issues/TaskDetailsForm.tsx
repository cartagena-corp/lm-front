'use client'

import { TaskProps, ConfigProjectStatusProps } from '@/lib/types/types'
import { useEffect, useState, useMemo } from 'react'
import { useConfigStore } from '@/lib/store/ConfigStore'
import ShowComments from '../comments/ShowComments'
import { useCommentStore } from '@/lib/store/CommentStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { CalendarIcon, ClockIcon, UsersIcon, XIcon, ChevronRightIcon, EditIcon, DownloadIcon, EyeIcon, DeleteIcon, FilterIcon, PlusIcon, LinkRedirect, BoardIcon, AuditIcon } from '@/assets/Icon'
import Link from 'next/link'
import Image from 'next/image'
import SafeHtml from '@/components/ui/SafeHtml'
import { useModalStore } from '@/lib/hooks/ModalStore'
import CreateTaskForm from './CreateTaskForm'
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import AuditHistory from '../audit/AuditHistory'
import { motion, AnimatePresence } from 'framer-motion'
import { API_ROUTES } from '@/lib/routes/issues.routes'
import { useIssueStore } from '@/lib/store/IssueStore'
import { Button, DataSelect, TextInput } from '@/components/ui/FormUI'

interface RelatedIssue {
   id: number
   targetId: string
   targetTitle: string
   type: number
   status: number
}

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
   const [isSidebarVisible, setIsSidebarVisible] = useState(false)
   const [isSubtasksOpen, setIsSubtasksOpen] = useState(false)
   const [selectedSubtasks, setSelectedSubtasks] = useState<string[]>([])
   const [showFilters, setShowFilters] = useState(false)
   const [typeFilter, setTypeFilter] = useState<number | null>(null)
   const [statusFilter, setStatusFilter] = useState<number | null>(null)
   const [priorityFilter, setPriorityFilter] = useState<number | null>(null)
   const [assignedFilter, setAssignedFilter] = useState<string | null>(null)
   const [subtasks, setSubtasks] = useState<TaskProps[]>([])
   const [loadingSubtasks, setLoadingSubtasks] = useState(false)

   // Estados para la sección de Relaciones
   const [isRelationsOpen, setIsRelationsOpen] = useState(false)
   const [activeRelationTab, setActiveRelationTab] = useState<'related' | 'related-to'>('related')
   const [relatedIssues, setRelatedIssues] = useState<RelatedIssue[]>([])
   const [relatedToIssues, setRelatedToIssues] = useState<RelatedIssue[]>([])
   const [loadingRelations, setLoadingRelations] = useState(false)
   const [selectedRelations, setSelectedRelations] = useState<string[]>([])

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

   // Función para obtener las tareas relacionadas desde esta tarea
   const fetchRelatedIssues = async (token: string, issueId: string) => {
      setLoadingRelations(true)
      try {
         const response = await fetch(API_ROUTES.CRUD_RELATE_ISSUE(issueId), {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error('Error al obtener las tareas relacionadas')
         }

         const data: RelatedIssue[] = await response.json()
         setRelatedIssues(data)
      } catch (error) {
         console.error('Error al cargar tareas relacionadas:', error)
         setRelatedIssues([])
      } finally {
         setLoadingRelations(false)
      }
   }

   // Función para obtener las tareas que han relacionado a esta tarea
   const fetchRelatedToIssues = async (token: string, issueId: string) => {
      setLoadingRelations(true)
      try {
         const response = await fetch(API_ROUTES.GET_RELATE_TO_ISSUE(issueId), {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            }
         })

         if (!response.ok) {
            throw new Error('Error al obtener las tareas que relacionan a esta')
         }

         const data: RelatedIssue[] = await response.json()
         setRelatedToIssues(data)
      } catch (error) {
         console.error('Error al cargar tareas que relacionan a esta:', error)
         setRelatedToIssues([])
      } finally {
         setLoadingRelations(false)
      }
   }

   useEffect(() => {
      const getCommentsByIssueId = async () => {
         const token = await getValidAccessToken()
         if (token) {
            await getComments(token, currentTask?.id as string)
            await fetchSubtasks(token, currentTask?.id as string)
            await fetchRelatedIssues(token, currentTask?.id as string)
            await fetchRelatedToIssues(token, currentTask?.id as string)
         }
      }

      getCommentsByIssueId()
   }, [currentTask?.id])

   // Función para recargar las relaciones cuando se actualicen
   const handleRelationsUpdated = async () => {
      const token = await getValidAccessToken()
      if (token && currentTask?.id) {
         await fetchRelatedIssues(token, currentTask.id as string)
         await fetchRelatedToIssues(token, currentTask.id as string)
      }
   }

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

   // Función para eliminar relaciones seleccionadas
   const handleDeleteRelations = async (relationIds: number[]) => {
      const token = await getValidAccessToken()
      if (!token || !currentTask?.id || relationIds.length === 0) return

      try {
         const response = await fetch(API_ROUTES.UNRELATE_ISSUE(currentTask.id), {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(relationIds)
         })

         if (!response.ok) {
            throw new Error('Error al eliminar las relaciones')
         }

         // Limpiar selección
         setSelectedRelations([])

         // Recargar las relaciones
         await fetchRelatedIssues(token, currentTask.id)
         await fetchRelatedToIssues(token, currentTask.id)

         console.log('Relaciones eliminadas exitosamente')
      } catch (error) {
         console.error('Error al eliminar relaciones:', error)
      }
   }

   // Función para eliminar una relación individual
   const handleDeleteSingleRelation = async (relationId: number) => {
      await handleDeleteRelations([relationId])
   }

   // Función para eliminar las relaciones seleccionadas
   const handleDeleteSelectedRelations = async () => {
      const relationIds = selectedRelations.map(id => parseInt(id))
      await handleDeleteRelations(relationIds)
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
         size: "md",
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

   // Opciones para los filtros (Memoizadas)
   const typeOptions = useMemo(() => projectConfig?.issueTypes?.map(t => ({ id: t.id, name: t.name, color: t.color })) || [], [projectConfig?.issueTypes])
   const statusOptions = useMemo(() => projectConfig?.issueStatuses?.map(s => ({ id: s.id, name: s.name, color: s.color })) || [], [projectConfig?.issueStatuses])
   const priorityOptions = useMemo(() => projectConfig?.issuePriorities?.map(p => ({ id: p.id, name: p.name, color: p.color })) || [], [projectConfig?.issuePriorities])
   const assignedOptions = useMemo(() => {
      const uniqueUsers = Array.from(new Set(subtasks.map(s => typeof s.assignedId === 'object' ? s.assignedId?.id : null).filter(Boolean)))
      return uniqueUsers.map(userId => {
         const user = subtasks.find(s => typeof s.assignedId === 'object' && s.assignedId?.id === userId)?.assignedId as any
         return { id: user.id as any, name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email, color: '#3b82f6' }
      })
   }, [subtasks])

   // Contar filtros activos
   const activeFiltersCount = [typeFilter, statusFilter, priorityFilter, assignedFilter].filter(f => f !== null).length

   // Validación temprana - si no hay tarea, no renderizar nada
   if (!currentTask) {
      return null
   }

   return (
      <div className=" border-gray-100 rounded-xl shadow-sm border flex flex-col overflow-hidden h-full">
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
               <div className="flex items-center gap-1 flex-shrink-0">
                  <Button onClick={handleUpdateBoardModal} variant="purple_outline" size="sm" className="w-8 h-8 p-0" title="Editar tarea">
                     <EditIcon size={18} />
                  </Button>
                  <Button onClick={onCancel} variant="gray_outline" size="sm" className="w-8 h-8 p-0">
                     <XIcon size={18} />
                  </Button>
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
                              <div className="flex items-center gap-2">
                                 <div className={`transform transition-transform duration-200 ${isSubtasksOpen ? 'rotate-90' : ''}`}>
                                    <ChevronRightIcon size={20} stroke={2} />
                                 </div>
                                 <h3 className="text-lg font-semibold text-gray-900">
                                    Subtareas
                                 </h3>
                                 <span className="bg-gray-100 text-gray-600 flex justify-center items-center text-xs font-bold rounded-full w-6 h-6">
                                    {filteredSubtasks.length}
                                 </span>
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
                                       <div className="mb-3 flex items-center gap-2">
                                          <Button onClick={handleOpenCreateSubtaskModal} size="sm" variant="purple" className="shrink-0 h-8">
                                             <PlusIcon size={14} stroke={2} />
                                             <span className="font-semibold">Crear Subtarea</span>
                                          </Button>
                                          <Button onClick={() => setShowFilters(!showFilters)} size="sm" variant="purple_outline" className="shrink-0 h-8">
                                             <FilterIcon size={14} stroke={2} />
                                             <span className="font-semibold">Filtros</span>
                                             {activeFiltersCount > 0 && <span className="bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{activeFiltersCount}</span>}
                                             <motion.div animate={{ rotate: showFilters ? 90 : 0 }} transition={{ duration: 0.2 }}>
                                                <ChevronRightIcon size={12} stroke={2.5} />
                                             </motion.div>
                                          </Button>

                                          {/* Panel de filtros inline con animación de barrido */}
                                          <AnimatePresence>
                                             {showFilters && (
                                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex-1 flex items-center gap-2">
                                                   <DataSelect label="" value={typeOptions.find(o => o.id === typeFilter) || null} onChange={(o) => setTypeFilter(o.id)} options={typeOptions} placeholder="Tipo" variant="purple" isRequired={false} fullWidth />
                                                   <DataSelect label="" value={statusOptions.find(o => o.id === statusFilter) || null} onChange={(o) => setStatusFilter(o.id)} options={statusOptions} placeholder="Estado" variant="purple" isRequired={false} fullWidth />
                                                   <DataSelect label="" value={priorityOptions.find(o => o.id === priorityFilter) || null} onChange={(o) => setPriorityFilter(o.id)} options={priorityOptions} placeholder="Prioridad" variant="purple" isRequired={false} fullWidth />
                                                   <DataSelect label="" value={assignedOptions.find(o => o.id === assignedFilter) || null} onChange={(o) => setAssignedFilter(o.id as any)} options={assignedOptions} placeholder="Asignado" variant="purple" isRequired={false} fullWidth />
                                                   {activeFiltersCount > 0 && (
                                                      <Button onClick={() => { setTypeFilter(null); setStatusFilter(null); setPriorityFilter(null); setAssignedFilter(null); }} variant="red_outline" size="sm" className="h-8 shrink-0">Limpiar</Button>
                                                   )}
                                                </motion.div>
                                             )}
                                          </AnimatePresence>
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
                                                         <h6 className="font-medium text-gray-900 text-sm truncate" title={subtask.title}>
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

                     {/* Sección de Relaciones (Acordeón con Tabs) */}
                     <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        {/* Header del acordeón */}
                        <button
                           onClick={() => setIsRelationsOpen(!isRelationsOpen)}
                           className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${isRelationsOpen ? 'bg-gray-50' : ''}`}
                        >
                           <div className="flex items-center gap-2">
                              <div className={`transform transition-transform duration-200 ${isRelationsOpen ? 'rotate-90' : ''}`}>
                                 <ChevronRightIcon size={20} stroke={2} />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                 Relaciones
                              </h3>
                              {/* <span className="bg-gray-100 text-gray-600 flex justify-center items-center text-xs font-bold rounded-full w-6 h-6">
                                 {activeRelationTab === 'related' ? relatedIssues.length : relatedToIssues.length}
                              </span> */}
                           </div>
                           {selectedRelations.length > 0 && (
                              <div
                                 onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleDeleteSelectedRelations()
                                 }}
                                 className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                              >
                                 <DeleteIcon size={16} />
                                 Eliminar ({selectedRelations.length})
                              </div>
                           )}
                        </button>

                        {/* Contenido del acordeón */}
                        {isRelationsOpen && (
                           <div className="border-t border-gray-200 p-4">
                              {loadingRelations ? (
                                 <div className="flex items-center justify-center py-8">
                                    <div className="text-gray-500">Cargando relaciones...</div>
                                 </div>
                              ) : (
                                 <>
                                    {/* Tabs */}
                                    <div className="flex gap-1 mb-4 p-1 bg-gray-50 rounded-lg border border-gray-100">
                                       <button
                                          onClick={() => setActiveRelationTab('related')}
                                          className={`flex-1 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeRelationTab === 'related'
                                             ? 'bg-white text-purple-600 shadow-sm'
                                             : 'text-gray-500 hover:text-gray-700'}`}
                                       >
                                          Relaciona a
                                       </button>
                                       <button
                                          onClick={() => setActiveRelationTab('related-to')}
                                          className={`flex-1 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeRelationTab === 'related-to'
                                             ? 'bg-white text-purple-600 shadow-sm'
                                             : 'text-gray-500 hover:text-gray-700'}`}
                                       >
                                          Relacionada por
                                       </button>
                                    </div>

                                    {/* Header de columnas */}
                                    <div className="grid grid-cols-12 items-center gap-4 p-2 text-xs/tight font-semibold text-gray-600 border border-gray-200 bg-gray-50 rounded-t">
                                       <div className="col-span-1 flex justify-center">
                                          <input
                                             type="checkbox"
                                             onChange={(e) => {
                                                const currentList = activeRelationTab === 'related' ? relatedIssues : relatedToIssues
                                                if (e.target.checked) {
                                                   setSelectedRelations(currentList.map(r => String(r.id)))
                                                } else {
                                                   setSelectedRelations([])
                                                }
                                             }}
                                             checked={
                                                selectedRelations.length > 0 &&
                                                selectedRelations.length === (activeRelationTab === 'related' ? relatedIssues.length : relatedToIssues.length)
                                             }
                                             className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                          />
                                       </div>
                                       <div className="col-span-6">Título</div>
                                       <div className="col-span-2">Tipo</div>
                                       <div className="col-span-2">Estado</div>
                                       <div className="col-span-1 text-center">Acciones</div>
                                    </div>

                                    {/* Lista de relaciones */}
                                    <div className="space-y-2 mt-2">
                                       {(activeRelationTab === 'related' ? relatedIssues : relatedToIssues).length > 0 ? (
                                          (activeRelationTab === 'related' ? relatedIssues : relatedToIssues).map((relation) => {
                                             const typeStyle = getTypeStyle(relation.type)
                                             const statusStyle = getStatusStyle(relation.status)
                                             const isSelected = selectedRelations.includes(String(relation.id))

                                             return (
                                                <div
                                                   key={relation.id}
                                                   className={`grid grid-cols-12 items-center gap-4 p-2 border rounded transition-colors text-xs/tight cursor-pointer ${isSelected
                                                      ? 'border-blue-300 bg-blue-50'
                                                      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                      }`}
                                                   onClick={() => {
                                                      const relationId = String(relation.id)
                                                      setSelectedRelations(prev =>
                                                         prev.includes(relationId)
                                                            ? prev.filter(id => id !== relationId)
                                                            : [...prev, relationId]
                                                      )
                                                   }}
                                                >
                                                   {/* Checkbox */}
                                                   <div className="col-span-1 flex justify-center">
                                                      <input
                                                         type="checkbox"
                                                         checked={isSelected}
                                                         onChange={() => { }} // Manejado por el onClick del div padre
                                                         className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                      />
                                                   </div>

                                                   {/* Título */}
                                                   <Link
                                                      href={`/tableros/${currentTask.projectId}/${relation.targetId}`}
                                                      target="_blank"
                                                      onClick={(e) => e.stopPropagation()}
                                                      className={`col-span-6 truncate font-medium transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-900 hover:text-blue-600'
                                                         }`}
                                                   >
                                                      {relation.targetTitle}
                                                   </Link>

                                                   {/* Tipo */}
                                                   <div className="col-span-2">
                                                      {typeStyle ? (
                                                         <span
                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                                            style={{
                                                               backgroundColor: typeStyle.color + '20',
                                                               color: typeStyle.color
                                                            }}
                                                         >
                                                            {typeStyle.name}
                                                         </span>
                                                      ) : (
                                                         <span className="text-gray-400">-</span>
                                                      )}
                                                   </div>

                                                   {/* Estado */}
                                                   <div className="col-span-2">
                                                      {statusStyle ? (
                                                         <span
                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                                            style={{
                                                               backgroundColor: statusStyle.color + '20',
                                                               color: statusStyle.color
                                                            }}
                                                         >
                                                            {statusStyle.name}
                                                         </span>
                                                      ) : (
                                                         <span className="text-gray-400">-</span>
                                                      )}
                                                   </div>

                                                   {/* Acciones */}
                                                   <div className="col-span-1 flex justify-center gap-1">
                                                      <button
                                                         onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleHistorySubtask(relation.targetId)
                                                         }}
                                                         className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                                         title="Historial"
                                                      >
                                                         <ClockIcon size={16} />
                                                      </button>
                                                      <button
                                                         onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteSingleRelation(relation.id)
                                                         }}
                                                         className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                         title="Eliminar relación"
                                                      >
                                                         <DeleteIcon size={16} />
                                                      </button>
                                                   </div>
                                                </div>
                                             )
                                          })
                                       ) : (
                                          <div className="flex items-center justify-center text-gray-500 py-8">
                                             <p className="text-sm">
                                                {activeRelationTab === 'related'
                                                   ? 'Esta tarea no relaciona a ninguna otra'
                                                   : 'Ninguna tarea relaciona a esta'}
                                             </p>
                                          </div>
                                       )}
                                    </div>
                                 </>
                              )}
                           </div>
                        )}
                     </div>

                     {/* Sección de comentarios */}
                     <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <ShowComments
                           arrayComments={comments}
                           task={currentTask}
                           onRelationsUpdated={handleRelationsUpdated}
                        />
                     </div>
                  </div>
               </div>

               {/* Divider Line with Toggle Button */}
               <div className="relative flex items-start justify-center group cursor-pointer flex-shrink-0 py-4" onClick={() => setIsSidebarVisible(!isSidebarVisible)} >
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
                        <div className="space-y-3">
                           <section className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm flex flex-col gap-2">
                              <hgroup className="flex items-center gap-2 mb-1 text-blue-600">
                                 <UsersIcon size={16} /> <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Personas</h3>
                              </hgroup>
                              <article className="flex flex-col gap-1.5 text-xs">
                                 <div className="flex justify-between items-center"><span className="text-gray-500">Asignado a:</span> <span className="font-medium">{typeof currentTask.assignedId === 'object' ? `${currentTask.assignedId.firstName ?? "Sin"} ${currentTask.assignedId.lastName ?? "asignar"}` : currentTask.assignedId || 'No asignado'}</span></div>
                                 <div className="flex justify-between items-center"><span className="text-gray-500">Informador:</span> <span className="font-medium">{currentTask.reporterId ? `${currentTask.reporterId.firstName} ${currentTask.reporterId.lastName}` : 'No especificado'}</span></div>
                              </article>
                           </section>

                           <section className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm flex flex-col gap-2">
                              <hgroup className="flex items-center gap-2 mb-1 text-orange-600">
                                 <BoardIcon size={16} /> <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Detalles</h3>
                              </hgroup>
                              <article className="flex flex-col gap-2 text-xs">
                                 <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Estado:</span>
                                    {(() => {
                                       const status = projectConfig?.issueStatuses?.find((s: { id: number }) => s.id === currentTask.status)
                                       return status ? <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border" style={{ backgroundColor: `${status.color}15`, color: status.color, borderColor: `${status.color}30` }}>{status.name}</span> : <span className="text-gray-400">N/A</span>
                                    })()}
                                 </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Tipo:</span>
                                    {(() => {
                                       const type = projectConfig?.issueTypes?.find((t: { id: number }) => t.id === currentTask.type)
                                       return type ? <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border" style={{ backgroundColor: `${type.color}15`, color: type.color, borderColor: `${type.color}30` }}>{type.name}</span> : <span className="text-gray-400">N/A</span>
                                    })()}
                                 </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Prioridad:</span>
                                    {(() => {
                                       const priority = projectConfig?.issuePriorities?.find((p: { id: number }) => p.id === currentTask.priority)
                                       return priority ? <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border" style={{ backgroundColor: `${priority.color}15`, color: priority.color, borderColor: `${priority.color}30` }}>{priority.name}</span> : <span className="text-gray-400">N/A</span>
                                    })()}
                                 </div>
                              </article>
                           </section>

                           <section className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm flex flex-col gap-2">
                              <hgroup className="flex items-center gap-2 mb-1 text-green-600">
                                 <CalendarIcon size={16} /> <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Fechas</h3>
                              </hgroup>
                              <article className="flex flex-col gap-1.5 text-xs">
                                 <div className="flex justify-between items-center"><span className="text-gray-500">Creación:</span> <span className="font-medium">{formatDate(currentTask.createdAt)}</span></div>
                                 <div className="flex justify-between items-center"><span className="text-gray-500">Actualización:</span> <span className="font-medium">{formatDate(currentTask.updatedAt)}</span></div>
                                 <div className="flex justify-between items-center"><span className="text-gray-500">Inicio:</span> <span className="font-medium">{formatDate(currentTask.startDate, false, true)}</span></div>
                                 <div className="flex justify-between items-center"><span className="text-gray-500">Vencimiento:</span> <span className="font-medium">{formatDate(currentTask.endDate, false, true)}</span></div>
                              </article>
                           </section>

                           <section className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm flex flex-col gap-2">
                              <hgroup className="flex items-center gap-2 mb-1 text-purple-600">
                                 <ClockIcon size={16} /> <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Tiempo</h3>
                              </hgroup>
                              <article className="flex flex-col gap-1.5 text-xs">
                                 <div className="flex justify-between items-center"><span className="text-gray-500">Estimado:</span> <span className="font-medium text-purple-600">{currentTask.estimatedTime ? `${currentTask.estimatedTime}h` : 'N/A'}</span></div>
                              </article>
                           </section>
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
   if (!dateStr) return 'No especificado'

   let date: Date;
   // Attempt to parse as ISO string first, then as YYYY-MM-DD
   if (dateStr.includes('T')) {
      date = new Date(dateStr)
   } else {
      const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
      date = new Date(year, month - 1, day)
   }

   if (isNaN(date.getTime())) return 'Fecha inválida'

   const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
   }

   if (includeTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
      options.hour12 = true
   }

   return date.toLocaleDateString('es-ES', options)
}
