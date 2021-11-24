import { Moment } from "moment";

type Trend = 'BEARISH' | 'BULLISH' | null

export interface Aggregate {
  close: number
  open: number
  low: number
  high: number
  volume: number
  timestamp?: number
  datetime: Moment
  readableDate: string
  ichimoku?: IchimokuCloudPoint
  rsi?: RsiPoint
  vma?: VmaPoint
  kdj?: KdjPoint
  entry?: SuccessfulEntry
}

interface SuccessfulEntry {
  type: Trend
  periodToSuccess: number
}

export interface IchimokuCloudPoint {
  conversion: number
  base: number
  spanA: number
  spanB: number
  baselinePriceBreak?: Trend
  baselineConversionlineBreak?: Trend
  priceCloudBreak?: Trend
  spanBreak?: Trend
}

export interface RsiPoint {
  rsi: number
  break?: 'OVERBOUGHT' | 'OVERSOLD'
}

export interface VmaPoint {
  vma: number
}

export interface KdjPoint {
  k: number
  d: number
  j: number
  kBreak?: Trend
  jBreak?: Trend
}

export interface SymbolBar {
  symbol: string
  startBar: Aggregate
  gain: number
  betweenBars: Aggregate[]
  endBar: Aggregate
  result: 'gain' | 'loss'
}
export interface FailSuccess {
  fails: SymbolBar[]
  successes: SymbolBar[]
  all: SymbolBar[]
}