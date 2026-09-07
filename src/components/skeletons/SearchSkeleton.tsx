import { Skeleton } from '../ui/Skeleton'

export function SearchResultsSkeleton() {
  return (
    <div className="flex flex-col gap-1" aria-busy="true" aria-label="Carregando resultados">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="px-3 py-2.5 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-full" />
        </div>
      ))}
    </div>
  )
}
