import { AddUserIcon, SearchIcon, UsersIcon } from "@public/icon/Icon"
import PaginationFactory from "@factories/PaginationFactory"
import { ListUsersFiltersProps } from "@/lib/types/config"
import { ListComponentType } from "@/lib/types/pagination"
import { getListUsers } from "@services/config.service"
import { useConfigStore } from "@stores/ConfigStore"
import { useEffect, useRef, useState } from "react"
import { logger } from "@/lib/types/Logger"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

export default function UserSystem() {
    const { listUsers, isLoading, error, setListUsers, setLoading, setError, clearError } = useConfigStore()

    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    const listType: ListComponentType = 'users'

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearch = e.target.value
        setSearchTerm(newSearch)

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
        debounceTimeout.current = setTimeout(() => { setDebouncedSearch(newSearch) }, 800)
    }

    const buildFiltersFromUrl = (): ListUsersFiltersProps => {
        return {
            search: debouncedSearch || undefined,
            size: 10,
            page: 0,
        }
    }

    const loadData = async () => {
        try {
            setLoading(true)
            clearError()

            const filters = buildFiltersFromUrl()
            const response = await getListUsers(filters)

            if (response) setListUsers(response)
            else setError('No se pudieron cargar el listado de usuarios')
        } catch (error) {
            logger.error('Error loading boards:', error)
            setError('Error al cargar el listado de usuarios')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [debouncedSearch, listType])

    return (
        <main className="bg-button-secondary-background rounded-md shadow-md flex flex-col">
            <header className="flex justify-between items-center gap-2 p-6">
                <aside className="flex items-center gap-4">
                    <span className="bg-purple-100 text-purple-600 flex justify-center items-center rounded-md aspect-square p-2">
                        <UsersIcon />
                    </span>
                    <span className="flex flex-col gap-1">
                        <h5 className="font-semibold text-xl">Usuarios del Sistema</h5>
                        <p className="text-primary-border text-sm">Aquí puedes gestionar los usuarios del sistema.</p>
                    </span>
                </aside>

                <Button variant="primary" className="flex items-center gap-2">
                    <AddUserIcon size={16} strokeWidth={1.75} />
                    Añadir Usuario
                </Button>
            </header>

            <hr className="border-button-secondary-border/25" />

            <section className="flex flex-col gap-2 p-6">
                <Input placeholder="Buscar por nombre o correo..." onChange={handleSearchChange} icon={SearchIcon} value={searchTerm} type="search" />

                {/* Data state */}
                {(!isLoading && !error && listUsers) && <PaginationFactory type={listType} data={listUsers} />}
            </section>
        </main>
    )
}