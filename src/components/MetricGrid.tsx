import { useTranslation } from 'react-i18next'
import { Dialog } from 'radix-ui'

type Item = { icon: string; label: string; value: string; sub?: string; detail?: string }

export function MetricGrid({ items }: { items: Item[] }) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3 md:gap-4">
      {items.map((it, i) => (
        <Dialog.Root key={i}>
          <Dialog.Trigger asChild>
            <button className="glass p-3 md:p-4 min-h-[110px] md:min-h-[120px] text-left hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-colors">
              <p className="text-[11px] md:text-xs uppercase tracking-widest text-white/60 flex items-center gap-1">
                <span aria-hidden>{it.icon}</span> {t(it.label as never, { defaultValue: it.label })}
              </p>
              <p className="text-xl md:text-2xl font-medium mt-2">{it.value}</p>
              {it.sub && <p className="text-xs md:text-sm text-white/60 mt-1">{it.sub}</p>}
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 glass-strong p-6 w-[90%] max-w-sm z-50">
              <Dialog.Title className="text-sm font-medium flex items-center gap-2">
                <span aria-hidden>{it.icon}</span> {t(it.label as never, { defaultValue: it.label })}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-white/60 mt-1">{it.detail ?? it.sub ?? ''}</Dialog.Description>
              <p className="text-3xl font-thin mt-4">{it.value}</p>
              <Dialog.Close asChild>
                <button className="mt-6 w-full glass py-2 rounded-xl text-sm hover:bg-white/15">OK</button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ))}
    </div>
  )
}
