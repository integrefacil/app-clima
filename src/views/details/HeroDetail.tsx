import { DailyList } from '../../components/DailyList'
import { DetailHeader } from '../../components/DetailHeader'
import { HeaderHero } from '../../components/HeaderHero'
import { HourlyStrip } from '../../components/HourlyStrip'
import type { Day, Hour } from '../../types/weather'

type Props = {
  location: string
  temp: number
  code: number
  max: number
  min: number
  hours: Hour[]
  days: Day[]
  feelsLike?: { value: string } | null
  humidity?: string | null
  windLabel?: string | null
  uvLabel?: string | null
  isDay?: boolean | null
  onBack: () => void
}

export function HeroDetail({ location, temp, code, max, min, hours, days, feelsLike, humidity, windLabel, uvLabel, isDay, onBack }: Props) {
  return (
    <div className="space-y-3 view-enter">
      <DetailHeader title={location} onBack={onBack} />
      <div className="glass-strong overflow-hidden">
        <HeaderHero location={location} temp={temp} conditionCode={code} max={max} min={min} feelsLike={feelsLike ?? null} humidity={humidity ?? null} wind={windLabel ?? null} uvLabel={uvLabel ?? null} isDay={isDay ?? undefined} />
      </div>
      {/* detalhes exigidos: próximas horas + próximos dias — sem reduzir info */}
      <HourlyStrip hours={hours} />
      <DailyList days={days} />
    </div>
  )
}
