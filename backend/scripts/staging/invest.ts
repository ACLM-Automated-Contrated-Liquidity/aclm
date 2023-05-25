import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Calling contract with the account: ", deployer.address)

    const manager = await ethers.getContractAt(
        "InvestmentManager",
        "0x31b70dB5583370e8Ce2EDAD3c928564dF2d985d6",
        deployer
    )
    const tx = await manager.invest(NetAddrs[hre.network.name].USDC, 500, {
        value: ethers.utils.parseEther("1"),
        gasLimit: 6000000,
    })
    const receipt = await tx.wait()
    console.log(`invested: ${JSON.stringify(receipt)}`)
    const [token, amount] = await manager.getDeposit()
    console.log(`amount: ${amount}`)
    const positions = await manager.getPositions()
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
