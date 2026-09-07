import { useTranslation } from 'react-i18next'

type Props = {
  waveHeight: number | null
  wavePeriod: number | null
  waveDirection: number | null
}

export function MarineModule({ waveHeight, wavePeriod, waveDirection, compact }: Props & { compact?: boolean }) {
  const { t, i18n } = useTranslation()
  const plainWave = (h: number | null) => {
    if (h == null) return '--'
    if (h < 0.5) return t('marine.waveSmall')
    if (h < 1.1) return t('marine.waveMedium')
    return t('marine.waveBig')
  }
  const plainPeriod = (p: number | null) => {
    if (p == null) return '--'
    if (p < 6) return i18n.language.startsWith('pt') ? 'Bem seguidas' : 'Close together'
    if (p < 10) return i18n.language.startsWith('pt') ? 'Tranquilas' : 'Gentle'
    return i18n.language.startsWith('pt') ? 'Bem espaçadas' : 'Well spaced'
  }
  const plainDir = (deg: number | null) => {
    if (deg == null) return '--'
    const dirs = i18n.language.startsWith('pt') ? ['do norte','do nordeste','do leste','do sudeste','do sul','do sudoeste','do oeste','do noroeste'] : ['from north','from northeast','from east','from southeast','from south','from southwest','from west','from northwest']
    return dirs[Math.round(((deg % 360) / 45)) % 8]
  }
  return (
    <div className={compact ? 'p-1' : 'glass p-4'}>
      {!compact && <p className="text-xs uppercase tracking-widest text-white/60 mb-3">{t('marine.title')}</p>}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-white/60">{t('marine.waveHeight')}</p>
          <p className="text-sm font-medium leading-tight">{plainWave(waveHeight)}</p>
        </div>
        <div>
          <p className="text-xs text-white/60">{t('marine.wavePeriod')}</p>
          <p className="text-sm font-medium leading-tight">{plainPeriod(wavePeriod)}</p>
        </div>
        <div>
          <p className="text-xs text-white/60">{t('marine.waveDirection')}</p>
          <p className="text-sm font-medium leading-tight">{plainDir(waveDirection)}</p>
        </div>
      </div>
    </div>
  )
}
