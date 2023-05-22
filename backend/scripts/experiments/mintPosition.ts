import { ethers } from "hardhat"
import hre from "hardhat"
import { NetAddrs } from "../config"

import ERC20ABI from "../abi/erc20.abi.json"

async function main() {
    const [deployer] = await ethers.getSigners()

    const liquidityContr = "0x447786d977Ea11Ad0600E193b2d07A06EfB53e5F"

    const WETH_ADDRESS = NetAddrs[hre.network.name].WETH
    const WETH = new ethers.Contract(WETH_ADDRESS, ERC20ABI, deployer)
    const appr = await WETH.approve(liquidityContr, ethers.utils.parseEther("0.1"))
    appr.wait()
    console.log(`Approved to spend WETH. ${JSON.stringify(appr)}`)

    const DAI_ADDRESS = NetAddrs[hre.network.name].DAI
    const DAI = new ethers.Contract(DAI_ADDRESS, ERC20ABI, deployer)
    const daiAppr = await DAI.approve(liquidityContr, ethers.utils.parseEther("100"))
    daiAppr.wait()
    console.log(`Approved to spend DAI. ${JSON.stringify(daiAppr)}`)

    const exampleContract = await ethers.getContractAt("LiquidityExamples", liquidityContr)
    const connected = exampleContract.connect(deployer)
    const tx = await connected.mintNewPosition(
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.0055"),
        { gasLimit: "3000000" }
    )
    // const tx = await connected.mintPosition(
    //     "0xc2e9f25be6257c210d7adf0d4cd6e3e881ba25f8",
    //     -887272,
    //     887272,
    //     "234376593417319793",
    //     [],
    //     { gasLimit: 3000000 }
    // )
    tx.wait()

    console.log(`Tx: ${JSON.stringify(tx)}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
