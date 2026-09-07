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
        type="button"
        onClick={onBack}
        className="grid place-items-center size-10 rounded-full shrink-0 bg-white/10 backdrop-blur-xl border border-white/15 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        aria-label={t('views.detail.back', { defaultValue: 'Voltar' })}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18 9 12l6-6" />
        </svg>
      </button>
      <h2 className="text-sm md:text-base font-medium truncate">{title}</h2>
    </div>
  )
}
