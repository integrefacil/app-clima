import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, Separator, Tabs, ToggleGroup } from 'radix-ui'
import { DailyList } from './components/DailyList'
import { HeaderHero } from './components/HeaderHero'
import { HourlyStrip } from './components/HourlyStrip'
import { MarineModule } from './components/MarineModule'
import { MetricGrid } from './components/MetricGrid'
import { SearchBar } from './components/SearchBar'
import { SunsetArc } from './components/SunsetArc'
import { fetchForecast, fetchMarine, searchLocation, type GeocodeResult } from './services/api'
import { fmtTime } from './lib/format'

type LocationState = { name: string; lat: number; lon: number }

const MOCK_HOURLY = Array.from({ length: 24 }, (_, i) => ({
  time: `${String((7 + i) % 24).padStart(2, '0')}:00`,
  temp: 27 + Math.sin(i / 3) * 2,
  code: i < 4 ? 3 : i < 8 ? 2 : 1,
  precip: i % 5 === 0 ? 10 : 0,
}))

const MOCK_DAILY = [
  { label: 'Hoje', code: 2, max: 29, min: 24, precip: 10 },
  { label: 'seg', code: 3, max: 29, min: 23, precip: 20 },
  { label: 'ter', code: 1, max: 29, min: 23, precip: 10 },
  { label: 'qua', code: 2, max: 29, min: 24, precip: 5 },
  { label: 'qui', code: 3, max: 29, min: 24, precip: 0 },
  { label: 'sex', code: 1, max: 29, min: 24, precip: 0 },
  { label: 'sáb', code: 0, max: 29, min: 24, precip: 0 },
]

