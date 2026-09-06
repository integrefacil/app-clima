import { fmtTime } from '../lib/format'

export type TideExtremum = { time: string; height: number; type: 'high' | 'low' }

export type MarineWeekDay = {
  date: string
  waveAvg: number | null
  waveMax: number | null
  tideHigh: TideExtremum | null
  tideLow: TideExtremum | null
  tides: TideExtremum[]
  // score 0-100, maior é melhor para banho
  score: number
  bestSlot: string | null
  hourlyWave: { time: string; value: number }[]
}

export type MarineWeek = {
  days: MarineWeekDay[]
  source: 'open-meteo' | 'stormglass' | 'mock'
}

// calcula picos/vales de sea_level para estimar preamar/baixa-mar
// usa interpolação parabólica para não ficar arredondado na hora cheia
function addMinutesToIso(iso: string, minutes: number): string {
  // iso é YYYY-MM-DDTHH:00 sem timezone — trata como local
  const [datePart, timePart] = iso.split('T')
  const [hStr, mStr] = timePart.split(':')
  const total = parseInt(hStr, 10) * 60 + parseInt(mStr || '0', 10) + Math.round(minutes)
  const dayOffset = Math.floor(total / (24 * 60))
  const minsInDay = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
  const hh = String(Math.floor(minsInDay / 60)).padStart(2, '0')
  const mm = String(minsInDay % 60).padStart(2, '0')
  if (dayOffset === 0) return `${datePart}T${hh}:${mm}`
  // para offset que cruza dia, ajusta data
  const d = new Date(`${datePart}T00:00:00`)
  d.setDate(d.getDate() + dayOffset)
  const isoDate = d.toISOString().slice(0, 10)
  return `${isoDate}T${hh}:${mm}`
}

export function calcTidesFromSeaLevel(times: string[], seaLevels: number[]): TideExtremum[] {
  const tides: TideExtremum[] = []
  const n = seaLevels.length
  const push = (i: number, type: 'high' | 'low', offsetHours: number, height: number) => {
    const minutes = offsetHours * 60
    const t = addMinutesToIso(times[i], minutes)
    tides.push({ time: t, height, type })
  }

  // extremos internos com interpolação
  for (let i = 1; i < n - 1; i++) {
    const prev = seaLevels[i - 1]
    const cur = seaLevels[i]
    const next = seaLevels[i + 1]
    const isHigh = cur > prev && cur > next
    const isLow = cur < prev && cur < next
    if (!isHigh && !isLow) continue
    const denom = prev - 2 * cur + next
    let offset = 0
    let h = cur
    if (denom !== 0) {
      offset = 0.5 * (prev - next) / denom // horas, entre -0.5 e 0.5
      offset = Math.max(-0.5, Math.min(0.5, offset))
      h = cur - 0.25 * (prev - next) * offset
    }
    push(i, isHigh ? 'high' : 'low', offset, h)
  }
  // bordas — se primeiro ponto for extremo em relação ao segundo
  if (n >= 2) {
    if (seaLevels[0] > seaLevels[1]) tides.unshift({ time: times[0], height: seaLevels[0], type: 'high' })
    else if (seaLevels[0] < seaLevels[1]) tides.unshift({ time: times[0], height: seaLevels[0], type: 'low' })
    if (seaLevels[n - 1] > seaLevels[n - 2]) tides.push({ time: times[n - 1], height: seaLevels[n - 1], type: 'high' })
    else if (seaLevels[n - 1] < seaLevels[n - 2]) tides.push({ time: times[n - 1], height: seaLevels[n - 1], type: 'low' })
  }
  // ordena e filtra picos muito próximos (<3h) — mantém o mais extremo
  tides.sort((a, b) => a.time.localeCompare(b.time))
  const filtered: TideExtremum[] = []
  for (const td of tides) {
    const last = filtered[filtered.length - 1]
    if (!last) {
      filtered.push(td)
      continue
    }
    const diffMin = (new Date(td.time).getTime() - new Date(last.time).getTime()) / 60000
    if (diffMin < 180) {
      // mesmo tipo ou muito próximo — mantém o mais extremo (maior high, menor low)
      if (td.type === last.type) {
        if ((td.type === 'high' && td.height > last.height) || (td.type === 'low' && td.height < last.height)) {
          filtered[filtered.length - 1] = td
        }
      } else {
        // tipos diferentes mas muito próximos — mantém ambos se for transição rápida? ignora o menos extremo
        // prefere manter ambos se diferença > 2h, senão descarta o segundo
        if (diffMin < 120) continue
        filtered.push(td)
      }
    } else {
      filtered.push(td)
    }
  }
  return filtered
}

// score automático: combina onda + vento + precipitação + amplitude maré
export function scoreBeachDay(opts: { waveAvg: number | null; windAvg: number | null; precipSum: number | null; tideRange: number | null }): number {
  const wave = opts.waveAvg ?? 1.5
  const wind = opts.windAvg ?? 15
  const precip = opts.precipSum ?? 0
  const range = opts.tideRange ?? 1
  // penalidades
  let s = 100
  s -= Math.min(40, wave * 20) // onda 2m => -40
  s -= Math.min(20, wind * 1) // 20km/h => -20
  s -= Math.min(30, precip * 6) // 5mm => -30
  s -= Math.min(15, Math.abs(range - 1) * 8) // amplitude ideal ~1m
  if (precip > 2) s -= 10
  if (wave > 1.2) s -= 8
  return Math.max(0, Math.round(s))
}

