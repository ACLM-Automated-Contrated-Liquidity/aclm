import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

import ERC20ABI from "../abi/erc20.abi.json"

async function main() {
    const [deployer] = await ethers.getSigners()

    const dex = "0x5E5713a0d915701F464DEbb66015adD62B2e6AE9"

    const WETH_ADDRESS = NetAddrs[hre.network.name].WETH
    const WETH = new ethers.Contract(WETH_ADDRESS, ERC20ABI, deployer)
    const appr = await WETH.approve(dex, ethers.utils.parseEther("0.1"))
    appr.wait()
    console.log(`Approved to spend WETH. ${JSON.stringify(appr)}`)

    const exampleContract = await ethers.getContractAt("SimpleSwap", dex)
    const connected = exampleContract.connect(deployer)
    const daiAmount = await connected.swapWETHForDAI(ethers.utils.parseEther("0.03"), {
        gasLimit: "3000000",
    })
    daiAmount.wait()
    console.log(`Swapped 0.03 ETH for DAI: ${JSON.stringify(daiAmount)}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