export default function App() {
  const { t, i18n } = useTranslation()
  const [loc, setLoc] = useState<LocationState>({ name: 'Jordão, Recife', lat: -8.09, lon: -34.9 })
  const [forecast, setForecast] = useState<null | Awaited<ReturnType<typeof fetchForecast>>>(null)
  const [marine, setMarine] = useState<null | Awaited<ReturnType<typeof fetchMarine>>>(null)
  const [isBeach, setIsBeach] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [fromCache, setFromCache] = useState(false)

  const locale = i18n.language

  const load = useCallback(async (latitude: number, longitude: number) => {
    try {
      const fc = await fetchForecast(latitude, longitude)
      setForecast(fc)
      setUpdatedAt(new Date())
      setFromCache(false)
      const mr = await fetchMarine(latitude, longitude)
      setMarine(mr)
      setIsBeach(!!mr)
    } catch {
      setFromCache(true)
    }
  }, [])

  useEffect(() => {
    load(loc.lat, loc.lon)
  }, [loc.lat, loc.lon, load])

  const onSelect = (r: GeocodeResult) => {
    setLoc({ name: r.display_name.split(',').slice(0, 3).join(','), lat: parseFloat(r.lat), lon: parseFloat(r.lon) })
  }

  const onSearchCb = useCallback((q: string) => searchLocation(q), [])

  const hourly = useMemo(() => {
    if (!forecast) return MOCK_HOURLY
    return forecast.hourly.time.slice(0, 24).map((time, i) => ({
      time: fmtTime(time, locale).replace(':00', ''),
      temp: forecast.hourly.temperature_2m[i],
      code: forecast.hourly.weather_code[i],
      precip: forecast.hourly.precipitation_probability?.[i],
    }))
  }, [forecast, locale])

  const daily = useMemo(() => {
    if (!forecast) return MOCK_DAILY
    return forecast.daily.time.slice(0, 7).map((time, i) => {
      const d = new Date(time)
      const label =
        i === 0
          ? t('daily.today')
          : i === 1
            ? t('daily.tomorrow')
            : new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d)
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

  const metrics = useMemo(() => {
    if (!forecast)
      return [
        { icon: '💧', label: 'metrics.humidity', value: '79%', sub: t('metrics.humidityDesc'), detail: 'Umidade relativa do ar medida a 2m' },
        { icon: '💨', label: 'metrics.wind', value: '21 km/h', sub: 'NE 21 km/h', detail: 'Velocidade e direção do vento a 10m' },
        { icon: '🌡️', label: 'metrics.feelsLike', value: '23°', sub: '', detail: 'Sensação térmica aparente' },
        { icon: '🧭', label: 'metrics.pressure', value: '1014.0 mb', sub: t('metrics.pressureDesc'), detail: 'Pressão ao nível do mar' },
        { icon: '👁️', label: 'metrics.visibility', value: '10.00 km', sub: '', detail: 'Visibilidade horizontal' },
        { icon: '☀️', label: 'metrics.uv', value: '2', sub: t('metrics.uvLow'), detail: 'Índice UV máximo do dia' },
      ]
    const c = forecast.current
    const d = forecast.daily
    return [
      { icon: '💧', label: 'metrics.humidity', value: `${Math.round(c.relative_humidity_2m)}%`, sub: t('metrics.humidityDesc'), detail: 'Umidade relativa a 2m' },
      { icon: '💨', label: 'metrics.wind', value: `${Math.round(c.wind_speed_10m)} km/h`, sub: `${Math.round(c.wind_direction_10m)}°`, detail: `Vento ${Math.round(c.wind_speed_10m)} km/h direção ${Math.round(c.wind_direction_10m)}°` },
      { icon: '🌡️', label: 'metrics.feelsLike', value: `${Math.round(c.apparent_temperature)}°`, sub: '', detail: 'Sensação térmica calculada' },
      { icon: '🧭', label: 'metrics.pressure', value: '1014 mb', sub: t('metrics.pressureDesc'), detail: 'Pressão ao nível do mar' },
      { icon: '👁️', label: 'metrics.visibility', value: '10.00 km', sub: '', detail: 'Estimativa de visibilidade' },
      { icon: '☀️', label: 'metrics.uv', value: String(Math.round(d.uv_index_max?.[0] ?? 0)), sub: (d.uv_index_max?.[0] ?? 0) > 5 ? t('metrics.uvModerate') : t('metrics.uvLow'), detail: `UV máximo hoje ${d.uv_index_max?.[0] ?? 0}` },
    ]
  }, [forecast, t])

  const sunrise = forecast ? fmtTime(forecast.daily.sunrise[0], locale) : '05:18'
  const sunset = forecast ? fmtTime(forecast.daily.sunset[0], locale) : '17:17'

  return (
    <div className="min-h-screen">
      {/* Responsivo: 420px mobile → 768 tablet → 1280 desktop */}
      <div className="w-full max-w-[420px] md:max-w-3xl lg:max-w-6xl xl:max-w-[1280px] mx-auto px-3 md:px-6 lg:px-8 pt-4 pb-10 space-y-3 md:space-y-4">
        {/* Top bar */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <span className="text-xs text-white/60 truncate order-2 md:order-1">
            {updatedAt ? t('cache.updatedAt', { time: updatedAt.toLocaleTimeString(locale) }) : ''} {fromCache ? `• ${t('cache.stale')}` : ''}
          </span>
          <div className="flex items-center gap-2 shrink-0 order-1 md:order-2 self-end md:self-auto">
            <ToggleGroup.Root
              type="single"
              value={isBeach ? 'beach' : 'countryside'}
              onValueChange={(v) => v && setIsBeach(v === 'beach')}
              className="glass flex rounded-full p-1 gap-1"
              aria-label={t('geo.beach')}
            >
              <ToggleGroup.Item
                value="beach"
                aria-label={t('geo.beach')}
                className="px-2.5 py-1 rounded-full text-xs md:text-sm data-[state=on]:bg-white data-[state=on]:text-sky-900 data-[state=off]:text-white/70 transition-colors"
              >
                🏖 {t('geo.beach')}
              </ToggleGroup.Item>
              <ToggleGroup.Item
                value="countryside"
                aria-label={t('geo.countryside')}
                className="px-2.5 py-1 rounded-full text-xs md:text-sm data-[state=on]:bg-white data-[state=on]:text-sky-900 data-[state=off]:text-white/70 transition-colors"
              >
                🌾 {t('geo.countryside')}
              </ToggleGroup.Item>
            </ToggleGroup.Root>

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

        {/* Tabs */}
        <Tabs.Root defaultValue="forecast" className="space-y-3">
          <Tabs.List className="glass flex rounded-full p-1 gap-1 max-w-[420px] md:max-w-[360px]">
            <Tabs.Trigger value="forecast" className="flex-1 py-1.5 rounded-full text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-sky-900 text-white/70 data-[state=active]:shadow">
              {t('app.title')}
            </Tabs.Trigger>
            <Tabs.Trigger value="marine" className="flex-1 py-1.5 rounded-full text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-sky-900 text-white/70">
              🌊 {t('marine.title')}
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="forecast" className="focus:outline-none">
            {/* Grid responsivo: mobile 1 col, lg 12 cols */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
              {/* Coluna principal */}
              <div className="lg:col-span-8 space-y-3 md:space-y-4">
                <div className="glass-strong overflow-hidden">
                  <HeaderHero location={loc.name} temp={header.temp} conditionCode={header.code} max={header.max} min={header.min} />
                </div>
                <HourlyStrip hours={hourly} />
                {/* Em desktop, Sunset e Daily lado a lado? Mantém stack mas Daily maior */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                  <SunsetArc sunrise={sunrise} sunset={sunset} />
                  <div className="glass p-4 flex items-center gap-3 md:hidden lg:flex xl:hidden">
                    <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center shrink-0" aria-hidden>
                      🏃
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t('sport.title')} — {t('sport.status')}
                      </p>
                      <p className="text-xs text-white/60">{t('sport.desc')}</p>
                    </div>
                  </div>
                </div>
                <DailyList days={daily} />
              </div>

              {/* Sidebar direita — em mobile fica abaixo, em lg ao lado */}
              <div className="lg:col-span-4 space-y-3 md:space-y-4">
                <div className="hidden md:flex lg:hidden xl:flex glass p-4 items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center shrink-0" aria-hidden>
                    🏃
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {t('sport.title')} — {t('sport.status')}
                    </p>
                    <p className="text-xs text-white/60">{t('sport.desc')}</p>
                  </div>
                </div>
                {/* Esconde duplicado em lg */}
                <div className="hidden lg:block xl:hidden glass p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center shrink-0" aria-hidden>
                    🏃
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {t('sport.title')} — {t('sport.status')}
                    </p>
                    <p className="text-xs text-white/60">{t('sport.desc')}</p>
                  </div>
                </div>

                <MetricGrid items={metrics} />

                <div className="glass p-3 flex justify-between text-xs md:text-sm text-white/60">
                  <span>🌙 01:12 • 13:07</span>
                  <span>
                    {sunrise} • {sunset}
                  </span>
                </div>

                {/* Marine preview também na sidebar em desktop para não precisar trocar aba */}
                <div className="hidden lg:block">
                  <MarineModule
                    waveHeight={marine?.current.wave_height ?? null}
                    wavePeriod={marine?.current.wave_period ?? null}
                    waveDirection={marine?.current.wave_direction ?? null}
                    isBeach={isBeach}
                  />
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="marine" className="focus:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-8">
                <MarineModule
                  waveHeight={marine?.current.wave_height ?? null}
                  wavePeriod={marine?.current.wave_period ?? null}
                  waveDirection={marine?.current.wave_direction ?? null}
                  isBeach={isBeach}
                />
              </div>
              <div className="lg:col-span-4 glass p-4 text-xs md:text-sm text-white/60 space-y-2">
                <p className="font-medium text-white/80">{t('marine.title')}</p>
                <Separator.Root className="h-px bg-white/10" />
                <p>{isBeach ? `Ondas ${marine?.current.wave_height?.toFixed(1) ?? '--'} m • Período ${marine?.current.wave_period?.toFixed(1) ?? '--'} s` : t('marine.noData')}</p>
                <p className="text-[11px] text-white/40">Cache 60min • Open-Meteo Marine</p>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>

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
                  {i18n.language.startsWith('pt') ? 'Obrigado pelo feedback. Os dados vêm de Open-Meteo e Nominatim.' : 'Thanks for feedback. Data from Open-Meteo and Nominatim.'}
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
