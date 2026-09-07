import { Skeleton } from '../ui/Skeleton'

export function DailyPreviewSkeleton() {
  return (
    <div className="glass overflow-hidden px-3 md:px-4 pt-3 pb-3">
      <Skeleton className="h-3 w-28 mb-3" />
      <div className="divide-y divide-white/10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 py-2.5">
            <Skeleton className="h-3 w-[72px] md:w-28" />
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-3 w-[84px] md:w-[110px]" />
            <Skeleton className="h-1.5 flex-1 mx-1 md:mx-2" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DailyListSkeleton() {
  return (
    <div className="glass p-3 md:p-4">
      <Skeleton className="h-3 w-20 mb-3" />
      <div className="space-y-0">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 py-2.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-3 w-[84px]" />
            <Skeleton className="h-1.5 flex-1 mx-2" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}
