import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Popover, ScrollArea } from 'radix-ui'
import type { GeocodeResult } from '../services/api'
import { getHistory, removeFromHistory, clearHistory, type HistoryItem } from '../services/history'
import { SearchResultsSkeleton } from './skeletons/SearchSkeleton'

type Props = {
  onSelect: (r: GeocodeResult) => void
  onSearch: (q: string) => Promise<GeocodeResult[]>
}

export function SearchBar({ onSelect, onSearch }: Props) {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [history, setHistory] = useState<HistoryItem[]>(() => getHistory())
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const timer = useRef<number | null>(null)
  const skipNextSearch = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const refreshHistory = () => setHistory(getHistory())

  useEffect(() => {
    const onUpd = () => refreshHistory()
    window.addEventListener('app-clima:history-updated', onUpd)
    window.addEventListener('storage', onUpd)
    return () => {
      window.removeEventListener('app-clima:history-updated', onUpd)
      window.removeEventListener('storage', onUpd)
    }
  }, [])

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false
      return
    }
    if (timer.current) window.clearTimeout(timer.current)
    if (q.trim().length < 3) {
      setResults([])
      return
    }
    timer.current = window.setTimeout(async () => {
      setLoading(true)
      try {
        const r = await onSearch(q)
        setResults(r)
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [q, onSearch])

  const showResults = q.trim().length >= 3 && results.length > 0
  const showHistory = focused && history.length > 0 && !showResults
  const showSkeleton = focused && loading && q.trim().length >= 3

  // aberto se focado e tiver algo para mostrar: resultados quando digitando, histórico quando vazio/parado, skeleton enquanto busca
  const isOpen = focused && (showResults || showHistory || showSkeleton)

  return (
    <Popover.Root open={isOpen} onOpenChange={(o) => { if (!o) setFocused(false) }}>
      <Popover.Anchor asChild>
        <div className="glass !rounded-full flex items-center gap-2 px-3 py-2.5 focus-within:ring-2 focus-within:ring-white/20">
          <span className="text-white grid place-items-center shrink-0" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => {
              refreshHistory()
              setFocused(true)
            }}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent outline-none placeholder:text-white/50 text-sm"
            aria-label={t('search.placeholder')}
          />
          {loading && <span className="size-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" aria-label={t('search.searching')} />}
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="start"
          className="z-30 w-[var(--radix-popper-anchor-width)] glass-strong p-2 rounded-2xl shadow-xl max-h-[380px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // não fechar ao clicar no próprio input
            if (inputRef.current && e.target instanceof Node && inputRef.current.contains(e.target)) {
              e.preventDefault()
            }
          }}
        >
          <ScrollArea.Root className="overflow-hidden">
            <ScrollArea.Viewport className="max-h-80 w-full">
              <div className="flex flex-col gap-1">
                {showSkeleton && <SearchResultsSkeleton />}

                {showResults &&
                  results.map((r) => (
                    <button
                      key={r.place_id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        skipNextSearch.current = true
                        onSelect(r)
                        setResults([])
                        setQ(r.display_name.split(',').slice(0, 2).join(','))
                        setFocused(false)
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-white/10 focus:bg-white/15 focus:outline-none rounded-xl text-sm transition-colors"
                    >
                      <span className="block font-medium truncate">{r.display_name.split(',').slice(0, 3).join(',')}</span>
                      <span className="block text-xs text-white/50 truncate">{r.display_name}</span>
                    </button>
                  ))}

                {showHistory && (
                  <>
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-xs uppercase tracking-widest text-white/40">{t('search.recent')}</span>
                      <button onMouseDown={(e) => e.preventDefault()} onClick={() => clearHistory()} className="text-xs text-white/40 hover:text-white/70 px-2 py-1 rounded-full hover:bg-white/5">
                        {t('search.clear') ?? 'Limpar'}
                      </button>
                    </div>
                    {history.map((h) => (
                      <div key={h.place_id} className="group flex items-center gap-1 hover:bg-white/10 rounded-xl transition-colors">
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            skipNextSearch.current = true
                            onSelect(h)
                            setQ(h.display_name.split(',').slice(0, 2).join(','))
                            setResults([])
                            setFocused(false)
                          }}
                          className="flex-1 text-left px-3 py-2.5 focus:outline-none rounded-xl text-sm"
                        >
                          <span className="flex items-center gap-1.5 font-medium truncate">
                            <span className="text-white/40 text-xs">🕘</span>
                            {h.display_name.split(',').slice(0, 3).join(',')}
                          </span>
                          <span className="block text-xs text-white/50 truncate pl-5">{h.display_name}</span>
                        </button>
                        <button
                          aria-label="Remover"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromHistory(h.place_id)
                          }}
                          className="mr-1 p-1.5 rounded-full hover:bg-white/10 text-white/30 hover:text-white/60"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              orientation="vertical"
              className="flex w-2.5 select-none touch-none p-[2px] bg-white/[0.07] rounded-full cursor-pointer hover:bg-white/[0.10] transition-colors"
            >
              <ScrollArea.Thumb className="flex-1 bg-white/30 rounded-full hover:bg-white/45 active:bg-white/55 cursor-pointer transition-colors" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </Popover.Content>
      </Popover.Portal>

      {q.length >= 3 && !loading && results.length === 0 && !showHistory && (
        <p className="text-xs text-white/60 mt-2 px-2">{t('search.noResults')}</p>
      )}
    </Popover.Root>
  )
}
