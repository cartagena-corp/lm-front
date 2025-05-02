import { useAuthStore } from "@/lib/store/AuthStore"
import { TaskProps } from "@/lib/types/types"
import { useState } from "react"
import Image from "next/image"

interface ReasignIssueFormProps {
   onSubmit: ({ newUserId, issueId }: { newUserId: string, issueId: string }) => void
   onCancel: () => void
   taskObject: TaskProps
}

export default function ReasignIssue({ onSubmit, onCancel, taskObject }: ReasignIssueFormProps) {
   const { listUsers } = useAuthStore()

   const [userSelected, setUserSelected] = useState(listUsers.find(user => typeof taskObject.assignedId !== 'string' && user.id === taskObject.assignedId.id))
   const [isUserOpen, setIsUserOpen] = useState(false)
   return (
      <main className="text-sm space-y-2">
         <section className="relative flex flex-col mt-6 mb-9">
            <label className="text-gray-700 text-sm font-medium">
               Reasignar a
            </label>

            <button onClick={() => {
               setIsUserOpen(!isUserOpen)
            }} type='button'
               className='border-gray-300 flex justify-between items-center select-none rounded-md border w-full p-2 gap-2'>
               <div className='flex justify-start items-center gap-2'>
                  <div className='bg-black/10 overflow-hidden aspect-square rounded-full w-6 flex justify-center items-center'>
                     {
                        userSelected?.picture ?
                           <Image src={userSelected?.picture}
                              alt='assignedto'
                              width={24}
                              height={24}
                           />
                           :
                           <span className='font-medium text-sm'>{userSelected?.firstName?.charAt(0).toUpperCase()}</span>
                     }
                  </div>
                  <span className='flex flex-col justify-center items-start'>
                     {userSelected?.firstName} {userSelected?.lastName}
                  </span>
               </div>

               <svg className={`text-gray-500 size-4 duration-150 ${isUserOpen ? "-rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
               </svg>

               {
                  isUserOpen &&
                  <div className='border-gray-300 bg-white shadow-md absolute z-10 top-[105%] left-0 flex flex-col items-start rounded-md border text-sm w-full max-h-20 overflow-y-auto'>{
                     listUsers.map((obj, i) =>
                        <span key={i} onClick={() => { setUserSelected(obj), setUserSelected(obj), setIsUserOpen(false) }}
                           className='hover:bg-black/5 duration-150 w-full text-start py-2 px-2 flex items-center gap-2'>
                           {
                              obj.id === userSelected?.id ?
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                 </svg>
                                 :
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" className='hidden' />
                                 </svg>

                           }
                           <div className='flex justify-start items-center gap-2'>
                              <div className='bg-black/10 overflow-hidden aspect-square rounded-full w-6 flex justify-center items-center'>
                                 {
                                    obj.picture ?
                                       <Image src={obj.picture}
                                          alt={obj.id}
                                          width={24}
                                          height={24}
                                       />
                                       :
                                       <span className='font-medium text-sm'>{obj.firstName?.charAt(0).toUpperCase()}</span>
                                 }
                              </div>
                              <span className='flex flex-col justify-center items-start'>
                                 {obj.firstName} {obj.lastName}
                              </span>
                           </div>
                        </span>
                     )
                  }</div>
               }
            </button>
         </section>

         <section className="pb-3 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button onClick={() => onSubmit({ newUserId: userSelected?.id as string, issueId: taskObject.id as string })}
               type="button"
               className="text-white inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold textWhite shadow-sm hover:bg-blue-800 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
            >
               Reasignar Tarea
            </button>
            <button
               type="button"
               className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
               onClick={onCancel}
            >
               Cancelar
            </button>
         </section>
      </main>
   )
}