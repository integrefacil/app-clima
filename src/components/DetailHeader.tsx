import { useTranslation } from 'react-i18next'

type Props = {
  title: string
  onBack: () => void
}

export function DetailHeader({ title, onBack }: Props) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3 mb-3 view-enter">
      <button
        onClick={onBack}
        className="glass px-3 py-1.5 rounded-full text-xs md:text-sm font-medium hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 flex items-center gap-1.5"
        aria-label={t('views.detail.back', { defaultValue: 'Voltar' })}
      >
        <span aria-hidden>←</span> {t('views.detail.back', { defaultValue: 'Voltar' })}
      </button>
      <h2 className="text-sm md:text-base font-medium truncate">{title}</h2>
    </div>
  )
}
