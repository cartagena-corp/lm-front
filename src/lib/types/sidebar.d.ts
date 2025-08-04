export interface SidebarTooltipProps {
    show?: boolean
    text: string
    position: {
        top: number
        left: number
    }
}

export interface SidebarState {
    setSidebarCollapsed: (collapsed: boolean) => void
    setIsMobile: (mobile: boolean) => void
    toggleSidebar: () => void
    isCollapsed: boolean
    isMobile: boolean
}