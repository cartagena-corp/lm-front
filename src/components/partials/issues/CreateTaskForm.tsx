'use client'

import React, { useState, useEffect } from 'react'
import { TaskProps } from '@/lib/types/types'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { Download, X } from 'lucide-react'
import { useBoardStore } from '@/lib/store/BoardStore'
import TextArea from '@/components/ui/TextArea'
import Link from 'next/link'
import Image from 'next/image'
import CustomSelect from '@/components/ui/CustomSelect'

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

	const labelCls = "text-[13px] font-medium"
	const inputWrapCls = "flex items-center rounded-md px-4 h-11 transition-shadow duration-150 focus-within:outline-2 focus-within:outline-[var(--blue-700)] focus-within:outline-offset-2"
	const inputCls = "outline-none text-sm w-full bg-transparent placeholder:text-[var(--ds-text-muted)]"

	return (
		<>
			<div>
				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6">
					<div className='space-y-2'>
						{/* Asignar a - Solo mostrar cuando no se está editando */}
						{!isEdit && (
							<div>
								<label className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
									Asignar a
									<span className='ml-1' style={{ color: "var(--red-700)" }}>*</span>
								</label>
								<CustomSelect
									value={userSelected?.id ?? null}
									onChange={(value) => {
										// Campo requerido: ignorar la opción "limpiar" del select, siempre
										// debe quedar un usuario seleccionado.
										const user = allProjectUsers.find(u => u.id === value)
										if (user) setUserSelected(user)
									}}
									options={allProjectUsers.map(user => ({
										value: user.id,
										label: user.firstName || user.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : (user.email || 'Sin nombre'),
										image: user.picture || undefined,
										subtitle: user.email
									}))}
									placeholder="Seleccionar usuario"
									variant="user"
								/>
							</div>
						)}

						{/* Título de la Tarea */}
						<div>
							<label htmlFor="title" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
								Título de la Tarea
								<span className='ml-1' style={{ color: "var(--red-700)" }}>*</span>
							</label>
							<div className={inputWrapCls} style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
								<input
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									className={inputCls}
									style={{ color: "var(--ds-text)" }}
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
							<div className='rounded-md p-4' style={{ background: "var(--gray-alpha-100)" }}>
								<h6 className='text-sm font-semibold mb-2' style={{ color: "var(--ds-text)" }}>Descripciones Disponibles</h6>
								<div className='space-y-4 max-h-52 overflow-y-auto'>
									{projectConfig.issueDescriptions.map((description) => (
										<div key={description.id} className='rounded-md p-3' style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
											<TextArea
												title={description.name}
												value={descriptionValues[description.id] || ''}
												onChange={(value) => {
													handleDescriptionChange(description.id.toString(), value)
												}}
												placeholder={`Describe los detalles para: ${description.name}`}
												maxLength={5000}
												minHeight='80px'
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
																<p className="text-xs font-semibold mb-2" style={{ color: "var(--ds-text-secondary)" }}>Archivos existentes:</p>
																<div className="flex flex-wrap gap-2">
																	{activeAttachments.map((file) => {
																		const fileSplitted = file.fileName.split(".")
																		const extension = fileSplitted[fileSplitted.length - 1]
																		const isImage = ["jpg", "png", "jpeg", "gif", "bmp", "webp"].includes(extension.toLowerCase())
																		const url = file.fileUrl

																		return (
																			<div key={file.id} className="relative group">
																				<div className="border border-[var(--ds-border)] hover:border-[var(--blue-400)] hover:shadow-md rounded-md overflow-hidden transition-all duration-150">
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
																							className="flex items-center gap-2 p-3 min-w-0 transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
																						>
																							<div className="flex-shrink-0" style={{ color: "var(--ds-text-secondary)" }}>
																								<Download size={16} strokeWidth={2} />
																							</div>
																							<span className="text-xs truncate w-20" style={{ color: "var(--ds-text-secondary)" }}>
																								{file.fileName}
																							</span>
																						</Link>
																					)}
																				</div>
																				<button
																					type="button"
																					className="absolute -top-2 -right-2 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-[var(--red-700)] hover:bg-[var(--red-800)]"
																					style={{ color: "var(--ds-contrast-inverse)" }}
																					onClick={(e) => {
																						e.preventDefault()
																						removeExistingAttachment(file.id)
																					}}
																					title="Eliminar archivo"
																				>
																					<X size={12} strokeWidth={1.5} />
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
										</div>
									))}
								</div>
							</div>
						)}

						{/* Fechas de la tarea */}
						<div className='space-y-2'>
							{/* Fecha de inicio y fecha de fin en la misma línea */}
							<div className='flex flex-col md:flex-row gap-6'>
								{/* Fecha de inicio */}
								<div className='space-y-2 flex-1'>
									<label htmlFor="startDate" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
										Fecha de inicio
									</label>
									<div className={inputWrapCls} style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
										<input
											onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
											className={inputCls}
											style={{ color: "var(--ds-text)" }}
											value={formData.startDate || ''}
											name="startDate"
											type="date"
											id="startDate"
										/>
									</div>
								</div>
								{/* Fecha de fin */}
								<div className='space-y-2 flex-1'>
									<label htmlFor="endDate" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
										Fecha de fin
									</label>
									<div className={inputWrapCls} style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
										<input
											onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
											className={inputCls}
											style={{ color: "var(--ds-text)" }}
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
									<label htmlFor="realDate" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
										Fecha real de finalización
									</label>
									<div className={inputWrapCls} style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
										<input
											onChange={(e) => setFormData({ ...formData, realDate: e.target.value })}
											className={inputCls}
											style={{ color: "var(--ds-text)" }}
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
							<div>
								<label className={`${labelCls} block`} style={{ color: "var(--ds-text-secondary)" }}>
									Estado
									<span className='ml-1' style={{ color: "var(--red-700)" }}>*</span>
								</label>
								<CustomSelect
									value={formData.status}
									onChange={(value) => {
										if (value !== null) setFormData({ ...formData, status: value as number })
									}}
									options={(projectConfig?.issueStatuses || []).map(status => ({ value: status.id, label: status.name, color: status.color }))}
									placeholder="Seleccionar estado"
									variant="colored"
								/>
							</div>

							{/* Prioridad */}
							<div>
								<label className={`${labelCls} block`} style={{ color: "var(--ds-text-secondary)" }}>
									Prioridad
									<span className='ml-1' style={{ color: "var(--red-700)" }}>*</span>
								</label>
								<CustomSelect
									value={formData.priority}
									onChange={(value) => {
										if (value !== null) setFormData({ ...formData, priority: value as number })
									}}
									options={(projectConfig?.issuePriorities || []).map(priority => ({ value: priority.id, label: priority.name, color: priority.color }))}
									placeholder="Seleccionar prioridad"
									variant="colored"
								/>
							</div>
						</div>

						{/* Tipo de Tarea y Tiempo Estimado - Misma línea */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							{/* Tipo */}
							<div>
								<label className={`${labelCls} block`} style={{ color: "var(--ds-text-secondary)" }}>
									Tipo de Tarea
									<span className='ml-1' style={{ color: "var(--red-700)" }}>*</span>
								</label>
								<CustomSelect
									value={formData.type}
									onChange={(value) => {
										if (value !== null) setFormData({ ...formData, type: value as number })
									}}
									options={(projectConfig?.issueTypes || []).map(type => ({ value: type.id, label: type.name, color: type.color }))}
									placeholder="Seleccionar tipo"
									variant="colored"
								/>
							</div>

							{/* Tiempo estimado */}
							<div className='space-y-2 -translate-y-1'>
								<label htmlFor="estimatedTime" className={labelCls} style={{ color: "var(--ds-text-secondary)" }}>
									Tiempo Estimado (horas)
								</label>
								<div className={inputWrapCls} style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
									<input
										onChange={(e) => setFormData({ ...formData, estimatedTime: Number(e.target.value) })}
										className={`${inputCls} text-xs`}
										style={{ color: "var(--ds-text)" }}
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
						<button
							className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
							style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
							type="button"
							onClick={() => onCancel()}>
							Cancelar
						</button>
						<button
							className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
							style={{ color: "var(--primary-contrast-fg)" }}
							type="submit">
							{isEdit ? 'Actualizar Tarea' : 'Crear Nueva Tarea'}
						</button>
					</div>
				</form>
			</div>
		</>
	)
}
