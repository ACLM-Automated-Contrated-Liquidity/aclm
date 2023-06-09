import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Calling contract with the account: ", deployer.address)

    const manager = await ethers.getContractAt(
        "InvestmentManager",
        "0x796304266bc2C7884384Af20f894A5Ab434BaE6b",
        deployer
    )
    const tx = await manager.deposit({
        value: ethers.utils.parseEther("0.3"),
        gasLimit: 2000000,
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
