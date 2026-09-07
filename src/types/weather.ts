export type Hour = { time: string; temp: number; code: number; precip?: number; isDay?: boolean }

export type Day = { label: string; code: number; max: number; min: number; precip: number }

export type MetricItem = { icon: string; label: string; value: string; sub?: string; detail?: string }
