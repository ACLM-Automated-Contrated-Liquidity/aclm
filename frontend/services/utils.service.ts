import {BrowserProvider, Contract} from 'ethers';
import {computePoolAddress, FeeAmount, nearestUsableTick} from '@uniswap/v3-sdk';
import {Token} from '@uniswap/sdk-core';
import {MATIC, USDC} from '../interfaces/contract';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';


const UNISWAP_FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

export class Utils {
    static getTokensCount(
        investingSum: number,
        currentPrice: number,
        lowerPrice: number,
        upperPrice: number,
    ): [number, number] {
        if (lowerPrice > upperPrice) return [0, 0];
        if (currentPrice < lowerPrice) return [0, Utils.getTokensCount(investingSum, lowerPrice, lowerPrice, upperPrice)[1]];
        if (currentPrice > upperPrice) return [Utils.getTokensCount(investingSum, upperPrice, lowerPrice, upperPrice)[0], 0];

        let L = investingSum / (2 * Math.sqrt(currentPrice) - Math.sqrt(lowerPrice) - currentPrice/Math.sqrt(upperPrice));
        let tokenCount1 = L * (Math.sqrt(currentPrice) - Math.sqrt(lowerPrice));
        let tokenCount2 = L * (1/Math.sqrt(currentPrice) - 1/Math.sqrt(upperPrice)) * currentPrice;
        return [tokenCount1, tokenCount2];
    }


    static async computeTicks(addr1: string, addr2: string, fee: number) {
        const provider = new BrowserProvider((window as any).ethereum);
        const poolAddr = computePoolAddress({
            factoryAddress: UNISWAP_FACTORY,
            tokenA: new Token(USDC.chainId, USDC.address, 6),
            tokenB: new Token(MATIC.chainId, MATIC.address, 18),
            fee: FeeAmount.MEDIUM,
        });

        const pool = new Contract(poolAddr, IUniswapV3PoolABI, provider);
        const slot = await pool.slot0();
        const spacing = await pool.tickSpacing();
        const tickLower = nearestUsableTick(Number(slot.tick), Number(spacing)) - Number(spacing) * 20;
        const tickUpper = nearestUsableTick(Number(slot.tick), Number(spacing)) + Number(spacing) * 20;
        return [tickLower, tickUpper];
    }
}
