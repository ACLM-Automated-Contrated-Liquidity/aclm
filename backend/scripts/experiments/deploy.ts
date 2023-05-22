import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying contracts with the account: ", deployer.address)

    const networkName = hre.network.name
    console.log("Network name: ", networkName)

    const curConfig = NetAddrs[networkName]

    const SWAP_ROUTER_ADDR = curConfig.swapRouter
    const WETH = curConfig.WETH
    const DAI = curConfig.DAI

    // const swapFactory = await ethers.getContractFactory("SimpleSwap")
    // const swap = await swapFactory.deploy(SWAP_ROUTER_ADDR, WETH, DAI)
    // await swap.deployed()
    // console.log("Deployed swap address:", swap.address)

    const examplesFactory = await ethers.getContractFactory("LiquidityExamples")
    const example = await examplesFactory.deploy("0xC36442b4a4522E871399CD717aBDD847Ab11FE88")
    await example.deployed()

    console.log("Deployed liquidity address:", example.address)
}

async function deployTokens(): Promise<{ token0: string; token1: string }> {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying tokens with the account:", deployer.address)

    const token0Factory = await ethers.getContractFactory("TestToken0")
    const token0 = await token0Factory.deploy()
    await token0.deployed()
    console.log("Deployed token 0 address:", token0.address)

    const token1Factory = await ethers.getContractFactory("TestToken1")
    const token1 = await token1Factory.deploy()
    await token1.deployed()
    console.log("Deployed token 1 address:", token1.address)
    return { token0: token0.address, token1: token1.address }
}

async function createPool(token0: string, token1: string) {}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
