import { useTranslation } from 'react-i18next'
import { MarineModule } from '../components/MarineModule'
import { SummaryCard } from '../components/cards/SummaryCard'
import { fmtWeekdayLong } from '../lib/format'
import type { MarineWeek } from '../services/marineWeek'

type Props = {
  marine: { wave_height: number | null; wave_direction: number | null; wave_period: number | null } | null
  week: MarineWeek
  onNavigateFull: () => void
}

export function MarineDashboard({ marine, week, onNavigateFull }: Props) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const best = week.days.length ? [...week.days].sort((a, b) => b.score - a.score)[0] : null

  return (
    <div className="space-y-3 view-enter">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-5">
          <MarineModule
            waveHeight={marine?.wave_height ?? null}
            wavePeriod={marine?.wave_period ?? null}
            waveDirection={marine?.wave_direction ?? null}
          />
        </div>
        <div className="lg:col-span-7 glass p-4 text-xs md:text-sm text-white/60 space-y-2">
          <p className="font-medium text-white/80">{i18n.language.startsWith('pt') ? 'Como está o mar agora' : 'How the sea is now'}</p>
          <p>{marine?.wave_height != null ? (marine.wave_height < 0.5 ? t('marine.waveSmall') : marine.wave_height < 1.1 ? t('marine.waveMedium') : t('marine.waveBig')) : '--'}</p>
          <p className="text-[11px] text-white/40">{t('marine.disclaimer')}</p>
        </div>
      </div>

      <SummaryCard
        title={t('marine.weekTitle')}
        ariaLabel={t('views.dashboard.marineWeekAria', { defaultValue: 'Ver semana do mar completa' })}
        onClick={onNavigateFull}
      >
        <div className="p-1 space-y-2">
          {best && (
            <div className="glass p-3 bg-white/10 rounded-xl text-center">
              <p className="text-xs uppercase tracking-widest text-white/60">{t('marine.bestDay')}</p>
              <p className="text-sm font-semibold mt-1 capitalize">
                {new Intl.DateTimeFormat(locale, { weekday: 'long', day: '2-digit', month: 'short' }).format(new Date(`${best.date}T12:00:00`))}
              </p>
              <p className="text-xs text-white/70 mt-1">{best.bestSlot ?? '--'} • {best.waveAvg != null ? `${best.waveAvg.toFixed(1)}m` : '--'}</p>
            </div>
          )}
          <div className="space-y-1">
            {week.days.slice(0, 3).map((d, idx) => {
              let label: string
              if (idx === 0) label = t('daily.today')
              else if (idx === 1) label = t('daily.tomorrow')
              else label = fmtWeekdayLong(d.date, locale)
              return (
                <div key={d.date} className="flex justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-white/90">{label}</span>
                  <span className="text-white/60">{d.score >= 75 ? t('marine.good') : d.score >= 50 ? t('marine.moderate') : t('marine.poor')}</span>
                  <span className="text-white/60">{d.bestSlot ?? '--'}</span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-center text-white/40">{t('views.dashboard.tapToExpand', { defaultValue: 'Toque para ver os 7 dias' })}</p>
        </div>
      </SummaryCard>
    </div>
  )
}
