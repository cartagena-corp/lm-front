import { persist } from "zustand/middleware"
import { create } from "zustand"

export type Accent = "blue" | "mono"

interface ThemeState {
    accent: Accent
    setAccent: (accent: Accent) => void
}

/** Mirror of the design prototype's applyTheme(): sets the runtime
 *  --accent / --accent-fg variables. The app is light-mode only. */
export const applyThemeToDOM = (accent: Accent) => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    root.style.setProperty("--accent", accent === "blue" ? "var(--blue-700)" : "var(--ds-text)")
    root.style.setProperty("--accent-fg", accent === "blue" ? "#fff" : "var(--ds-contrast-inverse)")
}

export const useThemeStore = create<ThemeState>()(persist(
    (set, get) => ({
        accent: "blue",
        setAccent: (accent) => { applyThemeToDOM(accent); set({ accent }) },
    }),
    {
        name: "theme-storage",
        onRehydrateStorage: () => (state) => {
            if (state) applyThemeToDOM(state.accent)
        },
    }
))
