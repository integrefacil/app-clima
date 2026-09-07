import { Skeleton } from '../ui/Skeleton'

export function HeroSkeleton() {
  return (
    <div className="glass-strong overflow-hidden animate-pulse">
      <div className="text-center py-6 px-4 md:py-8 lg:py-10 md:text-left lg:flex lg:items-center lg:justify-between lg:gap-6">
        <div className="lg:flex-1 space-y-3">
          <Skeleton className="h-7 md:h-8 w-48 mx-auto lg:mx-0" />
          <Skeleton className="h-4 w-32 mx-auto lg:mx-0" />
          <Skeleton className="h-3 w-full max-w-xl mx-auto lg:mx-0" />
          <Skeleton className="h-3 w-40 mx-auto lg:mx-0" />
        </div>
        <div className="mt-4 lg:mt-0 shrink-0 flex flex-col items-center lg:items-end gap-2">
          <Skeleton className="h-[72px] md:h-[84px] lg:h-[96px] w-40" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
    </div>
  )
}
