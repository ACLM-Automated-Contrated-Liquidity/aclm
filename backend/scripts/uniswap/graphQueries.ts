import axios from "axios";
import { getCurrentNetwork } from "../common/networks";
import {
//   getTokenLogoURL,
  getUniqueItems,
  sortTokens,
} from "./helper";
import {
  Pool,
  Position,
  Tick,
  Token,
} from "./uniswap.interface";
import { averageArray } from "../../lib/basemath";

export const getAvgTradingVolume = async (
  poolAddress: string,
  numberOfDays: number = 7
): Promise<number> => {
  const { poolDayDatas } = await _queryUniswap(`{
    poolDayDatas(skip: 1, first: ${numberOfDays}, orderBy: date, orderDirection: desc, where:{pool: "${poolAddress}"}) {
      volumeUSD
    }
  }`);

  const volumes = poolDayDatas.map((d: { volumeUSD: string }) =>
    Number(d.volumeUSD)
  );

  return averageArray(volumes);
};

const _getPoolTicksByPage = async (
  poolAddress: string,
  page: number
): Promise<Tick[]> => {
  const res = await _queryUniswap(`{
    ticks(first: 1000, skip: ${
      page * 1000
    }, where: { poolAddress: "${poolAddress}" }, orderBy: tickIdx) {
      tickIdx
      liquidityNet
      price0
      price1
    }
  }`);

  return res.ticks;
};
export const getPoolTicks = async (poolAddress: string): Promise<Tick[]> => {
  const PAGE_SIZE = 3;
  let result: Tick[] = [];
  let page = 0;
  while (true) {
    const [pool1, pool2, pool3] = await Promise.all([
      _getPoolTicksByPage(poolAddress, page),
      _getPoolTicksByPage(poolAddress, page + 1),
      _getPoolTicksByPage(poolAddress, page + 2),
    ]);

    result = [...result, ...pool1, ...pool2, ...pool3];
    if (pool1.length === 0 || pool2.length === 0 || pool3.length === 0) {
      break;
    }
    page += PAGE_SIZE;
  }
  return result;
};

export const getPoolFromPair = async (
  token0: Token,
  token1: Token
): Promise<Pool[]> => {
  const sortedTokens = sortTokens(token0, token1);

  let feeGrowthGlobal = `feeGrowthGlobal0X128\nfeeGrowthGlobal1X128`;
  if (getCurrentNetwork().disabledTopPositions) {
    feeGrowthGlobal = "";
  }

  const { pools } = await _queryUniswap(`{
    pools(orderBy: feeTier, where: {
        token0: "${sortedTokens[0].id}",
        token1: "${sortedTokens[1].id}"}) {
      id
      tick
      sqrtPrice
      feeTier
      liquidity
      token0Price
      token1Price
      ${feeGrowthGlobal}
    }
  }`);

  return pools as Pool[];
};

export const getCurrentTick = async (poolId: string): Promise<string> => {
  const { pool } = await _queryUniswap(`{
    pool(id: "${poolId}") {
      tick
    }
  }`);
  return pool.tick;
};

// private helper functions
const _queryUniswap = async (query: string): Promise<any> => {
  const { data } = await axios({
    url: getCurrentNetwork().subgraphEndpoint,
    method: "post",
    data: {
      query,
    },
  });

  const errors = data.errors;
  if (errors && errors.length > 0) {
    console.error("Uniswap Subgraph Errors", { errors, query });
    throw new Error(`Uniswap Subgraph Errors: ${JSON.stringify(errors)}`);
  }

  return data.data;
};

const _getPoolPositionsByPage = async (
  poolAddress: string,
//   currentTick: string,
  page: number
): Promise<Position[]> => {
  try {
    const res = await _queryUniswap(`{
    positions(orderBy:transaction__timestamp, orderDirection:desc, where: {
      pool: "${poolAddress}",
      liquidity_gt: 0
    }, first: 500, skip: ${page * 500}) {
      id
      owner
      tickLower {
        tickIdx
        feeGrowthOutside0X128
        feeGrowthOutside1X128
      }
      tickUpper {
        tickIdx
        feeGrowthOutside0X128
        feeGrowthOutside1X128
      }
      liquidity
      depositedToken0
      depositedToken1
      withdrawnToken0
      withdrawnToken1
      collectedFeesToken0
      collectedFeesToken1
      feeGrowthInside0LastX128
      feeGrowthInside1LastX128
      transaction {
        timestamp
      }
    }
  }`);

    return res.positions;
  } catch (e) {
    console.log("Error fetching pool positions", e);
    return [];
  }
};

export const getPoolPositions = async (
  poolAddress: string,
//   currentTick: string
): Promise<Position[]> => {
  const PAGE_SIZE = 3;
  let result: Position[] = [];
  let page = 0;
  while (true) {
    const [p1, p2, p3] = await Promise.all([
      _getPoolPositionsByPage(poolAddress, page),
      _getPoolPositionsByPage(poolAddress, page + 1),
      _getPoolPositionsByPage(poolAddress, page + 2),
    ]);

    result = [...result, ...p1, ...p2, ...p3];
    if (p1.length === 0 || p2.length === 0 || p3.length === 0) {
      break;
    }
    page += PAGE_SIZE;
  }
  return result;
};