'use client'

import { CalendarIcon, ClockIcon, EditIcon, UsersIcon, ConfigIcon, ChevronRightIcon, KanbanIcon, ListIcon, GanttIcon } from '@/assets/Icon'
import ProjectConfigModal from '@/components/partials/config/projects/ProjectConfigModal'
import CreateBoardForm from '@/components/partials/boards/CreateBoardForm'
import SprintBoard from '@/components/partials/sprints/SprintBoard'
import { Button } from '@/components/ui/FormUI'
import SprintList from '@/components/partials/sprints/SprintList'
import DiagramaGantt from '@/components/ui/DiagramaGantt'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useSprintStore } from '@/lib/store/SprintStore'
import { getUserAvatar } from '@/lib/utils/avatar.utils'
import { useBoardStore } from '@/lib/store/BoardStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import { useModalStore } from '@/lib/hooks/ModalStore'
import { CustomTab } from '@/components/ui/CustomTab'
import type { TabOption } from '@/components/ui/CustomTab'
import { useAuthStore } from '@/lib/store/AuthStore'
import { formatDate } from '@/lib/utils/date.utils'
import { ProjectProps } from '@/lib/types/types'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Badge from '@/components/ui/Badge'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const view = [
	{ id: 1, name: "Tablero", view: SprintBoard as React.ComponentType, icon: <KanbanIcon size={16} stroke={2} /> },
	{ id: 2, name: "Lista", view: SprintList as React.ComponentType, icon: <ListIcon size={16} stroke={2} /> },
	{ id: 3, name: "Diagrama de Gantt", view: DiagramaGantt as React.ComponentType, icon: <GanttIcon size={16} stroke={2} /> },
]

