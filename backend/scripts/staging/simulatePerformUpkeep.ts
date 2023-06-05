import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

import KEEPER_ABI from "../abi/keeper.abi.json"

async function main() {
    const networkName = hre.network.name
    const curConfig = NetAddrs[networkName]

    const DAI_ADDRESS = curConfig.DAI
    const WETH_ADDRESS = curConfig.WETH

    const [deployer] = await ethers.getSigners()
    console.log(`Deployer address: ${deployer.address}`)

    const KEEPER = new ethers.Contract(
        "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2",
        KEEPER_ABI,
        deployer
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
