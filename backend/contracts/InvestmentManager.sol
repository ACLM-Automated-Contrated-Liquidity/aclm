// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
// import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "./position/Structs.sol";
import "./position/Computer.sol";
import "./position/Minter.sol";

import "hardhat/console.sol";

/**
 * @title High Level Investment Manager contract
 * @author Yury Samarin
 * @notice Currently just a skeleton. Planned as dApp top level smart contract.
 */
contract InvestmentManager is Minter {
    mapping(address => uint) internal balances;

    struct Investment {
        address tokenContract;
        address owner;
        uint amount;
    }

    mapping(address => Investment) internal investments;

    mapping(address => uint256[]) internal tokensByOwner;

    //compute fee instead of hardcoding.
    uint reservedFee = 0.1e18;

    address internal immutable nativeWrapperContract;
    ISwapRouter internal immutable swapRouter =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    constructor(address nativeCurrencyWrapper) Minter(0xC36442b4a4522E871399CD717aBDD847Ab11FE88) {
        nativeWrapperContract = nativeCurrencyWrapper;
    }

    event Received(address indexed, uint);

    receive() external payable {
        balances[msg.sender] += msg.value;
        emit Received(msg.sender, msg.value);
    }

    function invest(address otherToken) external payable {
        balances[msg.sender] += msg.value;
        console.log("received value: %s", msg.value);
        uint depAmount = msg.value - reservedFee;
        console.log("pure deposit amount: %s", depAmount);
        _wrap(msg.sender, depAmount);
        uint256 wrappedBalance = IERC20(nativeWrapperContract).balanceOf(address(this));
        console.log("wrapped balance of contract: %s", wrappedBalance);
        Position memory pos = Computer.bestPosition(nativeWrapperContract, otherToken);
        // console.log("Position: %s; %s", pos.amount0Desired, pos.amount1Desired);
        uint amountIn = depAmount / 2; // Might be more complicated than that.
        uint amountOut = _swapForPosition(pos, amountIn);
        if (pos.nativeFirst) {
            pos.amount0Desired = amountIn;
            pos.amount1Desired = amountOut;
        } else {
            pos.amount0Desired = amountOut;
            pos.amount1Desired = amountIn;
        }
        pos.holder = msg.sender;
        uint256 otherBalance = IERC20(otherToken).balanceOf(address(this));
        console.log("swapped token balance of contract: %s", otherBalance);
        (uint tokenId, , , ) = newPosition(pos);
        uint[] storage toks = tokensByOwner[msg.sender];
        toks.push(tokenId);
    }

    function _wrap(address user, uint amount) internal {
        uint balance = balances[user];
        require(balance > amount);
        WrappedToken(nativeWrapperContract).deposit{value: amount}();
        // we should track individual user balances of the token.
        _deposit(nativeWrapperContract, amount, user);
    }

    function getPositions() external view returns (uint[] memory) {
        return tokensByOwner[msg.sender];
    }

    function deposit(address depositToken, uint amount) external {
        //only support in native wrapper token right now since we store 1 deposit per user.
        require(
            depositToken == nativeWrapperContract,
            "Only wrapper token is currently supported"
        );
        require(amount > 0, "Zero deposits are not allowed!");
        TransferHelper.safeTransferFrom(depositToken, msg.sender, address(this), amount);
        _deposit(depositToken, amount, msg.sender);
    }

    function _deposit(address depositToken, uint amount, address user) internal {
        // TransferHelper.safeTransferFrom(depositToken, user, address(this), amount);
        investments[user] = Investment(depositToken, user, amount);
    }

    function getDeposit() external view returns (address token, uint amount) {
        Investment memory dep = investments[msg.sender];
        return (dep.tokenContract, dep.amount);
    }

    function withdraw(uint amount) external {
        Investment storage dep = investments[msg.sender];
        require(dep.amount >= amount, "Withdraw amount should be less than deposit!");
        TransferHelper.safeTransfer(dep.tokenContract, msg.sender, amount);
        dep.amount -= amount;
    }

    function _swapForPosition(
        Position memory calculated,
        uint amountIn
    ) internal returns (uint amountOut) {
        console.log("Swap amount in: %s", amountIn);
        TransferHelper.safeApprove(nativeWrapperContract, address(swapRouter), amountIn);
        uint256 minOut = /* Calculate min output */ 0;
        uint160 priceLimit = /* Calculate price limit */ 0;
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: calculated.nativeFirst ? calculated.token0 : calculated.token1,
            tokenOut: calculated.nativeFirst ? calculated.token1 : calculated.token0,
            fee: 3000,
            recipient: address(this),
            deadline: block.timestamp,
            amountIn: amountIn,
            amountOutMinimum: minOut,
            sqrtPriceLimitX96: priceLimit
        });
        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
        console.log("amount out: ", amountOut);
    }

    // function validatePosition() external {}

    // function updatePosition() external {}

    function getPositionInfo(uint tokenId) external view returns (Deposit memory) {
        return deposits[tokenId];
    }

    function removePosition(uint tokenId) external {}
}

interface WrappedToken {
    function deposit() external payable;

    function withdraw(uint wad) external;
}
