import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DetailHeader } from '../../components/DetailHeader'
import { HeaderHero } from '../../components/HeaderHero'
import { CelestialArc } from '../../components/CelestialArc'
import { isDayNow } from '../../lib/celestial'
import { getMoonInfo, moonPhaseKey } from '../../lib/moon'

function diffDuration(sunrise: string, sunset: string) {
  try {
    const [rh, rm] = sunrise.split(':').map(Number)
    const [sh, sm] = sunset.split(':').map(Number)
    if (!Number.isNaN(rh) && !Number.isNaN(sh)) {
      const total = sh * 60 + sm - (rh * 60 + rm)
      const h = Math.floor(total / 60)
      const m = total % 60
      return `${h}h ${String(m).padStart(2, '0')}m`
    }
  } catch {}
  return ''
}

type Props = {
  location: string
  temp: number
  code: number
  max: number
  min: number
  feelsLike?: { value: string } | null
  humidity?: string | null
  windLabel?: string | null
  uvLabel?: string | null
  isDay?: boolean | null
  sunrise: string
  sunset: string
  sunriseISO?: string | null
  sunsetISO?: string | null
  moonrise?: string | null
  moonset?: string | null
  moonriseISO?: string | null
  moonsetISO?: string | null
  onBack: () => void
}

export function SunDetail({ location, temp, code, max, min, feelsLike, humidity, windLabel, uvLabel, isDay, sunrise, sunset, sunriseISO, sunsetISO, moonrise, moonset, moonriseISO, moonsetISO, onBack }: Props) {
  const { t } = useTranslation()
  const duration = diffDuration(sunrise, sunset)
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
  const autoVariant: 'sun' | 'moon' = isDayNow(now, sunriseISO, sunsetISO) ? 'sun' : 'moon'
  const [variant, setVariant] = useState<'sun' | 'moon'>(autoVariant)
  useEffect(() => setVariant(autoVariant), [autoVariant])
  const moonInfo = getMoonInfo(now)
  const isSun = variant === 'sun'

  return (
    <div className="space-y-3 view-enter">
      <DetailHeader title={isSun ? t('celestial.sunTitle') : t(moonPhaseKey(moonInfo.phase))} onBack={onBack} />

      {/* mesmo hero do dashboard — consistência visual */}
      <div className="glass-strong overflow-hidden">
        <HeaderHero location={location} temp={temp} conditionCode={code} max={max} min={min} feelsLike={feelsLike ?? null} humidity={humidity ?? null} wind={windLabel ?? null} uvLabel={uvLabel ?? null} isDay={isDay ?? undefined} />
      </div>

      {/* toggle Sol/Lua — auto por horário mas permite inspecionar o outro */}
      <div className="flex gap-1 p-1 glass w-fit">
        <button
          onClick={() => setVariant('sun')}
          className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${isSun ? 'bg-white text-sky-900' : 'text-white/60 hover:text-white'}`}
          aria-pressed={isSun}
        >
          {t('celestial.sun')}
        </button>
        <button
          onClick={() => setVariant('moon')}
          className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${!isSun ? 'bg-white text-sky-900' : 'text-white/60 hover:text-white'}`}
          aria-pressed={!isSun}
        >
          {t('celestial.moon')}
        </button>
      </div>

      <div className="glass p-4 md:p-5">
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
        />
      </div>

      <div className="glass p-4 space-y-2 text-sm">
        {isSun ? (
          <>
            {duration && (
              <div className="flex justify-between">
                <span className="text-white/60">{t('views.detail.dayLength', { defaultValue: 'Duração do dia' })}</span>
                <span className="font-medium">{duration}</span>
              </div>
            )}
            <p className="text-xs text-white/40 pt-1">{t('celestial.sunHint')}</p>
          </>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-white/60">{t('moon.phase')}</span>
              <span className="font-medium">{t(moonPhaseKey(moonInfo.phase))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">{t('moon.illumination')}</span>
              <span className="font-medium">{Math.round(moonInfo.illumination * 100)}%</span>
            </div>
            <p className="text-xs text-white/40 pt-1">{t('moon.hint')}</p>
          </>
        )}
      </div>
    </div>
  )
}
