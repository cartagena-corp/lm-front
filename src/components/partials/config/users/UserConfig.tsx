"use client"
import { useState } from 'react'
import UsersManagement from './UsersManagement'
import RolesManagement from './RolesManagement'
import PermissionsManagement from './PermissionsManagement'
import { UsersIcon, ConfigIcon, EyeIcon } from '@/assets/Icon'

export default function UserConfig() {
    const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users')

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

    return (
        <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
                <nav className="flex space-x-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    activeTab === tab.id
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
            {activeTab === 'users' ? (
                <UsersManagement />
            ) : activeTab === 'permissions' ? (
                <PermissionsManagement />
            ) : (
                <RolesManagement />
            )}
        </div>
    )
}
