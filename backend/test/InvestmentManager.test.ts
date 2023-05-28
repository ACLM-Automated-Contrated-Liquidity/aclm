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

          it("can receive some money", async () => {
              const tx = await deployer.sendTransaction({
                  to: manager.address,
                  value: ethers.utils.parseEther("1"),
              })
              const receipt = await tx.wait()
              console.log(`sent tx: ${JSON.stringify(receipt)}`)
              const balance = await manager.getBalance()
              console.log(`balance: ${ethers.utils.formatEther(balance)}`)
          })

          it("can deposit some money", async () => {
              const tx = await manager.deposit({
                  value: ethers.utils.parseEther("1"),
              })
              const receipt = await tx.wait()
              console.log(`deposit tx: ${JSON.stringify(receipt)}`)
              const balance = await manager.getBalance()
              expect(ethers.utils.formatEther(balance)).equal("1.0")
          })

          it("can wrap and swap", async () => {
              const tx = await manager.deposit({
                  value: ethers.utils.parseEther("1"),
              })
              await tx.wait()

              const wrapTx = await manager.wrapAndSwap(NetAddrs[network.name].USDC, 500)
              const receipt = await wrapTx.wait()
              console.log(`swap tx: ${receipt.transactionHash}`)

              const balance = await manager.getBalance()
              expect(parseInt(ethers.utils.formatEther(balance))).is.equal(0)

              const amount0 = await manager.getDeposit(NetAddrs[network.name].WETH)
              expect(ethers.utils.formatEther(amount0)).is.equal("0.5")

              const amount1 = await manager.getDeposit(NetAddrs[network.name].USDC)
              console.log(`Deposit usdc: ${ethers.utils.formatUnits(amount1, 6)}`)
              expect(Number(ethers.utils.formatUnits(amount1, 6))).is.above(0)
          })

          it("can mint new position", async () => {
              const tx = await manager.deposit({
                  value: ethers.utils.parseEther("1"),
              })
              await tx.wait()

              const wrapTx = await manager.wrapAndSwap(NetAddrs[network.name].USDC, 500)
              const receipt = await wrapTx.wait()

              const mintTx = await manager.createAndMintBestPosition(
                  NetAddrs[network.name].USDC,
                  500,
                  ethers.utils.parseEther("0.5"),
                  ethers.utils.parseUnits("900", 6)
              )
              const mintRec = await mintTx.wait()
              console.log(`mint tx: ${mintRec.transactionHash}`)

              const balance = await manager.getBalance()
              expect(parseInt(ethers.utils.formatEther(balance))).is.equal(0)

              const amount0 = await manager.getDeposit(NetAddrs[network.name].WETH)
              const amountWrapped = ethers.utils.formatEther(amount0)
              console.log(`Balance wrapped: ${amountWrapped}`)
              expect(Number(amountWrapped)).is.below(0.5)

              const amount1 = await manager.getDeposit(NetAddrs[network.name].USDC)
              console.log(`Deposit usdc: ${ethers.utils.formatUnits(amount1, 6)}`)
              //   expect(Number(ethers.utils.formatUnits(amount1, 6))).is.below(900)

              const positions = await manager.getPositions()
              console.log(`Positions: ${positions}`)
              expect(positions.length).to.equal(1)
              const info = await manager.getPositionInfo(positions[0])
              console.log(`Position info: ${JSON.stringify(info)}`)
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
    // const f = await ethers.getContractFactory("NonfungiblePositionManager")
    // const m = await f.deploy(
    //     NetAddrs[network.name].poolFactory,
    //     NetAddrs[network.name].WETH,
    //     "0x91ae842A5Ffd8d12023116943e72A606179294f3"
    // )
    // await m.deployed()

    const factory = await ethers.getContractFactory("InvestmentManager")
    const contract = await factory.deploy(
        NetAddrs[network.name].WETH,
        "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
        {
            value: ethers.utils.parseEther("0.2"),
        }
    )
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
