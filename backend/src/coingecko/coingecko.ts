import axios from "axios"
import { Price, PriceChart } from "../interfaces/coingecko.interface"
import { getCurrentNetwork } from "../common/networks"
import tokenAddressMapping from "../common/tokenAddressMapping.json"

interface Token {
    id: string
    name: string
}
export const getCoingeckoToken = (contractAddress: string): Token | null => {
    const mapper = tokenAddressMapping as { [key: string]: any }
    const currentPlatform = getCurrentNetwork().id
    const result = mapper[currentPlatform][contractAddress]
    if (result) {
        return result as Token
    }
    const keys = Object.keys(mapper)
    for (let i = 0; i < keys.length; ++i) {
        const r = mapper[keys[i]][contractAddress]
        if (r) return r
    }
    return null
}

enum QueryPeriodEnum {
    ONE_DAY = "1",
    ONE_WEEK = "7",
    ONE_MONTH = "30",
    THREE_MONTH = "90",
    ONE_YEAR = "90",
    MAX = "max",
}
export const getPriceChart = async (
    contractAddress: string,
    queryPeriod: QueryPeriodEnum = QueryPeriodEnum.ONE_DAY
): Promise<PriceChart | null> => {
    const token = getCoingeckoToken(contractAddress)

    if (!token) return null

    const marketChartRes = (await axios.get(
        `https://api.coingecko.com/api/v3/coins/${token.id}/market_chart?vs_currency=usd&days=${queryPeriod}`
    )) as any

    const prices = marketChartRes.data.prices.map(
        (d: any) =>
            ({
                timestamp: d[0],
                value: d[1],
            } as Price)
    )

    return {
        tokenId: token.id,
        tokenName: token.name,
        currentPriceUSD: prices[prices.length - 1].value,
        prices,
    }
}
