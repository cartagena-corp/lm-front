'use client'

import { Button, Checkbox, DataSelect, TextInput } from '@/components/ui/FormUI'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { FilterProjectProps } from '@/lib/types/types'
import { useAuthStore } from '@/lib/store/AuthStore'
import { FormEvent, useState, useRef } from 'react'

interface FilterFormProps {
   onSubmit: (data: FilterProjectProps) => void
   initialFilters?: FilterProjectProps | null
   onCancel: () => void
}

export default function FilterProjectForm({ onSubmit, onCancel, initialFilters }: FilterFormProps) {
   const { projectStatus } = useConfigStore()
   const { user } = useAuthStore()

   const [formData, setFormData] = useState<FilterProjectProps>(() => {
      if (initialFilters) return initialFilters

      return {
         sortBy: { id: 0, name: 'Cualquier orden', color: '#d1d5dc' },
         direction: "desc",
         createdBy: "",
         status: 0,
         size: 10,
         name: "",
         page: 0,
      }
   })

   const sortByOptions = [
      { id: 1, name: "Fecha de creación (Más reciente primero)", color: "#d1d5dc" },
      { id: 2, name: "Fecha de creación (Más antiguo primero)", color: "#d1d5dc" },
      { id: 3, name: "Última actualización (Más reciente primero)", color: "#d1d5dc" },
      { id: 4, name: "Última actualización (Más antiguo primero)", color: "#d1d5dc" },
   ]

   const getSortConfig = (id: number): { field: 'createdAt' | 'updatedAt', direction: 'asc' | 'desc' } => {
      if (id === 1) return { field: 'createdAt', direction: 'desc' }
      if (id === 2) return { field: 'createdAt', direction: 'asc' }
      if (id === 3) return { field: 'updatedAt', direction: 'desc' }
      if (id === 4) return { field: 'updatedAt', direction: 'asc' }
      return { field: 'createdAt', direction: 'desc' }
   }

   const handleSubmit = (e: FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
   }

   return (
      <form onSubmit={handleSubmit} className='space-y-4'>
         <main className='flex flex-col gap-4'>
            <TextInput placeholder="Buscar por nombre del tablero..."
               value={formData.name} onChange={(str) => setFormData({ ...formData, name: str })}
               label="Búsqueda" variant='purple' isRequired={false} type='search' />

            <DataSelect value={projectStatus?.find(status => status.id === formData.status) || { id: 0, name: 'Cualquier estado', color: '#d1d5dc' }}
               onChange={(option) => setFormData({ ...formData, status: option.id })} options={projectStatus} variant='purple'
               label='Estado' placeholder='Seleccionar estado' isRequired={false} />

            <DataSelect label='Ordenar por' value={formData.sortBy} variant='purple' options={sortByOptions} isRequired={false} onChange={(option) => {
               const config = getSortConfig(option.id)
               setFormData({ ...formData, sortBy: option, direction: config.direction })
            }} />

            <Checkbox
               label='Solo mis tableros'
               description='Mostrar únicamente los tableros que he creado'
               checked={formData.createdBy !== ""}
               onChange={(checked) => setFormData({ ...formData, createdBy: checked && user ? user.id : "" })}
               variant="purple"
            />
         </main>

         <footer className="flex justify-end items-center gap-2">
            <Button onClick={() => onCancel()} size='sm' variant='gray'>Cancelar</Button>
            <Button type="submit" size='sm' variant='purple'>Aplicar Filtros</Button>
         </footer>
      </form>
   )
}
