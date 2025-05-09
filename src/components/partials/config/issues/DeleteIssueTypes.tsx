interface FilterFormProps {
   onSubmit: () => void
   onCancel: () => void
   typesName: string
}

export default function DeleteIssueTypes({ onSubmit, onCancel, typesName }: FilterFormProps) {
   return (
      <main className="text-sm space-y-2">
         <section className="flex flex-col py-5">
            <p>
               Estás a punto de eliminar el tipo <b className="text-red-500">{typesName}.</b> ¿Seguro que deseas realizar esta acción?
            </p>
         </section>

         <section className="pb-3 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button onClick={() => onSubmit()}
               type="button"
               className="text-white inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold textWhite shadow-sm hover:bg-red-800 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
            >
               Eliminar Tipo
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