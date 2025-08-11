import type { InputHTMLAttributes, ReactNode, ElementType } from "react"
import type { StatusProps } from "@/lib/types/global"


export interface ButtonProps {
    variant?: "primary" | "secondary" | "none" | "error"
    onClick?: () => void
    children: ReactNode
    className?: string
}

export interface DropdownOption {
    hasColor?: boolean
    hexColor?: string
    value: string
    name: string
}

export interface DropdownProps {
    onSelect: (value: string) => void
    selectedValue: string | null
    options: StatusProps[] | DropdownOption[]
    placeholder: string
    className?: string
}

export interface BadgeProps {
    children?: ReactNode
    className?: string
    hexColor: string
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    containerClassName?: string
    icon?: ElementType
    label?: string
    error?: string
}

export interface TabProps {
    className?: string
    items: TabItem[]
}

export interface TabItem {
    content: ReactNode
    label: string
}