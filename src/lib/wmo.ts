export function wmoKey(code: number): string {
  // normaliza para chaves existentes
  if ([0, 1, 2, 3, 45, 48, 51, 53, 55, 61, 63, 65, 71, 73, 75, 80, 81, 82, 95, 96].includes(code)) return String(code)
  if (code >= 96) return '96'
  if (code >= 80) return '80'
  return String(code)
}

export function wmoIcon(code: number): string {
  // emoji simples para MVP — depois trocar por SVG
  if (code === 0) return '☀️'
  if (code === 1) return '🌤️'
  if (code === 2) return '⛅'
  if (code === 3) return '☁️'
  if ([45, 48].includes(code)) return '🌫️'
  if ([51, 53, 55, 61, 63, 65].includes(code)) return '🌧️'
  if ([71, 73, 75].includes(code)) return '❄️'
  if ([80, 81, 82].includes(code)) return '🌦️'
  if ([95, 96].includes(code)) return '⛈️'
  return '☁️'
}
