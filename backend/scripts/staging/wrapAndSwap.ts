import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Calling contract with the account: ", deployer.address)

    const manager = await ethers.getContractAt(
        "InvestmentManager",
        "0x26c2A53fEf9ff15f246568d31aE7dAae5C56Dc4c",
        deployer
    )
    const wrapTx = await manager.wrapAndSwap(NetAddrs[hre.network.name].USDC, 3000)
    const receipt = await wrapTx.wait()
    console.log(`swap tx: ${receipt.transactionHash}`)

    const balance = await manager.getBalance()
    console.log(`Balance left: ${ethers.utils.formatEther(balance)}`)

    const amount0 = await manager.getDeposit(NetAddrs[hre.network.name].WETH)
    console.log(`Wrapped token deposit: ${ethers.utils.formatEther(amount0)}`)

    const amount1 = await manager.getDeposit(NetAddrs[hre.network.name].USDC)
    console.log(`Deposit usdc: ${ethers.utils.formatUnits(amount1, 6)}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
