import { IAggregateQuery } from "@polygon.io/client-js"
import redisclient from "./redisclient"
import { polygonClient, restClient, websocketClient } from "@polygon.io/client-js";
import { IAggV2Formatted } from "@polygon.io/client-js/lib/rest/stocks/aggregates";
const apikey = process.env.POLYGON_APIKEY
const rest = restClient(apikey);

export default async (symbol: string, unitInterval: number, timespan: string, from: string, to: string, query?: IAggregateQuery): Promise<IAggV2Formatted[]> => {
  const keyObj = { symbol, unitInterval, timespan, from, to, query}
  const key = Buffer.from(JSON.stringify(keyObj)).toString('base64') 
  const fetchedResp = await redisclient.get(key)
  if (fetchedResp) {
    return JSON.parse(fetchedResp)
  }

  try {
    const barsResp = await rest.stocks.aggregates(symbol, unitInterval, timespan, from, to, {
      limit: 2000,
      adjusted: true,
      sort: 'asc'
    })

    await redisclient.set(key, JSON.stringify(barsResp.results))

    return barsResp.results
  } catch (err) {
    console.log('error pulling aggregate', err)
  }


}