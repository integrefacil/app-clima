import { useTranslation } from 'react-i18next'

type Item = { icon: string; label: string; value: string; sub?: string; detail?: string }

export function MetricGrid({ items, compact, columns }: { items: Item[]; compact?: boolean; columns?: string }) {
  const { t } = useTranslation()
  const visible = compact ? items.slice(0, 3) : items
  return (
    <div className={columns ?? (compact ? 'flex flex-wrap gap-2' : 'flex flex-wrap gap-2 md:gap-2.5')}>
      {visible.map((it, i) => (
        <div key={i} className="glass aspect-square w-[86px] h-[86px] md:w-[92px] md:h-[92px] flex flex-col items-center justify-center p-2 text-center shrink-0">
          <span aria-hidden className="text-lg md:text-xl leading-none">{it.icon}</span>
          <p className="text-[10px] md:text-[11px] uppercase tracking-widest text-white/60 mt-1 leading-none truncate w-full">{t(it.label as never, { defaultValue: it.label })}</p>
          <p className="text-sm md:text-[15px] font-semibold mt-1 leading-tight line-clamp-2 w-full">{it.value}</p>
        </div>
      ))}
    </div>
  )
}
