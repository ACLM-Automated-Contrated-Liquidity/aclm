import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

async function main() {
    const networkName = hre.network.name
    const curConfig = NetAddrs[networkName]

    const DAI_ADDRESS = curConfig.DAI
    const WETH_ADDRESS = curConfig.WETH

    const [deployer] = await ethers.getSigners()
    console.log(`Deployer address: ${deployer.address}`)

    const factory = await ethers.getContractAt(
        "IUniswapV3Factory",
        NetAddrs[networkName].poolFactory
    )
    const pool = await factory.getPool(DAI_ADDRESS, WETH_ADDRESS, 3000)
    console.log(`Found pool: ${JSON.stringify(pool)}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
