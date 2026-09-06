export function fmtTime(dateStr: string, locale: string): string {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d)
}

export function fmtDateShort(dateStr: string, locale: string): string {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d)
}

export function fmtTemp(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return '--'
  return `${Math.round(v)}°`
}
