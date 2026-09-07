import type { ReactNode } from 'react'

type Props = {
  title?: ReactNode
  onClick: () => void
  ariaLabel: string
  children: ReactNode
  className?: string
}

export function SummaryCard({ title, onClick, ariaLabel, children, className }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`glass text-left w-full p-0 overflow-hidden hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-colors relative group ${className ?? ''}`}
    >
      {title && (
        <div className="flex items-center justify-between px-3 md:px-4 pt-3 gap-2">
          <span className="flex items-center gap-1.5 text-xs md:text-sm text-white/60 uppercase tracking-widest leading-none">{title}</span>
          <span aria-hidden className="text-white/40 group-hover:text-white/80 transition-colors text-sm leading-none shrink-0">›</span>
        </div>
      )}
      {!title && (
        <span
          aria-hidden
          className="absolute top-3 right-3 text-white/40 group-hover:text-white/80 transition-colors text-sm"
        >
          ›
        </span>
      )}
      <div className={title ? 'px-3 md:px-4 pb-3 pt-4' : ''}>{children}</div>
    </button>
  )
}
