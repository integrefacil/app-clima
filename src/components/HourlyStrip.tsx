import { useTranslation } from 'react-i18next'
import { ScrollArea } from 'radix-ui'
import { wmoIcon } from '../lib/wmo'

type Hour = { time: string; temp: number; code: number; precip?: number; isDay?: boolean }

export function HourlyStrip({ hours, compact }: { hours: Hour[]; compact?: boolean }) {
  const { t, i18n } = useTranslation()
  const visible = compact ? hours.slice(0, 5) : hours
  return (
    <div className={compact ? 'p-1' : 'glass p-3 md:p-4'}>
      {!compact && <p className="text-xs md:text-sm text-white/60 uppercase tracking-widest mb-2">{t('hourly.title')}</p>}
      {compact && <p className="text-xs text-white/60 mb-1">{t('hourly.title')}</p>}
      <ScrollArea.Root className="w-full overflow-hidden">
        <ScrollArea.Viewport className="w-full">
          <div className="flex gap-4 md:gap-6 pb-2">
            {visible.map((h, i) => (
              <div key={i} className="flex flex-col items-center min-w-[52px] md:min-w-[64px]">
                <span className="text-[11px] md:text-xs text-white/60">{i === 0 ? t('hourly.now') : h.time}</span>
                <span className="text-lg md:text-xl my-1" aria-hidden>
                  {wmoIcon(h.code, h.isDay ?? true)}
                </span>
                <span className="text-sm md:text-base font-medium">{Math.round(h.temp)}°</span>
                {h.precip != null && h.precip > 30 && <span className="text-[10px] md:text-xs text-sky-100">{i18n.language.startsWith('pt') ? 'Chuva fraca' : 'Rain'}</span>}
                {h.precip != null && h.precip > 0 && h.precip <= 30 && <span className="text-[10px] md:text-xs text-sky-100/70">•</span>}
              </div>
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="horizontal"
          className="flex h-2.5 select-none touch-none p-[2px] bg-white/[0.07] rounded-full mt-2 cursor-pointer hover:bg-white/[0.10] transition-colors"
        >
          <ScrollArea.Thumb className="flex-1 bg-white/30 rounded-full hover:bg-white/45 active:bg-white/55 cursor-pointer transition-colors" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  )
}
