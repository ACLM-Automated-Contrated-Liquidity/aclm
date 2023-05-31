// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
// import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "./position/Structs.sol";
import "./position/Computer.sol";
import "./position/Minter.sol";
import "./position/Updater.sol";
import "./utils/Arrays.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

import "hardhat/console.sol";

/**
 * @title High Level Investment Manager contract
 * @author Yury Samarin
 * @notice  Allows single button investment ( see #invest method).
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

    /**
     * computes pool position based on parameters and mints it.
     * @param otherToken - ERC20 second token of the intended pool.
     * @param fee - pool fee basic points ( 100, 500, 3000 or 10000)
     * @param amountNative - desired amount of native coin to invest
     * @param amountOther - desired amount of ERC20 pair to invest
     * @param rangePercent100 - desired price range from 1 to 10000 ( 1 means 0,01% and 10000 means 100%)
     */
    function createAndMintBestPosition(
        address otherToken,
        uint24 fee,
        uint amountNative,
        uint amountOther,
        uint24 rangePercent100
    ) public returns (uint) {
        Position memory pos = Computer.bestPosition(
            nativeWrapperContract,
            otherToken,
            fee,
            rangePercent100
        );
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
     * @param otherToken - ERC20 second token of the intended pool.
     * @param fee - pool fee basic points ( 100, 500, 3000 or 10000)
     * @param rangePercent100 - desired price range from 1 to 10000 ( 1 means 0,01% and 10000 means 100%)
     */
    function invest(address otherToken, uint24 fee, uint24 rangePercent100) external payable {
        deposit();
        (uint amountIn, uint amountOut) = wrapAndSwap(otherToken, fee);
        createAndMintBestPosition(otherToken, fee, amountIn, amountOut, rangePercent100);
    }

    function _wrap(address user, uint amount) public {
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

    function getDeposit(address tokenContract) public view returns (uint amount) {
        Investment[] memory dep = investments[msg.sender];
        for (uint i = 0; i < dep.length; i++) {
            if (dep[i].tokenContract == tokenContract) {
                return dep[i].amount;
            }
        }
        return 0;
    }

    function getPositionsCount() public view returns (uint) {
        return IERC20(nonfungiblePositionManager).balanceOf(address(this));
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
        safeApprove(tokenIn, address(swapRouter), amountIn);
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
        // The call to `exactInputSingle` executes the swap.`
        amountOut = swapRouter.exactInputSingle(params);
        console.log("amount out: ", amountOut);
    }

    // function validatePosition() external {}

    // function updatePosition() external {}

    function getPositionInfo(uint tokenId) external view returns (Deposit memory) {
        return deposits[tokenId];
    }

    function getTickOutOfRangePositions() public view override returns (uint[] memory) {
        console.log("total positions: %s", tokenIds.length);
        uint[] memory outOfRange = new uint[](tokenIds.length);
        uint count;
        for (uint i = 0; i < tokenIds.length; i++) {
            Deposit memory dep = deposits[tokenIds[i]];
            address pool = factory.getPool(dep.token0, dep.token1, dep.fee);
            console.log("Position %s found pool: %s", tokenIds[i], pool);
            (, int24 tick, , , , , ) = IUniswapV3Pool(pool).slot0();
            console.log("current tick");
            console.logInt(tick);
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

    function updatePosition(uint tokenId) public override {
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

        // TODO: Check that only token owner can do that
        INonfungiblePositionManager.CollectParams memory collect = INonfungiblePositionManager
            .CollectParams({
                tokenId: tokenId,
                recipient: address(this),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

        (uint oweAmount0, uint oweAmount1) = INonfungiblePositionManager(
            nonfungiblePositionManager
        ).collect(collect);
        console.log("Owe amounts collected: %s; %s", oweAmount0, oweAmount1);

        Deposit memory dep = deposits[tokenId];
        _deposit(dep.token0, amount0 + oweAmount0, dep.owner);
        _deposit(dep.token1, amount1 + oweAmount1, dep.owner);

        address otherToken = dep.token0 == nativeWrapperContract ? dep.token1 : dep.token0;
        // uint depOther = getDeposit(otherToken);
        console.log(
            "Curent deposit in other token: %s of holder: %s",
            getDeposit(otherToken),
            dep.owner
        );

        rebalance(otherToken, nativeWrapperContract, dep.fee, dep.owner);

        uint newToken = createAndMintBestPosition(
            otherToken,
            dep.fee,
            getDeposit(nativeWrapperContract),
            getDeposit(otherToken),
            1
        );
        console.log("Updated position to the new token: %s", newToken);
        // Removing empty old one
        INonfungiblePositionManager(nonfungiblePositionManager).burn(tokenId);
        delete deposits[tokenId];
        Arrays.removeByValue(tokenId, tokenIds);
        tokenIds.pop();
        Arrays.removeByValue(tokenId, tokensByOwner[dep.owner]);
        tokensByOwner[dep.owner].pop();
    }

    function rebalance(address token0, address token1, uint24 fee, address owner) public {
        uint dep0 = getDeposit(token0);
        console.log("Curent deposit of token0: %s", dep0);

        uint dep1 = getDeposit(token1);
        console.log("Curent deposit of token1: %s", dep1);

        address pool = factory.getPool(token0, token1, fee);
        (uint160 sqrtPriceX96, , , , , , ) = IUniswapV3Pool(pool).slot0();
        (uint amountIn, bool reverse) = computeAmountIn(dep0, dep1, sqrtPriceX96);
        console.log("Amount IN: %s; Reverse: %s", amountIn, reverse);
        uint amountOut = 0;
        if (amountIn != 0) {
            if (reverse) {
                amountOut = _swapForPosition(token1, token0, amountIn, fee);
                _decreaseDeposit(token1, owner, amountIn);
                _deposit(token0, amountOut, owner);
            } else {
                amountOut = _swapForPosition(token0, token1, amountIn, fee);
                _decreaseDeposit(token0, owner, amountIn);
                _deposit(token1, amountOut, owner);
            }
        }
        console.log("Swapped to amount: %s", amountOut);
    }

    function computeAmountIn(
        uint dep0,
        uint dep1,
        uint sqrtPriceX96
    ) public pure returns (uint, bool) {
        if (dep0 == 0) {
            return (dep1 / 2, true);
        } else if (dep1 == 0) {
            return (dep0 / 2, false);
        }
        bool reverse = false;
        uint price = (sqrtPriceX96 ** 2) / ((uint(2) ** 96) ** 2);
        if (price == 0) {
            price = (((uint(2) ** 96) ** 2) / uint(sqrtPriceX96)) * uint(sqrtPriceX96);
            reverse = true;
        }
        bool zeroToOne = false;
        uint proportion = 0;
        uint numer = reverse ? (dep1 * price) : dep1;
        uint denom = reverse ? dep0 : dep0 * price;
        if (numer > denom) {
            proportion = numer / denom;
        } else {
            proportion = denom / numer;
            zeroToOne = true;
        }
        if (proportion < 3) {
            // no need to rebalance
            return (0, false);
        }
        if (zeroToOne) {
            return ((dep0 * (proportion - 1)) / (proportion * 2), false);
        } else {
            return ((dep1 * (proportion - 1)) / (proportion * 2), true);
        }
    }
}

interface WrappedToken {
    function deposit() external payable;

    function withdraw(uint wad) external;
}
