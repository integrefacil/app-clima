import { useTranslation } from 'react-i18next'
import { DetailHeader } from '../components/DetailHeader'
import { HeaderHero } from '../components/HeaderHero'
import { MarineWeekList } from '../components/MarineWeekList'
import type { MarineWeek } from '../services/marineWeek'

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
  marine: { wave_height: number | null; wave_direction: number | null; wave_period: number | null } | null
  week: MarineWeek
  onBack: () => void
}

export function MarineFull({ location, temp, code, max, min, feelsLike, humidity, windLabel, uvLabel, isDay, week, onBack }: Props) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4 view-enter">
      <DetailHeader title={t('marine.title')} onBack={onBack} />

      {/* mesmo hero do dashboard — consistência visual */}
      <div className="glass-strong overflow-hidden">
        <HeaderHero location={location} temp={temp} conditionCode={code} max={max} min={min} feelsLike={feelsLike ?? null} humidity={humidity ?? null} wind={windLabel ?? null} uvLabel={uvLabel ?? null} isDay={isDay ?? undefined} />
      </div>
      <MarineWeekList days={week.days} source={week.source} />
    </div>
  )
}
