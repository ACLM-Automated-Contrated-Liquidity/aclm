import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying contracts with the account: ", deployer.address)

    const factory = await ethers.getContractFactory("InvestmentManagerImpl")
    const contract = await factory.deploy(NetAddrs[hre.network.name].WETH, 30)
    await contract.deployed()
    console.log(`deployed at: ${contract.address}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
