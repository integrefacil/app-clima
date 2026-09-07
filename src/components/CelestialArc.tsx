import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { arcPoint, progressOnArc } from '../lib/celestial'
import { getMoonInfo, moonPhaseKey } from '../lib/moon'

type Props = {
  variant: 'sun' | 'moon'
  sunrise: string
  sunset: string
  sunriseISO?: string | null
  sunsetISO?: string | null
  moonrise?: string | null
  moonset?: string | null
  moonriseISO?: string | null
  moonsetISO?: string | null
  compact?: boolean
}

function MoonIcon({ phase, size = 14 }: { phase: number; size?: number }) {
  // fase 0=nova, 0.5=cheia; iluminação desenhada via máscara
  // normaliza para -1..1 para deslocamento da sombra
  const illum = (1 - Math.cos(2 * Math.PI * phase)) / 2
  const isWaxing = phase < 0.5
  // deslocamento do terminador: 0 nova -> sombra total, 0.5 cheia -> sem sombra
  // mapeia phase 0..1 para offset -1..1
  const offset = Math.cos(2 * Math.PI * phase) // 1 nova, -1 cheia
  // para clip: elipse com rx variando
  const rx = Math.abs(offset) * (size / 2)
  const shadowX = isWaxing ? size / 2 + offset * (size / 2) : size / 2 - 6
  // simplificação: usa dois círculos com clipPath
  // abordagem SVG: base clara + sombra escura com forma de elipse
  const uid = `moon-${Math.round(phase * 1000)}`
  return (
    <g>
      <defs>
        <clipPath id={`${uid}-clip`}>
          <circle cx={size / 2} cy={size / 2} r={size / 2} />
        </clipPath>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill="#E5E7EB" stroke="white" strokeWidth={0.8} />
      {/* sombra */}
      {phase < 0.02 || phase > 0.98 ? (
        <circle cx={size / 2} cy={size / 2} r={size / 2} fill="#1e293b" clipPath={`url(#${uid}-clip)`} />
      ) : phase > 0.48 && phase < 0.52 ? null : (
        <ellipse
          cx={isWaxing ? size / 2 + (1 - illum) * size * 0.9 * (phase < 0.25 ? -1 : 1) : size / 2 - (1 - illum) * size * 0.9}
          cy={size / 2}
          rx={rx + size * 0.35}
          ry={size / 2 + 1}
          fill={phase < 0.5 ? '#1e293b' : '#1e293b'}
          clipPath={`url(#${uid}-clip)`}
          opacity={0.95}
          style={{ display: phase > 0.45 && phase < 0.55 ? 'none' : undefined }}
        />
      )}
      {/* fallback simples para fases intermediárias usando overlay */}
      {(() => {
        if (phase < 0.02 || phase > 0.98 || (phase > 0.48 && phase < 0.52)) return null
        // correção: para quarto crescente/minguante usa retângulo
        // 0.25 quarto crescente: metade escura esquerda
        // 0.75 quarto minguante: metade escura direita
        if (phase > 0.22 && phase < 0.28) {
          return <rect x={-1} y={-1} width={size / 2 + 1} height={size + 2} fill="#1e293b" clipPath={`url(#${uid}-clip)`} />
        }
        if (phase > 0.72 && phase < 0.78) {
          return <rect x={size / 2} y={-1} width={size / 2 + 1} height={size + 2} fill="#1e293b" clipPath={`url(#${uid}-clip)`} />
        }
        // gibosas: usa elipse maior já desenhada
        // placeholder para evitar duplicação
        void shadowX
        return null
      })()}
    </g>
  )
}

