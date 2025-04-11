'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  CalendarIcon,
  ChartBarIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: 'Tableros', href: '/tableros', icon: ClipboardDocumentListIcon, isAvailable: true },
    { name: 'Filtros', href: '#', icon: FunnelIcon, isAvailable: false },
    { name: 'Informes', href: '#', icon: ChartBarIcon, isAvailable: false },
    { name: 'Calendario', href: '#', icon: CalendarIcon, isAvailable: false },
  ];
  if (pathname == "/login") return
  return (
    <div className="flex flex-col justify-between bg-gray-900 w-64 fixed top-0 left-0 z-[9999999] h-screen">
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-8">La Muralla</h1>
        <nav className="space-y-1">
          {
            navigation.map(item => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={!item.isAvailable ? "Próximanente..." : undefined}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive
                    ? 'bg-gray-800 text-white'
                    : !item.isAvailable ? 'text-white opacity-25 cursor-default' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  <item.icon
                    className={`mr-4 h-6 w-6 flex-shrink-0 ${isActive
                      ? 'text-white'
                      : item.isAvailable && 'text-gray-400 group-hover:text-gray-300'}`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })
          }
        </nav>
      </div>

      <div className="px-4 py-6 border-t border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-white text-lg">
                {session?.user?.email?.[0].toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              {session?.user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-4 group flex w-full items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <ArrowLeftOnRectangleIcon
            className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-300"
            aria-hidden="true"
          />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
} 