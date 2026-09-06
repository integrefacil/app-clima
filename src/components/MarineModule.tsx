import { useTranslation } from 'react-i18next'

type Props = {
  waveHeight: number | null
  wavePeriod: number | null
  waveDirection: number | null
  isBeach: boolean
}

export function MarineModule({ waveHeight, wavePeriod, waveDirection, isBeach }: Props) {
  const { t } = useTranslation()
  if (!isBeach) {
    return (
      <div className="glass p-4">
        <p className="text-xs uppercase tracking-widest text-white/60">{t('marine.title')}</p>
        <p className="text-sm text-white/60 mt-2">{t('marine.noData')}</p>
      </div>
    )
  }
  return (
    <div className="glass p-4">
      <p className="text-xs uppercase tracking-widest text-white/60 mb-3">🌊 {t('marine.title')}</p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-white/60">{t('marine.waveHeight')}</p>
          <p className="text-lg font-medium">{waveHeight != null ? `${waveHeight.toFixed(1)} m` : '--'}</p>
        </div>
        <div>
          <p className="text-xs text-white/60">{t('marine.wavePeriod')}</p>
          <p className="text-lg font-medium">{wavePeriod != null ? `${wavePeriod.toFixed(1)} s` : '--'}</p>
        </div>
        <div>
          <p className="text-xs text-white/60">{t('marine.waveDirection')}</p>
          <p className="text-lg font-medium">{waveDirection != null ? `${Math.round(waveDirection)}°` : '--'}</p>
        </div>
      </div>
    </div>
  )
}
