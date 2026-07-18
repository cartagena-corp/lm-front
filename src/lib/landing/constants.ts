// Anchor ids for the landing sections. Shared by the header nav, the footer
// links and the sections themselves so in-page anchors never drift. These are
// language-neutral slugs (they are not user-visible copy).
export const SECTIONS = {
   hero: "inicio",
   timeline: "como-funciona",
   stories: "historias",
   schedule: "agendar",
   faq: "faq",
} as const

export type SectionId = (typeof SECTIONS)[keyof typeof SECTIONS]
