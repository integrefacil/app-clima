import { Skeleton } from '../ui/Skeleton'

export function MarineCardSkeleton() {
  return (
    <div className="glass p-3 md:p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="divide-y divide-white/10">
        <div className="flex items-center justify-between py-2.5 gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex items-center justify-between py-2.5 gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Skeleton className="h-2 w-32 mx-auto" />
    </div>
  )
}

export function MarineWeekListSkeleton() {
  return (
    <div className="glass p-3 md:p-4 space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-3 w-24" />
        <div className="flex gap-1 p-1 glass !rounded-full w-fit">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 py-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
