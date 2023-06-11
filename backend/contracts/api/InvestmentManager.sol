// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

interface InvestmentManager {
    receive() external payable;

    /**
     * Single button, one transaction function to deposit, swap and mint best position in a pool.
     * @param otherToken - ERC20 second token of the intended pool.
     * @param fee - pool fee basic points ( 100, 500, 3000 or 10000)
     * @param rangePercent100 - desired price range from 1 to 10000 ( 1 means 0,01% and 10000 means 100%)
     */
    struct InvestmentParams {
        address token0;
        address token1;
        uint24 fee;
        uint amount0;
        uint amount1;
        int24 tickLower;
        int24 tickUpper;
    }

    function invest(InvestmentParams memory params) external payable;

    /**
     * Just deposit some money without investing right now.
     */
    function deposit() external payable;

    /**
     * Directly deposit already wrapped native token on the contract.
     */
    function depositWrapped(uint amount) external;

    /**
     * Wraps a part of already deposited money. Error if balance is less than target amount.
     * @param amount - amount of native coin to wrap
     */
    function wrap(uint amount) external;

    /**
     * Wraps all of already deposited money.
     */
    function wrapAll() external;

    /**
     * Direct swap on contract. Income is taken from owner deposit and output stays on contract.
     * No tokens actually sent to user wallet.
     * @param tokenIn - token contract address to swap from
     * @param tokenOut - token contract address to swap to
     * @param amountIn - amount of 'from' token to swap
     * @param fee - target pool fee basis points
     */
    function swapKnownInput(
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint24 fee
    ) external returns (uint amountOut);

    /**
     * Direct swap on contract. Income is taken from owner's already deposited token and output stays on contract.
     * No tokens are actually sent to user wallet.
     * @param tokenIn - token contract address to swap from
     * @param tokenOut - token contract address to swap to
     * @param amountOutput - amount of 'to' token to get as a result of swap
     * @param fee - target pool fee basis points
     */
    function swapKnownOutput(
        address tokenIn,
        address tokenOut,
        uint amountOutput,
        uint24 fee
    ) external returns (uint amountIn);

    /**
     * Mint computed position on contract. Owner of position is contract itself.
     * @param otherToken - second token from pair to native.
     * @param fee - target pool fee basis points.
     * @param amountNative - computed position amount of native token.
     * @param amountOther - computed position amount of second token.
     */
    struct Position {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        address holder;
    }

    function mint(Position memory toMint) external returns (uint tokenId);

    /**
     * User's balance of token specified.
     * @param tokenContract - address of token contract deployed on the network
     */
    function getTokenBalance(address tokenContract) external view returns (uint amount);

    /**
     * User balance available to invest or withdraw.
     */
    function getNativeBalance() external view returns (uint amount);

    /**
     * Total positions on the contract
     */
    function getPositionsCount() external view returns (uint);

    /**
     * User's minted positions.
     */
    function getMyPositions() external view returns (uint[] memory);

    /**
     * All positions on the manager contract.
     */
    function getAllPosition() external view returns (uint[] memory);

    struct MintedPosition {
        address owner;
        int24 tickLower;
        int24 tickUpper;
        uint128 liquidity;
        address token0;
        address token1;
        uint24 fee;
        uint amount0;
        uint amount1;
    }

    /**
     * Detailed information about position specified.
     * @param tokenId - minted position ID.
     */
    function getPositionInfo(uint tokenId) external view returns (MintedPosition memory);

    /**
     * Returs array of positions which have their both ticks above or below current on the pool.
     */
    function getTickOutOfRangePositions() external view returns (uint[] memory);

    /**
     * Re-mints position to satisfy current tick on pool.
     * @param tokenId - position ID to be reminted.
     */
    function updatePosition(uint tokenId) external;

    /**
     * Collects fee, removes liquidity and burns position
     * @param tokenId - position ID to be removed.
     */
    function removePosition(uint tokenId) external returns (MintedPosition memory);

    function withdrawToken(address token) external;

    /**
     * Withdraw desired amount back to user's wallet.
     * @param amount - target native coin amount to withdraw.
     */
    function withdrawBalance(uint amount) external;

    /**
     * Withdraw all user balance back to wallet.
     */
    function withdrawAvailableBalance() external;
}
