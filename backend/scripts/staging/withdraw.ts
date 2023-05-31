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
    const withdr = await manager.withdraw(ethers.utils.parseEther("0.2"))
    const rec = await withdr.wait()
    console.log(`withdrawn tx: ${JSON.stringify(rec)}`)

    const balance = await manager.getBalance()
    console.log(`balance: ${ethers.utils.formatEther(balance)}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
