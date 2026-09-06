import type { GeocodeResult } from './api'

const KEY = 'app-clima:history:search'
const MAX = 8

export type HistoryItem = GeocodeResult & { searchedAt: string }

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HistoryItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addToHistory(item: GeocodeResult) {
  try {
    const cur = getHistory()
    const filtered = cur.filter((h) => h.place_id !== item.place_id)
    const entry: HistoryItem = { ...item, searchedAt: new Date().toISOString() }
    const next = [entry, ...filtered].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
    // dispara evento para SearchBar atualizar sem reload
    window.dispatchEvent(new CustomEvent('app-clima:history-updated'))
  } catch {
    // ignore
  }
}

export function removeFromHistory(placeId: number) {
  try {
    const cur = getHistory()
    const next = cur.filter((h) => h.place_id !== placeId)
    localStorage.setItem(KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('app-clima:history-updated'))
  } catch {}
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY)
    window.dispatchEvent(new CustomEvent('app-clima:history-updated'))
  } catch {}
}
