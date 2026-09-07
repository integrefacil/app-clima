import { useTranslation } from 'react-i18next'
import { DailyList } from '../../components/DailyList'
import { DetailHeader } from '../../components/DetailHeader'
import type { Day } from '../../types/weather'

type Props = {
  days: Day[]
  onBack: () => void
}

export function DailyDetail({ days, onBack }: Props) {
  const { t } = useTranslation()
  return (
    <div className="space-y-3 view-enter">
      <DetailHeader title={t('daily.title')} onBack={onBack} />
      <DailyList days={days} />
    </div>
  )
}
