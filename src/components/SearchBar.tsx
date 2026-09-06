import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Popover, ScrollArea } from 'radix-ui'
import type { GeocodeResult } from '../services/api'

type Props = {
  onSelect: (r: GeocodeResult) => void
  onSearch: (q: string) => Promise<GeocodeResult[]>
}

export function SearchBar({ onSelect, onSearch }: Props) {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    if (q.trim().length < 3) {
      setResults([])
      setOpen(false)
      return
    }
    timer.current = window.setTimeout(async () => {
      setLoading(true)
      try {
        const r = await onSearch(q)
        setResults(r)
        setOpen(r.length > 0)
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [q, onSearch])

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div className="glass flex items-center gap-2 px-3 py-2.5 focus-within:ring-2 focus-within:ring-white/20">
          <span className="text-white/60 text-sm" aria-hidden>
            🔍
          </span>
          <Popover.Trigger asChild>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent outline-none placeholder:text-white/50 text-sm"
              aria-label={t('search.placeholder')}
            />
          </Popover.Trigger>
          {loading && <span className="text-xs text-white/60">{t('search.searching')}</span>}
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="start"
          className="z-30 w-[var(--radix-popover-trigger-width)] glass-strong p-2 rounded-2xl shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out max-h-[320px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ScrollArea.Root className="overflow-hidden">
            <ScrollArea.Viewport className="max-h-64 w-full">
              <div className="flex flex-col gap-1">
                {results.map((r) => (
                  <button
                    key={r.place_id}
                    onClick={() => {
                      onSelect(r)
                      setResults([])
                      setOpen(false)
                      setQ(r.display_name.split(',').slice(0, 2).join(','))
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-white/10 focus:bg-white/15 focus:outline-none rounded-xl text-sm transition-colors"
                  >
                    <span className="block font-medium truncate">{r.display_name.split(',').slice(0, 3).join(',')}</span>
                    <span className="block text-xs text-white/50 truncate">{r.display_name}</span>
                  </button>
                ))}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical" className="w-1.5 bg-white/5 rounded-full">
              <ScrollArea.Thumb className="bg-white/20 rounded-full" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </Popover.Content>
      </Popover.Portal>

      {q.length >= 3 && !loading && results.length === 0 && open === false && q.trim().length >= 3 && (
        <p className="text-xs text-white/60 mt-2 px-2">{t('search.noResults')}</p>
      )}
    </Popover.Root>
  )
}
