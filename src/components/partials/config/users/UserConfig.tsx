"use client"
import { useState, useEffect } from 'react'
import UsersManagement from './UsersManagement'
import RolesManagement from './RolesManagement'
import PermissionsManagement from './PermissionsManagement'
import { UsersIcon, ConfigIcon, EyeIcon } from '@/assets/Icon'
import { useAuthStore } from '@/lib/store/AuthStore'
import { UserProps, RoleProps, PermissionProps } from '@/lib/types/types'

// Función de utilidad para normalizar el rol del usuario
function normalizeUserRole(user: UserProps | null): { name: string; permissions: Array<{ name: string }> } | null {
    if (!user || !user.role) return null
    return typeof user.role === 'string' ? { name: user.role, permissions: [] } : user.role
}

export default function UserConfig() {
    const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users')
    const { user } = useAuthStore()
    const userRole = normalizeUserRole(user)

    const tabs = [
        {
            id: 'users' as const,
            name: 'Gestión de Usuarios',
            icon: UsersIcon,
            description: 'Administra los usuarios del sistema'
        },
        {
            id: 'roles' as const,
            name: 'Roles y Permisos',
            icon: ConfigIcon,
            description: 'Configura roles y sus permisos'
        },
        {
            id: 'permissions' as const,
            name: 'Gestión de Permisos',
            icon: EyeIcon,
            description: 'Administra los permisos del sistema'
        }
    ]

    const hasPermissionReadPermission = userRole?.permissions.some((p: PermissionProps) => p.name === "PERMISSION_READ") ?? false
    const hasRoleReadPermission = userRole?.permissions.some((p: PermissionProps) => p.name === "ROLE_READ") ?? false

    const filteredTabs = tabs.filter(tab => {
        if (tab.id === 'permissions') return hasPermissionReadPermission
        if (tab.id === 'roles') return hasRoleReadPermission
        return true
    })

    // If the active tab is no longer accessible, switch to 'users'
    useEffect(() => {
        if ((activeTab === 'permissions' && !hasPermissionReadPermission) ||
            (activeTab === 'roles' && !hasRoleReadPermission)) {
            setActiveTab('users')
        }
    }, [activeTab, hasPermissionReadPermission, hasRoleReadPermission])

    return (
        <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
                <nav className="flex space-x-2">
                    {filteredTabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="text-sm font-medium">{tab.name}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Content Area */}
            {(activeTab === 'users') ? (
                <UsersManagement />
            ) : (activeTab === 'permissions' && hasPermissionReadPermission) ? (
                <PermissionsManagement />
            ) : (activeTab === 'roles' && hasRoleReadPermission) && (
                <RolesManagement />
            )}
        </div>
    )
}
