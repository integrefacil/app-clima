# API Spec — app-clima

> Atualizado em: 2026-09-06 — Etapa 0

## Nominatim OSM
- `GET https://nominatim.openstreetmap.org/search?format=json&q={query}&limit=5&addressdetails=1`
- Header `Accept-Language: pt-BR,en`. Rate 1 req/s → cache 7d, debounce.
- Resposta: `display_name, lat, lon, place_id`

## Open-Meteo Forecast
- `GET https://api.open-meteo.com/v1/forecast?latitude=&longitude=&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=10`
- Sem chave, sem limite rígido → cache 30min SWR.

## Open-Meteo Marine
- `GET https://marine-api.open-meteo.com/v1/marine?latitude=&longitude=&current=wave_height,wave_direction,wave_period&hourly=sea_level_height_msl&timezone=auto`
- Só se litoral (wave_height != null) → cache 60min. Se null → modo campo.

## Contratos internos
- `GeocodeResult`, `ForecastResponse`, `MarineResponse` em `services/api.ts`
- Erro → toast traduzido + fallback cache stale
