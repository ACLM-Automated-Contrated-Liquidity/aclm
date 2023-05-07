import { estimateFee, getLiquidityFromTick, getPriceFromTick, getTokensAmountFromDepositAmountUSD, getTickFromPrice, getTokenAmountsFromDepositSimple, getLiquidityDelta } from '../lib/math';
import { assert } from 'chai';
import fs from 'fs';
import { Tick } from '../scripts/uniswap/uniswap.interface';
import bn from "bignumber.js";

// write test cases for estimateFee function here
describe('estimateFee', () => {
    const feeTier = "500";
    const volume = 286924638.21818775;
    const curTick = 201107;
    const P = 1850;//getPriceFromTick(curTick, "6", "18");
    // const tickFromPrice = getTickFromPrice(P, "6", "18");
    // console.log(`tickFromPrice: ${tickFromPrice}`);
    const Pl = 1750;
    const Pu = 1950;
    console.log(`price: ${P}; price lower: ${Pl}; price upper: ${Pu}`);
    const { amount0, amount1 } = getTokensAmountFromDepositAmountUSD(P, Pl, Pu, P, 1, 1000);
    console.log(`amount0: ${amount0}, amount1: ${amount1}`);
    const liquidityDelta = getLiquidityDelta(P, Pl, Pu, amount0, amount1, 6, 18);
    console.log(`liquidityDelta: ${liquidityDelta}`);
    const lines = fs.readFileSync("./test/ticks_usdc-eth.json", "utf-8");
    const ticks: Tick[] = JSON.parse(lines);
    console.log(`ticks length: ${ticks.length}`);
    const liquidity = getLiquidityFromTick(ticks, 201107);
    console.log(`liquidity: ${liquidity}`);
    it('should return more than 0', () => {
        const fee = estimateFee(liquidityDelta, liquidity, volume, feeTier );
        console.log(fee);
        assert.isAbove(fee, 0);
    })
});



