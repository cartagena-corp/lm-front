import { persist } from "zustand/middleware"
import { create } from "zustand"

export type Theme = "light" | "dark"
export type Accent = "blue" | "mono"

interface ThemeState {
    theme: Theme
    accent: Accent
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
    setAccent: (accent: Accent) => void
}

/** Mirror of the design prototype's applyTheme(): toggles data-theme on <html>
 *  and sets the runtime --accent / --accent-fg variables. */
export const applyThemeToDOM = (theme: Theme, accent: Accent) => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    if (theme === "dark") root.setAttribute("data-theme", "dark")
    else root.removeAttribute("data-theme")
    root.style.setProperty("--accent", accent === "blue" ? "var(--blue-700)" : "var(--ds-text)")
    root.style.setProperty("--accent-fg", accent === "blue" ? "#fff" : "var(--ds-contrast-inverse)")
}

export const useThemeStore = create<ThemeState>()(persist(
    (set, get) => ({
        theme: "light",
        accent: "blue",
        setTheme: (theme) => { applyThemeToDOM(theme, get().accent); set({ theme }) },
        toggleTheme: () => {
            const theme = get().theme === "dark" ? "light" : "dark"
            applyThemeToDOM(theme, get().accent)
            set({ theme })
        },
        setAccent: (accent) => { applyThemeToDOM(get().theme, accent); set({ accent }) },
    }),
    {
        name: "theme-storage",
        onRehydrateStorage: () => (state) => {
            if (state) applyThemeToDOM(state.theme, state.accent)
        },
    }
))
