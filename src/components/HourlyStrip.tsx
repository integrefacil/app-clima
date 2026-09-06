import { useTranslation } from 'react-i18next'
import { ScrollArea } from 'radix-ui'
import { wmoIcon } from '../lib/wmo'

type Hour = { time: string; temp: number; code: number; precip?: number }

export function HourlyStrip({ hours }: { hours: Hour[] }) {
  const { t, i18n } = useTranslation()
  return (
    <div className="glass p-3 md:p-4">
      <p className="text-xs md:text-sm text-white/60 uppercase tracking-widest mb-2">{t('hourly.title')}</p>
      <ScrollArea.Root className="w-full overflow-hidden">
        <ScrollArea.Viewport className="w-full">
          <div className="flex gap-4 md:gap-6 pb-2">
            {hours.map((h, i) => (
              <div key={i} className="flex flex-col items-center min-w-[52px] md:min-w-[64px]">
                <span className="text-[11px] md:text-xs text-white/60">{i === 0 ? t('hourly.now') : h.time}</span>
                <span className="text-lg md:text-xl my-1" aria-hidden>
                  {wmoIcon(h.code)}
                </span>
                <span className="text-sm md:text-base font-medium">{Math.round(h.temp)}°</span>
                {h.precip != null && h.precip > 30 && <span className="text-[10px] md:text-xs text-sky-100">{i18n.language.startsWith('pt') ? 'Chuvinha' : 'Rain'}</span>}
                {h.precip != null && h.precip > 0 && h.precip <= 30 && <span className="text-[10px] md:text-xs text-sky-100/70">•</span>}
              </div>
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="horizontal" className="h-1.5 bg-white/5 rounded-full mt-1">
          <ScrollArea.Thumb className="bg-white/20 rounded-full" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  )
}
