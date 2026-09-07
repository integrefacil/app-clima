import { useTranslation } from 'react-i18next'
import { wmoIcon } from '../lib/wmo'
import type { Day } from '../types/weather'

type Props = {
  days: Day[]
  onClick?: () => void
}

function plainRain(precip: number, lang: string) {
  if (precip <= 0.2) return lang.startsWith('pt') ? 'Sem chuva' : 'No rain'
  if (precip < 2) return lang.startsWith('pt') ? 'Chuva fraca' : 'Light rain'
  if (precip < 6) return lang.startsWith('pt') ? 'Pode chover' : 'May rain'
  return lang.startsWith('pt') ? 'Chuva' : 'Rain'
}

export function DailyPreviewCard({ days, onClick }: Props) {
  const { t, i18n } = useTranslation()
  // próximos 3 dias conforme solicitado — imagem 2
  const visible = days.slice(0, 3)
  const maxTemp = Math.max(...visible.map((d) => d.max))
  const minTemp = Math.min(...visible.map((d) => d.min))

  const content = (
    <>
      <p className="text-xs md:text-sm text-white/60 uppercase tracking-widest px-3 md:px-4 pt-3">
        {t('daily.title')}
      </p>
      <div className="px-3 md:px-4 pb-3 pt-1">
        <div className="divide-y divide-white/10">
          {visible.map((d, i) => {
            const range = maxTemp - minTemp || 1
            const left = ((d.min - minTemp) / range) * 100
            const width = ((d.max - d.min) / range) * 100
            return (
              <div key={i} className="flex items-center gap-2 py-2.5 text-sm md:text-base">
                <span className="w-[72px] md:w-28 text-white/90 truncate text-sm" title={d.label}>
                  {d.label}
                </span>
                <span aria-hidden className="text-base md:text-lg shrink-0">
                  {wmoIcon(d.code)}
                </span>
                <span
                  className="w-[84px] md:w-[110px] text-center text-sky-100 text-[11px] md:text-xs truncate shrink-0"
                  title={`${d.precip}mm`}
                >
                  {plainRain(d.precip, i18n.language)}
                </span>
                <div className="flex-1 relative h-1.5 md:h-1.5 bg-white/15 rounded-full mx-1 md:mx-2 min-w-[72px]">
                  <div
                    className="absolute h-1.5 bg-gradient-to-r from-sky-200 via-sky-200 to-orange-400 rounded-full"
                    style={{ left: `${left}%`, width: `${Math.max(12, width)}%` }}
                  />
                  {/* bolinha sutil no fim do gradiente como na imagem */}
                  <span
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/40"
                    style={{ left: `calc(${left}% + ${Math.max(12, width)}% - 6px)` }}
                    aria-hidden
                  />
                </div>
                <span className="w-8 text-right font-medium text-sm shrink-0">{Math.round(d.max)}°</span>
                <span className="w-8 text-right text-white/60 text-sm shrink-0">{Math.round(d.min)}°</span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )

  if (!onClick) {
    return <div className="glass overflow-hidden">{content}</div>
  }

  return (
    <button
      onClick={onClick}
      aria-label={t('views.dashboard.heroAria', { defaultValue: 'Ver detalhes do clima atual' })}
      className="glass overflow-hidden w-full text-left hover:bg-white/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-colors"
    >
      {content}
    </button>
  )
}
