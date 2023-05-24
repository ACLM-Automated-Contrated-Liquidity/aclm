// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "../external/interfaces.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "./Structs.sol";
import "hardhat/console.sol";

abstract contract Minter is IERC721Receiver {
    address internal immutable nonfungiblePositionManager;

    struct Deposit {
        address owner;
        int24 tickLower;
        int24 tickUpper;
        uint128 liquidity;
        address token0;
        address token1;
        uint amount0;
        uint amount1;
    }

    uint256[] public tokenIds;
    mapping(uint256 => Deposit) public deposits;

    constructor(address manager) {
        nonfungiblePositionManager = manager;
    }

    function newPosition(
        Position memory toMint
    ) internal returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1) {
        console.log(
            "Minting a new position for DAI / WETH with amounts: %s ; %s",
            toMint.amount0Desired,
            toMint.amount1Desired
        );

        // Approve the position manager
        TransferHelper.safeApprove(
            toMint.token0,
            nonfungiblePositionManager,
            toMint.amount0Desired
        );
        TransferHelper.safeApprove(
            toMint.token1,
            nonfungiblePositionManager,
            toMint.amount1Desired
        );

        // The values for tickLower and tickUpper may not work for all tick spacings.
        // Setting amount0Min and amount1Min to 0 is unsafe.
        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager
            .MintParams({
                token0: toMint.token0,
                token1: toMint.token1,
                fee: 3000,
                tickLower: -86940,
                tickUpper: -62940,
                amount0Desired: toMint.amount0Desired,
                amount1Desired: toMint.amount1Desired,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp
            });

        // Note that the pool defined by DAI/USDC and fee tier 0.3% must already be created and initialized in order to mint
        (tokenId, liquidity, amount0, amount1) = INonfungiblePositionManager(
            nonfungiblePositionManager
        ).mint(params);
        console.log("Minted position: %s, %s, %s", tokenId, amount0, amount1);
        _createDeposit(toMint.holder, tokenId, amount0, amount1);

        // Remove allowance and refund in both assets.
        // if (amount0 < toMint.amount0Desired) {
        //     uint256 refund0 = toMint.amount0Desired - amount0;
        //     TransferHelper.safeApprove(toMint.token0, nonfungiblePositionManager, refund0);
        //     TransferHelper.safeTransfer(toMint.token0, msg.sender, refund0);
        // }

        // if (amount1 < toMint.amount1Desired) {
        //     uint256 refund1 = toMint.amount1Desired - amount1;
        //     TransferHelper.safeApprove(toMint.token0, nonfungiblePositionManager, refund1);
        //     TransferHelper.safeTransfer(toMint.token1, msg.sender, refund1);
        // }
    }

    // Implementing `onERC721Received` so this contract can receive custody of erc721 tokens
    // Note that the operator is recorded as the owner of the deposited NFT
    function onERC721Received(
        address operator,
        address,
        uint256 tokenId,
        bytes calldata
    ) external override returns (bytes4) {
        require(msg.sender == nonfungiblePositionManager, "not a univ3 nft");
        console.log("Received LP token: %s; %s", operator, tokenId);
        _createDeposit(operator, tokenId, 0, 0);
        return this.onERC721Received.selector;
    }

    function _createDeposit(address owner, uint tokenId, uint amount0, uint amount1) internal {
        (
            ,
            ,
            address token0,
            address token1,
            ,
            int24 tickLower,
            int24 tickUpper,
            uint128 liquidity,
            ,
            ,
            ,

        ) = INonfungiblePositionManager(nonfungiblePositionManager).positions(tokenId);
        // set the owner and data for position
        deposits[tokenId] = Deposit({
            owner: owner,
            tickLower: tickLower,
            tickUpper: tickUpper,
            liquidity: liquidity,
            token0: token0,
            token1: token1,
            amount0: amount0,
            amount1: amount1
        });
    }
}
