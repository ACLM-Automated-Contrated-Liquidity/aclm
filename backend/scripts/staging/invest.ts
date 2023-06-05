import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"
import { nearestUsableTick } from "@uniswap/v3-sdk"

async function computeTicks(poolAddr: string): Promise<[number, number]> {
    const pool = await ethers.getContractAt("IUniswapV3Pool", poolAddr)
    const slot = await pool.slot0()
    const spacing = await pool.tickSpacing()
    const tickLower = nearestUsableTick(slot.tick, spacing) - spacing * 20
    const tickUpper = nearestUsableTick(slot.tick, spacing) + spacing * 20
    return [tickLower, tickUpper]
}

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Calling contract with the account: ", deployer.address)

    const manager = await ethers.getContractAt(
        "InvestmentManager",
        "0xDa7AE6a19AE82d43bC00AB9c5DC470D5f5cAFb4b",
        deployer
    )

    const [tickLower, tickUpper] = await computeTicks("0x19122424feA771eB813745393FBa3Ab8eACd4c7D")
    const tx = await manager.invest(
        [
            NetAddrs[hre.network.name].WETH,
            NetAddrs[hre.network.name].USDC,
            3000,
            ethers.utils.parseEther("0.2"),
            ethers.utils.parseUnits("4774", 6),
            tickLower,
            tickUpper,
        ],
        {
            value: ethers.utils.parseEther("0.4"),
            gasLimit: 20000000,
        }
    )

    const receipt = await tx.wait()
    console.log(`invested tx: ${receipt.transactionHash}`)
    const amount = await manager.getTokenBalance(NetAddrs[hre.network.name].USDC)
    console.log(`amountUSDC: ${ethers.utils.formatUnits(amount, 6)}`)
    const amountWETH = await manager.getTokenBalance(NetAddrs[hre.network.name].WETH)
    console.log(`amountWETH: ${ethers.utils.formatEther(amountWETH)}`)

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
