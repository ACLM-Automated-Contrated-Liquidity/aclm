// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@uniswap/v3-core/contracts/libraries/TickMath.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol';
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';

import "hardhat/console.sol";

/**
 * @title General Investment Manager contract
 * @author Yury Samarin
 * @notice Currently just a skeleton. Planned as dApp top level smart contract.
 */
contract InvestmentManager {

    struct Deposit {
        address tokenContract;
        address owner;
        uint256 amount;
    }

    mapping(address => Deposit) internal deposits;

    struct Position {
        address token0;
        address token1;
        address pool;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
    }

    constructor() {
        
    }


    function deposit(address _depositToken, uint amount) external {
        //TODO: validate if token address is supported
        require(amount > 0, "Zero deposits are not allowed!");
        TransferHelper.safeTransferFrom(_depositToken, msg.sender, address(this), amount);
        deposits[msg.sender] = Deposit(_depositToken, msg.sender, amount);
    }

    function withdraw(uint amount) external {
        Deposit memory dep = deposits[msg.sender];
        require(dep.amount >= amount);
        TransferHelper.safeTransfer(dep.tokenContract, msg.sender, amount);
        dep.amount -= amount;
    }

    function computeBestPosition(address pool) public returns (Position memory) {
        
    }

    function swapForPosition() external {

    }

    function mintPosition() external {

    }

    function validatePosition() external {

    }

    function updatePosition() external {

    }

    function removePosition() external {

    }
}