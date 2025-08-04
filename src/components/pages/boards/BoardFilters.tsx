import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { SearchIcon, UpDownIcon, XIcon } from "@public/icon/Icon"
import Dropdown from "@/components/ui/Dropdown"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Badge from "@/components/ui/Badge"

const SORT_OPTIONS = [
    { value: 'createdAt', name: 'Fecha de Creación', hasColor: true, hexColor: '#615fff' },
    { value: 'endDate', name: 'Fecha de Fin', hasColor: true, hexColor: '#79716b' },
    { value: 'name', name: 'Nombre', hasColor: true, hexColor: '#fe9a00' },
]

export default function BoardFilters() {
    // const { boardStatus } = useGlobalStore()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()

    const [inputValue, setInputValue] = useState(searchParams.get('name') || '')
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

    const updateQuery = useCallback((key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value.trim() !== '') params.set(key, value)
        else params.delete(key)

        router.replace(`${pathname}?${params.toString()}`)
    }, [pathname, router, searchParams])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
        debounceTimeout.current = setTimeout(() => { updateQuery('name', newValue) }, 800)
    }

    const handleRemoveFilter = (key: string) => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
        if (key === 'name') setInputValue('')
        updateQuery(key, null)
    }

    useEffect(() => { setInputValue(searchParams.get('name') || '') }, [searchParams])

    const currentDirection = searchParams.get('direction') || 'desc'
    const currentStatus = searchParams.get('status')
    const currentSortBy = searchParams.get('sortBy')

    const appliedFilters = Array.from(searchParams.entries()).filter(([key]) => ['name', 'status', 'sortBy'].includes(key))

    // const getFilterDisplayValue = useCallback((key: string, value: string) => {
    //     switch (key) {
    //         case 'name':
    //             return (
    //                 <span className="flex items-center gap-1">
    //                     <b>Búsqueda:</b>
    //                     <p>{value}</p>
    //                 </span>
    //             )
    //         case 'status':
    //             const statusName = boardStatus.find(s => String(s.id) === value)?.name
    //             return (
    //                 <span className="flex items-center gap-1">
    //                     <b>Estado:</b>
    //                     <p>{statusName || value}</p>
    //                 </span>
    //             )
    //         case 'sortBy':
    //             const sortName = SORT_OPTIONS.find(s => s.value === value)?.name
    //             return (
    //                 <span className="flex items-center gap-1">
    //                     <b>Ordenar por:</b>
    //                     <p>{sortName || value}</p>
    //                 </span>
    //             )
    //         default: return <span>{value}</span>
    //     }
    // }, [boardStatus])

    return (
        <section className="flex flex-col gap-4">
            <article className="flex flex-wrap items-center gap-2">
                <div className="relative flex-grow"><Input placeholder="Buscar por nombre..." icon={SearchIcon} type="search" onChange={handleSearchChange} value={inputValue} /></div>
                {/* <Dropdown className="max-md:w-full" placeholder="Cualquier Estado" onSelect={(value) => updateQuery('status', value)} selectedValue={currentStatus} options={boardStatus} /> */}
                <Dropdown className="max-md:w-full" placeholder="Ordenar por" onSelect={(value) => updateQuery('sortBy', value)} selectedValue={currentSortBy} options={SORT_OPTIONS} />
                <Button variant="secondary" className="flex items-center gap-2 max-lg:w-full" onClick={() => updateQuery('direction', currentDirection === 'asc' ? 'desc' : 'asc')}>
                    <UpDownIcon size={16} />
                    <span className="capitalize">{currentDirection === 'asc' ? 'Ascendente' : 'Descendente'}</span>
                </Button>
            </article>

            {appliedFilters.length > 0 &&
                <article className="flex flex-wrap items-center gap-2">
                    {appliedFilters.map(([key, value]) =>
                        <Badge key={key} hexColor="#fb2c36">
                            <button onClick={() => handleRemoveFilter(key)} className="flex items-center gap-1 cursor-pointer"><XIcon size={12} strokeWidth={3} /></button>
                            {/* {getFilterDisplayValue(key, value)} */}
                        </Badge>
                    )}
                </article>
            }
        </section>
    )
}
