import type { ButtonProps } from "@/lib/types/ui"

export default function Button({ children, onClick, className, variant = "primary" }: ButtonProps) {

    const styles = {
        primary: "bg-button-primary-background text-button-primary-text hover:bg-button-primary-hover border-button-primary-border border",
        secondary: "bg-button-secondary-background text-button-secondary-text hover:bg-button-secondary-hover border-button-secondary-border border",
        error: "bg-red-50 text-red-600 hover:bg-red-100 border-red-200 border",
        none: "",
    }

    return (
        <button onClick={onClick} className={`transition-colors cursor-pointer font-medium rounded-md text-sm px-4 py-2 ${styles[variant]} ${className}`}>
            {children}
        </button>
    )
} 