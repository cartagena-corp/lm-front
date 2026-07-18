// Shared shape for the landing-page dictionaries. `es.ts` and `en.ts` both
// implement this exact contract so the two languages can never silently drift.
// Keep every user-visible string on the landing here — no hardcoded copy in the
// components.

export interface NavLink {
   label: string
   href: string
}

export interface DemoSeedIssue {
   title: string
   description: string
   status: "todo" | "doing" | "done"
   type: string
}

export interface Dictionary {
   /** Per-language SEO metadata (consumed by generateMetadata — server-rendered). */
   meta: {
      title: string
      description: string
      ogTitle: string
      ogDescription: string
      keywords: string[]
   }

   nav: {
      skipToContent: string
      brandAlt: string
      hero: string
      timeline: string
      stories: string
      schedule: string
      faq: string
      login: string
      requestDemo: string
      openMenu: string
      closeMenu: string
      language: string
      switchToEs: string
      switchToEn: string
   }

   hero: {
      eyebrow: string
      /** The single, static, server-rendered H1 (the LCP + main SEO signal). */
      h1: string
      /** Decorative rotating phrases (client typing effect). */
      phrases: string[]
      /** 2–3 sentence direct answer to "what is La Muralla" (GEO). */
      directAnswer: string
      cta: string
      secondaryCta: string
      stats: { value: string; label: string }[]
      demo: {
         badge: string
         title: string
         hint: string
         addIssue: string
         reset: string
         emptyColumn: string
         newType: string
         columns: { todo: string; doing: string; done: string }
         seed: DemoSeedIssue[]
         form: {
            title: string
            desc: string
            titleLabel: string
            titlePlaceholder: string
            descLabel: string
            descPlaceholder: string
            imageLabel: string
            imageHint: string
            imageRemove: string
            cancel: string
            create: string
            titleRequired: string
         }
      }
   }

   timeline: {
      eyebrow: string
      heading: string
      subheading: string
      steps: { title: string; description: string }[]
   }

   stories: {
      eyebrow: string
      heading: string
      subheading: string
      dragHint: string
      /** Parallel-indexed with the names/faces in `stories.ts`. */
      items: { role: string; quote: string }[]
   }

   schedule: {
      eyebrow: string
      heading: string
      subheading: string
      durationNote: string
      prevWeek: string
      nextWeek: string
      today: string
      weekLabel: string
      legendFree: string
      legendBusy: string
      busy: string
      scheduleHere: string
      loading: string
      noSlots: string
      modal: {
         title: string
         subtitle: string
         fullName: string
         fullNamePlaceholder: string
         company: string
         companyPlaceholder: string
         email: string
         emailPlaceholder: string
         phone: string
         phonePlaceholder: string
         comment: string
         commentPlaceholder: string
         commentCounter: string
         close: string
         confirm: string
         required: string
         invalidEmail: string
      }
      consent: {
         title: string
         intro: string
         point1: string
         point2: string
         back: string
         accept: string
         sending: string
      }
      successToast: string
      errorToast: string
   }

   faq: {
      eyebrow: string
      heading: string
      subheading: string
      items: { q: string; a: string }[]
   }

   footer: {
      tagline: string
      sections: { heading: string; links: NavLink[] }[]
      legal: NavLink[]
      rights: string
      login: string
      requestDemo: string
   }

   jsonLd: {
      appName: string
      appCategory: string
      appDescription: string
      orgDescription: string
      offerDescription: string
   }

   legalPage: {
      title: string
      updated: string
      intro: string
      sections: { id: string; heading: string; body: string[] }[]
      back: string
   }
}
