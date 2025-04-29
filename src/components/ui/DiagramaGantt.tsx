import { useEffect, useRef } from 'react'
import Gantt from 'frappe-gantt'

const tasks = [
   {
      id: '1',
      name: 'Analisis',
      start: '2025-04-12',
      end: '2025-05-12',
      progress: 100
   },
   {
      id: '2',
      name: 'Diseño',
      start: '2025-05-12',
      end: '2025-06-12',
      progress: 75
   },
   {
      id: '3',
      name: 'Desarrollo',
      start: '2025-06-12',
      end: '2025-07-12',
      progress: 50
   },
   {
      id: '4',
      name: 'Pruebas',
      start: '2025-07-12',
      end: '2025-08-12',
      progress: 25
   },
   {
      id: '5',
      name: 'Analisis 2',
      start: '2025-08-12',
      end: '2025-09-12',
      progress: 0
   },
   {
      id: '6',
      name: 'Diseño 2',
      start: '2025-09-12',
      end: '2025-10-12',
      progress: 0
   },
   {
      id: '7',
      name: 'Desarrollo 2',
      start: '2025-10-12',
      end: '2025-11-12',
      progress: 0
   },
   {
      id: '8',
      name: 'Pruebas 2',
      start: '2025-11-12',
      end: '2025-12-12',
      progress: 0,

   }
]

const options = {
   view_mode: 'Week',  // Opciones: 'Day', 'Week', 'Month', etc.
   date_format: 'YYYY-MM-DD',
   readonly: true,
   column_width: 100,
   language: 'es',
   infinite_padding: false
}

export default function DiagramaGantt() {
   const ganttRef = useRef<HTMLDivElement>(null)
   const ganttInstance = useRef(null)

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


   return (
      <main className="bg-white p-8 rounded-md w-full h-full">
         <h2 className="text-xl font-bold mb-4">Diagrama de Gantt</h2>
         <div className="w-full overflow-x-auto overflow-y-hidden">
            <div ref={ganttRef} className="w-full" />
         </div>
      </main>
   )
}