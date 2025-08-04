import type { BadgeProps } from "@/lib/types/ui"

export default function Badge({ className = "", hexColor, children }: BadgeProps) {
    return (
        <span style={{ border: `1px solid ${hexColor}40`, backgroundColor: `${hexColor}20`, color: hexColor }}
            className={`flex items-center gap-1 whitespace-nowrap flex-shrink-0 rounded-full font-medium text-xs px-3 py-1 ${className}`}>
            {children}
        </span>
    )
}