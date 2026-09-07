import { useTranslation } from 'react-i18next'
import { wmoIcon } from '../lib/wmo'

type Props = {
  location: string
  temp: number
  conditionCode: number
  max: number
  min: number
  feelsLike?: { value: string } | null
  humidity?: string | null
  wind?: string | null
  uvLabel?: string | null
  isDay?: boolean | null
}

export function HeaderHero({ location, temp, conditionCode, max, min, feelsLike, humidity, wind, uvLabel, isDay }: Props) {
  const { t, i18n } = useTranslation()
  const condition = t(`weather.${conditionCode}` as never, { defaultValue: String(conditionCode) })

  // mantém lang do html sincronizado
  if (typeof document !== 'undefined') document.documentElement.lang = i18n.language

  const hour = new Date().getHours()
  const walkLine =
    hour >= 6 && hour < 12
      ? t('sport.heroLineDay')
      : hour >= 12 && hour < 18
        ? t('sport.heroLineAfternoon')
        : t('sport.heroLineNight')

  return (
    <div className="text-center py-6 px-4 md:py-8 lg:py-10 md:text-left lg:flex lg:items-center lg:justify-between lg:gap-6">
      <div className="lg:flex-1">
        <h1 className="text-2xl font-medium tracking-tight md:text-3xl lg:text-4xl">{location}</h1>
        <p className="text-white/90 font-medium mt-1 md:text-lg">{condition}</p>
        <p className="text-sm text-white/70 mt-1 md:text-base max-w-xl mx-auto lg:mx-0">
          {t('header.description', { max: Math.round(max), max2: Math.round(max + 2), min: Math.round(min), min2: Math.round(min + 2) })}
        </p>
        <p className="text-xs md:text-sm text-white/80 mt-1.5 font-medium tracking-wide">{walkLine}</p>
      </div>
      <div className="mt-4 lg:mt-0 shrink-0 flex flex-col items-center lg:items-end">
        <div className="text-[72px] font-thin leading-none flex justify-center lg:justify-end gap-2 md:text-[84px] lg:text-[96px]">
          {Math.round(temp)}° <span className="text-3xl mt-4 md:text-4xl lg:text-5xl">{wmoIcon(conditionCode, isDay ?? true)}</span>
        </div>
        {(feelsLike || uvLabel) && (
          <p className="text-xs md:text-sm text-white/80 mt-1.5 font-medium tracking-wide text-center lg:text-right">
            {feelsLike && `${t('metrics.feelsLike')} ${feelsLike.value}`}
            {feelsLike && uvLabel && ' • '}
            {uvLabel && `${t('metrics.uv')} ${uvLabel}`}
          </p>
        )}
        {(humidity || wind) && (
          <p className="text-xs md:text-sm text-white/80 mt-1 font-medium tracking-wide text-center lg:text-right leading-relaxed">
            {humidity && `${t('metrics.humidity')} ${humidity}`}
            {humidity && wind && ' • '}
            {wind && `${t('metrics.wind')} ${wind}`}
          </p>
        )}
      </div>
    </div>
  )
}
