import { Aggregate, FailSuccess, SymbolBar } from "../models";
import EntryPointCalculator from "../models/EntryPointCalculator";


const bullishSignals = (bar: Aggregate) => {
  const bullishSignals = []
  
  if (bar.kdj?.jBreak === 'BULLISH') {
    bullishSignals.push('kdj.jbreak')
  }
  if (bar.kdj?.kBreak === 'BULLISH') {
    bullishSignals.push('kdj.kbreak')
  }
  if (bar.rsi?.break === 'OVERBOUGHT') {
    bullishSignals.push('rsi.break')
  }
  if (bar.ichimoku?.baselineConversionlineBreak === 'BULLISH') {
    bullishSignals.push('ichimoku.baselineConversionLineBreak')
  }
  if (bar.ichimoku?.baselinePriceBreak === 'BULLISH') {
    bullishSignals.push('ichimoku.baselinePriceBreak')
  } 
  if (bar.ichimoku?.priceCloudBreak === 'BULLISH') {
    bullishSignals.push('ichimoku.priceCloudBreak')
  }
  if (bar.ichimoku?.spanBreak === 'BULLISH') {
    bullishSignals.push('ichimoku.spanBreak')
  }

  return bullishSignals
}

// finds successful entries within period
// bullish only checking
export default (symbol: string, bars: Aggregate[], period: number = 20, percentChangeForSuccess: number = .1, percentChangeForBail: number = .1, startOffset: number = 0, numLeadingSignals: number = 3): SymbolBar[] => {
  // go back X periods to look for bullish signals before our entry pint
  const signalCheckerPeriod = 10
  let lastFailedFuturePrice = null
  let lastSucceededFuturePrice = null
  const retBars: SymbolBar[] = []
  bars.forEach((bar, i) => {
    if (i < startOffset) {
      // ignore first datapoints since they wont have indicator information on them
      return
    }
    const open = bar.open

    const successPrice = open * (1 + percentChangeForSuccess)
    const bailoutOfPositionPrice = open * (1 - percentChangeForBail)
    const previousPeriods = bars.slice(Math.max(0, i - signalCheckerPeriod), i + 1)
    const previousBullishPeriods = previousPeriods.filter(x => bullishSignals(x).length)
    const previousBullishPeriodSignalsList: string[] = previousBullishPeriods.map(x => bullishSignals(x))
      .reduce((allSignals, signals) => {
        return allSignals.concat(signals)
      }, [])
    
    const previousBullishPeriodSignalsSet = new Set(previousBullishPeriodSignalsList)
    // check if 20% increase within next 20 bars
    for (let indIter = i; indIter < i + period && bars[indIter]; indIter++) {
      const futurePrice = bars[indIter]
      if (futurePrice.close >= successPrice) {
        const successDate = bar.readableDate
        const cashInDate = futurePrice.readableDate

        if (previousBullishPeriodSignalsSet.size >= numLeadingSignals) {
          bar.entry = {type: 'BULLISH', periodToSuccess: indIter - i - 1}
          console.log('enter on ', bar, ` at price ${open} and close at ${futurePrice.close}, time to succeed is ${indIter - i}`)
          if (lastSucceededFuturePrice === futurePrice) {
            return
          }
          retBars.push({symbol, startBar: bar, betweenBars: bars.slice(i, indIter), gain: futurePrice.close / open, endBar: futurePrice, result: 'gain'})
          lastSucceededFuturePrice = futurePrice
          return
        }

      }
    }

    const endPeriodBar = bars[i + period]
    if (previousBullishPeriodSignalsSet.size >= numLeadingSignals && endPeriodBar && endPeriodBar.close < successPrice) {
      // we have bullish signals but no high
      console.log(`false buy for ${bar} for a loss of ${endPeriodBar.close / bar.open}`)
      if (endPeriodBar.close < bar.open) {
        if (lastFailedFuturePrice === endPeriodBar) {
          return
        }
        retBars.push({symbol, startBar: bar, betweenBars: bars.slice(i, i + period), gain: endPeriodBar.close / bar.open, endBar: endPeriodBar, result: 'loss'})
        lastFailedFuturePrice = endPeriodBar
      }
    }
  })

  return retBars
}