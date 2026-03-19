'use client'

import React, { useRef, useState, useEffect } from 'react'
import { TaskProps } from '@/lib/types/types'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { XIcon, DownloadIcon, ChevronRightIcon } from '@/assets/Icon'
import { useBoardStore } from '@/lib/store/BoardStore'
import TextArea from '@/components/ui/TextArea'
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import Link from 'next/link'
import Image from 'next/image'
import { Button, DataSelect, DateInput, TextInput } from '@/components/ui/FormUI'

interface FormProps {
	onSubmit: (data: TaskProps, filesMap?: Map<string, File[]>) => void
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
	const [descriptionFiles, setDescriptionFiles] = useState<{ [key: string]: File[] }>({})
	const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([])

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

	const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
	const [isPriorityOpen, setIsPriorityOpen] = useState(false)
	const [isStatusOpen, setIsStatusOpen] = useState(false)
	const [isUserOpen, setIsUserOpen] = useState(false)
	const [isTypeOpen, setIsTypeOpen] = useState(false)

	const [formData, setFormData] = useState<TaskProps>({
		id: isEdit ? taskObject?.id : undefined,
		title: isEdit ? taskObject?.title || "" : "",
		descriptions: isEdit ? taskObject?.descriptions || [] : [],
		priority: taskObject?.priority || Number(projectConfig?.issuePriorities?.[0]?.id) || 1,
		status: taskObject?.status || Number(projectConfig?.issueStatuses?.[0]?.id) || 1,
		type: taskObject?.type || Number(projectConfig?.issueTypes?.[0]?.id) || 1,
		projectId: taskObject?.projectId || selectedBoard?.id as string,
		assignedId: isEdit ? taskObject?.assignedId || "" : "",
		estimatedTime: isEdit ? taskObject?.estimatedTime || 0 : 0,
		startDate: isEdit ? taskObject?.startDate || '' : '',
		endDate: isEdit ? taskObject?.endDate || '' : '',
		realDate: isEdit ? taskObject?.realDate || '' : '',
		sprintId: taskObject?.sprintId,
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		let descriptions: any[] = []

		if (isEdit) {
			// For editing, maintain original description IDs, update text, and keep attachments
			descriptions = taskObject?.descriptions?.map(originalDesc => {
				// Find the corresponding project description to get the current text value
				const projectDesc = projectConfig?.issueDescriptions?.find(
					projDesc => projDesc.name === originalDesc.title
				)

				if (projectDesc && descriptionValues[projectDesc.id] && descriptionValues[projectDesc.id].trim()) {
					// Filter out deleted attachments
					const filteredAttachments = originalDesc.attachments?.filter(
						att => !deletedAttachmentIds.includes(att.id)
					) || []

					// Keep original ID, update text, and preserve non-deleted attachments
					return {
						id: originalDesc.id, // Keep the original ID from the task
						title: originalDesc.title,
						text: descriptionValues[projectDesc.id],
						attachments: filteredAttachments // Preserve only non-deleted attachments
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
					text: descriptionValues[projDesc.id],
					attachments: [] // New descriptions start with empty attachments
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

			// Crear un Map con los archivos nuevos por descripción (si hay)
			const filesMap = new Map<string, File[]>()
			projectConfig?.issueDescriptions?.forEach(desc => {
				if (descriptionFiles[desc.id] && descriptionFiles[desc.id].length > 0) {
					filesMap.set(desc.name, descriptionFiles[desc.id])
				}
			})

			onSubmit(editData, filesMap.size > 0 ? filesMap : undefined)
		} else {
			// Para crear, omitir estimatedTime si está vacío, nulo o NaN
			const { estimatedTime, ...restFormData } = formData
			// Solo incluir estimatedTime si es un número válido
			const shouldIncludeEstimatedTime =
				typeof estimatedTime === 'number' &&
				!isNaN(estimatedTime) &&
				estimatedTime !== 0
			const dataToSend = {
				...restFormData,
				descriptions,
				assignedId: userSelected.id,
				...(shouldIncludeEstimatedTime ? { estimatedTime } : { estimatedTime: 0 })
			} as TaskProps

			// Crear un Map con los archivos por descripción
			const filesMap = new Map<string, File[]>()
			projectConfig?.issueDescriptions?.forEach(desc => {
				if (descriptionFiles[desc.id] && descriptionFiles[desc.id].length > 0) {
					filesMap.set(desc.name, descriptionFiles[desc.id])
				}
			})

			onSubmit(dataToSend, filesMap.size > 0 ? filesMap : undefined)
		}
	}

	const handleDescriptionChange = (descriptionId: string, value: string) => {
		setDescriptionValues(prev => ({
			...prev,
			[descriptionId]: value
		}))
	}

	const removeExistingAttachment = (attachmentId: string) => {
		setDeletedAttachmentIds(prev => [...prev, attachmentId])
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
		<form onSubmit={handleSubmit} className='space-y-4'>
			<main className='flex flex-col gap-4'>
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
								<div className='absolute z-[9999] top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto'>
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
				<TextInput placeholder="Título de la Tarea"
					value={formData.title} onChange={(str) => setFormData({ ...formData, title: str })}
					label="Título de la Tarea" variant={isEdit ? 'purple' : 'blue'} isRequired={true} type='text' />

				{/* Lista de Descripciones del Proyecto */}
				{projectConfig?.issueDescriptions && projectConfig.issueDescriptions.length > 0 && (
					<section className='space-y-4 max-h-52 overflow-y-auto'>
						{projectConfig.issueDescriptions.map((description) => (
							<hgroup key={description.id}>
								<TextArea
									title={description.name}
									value={descriptionValues[description.id] || ''}
									onChange={(value) => {
										handleDescriptionChange(description.id.toString(), value)
									}}
									placeholder={`Describe los detalles para: ${description.name}`}
									maxLength={5000}
									minHeight='40px'
									maxHeight='200px'
									files={descriptionFiles[description.id] || []}
									onFilesChange={(files) => {
										setDescriptionFiles(prev => ({
											...prev,
											[description.id]: files
										}))
									}}
									onRemoveFile={(index) => {
										setDescriptionFiles(prev => ({
											...prev,
											[description.id]: prev[description.id].filter((_, i) => i !== index)
										}))
									}}
									projectId={selectedBoard?.id as string}
								/>

								{/* Mostrar imágenes existentes (de la base de datos) si estamos editando */}
								{isEdit && taskObject?.descriptions && (
									(() => {
										const originalDesc = taskObject.descriptions.find(
											desc => desc.title === description.name
										)

										if (originalDesc?.attachments && originalDesc.attachments.length > 0) {
											// Filtrar attachments que no han sido eliminados
											const activeAttachments = originalDesc.attachments.filter(
												att => !deletedAttachmentIds.includes(att.id)
											)

											if (activeAttachments.length === 0) return null

											return (
												<div className="mt-2">
													<p className="text-xs font-semibold text-gray-600 mb-2">Archivos existentes:</p>
													<div className="flex flex-wrap gap-4">
														{activeAttachments.map((file) => {
															const fileSplitted = file.fileName.split(".")
															const extension = fileSplitted[fileSplitted.length - 1]
															const isImage = ["jpg", "png", "jpeg", "gif", "bmp", "webp"].includes(extension.toLowerCase())
															const url = file.fileUrl

															return (
																<div key={file.id} className="relative group">
																	<div className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all">
																		{isImage && url ? (
																			<Link href={url} target="_blank">
																				<div className="w-20 h-20 relative">
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
																				className="flex items-center gap-4 p-3 min-w-0 hover:bg-gray-50 transition-colors"
																			>
																				<div className="flex-shrink-0">
																					<DownloadIcon size={16} stroke={2} />
																				</div>
																				<span className="text-xs text-gray-600 truncate w-20">
																					{file.fileName}
																				</span>
																			</Link>
																		)}
																	</div>
																	<button
																		type="button"
																		className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
																		onClick={(e) => {
																			e.preventDefault()
																			removeExistingAttachment(file.id)
																		}}
																		title="Eliminar archivo"
																	>
																		<XIcon size={12} stroke={1.5} />
																	</button>
																</div>
															)
														})}
													</div>
												</div>
											)
										}
										return null
									})()
								)}
							</hgroup>
						))}
					</section>
				)}

				<section className='flex items-center justify-between gap-4 w-full'>
					<DataSelect value={projectConfig?.issueTypes?.find(t => t.id === formData.type) || null}
						onChange={(option) => setFormData({ ...formData, type: option.id })} options={projectConfig?.issueTypes || []}
						label='Tipo' placeholder='Seleccionar tipo' isRequired={true} variant={isEdit ? 'purple' : 'blue'} fullWidth />

					<DataSelect value={projectConfig?.issueStatuses?.find(s => s.id === formData.status) || null}
						onChange={(option) => setFormData({ ...formData, status: option.id })} options={projectConfig?.issueStatuses || []}
						label='Estado' placeholder='Seleccionar estado' isRequired={true} variant={isEdit ? 'purple' : 'blue'} fullWidth />

					<DataSelect value={projectConfig?.issuePriorities?.find(p => p.id === formData.priority) || null}
						onChange={(option) => setFormData({ ...formData, priority: option.id })} options={projectConfig?.issuePriorities || []}
						label='Prioridad' placeholder='Seleccionar prioridad' isRequired={true} variant={isEdit ? 'purple' : 'blue'} fullWidth />
				</section>

				<button className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-medium transition-colors duration-200"
					onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} type="button">
					<span className={showAdvancedOptions ? "rotate-90" : ""}><ChevronRightIcon size={16} /></span>
					{showAdvancedOptions ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas'}
				</button>

				{showAdvancedOptions &&
					<section className='flex flex-col gap-4'>
						{/* Fechas de la tarea */}
						<fieldset className='flex items-center justify-between gap-4 w-full'>
							<DateInput onChange={(date) => setFormData({ ...formData, startDate: date })}
								label="Inicio Estimado" variant={isEdit ? 'purple' : 'blue'} isRequired={false}
								value={formData.startDate || ''} max={formData.endDate || ''} fullWidth />

							<DateInput onChange={(date) => setFormData({ ...formData, endDate: date })}
								label="Fin Estimado" variant={isEdit ? 'purple' : 'blue'} isRequired={false}
								value={formData.endDate || ''} min={formData.startDate || ''} fullWidth />
						</fieldset>

						{/* Tipo de Tarea y Tiempo Estimado - Misma línea */}
						<fieldset className='flex items-center justify-between gap-4 w-full'>
							{isEdit && <DateInput onChange={(date) => setFormData({ ...formData, realDate: date })}
								label="Fecha Fin Real" variant={isEdit ? 'purple' : 'blue'} isRequired={false}
								value={formData.realDate || ''} fullWidth />}

							<TextInput placeholder="Digita la cantidad de horas"
								value={formData.estimatedTime === 0 ? "" : String(formData.estimatedTime)}
								onChange={(str) => setFormData({ ...formData, estimatedTime: Number(str) })}
								label="Tiempo Estimado" variant={isEdit ? 'purple' : 'blue'} isRequired={false} type='number' fullWidth />
						</fieldset>
					</section>
				}
			</main>

			<footer className="flex justify-end items-center gap-4">
				<Button onClick={() => onCancel()} size='sm' variant='gray'>Cancelar</Button>
				<Button type="submit" size='sm' variant={isEdit ? 'purple' : 'blue'}>{isEdit ? 'Actualizar Tarea' : 'Crear Nueva Tarea'}</Button>
			</footer>
		</form >
	)
}
