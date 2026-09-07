import { useTranslation } from 'react-i18next'
import { wmoIcon } from '../lib/wmo'
import type { Hour } from '../types/weather'

type Props = {
  hours: Hour[]
  onClick?: () => void
}

export function HourlyPreviewCard({ hours, onClick }: Props) {
  const { t } = useTranslation()
  // exibe Agora + próximas 6 horas = 7 itens (fiel à solicitação "próximas 6 horas")
  const visible = hours.slice(0, 7)

  const content = (
    <>
      <p className="text-xs md:text-sm text-white/60 uppercase tracking-widest px-3 md:px-4 pt-3">
        {t('hourly.title')}
      </p>
      <div className="px-2 md:px-3 pb-3 pt-3">
        {/* horizontal strip — scroll suave em mobile, sem scrollbar agressiva */}
        <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1">
          {visible.map((h, i) => (
            <div
              key={i}
              className="flex flex-col items-center min-w-[56px] md:min-w-[64px] shrink-0"
            >
              <span className="text-[11px] md:text-xs text-white/60 leading-none">
                {i === 0 ? t('hourly.now') : h.time}
              </span>
              <span className="text-xl md:text-2xl my-1.5 leading-none" aria-hidden>
                {wmoIcon(h.code, h.isDay ?? true)}
              </span>
              <span className="text-sm md:text-base font-medium leading-none">
                {Math.round(h.temp)}°
              </span>
              {/* ponto sutil igual da imagem — indica precipitação quando houver */}
              <span
                className={`text-[9px] leading-none mt-1.5 ${h.precip != null && h.precip > 30 ? 'text-sky-200' : 'text-white/25'}`}
                aria-hidden
              >
                •
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  if (!onClick) {
    return <div className="glass overflow-hidden">{content}</div>
  }

  return (
    <button
      onClick={onClick}
      aria-label={t('views.dashboard.hourlyAria', { defaultValue: 'Ver próximas horas completo' })}
      className="glass overflow-hidden w-full text-left hover:bg-white/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-colors group"
    >
      {content}
      <span className="sr-only">{t('views.dashboard.hourlyAria')}</span>
    </button>
  )
}
