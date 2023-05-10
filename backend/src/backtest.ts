import * as graph from "./pools/uniswap/graphQueries"
import * as qMath from "./lib/math"
import fs from "fs"
import bn from "bignumber.js"
import { Tick, Token } from "./interfaces/uniswap.interface"
import { getPriceChart, getCoingeckoToken } from "./coingecko/coingecko"
import { getToken } from "./pools/uniswap/tokenQueries"

async function getWorkingPositions() {
    const tick = await graph.getCurrentTick("0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640")
    console.log(tick)
    const positions = await graph.getPoolPositions("0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640")
    console.log(positions.length)
    const tickInt = parseInt(tick)
    const filtered = positions
        .filter(
            (pos) =>
                parseInt(pos.tickLower.tickIdx) <= tickInt &&
                parseInt(pos.tickUpper.tickIdx) >= tickInt
        )
        .filter(
            (pos) => parseInt(pos.transaction.timestamp) > Date.now() / 1000 - 60 * 60 * 24 * 30
        )
    console.log(filtered.length)
    fs.writeFileSync("filtered.json", JSON.stringify(filtered))
}

async function getAllTicks() {
    const ticks = await graph.getPoolTicks("0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640")
    const liquidTicks = ticks.filter((tick) => !new bn(tick.liquidityNet).isZero())
    console.log(liquidTicks.length)
    fs.writeFileSync("ticks.json", JSON.stringify(liquidTicks))
}

export async function estimateFeeForUSDCETHPosition(Pl: number, Pu: number): Promise<number> {
    const tick = await graph.getCurrentTick("0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640")
    const P = qMath.getPriceFromTick(parseInt(tick), "6", "18")
    console.log(`Price from tick: ${P}`)
    const volume = await graph.getAvgTradingVolume("0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640", 7)
    const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    const priceChart0 = await getPriceChart(USDC)
    console.log(`Price chart: ${JSON.stringify(priceChart0)}`)
    const P0USD = priceChart0?.currentPriceUSD || 1

    const priceChart1 = await getPriceChart(WETH)
    console.log(`Price chart: ${JSON.stringify(priceChart1)}`)
    const P1USD = priceChart1?.currentPriceUSD || 1850

    const { amount0, amount1 } = qMath.getTokensAmountFromDepositAmountUSD(
        P,
        Pl,
        Pu,
        P1USD,
        P0USD,
        1000
    )
    console.log(`Amount0: ${amount0}; Amount1: ${amount1}`)
    const liquidityDelta = qMath.getLiquidityDelta(P, Pl, Pu, amount0, amount1, 6, 18)
    console.log(`liquidityDelta: ${liquidityDelta}`)
    // const lines = fs.readFileSync("./test/ticks_usdc-eth.json", "utf-8");
    const ticks = await graph.getPoolTicks("0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640")
    console.log(`ticks length: ${ticks.length}`)
    const liquidity = qMath.getLiquidityFromTick(ticks, parseInt(tick))
    console.log(`liquidity: ${liquidity}`)
    const fee = qMath.estimateFee(liquidityDelta, liquidity, volume, "500")
    console.log(fee)
    return fee
}

export async function estimateFeeGeneral(
    addr0: string,
    addr1: string,
    Pl: number,
    Pu: number,
    depositUSD: number
): Promise<number> {
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
    const poolAddr = pool.id
    if (!poolAddr) {
        throw new Error("Pool not found!")
    }
    console.log(`Chosen pool address: ${poolAddr}`)

    const P = qMath.getPriceFromTick(parseInt(pool.tick), "6", "18")
    console.log(`Price from tick: ${P}`)
    const volume = await graph.getAvgTradingVolume(poolAddr, 7)
    console.log(`Volume avg: ${volume}`)

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
