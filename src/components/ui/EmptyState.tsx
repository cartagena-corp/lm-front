import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      <div className="text-center">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: "var(--gray-alpha-100)", color: "var(--ds-text-muted)" }}
        >
          {icon || <Inbox size={48} strokeWidth={1.5} />}
        </div>
        <h3 className="text-sm font-medium mb-2" style={{ color: "var(--ds-text-secondary)" }}>
          {title}
        </h3>
        {description && (
          <p className="text-[13px] mb-6 max-w-md" style={{ color: "var(--ds-text-muted)" }}>
            {description}
          </p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center h-9 px-3 rounded-md text-sm font-medium transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2"
            style={{ background: "var(--gray-1000)", color: "var(--ds-contrast-inverse)" }}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}
