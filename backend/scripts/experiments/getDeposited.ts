import { ethers } from "hardhat"

async function main() {
    const [deployer] = await ethers.getSigners()

    const liquidityContr = "0x447786d977Ea11Ad0600E193b2d07A06EfB53e5F"

    const exampleContract = await ethers.getContractAt("LiquidityExamples", liquidityContr)
    const connected = exampleContract.connect(deployer)
    const deposit = await connected.deposits(509037)
    console.log(`Deposited liquidity: ${JSON.stringify(deposit)}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
