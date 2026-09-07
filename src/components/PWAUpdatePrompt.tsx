import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { registerSW } from 'virtual:pwa-register'

// Toast para PWA - exibe quando nova versão disponível (prompt) ou offline pronto
export function PWAUpdatePrompt() {
  const { t, i18n } = useTranslation()
  const isPt = i18n.language.startsWith('pt')
  const [offlineReady, setOfflineReady] = useState(false)
  const [needRefresh, setNeedRefresh] = useState(false)
  const [updateSW, setUpdateSW] = useState<((reload?: boolean) => Promise<void>) | null>(null)

  useEffect(() => {
    const update = registerSW({
      onOfflineReady() {
        setOfflineReady(true)
        // auto dismiss após 3s
        window.setTimeout(() => setOfflineReady(false), 3000)
      },
      onNeedRefresh() {
        setNeedRefresh(true)
      },
      onRegistered(r) {
        // checa atualizações a cada 60 min quando visível
        if (r) {
          window.setInterval(
            () => {
              if (document.visibilityState === 'visible') r.update().catch(() => {})
            },
            60 * 60 * 1000,
          )
        }
      },
    })
    setUpdateSW(() => update)
  }, [])

  const visible = offlineReady || needRefresh
  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
    >
      <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-tight">
            {needRefresh
              ? isPt
                ? 'Nova versão disponível'
                : 'New version available'
              : isPt
                ? 'App pronto para uso offline'
                : 'App ready for offline use'}
          </p>
          <p className="text-xs text-white/70 leading-tight mt-0.5">
            {needRefresh
              ? isPt
                ? 'Atualize para ver as novidades'
                : 'Update to get the latest'
              : isPt
                ? 'Você pode usar sem internet'
                : 'You can use it offline'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {needRefresh ? (
            <>
              <button
                onClick={() => setNeedRefresh(false)}
                className="text-xs text-white/70 hover:text-white px-2 py-1.5"
              >
                {t('common.close') ?? (isPt ? 'Depois' : 'Later')}
              </button>
              <button
                onClick={() => updateSW?.(true)}
                className="bg-white text-sky-900 text-xs font-semibold px-3.5 py-2 rounded-full hover:bg-white/90 transition-colors"
              >
                {isPt ? 'Atualizar' : 'Update'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setOfflineReady(false)}
              className="bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white/25"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
