import { AddUserIcon, SearchIcon, UsersIcon } from "@public/icon/Icon"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { useRef, useState } from "react"

export default function UserSystem() {
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearch = e.target.value
        setSearchTerm(newSearch)

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
        debounceTimeout.current = setTimeout(() => { setDebouncedSearch(newSearch) }, 800)
    }

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
                {/* {items.map((user, id) => <UserCard key={user.id} user={user} />)} */}
            </section>
        </main>
    )
}