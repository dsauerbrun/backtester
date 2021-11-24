import { restClient } from "@polygon.io/client-js";
const polygonApikey = process.env.POLYGON_APIKEY
const rest = restClient(polygonApikey);
import * as ta from 'technicalindicators'
import { fetchAggregateWithIndicators } from './aggregate_builder'
import { PercentageEntryStrategy, AllInStrategy } from "./entry_strategies";
import EntryPointCalculator from "./models/EntryPointCalculator";
import SuccessIdentifier from "./success_identifier";
import tickers from './tickers'

// you can use the api now
let startBank = 1000
const stockOwned = {aapl: 0}



const fetchLastClose = async () => {

  try {
    console.log('before close')
    //const close = await axios.get(`https://api.polygon.io/v1/open-close/AAPL/2020-10-14?adjusted=true&apiKey=${apikey}`)
    //console.log(close.data)
    //const bars = await axios.get(`https://api.polygon.io/v2/aggs/ticker/AAPL/range/5/minute/2020-10-14/2020-10-14?adjusted=true&sort=asc&limit=2000&apiKey=${apikey}`)
    const bars = await rest.stocks.aggregates('AAPL', 5, 'minute', '2020-10-14', '2020-10-14', {
      limit: 2000,
      adjusted: true,
      sort: 'asc'
    })
    const closePrices = bars.results.map(x => x.c)
    const rsiPeriod = 14
    const rsi = ta.rsi({values: closePrices, period: rsiPeriod})
    for (let i = 0; i < rsiPeriod; i++) {
      rsi.unshift(-1)
    }

    closePrices.forEach((closePrice, index) => {
      const rsiValue = rsi[index]
      if (rsiValue !== -1 && rsiValue < 25 && !stockOwned.aapl) {
        stockOwned.aapl = 1
        startBank -= closePrice
      }
      
      if (rsiValue > 35 && stockOwned.aapl) {
        stockOwned.aapl = 0 
        startBank += closePrice

      }
    })
    console.log(rsi, 'and count is', rsi.length)

    console.log('end with bank ', startBank)
    const lastQuote = await rest.stocks.previousClose('SPY')
    console.log(lastQuote, 'is last quote')

  } catch (err) {
    console.log('error is', err)
  }
}

const processTickers = async () => {
  const memeTickers = [
    'NVDA', 'PTON', 'TSLA', 'AMD', 'DKNG', 'MRNA', 'PFE', 'PYPL', 'FB', 'F',
    'PENN', 'DIS', 'WISH', 'AMZN', 'SOFI', 'AAPL', 'SQ', 'QQQ', 'INTC',
    'PYPL', 'CHGG', 'ROKU',
    // outlier tickers
    'NET', 'SAVA', 'OCGN', 'GME', 'BBBY', 'PLTR', 'LCID'
  ]

  const entryPointInstance = new EntryPointCalculator()

  for (const memeTicker of memeTickers) {
    const bars = await fetchAggregateWithIndicators(memeTicker, 1, 'day', '2020-05-01', '2021-11-06')
    console.log ('CHECKING SUCCESS FOR ', memeTicker)
    const entryBars = SuccessIdentifier(memeTicker, bars, 28, .2, .1, 60, 5)
    entryPointInstance.addEntries(entryBars)
  }

  const allInStrat = new AllInStrategy()
  const percentageStrat = new PercentageEntryStrategy(.2)
  const allInOutput = entryPointInstance.runStrategy(allInStrat)
  const percentageOutput = entryPointInstance.runStrategy(percentageStrat)



  console.log('here is output', allInOutput)

}

processTickers().then()
 
//fetchAggregateWithIndicators('AAPL', 1, 'day', '2020-05-01', '2021-11-01').then(bars => {
//  SuccessIdentifier(bars, 20, .2)
//})
const aboveTickers = tickers.filter(x => x["Market Cap"] > 1000000000)
/*fetchAggregateWithIndicators('BB', 1, 'day', '2020-05-01', '2021-11-01').then(bars => {
  SuccessIdentifier(bars, 20, .2, 60)
})*/

//findDifferences()