export default function TableroDetalle() {
	const { getValidAccessToken, isAuthenticated, getListUsers } = useAuthStore()
	const { selectedBoard, getBoard, updateBoard, isLoading } = useBoardStore()
	const { setProjectConfig, projectStatus, setConfig } = useConfigStore()
	const [sprintMode, setSprintMode] = useState<TabOption>(view[0])
	const [isDetailsOpen, setIsDetailsOpen] = useState(true)
	const { getSprints } = useSprintStore()
	const { getIssues } = useIssueStore()
	const { id } = useParams()

	// Load persistent state for board details
	useEffect(() => {
		const savedState = localStorage.getItem(`board-details-open-${id}`)
		if (savedState !== null) {
			setIsDetailsOpen(savedState === 'true')
		}
	}, [id])

	const toggleDetails = () => {
		const newState = !isDetailsOpen
		setIsDetailsOpen(newState)
		localStorage.setItem(`board-details-open-${id}`, String(newState))
	}

	useEffect(() => {
		if (isAuthenticated) {
			(async () => {
				const token = await getValidAccessToken()
				if (token) {
					await getBoard(token, id as string)
					await getIssues(token, id as string, { sprintId: '' })
					await setProjectConfig(id as string, token)
					await getSprints(token, id as string)
					await getListUsers(token)
				}
			})()
		}
	}, [isAuthenticated, getBoard, setProjectConfig, getValidAccessToken, getIssues, getSprints, getListUsers, id])

	useEffect(() => {
		if (isAuthenticated) {
			(async () => {
				const token = await getValidAccessToken()
				if (token) {
					await setConfig(token)
				}
			})()
		}
	}, [isAuthenticated, setConfig, getValidAccessToken])

	const handleUpdate = async (formData: ProjectProps, jiraImport: File | null) => {
		const token = await getValidAccessToken()
		if (token) {
			const updateData = {
				name: formData.name,
				description: formData.description,
				startDate: formData.startDate,
				endDate: formData.endDate,
				status: typeof formData.status === 'object' ? formData.status.id : formData.status
			}
			await updateBoard(token, updateData, selectedBoard?.id as string)
		}
		closeModal()
	}

	const getStatusName = (statusId: number) => {
		const statusObj = projectStatus?.find(status => status.id === statusId)
		return statusObj?.name || "Estado desconocido"
	}

	const getStatusColor = (statusId: number) => {
		const statusObj = projectStatus?.find(status => status.id === statusId)
		return statusObj?.color || "#6B7280"
	}

	const { openModal, closeModal } = useModalStore()

	const handleUpdateBoardModal = () => {
		openModal({
			size: "md",
			title: "Editar Tablero",
			desc: "Edita los detalles del tablero",
			Icon: <EditIcon size={20} stroke={1.75} />,
			children: <CreateBoardForm onSubmit={handleUpdate} onCancel={() => closeModal()} editData={selectedBoard as ProjectProps} isEdit={true} />,
			closeOnBackdrop: false,
			closeOnEscape: false,
			mode: "UPDATE"
		})
	}

	const handleConfigBoardModal = () => {
		openModal({
			size: "xl",
			title: "Configuración del Tablero",
			desc: "Gestiona la configuración específica de este tablero",
			Icon: <ConfigIcon size={20} stroke={1.75} />,
			children: <ProjectConfigModal projectId={id as string} onClose={() => closeModal()} />,
			closeOnBackdrop: false,
			closeOnEscape: false,
		})
	}

	const userProject = {
		firstName: selectedBoard?.createdBy?.firstName,
		lastName: selectedBoard?.createdBy?.lastName,
		picture: selectedBoard?.createdBy?.picture,
		email: selectedBoard?.createdBy?.email,
	}

	return (
		<main className="flex flex-col gap-2">
			{/* Top Navigation Bar */}
			<section className='flex justify-between items-center'>
				<Link className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors gap-1" href={`/tableros`}>
					<span className="transform rotate-180"><ChevronRightIcon size={16} /></span> Volver
				</Link>
				<CustomTab options={view} value={sprintMode} onChange={(tabOption) => setSprintMode(tabOption)} />
			</section>

			{/* Board Header Card - Only visible in "Lista" view */}
			{sprintMode.name === "Lista" && (
				<section className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden mb-2">
					{/* Header / Title Row */}
					<div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 gap-3">
						<div className="flex items-center gap-3 flex-1 min-w-0">
							<button
								onClick={toggleDetails}
								className={`p-1 rounded-md transition-all duration-200 hover:bg-gray-100 text-gray-400 hover:text-gray-700 ${isDetailsOpen ? 'rotate-90' : 'rotate-0'}`}
								aria-label="Toggle details"
							>
								<ChevronRightIcon size={18} stroke={2} />
							</button>

							<div className="flex items-center gap-3 min-w-0">
								<h1 className="text-lg font-bold text-gray-900 tracking-tight truncate">{selectedBoard?.name}</h1>
								<Badge id={Number(selectedBoard?.status)} type="projectStatus" className='px-2 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0' />
							</div>

							{!isDetailsOpen && selectedBoard?.description && (
								<span className="hidden md:block text-xs text-gray-400 truncate max-w-xs border-l border-gray-200 pl-3">
									{selectedBoard.description}
								</span>
							)}
						</div>

						{/* Actions */}
						<nav className='flex items-center gap-2 flex-shrink-0 self-end md:self-center'>
							<Button size='sm' variant='gray_outline' onClick={handleUpdateBoardModal} disabled={isLoading} className="h-8 px-3 text-xs border-gray-200 bg-white text-gray-600 font-medium hover:text-gray-900">
								<EditIcon size={14} stroke={2} /> <span className="hidden sm:inline">Editar</span>
							</Button>
							<Button size='sm' variant='gray_outline' onClick={handleConfigBoardModal} disabled={isLoading} className="h-8 px-3 text-xs border-gray-200 bg-white text-gray-600 font-medium hover:text-gray-900">
								<ConfigIcon size={14} stroke={2} /> <span className="hidden sm:inline">Configurar</span>
							</Button>
						</nav>
					</div>

					{/* Collapsible Details Content */}
					<motion.div
						animate={{ height: isDetailsOpen ? 'auto' : 0, opacity: isDetailsOpen ? 1 : 0 }}
						initial={false}
						transition={{ duration: 0.25, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<article className='px-4 pb-4 pt-0'>
							<div className="pt-4 border-t border-gray-100/80">
								<div className="flex flex-col lg:flex-row gap-6">
									{/* Left: Description */}
									<div className="flex-1 space-y-2">
										<h4 className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Descripción</h4>
										<p className="text-sm text-gray-600 leading-relaxed font-normal">
											{selectedBoard?.description || <span className="italic text-gray-400">Sin descripción disponible para este tablero.</span>}
										</p>
									</div>

									{/* Right: Meta Info Cards */}
									<div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:w-72 flex-shrink-0">
										{/* Creator Card */}
										<div className="flex-1 bg-gray-50/50 rounded-lg p-3 border border-gray-100">
											<h5 className="text-[10px] text-gray-400 font-medium mb-2">Responsable</h5>
											<div className="flex items-center gap-2.5">
												<Image className="object-cover rounded-full bg-white ring-1 ring-gray-100" src={getUserAvatar(userProject, 28)} width={28} height={28} alt="User" />
												<div className="flex flex-col min-w-0">
													<span className="text-xs font-semibold text-gray-700 truncate">{selectedBoard?.createdBy?.firstName} {selectedBoard?.createdBy?.lastName}</span>
													<span className="text-[10px] text-gray-400 truncate">{selectedBoard?.createdBy?.email}</span>
												</div>
											</div>
										</div>

										{/* Dates Card */}
										<div className="flex-1 bg-gray-50/50 rounded-lg p-3 border border-gray-100">
											<h5 className="text-[10px] text-gray-400 font-medium mb-2">Cronograma</h5>
											<div className="space-y-1.5">
												<div className="flex justify-between items-center text-xs">
													<span className="text-gray-500">Inicio</span>
													<div className="flex items-center gap-1.5 font-medium text-gray-700">
														<span className="text-gray-400"><CalendarIcon size={12} /></span>
														<time dateTime={selectedBoard?.startDate}>{formatDate(selectedBoard?.startDate ?? "")}</time>
													</div>
												</div>
												<div className="flex justify-between items-center text-xs">
													<span className="text-gray-500">Fin</span>
													<div className="flex items-center gap-1.5 font-medium text-gray-700">
														<span className="text-gray-400"><ClockIcon size={12} /></span>
														<time dateTime={selectedBoard?.endDate}>{formatDate(selectedBoard?.endDate ?? "")}</time>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</article>
					</motion.div>
				</section>
			)}

			{
				sprintMode.name !== "Tablero" && (
					<>
						{isLoading && (
							<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
								{/* Project Header */}
								<div className="p-6 border-b border-gray-100">
									<div className='flex justify-between items-start gap-4'>
										<div className='flex flex-col'>
											<h2 className='text-2xl font-bold text-gray-900 mb-2'>{selectedBoard?.name}</h2>
											{selectedBoard && (
												<div className="rounded-full text-xs font-medium px-3 py-1 whitespace-nowrap flex-shrink-0 w-fit"
													style={{
														backgroundColor: `${getStatusColor(Number(selectedBoard.status))}20`,
														color: getStatusColor(Number(selectedBoard.status)),
														border: `1px solid ${getStatusColor(Number(selectedBoard.status))}40`
													}}
												>
													{getStatusName(Number(selectedBoard.status)).charAt(0).toUpperCase() + getStatusName(Number(selectedBoard.status)).slice(1).toLowerCase()}
												</div>
											)}
										</div>

										<div className="flex gap-2">
											<button
												onClick={() => handleConfigBoardModal()}
												disabled={isLoading}
												className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
											>
												<ConfigIcon size={16} />
												<span className="hidden sm:inline">Configuración</span>
												<span className="sm:hidden">Config</span>
											</button>

											<button
												onClick={() => handleUpdateBoardModal()}
												disabled={isLoading}
												className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
											>
												<EditIcon size={16} />
												<span className="hidden sm:inline">{isLoading ? 'Cargando...' : 'Editar Proyecto'}</span>
												<span className="sm:hidden">Editar</span>
											</button>
										</div>
									</div>

									{selectedBoard?.description && (
										<p className='text-gray-600 mt-4 leading-relaxed'>{selectedBoard.description}</p>
									)}
								</div>

								{/* Project Metadata */}
								<div className="p-6">
									<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
										{/* Start Date */}
										<div className='flex items-center gap-3'>
											<div className='p-2 bg-blue-50 text-blue-600 rounded-lg'>
												<CalendarIcon size={20} />
											</div>
											<div>
												<h6 className='text-sm font-bold text-gray-900'>Fecha de inicio</h6>
												<p className='text-sm text-gray-600'>
													{selectedBoard?.startDate ? (() => {
														const [year, month, day] = selectedBoard.startDate.split('-').map(num => parseInt(num, 10))
														const date = new Date(year, month - 1, day)
														return date.toLocaleDateString('es-ES', {
															day: '2-digit',
															month: 'short',
															year: 'numeric'
														})
													})() : 'No definida'}
												</p>
											</div>
										</div>

										{/* End Date */}
										<div className='flex items-center gap-3'>
											<div className='p-2 bg-green-50 text-green-600 rounded-lg'>
												<CalendarIcon size={20} />
											</div>
											<div>
												<h6 className='text-sm font-bold text-gray-900'>Fecha de fin</h6>
												<p className='text-sm text-gray-600'>
													{selectedBoard?.endDate ? (() => {
														const [year, month, day] = selectedBoard.endDate.split('-').map(num => parseInt(num, 10))
														const date = new Date(year, month - 1, day)
														return date.toLocaleDateString('es-ES', {
															day: '2-digit',
															month: 'short',
															year: 'numeric'
														})
													})() : 'No definida'}
												</p>
											</div>
										</div>

										{/* Created Date */}
										<div className='flex items-center gap-3'>
											<div className='p-2 bg-purple-50 text-purple-600 rounded-lg'>
												<ClockIcon size={20} />
											</div>
											<div>
												<h6 className='text-sm font-bold text-gray-900'>Creado</h6>
												<p className='text-sm text-gray-600'>
													{selectedBoard?.createdAt ? (() => {
														let date
														if (selectedBoard.createdAt.includes('T')) {
															date = new Date(selectedBoard.createdAt)
														} else {
															const [year, month, day] = selectedBoard.createdAt.split('-').map(num => parseInt(num, 10))
															date = new Date(year, month - 1, day)
														}
														return date.toLocaleDateString('es-ES', {
															day: '2-digit',
															month: 'short',
															year: 'numeric'
														})
													})() : 'No disponible'}
												</p>
											</div>
										</div>

										{/* Updated Date */}
										<div className='flex items-center gap-3'>
											<div className='p-2 bg-orange-50 text-orange-600 rounded-lg'>
												<ClockIcon size={20} />
											</div>
											<div>
												<h6 className='text-sm font-bold text-gray-900'>Actualizado</h6>
												<p className='text-sm text-gray-600'>
													{selectedBoard?.updatedAt ? (() => {
														let date
														if (selectedBoard.updatedAt.includes('T')) {
															date = new Date(selectedBoard.updatedAt)
														} else {
															const [year, month, day] = selectedBoard.updatedAt.split('-').map(num => parseInt(num, 10))
															date = new Date(year, month - 1, day)
														}
														return date.toLocaleDateString('es-ES', {
															day: '2-digit',
															month: 'short',
															year: 'numeric'
														})
													})() : 'No disponible'}
												</p>
											</div>
										</div>
									</div>

									{/* Created By Section */}
									{selectedBoard?.createdBy && (
										<div className="mt-6 pt-6 border-t border-gray-100">
											<div className='flex items-center gap-4'>
												<div className='p-2 bg-indigo-50 text-indigo-600 rounded-lg'>
													<UsersIcon size={20} />
												</div>
												<div>
													<h6 className='text-sm font-bold text-gray-900'>Creado por</h6>
													<div className='flex items-center gap-2'>
														<div className='w-8 h-8 bg-gray-100 rounded-full overflow-hidden'>
															<Image
																src={selectedBoard.createdBy.picture}
																alt={`${selectedBoard.createdBy.firstName} ${selectedBoard.createdBy.lastName}`}
																width={32}
																height={32}
																className="w-full h-full object-cover"
															/>
														</div>
														<span className='text-sm text-gray-600'>
															{selectedBoard.createdBy.firstName} {selectedBoard.createdBy.lastName}
														</span>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						)}
					</>
				)
			}

			{/* Sprint Content */}
			{React.createElement(sprintMode.view)}
		</main >
	)
} 