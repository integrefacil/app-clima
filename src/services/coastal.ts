import type { MarineResponse } from './api'

// fonte da verdade para litoral vs interior
// hoje usa proxy marine: se API marine retornou wave_height, é litoral
export function isCoastalByMarine(marine: MarineResponse | null): boolean {
  return marine !== null && marine.current?.wave_height != null
}

// chave para cache de decisão costeira (TTL 7 dias)
export function coastalCacheKey(lat: number, lon: number): `coastal:${string}` {
  return `coastal:${lat.toFixed(2)},${lon.toFixed(2)}` as const
}
