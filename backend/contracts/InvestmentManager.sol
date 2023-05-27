// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
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
contract InvestmentManager is Minter, Updater {
    mapping(address => uint) internal balances;

    struct Investment {
        address tokenContract;
        uint amount;
    }

    mapping(address => Investment[]) internal investments;

    mapping(address => uint256[]) internal tokensByOwner;

    address internal immutable nativeWrapperContract;
    ISwapRouter internal immutable swapRouter =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    IUniswapV3Factory internal constant factory =
        IUniswapV3Factory(0x1F98431c8aD98523631AE4a59f267346ea31F984);

    constructor(
        address nativeCurrencyWrapper,
        address _positionManager
    ) payable Minter(_positionManager) Updater(30) {
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

    function deposit() public payable {
        balances[msg.sender] += msg.value;
        console.log("received value: %s", msg.value);
        uint depAmount = balances[msg.sender];
        console.log("full deposit amount: %s", depAmount);
    }

    function wrapAndSwap(
        address otherToken,
        uint24 fee
    ) public returns (uint amountIn, uint amountOut) {
        uint dep = balances[msg.sender];
        _wrap(msg.sender, dep);
        uint256 wrappedBalance = IERC20(nativeWrapperContract).balanceOf(address(this));
        console.log("wrapped balance of contract: %s", wrappedBalance);
        amountIn = dep / 2;
        amountOut = _swapForPosition(nativeWrapperContract, otherToken, amountIn, fee);
        uint256 otherBalance = IERC20(otherToken).balanceOf(address(this));
        console.log("swapped token balance of contract: %s", otherBalance);
        _decreaseDeposit(nativeWrapperContract, msg.sender, amountIn);
        _deposit(otherToken, amountOut, msg.sender);
    }

    function createAndMintBestPosition(
        address otherToken,
        uint24 fee,
        uint amountNative,
        uint amountOther
    ) public returns (uint) {
        Position memory pos = Computer.bestPosition(nativeWrapperContract, otherToken, fee);
        if (pos.nativeFirst) {
            pos.amount0Desired = amountNative;
            pos.amount1Desired = amountOther;
        } else {
            pos.amount0Desired = amountOther;
            pos.amount1Desired = amountNative;
        }
        pos.holder = msg.sender;
        (uint tokenId, , uint amount0, uint amount1) = newPosition(pos);
        _decreaseDeposit(nativeWrapperContract, msg.sender, (pos.nativeFirst ? amount0 : amount1));
        console.log(
            "wrapped balance of contract: %s",
            IERC20(nativeWrapperContract).balanceOf(address(this))
        );
        _decreaseDeposit(otherToken, msg.sender, (pos.nativeFirst ? amount1 : amount0));
        console.log(
            "other token balance of contract: %s",
            IERC20(otherToken).balanceOf(address(this))
        );
        uint[] storage toks = tokensByOwner[msg.sender];
        toks.push(tokenId);
        console.log("Saved LP token ID: %s", tokenId);
        return tokenId;
    }

    /**
     * Single button, one transaction function to deposit, swap and mint best position in a pool.
     */
    function invest(address otherToken, uint24 fee) external payable {
        deposit();
        (uint amountIn, uint amountOut) = wrapAndSwap(otherToken, fee);
        createAndMintBestPosition(otherToken, fee, amountIn, amountOut);
    }

    function _wrap(address user, uint amount) internal {
        uint balance = balances[user];
        require(balance >= amount, "Not enough balance!");
        WrappedToken(nativeWrapperContract).deposit{value: amount}();
        balances[user] -= amount;
        // we should track individual user balances of the token.
        _deposit(nativeWrapperContract, amount, user);
    }

    function getPositions() external view returns (uint[] memory) {
        return tokensByOwner[msg.sender];
    }

    function _deposit(address depositToken, uint amount, address user) internal {
        Investment[] storage invArr = investments[user];
        bool found;
        for (uint i = 0; i < invArr.length; i++) {
            if (invArr[i].tokenContract == depositToken) {
                invArr[i].amount += amount;
                found = true;
                break;
            }
        }
        if (!found) {
            invArr.push(Investment(depositToken, amount));
        }
    }

    function _decreaseDeposit(address depositToken, address owner, uint amount) internal {
        Investment[] storage inv = investments[owner];
        for (uint i = 0; i < inv.length; i++) {
            if (inv[i].tokenContract == depositToken) {
                inv[i].amount -= amount;
                break;
            }
        }
    }

    function getDeposit(address tokenContract) external view returns (uint amount) {
        Investment[] memory dep = investments[msg.sender];
        for (uint i = 0; i < dep.length; i++) {
            if (dep[i].tokenContract == tokenContract) {
                return dep[i].amount;
            }
        }
        return 0;
    }

    function withdraw(uint amount) external {
        uint balance = balances[msg.sender];
        require(balance >= amount, "Withdraw amount should not be more than balance!");
        balances[msg.sender] = balance - amount;
        payable(msg.sender).transfer(amount);
    }

    function _swapForPosition(
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint24 fee
    ) internal returns (uint amountOut) {
        console.log("Swap amount in: %s", amountIn);
        TransferHelper.safeApprove(nativeWrapperContract, address(swapRouter), amountIn);
        uint256 minOut = /* Calculate min output */ 0;
        uint160 priceLimit = /* Calculate price limit */ 0;
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
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
