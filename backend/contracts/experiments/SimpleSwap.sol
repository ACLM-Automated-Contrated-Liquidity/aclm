// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import "hardhat/console.sol";

contract SimpleSwap {
    ISwapRouter internal immutable swapRouter;
    address internal immutable DAI;
    address internal immutable WETH9;
    uint24 public constant feeTier = 3000;
    
    constructor(ISwapRouter _swapRouter, address _weth, address _dai) {
        swapRouter = _swapRouter;
        WETH9 = _weth;
        DAI = _dai;
    }
    
    function swapWETHForDAI(uint256 amountIn) external returns (uint256 amountOut) {

        uint balance = IERC20(WETH9).balanceOf(msg.sender);
        console.log("WETH Balance of sender %s", balance);
        console.log("Amount to swap: %s", amountIn);

        // (bool success, bytes memory data) =
        //     WETH9.call(abi.encodeWithSelector(IERC20.approve.selector,  address(this), amountIn));
        // console.log("approve first from success = %s", success);
        // require(success && (data.length == 0 || abi.decode(data, (bool))), 'STF');
        //Transfer the specified amount of WETH9 to this contract.
        (bool success, bytes memory data) =
            WETH9.call(abi.encodeWithSelector(IERC20.transferFrom.selector,  msg.sender, address(this), amountIn));
        console.log("transfer from success = %s", success);
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'STFFFFF');

        // bool approved = IERC20(WETH9).approve(address(this), amountIn);
        // require(approved, "DIRECT APPROVE");
        // bool transferred = IERC20(WETH9).transferFrom(msg.sender, address(this), amountIn);
        // require(transferred, "DIRECT TRANSFER");
        
        // TransferHelper.safeTransferFrom(WETH9, msg.sender, address(this), amountIn);
        // Approve the router to spend WETH9.
        (success, data) = WETH9.call(abi.encodeWithSelector(IERC20.approve.selector, address(swapRouter), amountIn));
        console.log("approve success = %s", success);
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'SAAAA');
        
        // TransferHelper.safeApprove(WETH9, address(swapRouter), amountIn);
        // Note: To use this example, you should explicitly set slippage limits, omitting for simplicity
        uint256 minOut = /* Calculate min output */ 0;
        uint160 priceLimit = /* Calculate price limit */ 0;
        // Create the params that will be used to execute the swap
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: WETH9,
                tokenOut: DAI,
                fee: feeTier,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: minOut,
                sqrtPriceLimitX96: priceLimit
            });
        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
        console.log("amount out: ", amountOut);
    }
}