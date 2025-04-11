import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'La Muralla - Gestión de Proyectos',
  description: 'Sistema de gestión de proyectos La Muralla',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.umd.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css" />
      </head>
      <body className={inter.className}>
        <Providers>
          <Sidebar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
