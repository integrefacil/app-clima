# app-clima — Travel Weather Planner (praia & campo)

SPA/PWA React com visual iOS Weather + lógica condicional litoral vs interior.

## Stack
- Vite 8 + React 19 + TS 6 + Tailwind v4 (`@tailwindcss/vite`) + `radix-ui` 1.6.7 (Popover, ScrollArea, ToggleGroup, Tabs, Dialog, Separator) + `vite-plugin-pwa` (Workbox)
- i18n `i18next + browser-languagedetector`, fallback `en`, suporte `en` e `pt-BR` (detecção OS via `navigator.language`)
- Cache `idb-keyval` (IndexedDB) + SW runtimeCaching: `geocode 7d`, `forecast 30min`, `marine 60min` (stale-while-revalidate)

## APIs (gratuitas sem chave)
- Nominatim OSM → `GET /search?format=json&q={query}`
- Open-Meteo Forecast → `current + hourly + daily` (timezone=auto)
- Open-Meteo Marine → `wave_height,wave_direction,wave_period` (só praia)

## Como rodar
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist + SW
npm run preview  # testar PWA
```

Troca idioma: automático pelo OS. Botão EN/PT-BR no topo sobrescreve e persiste em `localStorage`. Teste: DevTools → Sensors → Locale.

## Estrutura
```
src/app/App.tsx  # Tabs + ToggleGroup + Dialog (Radix)
src/components/SearchBar  # Popover + ScrollArea
src/components/HourlyStrip # ScrollArea | DailyList # Separator | MetricGrid # Dialog
src/components/*  # HeaderHero, SunsetArc, MarineModule
src/services/{api.ts,cache.ts}
src/lib/{i18n.ts,wmo.ts,format.ts}
src/locales/{en,pt-BR}/translation.json
docs/{functional-spec,technical-spec,api-spec,executable-spec}.md
```

## PWA
- `manifest` theme #0ea5e9, display standalone, icons 192/512 maskable
- Offline: mostra último cache + badge "Stale data / Dados em cache"
- Workbox NetworkFirst para APIs

## Docs
Toda mudança em `src/` deve atualizar `docs/*.md` no mesmo commit — ver `docs/executable-spec.md` para critérios verificáveis por etapa.

## Etapas
0 Setup → 1 Shell estático → 2 Geocodificação → 3 Forecast atual → 4 Hourly/Daily → 5 Métricas → 6 Marine condicional → 7 PWA offline
