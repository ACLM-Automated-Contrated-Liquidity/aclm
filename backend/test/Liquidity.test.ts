import { assert, expect } from "chai"
import { Contract, Signer } from "ethers"
const { network, deployments, ethers } = require("hardhat")
import { developmentChains } from "../hardhat.config"
import { NetAddrs } from "../scripts/config"
import WETHABI from "../scripts/abi/weth.abi.json"
import ERC20ABI from "../scripts/abi/erc20.abi.json"

developmentChains.includes(network.name)
    ? describe("Liquidity examples test", function () {
          this.timeout(30000)
          let liquidityContract: Contract
          let deployer: Signer

          beforeEach(async () => {
              ;[liquidityContract, deployer] = await deployLiquidityExamples()
              await wrapEther(deployer)
              const swapContract = await deploySwap(deployer)
              await swapToDai(deployer, swapContract)
          })

          describe("mint new position", function () {
              it("method doesn't fail", async () => {
                  const zero = await liquidityContract.getTokensCount()
                  expect(zero).to.equal(0)

                  await approveTransfers(liquidityContract.address, deployer)
                  const connected = liquidityContract.connect(deployer)
                  const tx = await connected.mintNewPosition(
                      ethers.utils.parseEther("1000"),
                      ethers.utils.parseEther("0.55"),
                      { gasLimit: "3000000" }
                  )
                  const receipt = await tx.wait()
                  console.log(`Tx: ${JSON.stringify(receipt)}`)

                  const one = await liquidityContract.getTokensCount()
                  expect(one).to.equal(1)
              })
          })
      })
    : describe.skip

async function deployLiquidityExamples(): Promise<[Contract, Signer]> {
    const [deployer] = await ethers.getSigners()
    const examplesFactory = await ethers.getContractFactory("LiquidityExamples")
    const example = await examplesFactory.deploy("0xC36442b4a4522E871399CD717aBDD847Ab11FE88")
    await example.deployed()
    console.log(`deployed at: ${example.address}`)
    return [example, deployer]
}

async function wrapEther(deployer: Signer) {
    const WETH_ADDRESS = NetAddrs[network.name].WETH

    const WETH = new ethers.Contract(WETH_ADDRESS, WETHABI, deployer)
    const tx = await WETH.deposit({
        value: ethers.utils.parseEther("10"),
    })
    const receipt = await tx.wait()
    console.log(`Receipt: ${JSON.stringify(receipt)}`)
}

async function approveTransfers(contract: string, deployer: Signer) {
    const WETH_ADDRESS = NetAddrs[network.name].WETH
    const WETH = new ethers.Contract(WETH_ADDRESS, ERC20ABI, deployer)
    const appr = await WETH.approve(contract, ethers.utils.parseEther("1"))
    const res = await appr.wait()
    console.log(`Approved to spend WETH. ${JSON.stringify(res)}`)

    const DAI_ADDRESS = NetAddrs[network.name].DAI
    const DAI = new ethers.Contract(DAI_ADDRESS, ERC20ABI, deployer)
    const daiAppr = await DAI.approve(contract, ethers.utils.parseEther("1000"))
    const receipt = await daiAppr.wait()
    console.log(`Approved to spend DAI. ${JSON.stringify(receipt)}`)
}

async function deploySwap(deployer): Promise<string> {
    const SWAP_ROUTER_ADDR = NetAddrs[network.name].swapRouter
    const WETH = NetAddrs[network.name].WETH
    const DAI = NetAddrs[network.name].DAI

    const swapFactory = await ethers.getContractFactory("SimpleSwap", deployer)
    const swap = await swapFactory.deploy(SWAP_ROUTER_ADDR, WETH, DAI)
    await swap.deployed()
    console.log("Deployed swap address:", swap.address)
    return swap.address
}

async function swapToDai(deployer, dex: string) {
    const WETH_ADDRESS = NetAddrs[network.name].WETH
    const WETH = new ethers.Contract(WETH_ADDRESS, ERC20ABI, deployer)
    const tx = await WETH.approve(dex, ethers.utils.parseEther("1"))
    const receipt = await tx.wait()
    console.log(`Approved to spend WETH. ${JSON.stringify(receipt)}`)

    const exampleContract = await ethers.getContractAt("SimpleSwap", dex)
    const connected = exampleContract.connect(deployer)
    const swapTx = await connected.swapWETHForDAI(ethers.utils.parseEther("1"), {
        gasLimit: "3000000",
    })
    const daiRec = await swapTx.wait()
    console.log(`Swapped 1 WETH for DAI. ${JSON.stringify(daiRec)}`)
}
