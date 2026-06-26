'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { CalendarIcon, ClockIcon, EditIcon, BoardIcon, UsersIcon, ConfigIcon } from '@/assets/Icon'
import Image from 'next/image'
import { useConfigStore } from '@/lib/store/ConfigStore'
import SprintBoard from '@/components/partials/sprints/SprintBoard'
import { useIssueStore } from '@/lib/store/IssueStore'
import { useSprintStore } from '@/lib/store/SprintStore'
import UpdateProjectForm from '@/components/partials/boards/UpdateProjectForm'
import ProjectConfigModal from '@/components/partials/config/projects/ProjectConfigModal'
import { ProjectProps } from '@/lib/types/types'
import { CustomSwitch } from '@/components/ui/CustomSwitch'
import DiagramaGantt from '@/components/ui/DiagramaGantt'
import SprintList from '@/components/partials/sprints/SprintList'
import { useModalStore } from '@/lib/hooks/ModalStore'

const view = [
	{
		id: 1,
		name: "Tablero",
		view: SprintBoard
	},
	{
		id: 2,
		name: "Lista",
		view: SprintList
	},
	{
		id: 3,
		name: "Diagrama de Gantt",
		view: DiagramaGantt
	},
]

export default function TableroDetalle() {
	const { selectedBoard, getBoard, updateBoard, isLoading, error } = useBoardStore()
	const { getValidAccessToken, isAuthenticated, getListUsers } = useAuthStore()
	const { setProjectConfig, projectStatus, setConfig } = useConfigStore()
	const [sprintMode, setSprintMode] = useState(view[0])
	const { getSprints } = useSprintStore()
	const { getIssues } = useIssueStore()
	const { id } = useParams()

	useEffect(() => {
		if (isAuthenticated) {
			(async () => {
				const token = await getValidAccessToken()
				if (token) {
					await getBoard(token, id as string)
					// Get backlog issues (issues without sprint assigned)
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
			// Convertir ProjectProps a formato esperado por updateBoard
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
			size: "lg",
			title: "Editar Tablero",
			desc: "Edita los detalles del tablero",
			Icon: <EditIcon size={20} stroke={1.75} />,
			children: <UpdateProjectForm onSubmit={handleUpdate} onCancel={() => closeModal()} projectObject={selectedBoard as ProjectProps} />,
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

	const cardStyle: React.CSSProperties = { background: "var(--ds-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-border)" }
	const metaChip = (bg: string, fg: string): React.CSSProperties => ({ padding: 8, borderRadius: "var(--radius-md)", background: bg, color: fg, display: "flex" })

	return (
		<div className="mx-auto space-y-6" style={{ maxWidth: 1320 }}>
			{/* Header */}
			<div className="p-5" style={cardStyle}>
				<div className="flex items-center justify-between gap-4 flex-wrap">
					<div className="flex items-center gap-[14px]">
						<div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 10, background: "var(--blue-200)", color: "var(--blue-900)" }}>
							<BoardIcon size={24} />
						</div>
						<div>
							<h1 className="font-semibold" style={{ fontSize: 24, letterSpacing: "-0.96px", color: "var(--ds-text)" }}>Detalles del Tablero</h1>
							<p style={{ fontSize: 13, color: "var(--ds-text-secondary)", marginTop: 2 }}>Gestiona tu proyecto y sus sprints</p>
						</div>
					</div>
					<CustomSwitch value={sprintMode} onChange={(value) => setSprintMode(value)} />
				</div>
			</div>

			{/* Project Details - Solo mostrar si NO está en vista Tablero */}
			{sprintMode.name !== "Tablero" && (
				<>
					{isLoading && !selectedBoard ? (
						<div className='p-6 animate-pulse' style={cardStyle}>
							<div className='flex justify-between items-start gap-4 mb-6'>
								<div className='flex items-center gap-4 flex-1'>
									<div className='h-8 rounded w-64' style={{ background: "var(--gray-alpha-200)" }}></div>
									<div className='h-6 rounded w-24' style={{ background: "var(--gray-alpha-200)" }}></div>
								</div>
								<div className='h-10 rounded w-32' style={{ background: "var(--gray-alpha-200)" }}></div>
							</div>
							<div className='h-4 rounded w-full mb-6' style={{ background: "var(--gray-alpha-200)" }}></div>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
								{Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className='space-y-2'>
										<div className='h-4 rounded w-20' style={{ background: "var(--gray-alpha-200)" }}></div>
										<div className='h-6 rounded w-32' style={{ background: "var(--gray-alpha-200)" }}></div>
									</div>
								))}
							</div>
						</div>
					) : (
						<div className="overflow-hidden" style={cardStyle}>
							{/* Project Header */}
							<div className="p-6" style={{ borderBottom: "1px solid var(--ds-border)" }}>
								<div className='flex justify-between items-start gap-4'>
									<div className='flex flex-col'>
										<h2 className='font-semibold mb-2' style={{ fontSize: 22, letterSpacing: "-0.5px", color: "var(--ds-text)" }}>{selectedBoard?.name}</h2>
										{selectedBoard && (
											<div className="inline-flex items-center gap-[5px] whitespace-nowrap flex-shrink-0 w-fit"
												style={{
													height: 22, padding: "0 8px", borderRadius: 9999,
													background: `${getStatusColor(Number(selectedBoard.status))}1f`,
													color: getStatusColor(Number(selectedBoard.status)),
													fontSize: 11, fontWeight: 500
												}}
											>
												<span style={{ width: 6, height: 6, borderRadius: 9999, background: getStatusColor(Number(selectedBoard.status)) }} />
												{getStatusName(Number(selectedBoard.status)).charAt(0).toUpperCase() + getStatusName(Number(selectedBoard.status)).slice(1).toLowerCase()}
											</div>
										)}
									</div>

									<div className="flex gap-2">
										<button
											onClick={() => handleConfigBoardModal()}
											disabled={isLoading}
											className="flex items-center gap-2 transition-colors text-sm font-medium hover:bg-[var(--gray-alpha-100)] disabled:opacity-50 disabled:cursor-not-allowed"
											style={{ height: 34, padding: "0 11px", color: "var(--ds-text)", background: "var(--ds-background)", border: "1px solid var(--ds-border-strong)", borderRadius: "var(--radius-md)" }}
										>
											<ConfigIcon size={15} />
											<span className="hidden sm:inline">Configuración</span>
											<span className="sm:hidden">Config</span>
										</button>

										<button
											onClick={() => handleUpdateBoardModal()}
											disabled={isLoading}
											className="flex items-center gap-2 transition-colors text-sm font-medium hover:bg-[var(--gray-alpha-100)] disabled:opacity-50 disabled:cursor-not-allowed"
											style={{ height: 34, padding: "0 11px", color: "var(--ds-text)", background: "var(--ds-background)", border: "1px solid var(--ds-border-strong)", borderRadius: "var(--radius-md)" }}
										>
											<EditIcon size={15} />
											<span className="hidden sm:inline">{isLoading ? 'Cargando...' : 'Editar Proyecto'}</span>
											<span className="sm:hidden">Editar</span>
										</button>
									</div>
								</div>

								{selectedBoard?.description && (
									<p className='mt-4 leading-relaxed' style={{ fontSize: 14, color: "var(--ds-text-secondary)" }}>{selectedBoard.description}</p>
								)}
							</div>

							{/* Project Metadata */}
							<div className="p-6">
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
									{/* Start Date */}
									<div className='flex items-center gap-3'>
										<div style={metaChip("var(--blue-200)", "var(--blue-900)")}>
											<CalendarIcon size={20} />
										</div>
										<div>
											<h6 className='text-sm font-semibold' style={{ color: "var(--ds-text)" }}>Fecha de inicio</h6>
											<p className='text-sm' style={{ color: "var(--ds-text-secondary)" }}>
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
										<div style={metaChip("var(--green-200)", "var(--green-900)")}>
											<CalendarIcon size={20} />
										</div>
										<div>
											<h6 className='text-sm font-semibold' style={{ color: "var(--ds-text)" }}>Fecha de fin</h6>
											<p className='text-sm' style={{ color: "var(--ds-text-secondary)" }}>
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
										<div style={metaChip("var(--purple-200)", "var(--purple-900)")}>
											<ClockIcon size={20} />
										</div>
										<div>
											<h6 className='text-sm font-semibold' style={{ color: "var(--ds-text)" }}>Creado</h6>
											<p className='text-sm' style={{ color: "var(--ds-text-secondary)" }}>
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
										<div style={metaChip("var(--amber-200)", "var(--amber-900)")}>
											<ClockIcon size={20} />
										</div>
										<div>
											<h6 className='text-sm font-semibold' style={{ color: "var(--ds-text)" }}>Actualizado</h6>
											<p className='text-sm' style={{ color: "var(--ds-text-secondary)" }}>
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
									<div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--ds-border)" }}>
										<div className='flex items-center gap-4'>
											<div style={metaChip("var(--purple-200)", "var(--purple-900)")}>
												<UsersIcon size={20} />
											</div>
											<div>
												<h6 className='text-sm font-semibold' style={{ color: "var(--ds-text)" }}>Creado por</h6>
												<div className='flex items-center gap-2'>
													<div className='w-8 h-8 rounded-full overflow-hidden' style={{ background: "var(--gray-alpha-100)" }}>
														<Image
															src={selectedBoard.createdBy.picture}
															alt={`${selectedBoard.createdBy.firstName} ${selectedBoard.createdBy.lastName}`}
															width={32}
															height={32}
															className="w-full h-full object-cover"
														/>
													</div>
													<span className='text-sm' style={{ color: "var(--ds-text-secondary)" }}>
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
			)}

			{/* Sprint Content */}
			<sprintMode.view />
		</div>
	)
}