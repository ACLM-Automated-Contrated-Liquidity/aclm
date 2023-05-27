import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

import WETHABI from "../abi/weth.abi.json"

async function main() {
    const WETH_ADDRESS = NetAddrs[hre.network.name].WETH

    // console.log(`WETH abi: ${JSON.stringify(WETHABI)}`)

    const [deployer] = await ethers.getSigners()

    const WETH = new ethers.Contract(WETH_ADDRESS, WETHABI, deployer)
    const WETHBalance = await WETH.balanceOf(deployer.address)
    console.log(`Weth balance: ${WETHBalance}`)

    const receipt = await WETH.deposit({
        value: ethers.utils.parseEther("0.5"),
    })
    await receipt.wait(1)
    console.log(`Receipt: ${JSON.stringify(receipt)}`)

    console.log(`Weth balance: ${await WETH.balanceOf(deployer.address)}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
