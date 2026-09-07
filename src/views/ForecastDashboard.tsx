import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HeaderHero } from '../components/HeaderHero'
import { MetricGrid } from '../components/MetricGrid'
import { CelestialArc } from '../components/CelestialArc'
import { SummaryCard } from '../components/cards/SummaryCard'
import { HourlyPreviewCard } from '../components/HourlyPreviewCard'
import { DailyPreviewCard } from '../components/DailyPreviewCard'
import { fmtTime } from '../lib/format'
import { isDayNow } from '../lib/celestial'
import { getMoonInfo, moonPhaseKey } from '../lib/moon'
import type { Day, Hour, MetricItem } from '../types/weather'
import type { MarineWeek } from '../services/marineWeek'

type Props = {
  locName: string
  temp: number
  code: number
  max: number
  min: number
  sunrise: string
  sunset: string
  sunriseISO?: string | null
  sunsetISO?: string | null
  moonrise?: string | null
  moonset?: string | null
  moonriseISO?: string | null
  moonsetISO?: string | null
  metrics: MetricItem[]
  marine: { wave_height: number | null; wave_direction: number | null; wave_period: number | null } | null
  week?: MarineWeek | null
  feelsLike?: { value: string } | null
  humidity?: string | null
  windLabel?: string | null
  // mantido por compat (legado) — não renderiza mais no card celestial
  uvLabel?: string | null
  isDay?: boolean | null
  hours: Hour[]
  days: Day[]
  onNavigate: (screen: 'sun' | 'marine-full' | 'hero' | 'hourly' | 'daily') => void
}

export function ForecastDashboard({ locName, temp, code, max, min, sunrise, sunset, sunriseISO, sunsetISO, moonrise, moonset, moonriseISO, moonsetISO, metrics, marine, week, feelsLike, humidity, windLabel, uvLabel, isDay, hours, days, onNavigate }: Props) {
  const isBeach = marine !== null
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    const onVis = () => {
      if (document.visibilityState === 'visible') setNow(new Date())
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])
  const variant: 'sun' | 'moon' = isDayNow(now, sunriseISO, sunsetISO) ? 'sun' : 'moon'
  const moonLabel = t(moonPhaseKey(getMoonInfo(now).phase))

  // maré de agora: Subindo/Descendo + hora do pico/baixa (próximo extremo)
  const tideDisplay = useMemo(() => {
    if (!week || !week.days.length) return '--'
    const allTides = week.days.flatMap((d) => d.tides).sort((a, b) => a.time.localeCompare(b.time))
    if (!allTides.length) return '--'
    const now = new Date()
    let next = allTides.find((td) => new Date(td.time).getTime() > now.getTime()) ?? allTides[allTides.length - 1]
    // se next está muito no passado (ex. todos antes de agora por timezone), tenta pegar o mais próximo no futuro relativo ao dia
    const timeStr = fmtTime(next.time, locale)
    if (next.type === 'high') return t('marine.tideRisingAt', { time: timeStr })
    return t('marine.tideFallingAt', { time: timeStr })
  }, [week, locale, t])

  const waveDisplay = useMemo(() => {
    const h = marine?.wave_height ?? null
    if (h == null) return '--'
    const plain = h < 0.5 ? t('marine.waveSmall') : h < 1.1 ? t('marine.waveMedium') : t('marine.waveBig')
    return `${plain} • ${h.toFixed(1)}m`
  }, [marine?.wave_height, t])
  return (
    <div className="space-y-3 md:space-y-4 view-enter">
      <SummaryCard
        ariaLabel={t('views.dashboard.heroAria', { defaultValue: 'Ver detalhes do clima atual' })}
        onClick={() => onNavigate('hero')}
        className="glass-strong"
      >
        <HeaderHero location={locName} temp={temp} conditionCode={code} max={max} min={min} feelsLike={feelsLike ?? null} humidity={humidity ?? null} wind={windLabel ?? null} uvLabel={uvLabel ?? null} isDay={isDay ?? undefined} />
      </SummaryCard>

      {/* próximos cards — logo abaixo do hero, fiel às imagens 1 e 2 */}
      <HourlyPreviewCard hours={hours} onClick={() => onNavigate('hourly')} />
      <DailyPreviewCard days={days} onClick={() => onNavigate('daily')} />

      {/* métricas removidas do grid — Ar e Vento agora no Hero para não poluir */}
      {metrics.length > 0 && <MetricGrid items={metrics} />}

      <div className={`grid gap-3 md:gap-4 ${isBeach ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        <SummaryCard
          title={
            variant === 'sun' ? (
              <span className="leading-none">{t('sunset.sunrise')} • {t('sunset.sunset')}</span>
            ) : (
              <span className="leading-none">{moonLabel}</span>
            )
          }
          ariaLabel={t('views.dashboard.sunAria', { defaultValue: 'Ver detalhes do sol' })}
          onClick={() => onNavigate('sun')}
          className={isBeach ? 'h-full flex flex-col' : undefined}
        >
          <CelestialArc
            variant={variant}
            sunrise={sunrise}
            sunset={sunset}
            sunriseISO={sunriseISO}
            sunsetISO={sunsetISO}
            moonrise={moonrise}
            moonset={moonset}
            moonriseISO={moonriseISO}
            moonsetISO={moonsetISO}
            compact
          />
        </SummaryCard>

        {/* card Mar — só agora/hoje: Maré (Subindo/Descendo + hora pico/baixa) e Ondas — resto vai nos detalhes */}
        {isBeach && (
          <SummaryCard
            title={t('marine.title')}
            ariaLabel={t('views.dashboard.marineAria', { defaultValue: 'Ver mar completo' })}
            onClick={() => onNavigate('marine-full')}
            className="h-full flex flex-col"
          >
            <div className="divide-y divide-white/10">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-white/60">{t('marine.tideNow')}</span>
                <span className="text-sm font-medium text-white text-right ml-3">{tideDisplay}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-white/60">{t('marine.waveHeight')}</span>
                <span className="text-sm font-medium text-white text-right ml-3">{waveDisplay}</span>
              </div>
            </div>
            <p className="text-[11px] text-center text-white/30 mt-2">{t('views.dashboard.tapToExpand', { defaultValue: 'Toque para ver detalhes' })}</p>
          </SummaryCard>
        )}
      </div>
    </div>
  )
}
