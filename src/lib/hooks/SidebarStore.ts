import { persist } from "zustand/middleware"
import { create } from "zustand"

interface SidebarState {
    setSidebarCollapsed: (collapsed: boolean) => void
    setIsMobile: (mobile: boolean) => void
    toggleSidebar: () => void
    isCollapsed: boolean
    isMobile: boolean
}

export const useSidebarStore = create<SidebarState>()(persist(set => ({
    setSidebarCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
    toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    setIsMobile: (mobile: boolean) => set({ isMobile: mobile }),
    isCollapsed: false,
    isMobile: false,
}),
    { name: "sidebar-storage" }
))
