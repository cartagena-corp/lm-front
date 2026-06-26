import { Analytics } from "@vercel/analytics/next"
import Notifications from '@/components/layout/Notifications'
import ConditionalLayout from '@/components/new_layout/ConditionalLayout'
import { Toaster } from 'react-hot-toast'
import { Inter } from 'next/font/google'
import '../assets/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'La Muralla - Gestión de Proyectos',
  description: 'Sistema de gestión de proyectos La Muralla',
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/favicon-dark.ico',
        href: '/favicon-dark.ico',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/favicon-light.ico',
        href: '/favicon-light.ico',
      },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.umd.js" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            className: 'z-50 text-sm'
          }}
        />
        <Notifications />
        <Analytics />
      </body>
    </html>
  )
}
