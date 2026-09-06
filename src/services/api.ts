import { fetchWithCache, TTL } from './cache'

export type GeocodeResult = {
  display_name: string
  lat: string
  lon: string
  place_id: number
}

export async function searchLocation(query: string): Promise<GeocodeResult[]> {
  const key = `geocode:${query.toLowerCase().trim()}` as const
  const { data } = await fetchWithCache<GeocodeResult[]>(key, TTL.geocode, async () => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=pt-BR,en`
    const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR,en' } })
    if (!res.ok) throw new Error(`Geocode ${res.status}`)
    return (await res.json()) as GeocodeResult[]
  })
  return data
}

export type ForecastResponse = {
  latitude: number
  longitude: number
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    precipitation: number
    wind_speed_10m: number
    wind_direction_10m: number
    weather_code: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    weather_code: number[]
    precipitation_probability: number[]
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    sunrise: string[]
    sunset: string[]
    uv_index_max: number[]
  }
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastResponse> {
  const key = `forecast:${lat.toFixed(3)},${lon.toFixed(3)}` as const
  const { data } = await fetchWithCache<ForecastResponse>(key, TTL.forecast, async () => {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,weather_code',
      hourly: 'temperature_2m,weather_code,precipitation_probability',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max',
      timezone: 'auto',
      forecast_days: '10',
    })
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
    if (!res.ok) throw new Error(`Forecast ${res.status}`)
    return (await res.json()) as ForecastResponse
  })
  return data
}

export type MarineResponse = {
  current: { wave_height: number | null; wave_direction: number | null; wave_period: number | null }
  hourly: { time: string[]; sea_level_height_msl: number[] }
}

export async function fetchMarine(lat: number, lon: number): Promise<MarineResponse | null> {
  const key = `marine:${lat.toFixed(3)},${lon.toFixed(3)}` as const
  try {
    const { data } = await fetchWithCache<MarineResponse>(key, TTL.marine, async () => {
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        current: 'wave_height,wave_direction,wave_period',
        hourly: 'sea_level_height_msl',
        timezone: 'auto',
      })
      const res = await fetch(`https://marine-api.open-meteo.com/v1/marine?${params}`)
      if (!res.ok) throw new Error(`Marine ${res.status}`)
      return (await res.json()) as MarineResponse
    })
    // se não tem dados de onda, considerar não costeiro
    if (data.current?.wave_height == null) return null
    return data
  } catch {
    return null
  }
}
