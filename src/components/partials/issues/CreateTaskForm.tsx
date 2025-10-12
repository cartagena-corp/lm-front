'use client'

import React, { useRef, useState, useEffect } from 'react'
import { TaskProps } from '@/lib/types/types'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { PlusIcon, XIcon, DownloadIcon, AttachIcon } from '@/assets/Icon'
import { useBoardStore } from '@/lib/store/BoardStore'
import AutoResizeTextarea from '@/components/ui/AutoResizeTextarea'
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import Link from 'next/link'
import Image from 'next/image'

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
	const [dragActiveDesc, setDragActiveDesc] = useState<{ [key: string]: boolean }>({})
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

	const handleFileChange = (descriptionId: string, files: FileList | null) => {
		if (files) {
			// Filtrar solo imágenes
			const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
			if (imageFiles.length > 0) {
				setDescriptionFiles(prev => ({
					...prev,
					[descriptionId]: [...(prev[descriptionId] || []), ...imageFiles]
				}))
			}
		}
	}

	const removeFile = (descriptionId: string, fileIndex: number) => {
		setDescriptionFiles(prev => ({
			...prev,
			[descriptionId]: prev[descriptionId].filter((_, idx) => idx !== fileIndex)
		}))
	}

	const removeExistingAttachment = (attachmentId: string) => {
		setDeletedAttachmentIds(prev => [...prev, attachmentId])
	}

	const handleDragOver = (e: React.DragEvent<HTMLElement>, descriptionId: string) => {
		e.preventDefault()
		setDragActiveDesc(prev => ({ ...prev, [descriptionId]: true }))
	}

	const handleDragLeave = (e: React.DragEvent<HTMLElement>, descriptionId: string) => {
		const rect = e.currentTarget.getBoundingClientRect()
		if (
			e.clientX < rect.left ||
			e.clientX > rect.right ||
			e.clientY < rect.top ||
			e.clientY > rect.bottom
		) {
			setDragActiveDesc(prev => ({ ...prev, [descriptionId]: false }))
		}
	}

	const handleDrop = (e: React.DragEvent<HTMLElement>, descriptionId: string) => {
		e.preventDefault()
		setDragActiveDesc(prev => ({ ...prev, [descriptionId]: false }))
		const dropped = Array.from(e.dataTransfer.files)
		// Filtrar solo imágenes
		const imageFiles = dropped.filter(file => file.type.startsWith('image/'))
		if (imageFiles.length > 0) {
			setDescriptionFiles(prev => ({
				...prev,
				[descriptionId]: [...(prev[descriptionId] || []), ...imageFiles]
			}))
		}
	}

	const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, descriptionId: string) => {
		if (e.clipboardData && e.clipboardData.items) {
			const items = Array.from(e.clipboardData.items)
			const imageFiles: File[] = []
			items.forEach(item => {
				if (item.kind === 'file' && item.type.startsWith('image/')) {
					const file = item.getAsFile()
					if (file) {
						imageFiles.push(file)
					}
				}
			})
			if (imageFiles.length > 0) {
				setDescriptionFiles(prev => ({
					...prev,
					[descriptionId]: [...(prev[descriptionId] || []), ...imageFiles]
				}))
				e.preventDefault()
			}
		}
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
			<div className="bg-white">
				{/* Header
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
				</div> */}

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6">
					<div className='space-y-2'>
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
									<h6 className='text-sm font-semibold text-gray-900 mb-2'>Descripciones Disponibles</h6>
									<div className='space-y-4 max-h-52 overflow-y-auto'>
										{projectConfig.issueDescriptions.map((description) => (
											<div key={description.id} className='bg-white border border-gray-200 rounded-lg p-3'>
												<div className='flex items-center justify-between'>
													<label className='text-sm font-medium text-gray-900 mb-2 block'>
														{description.name}
													</label>
													<div className='flex items-center gap-2 text-xs mb-2'>
														<div className={`w-2 h-2 rounded-full ${(descriptionValues[description.id]?.length || 0) > 5000
															? 'bg-red-500'
															: (descriptionValues[description.id]?.length || 0) > 4500
																? 'bg-orange-500'
																: 'bg-green-500'
															}`} />
														<span className={`font-medium ${(descriptionValues[description.id]?.length || 0) > 5000
															? 'text-red-600'
															: (descriptionValues[description.id]?.length || 0) > 4500
																? 'text-orange-600'
																: 'text-green-600'
															}`}>
															{descriptionValues[description.id]?.length || 0}/5000
														</span>
													</div>
												</div>
												<AutoResizeTextarea
													value={descriptionValues[description.id] || ''}
													onChange={(value) => {
														if (value.length <= 5000) {
															handleDescriptionChange(description.id.toString(), value)
														}
													}}
													onPaste={(e) => handlePaste(e, description.id.toString())}
													placeholder={`Describe los detalles para: ${description.name}`}
													required={false}
													rows={3}
													className="w-full border border-gray-200 rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
												/>

												{/* Área de archivos */}
												<div
													className='mt-2'
													onDragOver={(e) => handleDragOver(e, description.id.toString())}
													onDragLeave={(e) => handleDragLeave(e, description.id.toString())}
													onDrop={(e) => handleDrop(e, description.id.toString())}
												>
													{/* Mostrar imágenes existentes si estamos editando */}
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
																	<div className="mb-3">
																		<p className="text-xs font-medium text-gray-700 mb-2">Archivos actuales:</p>
																		<div className="flex flex-wrap gap-3">
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
																						<button
																							type="button"
																							className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
																							onClick={(e) => {
																								e.preventDefault()
																								removeExistingAttachment(file.id)
																							}}
																							title="Eliminar archivo"
																						>
																							<XIcon size={12} stroke={2} />
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

													{/* Previsualizaciones de archivos nuevos */}
													{descriptionFiles[description.id] && descriptionFiles[description.id].length > 0 && (
														<div className="mb-3">
															<p className="text-xs font-medium text-gray-700 mb-2">
																{isEdit ? 'Nuevas imágenes:' : 'Imágenes adjuntas:'}
															</p>
															<div className="flex flex-wrap gap-3">
																{descriptionFiles[description.id].map((file, idx) => {
																	const url = URL.createObjectURL(file)
																	return (
																		<div key={idx} className="relative group">
																			<div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
																				<div className="w-16 h-16 relative">
																					<Image
																						src={url}
																						alt={file.name}
																						fill
																						className="object-cover"
																					/>
																				</div>
																			</div>
																			<button
																				type="button"
																				className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
																				onClick={() => removeFile(description.id.toString(), idx)}
																				title="Eliminar imagen"
																			>
																				<XIcon size={12} stroke={2} />
																			</button>
																		</div>
																	)
																})}
															</div>
														</div>
													)}

													{/* Botón de adjuntar archivos */}
													<div className={`${dragActiveDesc[description.id] ? 'bg-blue-50 border-blue-300 rounded-lg p-3' : ''}`}>
														{dragActiveDesc[description.id] && (
															<div className="text-center mb-2">
																<p className="text-xs font-medium text-blue-900">Suelta las imágenes aquí</p>
															</div>
														)}
														<input
															type="file"
															multiple
															accept="image/*"
															id={`file-input-${description.id}`}
															onChange={(e) => handleFileChange(description.id.toString(), e.target.files)}
															className="hidden"
														/>
														<button
															type="button"
															onClick={() => document.getElementById(`file-input-${description.id}`)?.click()}
															className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
															title="Adjuntar imágenes (también puedes arrastrar o pegar con Ctrl+V)"
														>
															<AttachIcon size={14} stroke={2} />
															Adjuntar imágenes
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Fechas de la tarea */}
						<div className='space-y-2'>
							{/* Fecha de inicio y fecha de fin en la misma línea */}
							<div className='flex flex-col md:flex-row gap-6'>
								{/* Fecha de inicio */}
								<div className='space-y-2 flex-1'>
									<label htmlFor="startDate" className="text-gray-900 text-sm font-semibold">
										Fecha de inicio
									</label>
									<div className='border-gray-200 flex items-center rounded-lg border px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
										<input
											onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
											className="outline-none text-sm w-full bg-transparent placeholder-gray-400"
											value={formData.startDate || ''}
											name="startDate"
											type="date"
											id="startDate"
										/>
									</div>
								</div>
								{/* Fecha de fin */}
								<div className='space-y-2 flex-1'>
									<label htmlFor="endDate" className="text-gray-900 text-sm font-semibold">
										Fecha de fin
									</label>
									<div className='border-gray-200 flex items-center rounded-lg border px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
										<input
											onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
											className="outline-none text-sm w-full bg-transparent placeholder-gray-400"
											value={formData.endDate || ''}
											name="endDate"
											type="date"
											id="endDate"
										/>
									</div>
								</div>
							</div>
							{/* Fecha real de finalización (solo en edición) - ocupa toda la línea */}
							{isEdit && (
								<div className='space-y-2 w-full'>
									<label htmlFor="realDate" className="text-gray-900 text-sm font-semibold">
										Fecha real de finalización
									</label>
									<div className='border-gray-200 flex items-center rounded-lg border px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200'>
										<input
											onChange={(e) => setFormData({ ...formData, realDate: e.target.value })}
											className="outline-none text-sm w-full bg-transparent placeholder-gray-400"
											value={formData.realDate || ''}
											name="realDate"
											type="date"
											id="realDate"
										/>
									</div>
								</div>
							)}
						</div>

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
										min={0}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="flex justify-end gap-3 mt-4">
						<button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="button"
							onClick={() => onCancel()}>
							Cancelar
						</button>
						<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium" type="submit">
							{isEdit ? 'Actualizar Tarea' : 'Crear Nueva Tarea'}
						</button>
					</div>
				</form>
			</div>
		</>
	)
}
