import { useTranslation } from 'react-i18next'

export function SunsetArc({ sunrise, sunset }: { sunrise: string; sunset: string }) {
  const { t } = useTranslation()
  return (
    <div className="glass p-4 md:p-5">
      <p className="text-xs md:text-sm text-white/60 mb-3">☀️ {t('sunset.sunsetAt', { time: sunset })}</p>
      <svg viewBox="0 0 200 80" className="w-full h-20 md:h-24">
        <path d="M10 70 A 90 90 0 0 1 190 70" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <circle cx="55" cy="26" r="6" fill="#facc15" stroke="white" strokeWidth="1.5" />
        <line x1="10" y1="70" x2="190" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      </svg>
      <div className="flex justify-between text-xs md:text-sm text-white/70 mt-1">
        <span>{t('sunset.sunrise')} {sunrise}</span>
        <span>{t('sunset.sunset')} {sunset}</span>
      </div>
    </div>
  )
}
