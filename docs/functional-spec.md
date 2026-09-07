# Functional Spec — app-clima

> Atualizado em: 2026-09-06 — Auto litoral/interior (sem toggle). Atualizar sempre que mudar.

## Visão
SPA/PWA React para planejamento de viagens. Zero auth. Adaptativa 100% auto: oculta aba Mar + cards de ondas/marés se interior (sem toggle Praia/Campo). Idiomas `en` (default) + `pt-BR`, detecção via OS (`navigator.language`).

## User Flow
1. Abre app → barra busca "Para onde você vai hoje? / Where to today?"
2. Digita "Suape, PE" ou "Brasília, DF" → Nominatim resolve lat/lon (cache 7d)
3. Sempre: Forecast (30min cache). Condicional: Marine só se litoral (`marine.current.wave_height != null`, 60min + coastal 7d)
4. Dashboard: litoral mostra Clima + aba Mar; interior esconde aba Mar e cards de mar, mostra só clima. Stale-while-revalidate, offline mostra cache.

## Blocos UI (imagem iOS) — 100% linguagem simples, sem jargão
- Header hero: local, temp grande, céu simples (ex: Céu limpo / Algumas nuvens), texto “Tarde quente / Noite fresca” (sem Máx/Mín técnico)
- Métricas plain abaixo do Hero (sem card clicável nem view): Ar (Seco/Agradável/Úmido), Vento (Calmo/Brisa leve + vindo do nordeste), Sensação (Agradável), Tempo (Firme/Mudando), Visão (Longe), Sol (Baixo/Precisa protetor) — sem mb/km/UV/m/s, grid 2→3 colunas inline
- Faixa horária: próximos horas com temp + ícone, sem % técnico (mostra “Chuva fraca” só se >30%)
- Card arco pôr-do-sol “O sol se põe às 17:17”
- Próximos dias lista com barras temperatura, chuva vira “Sem chuva / Chuva fraca / Pode chover” (sem %)
- Card Caminhada “Dia bom — Condições agradáveis para sair”
- Marine 3 abas plain (só praia): Resumo (Ótimo/Bom para banho com melhor dia/hora em frase), Ondas (Pequenas/Médias/Grandes sem metros), Maré (Maré cheia/seca com hora, sem metros) — lista estilo Próximos dias, sem Cache/Open-Meteo/DHN
- Removidos: Radar/mapa e Pólen; removido todo “Preamar, Altura da onda, Período, Direção °, Pressão mb, Visibilidade km, Índice UV”

## i18n
- `i18next + browser-languagedetector`, fallback `en`. `src/locales/en` e `pt-BR`.
- Datas/números via `Intl` com locale atual.
- WMO codes mapeados por chave `weather.<code>`.

## UI primitives (Radix)
- Busca: `Popover` ancorado no input, `ScrollArea` resultados
- Filtros: `ToggleGroup single` só idioma (praia/campo removido, 100% auto)
- Navegação: `Tabs` externo Clima/Mar (Mar oculto se interior) + `Tabs` interno Marine (Resumo/Ondas/Maré) plain
- Detalhes: `Dialog` por métrica (no grid) e report com frases plain, `Separator` divisores, `Accordion` por dia — sem view dedicada `#/clima/metricas`
- Marine 7 dias: `MarineWeekList` só monta se litoral; `MarineModule` plain (Ondas pequenas/Tranquilas/vindo do sul)
- Lógica litoral: `src/services/coastal.ts:isCoastalByMarine` (`marine != null`), cache `coastal:lat,lon` 7d para pular fetch marine no interior + redirect auto `#/mar` → `#/clima` se interior

## Regras
- Sempre atualizar este doc + technical/api/executable quando mudar comportamento.
