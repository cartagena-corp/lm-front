"use client"

import type { ListComponentType, PaginatedResponse, PBoardProps } from "@/lib/types/pagination"
import PaginationFactory from "@/lib/core/factories/PaginationFactory"
import BoardFilters from "@/components/pages/boards/BoardFilters"
import { getAllBoards } from "@/lib/core/services/board.service"
import { useBoardStore } from "@/lib/shared/stores/BoardStore"
import { BoardFiltersProps } from "@/lib/types/board"
import { useSearchParams } from "next/navigation"
import { BoardIcon } from "@public/icon/Icon"
import { useEffect, useState } from "react"
import { logger } from "@/lib/types/Logger"
import { motion } from "motion/react"

export default function BoardPage() {
    const searchParams = useSearchParams()
    const [listType, setListType] = useState<ListComponentType>('boards')

    const { boards, isLoading, error, setBoards, setLoading, setError, clearError } = useBoardStore()

    const buildFiltersFromUrl = (): BoardFiltersProps => {
        return {
            status: searchParams.get('status') ? parseInt(searchParams.get('status')!) : undefined,
            size: searchParams.get('size') ? parseInt(searchParams.get('size')!) : 10,
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 0,
            direction: (searchParams.get('direction') as 'asc' | 'desc') || 'desc',
            createdBy: searchParams.get('createdBy') || undefined,
            sortBy: searchParams.get('sortBy') || undefined,
            name: searchParams.get('name') || undefined,
        }
    }

    const loadData = async () => {
        try {
            setLoading(true)
            clearError()

            const filters = buildFiltersFromUrl()
            const response = await getAllBoards(filters)

            if (response) setBoards(response)
            else setError('No se pudieron cargar los tableros')
        } catch (error) {
            logger.error('Error loading boards:', error)
            setError('Error al cargar los tableros')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [searchParams, listType])
    return (
        <motion.main className="flex flex-col gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <section className="flex justify-between items-center gap-4">
                <span className="text-button-primary-text bg-button-primary-hover flex justify-center items-center rounded-md aspect-square p-2">
                    <BoardIcon size={24} />
                </span>

                <hgroup className="flex flex-col w-full gap-1">
                    <h3 className="max-sm:text-lg text-3xl font-semibold">Gestión de Tableros</h3>
                    <p className="text-primary-border text-sm">Administra y organiza todos los tableros de tu equipo.</p>
                </hgroup>
            </section>

            <BoardFilters />

            {/* Loading state */}
            {isLoading &&
                <div className="flex justify-center items-center py-8">
                    <p className="text-primary-border">Cargando tableros...</p>
                </div>
            }

            {/* Error state */}
            {(error) &&
                <section className="bg-red-50 border-red-200 border rounded-md p-4">
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={loadData}
                        className="mt-2 text-red-600 hover:text-red-800 underline"
                    >
                        Intentar nuevamente
                    </button>
                </section>
            }

            {/* Data state */}
            {(!isLoading && !error && boards) && <PaginationFactory type={listType} data={boards} />}

            {/* Empty state */}
            {(!isLoading && !error && boards) && boards.content.length === 0 &&
                <section className="flex flex-col items-center justify-center py-12">
                    <span className="text-gray-400 mb-4">
                        <BoardIcon size={48} />
                    </span>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron tableros</h3>
                    <p className="text-gray-500 text-center">
                        Intenta ajustar los filtros o crear un nuevo tablero.
                    </p>
                </section>
            }
        </motion.main>
    )
}
