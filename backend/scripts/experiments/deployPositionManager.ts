import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying contracts with the account: ", deployer.address)

    const networkName = hre.network.name
    console.log("Network name: ", networkName)

    const curConfig = NetAddrs[networkName]

    const factory = curConfig.poolFactory
    const WETH = curConfig.WETH

    const manager = await ethers.getContractFactory("NonfungiblePositionManagerCopy")
    const example = await manager.deploy(
        factory,
        WETH,
        "0x91ae842A5Ffd8d12023116943e72A606179294f3"
    )
    await example.deployed()

    console.log("Deployed nonfungible position manager: ", example.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
