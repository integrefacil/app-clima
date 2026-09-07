import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs } from 'radix-ui'
import { fmtTime, fmtWeekdayLong } from '../lib/format'
import { getStorage, setStorage } from '../lib/storage'
import type { MarineWeekDay } from '../services/marineWeek'

type Props = {
  days: MarineWeekDay[]
  source: string
}

function plainWaveLabel(avg: number | null, t: (k: string) => string) {
  if (avg == null) return '--'
  if (avg < 0.5) return t('marine.waveSmall')
  if (avg < 1.1) return t('marine.waveMedium')
  return t('marine.waveBig')
}

function summaryForScore(score: number, t: (k: string) => string) {
  if (score >= 75) return t('marine.summaryGreat')
  if (score >= 55) return t('marine.summaryGood')
  if (score >= 40) return t('marine.summaryOk')
  return t('marine.summaryPoor')
}

function dayLabel(idx: number, dateStr: string, locale: string, t: (k: string) => string) {
  if (idx === 0) return t('daily.today')
  if (idx === 1) return t('daily.tomorrow')
  return fmtWeekdayLong(dateStr, locale)
}

export function MarineWeekList({ days }: Props) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const [marineTab, setMarineTab] = useState(() => getStorage('app-clima:tab:marine', 'resumo'))

  if (!days.length) {
    return (
      <div className="glass p-4">
        <p className="text-sm text-white/60">{t('marine.loading')}</p>
      </div>
    )
  }

  const bestScore = Math.max(...days.map((d) => d.score))
  const bestDay = days.find((d) => d.score === bestScore)

  return (
    <div className="glass p-3 md:p-4">
      <Tabs.Root value={marineTab} onValueChange={(v) => { setMarineTab(v); setStorage('app-clima:tab:marine', v) }} className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-xs md:text-sm text-white/60 uppercase tracking-widest">{t('marine.weekTitle')}</p>
          <Tabs.List className="glass flex rounded-full p-1 gap-1 self-start md:self-auto">
            <Tabs.Trigger value="resumo" className="px-3 py-1 rounded-full text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-sky-900 text-white/70">{t('marine.tabSummary')}</Tabs.Trigger>
            <Tabs.Trigger value="ondas" className="px-3 py-1 rounded-full text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-sky-900 text-white/70">{t('marine.tabWaves')}</Tabs.Trigger>
            <Tabs.Trigger value="mares" className="px-3 py-1 rounded-full text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-sky-900 text-white/70">{t('marine.tabTides')}</Tabs.Trigger>
          </Tabs.List>
        </div>

        {/* RESUMO — tabela colunas: Dia | Como está | Melhor hora */}
        <Tabs.Content value="resumo" className="focus:outline-none">
          {bestDay && (
            <div className="glass p-3 md:p-4 bg-white/15 text-center rounded-xl mb-3">
              <p className="text-xs uppercase tracking-widest text-white/60">{t('marine.bestDay')}</p>
              <p className="text-base md:text-lg font-semibold mt-1 capitalize">
                {new Intl.DateTimeFormat(locale, { weekday: 'long', day: '2-digit', month: 'short' }).format(new Date(`${bestDay.date}T12:00:00`))} — {summaryForScore(bestDay.score, t as never)}
              </p>
              <p className="text-sm text-white/70 mt-1">
                {bestDay.bestSlot ? `${t('marine.bestTimePlain')}: ${bestDay.bestSlot}` : ''} • {plainWaveLabel(bestDay.waveAvg, t as never)}
              </p>
            </div>
          )}
          <div className="overflow-x-auto -mx-3 md:mx-0">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-[11px] text-white/40">
                  <th className="text-left font-normal px-2 md:px-3 py-2 w-28 md:w-36">Dia</th>
                  <th className="text-center font-normal px-2 py-2">Como está</th>
                  <th className="text-center font-normal px-2 md:px-3 py-2 w-24 md:w-32 hidden md:table-cell">{t('marine.bestTimePlain')}</th>
                  <th className="text-center font-normal px-2 md:px-3 py-2 w-20">Avaliação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {days.map((d, idx) => {
                  const isBest = d.date === bestDay?.date
                  const label = dayLabel(idx, d.date, locale, t as never)
                  return (
                    <tr key={d.date} className={isBest ? 'bg-white/10' : ''}>
                      <td className={`px-2 md:px-3 py-3 ${isBest ? 'font-semibold text-white' : 'text-white/90'}`}>{label}</td>
                      <td className="px-2 py-3 text-center truncate max-w-[160px]">{summaryForScore(d.score, t as never)}</td>
                      <td className="px-2 md:px-3 py-3 text-center text-xs text-white/60 hidden md:table-cell">{d.bestSlot ?? '--'}</td>
                      <td className="px-2 md:px-3 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${isBest ? 'bg-white text-sky-900' : d.score >= 70 ? 'bg-emerald-400 text-sky-900' : d.score >= 50 ? 'bg-yellow-200 text-sky-900' : 'bg-white/15 text-white/60'}`}>
                          {d.score >= 75 ? t('marine.good') : d.score >= 50 ? t('marine.moderate') : t('marine.poor')}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* ONDAS — tabela colunas: Dia | Ondas | Melhor hora */}
        <Tabs.Content value="ondas" className="focus:outline-none">
          <div className="overflow-x-auto -mx-3 md:mx-0">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-[11px] text-white/40">
                  <th className="text-left font-normal px-2 md:px-3 py-2 w-28 md:w-36">Dia</th>
                  <th className="text-center font-normal px-2 py-2">Ondas</th>
                  <th className="text-center font-normal px-2 md:px-3 py-2 w-28 md:w-36">{t('marine.bestTimePlain')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {days.map((d, idx) => {
                  const label = dayLabel(idx, d.date, locale, t as never)
                  const isBest = d.date === bestDay?.date
                  return (
                    <tr key={d.date} className={isBest ? 'bg-white/10' : ''}>
                      <td className="px-2 md:px-3 py-3 text-white/90">{label}</td>
                      <td className="px-2 py-3 text-center">
                        <span className="inline-flex items-center gap-1 justify-center">
                          <span aria-hidden>🌊</span> {plainWaveLabel(d.waveAvg, t as never)}
                        </span>
                      </td>
                      <td className="px-2 md:px-3 py-3 text-center text-white/70 text-xs md:text-sm">{d.bestSlot ?? '--'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Tabs.Content>

        {/* MARÉS — tabela colunas com horários — cabeçalhos curtos e colunas auto */}
        <Tabs.Content value="mares" className="focus:outline-none">
          <div className="overflow-x-auto -mx-3 md:mx-0">
            <table className="w-full text-sm border-collapse table-auto">
              <thead>
                <tr className="text-[11px] text-white/40">
                  <th className="text-left font-normal px-3 py-2 whitespace-nowrap">Dia</th>
                  <th className="text-center font-normal px-3 py-2 whitespace-nowrap">1ª</th>
                  <th className="text-center font-normal px-3 py-2 whitespace-nowrap">2ª</th>
                  <th className="text-center font-normal px-3 py-2 whitespace-nowrap hidden md:table-cell">3ª</th>
                  <th className="text-center font-normal px-3 py-2 whitespace-nowrap hidden md:table-cell">4ª</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {days.map((d, idx) => {
                  const label = dayLabel(idx, d.date, locale, t as never)
                  const isBest = d.date === bestDay?.date
                  const tides = d.tides.slice(0, 4)
                  const cell = (i: number) => {
                    const td = tides[i]
                    if (!td) return '--'
                    return `${td.type === 'high' ? '▲' : '▼'} ${fmtTime(td.time, locale)}`
                  }
                  return (
                    <tr key={d.date} className={isBest ? 'bg-white/10' : ''}>
                      <td className={`px-3 py-3 whitespace-nowrap ${isBest ? 'font-semibold text-white' : 'text-white/90'}`}>{label}</td>
                      <td className="px-3 py-3 text-center font-medium text-white whitespace-nowrap">{cell(0)}</td>
                      <td className="px-3 py-3 text-center font-medium text-white whitespace-nowrap">{cell(1)}</td>
                      <td className="px-3 py-3 text-center font-medium text-white/70 hidden md:table-cell whitespace-nowrap">{cell(2)}</td>
                      <td className="px-3 py-3 text-center font-medium text-white/70 hidden md:table-cell whitespace-nowrap">{cell(3)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-white/30 text-center mt-3">{t('marine.disclaimer')}</p>
          <div className="md:hidden mt-3 overflow-x-auto -mx-3">
            <table className="w-full text-xs border-collapse table-auto">
              <thead>
                <tr className="text-[11px] text-white/30">
                  <th className="text-left font-normal px-3 py-1 whitespace-nowrap">Dia</th>
                  <th className="text-center font-normal px-3 py-1 whitespace-nowrap">3ª</th>
                  <th className="text-center font-normal px-3 py-1 whitespace-nowrap">4ª</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {days.map((d, idx) => {
                  const label = dayLabel(idx, d.date, locale, t as never)
                  const tides = d.tides.slice(0, 4)
                  const cell = (i: number) => {
                    const td = tides[i]
                    if (!td) return '--'
                    return `${td.type === 'high' ? '▲' : '▼'} ${fmtTime(td.time, locale)}`
                  }
                  return (
                    <tr key={d.date}>
                      <td className="px-3 py-2 text-white/60 whitespace-nowrap">{label}</td>
                      <td className="px-3 py-2 text-center text-white/70 whitespace-nowrap">{cell(2)}</td>
                      <td className="px-3 py-2 text-center text-white/70 whitespace-nowrap">{cell(3)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
