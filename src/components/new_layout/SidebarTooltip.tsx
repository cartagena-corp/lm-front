import { motion } from "motion/react"

interface SidebarTooltipProps {
    show?: boolean
    text: string
    position: {
        top: number
        left: number
    }
}

export default function SidebarTooltip({ text, position, show = true }: SidebarTooltipProps) {
    if (!show) return null

    return (
        <motion.div className="bg-primary text-primary-text fixed z-10 px-3 py-1.5 rounded-lg text-xs shadow-lg pointer-events-none whitespace-nowrap"
            initial={{ opacity: 0, scale: 0.95, x: -10, y: 10 }} exit={{ opacity: 0, scale: 0.95, x: -10, y: 10 }}
            animate={{ opacity: 1, scale: 1, x: 3, y: -13 }} transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ top: position.top, left: position.left }}
        >
            {text}
        </motion.div>
    )
}