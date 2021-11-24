import * as ta from 'technicalindicators'
import { Aggregate } from "../../models";

export default (bars: Aggregate[], period: number = 20): Aggregate[] => {
  const smaInputObj = {
    values: bars.map(x => x.volume),
    period
  }
  const smaOutput = ta.sma(smaInputObj)
  for (let i = 0; i < period - 1; i++) {
    smaOutput.unshift(-1)
  }
  const smaBars = bars.map((bar, index) => {
    const currentSma = smaOutput[index]
    bar.vma = {vma: currentSma}

    return bar
  })


  return smaBars
}