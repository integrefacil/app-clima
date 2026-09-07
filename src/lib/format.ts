export function fmtTime(dateStr: string, locale: string): string {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d)
}

export function fmtDateShort(dateStr: string, locale: string): string {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d)
}

export function fmtWeekdayLong(dateStr: string, locale: string): string {
  // usa T12:00:00 para evitar shift UTC em strings "YYYY-MM-DD"
  const s = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date(`${dateStr}T12:00:00`))
  // pt-BR vem "terça-feira" — usuário quer "terça"
  return locale.startsWith('pt') ? s.replace('-feira', '').trim() : s
}

export function fmtTemp(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return '--'
  return `${Math.round(v)}°`
}
