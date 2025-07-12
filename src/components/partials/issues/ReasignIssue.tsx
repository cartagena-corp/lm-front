import { useConfigStore } from "@/lib/store/ConfigStore"
import { useBoardStore } from "@/lib/store/BoardStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { TaskProps } from "@/lib/types/types"
import { useState, useRef, useEffect, useMemo } from "react"
import Image from "next/image"
import { getUserAvatar } from "@/lib/utils/avatar.utils"
import { XIcon } from "@/assets/Icon"

interface ReasignIssueFormProps {
   onSubmit: ({ newUserId, issueId }: { newUserId: string, issueId: string }) => void
   onCancel: () => void
   taskObject: TaskProps
}

export default function ReasignIssue({ onSubmit, onCancel, taskObject }: ReasignIssueFormProps) {
   const { projectParticipants } = useConfigStore()
   const { selectedBoard } = useBoardStore()
   const { listUsers } = useAuthStore()

   // Combine project participants with the project creator (avoid duplicates)
   const allProjectUsers = useMemo(() => {
      const participants = [...projectParticipants]
      
      // Add project creator if not already in participants
      if (selectedBoard?.createdBy && !participants.some(p => p.id === selectedBoard.createdBy?.id)) {
         // Find the creator in the full user list to get complete information including email
         const creatorFromUserList = listUsers.find(user => user.id === selectedBoard.createdBy?.id)
         
         participants.push({
            id: selectedBoard.createdBy.id,
            firstName: selectedBoard.createdBy.firstName,
            lastName: selectedBoard.createdBy.lastName,
            email: creatorFromUserList?.email || '', // Get email from full user list
            picture: selectedBoard.createdBy.picture
         })
      }
      
      return participants
   }, [projectParticipants, selectedBoard?.createdBy, listUsers])

   const [userSelected, setUserSelected] = useState(allProjectUsers.find(user => typeof taskObject.assignedId !== 'string' && user.id === taskObject.assignedId?.id))
   const [isUserOpen, setIsUserOpen] = useState(false)
   const userRef = useRef(null)

   // Effect to handle clicks outside of select
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (userRef.current && !(userRef.current as HTMLElement).contains(event.target as Node)) {
            setIsUserOpen(false)
         }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
         document.removeEventListener('mousedown', handleClickOutside)
      }
   }, [])
   
   return (
      <div className="bg-white border-gray-100 rounded-xl shadow-sm border">
         {/* Header */}
         <div className="border-b border-gray-100 p-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="bg-blue-50 text-blue-600 rounded-lg p-2">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                     </svg>
                  </div>
                  <div>
                     <h3 className="text-lg font-semibold text-gray-900">Reasignar Tarea</h3>
                     <p className="text-sm text-gray-500">Selecciona el nuevo usuario responsable</p>
                  </div>
               </div>
               <button
                  type="button"
                  onClick={onCancel}
                  className="bg-white text-gray-400 hover:text-gray-700 rounded-md cursor-pointer p-2 hover:bg-gray-50 transition-all duration-200"
               >
                  <XIcon size={20} />
               </button>
            </div>
         </div>

         {/* Content */}
         <div className="p-6">
            <div className="space-y-4">
               {/* Current Task Info */}
               <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     </div>
                     <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{taskObject.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                           Asignado actualmente a: {' '}
                           <span className="font-medium">
                              {typeof taskObject.assignedId === 'object' && taskObject.assignedId 
                                 ? `${taskObject.assignedId.firstName} ${taskObject.assignedId.lastName}`
                                 : 'Sin asignar'
                              }
                           </span>
                        </p>
                     </div>
                  </div>
               </div>

               {/* User Selection */}
               <div className="space-y-2">
                  <label className="text-gray-900 text-sm font-semibold">
                     Nuevo usuario responsable
                     <span className='text-red-500 ml-1'>*</span>
                  </label>
                  <div className="relative" ref={userRef}>
                     <button 
                        onClick={() => setIsUserOpen(!isUserOpen)}
                        type='button'
                        className='w-full text-left bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                     >
                        <div className='flex items-center justify-between'>
                           <div className='flex items-center gap-3'>
                              <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                                 {userSelected ? (
                                    <img 
                                       src={getUserAvatar(userSelected, 32)}
                                       alt='Usuario seleccionado'
                                       className="w-full h-full object-cover rounded-full"
                                    />
                                 ) : (
                                    <span className='text-sm font-medium text-gray-600'>
                                       ?
                                    </span>
                                 )}
                              </div>
                              <div>
                                 <span className='text-sm font-medium text-gray-900'>
                                    {userSelected?.firstName} {userSelected?.lastName}
                                 </span>
                                 <p className="text-xs text-gray-500">
                                    {userSelected?.email || 'Sin email'}
                                 </p>
                              </div>
                           </div>
                           <svg className={`text-gray-400 w-5 h-5 transition-transform duration-200 ${isUserOpen ? "rotate-180" : ""}`}
                              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                           </svg>
                        </div>
                     </button>
                     
                     {isUserOpen && (
                        <div className='absolute z-[9999] top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto'>
                           {allProjectUsers.map((obj, i) => (
                              <button
                                 key={i} 
                                 type="button"
                                 onClick={() => { 
                                    setUserSelected(obj)
                                    setIsUserOpen(false) 
                                 }}
                                 className='w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg'
                              >
                                 <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${obj.id === userSelected?.id ? 'bg-blue-600' : 'bg-transparent'}`} />
                                    <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                                       <img 
                                          src={getUserAvatar(obj, 32)}
                                          alt={obj.id}
                                          className="w-full h-full object-cover rounded-full"
                                       />
                                    </div>
                                    <div className="flex-1">
                                       <span className='text-sm font-medium text-gray-900 block'>
                                          {obj.firstName} {obj.lastName}
                                       </span>
                                       <span className="text-xs text-gray-500">
                                          {obj.email || 'Sin email'}
                                       </span>
                                    </div>
                                    {obj.id === userSelected?.id && (
                                       <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                       </svg>
                                    )}
                                 </div>
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
               <button
                  type="button"
                  onClick={onCancel}
                  className="bg-white hover:bg-gray-50 hover:border-gray-300 border-gray-200 border flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
               >
                  Cancelar
               </button>
               <button 
                  onClick={() => onSubmit({ newUserId: userSelected?.id as string, issueId: taskObject.id as string })}
                  type="button"
                  disabled={!userSelected}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-transparent border hover:shadow-md flex-1 duration-200 rounded-lg text-center text-sm py-2.5 px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  Reasignar Tarea
               </button>
            </div>
         </div>
      </div>
   )
}