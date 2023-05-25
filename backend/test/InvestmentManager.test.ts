import { assert, expect } from "chai"
import { Contract, Signer } from "ethers"
const { network, deployments, ethers } = require("hardhat")
import { developmentChains } from "../hardhat.config"
import { NetAddrs } from "../scripts/config"
import WETHABI from "../scripts/abi/weth.abi.json"
import ERC20ABI from "../scripts/abi/erc20.abi.json"

developmentChains.includes(network.name)
    ? describe("Investment Manager contract test", function () {
          this.timeout(30000)
          let manager: Contract
          let deployer: Signer

          beforeEach(async () => {
              ;[manager, deployer] = await deployContracts()
              //   await wrapEther(deployer)
          })

          it("can deposit some money", async () => {
              const tx = await deployer.sendTransaction({
                  to: manager.address,
                  value: ethers.utils.parseEther("1"),
              })
              const receipt = await tx.wait()
              console.log(`invested tx: ${JSON.stringify(receipt)}`)
              const balance = await manager.getBalance()
              console.log(`balance: ${ethers.utils.formatEther(balance)}`)
          })

          it("can withdraw money", async () => {
              const tx = await deployer.sendTransaction({
                  to: manager.address,
                  value: ethers.utils.parseEther("1"),
              })
              await tx.wait()

              const withdr = await manager.withdraw(ethers.utils.parseEther("0.5"))
              const rec = await withdr.wait()
              console.log(`withdrawn tx: ${JSON.stringify(rec)}`)

              const balance = await manager.getBalance()
              console.log(`balance: ${ethers.utils.formatEther(balance)}`)
          })

          it("can invest", async () => {
              //   await approveTransfers(manager.address, deployer)
              const tx = await manager.invest(NetAddrs[network.name].USDC, 500, {
                  value: ethers.utils.parseEther("1"),
              })
              const receipt = await tx.wait()
              console.log(`invested: ${JSON.stringify(receipt)}`)
              const [token, amount] = await manager.getDeposit()
              console.log(`amount: ${amount}`)
              const positions = await manager.getPositions()
              console.log(`Positions: ${positions}`)
              expect(positions.length).to.equal(1)
              const info = await manager.getPositionInfo(positions[0])
              console.log(`Position info: ${JSON.stringify(info)}`)
          })

          //   describe("withdraw checks", function () {
          //       it("cannot withdraw if no deposit", async () => {
          //           //   const tx = await manager.withdraw(ethers.utils.parseEther("1"))
          //           expect(manager.withdraw(ethers.utils.parseEther("1"))).to.be.reverted
          //       })
          //       it("amount updated after withdraw", async () => {
          //           await approveTransfers(manager.address, deployer)
          //           const tx = await manager.deposit(weth, ethers.utils.parseEther("1"))
          //           const receipt = await tx.wait()

          //           const wTx = await manager.withdraw(ethers.utils.parseEther("0.4"))
          //           const wRec = await wTx.wait()
          //           console.log(`withdrawn: ${JSON.stringify(wRec)}`)
          //           const [token, amount] = await manager.getDeposit()
          //           expect(amount).to.equal(ethers.utils.parseEther("0.6"))
          //       })
          //       it("cannot withdraw more than deposit", async () => {
          //           await approveTransfers(manager.address, deployer)
          //           const tx = await manager.deposit(weth, ethers.utils.parseEther("1"))
          //           const receipt = await tx.wait()

          //           expect(manager.withdraw(ethers.utils.parseEther("2"))).to.be.reverted
          //       })
          //   })
      })
    : describe.skip

async function deployContracts(): Promise<[Contract, Signer]> {
    const [deployer] = await ethers.getSigners()
    const factory = await ethers.getContractFactory("InvestmentManager")
    const contract = await factory.deploy(NetAddrs[network.name].WETH)
    await contract.deployed()
    console.log(`deployed at: ${contract.address}`)
    return [contract, deployer]
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
}
