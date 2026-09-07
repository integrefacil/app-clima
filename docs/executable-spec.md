# Executable Spec — app-clima

> Atualizado em: 2026-09-06 — Etapa 0. Cada linha deve ser verificável.

## Etapa 0 — Setup
- [x] `npm run dev` sobe Vite
- [x] `npm run build` gera PWA manifest + SW (9 entradas, 302 KiB)
- [x] i18n detecta `navigator.language` pt-BR/en, fallback en
- [x] docs/*.md existem e serão atualizados a cada mudança
- [x] README com instruções + estrutura

## Etapa 1 — Shell estático
- [x] Header hero mostra Jordão 27° Encoberto com gradiente imagem
- [x] Hourly strip scroll 24 itens
- [x] Daily 7-10 dias com barra precipitação
- [x] Sunset arc SVG 05:18/17:17
- [x] Metric grid 6 cards
- [x] Trocar idioma OS → textos mudam sem reload

## Etapa 2 — Geocodificação
- [x] Buscar "Gravatá, PE" retorna coords, segunda busca hit cache <50ms
- [x] Debounce 500ms, cache 7d verificado em IndexedDB `geocode:...`

## Etapa 3 — Forecast atual
- [x] Header reflete temp real Open-Meteo, cache 30min NetworkFirst
- [x] Offline mostra stale + badge "Stale data / Dados em cache"

## Etapa 4 — Hourly/Daily
- [x] 24h `fmtTime` via Intl locale, `precipitation_probability`
- [x] 10 dias `temperature_2m_max/min` + `precipitation_sum` + barra

## Etapa 5 — Métricas (inline abaixo do Hero, sem view)
- [x] `ForecastDashboard` renderiza `MetricGrid` 6 itens diretamente abaixo do Hero (`glass p-3`), sem `SummaryCard` clicável nem rota `#/clima/metricas`
- [x] `MetricGrid` sem `compact` (6 cards), Dialog por item mantém `detail`; `MetricsDetail.tsx` removido, `useHashView` sem `metrics` screen, `App.tsx` sem `MetricsDetail` import/rota
- [x] Toggle EN/PT-BR persiste localStorage

## Etapa 6 — Marine (auto, sem toggle)
- [x] Fetch marine 60min, `isBeach` derivado 100% auto `isCoastalByMarine(marine)` + cache `coastal:lat,lon` 7d
- [x] Toggle Praia/Campo removido; aba Mar escondida (não desabilitada) se interior; card mar em ForecastDashboard oculto se `marine==null`
- [x] Redirect auto `#/mar` → `#/clima` se interior; `handleForecastNavigate('marine-full')` bloqueado se interior

## Etapa 8 — Marine 7 dias + marés + média (novo)
- [x] `fetchMarine` com `hourly wave_height,sea_level + daily wave_height_max + forecast_days=7` (cache 60min) + `fetchStormglassTides` opcional via `VITE_STORMGLASS_KEY`
- [x] `buildMarineWeek` calcula `waveAvg`/`waveMax` por dia, `tides` via Stormglass ou `calcTidesFromSeaLevel`, `scoreBeachDay` 0-100 e `bestSlot` 07-11/14-17
- [x] `MarineWeekList` lista 7 dias `grid 1→2 cols`, cada card mostra `waveAvg`/`waveMax`, `tideHigh`/`tideLow` com altura m + hora (Intl), badge Melhor/Bom/Moderado, Accordion com todos horários + hourly onda
- [x] `Tabs marine` agora mostra resumo atual + `MarineWeekList`; fallback `mockMarineWeek` se offline; banner “estimado” quando sem Stormglass
- [x] i18n `marine.weekTitle`, `bestDay`, `bestTime`, etc. em `en`/`pt-BR`
 - [ ] Ver manual: buscar `Suape, PE` (litoral) → aba Mar visível + 7 cards com alturas e horários; buscar `Brasília, DF` (interior) → aba Mar escondida, sem fetch marine repetido (ver `coastal:*` em IndexedDB), sem card mar no dashboard

## Etapa 7 — PWA
- [x] `vite-plugin-pwa` autoUpdate, runtimeCaching NetworkFirst APIs
- [x] Icons 192/512 maskable, manifest theme #0ea5e9
- [x] `npm run build` + `npx vite preview` funciona offline (cache idb + SW)
- [ ] Lighthouse PWA >90 (rodar `npx lighthouse http://localhost:4173 --preset=desktop`)
