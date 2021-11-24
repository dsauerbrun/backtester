import kdj from 'kdj'
import { Aggregate, IchimokuCloudPoint } from "../../models";

export default (bars: Aggregate[], period: number = 9, signalPeriod: number = 3): Aggregate[] => {
  const kdjInputObj = {
    close: bars.map(x => x.close),
    high: bars.map(x => x.high),
    low: bars.map(x => x.low),
    period,
    signalPeriod
  }
  //const kdjOutput = ta.stochastic(kdjInputObj)
  const kdjOutput = kdj(kdjInputObj.close, kdjInputObj.low, kdjInputObj.high)

  for (let i = 0; i < period - 1; i++) {
    //kdjOutput.unshift(null)
  }
  const kdjBars = bars.map((bar, index) => {
    const previousK = index > 0 && kdjOutput.K[index - 1]
    const currentK = kdjOutput.K[index]
    const previousD = index > 0 && kdjOutput.D[index - 1]
    const currentD = kdjOutput.D[index]
    const previousJ = index > 0 && kdjOutput.J[index - 1]
    const currentJ = kdjOutput.J[index]
    bar.kdj = {k: currentK, d: currentD, j: currentJ}

    if (previousK < previousD && currentK > previousD) {
      bar.kdj.kBreak = 'BULLISH'
    } else if (previousK > previousD && currentK < previousD) {
      bar.kdj.kBreak = 'BEARISH'
    }

    if (previousJ < previousD && currentJ > previousD) {
      bar.kdj.jBreak = 'BULLISH'
    } else if (previousJ > previousD && currentJ < previousD) {
      bar.kdj.jBreak = 'BEARISH'
    }
    return bar
  })


  return kdjBars
}