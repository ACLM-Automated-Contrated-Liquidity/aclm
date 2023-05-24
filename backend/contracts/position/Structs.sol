// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

struct Position {
    address token0;
    address token1;
    int24 tickLower;
    int24 tickUpper;
    uint256 amount0Desired;
    uint256 amount1Desired;
    address holder;
    bool nativeFirst;
}
