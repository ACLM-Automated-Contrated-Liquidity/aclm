import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

import ERC20ABI from "../abi/erc20.abi.json"

async function main() {
    const networkName = hre.network.name
    console.log("Network name: ", networkName)
    const curConfig = NetAddrs[networkName]

    const DAI_ADDRESS = curConfig.DAI
    const WETH_ADDRESS = curConfig.WETH

    // console.log(`ERC20 abi: ${JSON.stringify(ERC20ABI)}`)

    const [deployer] = await ethers.getSigners()
    console.log(`Deployer address: ${deployer.address}`)

    const WETH = new ethers.Contract(WETH_ADDRESS, ERC20ABI, deployer)
    const WETHBalance = await WETH.balanceOf(deployer.address)
    console.log(`Weth balance: ${WETHBalance}`)

    const DAI = new ethers.Contract(DAI_ADDRESS, ERC20ABI, deployer)
    const DAIBalance = await DAI.balanceOf(deployer.address)
    console.log(`Dai balance: ${DAIBalance}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
