import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Calling contract with the account: ", deployer.address)

    const manager = await ethers.getContractAt(
        "InvestmentManager",
        "0x26c2A53fEf9ff15f246568d31aE7dAae5C56Dc4c",
        deployer
    )
    const tx = await manager.invest(NetAddrs[hre.network.name].USDC, 3000, {
        value: ethers.utils.parseEther("0.4"),
        gasLimit: 20000000,
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
