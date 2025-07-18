import { useState, useEffect, useRef } from "react"
import { useAuthStore } from "@/lib/store/AuthStore"

interface CreateUserFormProps {
   onSubmit: (data: { email: string, role: string }) => void
   onCancel: () => void
}

export default function CreateUserForm({ onSubmit, onCancel }: CreateUserFormProps) {
   const { roles } = useAuthStore()
   
   const [formData, setFormData] = useState({
      email: '',
      role: roles.length > 0 ? roles[0].name : ''
   })
   const [errors, setErrors] = useState<{ [key: string]: string }>({})
   const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false)
   
   const roleSelectRef = useRef<HTMLDivElement>(null)

   // Actualizar rol por defecto cuando se cargan los roles
   useEffect(() => {
      if (roles.length > 0 && !formData.role) {
         setFormData(prev => ({ ...prev, role: roles[0].name }))
      }
   }, [roles, formData.role])

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            roleSelectRef.current &&
            !roleSelectRef.current.contains(event.target as Node)
         ) {
            setIsRoleSelectOpen(false)
         }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
         document.removeEventListener('mousedown', handleClickOutside)
      }
   }, [])

   const validateForm = () => {
      const newErrors: { [key: string]: string } = {}

      if (!formData.email.trim()) {
         newErrors.email = 'El email es requerido'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
         newErrors.email = 'El email no es válido'
      }

      if (!formData.role) {
         newErrors.role = 'El rol es requerido'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
   }

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (validateForm()) {
         onSubmit(formData)
      }
   }

   const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }))
      if (errors[field]) {
         setErrors(prev => ({ ...prev, [field]: '' }))
      }
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
               Agregar Usuario
            </h3>
            <p className="text-sm text-gray-500">
               Invita a un nuevo usuario al sistema
            </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
               </label>
               <div className="relative">
                  <input
                     type="email"
                     id="email"
                     value={formData.email}
                     onChange={(e) => handleChange('email', e.target.value)}
                     className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.email
                           ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                           : 'border-gray-300 hover:border-gray-400'
                        }`}
                     placeholder="usuario@ejemplo.com"
                  />
                  {errors.email && (
                     <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
               </div>
            </div>

            {/* Role Select - Custom Button Select */}
            <div className="space-y-2 relative" ref={roleSelectRef}>
               <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Rol del usuario
               </label>
               <button 
                  onClick={() => setIsRoleSelectOpen(!isRoleSelectOpen)} 
                  type="button"
                  disabled={roles.length === 0}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 flex items-center justify-between ${
                     errors.role 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 hover:border-gray-400'
                  } ${roles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                  <span className="text-sm text-gray-700">
                     {roles.length === 0 
                        ? 'Cargando roles...'
                        : (roles.find(role => role.name === formData.role)?.name || 'Seleccionar rol')
                     }
                  </span>
                  <svg 
                     className={`text-gray-400 w-4 h-4 transition-transform duration-200 ${isRoleSelectOpen ? "rotate-180" : ""}`}
                     xmlns="http://www.w3.org/2000/svg" 
                     fill="none" 
                     viewBox="0 0 24 24" 
                     strokeWidth={2} 
                     stroke="currentColor"
                  >
                     <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
               </button>
               
               {isRoleSelectOpen && (
                  <div className="border-gray-200 bg-white shadow-lg absolute z-10 top-full mt-1 flex flex-col rounded-lg border text-sm w-full max-h-20 overflow-y-auto">
                     {roles.map((role) => (
                        <div 
                           key={role.name} 
                           onClick={() => { 
                              handleChange('role', role.name)
                              setIsRoleSelectOpen(false) 
                           }}
                           className="hover:bg-blue-50 duration-150 w-full text-start py-3 px-4 flex items-center justify-between cursor-pointer"
                        >
                           <span className="text-gray-700">{role.name}</span>
                           {role.name === formData.role && (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-600">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                           )}
                        </div>
                     ))}
                  </div>
               )}
               
               {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role}</p>
               )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
               <button
                  type="button"
                  onClick={onCancel}
                  className="bg-white hover:bg-gray-50 hover:border-gray-300 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
               >
                  Cancelar
               </button>
               <button
                  type="submit"
                  disabled={roles.length === 0}
                  className={`text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                     roles.length === 0 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                  }`}
               >
                  {roles.length === 0 ? 'Cargando...' : 'Agregar Usuario'}
               </button>
            </div>
         </form>
      </div>
   )
}
