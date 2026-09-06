import { get, set, del } from 'idb-keyval'

type Cached<T> = { data: T; ts: number }

const TTL = {
  geocode: 1000 * 60 * 60 * 24 * 7, // 7 dias
  forecast: 1000 * 60 * 30, // 30 min
  marine: 1000 * 60 * 60, // 1h
} as const

export type CacheKey = `geocode:${string}` | `forecast:${string}` | `marine:${string}`

export async function getCached<T>(key: CacheKey, ttl: number): Promise<{ data: T; stale: boolean } | null> {
  const entry = (await get(key)) as Cached<T> | undefined
  if (!entry) return null
  const age = Date.now() - entry.ts
  if (age > ttl) return { data: entry.data, stale: true }
  return { data: entry.data, stale: false }
}

export async function setCached<T>(key: CacheKey, data: T) {
  await set(key, { data, ts: Date.now() } as Cached<T>)
}

export async function clearCache(key: CacheKey) {
  await del(key)
}

export async function fetchWithCache<T>(key: CacheKey, ttl: number, fetcher: () => Promise<T>): Promise<{ data: T; fromCache: boolean; stale: boolean }> {
  const cached = await getCached<T>(key, ttl)
  // stale-while-revalidate: retorna cache mesmo stale, mas tenta atualizar em background
  if (cached && !cached.stale) {
    return { data: cached.data, fromCache: true, stale: false }
  }
  try {
    const fresh = await fetcher()
    await setCached(key, fresh)
    return { data: fresh, fromCache: false, stale: false }
  } catch (e) {
    if (cached) return { data: cached.data, fromCache: true, stale: true }
    throw e
  }
}

export { TTL }
