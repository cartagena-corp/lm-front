"use client"

import { usePathname, useRouter } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useThemeStore } from "@/lib/store/ThemeStore"

interface Crumb { label: string; href: string }

/** Build a clickable breadcrumb trail from the current route. */
function crumbsFor(pathname: string): Crumb[] {
    const seg = pathname.split("/").filter(Boolean)
    const root = seg[0]
    const crumbs: Crumb[] = [{ label: "La Muralla", href: "/tableros" }]
    switch (root) {
        case "tableros":
            crumbs.push({ label: "Tableros", href: "/tableros" })
            if (seg[1]) crumbs.push({ label: "Tablero", href: `/tableros/${seg[1]}` })
            if (seg[2]) crumbs.push({ label: "Tarea", href: `/tableros/${seg[1]}/${seg[2]}` })
            break
        case "config":
            crumbs.push({ label: "Configuración", href: "/config" })
            break
        case "factory":
            crumbs.push({ label: "Organizaciones", href: "/factory" })
            if (seg[1]) crumbs.push({ label: "Organización", href: `/factory/${seg[1]}` })
            break
        case "gemini":
            crumbs.push({ label: "Gemini", href: "/gemini" })
            break
        default:
            crumbs.push({ label: "Tableros", href: "/tableros" })
    }
    return crumbs
}

const iconBtn = "w-[34px] h-[34px] flex items-center justify-center rounded-md cursor-pointer transition-colors hover:bg-[var(--gray-alpha-100)]"

export default function Topbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { theme, toggleTheme } = useThemeStore()
    const [mounted, setMounted] = useState(false)
    const [query, setQuery] = useState("")
    const searchRef = useRef<HTMLInputElement>(null)

    useEffect(() => { setMounted(true) }, [])

    // ⌘K / Ctrl+K focuses the search box.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault()
                searchRef.current?.focus()
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const q = query.trim()
        router.push(q ? `/tableros?name=${encodeURIComponent(q)}` : "/tableros")
    }

    const crumbs = crumbsFor(pathname)
    const themeIcon = mounted && theme === "dark" ? "#geist-sun" : "#geist-moon"

    return (
        <header
            className="h-14 flex-none flex items-center justify-between px-6 sticky top-0 z-20"
            style={{
                borderBottom: "1px solid var(--ds-border)",
                background: "color-mix(in srgb, var(--ds-background) 80%, transparent)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                color: "var(--ds-text)",
            }}
        >
            <nav className="flex items-center gap-[10px] text-sm min-w-0" aria-label="Breadcrumb">
                {crumbs.map((c, i) => {
                    const isLast = i === crumbs.length - 1
                    return (
                        <Fragment key={`${c.href}-${i}`}>
                            {i > 0 && <span style={{ color: "var(--ds-text-muted)" }}>/</span>}
                            <Link
                                href={c.href}
                                className="truncate transition-opacity hover:opacity-80"
                                aria-current={isLast ? "page" : undefined}
                                style={{ color: isLast ? "var(--ds-text)" : "var(--ds-text-muted)", fontWeight: isLast ? 500 : 400 }}
                            >
                                {c.label}
                            </Link>
                        </Fragment>
                    )
                })}
            </nav>

            <div className="flex items-center gap-[10px]">
                <form
                    onSubmit={submitSearch}
                    className="hidden md:flex items-center gap-2 h-[34px] px-[10px] w-[220px]"
                    style={{ background: "var(--ds-background)", border: "1px solid var(--ds-border)", borderRadius: "var(--radius-md)" }}
                >
                    <button type="submit" title="Buscar tableros" className="flex flex-shrink-0" style={{ background: "transparent", border: "none", color: "var(--ds-text-muted)", cursor: "pointer", padding: 0 }}>
                        <svg width="15" height="15" style={{ display: "block" }}><use href="#geist-magnifying-glass" /></svg>
                    </button>
                    <input
                        ref={searchRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar tableros…"
                        aria-label="Buscar tableros"
                        className="flex-1 min-w-0 border-none outline-none bg-transparent text-[13px]"
                        style={{ color: "var(--ds-text)" }}
                    />
                    <span className="font-mono text-[11px] px-[5px] py-px rounded" style={{ fontFamily: "var(--font-mono)", color: "var(--ds-text-muted)", border: "1px solid var(--ds-border)" }}>⌘K</span>
                </form>

                <button
                    title="Notificaciones"
                    className={iconBtn}
                    style={{ border: "1px solid var(--ds-border)", background: "var(--ds-background)", color: "var(--ds-text-secondary)" }}
                >
                    <svg width="16" height="16" style={{ display: "block" }}><use href="#geist-bell" /></svg>
                </button>

                <button
                    onClick={toggleTheme}
                    title="Cambiar tema"
                    suppressHydrationWarning
                    className={iconBtn}
                    style={{ border: "1px solid var(--ds-border)", background: "var(--ds-background)", color: "var(--ds-text-secondary)" }}
                >
                    <svg width="16" height="16" style={{ display: "block" }} suppressHydrationWarning><use href={themeIcon} /></svg>
                </button>
            </div>
        </header>
    )
}
