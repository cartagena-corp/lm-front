import { CalendarIcon, ClockIcon } from "@public/icon/Icon"
import type { DateBadgeProps } from "@/lib/types/board"

const styles = {
    startDate: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        label: "Fecha Inicio",
        Icon: CalendarIcon
    },
    endDate: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        label: "Fecha Fin",
        Icon: CalendarIcon
    },
    createdAt: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        label: "Fecha creación",
        Icon: ClockIcon
    },
    updatedAt: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        label: "Última actualización",
        Icon: ClockIcon
    },
}

export default function DateBadge({ date, type }: DateBadgeProps) {

    const formatDate = (date: string) => {
        const options: Intl.DateTimeFormatOptions = { month: 'long', day: '2-digit', year: 'numeric' }
        return new Date(date).toLocaleDateString('es-ES', options)
    }
    const IconComponent = styles[type].Icon

    if (!date) return null
    if (isNaN(new Date(date).getTime())) return null

    if (type === "startDate" || type === "endDate") return (
        <aside className="flex items-center gap-2">
            <span className={`${styles[type].bg} ${styles[type].text} rounded-md p-2`}>
                <IconComponent size={16} strokeWidth={2} />
            </span>
            <span className="flex flex-col text-xs">
                <h6 className="font-semibold">{styles[type].label}</h6>
                <p className="text-background-text font-light">{formatDate(date)}</p>
            </span>
        </aside>
    )

    if (type === "createdAt" || type === "updatedAt") return (
        <hgroup className="flex justify-between items-center text-xs w-full gap-2">
            <div className="flex items-center gap-2">
                <span className={`${styles[type].text}`}>
                    <IconComponent size={12} strokeWidth={2} />
                </span>
                <h6 className="font-semibold">{styles[type].label}</h6>
            </div>
            <span className="flex text-xs">

                <p className="text-background-text font-light">{formatDate(date)}</p>
            </span>
        </hgroup>
    )
}