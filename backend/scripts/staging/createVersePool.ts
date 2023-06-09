import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

async function main() {
    const networkName = hre.network.name
    const curConfig = NetAddrs[networkName]

    const VERSE_ADDRESS = "0x37D4203FaE62CCd7b1a78Ef58A5515021ED8FD84"
    const WETH_ADDRESS = curConfig.WETH

    const [deployer] = await ethers.getSigners()
    console.log(`Deployer address: ${deployer.address}`)

    const factory = await ethers.getContractAt(
        "IUniswapV3Factory",
        NetAddrs[networkName].poolFactory
    )
    // const createTx = await factory.createPool(VERSE_ADDRESS, WETH_ADDRESS, 10000)
    // const rec = await createTx.wait()
    // console.log(`Create pool tx: ${rec.transactionHash}`)

    const poolAddr = await factory.getPool(VERSE_ADDRESS, WETH_ADDRESS, 10000)

    const pool = await ethers.getContractAt("IUniswapV3Pool", poolAddr)
    const sqrtPriceX96 = "48934102690551718053269037" // getting current price from mainnet
    const initTx = await pool.initialize(sqrtPriceX96)
    const initRec = await initTx.wait()
    console.log(`Init pool tx: ${initRec.transactionHash}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
