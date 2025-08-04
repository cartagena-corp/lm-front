import { AnimatePresence, motion } from "motion/react"
import type { TabProps } from "@/lib/types/ui"
import { useState } from "react"
import Button from "./Button"

export default function Tab({ className = "", items }: TabProps) {
    const [activeIndex, setActiveIndex] = useState(0)

    return (
        <section className={`w-full ${className}`}>
            <aside role="tablist" aria-label="Navegación por pestañas" className="bg-button-secondary-background flex justify-between items-center rounded-md shadow-md gap-2 p-2">
                {items.map((item, index) => {
                    const isActive = index === activeIndex
                    return (
                        <Button variant="secondary" className={`flex grow items-center justify-center transition-colors ${isActive ? 'bg-primary! text-primary-text!' :
                            'hover:bg-button-secondary-hover! hover:border-button-secondary-border! bg-transparent! border-transparent!'}`}
                            key={item.label} aria-selected={isActive} aria-controls={`tabpanel-${index}`} onClick={() => setActiveIndex(index)}>
                            {item.label}
                        </Button>
                    )
                })}
            </aside>

            <aside className="mt-5">
                <AnimatePresence mode="wait">
                    <motion.div transition={{ duration: 0.25, ease: "easeInOut" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        role="tabpanel" key={activeIndex} id={`tabpanel-${activeIndex}`} aria-labelledby={`tab-${activeIndex}`}>
                        {items[activeIndex].content}
                    </motion.div>
                </AnimatePresence>
            </aside>
        </section>
    )
}
