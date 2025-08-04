import ConditionalLayout from "@/components/layouts/ConditionalLayout"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { ReactNode } from "react"
import "@public/css/globals.css"

const inter = Inter({
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    subsets: ["latin", "latin-ext"],
})

export const metadata: Metadata = {
    description: "Sistema de gestión de proyectos - La Muralla",
    title: "La Muralla - Refactor",
}

export default async function RootLayout({ children }: { children: ReactNode }) {

    return (
        <html lang="es">
            <body className={`${inter.className} antialiased`}>
                <ConditionalLayout>
                    {children}
                </ConditionalLayout>
            </body>
        </html>
    )
}
