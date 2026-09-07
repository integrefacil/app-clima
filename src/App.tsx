import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, Separator, ToggleGroup } from 'radix-ui'
import { SearchBar } from './components/SearchBar'
import { fetchForecast, fetchMarineWithTides, searchLocation, type GeocodeResult } from './services/api'
import { buildMarineWeek, mockMarineWeek } from './services/marineWeek'
import { coastalCacheKey, isCoastalByMarine } from './services/coastal'
import { getCached, setCached, TTL } from './services/cache'
import { fmtTime, fmtWeekdayLong } from './lib/format'
import { isDayNow } from './lib/celestial'
import { addToHistory } from './services/history'
import { useHashView } from './hooks/useHashView'
import { ForecastDashboard } from './views/ForecastDashboard'
import { SunDetail } from './views/details/SunDetail'
import { HeroDetail } from './views/details/HeroDetail'
import { MarineFull } from './views/MarineFull'

type LocationState = { name: string; lat: number; lon: number }

const MOCK_DAILY = [
  { label: 'Hoje', code: 2, max: 29, min: 24, precip: 10 },
  { label: 'Amanhã', code: 3, max: 29, min: 23, precip: 20 },
  { label: 'quarta', code: 1, max: 29, min: 23, precip: 10 },
  { label: 'quinta', code: 2, max: 29, min: 24, precip: 5 },
  { label: 'sexta', code: 3, max: 29, min: 24, precip: 0 },
  { label: 'sábado', code: 1, max: 29, min: 24, precip: 0 },
  { label: 'domingo', code: 0, max: 29, min: 24, precip: 0 },
]

