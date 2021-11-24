import * as ta from 'technicalindicators'
import { Aggregate, IchimokuCloudPoint } from "../../models";

export default (bars: Aggregate[], overboughtValue: number = 70, oversoldValue: number = 30): Aggregate[] => {
  const period = 14
  const rsiInputObj = {
    values: bars.map(x => x.close),
    period
  }
  const rsiOutput = ta.rsi(rsiInputObj)
  for (let i = 0; i < period; i++) {
    rsiOutput.unshift(-1)
  }
  const rsiBars = bars.map((bar, index) => {
    const previousRsi = index > 0 && rsiOutput[index - 1]
    const currentRsi = rsiOutput[index]
    bar.rsi = {rsi: currentRsi}
    if (previousRsi) {
      if (previousRsi < overboughtValue && currentRsi > overboughtValue) {
        bar.rsi.break = 'OVERBOUGHT'
      } else if (previousRsi > oversoldValue && currentRsi < oversoldValue) {
        bar.rsi.break = 'OVERSOLD'
      }
    }

    return bar
  })


  return rsiBars
}