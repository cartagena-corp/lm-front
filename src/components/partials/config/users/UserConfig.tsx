"use client"
import { useState, useEffect } from 'react'
import UsersManagement from './UsersManagement'
import RolesPermissionsManagement from './RolesPermissionsManagement'
import { useAuthStore } from '@/lib/store/AuthStore'
import { UserProps, PermissionProps } from '@/lib/types/types'
import { CustomSwitch, valueProps } from '@/components/ui/CustomSwitch'

// Función de utilidad para normalizar el rol del usuario
function normalizeUserRole(user: UserProps | null): { name: string; permissions: Array<{ name: string }> } | null {
    if (!user || !user.role) return null
    return typeof user.role === 'string' ? { name: user.role, permissions: [] } : user.role
}

const USER_TABS: valueProps[] = [
    { id: 1, name: 'Gestión de Usuarios', shortName: 'Usuarios', view: () => <></> },
    { id: 2, name: 'Roles y Permisos', shortName: 'Roles', view: () => <></> },
]

export default function UserConfig() {
    const [activeTab, setActiveTab] = useState<valueProps>(USER_TABS[0])
    const { user } = useAuthStore()
    const userRole = normalizeUserRole(user)

    const hasPermissionReadPermission = userRole?.permissions.some((p: PermissionProps) => p.name === "PERMISSION_READ") ?? false
    const hasRoleReadPermission = userRole?.permissions.some((p: PermissionProps) => p.name === "ROLE_READ") ?? false
    const hasRolesTabAccess = hasRoleReadPermission || hasPermissionReadPermission

    const filteredTabs = USER_TABS.filter(tab => tab.id === 1 || hasRolesTabAccess)

    // Si el tab activo deja de estar disponible, cae a "Gestión de Usuarios"
    useEffect(() => {
        if (activeTab.id === 2 && !hasRolesTabAccess) {
            setActiveTab(USER_TABS[0])
        }
    }, [activeTab, hasRolesTabAccess])

    return (
        <div className="space-y-6">
            {filteredTabs.length > 1 && (
                <CustomSwitch tabs={filteredTabs} value={activeTab} onChange={setActiveTab} />
            )}

            {/* Content Area */}
            {(activeTab.id === 2 && hasRolesTabAccess) ? (
                <RolesPermissionsManagement />
            ) : (
                <UsersManagement />
            )}
        </div>
    )
}
