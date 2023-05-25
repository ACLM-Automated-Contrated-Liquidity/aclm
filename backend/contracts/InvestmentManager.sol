// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
// import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "./position/Structs.sol";
import "./position/Computer.sol";
import "./position/Minter.sol";
import "./position/Updater.sol";

import "hardhat/console.sol";

/**
 * @title High Level Investment Manager contract
 * @author Yury Samarin
 * @notice Currently just a skeleton. Planned as dApp top level smart contract.
 */
contract InvestmentManager is Minter, Updater, Ownable {
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
    IUniswapV3Factory internal constant factory =
        IUniswapV3Factory(0x1F98431c8aD98523631AE4a59f267346ea31F984);

    constructor(
        address nativeCurrencyWrapper
    ) payable Minter(0xC36442b4a4522E871399CD717aBDD847Ab11FE88) Updater(30) {
        nativeWrapperContract = nativeCurrencyWrapper;
    }

    event Received(address indexed, uint);

    receive() external payable {
        balances[msg.sender] += msg.value;
        emit Received(msg.sender, msg.value);
    }

    function getBalance() external view returns (uint) {
        return balances[msg.sender];
    }

    function invest(address otherToken, uint24 fee) external payable {
        balances[msg.sender] += msg.value;
        console.log("received value: %s", msg.value);
        uint depAmount = balances[msg.sender];
        console.log("pure deposit amount: %s", depAmount);
        _wrap(msg.sender, depAmount);
        uint256 wrappedBalance = IERC20(nativeWrapperContract).balanceOf(address(this));
        console.log("wrapped balance of contract: %s", wrappedBalance);
        Position memory pos = Computer.bestPosition(nativeWrapperContract, otherToken, fee);
        // console.log("Position: %s; %s", pos.amount0Desired, pos.amount1Desired);
        uint amountIn = depAmount / 2; // Might be more complicated than that.
        uint amountOut = _swapForPosition(pos, amountIn, fee);
        _decreaseDeposit(msg.sender, amountIn);
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
        (uint tokenId, , uint256 amount0, uint256 amount1) = newPosition(pos);
        _decreaseDeposit(msg.sender, (pos.nativeFirst ? amount0 : amount1));
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

    // function depositNative(address depositToken, uint amount) external {
    //     //only support in native wrapper token right now since we store 1 deposit per user.
    //     require(
    //         depositToken == nativeWrapperContract,
    //         "Only wrapper token is currently supported"
    //     );
    //     require(amount > 0, "Zero deposits are not allowed!");
    //     TransferHelper.safeTransferFrom(depositToken, msg.sender, address(this), amount);
    //     _deposit(depositToken, amount, msg.sender);
    // }

    function _deposit(address depositToken, uint amount, address user) internal {
        // TransferHelper.safeTransferFrom(depositToken, user, address(this), amount);
        investments[user] = Investment(depositToken, user, amount);
    }

    function _decreaseDeposit(address owner, uint amount) internal {
        Investment storage inv = investments[owner];
        inv.amount = inv.amount - amount;
    }

    function getDeposit() external view returns (address token, uint amount) {
        Investment memory dep = investments[msg.sender];
        return (dep.tokenContract, dep.amount);
    }

    function withdraw(uint amount) external {
        uint balance = balances[msg.sender];
        require(balance >= amount, "Withdraw amount should not be more than balance!");
        balances[msg.sender] = balance - amount;
        payable(msg.sender).transfer(amount);
    }

    function _swapForPosition(
        Position memory calculated,
        uint amountIn,
        uint24 fee
    ) internal returns (uint amountOut) {
        console.log("Swap amount in: %s", amountIn);
        TransferHelper.safeApprove(nativeWrapperContract, address(swapRouter), amountIn);
        uint256 minOut = /* Calculate min output */ 0;
        uint160 priceLimit = /* Calculate price limit */ 0;
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: calculated.nativeFirst ? calculated.token0 : calculated.token1,
            tokenOut: calculated.nativeFirst ? calculated.token1 : calculated.token0,
            fee: fee,
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

    function getTickOutOfRangePositions() internal view override returns (uint[] memory) {
        uint[] memory outOfRange = new uint[](tokenIds.length);
        uint count;
        for (uint i = 0; i < tokenIds.length; i++) {
            Deposit memory dep = deposits[tokenIds[i]];
            address pool = factory.getPool(dep.token0, dep.token1, dep.fee);
            console.log("Position %s found pool: %s", tokenIds[i], pool);
            (, int24 tick, , , , , ) = IUniswapV3Pool(pool).slot0();
            if (dep.tickLower > tick || dep.tickUpper < tick) {
                outOfRange[i] = tokenIds[i];
                count++;
            }
        }
        uint[] memory res = new uint[](count);
        uint iter;
        for (uint i = 0; i < tokenIds.length; i++) {
            if (outOfRange[i] != 0) {
                res[iter] = outOfRange[i];
                iter++;
            }
        }
        return res;
    }

    function updatePosition(uint tokenId) internal override {
        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            uint128 liquidity,
            ,
            ,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        ) = INonfungiblePositionManager(nonfungiblePositionManager).positions(tokenId);
        console.log("tokens owed: %s; %s", tokensOwed0, tokensOwed1);

        INonfungiblePositionManager.DecreaseLiquidityParams
            memory params = INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: tokenId,
                liquidity: liquidity,
                amount0Min: 0,
                amount1Min: 0,
                deadline: block.timestamp
            });

        (uint amount0, uint amount1) = INonfungiblePositionManager(nonfungiblePositionManager)
            .decreaseLiquidity(params);
        console.log("Decreased liquidity amounts: %s; %s", amount0, amount1);

        // Check that only token owner can do that
        INonfungiblePositionManager.CollectParams memory collect = INonfungiblePositionManager
            .CollectParams({
                tokenId: tokenId,
                recipient: address(this),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

        (amount0, amount1) = INonfungiblePositionManager(nonfungiblePositionManager).collect(
            collect
        );
    }
}

interface WrappedToken {
    function deposit() external payable;

    function withdraw(uint wad) external;
}
