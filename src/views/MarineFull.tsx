import { useTranslation } from 'react-i18next'
import { Separator } from 'radix-ui'
import { DetailHeader } from '../components/DetailHeader'
import { MarineModule } from '../components/MarineModule'
import { MarineWeekList } from '../components/MarineWeekList'
import type { MarineWeek } from '../services/marineWeek'

type Props = {
  marine: { wave_height: number | null; wave_direction: number | null; wave_period: number | null } | null
  week: MarineWeek
  onBack: () => void
}

export function MarineFull({ marine, week, onBack }: Props) {
  const { t, i18n } = useTranslation()
  return (
    <div className="space-y-4 view-enter">
      <DetailHeader title={t('marine.title')} onBack={onBack} />
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
          <Separator.Root className="h-px bg-white/10" />
          <p>{marine?.wave_height != null ? (marine.wave_height < 0.5 ? t('marine.waveSmall') : marine.wave_height < 1.1 ? t('marine.waveMedium') : t('marine.waveBig')) : '--'}</p>
          <p className="text-[11px] text-white/40">{t('marine.disclaimer')}</p>
        </div>
      </div>
      <MarineWeekList days={week.days} source={week.source} />
    </div>
  )
}
