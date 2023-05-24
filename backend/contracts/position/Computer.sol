// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "./Structs.sol";

/**
 * @title Best Position Computer
 * @author Yury Samarin
 * @notice Here we use Chainlink Functions to iterate over many possible positions and compute yield.
 */
library Computer {
    function bestPosition(
        address native,
        address other,
        uint256 deposit // in native currency
    ) internal view returns (Position memory) {
        // TODO compute token price in terms of other token based on pool
        uint amountOther = (deposit * 1800) / 2;
        bool nativeFirst = native < other;
        (address token0, address token1) = nativeFirst ? (native, other) : (other, native);
        (uint amount0, uint amount1) = nativeFirst
            ? (deposit / 2, amountOther)
            : (amountOther, deposit / 2);
        return Position(token0, token1, -86940, -62940, amount0, amount1, msg.sender, nativeFirst);
    }
}
