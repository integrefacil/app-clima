# Functional Spec — app-clima

> Atualizado em: 2026-09-06 — Etapa 0. Atualizar sempre que mudar.

## Visão
SPA/PWA React para planejamento de viagens praia & campo. Zero auth. Adaptativa: oculta ondas/marés se interior. Idiomas `en` (default) + `pt-BR`, detecção via OS (`navigator.language`).

## User Flow
1. Abre app → barra busca "Para onde você vai hoje? / Where to today?"
2. Digita "Suape, PE" ou "Gravatá, PE" → Nominatim resolve lat/lon (cache 7d)
3. Paralelo: Forecast (30min cache) + Marine se litoral (60min)
4. Dashboard monta condicional praia/campo. Stale-while-revalidate, offline mostra cache.

## Blocos UI (imagem iOS)
- Header hero: local, temp atual grande, condição (weathercode traduzido), descrição max/min
- Faixa horária scroll 24h (temp + ícone)
- Card arco pôr-do-sol "Sunset will be at 17:17 / O pôr do sol será às 17:17"
- Previsão 10 dias com barras precipitação
- Card Corrida (derivado clima limpo)
- Grid métricas: umidade, vento, sensação, pressão, visibilidade, UV, nascer/pôr, precipitação
- Marine (só praia): altura/período/direção onda + tábua maré
- Removidos: Radar/mapa e Pólen (decisão usuário)

## i18n
- `i18next + browser-languagedetector`, fallback `en`. `src/locales/en` e `pt-BR`.
- Datas/números via `Intl` com locale atual.
- WMO codes mapeados por chave `weather.<code>`.

## UI primitives (Radix)
- Busca: `Popover` ancorado no input, `ScrollArea` resultados
- Filtros: `ToggleGroup single` para praia/campo e idioma (a11y, `data-[state=on]`)
- Navegação: `Tabs` forecast/marine
- Detalhes: `Dialog` métricas e report, `Separator` divisores

## Regras
- Sempre atualizar este doc + technical/api/executable quando mudar comportamento.
