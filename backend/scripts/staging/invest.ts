import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"
import { nearestUsableTick } from "@uniswap/v3-sdk"

async function computeTicks(poolAddr: string): Promise<[number, number]> {
    const pool = await ethers.getContractAt("IUniswapV3Pool", poolAddr)
    const slot = await pool.slot0()
    const spacing = await pool.tickSpacing()
    const tickLower = nearestUsableTick(slot.tick, spacing) - spacing * 5
    const tickUpper = nearestUsableTick(slot.tick, spacing) + spacing * 5
    return [tickLower, tickUpper]
}

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Calling contract with the account: ", deployer.address)

    const manager = await ethers.getContractAt(
        "InvestmentManager",
        "0x061a9CB14Dc6cd0293C516A6B58b880d4F7c4EDD",
        deployer
    )

    const [tickLower, tickUpper] = await computeTicks("0x19122424feA771eB813745393FBa3Ab8eACd4c7D")
    const tx = await manager.invest(
        [
            NetAddrs[hre.network.name].WETH,
            NetAddrs[hre.network.name].USDC,
            3000,
            ethers.utils.parseEther("0.05"),
            ethers.utils.parseUnits("1000", 6),
            tickLower,
            tickUpper,
        ],
        {
            value: ethers.utils.parseEther("0.1"),
            gasLimit: 5000000,
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
