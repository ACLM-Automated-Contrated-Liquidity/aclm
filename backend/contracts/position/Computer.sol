// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./Structs.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

import "hardhat/console.sol";

/**
 * @title Best Position Computer
 * @author Yury Samarin
 * @notice Here we use Chainlink Functions to iterate over many possible positions and compute yield.
 */
library Computer {
    IUniswapV3Factory internal constant factory =
        IUniswapV3Factory(0x1F98431c8aD98523631AE4a59f267346ea31F984);

    function bestPosition(address native, address other) internal view returns (Position memory) {
        address pool = factory.getPool(native, other, 3000);
        console.log("Found pool: %s", pool);
        (uint160 sqrtPriceX96, int24 tick, , , , , ) = IUniswapV3Pool(pool).slot0();
        console.log("SqrtPriceX96: %s; Pool tick: ", sqrtPriceX96);
        console.logInt(tick);
        bool nativeFirst = native < other;
        (address token0, address token1) = nativeFirst ? (native, other) : (other, native);
        int24 tickLower = tick - 5 * 3000;
        int24 tickUpper = tick + 5 * 3000;
        console.log("Ticks: ");
        console.logInt(tickLower);
        console.logInt(tickUpper);
        return Position(token0, token1, tickLower, tickUpper, 0, 0, msg.sender, nativeFirst);
    }
}
