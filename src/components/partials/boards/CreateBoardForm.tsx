'use client'

import { Button, DataSelect, DateInput, TextInput } from '@/components/ui/FormUI'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { ChevronRightIcon } from '@/assets/Icon'
import { ProjectProps } from '@/lib/types/types'
import { useEffect, useState } from 'react'

interface CreateBoardFormProps {
   onSubmit: (newBoard: ProjectProps, jiraImport: File | null) => void
   editData?: ProjectProps | null
   onCancel: () => void
   isEdit?: boolean
}

export default function CreateBoardForm({ onSubmit, onCancel, editData = null, isEdit = false }: CreateBoardFormProps) {
   const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
   const { projectStatus } = useConfigStore()

   const [formData, setFormData] = useState<ProjectProps>({
      status: editData?.status || { id: 0, name: "", color: "" },
      description: editData?.description || "",
      createdAt: editData?.createdAt || "",
      updatedAt: editData?.updatedAt || "",
      startDate: editData?.startDate || "",
      endDate: editData?.endDate || "",
      name: editData?.name || "",
      id: editData?.id || "",
   })

   useEffect(() => {
      if (projectStatus && !isEdit) {
         setFormData({ ...formData, status: projectStatus[0] })
      } else if (projectStatus && isEdit && editData) {
         const currentStatus = projectStatus.find(status =>
            (typeof editData.status === 'object' && (editData.status !== null && status.id === editData.status.id)) ||
            (typeof editData.status === 'number' && status.id === editData.status) || { id: 0, name: "", color: "" }
         )
         if (currentStatus) setFormData(prev => ({ ...prev, status: currentStatus }))
      }
   }, [projectStatus, isEdit, editData])

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(formData, null)
   }

   return (
      <form onSubmit={handleSubmit} className='space-y-4'>
         <main className='flex flex-col gap-4'>
            <TextInput placeholder={isEdit ? (editData?.name || 'Nombre del tablero') : 'Ej: Proyecto Marketing Digital 2025'}
               value={formData.name} onChange={(str) => setFormData({ ...formData, name: str })}
               label="Nombre del Tablero" variant='blue' isRequired={true} />

            <TextInput placeholder={'Describe el propósito del tablero...'}
               value={formData.description} onChange={(str) => setFormData({ ...formData, description: str })}
               label="Descripción del Tablero" variant='blue' maxLength={300} isRequired={false} />

            <DataSelect value={typeof formData.status === 'object' ? formData.status : { id: 0, name: '', color: '' }}
               onChange={(option) => setFormData({ ...formData, status: option })} options={projectStatus}
               label='Estado' placeholder='Seleccionar estado' isRequired={true} />

            <button className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-medium transition-colors duration-200"
               onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} type="button">
               <span className={showAdvancedOptions ? "rotate-90" : ""}><ChevronRightIcon size={16} /></span>
               {showAdvancedOptions ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas'}
            </button>

            {showAdvancedOptions &&
               <section className='flex items-center justify-between gap-4 w-full'>
                  <DateInput onChange={(date) => setFormData({ ...formData, startDate: date })}
                     label="Inicio Estimado" variant='blue' isRequired={false}
                     value={formData.startDate} max={formData.endDate} fullWidth />

                  <DateInput onChange={(date) => setFormData({ ...formData, endDate: date })}
                     label="Finalización Estimada" variant='blue' isRequired={false}
                     value={formData.endDate} min={formData.startDate} fullWidth />
               </section>
            }
         </main>
         <footer className="flex justify-end items-center gap-2">
            <Button onClick={() => onCancel()} size='sm' variant='gray'>Cancelar</Button>
            <Button type="submit" size='sm' variant='blue'>{isEdit ? 'Actualizar Tablero' : 'Crear Tablero'}</Button>
         </footer>
      </form>
   )
}
