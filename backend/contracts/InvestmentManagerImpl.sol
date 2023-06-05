// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./api/InvestmentManager.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "./external/interfaces.sol";
import "hardhat/console.sol";
import "./utils/Arrays.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract InvestmentManagerImpl is InvestmentManager {
    mapping(address => uint) internal balances;

    struct Investment {
        address tokenContract;
        uint amount;
    }

    mapping(address => Investment[]) internal investments;

    mapping(uint => MintedPosition) internal minted;

    uint256[] public tokenIds;

    mapping(address => uint256[]) internal tokensByOwner;

    address internal immutable nativeWrapperContract;
    ISwapRouter internal immutable swapRouter =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    IUniswapV3Factory internal constant factory =
        IUniswapV3Factory(0x1F98431c8aD98523631AE4a59f267346ea31F984);
    INonfungiblePositionManager internal immutable nonfungiblePositionManager =
        INonfungiblePositionManager(0xC36442b4a4522E871399CD717aBDD847Ab11FE88);

    constructor(address _nativeWrapper) {
        nativeWrapperContract = _nativeWrapper;
    }

    event Received(address indexed, uint);

    receive() external payable {
        balances[msg.sender] += msg.value;
        console.log("Received some money: %s", msg.value);
        emit Received(msg.sender, msg.value);
    }

    function invest(InvestmentParams memory params) external payable override {
        deposit();
        wrapAll();
        (uint realAmount0, uint realAmount1) = _swapToTargetAmounts(
            params.token0,
            params.token1,
            params.fee,
            params.amount0,
            params.amount1,
            msg.sender
        );
        bool zeroToOne = params.token0 < params.token1;
        (address token0, address token1) = zeroToOne
            ? (params.token0, params.token1)
            : (params.token1, params.token0);
        (uint amount0, uint amount1) = zeroToOne
            ? (realAmount0, realAmount1)
            : (realAmount1, realAmount0);
        Position memory toMint = Position({
            token0: token0,
            token1: token1,
            fee: params.fee,
            tickLower: params.tickLower,
            tickUpper: params.tickUpper,
            amount0Desired: amount0,
            amount1Desired: amount1,
            holder: msg.sender
        });
        _mint(toMint);
    }

    function _swapToTargetAmounts(
        address token0,
        address token1,
        uint24 fee,
        uint amount0,
        uint amount1,
        address user
    ) internal returns (uint resultAmount0, uint resultAmount1) {
        uint existing = _getTokenUserBalance(nativeWrapperContract, user);
        if (token0 == nativeWrapperContract) {
            uint amountIn = _swapExactOutput(
                nativeWrapperContract,
                token1,
                amount1,
                fee,
                existing
            );
            resultAmount0 = Math.min(amount0, existing - amountIn);
            resultAmount1 = amount1;
            _decreaseDeposit(token0, user, amountIn);
            _deposit(token1, amount1, user);
        } else if (token1 == nativeWrapperContract) {
            uint amountIn = _swapExactOutput(
                nativeWrapperContract,
                token0,
                amount0,
                fee,
                existing
            );
            resultAmount1 = Math.min(amount1, existing - amountIn);
            resultAmount0 = amount0;
            _decreaseDeposit(token1, user, amountIn);
            _deposit(token0, amount0, user);
        } else {
            uint amountIn0 = _swapExactOutput(
                nativeWrapperContract,
                token0,
                amount0,
                fee,
                existing
            );
            uint amountIn1 = _swapExactOutput(
                nativeWrapperContract,
                token1,
                amount1,
                fee,
                existing - amountIn0
            );
            resultAmount0 = amount0;
            resultAmount1 = amount1;
            _decreaseDeposit(nativeWrapperContract, user, amountIn0 + amountIn1);
            _deposit(token0, amount0, user);
            _deposit(token1, amount1, user);
        }
        console.log("Target amounts: %s; %s", resultAmount0, resultAmount1);
    }

    function deposit() public payable override {
        balances[msg.sender] += msg.value;
        console.log("received value: %s", msg.value);
        uint depAmount = balances[msg.sender];
        console.log("full deposit amount: %s", depAmount);
    }

    function depositWrapped(uint amount) public override {
        WrappedToken(nativeWrapperContract).approve(address(this), amount);
        WrappedToken(nativeWrapperContract).transferFrom(msg.sender, address(this), amount);
        _deposit(nativeWrapperContract, amount, msg.sender);
    }

    function wrap(uint amount) external override {
        _wrap(msg.sender, amount);
    }

    function _wrap(address user, uint amount) internal {
        uint balance = balances[user];
        require(balance >= amount, "Not enough balance!");
        WrappedToken(nativeWrapperContract).deposit{value: amount}();
        balances[user] -= amount;
        // we should track individual user balances of the token.
        _deposit(nativeWrapperContract, amount, user);
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

    function wrapAll() public override {
        _wrap(msg.sender, balances[msg.sender]);
    }

    function swapKnownInput(
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint24 fee
    ) public override returns (uint amountOut) {
        amountOut = _swapExactInput(tokenIn, tokenOut, amountIn, fee);
        _decreaseDeposit(tokenIn, msg.sender, amountIn);
        _deposit(tokenOut, amountOut, msg.sender);
    }

    function _swapExactInput(
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

    function _decreaseDeposit(address depositToken, address owner, uint amount) internal {
        Investment[] storage inv = investments[owner];
        for (uint i = 0; i < inv.length; i++) {
            if (inv[i].tokenContract == depositToken) {
                inv[i].amount -= amount;
                break;
            }
        }
    }

    function swapKnownOutput(
        address tokenIn,
        address tokenOut,
        uint amountOutput,
        uint24 fee
    ) public override returns (uint amountIn) {
        uint existing = _getTokenUserBalance(tokenIn, msg.sender);
        amountIn = _swapExactOutput(tokenIn, tokenOut, amountOutput, fee, existing);
        _decreaseDeposit(tokenIn, msg.sender, amountIn);
        _deposit(tokenOut, amountOutput, msg.sender);
    }

    function _swapExactOutput(
        address tokenIn,
        address tokenOut,
        uint amountOutput,
        uint24 fee,
        uint amountInMaximum
    ) internal returns (uint amountIn) {
        safeApprove(tokenIn, address(swapRouter), amountInMaximum);

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: fee,
            recipient: address(this),
            deadline: block.timestamp,
            amountOut: amountOutput,
            amountInMaximum: amountInMaximum,
            sqrtPriceLimitX96: 0
        });

        amountIn = swapRouter.exactOutputSingle(params);

        if (amountIn < amountInMaximum) {
            safeApprove(tokenIn, address(swapRouter), 0);
        }
    }

    function mint(Position memory toMint) public override returns (uint) {
        return _mint(toMint);
    }

    function _mint(Position memory toMint) internal returns (uint) {
        // Approve the position manager
        safeApprove(toMint.token0, address(nonfungiblePositionManager), toMint.amount0Desired);
        safeApprove(toMint.token1, address(nonfungiblePositionManager), toMint.amount1Desired);

        // The values for tickLower and tickUpper may not work for all tick spacings.
        // Setting amount0Min and amount1Min to 0 is unsafe.
        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager
            .MintParams({
                token0: toMint.token0,
                token1: toMint.token1,
                fee: toMint.fee,
                tickLower: toMint.tickLower,
                tickUpper: toMint.tickUpper,
                amount0Desired: toMint.amount0Desired,
                amount1Desired: toMint.amount1Desired,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp
            });
        console.log("Mint call params: %s; %s; %s", params.token0, params.token1, params.fee);
        console.logInt(params.tickLower);
        console.logInt(params.tickUpper);
        console.log(
            ">>> %s; %s; %s",
            params.amount0Desired,
            params.amount1Desired,
            params.recipient
        );

        (uint tokenId, , uint amount0, uint amount1) = nonfungiblePositionManager.mint(params);
        console.log("Minted position: %s, %s, %s", tokenId, amount0, amount1);
        _saveMinted(toMint.holder, tokenId, amount0, amount1);
        _decreaseDeposit(toMint.token0, toMint.holder, amount0);
        _decreaseDeposit(toMint.token1, toMint.holder, amount1);
        return tokenId;
    }

    function _saveMinted(address owner, uint tokenId, uint amount0, uint amount1) internal {
        (
            ,
            ,
            address token0,
            address token1,
            uint24 fee,
            int24 tickLower,
            int24 tickUpper,
            uint128 liquidity,
            ,
            ,
            ,

        ) = INonfungiblePositionManager(nonfungiblePositionManager).positions(tokenId);
        // set the owner and data for position
        minted[tokenId] = MintedPosition({
            owner: owner,
            tickLower: tickLower,
            tickUpper: tickUpper,
            liquidity: liquidity,
            token0: token0,
            token1: token1,
            fee: fee,
            amount0: amount0,
            amount1: amount1
        });
        tokenIds.push(tokenId);
        tokensByOwner[owner].push(tokenId);
    }

    function getTokenBalance(address tokenContract) external view override returns (uint amount) {
        return _getTokenUserBalance(tokenContract, msg.sender);
    }

    function _getTokenUserBalance(
        address tokenContract,
        address owner
    ) internal view returns (uint amount) {
        Investment[] memory dep = investments[owner];
        for (uint i = 0; i < dep.length; i++) {
            if (dep[i].tokenContract == tokenContract) {
                return dep[i].amount;
            }
        }
        return 0;
    }

    function getNativeBalance() external view override returns (uint amount) {
        return balances[msg.sender];
    }

    function getPositionsCount() external view override returns (uint) {
        return IERC20(address(nonfungiblePositionManager)).balanceOf(address(this));
    }

    function getMyPositions() external view override returns (uint[] memory) {
        return tokensByOwner[msg.sender];
    }

    function getAllPosition() external view override returns (uint[] memory) {
        return tokenIds;
    }

    function getPositionInfo(uint tokenId) external view override returns (MintedPosition memory) {
        return minted[tokenId];
    }

    function getTickOutOfRangePositions() external view override returns (uint[] memory) {
        console.log("total positions: %s", tokenIds.length);
        uint[] memory outOfRange = new uint[](tokenIds.length);
        uint count;
        for (uint i = 0; i < tokenIds.length; i++) {
            MintedPosition memory dep = minted[tokenIds[i]];
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

    function updatePosition(uint tokenId) external override {}

    function removePosition(uint tokenId) external override {
        (, , , , , , , uint128 liquidity, , , , ) = nonfungiblePositionManager.positions(tokenId);

        INonfungiblePositionManager.DecreaseLiquidityParams
            memory params = INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: tokenId,
                liquidity: liquidity,
                amount0Min: 0,
                amount1Min: 0,
                deadline: block.timestamp
            });

        (uint amount0, uint amount1) = nonfungiblePositionManager.decreaseLiquidity(params);
        console.log("Decreased liquidity amounts: %s; %s", amount0, amount1);

        // nonfungiblePositionManager.approve(msg.sender, tokenId);
        // TODO: Check that only token owner can do that
        INonfungiblePositionManager.CollectParams memory collect = INonfungiblePositionManager
            .CollectParams({
                tokenId: tokenId,
                recipient: address(this),
                amount0Max: 2 ** 128 - 1,
                amount1Max: 2 ** 128 - 1
            });

        (uint oweAmount0, uint oweAmount1) = nonfungiblePositionManager.collect(collect);
        console.log("Owe amounts collected: %s; %s", oweAmount0, oweAmount1);

        MintedPosition memory dep = minted[tokenId];
        _deposit(dep.token0, oweAmount0, dep.owner);
        _deposit(dep.token1, oweAmount1, dep.owner);

        nonfungiblePositionManager.burn(tokenId);
        delete minted[tokenId];
        Arrays.removeByValue(tokenId, tokenIds);
        tokenIds.pop();
        Arrays.removeByValue(tokenId, tokensByOwner[dep.owner]);
        tokensByOwner[dep.owner].pop();
    }

    function unwrap(uint amount) external override {
        require(
            _getTokenUserBalance(nativeWrapperContract, msg.sender) >= amount,
            "Amount shouldn't be bigger than balance!"
        );
        WrappedToken(nativeWrapperContract).withdraw(amount);
    }

    function unwrapAll() external override {
        WrappedToken(nativeWrapperContract).withdraw(
            _getTokenUserBalance(nativeWrapperContract, msg.sender)
        );
    }

    function withdrawToken(address token) external override {
        uint tokenBalance = _getTokenUserBalance(token, msg.sender);
        console.log("Token balance to withdraw: %s", tokenBalance);
        WrappedToken(token).approve(msg.sender, tokenBalance);
        _decreaseDeposit(token, msg.sender, tokenBalance);
        WrappedToken(token).transfer(msg.sender, tokenBalance);
    }

    function withdrawBalance(uint amount) external override {
        uint balance = balances[msg.sender];
        require(balance >= amount, "Withdraw amount should not be more than balance!");
        balances[msg.sender] = balance - amount;
        payable(msg.sender).transfer(amount);
    }

    function withdrawAvailableBalance() external override {
        uint balance = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
    }

    function safeApprove(address token, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.approve.selector, to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "My SA");
    }

    function safeTransfer(address token, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "My TF");
    }

    fallback() external payable {
        balances[msg.sender] += msg.value;
        console.log("Received some money: %s", msg.value);
        emit Received(msg.sender, msg.value);
    }
}
