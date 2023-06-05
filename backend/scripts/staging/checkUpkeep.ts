import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Calling contract with the account: ", deployer.address)

    const manager = await ethers.getContractAt(
        "InvestmentManagerImpl",
        "0x061a9CB14Dc6cd0293C516A6B58b880d4F7c4EDD",
        deployer
    )
    const [upkeepNeeded, lps] = await manager.checkUpkeep([])
    console.log(`upkeep needed: ${upkeepNeeded}`)
    console.log(`tokens: ${lps}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
