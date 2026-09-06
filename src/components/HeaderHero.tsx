import { useTranslation } from 'react-i18next'
import { wmoIcon } from '../lib/wmo'

type Props = {
  location: string
  temp: number
  conditionCode: number
  max: number
  min: number
}

export function HeaderHero({ location, temp, conditionCode, max, min }: Props) {
  const { t, i18n } = useTranslation()
  const condition = t(`weather.${conditionCode}` as never, { defaultValue: String(conditionCode) })

  // mantém lang do html sincronizado
  if (typeof document !== 'undefined') document.documentElement.lang = i18n.language

  return (
    <div className="text-center py-6 px-4 md:py-8 lg:py-10 md:text-left lg:flex lg:items-center lg:justify-between lg:gap-6">
      <div className="lg:flex-1">
        <h1 className="text-2xl font-medium tracking-tight md:text-3xl lg:text-4xl">{location}</h1>
        <p className="text-white/90 font-medium mt-1 md:text-lg">{condition}</p>
        <p className="text-sm text-white/70 mt-1 md:text-base max-w-xl mx-auto lg:mx-0">
          {t('header.description', { max: Math.round(max), max2: Math.round(max + 2), min: Math.round(min), min2: Math.round(min + 2) })}
        </p>
        <p className="text-xs text-white/60 mt-1 md:text-sm">
          {t('header.high')} {Math.round(max)}° • {t('header.low')} {Math.round(min)}°
        </p>
      </div>
      <div className="text-[72px] font-thin leading-none mt-4 lg:mt-0 flex justify-center lg:justify-end gap-2 md:text-[84px] lg:text-[96px] shrink-0">
        {Math.round(temp)}° <span className="text-3xl mt-4 md:text-4xl lg:text-5xl">{wmoIcon(conditionCode)}</span>
      </div>
    </div>
  )
}