export function buildMarineWeek(params: {
  marineHourlyTime: string[]
  marineHourlyWave: number[] | null
  marineSeaLevel: number[]
  forecastDailyTime: string[]
  forecastDailyPrecip: (number | null)[]
  forecastHourlyWind: number[] | null
  stormglassTides?: TideExtremum[]
  locale?: string
}): MarineWeek {
  const { marineHourlyTime, marineHourlyWave, marineSeaLevel, forecastDailyTime, forecastDailyPrecip, forecastHourlyWind } = params
  const tidesAll = params.stormglassTides ?? calcTidesFromSeaLevel(marineHourlyTime, marineSeaLevel)

  const days: MarineWeekDay[] = forecastDailyTime.slice(0, 7).map((dateStr) => {
    const dayPrefix = dateStr // YYYY-MM-DD
    // filtra horários do dia
    const idxHour = marineHourlyTime
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => t.startsWith(dayPrefix))
      .map(({ i }) => i)

    const waves = idxHour.map((i) => marineHourlyWave?.[i]).filter((v) => v != null) as number[]
    const waveAvg = waves.length ? waves.reduce((a, b) => a + b, 0) / waves.length : null
    const waveMax = waves.length ? Math.max(...waves) : null

    const dayTides = tidesAll.filter((td) => td.time.startsWith(dayPrefix))
    const high = dayTides.filter((t) => t.type === 'high').sort((a, b) => b.height - a.height)[0] ?? null
    const low = dayTides.filter((t) => t.type === 'low').sort((a, b) => a.height - b.height)[0] ?? null
    const tideRange = high && low ? Math.abs(high.height - low.height) : null

    // precip e vento do dia (pega do forecast daily; vento médio aproximado via primeiro horário do dia se disponível)
    const dayIdx = forecastDailyTime.indexOf(dayPrefix)
    const precipSum = forecastDailyPrecip[dayIdx] ?? 0
    const windAvg = forecastHourlyWind ? forecastHourlyWind[idxHour[0]] ?? null : null

    const score = scoreBeachDay({ waveAvg, windAvg, precipSum, tideRange })

    // melhor slot: manhã 07-11 com menor onda+vento, senão tarde 14-17
    let bestSlot: string | null = null
    if (idxHour.length) {
      const slots = [
        { label: '07:00-11:00', hours: idxHour.filter((i) => { const h = new Date(marineHourlyTime[i]).getHours(); return h >= 7 && h < 11 }) },
        { label: '14:00-17:00', hours: idxHour.filter((i) => { const h = new Date(marineHourlyTime[i]).getHours(); return h >= 14 && h < 17 }) },
      ]
      const slotScore = (ids: number[]) => {
        if (!ids.length) return Infinity
        const avg = ids.map((i) => marineHourlyWave?.[i] ?? 2).reduce((a, b) => a + b, 0) / ids.length
        return avg
      }
      const best = slots.sort((a, b) => slotScore(a.hours) - slotScore(b.hours))[0]
      if (best.hours.length) bestSlot = best.label
    }

    const hourlyWave = idxHour.slice(0, 8).map((i) => ({ time: fmtTime(marineHourlyTime[i], params.locale ?? 'pt-BR'), value: marineHourlyWave?.[i] ?? 0 }))

    return { date: dateStr, waveAvg, waveMax, tideHigh: high, tideLow: low, tides: dayTides, score, bestSlot, hourlyWave }
  })

  return { days, source: params.stormglassTides ? 'stormglass' : 'open-meteo' }
}

// mock para dev sem rede
export function mockMarineWeek(): MarineWeek {
  const base = new Date()
  const days: MarineWeekDay[] = Array.from({ length: 7 }, (_, d) => {
    const date = new Date(base); date.setDate(base.getDate() + d)
    const iso = date.toISOString().slice(0, 10)
    const waveAvg = 0.6 + Math.sin(d) * 0.3 + Math.random() * 0.2
    return {
      date: iso,
      waveAvg,
      waveMax: waveAvg + 0.4,
      tideHigh: { time: `${iso}T08:12`, height: 1.1 + d * 0.05, type: 'high' },
      tideLow: { time: `${iso}T14:40`, height: 0.3 + d * 0.02, type: 'low' },
      tides: [
        { time: `${iso}T08:12`, height: 1.1, type: 'high' },
        { time: `${iso}T14:40`, height: 0.3, type: 'low' },
        { time: `${iso}T20:05`, height: 1.0, type: 'high' },
      ],
      score: scoreBeachDay({ waveAvg, windAvg: 12, precipSum: d === 2 ? 4 : 0, tideRange: 0.8 }),
      bestSlot: d % 2 === 0 ? '07:00-11:00' : '14:00-17:00',
      hourlyWave: [],
    }
  })
  return { days: days.sort((a, b) => b.score - a.score), source: 'mock' }
}
