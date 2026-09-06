# API Spec — app-clima

> Atualizado em: 2026-09-06 — Marine 7 dias + marés

## Nominatim OSM
- `GET https://nominatim.openstreetmap.org/search?format=json&q={query}&limit=5&addressdetails=1`
- Header `Accept-Language: pt-BR,en`. Rate 1 req/s → cache 7d, debounce.
- Resposta: `display_name, lat, lon, place_id`

## Open-Meteo Forecast
- `GET https://api.open-meteo.com/v1/forecast?latitude=&longitude=&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=10`
- Sem chave, sem limite rígido → cache 30min SWR.

## Open-Meteo Marine (7 dias)
- `GET https://marine-api.open-meteo.com/v1/marine?latitude=&longitude=&current=wave_height,wave_direction,wave_period&hourly=sea_level_height_msl,wave_height&daily=wave_height_max&timezone=auto&forecast_days=7`
- `hourly` 168 pontos → `waveAvg` (média dia) e `waveMax`; `sea_level` → `calcTidesFromSeaLevel` estima preamar/baixa-mar (picos locais)
- Só se litoral (`wave_height != null`) → cache 60min (`TTL.marine`). Se null → modo campo.
- View model `MarineWeek` em `services/marineWeek.ts`: `days[{date,waveAvg,waveMax,tideHigh,tideLow,tides[],score,bestSlot}]`

## Stormglass (opcional, se VITE_STORMGLASS_KEY)
- `GET https://api.stormglass.io/v2/tide/extremes/point?lat=&lng=&start=&end=` + `Authorization: <key>`
- Retorna `[{time,height,type}]` oficial; se disponível, usa no lugar da estimativa Open-Meteo. Free 50 req/dia.
- Fallback: estimativa Open-Meteo + badge “estimado”.

## Contratos internos
- `GeocodeResult`, `ForecastResponse`, `MarineResponse`, `MarineWeek`, `TideExtremum` em `services/api.ts` + `services/marineWeek.ts`
- `scoreBeachDay({waveAvg,windAvg,precipSum,tideRange})` 0-100; melhor dia = max score; melhor slot = menor onda em 07-11 vs 14-17.
- Erro → fallback cache stale + `mockMarineWeek()` em dev.
