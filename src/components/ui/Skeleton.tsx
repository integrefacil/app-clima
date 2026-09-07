type Props = {
  className?: string
  style?: React.CSSProperties
  'aria-hidden'?: boolean
}

export function Skeleton({ className = '', style, ...rest }: Props) {
  return (
    <div
      aria-hidden={rest['aria-hidden'] ?? true}
      style={style}
      className={`bg-white/10 animate-pulse rounded-xl ${className}`}
      {...rest}
    />
  )
}

export function SkeletonText({ className = '', width, height = 'h-3' }: { className?: string; width?: string; height?: string }) {
  return <Skeleton className={`${height} ${width ?? 'w-full'} ${className}`} />
}

export function SkeletonCircle({ size = 40, className = '' }: { size?: number; className?: string }) {
  return <Skeleton className={`rounded-full shrink-0 ${className}`} style={{ width: size, height: size } as never} />
}
