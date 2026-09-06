import { useTranslation } from 'react-i18next'
import { Separator } from 'radix-ui'
import { wmoIcon } from '../lib/wmo'

type Day = { label: string; code: number; max: number; min: number; precip: number }

function plainRain(precip: number, lang: string) {
  if (precip <= 0.2) return lang.startsWith('pt') ? 'Sem chuva' : 'No rain'
  if (precip < 2) return lang.startsWith('pt') ? 'Chuvinha' : 'Light rain'
  if (precip < 6) return lang.startsWith('pt') ? 'Pode chover' : 'May rain'
  return lang.startsWith('pt') ? 'Chuva' : 'Rain'
}

export function DailyList({ days }: { days: Day[] }) {
  const { t, i18n } = useTranslation()
  const maxTemp = Math.max(...days.map((d) => d.max))
  const minTemp = Math.min(...days.map((d) => d.min))

  return (
    <div className="glass p-3 md:p-4">
      <p className="text-xs md:text-sm text-white/60 uppercase tracking-widest mb-2 flex items-center gap-1">🗓 {t('daily.title')}</p>
      <div>
        {days.map((d, i) => {
          const range = maxTemp - minTemp || 1
          const left = ((d.min - minTemp) / range) * 100
          const width = ((d.max - d.min) / range) * 100
          return (
            <div key={i}>
              <div className="flex items-center gap-2 py-2.5 text-sm md:text-base">
                <span className="w-12 md:w-16 text-white/90">{d.label}</span>
                <span aria-hidden className="text-base md:text-lg">{wmoIcon(d.code)}</span>
                <span className="w-[84px] md:w-[110px] text-center text-sky-100 text-[11px] md:text-xs truncate" title={`${d.precip}mm`}>{plainRain(d.precip, i18n.language)}</span>
                <div className="flex-1 relative h-1 md:h-1.5 bg-white/15 rounded-full mx-2">
                  <div className="absolute h-1 md:h-1.5 bg-gradient-to-r from-sky-300 to-orange-400 rounded-full" style={{ left: `${left}%`, width: `${Math.max(8, width)}%` }} />
                </div>
                <span className="w-8 text-right font-medium">{Math.round(d.max)}°</span>
                <span className="w-8 text-right text-white/60">{Math.round(d.min)}°</span>
              </div>
              {i < days.length - 1 && <Separator.Root className="h-px bg-white/10" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
