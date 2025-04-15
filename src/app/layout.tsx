import Sidebar from '@/components/layout/Sidebar'
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
      <body className={inter.className}>
        <Sidebar />
        {children}
      </body>
    </html>
  )
}
