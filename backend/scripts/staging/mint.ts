import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Calling contract with the account: ", deployer.address)

    const manager = await ethers.getContractAt(
        "InvestmentManager",
        "0x10d967dDFEdF2Dc548229071705D1a39720f1B2d",
        deployer
    )
    const mintTx = await manager.createAndMintBestPosition(
        NetAddrs[hre.network.name].USDC,
        3000,
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseUnits("2800", 6),
        {
            gasLimit: 10000000,
        }
    )
    const mintRec = await mintTx.wait()
    console.log(`mint tx: ${mintRec.transactionHash}`)

    const amount0 = await manager.getDeposit(NetAddrs[hre.network.name].WETH)
    const amountWrapped = ethers.utils.formatEther(amount0)
    console.log(`Balance wrapped left: ${amountWrapped}`)

    const amount1 = await manager.getDeposit(NetAddrs[hre.network.name].USDC)
    console.log(`Balance usdc left: ${ethers.utils.formatUnits(amount1, 6)}`)

    const positions = await manager.getPositions()
    console.log(`Positions: ${positions}`)
    const info = await manager.getPositionInfo(positions[0])
    console.log(`Position info: ${JSON.stringify(info)}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
