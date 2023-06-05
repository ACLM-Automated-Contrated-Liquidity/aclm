import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

import ERC20ABI from "../abi/erc20.abi.json"

async function main() {
    const networkName = hre.network.name
    console.log("Network name: ", networkName)
    const curConfig = NetAddrs[networkName]

    const USDC_ADDRESS = curConfig.USDC
    // const WETH_ADDRESS = curConfig.WETH

    // console.log(`ERC20 abi: ${JSON.stringify(ERC20ABI)}`)

    const [deployer] = await ethers.getSigners()
    console.log(`Deployer address: ${deployer.address}`)

    const USDC = new ethers.Contract(USDC_ADDRESS, ERC20ABI, deployer)
    const USDCBalance = await USDC.balanceOf(deployer.address)
    console.log(`USDC balance: ${ethers.utils.formatUnits(USDCBalance, 6)}`)

    const approveTx = await USDC.approve(
        "0xC67d0C1C0E788d68CA5D3d962b031Fa2e9B5dEec",
        ethers.utils.parseUnits("8000", 6)
    )
    const rec = await approveTx.wait()
    console.log(`approve tx: ${rec.transactionHash}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
