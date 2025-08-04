import type { SidebarState } from "@/lib/types/sidebar"
import { persist } from "zustand/middleware"
import { create } from "zustand"

export const useSidebarStore = create<SidebarState>()(persist(set => ({
    setSidebarCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
    toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    setIsMobile: (mobile: boolean) => set({ isMobile: mobile }),
    isCollapsed: false,
    isMobile: false,
}),
    { name: "sidebar-storage" }
))
