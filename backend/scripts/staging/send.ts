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
    const tx = await deployer.sendTransaction({
        to: manager.address,
        value: ethers.utils.parseEther("0.2"),
        gasLimit: 1000000,
    })
    const receipt = await tx.wait()
    console.log(`deposit tx: ${receipt.transactionHash}`)
    const balance = await manager.getBalance()
    console.log(`Balance on contract: ${balance}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
