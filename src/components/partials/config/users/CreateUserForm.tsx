import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { computeDropdownPosition } from "@/lib/utils/dropdown.utils"

const DROPDOWN_MAX_HEIGHT = 240 // px, debe coincidir con max-h-60 del panel

interface CreateUserFormProps {
   onSubmit: (data: { email: string, role: string, organizationId: string }) => void
   onCancel: () => void
   organizationId: string
}

export default function CreateUserForm({ onSubmit, onCancel, organizationId }: CreateUserFormProps) {
   const { organizationRoles, getOrganizationRoles, getSpecificOrganization } = useOrganizationStore()
   const { getValidAccessToken } = useAuthStore()
   const [organization, setOrganization] = useState<{ organizationId: string; organizationName: string; createdAt: string } | null>(null)
   const [formData, setFormData] = useState({
      email: '',
      organizationId: organizationId,
      role: organizationRoles.length > 0 ? organizationRoles[0].name : ''
   })
   const [errors, setErrors] = useState<{ [key: string]: string }>({})
   const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false)

   const roleSelectRef = useRef<HTMLDivElement>(null)
   const rolePanelRef = useRef<HTMLDivElement>(null)
   const [rolePosition, setRolePosition] = useState<{ top?: number, bottom?: number, left: number, width: number, openUpward: boolean }>({ left: 0, width: 0, openUpward: false })
   const [mounted, setMounted] = useState(false)

   // Necesario para el portal del dropdown: document solo existe en el cliente
   useEffect(() => {
      setMounted(true)
   }, [])

   // Fetch organization and roles
   useEffect(() => {
      const fetchData = async () => {
         const token = await getValidAccessToken()
         if (!token) return

         // Get organization details
         const orgData = await getSpecificOrganization(token, organizationId)
         if (orgData) {
            setOrganization(orgData)
            // Get roles for this organization
            await getOrganizationRoles(token, organizationId)
         }
      }
      fetchData()
   }, [organizationId, getValidAccessToken, getSpecificOrganization, getOrganizationRoles])

   // Update default role when organizationRoles change
   useEffect(() => {
      if (organizationRoles.length > 0 && !formData.role) {
         setFormData(prev => ({ ...prev, role: organizationRoles[0].name }))
      }
   }, [organizationRoles, formData.role])

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         const target = event.target as Node
         if (
            roleSelectRef.current &&
            !roleSelectRef.current.contains(target) &&
            !(rolePanelRef.current && rolePanelRef.current.contains(target))
         ) {
            setIsRoleSelectOpen(false)
         }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
         document.removeEventListener('mousedown', handleClickOutside)
      }
   }, [])

   // El dropdown se porta a document.body para no quedar recortado por el overflow-y-auto
   // del contenido de la modal (Modal.tsx). Si no cabe debajo antes del borde inferior del
   // viewport, se abre hacia arriba (ver dropdown.utils.ts)
   useEffect(() => {
      if (isRoleSelectOpen && roleSelectRef.current) {
         const rect = roleSelectRef.current.getBoundingClientRect()
         setRolePosition(computeDropdownPosition(rect, { maxHeight: DROPDOWN_MAX_HEIGHT, gap: 4 }))
      }
   }, [isRoleSelectOpen])

   useEffect(() => {
      if (!isRoleSelectOpen) return
      const handleScroll = (event: Event) => {
         const target = event.target as Node
         if (rolePanelRef.current?.contains(target)) return
         setIsRoleSelectOpen(false)
      }
      window.addEventListener('scroll', handleScroll, true)
      return () => window.removeEventListener('scroll', handleScroll, true)
   }, [isRoleSelectOpen])

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
      <div className="p-6">
         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Organization Field - Display only */}
            <div className="flex flex-col gap-1">
               <label htmlFor="organization" className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>
                  Organización
               </label>
               <input
                  type="text"
                  id="organization"
                  value={organization?.organizationName || 'Cargando...'}
                  readOnly
                  className="h-9 px-3 rounded-md text-sm outline-none"
                  style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}
               />
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-1">
               <label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>
                  Correo electrónico
               </label>
               <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="h-9 px-3 rounded-md text-sm outline-none transition-shadow duration-150 placeholder:text-[var(--ds-text-muted)]"
                  style={{
                     background: "var(--ds-card)",
                     color: "var(--ds-text)",
                     boxShadow: errors.email ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)"
                  }}
                  placeholder="usuario@ejemplo.com"
               />
               {errors.email && (
                  <p className="text-xs" style={{ color: "var(--ds-error)" }}>{errors.email}</p>
               )}
            </div>

            {/* Role Select - Custom Select */}
            <div className="flex flex-col gap-1 relative" ref={roleSelectRef}>
               <label htmlFor="role" className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>
                  Rol del usuario
               </label>
               <button
                  id="role"
                  onClick={() => setIsRoleSelectOpen(!isRoleSelectOpen)}
                  type="button"
                  disabled={organizationRoles.length === 0}
                  className="h-9 px-3 rounded-md text-sm flex items-center justify-between transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                     background: "var(--ds-card)",
                     boxShadow: errors.role ? "0 0 0 1px var(--red-700)" : "var(--shadow-border)"
                  }}
               >
                  <span className="truncate" style={{ color: formData.role ? "var(--ds-text)" : "var(--ds-text-muted)" }}>
                     {organizationRoles.length === 0
                        ? 'Cargando roles...'
                        : (organizationRoles.find(role => role.name === formData.role)?.name || 'Seleccionar rol')
                     }
                  </span>
                  <svg
                     className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isRoleSelectOpen ? "rotate-180" : ""}`}
                     style={{ color: "var(--ds-text-muted)" }}
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     strokeWidth={2}
                     stroke="currentColor"
                  >
                     <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
               </button>

               {isRoleSelectOpen && mounted && createPortal(
                  <div
                     ref={rolePanelRef}
                     className="fixed z-[9999] flex flex-col rounded-md text-sm max-h-60 overflow-y-auto"
                     style={{
                        ...(rolePosition.openUpward ? { bottom: rolePosition.bottom } : { top: rolePosition.top }),
                        left: rolePosition.left,
                        width: rolePosition.width,
                        background: "var(--ds-card)", border: "1px solid var(--ds-border)", boxShadow: "var(--shadow-lg)"
                     }}
                  >
                     {organizationRoles.map((role) => (
                        <div
                           key={role.name}
                           onClick={() => {
                              handleChange('role', role.name)
                              setIsRoleSelectOpen(false)
                           }}
                           className="hover:bg-[var(--gray-alpha-100)] transition-colors duration-150 w-full text-start py-2.5 px-3 flex items-center gap-3 cursor-pointer"
                        >
                           <span className="flex-1 truncate" style={{ color: "var(--ds-text)" }}>{role.name}</span>
                           {role.name === formData.role && (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--blue-700)" }}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                           )}
                        </div>
                     ))}
                  </div>,
                  document.body
               )}

               {errors.role && (
                  <p className="text-xs" style={{ color: "var(--ds-error)" }}>{errors.role}</p>
               )}
            </div>

            <div className="flex justify-end gap-3 mt-2">
               <button
                  type="button"
                  onClick={() => onCancel()}
                  className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-[var(--gray-alpha-100)] focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
                  style={{ background: "var(--ds-card)", color: "var(--ds-text)", boxShadow: "var(--shadow-border)" }}
               >
                  Cancelar
               </button>
               <button
                  type="submit"
                  disabled={organizationRoles.length === 0}
                  className="h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-[var(--primary-700)] hover:bg-[var(--primary-800)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[var(--primary-900)] focus-visible:outline-offset-2"
                  style={{ color: "var(--primary-contrast-fg)" }}
               >
                  {organizationRoles.length === 0 ? "Cargando..." : "Agregar usuario"}
               </button>
            </div>
         </form>
      </div>
   )
}
