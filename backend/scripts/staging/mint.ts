import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"
import { nearestUsableTick } from "@uniswap/v3-sdk"

async function computeTicks(poolAddr: string): Promise<[number, number]> {
    const pool = await ethers.getContractAt("IUniswapV3Pool", poolAddr)
    const slot = await pool.slot0()
    const spacing = await pool.tickSpacing()
    const tickLower = nearestUsableTick(slot.tick, spacing) - spacing * 1
    const tickUpper = nearestUsableTick(slot.tick, spacing) + spacing * 1
    return [tickLower, tickUpper]
}

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Calling contract with the account: ", deployer.address)

    const manager = await ethers.getContractAt(
        "InvestmentManager",
        "0x05AbA9E4f3A868B6dC951C8b35c1C7006691924c",
        deployer
    )

    const amountUSDC = await manager.getTokenBalance(NetAddrs[hre.network.name].USDC)
    console.log(`Balance usdc initial: ${ethers.utils.formatUnits(amountUSDC, 6)}`)

    const amountWETH = await manager.getTokenBalance(NetAddrs[hre.network.name].WETH)
    console.log(`Balance wrapped intial: ${ethers.utils.formatEther(amountWETH)}`)

    const [tickLower, tickUpper] = await computeTicks("0x19122424feA771eB813745393FBa3Ab8eACd4c7D")
    const mintTx = await manager.mint(
        [
            NetAddrs[hre.network.name].USDC,
            NetAddrs[hre.network.name].WETH,
            3000,
            tickLower,
            tickUpper,
            amountUSDC,
            amountWETH,
            "0x82437eaE4D114EB2c64E5C734eE088EDBaF73A4E",
        ],
        {
            gasLimit: 2000000,
        }
    )
    const mintRec = await mintTx.wait()
    console.log(`mint tx: ${mintRec.transactionHash}`)

    const amount0left = await manager.getTokenBalance(NetAddrs[hre.network.name].WETH)
    const amountWrapped = ethers.utils.formatEther(amount0left)
    console.log(`Balance wrapped left: ${amountWrapped}`)

    const amount1left = await manager.getTokenBalance(NetAddrs[hre.network.name].USDC)
    console.log(`Balance usdc left: ${ethers.utils.formatUnits(amount1left, 6)}`)

    const positions = await manager.getMyPositions()
    console.log(`Positions: ${positions}`)
    const info = await manager.getPositionInfo(positions[0])
    console.log(`Position info: ${JSON.stringify(info)}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
