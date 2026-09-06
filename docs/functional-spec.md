# Functional Spec — app-clima

> Atualizado em: 2026-09-06 — Marine 7 dias. Atualizar sempre que mudar.

## Visão
SPA/PWA React para planejamento de viagens praia & campo. Zero auth. Adaptativa: oculta ondas/marés se interior. Idiomas `en` (default) + `pt-BR`, detecção via OS (`navigator.language`).

## User Flow
1. Abre app → barra busca "Para onde você vai hoje? / Where to today?"
2. Digita "Suape, PE" ou "Gravatá, PE" → Nominatim resolve lat/lon (cache 7d)
3. Paralelo: Forecast (30min cache) + Marine se litoral (60min)
4. Dashboard monta condicional praia/campo. Stale-while-revalidate, offline mostra cache.

## Blocos UI (imagem iOS) — 100% linguagem simples, sem jargão
- Header hero: local, temp grande, céu simples (ex: Céu limpo / Algumas nuvens), texto “Tarde quente / Noite fresca” (sem Máx/Mín técnico)
- Faixa horária: próximos horas com temp + ícone, sem % técnico (mostra “Chuvinha” só se >30%)
- Card arco pôr-do-sol “O sol se põe às 17:17”
- Próximos dias lista com barras temperatura, chuva vira “Sem chuva / Chuvinha / Pode chover” (sem %)
- Card Caminhada “Dia bom — Tempo gostoso para sair”
- Grid métricas plain: Ar (Seco/Agradável/Úmido), Vento (Calmo/Brisa leve + vindo do nordeste), Sensação (Agradável/Quentinho), Tempo (Firme/Mudando), Visão (Longe), Sol (Tranquilo/Precisa protetor) — sem mb/km/UV/m/s
- Marine 3 abas plain (só praia): Resumo (Ótimo/Bom para banho com melhor dia/hora em frase), Ondas (Ondinhas/Médias/Grandes sem metros), Maré (Maré cheia/seca com hora, sem metros) — lista estilo Próximos dias, sem Cache/Open-Meteo/DHN
- Removidos: Radar/mapa e Pólen; removido todo “Preamar, Altura da onda, Período, Direção °, Pressão mb, Visibilidade km, Índice UV”

## i18n
- `i18next + browser-languagedetector`, fallback `en`. `src/locales/en` e `pt-BR`.
- Datas/números via `Intl` com locale atual.
- WMO codes mapeados por chave `weather.<code>`.

## UI primitives (Radix)
- Busca: `Popover` ancorado no input, `ScrollArea` resultados
- Filtros: `ToggleGroup single` para praia/campo e idioma (a11y, `data-[state=on]`)
- Navegação: `Tabs` externo Clima/Mar + `Tabs` interno Marine (Resumo/Ondas/Maré) plain
- Detalhes: `Dialog` métricas e report com frases plain, `Separator` divisores, `Accordion` por dia
- Marine 7 dias: `MarineWeekList` lista vertical estilo Próximos dias com 3 abas, sem números técnicos; `MarineModule` plain (Ondinhas/Tranquilas/vindo do sul)

## Regras
- Sempre atualizar este doc + technical/api/executable quando mudar comportamento.