export default function App() {
  const { t, i18n } = useTranslation()
  const { view, navigate, backToDashboard } = useHashView()
  const [loc, setLoc] = useState<LocationState>(() => {
    try {
      const raw = localStorage.getItem('app-clima:last-location')
      if (raw) return JSON.parse(raw) as LocationState
    } catch {}
    return { name: 'Jordão, Recife', lat: -8.09, lon: -34.9 }
  })
  const [forecast, setForecast] = useState<null | Awaited<ReturnType<typeof fetchForecast>>>(null)
  const [marine, setMarine] = useState<null | Awaited<ReturnType<typeof fetchMarineWithTides>>['marine']>(null)
  const [stormglassTides, setStormglassTides] = useState<null | Awaited<ReturnType<typeof fetchMarineWithTides>>['tides']>(null)
  const [marineLoading, setMarineLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [fromCache, setFromCache] = useState(false)

  const locale = i18n.language

  // tick vivo para virar ícone dia/noite no pôr do sol sem esperar próximo fetch
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    const onVis = () => { if (document.visibilityState === 'visible') setNow(new Date()) }
    document.addEventListener('visibilitychange', onVis)
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  // derivado 100% auto: litoral se marine retornou dados
  const isBeach = useMemo(() => isCoastalByMarine(marine), [marine])

  const load = useCallback(async (latitude: number, longitude: number) => {
    setMarineLoading(true)
    try {
      const fc = await fetchForecast(latitude, longitude)
      setForecast(fc)
      setUpdatedAt(new Date())
      setFromCache(false)
      // otimização: se já sabemos que é interior (cache coastal false), pula fetch marine
      const cKey = coastalCacheKey(latitude, longitude)
      const cachedCoastal = await getCached<boolean>(cKey, TTL.coastal)
      let mr: Awaited<ReturnType<typeof fetchMarineWithTides>>['marine'] = null
      let tides: Awaited<ReturnType<typeof fetchMarineWithTides>>['tides'] = null
      if (cachedCoastal && !cachedCoastal.stale && cachedCoastal.data === false) {
        mr = null
        tides = null
      } else {
        const res = await fetchMarineWithTides(latitude, longitude)
        mr = res.marine
        tides = res.tides
        // persiste decisão para próximas cargas (evita fetch marine em interior)
        try {
          await setCached(cKey, isCoastalByMarine(mr))
        } catch {}
      }
      setMarine(mr)
      setStormglassTides(tides)
    } catch {
      setFromCache(true)
    } finally {
      setMarineLoading(false)
    }
  }, [])

  useEffect(() => {
    load(loc.lat, loc.lon)
  }, [loc.lat, loc.lon, load])

  // compat: se URL antiga #/mar e agora sem abas, redireciona
  useEffect(() => {
    if (!marineLoading && !isBeach && view.tab === 'marine') {
      navigate({ tab: 'forecast', screen: 'dashboard' })
    }
    if (view.tab === 'marine' && view.screen === 'dashboard') {
      navigate({ tab: 'forecast', screen: 'dashboard' })
    }
  }, [isBeach, marineLoading, view, navigate])

  const onSelect = (r: GeocodeResult) => {
    const next = { name: r.display_name.split(',').slice(0, 3).join(','), lat: parseFloat(r.lat), lon: parseFloat(r.lon) }
    setLoc(next)
    try {
      localStorage.setItem('app-clima:last-location', JSON.stringify(next))
    } catch {}
    addToHistory(r)
  }

  const onSearchCb = useCallback((q: string) => searchLocation(q), [])

  const hourly = useMemo(() => {
    if (!forecast) {
      // mock relativo à hora atual (não sequencial 07h fixo)
      const base = new Date()
      base.setMinutes(0, 0, 0)
      return Array.from({ length: 24 }, (_, i) => {
        const d = new Date(base.getTime() + i * 3600_000)
        return {
          time: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d).replace(':00', ''),
          temp: 27 + Math.sin(i / 3) * 2,
          code: i < 4 ? 3 : i < 8 ? 2 : 1,
          precip: i % 5 === 0 ? 10 : 0,
        }
      }) as { time: string; temp: number; code: number; precip?: number; isDay?: boolean }[]
    }
    // helper para isDay por hora usando sunrise/sunset do dia correspondente
    const sunriseByDate = new Map<string, string>()
    const sunsetByDate = new Map<string, string>()
    forecast.daily.time.forEach((d, idx) => {
      sunriseByDate.set(d, forecast.daily.sunrise[idx])
      sunsetByDate.set(d, forecast.daily.sunset[idx])
    })
    // encontra índice da hora atual (arredonda para baixo) para exibir próximas 24h reais
    const nowHour = new Date(now)
    nowHour.setMinutes(0, 0, 0)
    nowHour.setSeconds(0, 0)
    let startIdx = forecast.hourly.time.findIndex((t) => new Date(t).getTime() >= nowHour.getTime())
    if (startIdx === -1) startIdx = 0
    // garante 24 entradas mesmo perto do fim do array
    const endIdx = Math.min(startIdx + 24, forecast.hourly.time.length)
    // se faltar horas (fim do forecast), ajusta início para trás
    if (endIdx - startIdx < 24) startIdx = Math.max(0, endIdx - 24)
    return forecast.hourly.time.slice(startIdx, startIdx + 24).map((time, offset) => {
      const i = startIdx + offset
      const dateKey = time.slice(0, 10)
      const sr = sunriseByDate.get(dateKey) ?? forecast.daily.sunrise[0]
      const ss = sunsetByDate.get(dateKey) ?? forecast.daily.sunset[0]
      const isDayHour = isDayNow(new Date(time), sr, ss)
      return {
        time: fmtTime(time, locale).replace(':00', ''),
        temp: forecast.hourly.temperature_2m[i],
        code: forecast.hourly.weather_code[i],
        precip: forecast.hourly.precipitation_probability?.[i],
        isDay: isDayHour,
      }
    })
  }, [forecast, locale, now])

  const daily = useMemo(() => {
    if (!forecast) return MOCK_DAILY
    return forecast.daily.time.slice(0, 7).map((time, i) => {
      const label =
        i === 0
          ? t('daily.today')
          : i === 1
            ? t('daily.tomorrow')
            : fmtWeekdayLong(time, locale)
      return {
        label,
        code: forecast.daily.weather_code[i],
        max: forecast.daily.temperature_2m_max[i],
        min: forecast.daily.temperature_2m_min[i],
        precip: forecast.daily.precipitation_sum[i] ?? 0,
      }
    })
  }, [forecast, locale, t])

  const header = useMemo(() => {
    if (!forecast) return { temp: 27, code: 3, max: 30, min: 24 }
    return {
      temp: forecast.current.temperature_2m,
      code: forecast.current.weather_code,
      max: forecast.daily.temperature_2m_max[0],
      min: forecast.daily.temperature_2m_min[0],
    }
  }, [forecast])

  const plainWind = (speed: number, deg: number) => {
    const s = speed < 5 ? (i18n.language.startsWith('pt') ? 'Calmo' : 'Calm') : speed < 15 ? (i18n.language.startsWith('pt') ? 'Brisa leve' : 'Light breeze') : speed < 25 ? (i18n.language.startsWith('pt') ? 'Vento moderado' : 'Moderate') : (i18n.language.startsWith('pt') ? 'Vento forte' : 'Strong')
    const dirs = i18n.language.startsWith('pt') ? ['do norte','do nordeste','do leste','do sudeste','do sul','do sudoeste','do oeste','do noroeste'] : ['from north','from northeast','from east','from southeast','from south','from southwest','from west','from northwest']
    const idx = Math.round(((deg % 360) / 45)) % 8
    return { label: s, sub: dirs[idx] }
  }
  const plainHumidity = (h: number) => {
    if (h < 40) return i18n.language.startsWith('pt') ? 'Seco' : 'Dry'
    if (h < 60) return i18n.language.startsWith('pt') ? 'Agradável' : 'Comfortable'
    if (h < 80) return i18n.language.startsWith('pt') ? 'Úmido' : 'Humid'
    return i18n.language.startsWith('pt') ? 'Bem úmido' : 'Very humid'
  }
  const plainUV = (uv: number) => {
    if (uv <= 2) return t('metrics.uvLow')
    if (uv <= 5) return i18n.language.startsWith('pt') ? 'Bom de ficar fora' : 'Nice to stay out'
    return t('metrics.uvModerate')
  }

  // sensação, Ar e Vento diretos no Hero — sem adjetivos poluindo
  const feelsLike = useMemo(() => {
    if (!forecast) return { value: '23°' }
    const c = forecast.current
    return { value: `${Math.round(c.apparent_temperature)}°` }
  }, [forecast])

  const humidity = useMemo(() => {
    if (!forecast) return i18n.language.startsWith('pt') ? 'Úmido' : 'Humid'
    return plainHumidity(forecast.current.relative_humidity_2m)
  }, [forecast, i18n.language])

  const windLabel = useMemo(() => {
    if (!forecast) return i18n.language.startsWith('pt') ? 'Brisa leve do nordeste • 12 km/h' : 'Light breeze from northeast • 12 km/h'
    const c = forecast.current
    const w = plainWind(c.wind_speed_10m, c.wind_direction_10m)
    return `${w.label} ${w.sub} • ${Math.round(c.wind_speed_10m)} km/h`
  }, [forecast, i18n.language])

  const uvLabel = useMemo(() => {
    if (!forecast) return plainUV(0)
    // 1) current.uv_index é o mais preciso (horário real) — 0 à noite
    const currentUv = forecast.current.uv_index
    if (typeof currentUv === 'number' && Number.isFinite(currentUv)) return plainUV(currentUv)
    // 2) fallback horário: acha hora mais próxima de agora em hourly.time
    const hourlyUv = forecast.hourly.uv_index
    const hourlyTime = forecast.hourly.time
    if (hourlyUv && hourlyTime && hourlyUv.length === hourlyTime.length) {
      const nowMs = Date.now()
      let bestIdx = 0
      let bestDiff = Infinity
      for (let i = 0; i < hourlyTime.length; i++) {
        const diff = Math.abs(new Date(hourlyTime[i]).getTime() - nowMs)
        if (diff < bestDiff) {
          bestDiff = diff
          bestIdx = i
        }
      }
      const v = hourlyUv[bestIdx]
      if (typeof v === 'number' && Number.isFinite(v)) return plainUV(v)
    }
    // 3) fallback legado: daily max (cache antigo sem uv_index horário)
    const uv = forecast.daily.uv_index_max?.[0] ?? 0
    return plainUV(uv)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecast, t, i18n.language])

  // grid vazio — Ar e Vento agora moram no Hero para não poluir dashboard
  const metrics = useMemo(() => [] as { icon: string; label: string; value: string; sub?: string; detail?: string }[], [])

  const sunrise = forecast ? fmtTime(forecast.daily.sunrise[0], locale) : '05:18'
  const sunset = forecast ? fmtTime(forecast.daily.sunset[0], locale) : '17:17'
  const sunriseISO = forecast?.daily.sunrise[0] ?? null
  const sunsetISO = forecast?.daily.sunset[0] ?? null
  // isDay vivo: celestial com now tick (não depende de cache is_day stale)
  const isDay = useMemo(() => {
    if (!forecast) return null
    return isDayNow(now, sunriseISO, sunsetISO)
  }, [forecast, sunriseISO, sunsetISO, now])
  const moonriseISO = forecast?.daily.moonrise?.[0] ?? null
  const moonsetISO = forecast?.daily.moonset?.[0] ?? null
  const moonrise = moonriseISO ? fmtTime(moonriseISO, locale) : null
  const moonset = moonsetISO ? fmtTime(moonsetISO, locale) : null

  const marineWeek = useMemo(() => {
    if (!marine || !forecast) return mockMarineWeek()
    try {
      const week = buildMarineWeek({
        marineHourlyTime: marine.hourly.time,
        marineHourlyWave: (marine.hourly.wave_height as number[] | undefined) ?? null,
        marineSeaLevel: marine.hourly.sea_level_height_msl,
        forecastDailyTime: forecast.daily.time,
        forecastDailyPrecip: forecast.daily.precipitation_sum,
        forecastHourlyWind: null,
        stormglassTides: stormglassTides ?? undefined,
        locale,
      })
      week.days.sort((a, b) => a.date.localeCompare(b.date))
      return week
    } catch {
      return mockMarineWeek()
    }
  }, [marine, forecast, stormglassTides, locale])

  const handleForecastNavigate = (screen: 'sun' | 'hero' | 'marine-full') => {
    if (screen === 'marine-full') {
      if (!isBeach) return
      navigate({ tab: 'forecast', screen: 'marine-full' })
    } else {
      navigate({ tab: 'forecast', screen })
    }
  }

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-[420px] md:max-w-3xl lg:max-w-6xl xl:max-w-[1280px] mx-auto px-3 md:px-6 lg:px-8 pt-4 pb-10 space-y-3 md:space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <span className="text-xs text-white/60 truncate order-2 md:order-1">
            {updatedAt ? t('cache.updatedAt', { time: updatedAt.toLocaleTimeString(locale) }) : ''} {fromCache ? `• ${t('cache.stale')}` : ''}
          </span>
          <div className="flex items-center gap-2 shrink-0 order-1 md:order-2 self-end md:self-auto">
            <ToggleGroup.Root
              type="single"
              value={i18n.language.startsWith('pt') ? 'pt' : 'en'}
              onValueChange={(v) => v && i18n.changeLanguage(v === 'pt' ? 'pt-BR' : 'en')}
              className="glass flex rounded-full p-1"
              aria-label="Language"
            >
              <ToggleGroup.Item value="pt" className="px-2 py-1 rounded-full text-xs md:text-sm data-[state=on]:bg-white data-[state=on]:text-sky-900 data-[state=off]:text-white/70">
                PT
              </ToggleGroup.Item>
              <ToggleGroup.Item value="en" className="px-2 py-1 rounded-full text-xs md:text-sm data-[state=on]:bg-white data-[state=on]:text-sky-900 data-[state=off]:text-white/70">
                EN
              </ToggleGroup.Item>
            </ToggleGroup.Root>
          </div>
        </div>

        <div className="md:max-w-xl lg:max-w-2xl">
          <SearchBar onSelect={onSelect} onSearch={onSearchCb} />
        </div>

        <div className="space-y-3">
          {view.screen === 'dashboard' && (
            <ForecastDashboard
              locName={loc.name}
              temp={header.temp}
              code={header.code}
              max={header.max}
              min={header.min}
              sunrise={sunrise}
              sunset={sunset}
              sunriseISO={sunriseISO}
              sunsetISO={sunsetISO}
              moonrise={moonrise}
              moonset={moonset}
              moonriseISO={moonriseISO}
              moonsetISO={moonsetISO}
              metrics={metrics}
              marine={isBeach ? (marine?.current ?? null) : null}
              week={isBeach ? marineWeek : null}
              feelsLike={feelsLike}
              humidity={humidity}
              windLabel={windLabel}
              uvLabel={uvLabel}
              isDay={isDay}
              hours={hourly}
              days={daily}
              onNavigate={handleForecastNavigate}
            />
          )}
          {view.screen === 'hero' && <HeroDetail location={loc.name} temp={header.temp} code={header.code} max={header.max} min={header.min} hours={hourly} days={daily} feelsLike={feelsLike} humidity={humidity} windLabel={windLabel} uvLabel={uvLabel} isDay={isDay} onBack={backToDashboard} />}
          {view.screen === 'sun' && <SunDetail location={loc.name} temp={header.temp} code={header.code} max={header.max} min={header.min} feelsLike={feelsLike} humidity={humidity} windLabel={windLabel} uvLabel={uvLabel} isDay={isDay} sunrise={sunrise} sunset={sunset} sunriseISO={sunriseISO} sunsetISO={sunsetISO} moonrise={moonrise} moonset={moonset} moonriseISO={moonriseISO} moonsetISO={moonsetISO} onBack={backToDashboard} />}
          {view.screen === 'marine-full' && <MarineFull location={loc.name} temp={header.temp} code={header.code} max={header.max} min={header.min} feelsLike={feelsLike} humidity={humidity} windLabel={windLabel} uvLabel={uvLabel} isDay={isDay} marine={marine?.current ?? null} week={marineWeek} onBack={backToDashboard} />}
        </div>

        <Separator.Root className="h-px bg-white/10 my-2" />

        <div className="text-center text-[11px] md:text-xs text-white/50 pt-1 space-y-2">
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button className="underline decoration-white/20 hover:text-white/80 text-xs md:text-sm">{t('footer.report')}</button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 glass-strong p-6 w-[90%] max-w-sm z-50">
                <Dialog.Title className="text-sm font-medium">{t('footer.report')}</Dialog.Title>
                <Dialog.Description className="text-xs text-white/60 mt-2">
                  {i18n.language.startsWith('pt') ? 'Obrigado! Sua opinião ajuda a melhorar.' : 'Thanks! Your feedback helps us improve.'}
                </Dialog.Description>
                <Dialog.Close asChild>
                  <button className="mt-4 w-full glass py-2 rounded-xl text-sm">OK</button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <p>
            {t('footer.source')} • {new Date().toLocaleDateString(locale)}
          </p>
        </div>
      </div>
    </div>
  )
}
