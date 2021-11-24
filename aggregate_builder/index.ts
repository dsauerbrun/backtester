import { polygonClient, restClient, websocketClient } from "@polygon.io/client-js";
const apikey = process.env.POLYGON_APIKEY
const rest = restClient(apikey);
import { ichimokuBuilder, kdjBuilder, rsiBuilder, vmaBuilder } from "./ta_builders";
import { IAggV2Formatted } from "@polygon.io/client-js/lib/rest/stocks/aggregates";
import { Aggregate } from "../models";
import moment from "moment";
import { AggregatesCache } from "../caches";

// you can use the api now
export const fetchAggregateWithIndicators = async (
  symbol: string, unitInterval: number = 1, interval: string = 'day',
  startRange: string = '2020-10-14', endRange: string = '2020-10-14'
) => {
  try {
    const bars = await AggregatesCache(symbol, unitInterval, interval, startRange, endRange, {
      limit: 2000,
      adjusted: true,
      sort: 'asc'
    })

    let transformedBars = transformPolygonBars(bars)

    // calc ichimoku
    transformedBars = ichimokuBuilder(transformedBars)
    // calc rsi
    transformedBars = rsiBuilder(transformedBars)
    // calc kdj
    transformedBars = kdjBuilder(transformedBars)
    // calc vma
    transformedBars = vmaBuilder(transformedBars, 20)
    
    console.log(transformedBars)
    return transformedBars
  } catch (err) {
    console.log('error pulling aggregate', err)
  }


}

const transformPolygonBars = (bars: IAggV2Formatted[]): Aggregate[] => {
  const transformedBars: Aggregate[] = bars.map(bar => {
    const {close, open, low, high, volume, timestamp} = bar
    const datetime = moment(timestamp).add(1, 'day')
    return {close, open, low, high, volume, timestamp, datetime, readableDate: datetime.format('MM/DD/YYYY')}
  })

  return transformedBars
}