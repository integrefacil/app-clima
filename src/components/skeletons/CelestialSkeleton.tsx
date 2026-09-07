import { Skeleton } from '../ui/Skeleton'

export function CelestialSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className={compact ? 'p-1 pt-2' : 'pt-2'}>
      <Skeleton className={`w-full ${compact ? 'h-20 md:h-24' : 'h-24 md:h-28'} rounded-2xl`} />
      <div className="flex justify-between mt-3 gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24" />
      </div>
      {!compact && <Skeleton className="h-2 w-48 mx-auto mt-2" />}
    </div>
  )
}

export function CelestialCardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className="glass p-4 md:p-5">
      <CelestialSkeleton compact={compact} />
    </div>
  )
}
