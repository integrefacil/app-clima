import { useTranslation } from 'react-i18next'
import { DetailHeader } from '../../components/DetailHeader'
import { HourlyStrip } from '../../components/HourlyStrip'
import type { Hour } from '../../types/weather'

type Props = {
  hours: Hour[]
  onBack: () => void
}

export function HourlyDetail({ hours, onBack }: Props) {
  const { t } = useTranslation()
  return (
    <div className="space-y-3 view-enter">
      <DetailHeader title={t('hourly.title')} onBack={onBack} />
      <HourlyStrip hours={hours} />
      <p className="text-xs text-white/40 px-1">{t('views.detail.hourlyHint', { defaultValue: 'Deslize para ver as 24 horas' })}</p>
    </div>
  )
}
