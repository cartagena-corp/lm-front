"use client"

import Modal from "@/components/new_layout/Modal"

// Mounts the app's shared stacked-modal renderer on the landing. The global one
// normally lives inside ConditionalLayout's app shell, which is disabled for the
// landing route — so the landing mounts its own. Reuses the exact modal system
// (z-index stacking + darkening backdrop per layer) the rest of the app uses.
export default function LandingModals() {
   return <Modal />
}
