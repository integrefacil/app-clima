import { Skeleton } from '../ui/Skeleton'

export function HourlyPreviewSkeleton() {
  return (
    <div className="glass overflow-hidden p-3 md:p-4">
      <Skeleton className="h-3 w-24 mb-3" />
      <div className="flex gap-3 md:gap-4 overflow-hidden pb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center min-w-[56px] md:min-w-[64px] gap-2">
            <Skeleton className="h-2.5 w-8" />
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="size-1 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function HourlyStripSkeleton() {
  return (
    <div className="glass p-3 md:p-4">
      <Skeleton className="h-3 w-20 mb-3" />
      <div className="flex gap-4 md:gap-6 pb-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center min-w-[52px] gap-2">
            <Skeleton className="h-2.5 w-8" />
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}
