import { Pool } from "../interfaces/uniswap.interface"
import { getToken } from "./uniswap/tokenQueries"
import * as graph from "./uniswap/graphQueries"
import * as qMath from "../lib/math"
import { getPriceChart } from "../coingecko/coingecko"

async function findPool(addr0: string, addr1: string): Promise<Pool> {
    const token0 = await getToken(addr0)
    if (!token0) {
        throw new Error("Token not found!")
    }
    console.log(`Token 0: ${JSON.stringify(token0)}`)
    const token1 = await getToken(addr1)
    if (!token1) {
        throw new Error("Token not found!")
    }
    console.log(`Token 1: ${JSON.stringify(token1)}`)

    const pool = (await graph.getPoolFromPair(token0, token1))[0]
    console.log(`pool: ${JSON.stringify(pool)}`)
    return pool
}

async function evalTokenAmounts(
    P: number,
    Pl: number,
    Pu: number,
    depositUSD: number,
    addr0: string,
    addr1: string
) {
    const P0USD = (await getPriceChart(addr0))?.currentPriceUSD
    if (!P0USD) {
        throw new Error("Price not defined for token 0")
    }
    console.log(`Price USD: ${P0USD}`)

    const P1USD = (await getPriceChart(addr1))?.currentPriceUSD
    if (!P1USD) {
        throw new Error("Price not defined for token 1")
    }
    console.log(`Price chart: ${P1USD}`)

    const { amount0, amount1 } = qMath.getTokensAmountFromDepositAmountUSD(
        P,
        Pl,
        Pu,
        P1USD,
        P0USD,
        depositUSD
    )
    console.log(`Amount0: ${amount0}; Amount1: ${amount1}`)
    return { amount0: amount0, amount1: amount1, priceUSD0: P0USD, priceUSD1: P1USD }
}

export async function estimateFee(
    addr0: string,
    addr1: string,
    Pl: number,
    Pu: number,
    depositUSD: number
): Promise<number> {
    const pool = await findPool(addr0, addr1)
    const poolAddr = pool.id
    if (!poolAddr) {
        throw new Error("Pool not found!")
    }
    console.log(`Chosen pool address: ${poolAddr}`)

    const P = qMath.getPriceFromTick(parseInt(pool.tick), "6", "18")
    console.log(`Price from tick: ${P}`)
    const volume = await graph.getAvgTradingVolume(poolAddr, 7)
    console.log(`Volume avg: ${volume}`)

    const { amount0, amount1 } = await evalTokenAmounts(P, Pl, Pu, depositUSD, addr0, addr1)
    console.log(`Amount0: ${amount0}; Amount1: ${amount1}`)
    const liquidityDelta = qMath.getLiquidityDelta(P, Pl, Pu, amount0, amount1, 6, 18)
    console.log(`liquidityDelta: ${liquidityDelta}`)

    const ticks = await graph.getPoolTicks(poolAddr)
    console.log(`ticks length: ${ticks.length}`)
    const liquidity = qMath.getLiquidityFromTick(ticks, parseInt(pool.tick))
    console.log(`liquidity: ${liquidity}`)
    const fee = qMath.estimateFee(liquidityDelta, liquidity, volume, "3000")
    console.log(`Daily fee in USD: ${fee}`)
    return fee
}
