// fase lunar — cálculo local (sem API), precisão ~1 dia
// referência: lunação 29.53058867 dias, lua nova base 2000-01-06 18:14 UTC (JD 2451550.1)
const SYNODIC = 29.53058867
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0)

export type MoonInfo = {
  phase: number // 0..1 (0 = nova, 0.5 = cheia)
  age: number // dias na lunação
  illumination: number // 0..1
  fraction: number // alias phase
}

export function getMoonInfo(date: Date = new Date()): MoonInfo {
  const diff = date.getTime() - KNOWN_NEW_MOON
  const days = diff / 86400000
  let phase = (days % SYNODIC) / SYNODIC
  if (phase < 0) phase += 1
  const age = phase * SYNODIC
  // iluminação aproximada: (1 - cos(2π phase))/2
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2
  return { phase, age, illumination, fraction: phase }
}

// chave de tradução para 8 fases principais
export function moonPhaseKey(phase: number): string {
  // 8 setores de 0.125 cada, centrado na fase
  if (phase < 0.0625 || phase >= 0.9375) return 'moon.new'
  if (phase < 0.1875) return 'moon.waxingCrescent'
  if (phase < 0.3125) return 'moon.firstQuarter'
  if (phase < 0.4375) return 'moon.waxingGibbous'
  if (phase < 0.5625) return 'moon.full'
  if (phase < 0.6875) return 'moon.waningGibbous'
  if (phase < 0.8125) return 'moon.lastQuarter'
  return 'moon.waningCrescent'
}

export function moonPhaseLabelKey(phase: number): string {
  return moonPhaseKey(phase)
}
