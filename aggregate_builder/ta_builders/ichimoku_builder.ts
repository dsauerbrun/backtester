import { IAggV2Formatted } from "@polygon.io/client-js/lib/rest/stocks/aggregates";
import moment from "moment";
import * as ta from 'technicalindicators'
import { Aggregate, IchimokuCloudPoint } from "../../models";

export default (bars: Aggregate[]): Aggregate[] => {
  const spanPeriod = 52
  const displacement = 26
  const basePeriod = 26
  const conversionPeriod = 9
  const ichimokuInputObj = {
    high: bars.map(bar => bar.high),
    low: bars.map(bar => bar.low),
    conversionPeriod,
    basePeriod,
    spanPeriod,
    displacement
  }
  const ichimokuOutput = ta.ichimokucloud(ichimokuInputObj)
  const ichimokuBars = bars.map((bar, index) => {
    if (index >= spanPeriod - 1) {
      const currentIchimokuBar = ichimokuOutput[index - spanPeriod + 1]
      const pastIchimokuBar = ichimokuOutput[index - spanPeriod - (displacement - 2)]
      const ichimokuObj: IchimokuCloudPoint = {
        conversion: currentIchimokuBar?.conversion,
        base: currentIchimokuBar?.base,
        spanA: pastIchimokuBar?.spanA,
        spanB: pastIchimokuBar?.spanB,
      }
      bar.ichimoku = ichimokuObj
    }

    return bar
  })

  ichimokuBars.forEach((currentBar, index) => {
    if (index === 0) {
      return
    }
    // signals as part of this
    // MOMENTUM: price breaks through base line
    // MOMENTUM: conversion line breaks above/below base line
    // TREND: price moves above/below cloud
    // EBB-FLOW WITHIN TREND: span A breaks above span B

    const previousBar = ichimokuBars[index - 1]
    if (!previousBar.ichimoku || !currentBar.ichimoku) {
      return
    }
    // conversion/baseline momentum logic
    if (previousBar.ichimoku?.conversion < previousBar.ichimoku?.base && currentBar.ichimoku?.conversion > currentBar.ichimoku?.base) {
      // conversion line has broken above baseline
      currentBar.ichimoku.baselineConversionlineBreak = 'BULLISH'
    }

    if (previousBar.ichimoku.conversion > previousBar.ichimoku.base && currentBar.ichimoku.conversion < currentBar.ichimoku.base) {
      // conversion line has broken below baseline
      currentBar.ichimoku.baselineConversionlineBreak = 'BEARISH'
    }

    // baseline pricebreak momentum logic
    if (previousBar.ichimoku.base > previousBar.high && currentBar.ichimoku.base < currentBar.high) {
      // price has broken above base line
      currentBar.ichimoku.baselinePriceBreak = 'BULLISH'
    }

    if (previousBar.ichimoku.base < previousBar.low && currentBar.ichimoku.base > currentBar.low) {
      // price has broken above base line
      currentBar.ichimoku.baselinePriceBreak = 'BEARISH'
    }

    // cloud price signal
    if (previousBar.ichimoku.spanA > previousBar.high && currentBar.ichimoku.spanA < currentBar.high) {
      currentBar.ichimoku.priceCloudBreak = 'BULLISH'
    }

    if (previousBar.ichimoku.spanB < previousBar.low && currentBar.ichimoku.spanB > currentBar.low) {
      currentBar.ichimoku.priceCloudBreak = 'BEARISH'
    }

    // cloud trend signal
    if (previousBar.ichimoku.spanA < previousBar.ichimoku.spanB && currentBar.ichimoku.spanA > currentBar.ichimoku.spanB) {
      currentBar.ichimoku.spanBreak = 'BULLISH'
    }
    if (previousBar.ichimoku.spanA > previousBar.ichimoku.spanB && currentBar.ichimoku.spanA < currentBar.ichimoku.spanB) {
      currentBar.ichimoku.spanBreak = 'BEARISH'
    }
  })

  return ichimokuBars
}