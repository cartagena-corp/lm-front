import Notifications from '@/components/layout/Notifications'
import Sidebar from '@/components/layout/Sidebar'
import { Toaster } from 'react-hot-toast'
import { Inter } from 'next/font/google'
import '../assets/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'La Muralla - Gestión de Proyectos',
  description: 'Sistema de gestión de proyectos La Muralla',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.umd.js" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css" />
      </head>
      <body className={`${inter.className} max-w-screen overflow-x-hidden relative`}>
        <Sidebar />
        {children}
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            className: 'z-50 text-sm'
          }}
        />
        <Notifications />
      </body>
    </html>
  )
}
