'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useBoardStore } from '@/lib/store/BoardStore'
import { Calendar, Clock, Pencil, LayoutDashboard, Settings, ChevronUp, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useConfigStore } from '@/lib/store/ConfigStore'
import SprintBoard from '@/components/partials/sprints/SprintBoard'
import { useSprintStore } from '@/lib/store/SprintStore'
import UpdateProjectForm from '@/components/partials/boards/UpdateProjectForm'
import ProjectConfigModal from '@/components/partials/config/projects/ProjectConfigModal'
import { ProjectProps } from '@/lib/types/types'
import { CustomSwitch } from '@/components/ui/CustomSwitch'
import type { valueProps } from '@/components/ui/CustomSwitch'
import DiagramaGantt from '@/components/ui/DiagramaGantt'
import SprintList from '@/components/partials/sprints/SprintList'
import { useModalStore } from '@/lib/hooks/ModalStore'

const view: valueProps[] = [
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
		shortName: "Gantt",
		view: DiagramaGantt
	},
]

export default function TableroDetalle() {
	const { selectedBoard, getBoard, updateBoard, setSelectedBoard, isLoading } = useBoardStore()
	const { getValidAccessToken, isAuthenticated, getListUsers } = useAuthStore()
	const { setProjectConfig, projectStatus, setConfig } = useConfigStore()
	const [sprintMode, setSprintMode] = useState(view[0])
	const [isHeaderVisible, setIsHeaderVisible] = useState(true)
	const { getSprints, clearSprints } = useSprintStore()
	const { id } = useParams()

	useEffect(() => {
		if (isAuthenticated) {
			// Limpiar la data del tablero anterior de inmediato: si no, mientras se
			// resuelven los fetches de abajo se sigue mostrando (y parpadeando entre)
			// el tablero/sprints previos hasta que llega la data del nuevo `id`.
			setSelectedBoard(null)
			clearSprints();
			(async () => {
				const token = await getValidAccessToken()
				if (token) {
					// Ninguna de estas depende del resultado de otra (todas solo
					// necesitan token + id) — se piden en paralelo en vez de una
					// tras otra. `getSprints` ya prioriza internamente el sprint
					// activo (ver SprintStore.ts), así que esto es lo que deja
					// que el Kanban se pinte apenas esa respuesta llega, sin
					// esperar a `getListUsers` ni a `setProjectConfig`.
					await Promise.all([
						getBoard(token, id as string),
						setProjectConfig(id as string, token),
						getSprints(token, id as string),
						getListUsers(token),
					])
				}
			})()
		}
	}, [isAuthenticated, getBoard, setProjectConfig, getValidAccessToken, getSprints, getListUsers, id, setSelectedBoard, clearSprints])

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
			Icon: <Pencil size={20} strokeWidth={1.75} />,
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
			Icon: <Settings size={20} strokeWidth={1.75} />,
			children: <ProjectConfigModal projectId={id as string} onClose={() => closeModal()} />,
			closeOnBackdrop: false,
			closeOnEscape: false,

		})
	}

	const formatDate = (raw: string | undefined, fallback: string) => {
		if (!raw) return fallback
		let date: Date
		if (raw.includes('T')) {
			date = new Date(raw)
		} else {
			const [year, month, day] = raw.split('-').map(num => parseInt(num, 10))
			date = new Date(year, month - 1, day)
		}
		return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			{isHeaderVisible && (
			<div className="flex items-center justify-between gap-4 flex-wrap">
				<div className="flex items-center gap-[14px] min-w-0">
					<div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44, borderRadius: 10, background: "var(--blue-200)", color: "var(--blue-900)" }}>
						<LayoutDashboard size={24} strokeWidth={1.5} />
					</div>
					<div className="min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<h1 className="font-semibold truncate" style={{ fontSize: 24, letterSpacing: "-0.96px", color: "var(--ds-text)" }}>
								{selectedBoard?.name || (isLoading ? 'Cargando…' : 'Tablero')}
							</h1>
							{selectedBoard && (
								<div className="inline-flex items-center gap-[5px] whitespace-nowrap flex-shrink-0 w-fit"
									style={{
										height: 20, padding: "0 8px", borderRadius: 9999,
										background: `${getStatusColor(Number(selectedBoard.status))}1f`,
										color: getStatusColor(Number(selectedBoard.status)),
										fontSize: 11, fontWeight: 500
									}}
								>
									<span style={{ width: 5, height: 5, borderRadius: 9999, background: getStatusColor(Number(selectedBoard.status)) }} />
									{getStatusName(Number(selectedBoard.status)).charAt(0).toUpperCase() + getStatusName(Number(selectedBoard.status)).slice(1).toLowerCase()}
								</div>
							)}
						</div>
						<p style={{ fontSize: 13, color: "var(--ds-text-secondary)", marginTop: 2 }}>
							{selectedBoard?.description || 'Gestiona tu proyecto y sus sprints'}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 flex-shrink-0">
					<button
						onClick={() => handleConfigBoardModal()}
						disabled={isLoading}
						className="flex items-center gap-2 transition-colors text-sm font-medium hover:bg-[var(--gray-alpha-100)] disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ height: 34, padding: "0 11px", color: "var(--ds-text)", background: "var(--ds-background)", border: "1px solid var(--ds-border-strong)", borderRadius: "var(--radius-md)" }}
					>
						<Settings size={15} strokeWidth={1.5} />
						<span className="hidden sm:inline">Configuración</span>
						<span className="sm:hidden">Config</span>
					</button>

					<button
						onClick={() => handleUpdateBoardModal()}
						disabled={isLoading}
						className="flex items-center gap-2 transition-colors text-sm font-medium hover:bg-[var(--gray-alpha-100)] disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ height: 34, padding: "0 11px", color: "var(--ds-text)", background: "var(--ds-background)", border: "1px solid var(--ds-border-strong)", borderRadius: "var(--radius-md)" }}
					>
						<Pencil size={15} strokeWidth={1.5} />
						<span className="hidden sm:inline">{isLoading ? 'Cargando...' : 'Editar Proyecto'}</span>
						<span className="sm:hidden">Editar</span>
					</button>
				</div>
			</div>
			)}

			{/* Tabs */}
			<div className="flex items-center justify-between gap-4">
				<CustomSwitch tabs={view} value={sprintMode} onChange={(value) => setSprintMode(value)} />
				<button
					onClick={() => setIsHeaderVisible(prev => !prev)}
					className="flex items-center gap-2 transition-colors text-sm font-medium hover:bg-[var(--gray-alpha-100)] flex-shrink-0"
					style={{ height: 34, padding: "0 11px", marginBottom: 16, color: "var(--ds-text)", background: "var(--ds-background)", border: "none", borderRadius: "var(--radius-md)" }}
					title={isHeaderVisible ? "Ocultar información del tablero" : "Mostrar información del tablero"}
				>
					{isHeaderVisible ? <ChevronUp size={15} strokeWidth={1.5} /> : <ChevronDown size={15} strokeWidth={1.5} />}
					<span className="hidden sm:inline">{isHeaderVisible ? "Ocultar información" : "Mostrar información"}</span>
				</button>
			</div>

			{/* Project Metadata - Solo mostrar si NO está en vista Tablero */}
			{sprintMode.name !== "Tablero" && (
				<>
					{isLoading && !selectedBoard ? (
						<div className='flex flex-wrap gap-x-8 gap-y-2 pb-6 animate-pulse' style={{ borderBottom: "1px solid var(--ds-border)" }}>
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className='h-4 rounded w-32' style={{ background: "var(--gray-alpha-200)" }}></div>
							))}
						</div>
					) : (
						<div className="flex flex-wrap items-center gap-x-8 gap-y-2 pb-6 text-xs" style={{ borderBottom: "1px solid var(--ds-border)", color: "var(--ds-text-muted)" }}>
							{/* Período */}
							<div className="flex items-center gap-2">
								<Calendar size={14} strokeWidth={1.5} />
								<span className="font-medium">Período:</span>
								<span>{formatDate(selectedBoard?.startDate, 'No definida')}</span>
								<span>–</span>
								<span>{formatDate(selectedBoard?.endDate, 'No definida')}</span>
							</div>

							{/* Created */}
							<div className="flex items-center gap-2">
								<Clock size={14} strokeWidth={1.5} />
								<span>Creado {formatDate(selectedBoard?.createdAt, 'No disponible')}</span>
							</div>

							{/* Updated */}
							<div className="flex items-center gap-2">
								<Clock size={14} strokeWidth={1.5} />
								<span>Actualizado {formatDate(selectedBoard?.updatedAt, 'No disponible')}</span>
							</div>

							{/* Created By */}
							{selectedBoard?.createdBy && (
								<div className="flex items-center gap-2 ml-auto">
									<Image
										src={selectedBoard.createdBy.picture}
										alt={`${selectedBoard.createdBy.firstName} ${selectedBoard.createdBy.lastName}`}
										width={16}
										height={16}
										className="rounded-full object-cover flex-shrink-0"
									/>
									<span>Creado por {selectedBoard.createdBy.firstName} {selectedBoard.createdBy.lastName}</span>
								</div>
							)}
						</div>
					)}
				</>
			)}

			{/* Sprint Content */}
			<sprintMode.view />
		</div>
	)
}
