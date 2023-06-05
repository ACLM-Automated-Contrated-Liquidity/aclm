import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Calling contract with the account: ", deployer.address)

    const manager = await ethers.getContractAt(
        "InvestmentManagerImpl",
        "0x197A2514cdbCc93890108CB6eC27FE9796dF3185",
        deployer
    )
    const tx = await manager.performUpkeep([], { gasLimit: 5000000 })
    const rec = await tx.wait()
    console.log(`upkeep tx: ${rec.transactionHash}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
