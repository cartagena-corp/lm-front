import type { Dictionary } from "./types"

// English — full translation of the landing copy. Must mirror the shape of es.ts.
export const en: Dictionary = {
   meta: {
      title: "Project management with kanban boards | La Muralla",
      description:
         "La Muralla organizes your team's work into kanban boards and issues, with sprints, real-time tracking and audits. Book a free demo today.",
      ogTitle: "La Muralla — Project management with boards and issues",
      ogDescription:
         "Kanban boards, sprints, issues and real-time tracking for your team. Book a 30-minute demo on Google Meet.",
      keywords: [
         "project management",
         "kanban boards",
         "issue tracking",
         "sprints",
         "task tracking",
         "La Muralla",
         "Cartagena Corporation",
      ],
   },

   nav: {
      skipToContent: "Skip to content",
      brandAlt: "La Muralla",
      hero: "Home",
      timeline: "How it works",
      stories: "Stories",
      schedule: "Book a demo",
      faq: "FAQ",
      login: "Sign in",
      requestDemo: "Request demo",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      language: "Language",
      switchToEs: "Spanish",
      switchToEn: "English",
   },

   hero: {
      eyebrow: "Project management",
      h1: "The platform to manage your work",
      phrases: [
         "Organize your team's work in kanban boards.",
         "Track every issue in real time.",
         "Plan sprints and ship your projects on time.",
         "Create tasks in seconds with AI assistance.",
         "Measure your team's performance with audits.",
         "When task chaos slows your team down, La Muralla brings order.",
      ],
      directAnswer:
         "La Muralla is a project management platform that organizes your team's work into kanban boards and issues. Plan sprints, drag your tasks between statuses and follow progress in real time — all in one place.",
      cta: "Request a Demo",
      secondaryCta: "Log in",
      stats: [
         { value: "+12", label: "active boards" },
         { value: "+340", label: "issues managed" },
         { value: "99.9%", label: "uptime" },
      ],
      demo: {
         badge: "Live demo",
         title: "Try it right here",
         hint: "Create an issue and drag it between columns.",
         addIssue: "New issue",
         reset: "Reset",
         emptyColumn: "No issues",
         newType: "Task",
         columns: { todo: "To do", doing: "In progress", done: "Done" },
         seed: [
            { title: "Kanban boards", description: "Organize work in columns by status.", status: "done", type: "Core" },
            { title: "Real-time tracking", description: "Every issue's status, instantly.", status: "done", type: "Collaboration" },
            { title: "Sprints & planning", description: "Group work with dates and goals.", status: "doing", type: "Planning" },
            { title: "Notifications", description: "Alerts when something changes status.", status: "doing", type: "Collaboration" },
            { title: "AI creation", description: "Write tasks in natural language.", status: "todo", type: "AI" },
            { title: "Audits", description: "Measure the performance of each sprint.", status: "todo", type: "Analytics" },
            { title: "Attachments & images", description: "Context travels with every issue.", status: "todo", type: "Core" },
         ],
         form: {
            title: "New issue",
            desc: "Add an issue to your demo board.",
            titleLabel: "Title",
            titlePlaceholder: "e.g. Set up the team board",
            descLabel: "Description",
            descPlaceholder: "Describe the issue…",
            imageLabel: "Image (optional)",
            imageHint: "PNG or JPG, up to 2 MB",
            imageRemove: "Remove image",
            cancel: "Cancel",
            create: "Create issue",
            titleRequired: "Title is required",
         },
      },
   },

   timeline: {
      eyebrow: "How it works",
      heading: "From zero to an organized team in four steps",
      subheading:
         "La Muralla is with you from creating your first board to delivering the project.",
      steps: [
         {
            title: "Create a board",
            description:
               "Organize your workflow into boards and define the statuses for your issues.",
         },
         {
            title: "Plan your sprints",
            description: "Group work into sprints with clear dates and goals for your team.",
         },
         {
            title: "Manage the issues",
            description:
               "Create tasks with a title, description and images; assign them and drag them between statuses.",
         },
         {
            title: "Measure and deliver",
            description:
               "Follow progress in real time and review audits to deliver on time.",
         },
      ],
   },

   stories: {
      eyebrow: "Customer stories",
      heading: "Teams already building with La Muralla",
      subheading: "How product, engineering and operations teams use La Muralla.",
      dragHint: "Drag to explore",
      items: [
         {
            role: "Product Manager",
            quote:
               "We went from spreadsheets to kanban boards in an afternoon. Now the whole team sees the status of every issue in real time.",
         },
         {
            role: "Tech Lead",
            quote:
               "Drag & drop between statuses makes updating the sprint instant. No one asks “where are you at?” anymore.",
         },
         {
            role: "Scrum Master",
            quote:
               "Planning sprints with dates and goals organized us completely. We shipped three releases on time in a row.",
         },
         {
            role: "CTO",
            quote:
               "Creating tasks with AI assistance saves us hours every week. We describe the issue and La Muralla writes it up.",
         },
         {
            role: "Operations Lead",
            quote:
               "Audits give us real visibility into performance. We know exactly where work slows down.",
         },
         {
            role: "Engineering Manager",
            quote:
               "Real-time notifications keep everyone aligned without endless meetings.",
         },
         {
            role: "Design Lead",
            quote:
               "Attaching images to each issue ended the misunderstandings. Context travels with the task.",
         },
         {
            role: "Founder",
            quote:
               "One place for boards, sprints and issues. La Muralla replaced three tools.",
         },
      ],
   },

   schedule: {
      eyebrow: "Request a demo",
      heading: "Book a 30-minute demo",
      subheading:
         "Pick a free slot in the week and book a Google Meet session with our team.",
      durationNote: "30-minute sessions on Google Meet",
      prevWeek: "Previous week",
      nextWeek: "Next week",
      today: "Today",
      weekLabel: "Week of",
      legendFree: "Available",
      legendBusy: "Busy",
      busy: "Busy",
      scheduleHere: "Book a demo",
      loading: "Loading availability…",
      noSlots: "No available slots this week.",
      modal: {
         title: "Book a demo",
         subtitle: "30-min session on Google Meet",
         fullName: "Full name",
         fullNamePlaceholder: "Your first and last name",
         company: "Company",
         companyPlaceholder: "Your company name",
         email: "Email",
         emailPlaceholder: "you@company.com",
         phone: "Phone",
         phonePlaceholder: "+1 555 000 0000",
         comment: "Comment (optional)",
         commentPlaceholder: "Tell us what you'd like to see in the demo…",
         commentCounter: "{n}/500",
         close: "Close",
         confirm: "Confirm",
         required: "Please complete the required fields",
         invalidEmail: "Enter a valid email address",
      },
      consent: {
         title: "Confirm your request",
         intro: "By booking a demo:",
         point1:
            "You consent to the processing of your personal data for the purpose of managing the session.",
         point2:
            "A Google Meet session will be scheduled and you'll receive the invitation at the email you provided.",
         back: "Back",
         accept: "Accept and book",
         sending: "Booking…",
      },
      successToast: "Done! We've sent the invitation to your email.",
      errorToast: "We couldn't book the demo. Please try again.",
   },

   faq: {
      eyebrow: "FAQ",
      heading: "Frequently asked questions about La Muralla",
      subheading: "Everything you need to know before you start.",
      items: [
         {
            q: "What is La Muralla?",
            a: "La Muralla is a project management platform that organizes your team's work into kanban boards and issues, with sprints, real-time tracking and audits.",
         },
         {
            q: "What is La Muralla used for?",
            a: "It's used to plan sprints, create and assign issues, drag them between statuses and measure team performance — all from one place.",
         },
         {
            q: "Does La Muralla use kanban boards?",
            a: "Yes. Each board organizes your issues into columns by status, and you can drag them between columns to update their progress instantly.",
         },
         {
            q: "Can I create issues with images?",
            a: "Yes. Every issue supports a title, description and attached images, so context always travels with the task.",
         },
         {
            q: "How do I book a demo?",
            a: "Pick a free slot in the calendar on this page, fill in your details, and you'll receive an invitation to a 30-minute Google Meet session.",
         },
      ],
   },

   footer: {
      tagline:
         "Project management through kanban boards and issues. Built by Cartagena Corporation.",
      sections: [
         {
            heading: "Product",
            links: [
               { label: "Home", href: "#inicio" },
               { label: "How it works", href: "#como-funciona" },
               { label: "Stories", href: "#historias" },
               { label: "Book a demo", href: "#agendar" },
            ],
         },
         {
            heading: "Company",
            links: [
               { label: "Cartagena Corporation", href: "https://cartagenacorporation.com" },
               { label: "FAQ", href: "#faq" },
            ],
         },
         {
            heading: "Access",
            links: [
               { label: "Sign in", href: "/login" },
               { label: "Request demo", href: "#agendar" },
            ],
         },
      ],
      legal: [
         { label: "Privacy policy", href: "/en/legal#privacidad" },
         { label: "Data processing", href: "/en/legal#tratamiento" },
      ],
      rights: "Cartagena Corporation. All rights reserved.",
      login: "Sign in",
      requestDemo: "Request demo",
   },

   jsonLd: {
      appName: "La Muralla",
      appCategory: "BusinessApplication",
      appDescription:
         "Project management platform with kanban boards, issues, sprints, real-time tracking and audits.",
      orgDescription:
         "Cartagena Corporation builds project management software, including La Muralla.",
      offerDescription: "Free 30-minute demo on Google Meet",
   },

   legalPage: {
      title: "Privacy policy & data processing",
      updated: "Document in preparation — subject to legal review.",
      intro:
         "At La Muralla, by Cartagena Corporation, we protect your personal data. This page describes how we collect it, what we use it for, and what rights you have.",
      sections: [
         {
            id: "privacidad",
            heading: "Privacy policy",
            body: [
               "We collect the data you provide when requesting a demo (full name, company, email and phone) for the sole purpose of scheduling and managing the session.",
               "We do not share your data with third parties unrelated to providing the service, except where required by law or a competent authority.",
               "You can request access to, correction of, or deletion of your data at any time by contacting our team.",
            ],
         },
         {
            id: "tratamiento",
            heading: "Data processing",
            body: [
               "By booking a demo you consent to the processing of your personal data in accordance with applicable law.",
               "The legal basis for processing is your explicit consent, which you may withdraw at any time without retroactive effect.",
               "We retain your data only for as long as necessary to manage your request and to comply with applicable legal obligations.",
            ],
         },
      ],
      back: "Back to home",
   },
}
