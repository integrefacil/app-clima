// helpers para posição no arco

export function progressOnArc(now: Date, riseISO: string | null | undefined, setISO: string | null | undefined): number | null {
  if (!riseISO || !setISO) return null
  const rise = new Date(riseISO).getTime()
  const set = new Date(setISO).getTime()
  const t = now.getTime()
  if (Number.isNaN(rise) || Number.isNaN(set) || set <= rise) return null
  if (t <= rise) return 0
  if (t >= set) return 1
  return (t - rise) / (set - rise)
}

// arco: centro (100,92) raio 80, viewBox 0 0 200 112 — cy 92 deixa 12px de topo para glow não cortar
// progress 0 = nascer (esquerda 20,92), 1 = pôr (direita 180,92), 0.5 = topo (100,12)
export function arcPoint(progress: number, cx = 100, cy = 92, r = 80): { x: number; y: number } {
  const p = Math.max(0, Math.min(1, progress))
  const angle = Math.PI * (1 - p) // 0 -> pi, 1 -> 0
  return {
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  }
}

export function isDayNow(now: Date, sunriseISO: string | null | undefined, sunsetISO: string | null | undefined): boolean {
  const p = progressOnArc(now, sunriseISO, sunsetISO)
  if (p == null) {
    // fallback por hora local 6-18
    const h = now.getHours() + now.getMinutes() / 60
    return h >= 6 && h < 18
  }
  return p > 0 && p < 1
}
