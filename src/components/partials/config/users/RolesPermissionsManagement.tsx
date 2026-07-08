"use client"
import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useModalStore } from '@/lib/hooks/ModalStore'
import { ShieldCheck, Plus, Pencil, Trash2, X } from 'lucide-react'
import RoleForm from './RoleForm'
import DeleteRoleForm from './DeleteRoleForm'
import CreatePermissionForm from './CreatePermissionForm'
import DeletePermissionForm from './DeletePermissionForm'
import toast from 'react-hot-toast'

interface RoleProps {
    name: string
    permissions: Array<{ name: string }>
}

interface PermissionProps {
    name: string
}

// Cuántos chips de permiso se muestran por card de rol antes de colapsar en "+N más"
const ROLE_CARD_PERMISSION_LIMIT = 8

// Agrupa los permisos por su prefijo (ej. "PROJECT_CREATE" -> categoría "PROJECT")
function groupPermissionsByCategory(perms: PermissionProps[]) {
    const groups: Record<string, PermissionProps[]> = {}
    perms.forEach(p => {
        const category = p.name.split('_')[0]
        if (!groups[category]) groups[category] = []
        groups[category].push(p)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}

export default function RolesPermissionsManagement() {
    const {
        roles,
        permissions,
        isLoading,
        error,
        getValidAccessToken,
        listRoles,
        listPermissions,
        createRole,
        updateRole,
        deleteRole,
        createPermission,
        deletePermission,
        clearError
    } = useAuthStore()

    const { openModal, closeModal } = useModalStore()

    // Cargar datos iniciales
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const token = await getValidAccessToken()
        if (token) {
            await Promise.all([listRoles(token), listPermissions(token)])
        }
    }

    // Handlers para roles
    const handleCreateRole = async (data: { name: string, permissions: PermissionProps[] }) => {
        const token = await getValidAccessToken()
        if (token) {
            await createRole(token, data)
            closeModal()
            toast.success(`Rol ${data.name} creado`)
            loadData()
        }
    }

    const handleEditRole = async (role: RoleProps, data: { name: string, permissions: PermissionProps[] }) => {
        const token = await getValidAccessToken()
        if (token) {
            await updateRole(token, role.name, { permissions: data.permissions })
            closeModal()
            toast.success(`Rol ${data.name} actualizado`)
            loadData()
        }
    }

    const handleDeleteRole = async (role: RoleProps) => {
        const token = await getValidAccessToken()
        if (token) {
            await deleteRole(token, role.name)
            closeModal()
            toast.success(`Rol "${role.name}" eliminado`)
            loadData()
        }
    }

    const handleCreateRoleModal = () => {
        openModal({
            size: "lg",
            title: "Crear Rol",
            desc: "Define un nuevo rol con sus permisos",
            children: <RoleForm onSubmit={handleCreateRole} onCancel={() => closeModal()} />,
            Icon: <Plus size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "CREATE"
        })
    }

    const handleEditRoleModal = (role: RoleProps) => {
        openModal({
            size: "lg",
            title: "Editar Rol",
            desc: "Modifica los permisos del rol",
            children: <RoleForm role={role} onSubmit={(data) => handleEditRole(role, data)} onCancel={() => closeModal()} isEdit={true} />,
            Icon: <Pencil size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "UPDATE"
        })
    }

    const handleDeleteRoleModal = (role: RoleProps) => {
        openModal({
            size: "md",
            children: <DeleteRoleForm role={role} onSubmit={() => handleDeleteRole(role)} onCancel={() => closeModal()} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "DELETE"
        })
    }

    // Handlers para permisos
    const handleCreatePermission = async (data: { name: string }) => {
        const token = await getValidAccessToken()
        if (token) {
            await createPermission(token, data)
            closeModal()
            toast.success(`Permiso ${data.name} creado`)
            loadData()
        }
    }

    const handleDeletePermission = async (permission: PermissionProps) => {
        const token = await getValidAccessToken()
        if (token) {
            await deletePermission(token, permission.name)
            closeModal()
            toast.success(`Permiso "${permission.name}" eliminado`)
            loadData()
        }
    }

    const handleCreatePermissionModal = () => {
        openModal({
            size: "lg",
            title: "Crear Permiso",
            desc: "Define un nuevo permiso para el sistema",
            children: <CreatePermissionForm onSubmit={handleCreatePermission} onCancel={() => closeModal()} />,
            Icon: <Plus size={20} strokeWidth={1.75} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "CREATE"
        })
    }

    const handleDeletePermissionModal = (permission: PermissionProps) => {
        openModal({
            size: "md",
            children: <DeletePermissionForm permission={permission} onSubmit={() => handleDeletePermission(permission)} onCancel={() => closeModal()} />,
            closeOnBackdrop: false,
            closeOnEscape: false,
            mode: "DELETE"
        })
    }

    if (error) {
        return (
            <div className="p-6" style={{ background: 'var(--ds-card)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-border)' }}>
                <div className="text-center py-8">
                    <div className="w-fit mx-auto mb-4 p-4 rounded-full" style={{ background: 'var(--red-100)', color: 'var(--red-900)' }}>
                        <ShieldCheck size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text)' }}>Error al cargar datos</h3>
                    <p className="mb-4" style={{ color: 'var(--ds-text-secondary)' }}>{error}</p>
                    <button
                        onClick={() => {
                            clearError()
                            loadData()
                        }}
                        className="transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                        style={{ height: 36, padding: '0 16px', color: 'var(--primary-contrast-fg)', border: '1px solid var(--primary-700)', borderRadius: 'var(--radius-md)' }}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    const { user, normalizeUserRole } = useAuthStore()
    const userRole = normalizeUserRole(user)
    const hasPermissionCreateRole = userRole?.permissions.some((p: PermissionProps) => p.name === "ROLE_CREATE") ?? false
    const hasPermissionEditRole = userRole?.permissions.some((p: PermissionProps) => p.name === "ROLE_UPDATE") ?? false
    const hasPermissionDeleteRole = userRole?.permissions.some((p: PermissionProps) => p.name === "ROLE_DELETE") ?? false
    const hasPermissionCreatePermission = userRole?.permissions.some((p: PermissionProps) => p.name === "PERMISSION_CREATE") ?? false
    const hasPermissionDeletePermission = userRole?.permissions.some((p: PermissionProps) => p.name === "PERMISSION_DELETE") ?? false

    return (
        <div className="space-y-8">
            {/* Roles */}
            <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-4">
                    <div>
                        <h2 className="font-semibold" style={{ fontSize: 20, letterSpacing: "-0.02em", color: 'var(--ds-text)', margin: "0 0 4px" }}>Roles y Permisos</h2>
                        <p style={{ fontSize: 14, color: 'var(--ds-text-secondary)', margin: 0 }}>
                            {roles.length} roles · gestiona los roles y los permisos que tiene asignados cada uno
                        </p>
                    </div>
                    {
                        hasPermissionCreateRole &&
                        <button
                            onClick={handleCreateRoleModal}
                            className="flex items-center justify-center gap-[7px] transition-colors hover:bg-[var(--primary-800)] bg-[var(--primary-700)] text-sm font-medium flex-shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                            style={{ height: 36, padding: '0 14px', color: 'var(--primary-contrast-fg)', border: '1px solid var(--primary-700)', borderRadius: 'var(--radius-md)' }}
                        >
                            <Plus size={15} strokeWidth={2.5} />
                            Crear Rol
                        </button>
                    }
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse"><div className="h-[104px]" style={{ background: 'var(--gray-alpha-200)', borderRadius: 'var(--radius-xl)' }} /></div>)}
                    </div>
                ) : roles.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-fit mx-auto mb-4 p-3 rounded-full" style={{ background: 'var(--gray-alpha-100)', color: 'var(--ds-text-muted)' }}>
                            <ShieldCheck size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--ds-text)' }}>No hay roles</h3>
                        <p style={{ color: 'var(--ds-text-muted)' }}>No se encontraron roles en el sistema.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {roles.map((role) => (
                            <div key={role.name} className="group flex flex-col gap-3 p-[18px]" style={{ background: 'var(--ds-card)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-border)' }}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--purple-200)', color: 'var(--purple-900)' }}>
                                            <ShieldCheck size={18} strokeWidth={1.5} />
                                        </div>
                                        <h4 className="font-medium truncate" style={{ color: 'var(--ds-text)' }}>
                                            {role.name}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                                        {
                                            hasPermissionEditRole &&
                                            <button
                                                onClick={() => handleEditRoleModal(role)}
                                                className="p-1.5 rounded-md transition-colors duration-150 hover:bg-[var(--gray-alpha-100)]"
                                                style={{ color: 'var(--ds-text-muted)' }}
                                            >
                                                <Pencil size={14} strokeWidth={1.5} />
                                            </button>
                                        }
                                        {
                                            hasPermissionDeleteRole &&
                                            <button
                                                onClick={() => handleDeleteRoleModal(role)}
                                                className="p-1.5 rounded-md transition-colors duration-150 hover:bg-[var(--red-100)] hover:text-[var(--red-900)]"
                                                style={{ color: 'var(--ds-text-muted)' }}
                                            >
                                                <Trash2 size={14} strokeWidth={1.5} />
                                            </button>
                                        }
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {role.permissions.length === 0 ? (
                                        <span className="text-sm italic" style={{ color: 'var(--ds-text-muted)' }}>
                                            Sin permisos asignados
                                        </span>
                                    ) : (
                                        <>
                                            {role.permissions.slice(0, ROLE_CARD_PERMISSION_LIMIT).map((p, index) => (
                                                <span key={index} className="px-2 py-0.5 text-xs rounded-full" style={{ background: 'var(--purple-100)', color: 'var(--purple-900)' }}>
                                                    {p.name}
                                                </span>
                                            ))}
                                            {role.permissions.length > ROLE_CARD_PERMISSION_LIMIT && (
                                                <span className="px-2 py-0.5 text-xs rounded-full font-medium" style={{ background: 'var(--gray-alpha-100)', color: 'var(--ds-text-secondary)' }}>
                                                    +{role.permissions.length - ROLE_CARD_PERMISSION_LIMIT} más
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Permisos del sistema */}
            <div style={{ borderTop: '1px solid var(--ds-border)', paddingTop: 24 }}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-4">
                    <div>
                        <h3 className="font-semibold" style={{ fontSize: 16, color: 'var(--ds-text)', margin: "0 0 4px" }}>Permisos del Sistema</h3>
                        <p style={{ fontSize: 13, color: 'var(--ds-text-secondary)', margin: 0 }}>
                            {permissions.length} permisos disponibles para asignar a los roles
                        </p>
                    </div>
                    {
                        hasPermissionCreatePermission &&
                        <button
                            onClick={handleCreatePermissionModal}
                            className="flex items-center justify-center gap-[7px] transition-colors hover:bg-[var(--gray-alpha-100)] text-sm font-medium flex-shrink-0"
                            style={{ height: 32, padding: '0 12px', color: 'var(--ds-text)', background: 'var(--ds-card)', boxShadow: 'var(--shadow-border)', borderRadius: 'var(--radius-md)' }}
                        >
                            <Plus size={14} strokeWidth={2.5} />
                            Nuevo Permiso
                        </button>
                    }
                </div>

                {permissions.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--ds-text-muted)' }}>No hay permisos configurados.</p>
                ) : (
                    <div className="space-y-4">
                        {groupPermissionsByCategory(permissions).map(([category, perms]) => (
                            <div key={category}>
                                <p className="mono-label mb-2">{category}</p>
                                <div className="flex flex-wrap gap-2">
                                    {perms.map((permission) => (
                                        <span
                                            key={permission.name}
                                            className="group/chip inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 text-sm rounded-full"
                                            style={{ background: 'var(--gray-alpha-100)', color: 'var(--ds-text)' }}
                                        >
                                            {permission.name}
                                            {
                                                hasPermissionDeletePermission &&
                                                <button
                                                    onClick={() => handleDeletePermissionModal(permission)}
                                                    className="rounded-full p-0.5 opacity-0 group-hover/chip:opacity-100 transition-opacity duration-150 hover:bg-[var(--red-100)] hover:text-[var(--red-900)]"
                                                    style={{ color: 'var(--ds-text-muted)' }}
                                                    title="Eliminar permiso"
                                                >
                                                    <X size={12} strokeWidth={2} />
                                                </button>
                                            }
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
