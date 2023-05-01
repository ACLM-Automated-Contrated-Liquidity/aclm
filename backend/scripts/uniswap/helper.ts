import { Token } from "./uniswap.interface";

export const getFeeTierPercentage = (tier: string): number => {
  if (tier === "100") return 0.01 / 100;
  if (tier === "500") return 0.05 / 100;
  if (tier === "3000") return 0.3 / 100;
  if (tier === "10000") return 1 / 100;
  return 0;
};

export const sortTokens = (token0: Token, token1: Token): Token[] => {
  if (token0.id < token1.id) {
    return [token0, token1];
  }
  return [token1, token0];
};

// return unique string in string[]
export const getUniqueItems = (arr: string[]): string[] => {
  return arr.filter((v, i, a) => a.indexOf(v) === i);
};
