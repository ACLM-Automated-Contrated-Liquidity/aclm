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
