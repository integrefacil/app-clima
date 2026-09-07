# Technical Spec — app-clima

> Atualizado em: 2026-09-06 — Auto litoral/interior + Radix

## Stack
- Vite 8 + React 19 + TypeScript 6 + Tailwind v4 (@tailwindcss/vite, CSS-first @theme)
- UI primitives: `radix-ui` 1.6.7 — Popover, ScrollArea, ToggleGroup, Tabs, Dialog, Separator (a11y, foco, portal, sem reinventar)
- PWA: vite-plugin-pwa Workbox runtimeCaching NetworkFirst
- i18n: i18next + react-i18next + i18next-browser-languagedetector (fallback en, OS detection)
- Cache dados: idb-keyval (IndexedDB) + wrapper `services/cache.ts` TTL 7d geocode / 30min forecast / 60min marine / 7d coastal (stale-while-revalidate)
- Query: @tanstack/react-query (staleTime = TTL)
- Detecção litoral: `services/coastal.ts:isCoastalByMarine` (proxy `marine.current.wave_height != null`), sem toggle manual

## Arquitetura
```
src/App.tsx — Tabs condicional (forecast + marine se litoral), ToggleGroup só idioma, Dialog report, isBeach derivado de marine + redirect #/mar→#/clima se interior, hash sem #/clima/metricas
src/components/SearchBar — Popover + ScrollArea (Radix)
src/components/HourlyStrip — ScrollArea horizontal
src/components/DailyList — Separator entre dias
src/components/MetricGrid — Dialog detalhe por métrica (inline abaixo do Hero, 6 itens, sem view dedicada)
src/components/{HeaderHero,SunsetArc,MarineModule}
src/views/{ForecastDashboard (MetricGrid inline + marine opcional), MarineDashboard, MarineFull}
src/services/{api.ts,cache.ts,coastal.ts,marineWeek.ts}
src/lib/{i18n.ts,wmo.ts,format.ts}
src/locales/{en,pt-BR}/translation.json
public/manifest (PWA)
```

## Radix — por que
- Popover: posicionamento, Portal, foco e `onOpenAutoFocus` sem Dropdown manual
- ToggleGroup single: estado `data-[state=on]` + a11y `aria-label` só PT/EN (praia/campo removido)
- Tabs: navegação teclado, `data-[state=active]` sem gerenciar estado; Tabs.Mar oculto se interior (esconder, não desabilitar)
- ScrollArea: thumb custom sem scrollbar nativa feia
- Separator/ Dialog: semântica e overlay/portal prontos

## Cache estratégia
- `fetchWithCache(key, ttl, fetcher)` → hit fresco retorna direto; stale retorna cache + tenta rede; falha rede retorna stale.
- `coastal:lat,lon` 7d guarda decisão litoral/interior; se interior e cache fresco, pula `fetchMarineWithTides` (economia).
- Workbox replica TTL em runtimeCaching para SW.
- Debounce search 500ms + AbortController.

## PWA
- manifest theme #0ea5e9 bg #0c4a6e, icons 192/512, display standalone, lang pt-BR (dinâmico via i18n html lang)
- `registerType: autoUpdate`

## Atualização docs
- Qualquer mudança em src → atualizar docs/*.md no mesmo commit.
