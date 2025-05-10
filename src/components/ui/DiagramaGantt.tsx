import { useEffect, useRef, useState } from 'react'
import Gantt from 'frappe-gantt'

const tasks = [
   { id: '1', name: 'Analisis', start: '2025-04-12', end: '2025-05-12', progress: 100 },
   { id: '2', name: 'Diseño', start: '2025-05-12', end: '2025-06-12', progress: 75 },
   { id: '3', name: 'Desarrollo', start: '2025-06-12', end: '2025-07-12', progress: 50 },
   { id: '4', name: 'Pruebas', start: '2025-07-12', end: '2025-08-12', progress: 25 },
   { id: '5', name: 'Analisis 2', start: '2025-08-12', end: '2025-09-12', progress: 0 },
   { id: '6', name: 'Diseño 2', start: '2025-09-12', end: '2025-10-12', progress: 0 },
   { id: '7', name: 'Desarrollo 2', start: '2025-10-12', end: '2025-11-12', progress: 0 },
   { id: '8', name: 'Pruebas 2', start: '2025-11-12', end: '2025-12-12', progress: 0 },
]

const options = {
   view_mode: 'Week',
   date_format: 'YYYY-MM-DD',
   readonly: true,
   column_width: 100,
   language: 'es',
   infinite_padding: false
}

export default function DiagramaGantt() {
   const ganttRef = useRef<HTMLDivElement>(null)
   const ganttInstance = useRef(null)
   const [showOverlay, setShowOverlay] = useState(false)

   useEffect(() => {
      if (ganttInstance.current) return
      if (ganttRef.current) ganttInstance.current = new Gantt(ganttRef.current, tasks, options)
   }, [])

   useEffect(() => {
      const element = ganttRef.current?.parentElement
      if (element) {
         const preventHorizontalScroll = (e: any) => { if (e.deltaX !== 0) e.preventDefault() }
         element.addEventListener('wheel', preventHorizontalScroll, { passive: false })
         return () => element.removeEventListener('wheel', preventHorizontalScroll)
      }
   }, [])

   useEffect(() => {
      const timeout = setTimeout(() => setShowOverlay(true), 0)
      return () => clearTimeout(timeout)
   }, [])

   return (
      <main className="bg-white p-8 rounded-md w-full h-full relative">
         <h2 className="text-xl font-bold mb-4">Diagrama de Gantt</h2>
         <div className="w-full overflow-x-auto overflow-y-hidden">
            <div ref={ganttRef} className="w-full" />
         </div>

         <section
            className={`bg-black/25 z-[9999] backdrop-blur-sm rounded-md absolute h-full w-full flex justify-center items-center top-0 left-0 transition-opacity duration-1000 ${
               showOverlay ? 'opacity-100' : 'opacity-0'
            }`}
         >
            <h6 className="text-4xl font-bold shadow-black">Próximamente</h6>
         </section>
      </main>
   )
}
