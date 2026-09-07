import { HeroSkeleton } from './HeroSkeleton'
import { HourlyPreviewSkeleton } from './HourlySkeleton'
import { DailyPreviewSkeleton } from './DailySkeleton'
import { Skeleton } from '../ui/Skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-3 md:space-y-4 view-enter" aria-busy="true" aria-label="Carregando conteúdo">
      <HeroSkeleton />
      <HourlyPreviewSkeleton />
      <DailyPreviewSkeleton />
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
        <div className="glass p-3 md:p-4">
          <Skeleton className="h-3 w-32 mb-3" />
          <Skeleton className="h-20 w-full rounded-2xl mb-3" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="glass p-3 md:p-4">
          <Skeleton className="h-3 w-12 mb-3" />
          <div className="divide-y divide-white/10">
            <div className="flex justify-between py-2.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex justify-between py-2.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="space-y-3 view-enter" aria-busy="true" aria-label="Carregando detalhes">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <HeroSkeleton />
      <Skeleton className="h-24 w-full glass" />
      <Skeleton className="h-64 w-full glass" />
    </div>
  )
}

export function SunDetailSkeleton() {
  return (
    <div className="space-y-3 view-enter" aria-busy="true" aria-label="Carregando detalhes do sol">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
      <HeroSkeleton />
      <div className="flex gap-1 p-1 glass !rounded-full w-fit">
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
      <div className="glass p-4 md:p-5">
        <Skeleton className="h-24 md:h-28 w-full rounded-2xl mb-3" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="glass p-4 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  )
}

export function MarineFullSkeleton() {
  return (
    <div className="space-y-4 view-enter" aria-busy="true" aria-label="Carregando dados do mar">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <HeroSkeleton />
      <div className="glass p-3 md:p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-2 py-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
