import { Roboto_Condensed } from "next/font/google"

// Brand wordmark typeface — the same font used for the "LA MURALLA" logo on the
// /login page (see src/app/login/page.tsx). Shared here so the header and footer
// load it once.
export const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], display: "swap" })
