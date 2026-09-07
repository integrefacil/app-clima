import { useCallback, useEffect, useState } from 'react'

export type HashTab = 'forecast' | 'marine'
export type HashScreen =
  | 'dashboard'
  | 'hourly'
  | 'daily'
  | 'sun'
  | 'hero'
  | 'marine-full'

export type HashView = {
  tab: HashTab
  screen: HashScreen
}

const DEFAULT_VIEW: HashView = { tab: 'forecast', screen: 'dashboard' }

function parseHash(raw: string): HashView {
  // raw é location.hash sem '#'
  const h = raw.replace(/^#\/?/, '').replace(/^#/, '').trim()
  if (!h) return DEFAULT_VIEW
  // normaliza: "clima", "clima/horas", "forecast/hourly", "marine", etc.
  const parts = h.split('/').filter(Boolean).map((p) => p.toLowerCase())
  const first = parts[0]
  const second = parts[1]

  // tab
  let tab: HashTab = 'forecast'
  if (['mar', 'marine', 'sea'].includes(first)) tab = 'marine'
  else if (['clima', 'forecast', 'weather'].includes(first)) tab = 'forecast'
  else {
    // hash legado tipo "#forecast" sem prefixo clima
    if (['horas', 'hourly', 'dias', 'daily', 'sol', 'sun'].includes(first)) {
      tab = 'forecast'
    }
  }

  // screen
  let screen: HashScreen = 'dashboard'
  // quando tab marine, second pode ser "completo/full"
  if (tab === 'marine') {
    if (['completo', 'full', 'detalhe', 'detail'].includes(second ?? '')) screen = 'marine-full'
    else if (['completo', 'full'].includes(first)) screen = 'marine-full'
    else screen = 'dashboard'
    return { tab, screen }
  }

  // forecast screens
  const key = second ?? (['clima', 'forecast'].includes(first) ? undefined : first)
  if (!key) return { tab, screen: 'dashboard' }
  if (['horas', 'hourly', 'hours'].includes(key)) screen = 'hourly'
  else if (['dias', 'daily', 'days'].includes(key)) screen = 'daily'
  else if (['sol', 'sun', 'sunset'].includes(key)) screen = 'sun'
  else if (['hero', 'cidade', 'city'].includes(key)) screen = 'hero'
  else if (['completo', 'full', 'marine-full'].includes(key)) screen = 'marine-full'
  else screen = 'dashboard'

  return { tab, screen }
}

function viewToHash(v: HashView): string {
  if (v.tab === 'marine') {
    if (v.screen === 'marine-full') return '#/mar/completo'
    return '#/mar'
  }
  // forecast — sem abas, marine-full agora é #/clima/completo
  if (v.screen === 'dashboard') return '#/clima'
  if (v.screen === 'hourly') return '#/clima/horas'
  if (v.screen === 'daily') return '#/clima/dias'
  if (v.screen === 'sun') return '#/clima/sol'
  if (v.screen === 'hero') return '#/clima/hero'
  if (v.screen === 'marine-full') return '#/clima/completo'
  return '#/clima'
}

export function useHashView() {
  const [view, setView] = useState<HashView>(() => {
    if (typeof window === 'undefined') return DEFAULT_VIEW
    const parsed = parseHash(window.location.hash)
    // se hash vazio, inicializa com #/clima sem push extra no historico
    if (!window.location.hash) {
      // usa replace para não poluir back
      window.location.replace(viewToHash(parsed))
    }
    return parsed
  })

  useEffect(() => {
    const onHashChange = () => {
      setView(parseHash(window.location.hash))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((next: HashView | string) => {
    const hash = typeof next === 'string' ? next : viewToHash(next)
    if (window.location.hash !== hash) {
      window.location.hash = hash
    }
  }, [])

  const navigateTab = useCallback((tab: HashTab) => {
    navigate({ tab, screen: 'dashboard' })
  }, [navigate])

  const backToDashboard = useCallback(() => {
    // tenta history.back se veio de detail, senão vai para dashboard do tab atual
    const current = parseHash(window.location.hash)
    if (current.screen !== 'dashboard') {
      if (window.history.length > 1) {
        window.history.back()
        // fallback se hash não mudou em 300ms (ex.: entrada direta no detail)
        setTimeout(() => {
          const now = parseHash(window.location.hash)
          if (now.screen !== 'dashboard') {
            navigate({ tab: now.tab, screen: 'dashboard' })
          }
        }, 350)
      } else {
        navigate({ tab: current.tab, screen: 'dashboard' })
      }
    }
  }, [navigate])

  return { view, navigate, navigateTab, backToDashboard, viewToHash, parseHash }
}
