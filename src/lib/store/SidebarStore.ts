'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleMobileSidebar: () => void
  closeMobileSidebar: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: true,
      isMobileOpen: false,
      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setSidebarCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
      toggleMobileSidebar: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      closeMobileSidebar: () => set({ isMobileOpen: false }),
    }),
    {
      name: 'sidebar-storage',
      // isMobileOpen is transient UI state, not a persisted preference — persisting
      // it would make the drawer reopen on reload if the tab was closed mid-open.
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
)