export function CelestialArc({ variant, sunrise, sunset, sunriseISO, sunsetISO, moonrise, moonset, moonriseISO, moonsetISO, compact }: Props) {
  const { t } = useTranslation()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    const onVis = () => {
      if (document.visibilityState === 'visible') setNow(new Date())
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const isSun = variant === 'sun'

  const moonInfo = useMemo(() => getMoonInfo(now), [now])
  const phaseKey = moonPhaseKey(moonInfo.phase)

  const hasMoonTimes = Boolean(moonrise && moonset) || Boolean(moonriseISO && moonsetISO)
  const isNoTimes = !isSun && !hasMoonTimes

  const { progress, isActive } = useMemo(() => {
    if (isSun) {
      const p = progressOnArc(now, sunriseISO, sunsetISO)
      if (p == null) return { progress: 0.5, isActive: false }
      return { progress: p, isActive: p > 0 && p < 1 }
    }
    const p = progressOnArc(now, moonriseISO, moonsetISO)
    // lua sem horários: usa centro (0.5) para animação idêntica ao sol, mas sem barra de progresso enganosa
    if (p == null) return { progress: 0.5, isActive: false }
    return { progress: p, isActive: p > 0 && p < 1 }
  }, [isSun, now, sunriseISO, sunsetISO, moonriseISO, moonsetISO])

  // anima progresso interpolando pelo arco (não em linha reta) — move o astro sobre a curva
  const [animProgress, setAnimProgress] = useState<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const fromRef = useRef<number>(0)
  const toRef = useRef<number>(0)

  useEffect(() => {
    if (typeof progress !== 'number') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setAnimProgress(null)
      return
    }
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // entrada: sempre começa na borda do arco (0) e desliza até o progresso real
    const isFirst = animProgress == null
    const from = isFirst ? 0 : (animProgress ?? 0)
    const to = progress
    if (from === to) return
    if (prefersReduced) {
      setAnimProgress(to)
      return
    }
    fromRef.current = from
    toRef.current = to
    startRef.current = performance.now()
    const duration = isFirst ? 1100 : 700
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
    const tick = (nowMs: number) => {
      const elapsed = nowMs - startRef.current
      const t = Math.min(1, elapsed / duration)
      const v = fromRef.current + (toRef.current - fromRef.current) * ease(t)
      setAnimProgress(v)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // animProgress intencionalmente fora das deps para não reiniciar a cada frame
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, variant])

  // progresso usado para render: animado se houver, senão o real (reduce motion)
  const visualProgress = typeof animProgress === 'number' ? animProgress : (typeof progress === 'number' ? progress : null)
  const visualPoint = useMemo(() => {
    if (typeof visualProgress === 'number') return arcPoint(visualProgress)
    return arcPoint(0.5)
  }, [visualProgress])

  // arco base: M20 92 A80 80 0 0 1 180 92, viewBox 0 0 200 112 — 12px de topo para não cortar no meio-dia

  return (
    <div className={compact ? 'p-1 pt-2' : 'pt-2'}>
      {/* sem título redundante no compacto; título fica no SummaryCard se necessário */}
      <svg viewBox="0 0 200 112" className={compact ? 'w-full h-20 md:h-24 overflow-visible' : 'w-full h-24 md:h-28 overflow-visible'} role="img" aria-label={isSun ? t('celestial.sunArcLabel') : t(phaseKey)}>
        {/* trilha */}
        <path d="M20 92 A80 80 0 0 1 180 92" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.6" strokeLinecap="round" />
        {/* progresso até o astro — animado via rAF pela curva; lua com mesma espessura da amarela do sol, inclusive no fallback sem horários */}
        {typeof progress === 'number' && (
          <path
            d="M20 92 A80 80 0 0 1 180 92"
            fill="none"
            stroke={isSun ? 'rgba(250,204,21,0.95)' : 'rgba(226,232,240,0.95)'}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray={`${(visualProgress ?? 0) * 251.2} 251.2`}
          />
        )}
        {/* baseline */}
        <line x1="14" y1="92" x2="186" y2="92" stroke="rgba(255,255,255,0.14)" strokeWidth="1" strokeLinecap="round" />
        {/* marcadores nas pontas */}
        <circle cx="20" cy="92" r="2.2" fill="rgba(255,255,255,0.7)" />
        <circle cx="180" cy="92" r="2.2" fill="rgba(255,255,255,0.7)" />

        {/* astro — posição vem de arcPoint(visualProgress), rAF move pela curva, sem transição linear */}
        {isSun ? (
          <g transform={`translate(${visualPoint.x} ${visualPoint.y})`} style={{ opacity: isActive ? 1 : 0.42 }}>
            {/* glow */}
            <circle r="10" fill="rgba(250,204,21,0.22)" />
            <circle r="6.5" fill="#facc15" stroke="white" strokeWidth="1.2" />
          </g>
        ) : (
          <g transform={`translate(${visualPoint.x - 7} ${visualPoint.y - 7})`} style={{ opacity: isNoTimes ? 1 : isActive ? 1 : 0.38 }}>
            <MoonIcon phase={moonInfo.phase} size={14} />
          </g>
        )}
      </svg>

      {/* linha única: horários — sem repetir título */}
      <div className="flex justify-between text-xs md:text-sm mt-1">
        {isSun ? (
          <>
            <span className="text-white/65">
              {t('sunset.sunrise')} {sunrise}
            </span>
            <span className="text-white/65">
              {t('sunset.sunset')} {sunset}
            </span>
          </>
        ) : hasMoonTimes ? (
          <>
            <span className="text-white/65">
              {t('moon.rise')} {moonrise ?? '--'}
            </span>
            <span className="text-white/65">
              {t('moon.set')} {moonset ?? '--'}
            </span>
          </>
        ) : (
          <>
            <span className="text-white/65">{t(phaseKey)}</span>
            <span className="text-white/45 text-[11px]">
              {Math.round(moonInfo.illumination * 100)}% • {t('moon.age', { days: moonInfo.age.toFixed(1) })}
            </span>
          </>
        )}
      </div>
      {!compact && !isSun && hasMoonTimes && (
        <p className="text-[11px] text-white/45 mt-1 text-center">
          {t(phaseKey)} • {Math.round(moonInfo.illumination * 100)}% {t('moon.illuminated')}
        </p>
      )}
      {!compact && isSun && (
        <p className="text-[11px] text-white/35 mt-1 text-center">{!isActive ? t('celestial.sunBelow') : t('celestial.sunHint')}</p>
      )}
      {!compact && !isSun && isNoTimes && (
        <p className="text-[11px] text-white/35 mt-1 text-center">{t('moon.noTimesHint')}</p>
      )}
    </div>
  )
}

// compat: mantém SunsetArc para imports antigos
export function SunsetArc(props: { sunrise: string; sunset: string; compact?: boolean; sunriseISO?: string | null; sunsetISO?: string | null }) {
  return <CelestialArc variant="sun" {...props} />
}
