import { assert, expect } from "chai"
import { Contract, Signer } from "ethers"
const { network, deployments, ethers } = require("hardhat")
import { developmentChains } from "../hardhat.config"
import { NetAddrs } from "../scripts/config"
import WETHABI from "../scripts/abi/weth.abi.json"
import ERC20ABI from "../scripts/abi/erc20.abi.json"
import { text } from "stream/consumers"

developmentChains.includes(network.name)
    ? describe("Investment Manager contract test", function () {
          this.timeout(40000)
          let manager: Contract
          let deployer: Signer
          let user: Signer

          beforeEach(async () => {
              ;[manager, deployer, user] = await deployContracts()
              //   await wrapEther(deployer)
          })

          it("can receive some money", async () => {
              const tx = await user.sendTransaction({
                  to: manager.address,
                  value: ethers.utils.parseEther("1"),
              })
              const receipt = await tx.wait()
              console.log(`sent tx: ${JSON.stringify(receipt)}`)
              const balance = await manager.connect(user).getBalance()
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
                  ethers.utils.parseUnits("900", 6),
                  10
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

          it("can invest", async () => {
              //   await approveTransfers(manager.address, deployer)
              const tx = await manager.invest(NetAddrs[network.name].USDC, 500, 100, {
                  value: ethers.utils.parseEther("1"),
              })
              const receipt = await tx.wait()
              console.log(`invested tx: ${receipt.transactionHash}`)
              const amount = await manager.getDeposit(NetAddrs[network.name].USDC)
              console.log(`amount: ${amount}`)
              const positions = await manager.getPositions()
              console.log(`Positions: ${positions}`)
              expect(positions.length).to.equal(1)
              const info = await manager.getPositionInfo(positions[0])
              console.log(`Position info: ${JSON.stringify(info)}`)
          })

          describe("withdraw checks", function () {
              it("can withdraw money", async () => {
                  const tx = await deployer.sendTransaction({
                      to: manager.address,
                      value: ethers.utils.parseEther("1"),
                  })
                  await tx.wait()

                  const withdr = await manager.withdraw(ethers.utils.parseEther("0.5"))
                  const rec = await withdr.wait()
                  console.log(`withdrawn tx: ${rec.transactionHash}`)

                  const balance = await manager.getBalance()
                  console.log(`balance: ${ethers.utils.formatEther(balance)}`)
              })

              it("cannot withdraw if no deposit", async () => {
                  expect(manager.withdraw(ethers.utils.parseEther("1"))).to.be.reverted
              })

              it("cannot withdraw more than deposit", async () => {
                  const tx = await deployer.sendTransaction({
                      to: manager.address,
                      value: ethers.utils.parseEther("1"),
                  })
                  await tx.wait()

                  expect(manager.withdraw(ethers.utils.parseEther("2"))).to.be.reverted
              })
          })

          describe("test rebalance computation", function () {
              it("computes correctly if big proportion", async () => {
                  const USDC = ethers.utils.parseUnits("100", 6)
                  const WETH = ethers.utils.parseEther("1")
                  const sqrtPriceX96 = "1816788138137685064910702169304998"
                  const [amountIn, reverse] = await manager.computeAmountIn(
                      USDC,
                      WETH,
                      sqrtPriceX96
                  )
                  console.log(`Amount in: ${amountIn}; Reverse: ${reverse}`)
                  expect(reverse).true
                  const formatted = Number(ethers.utils.formatEther(amountIn))
                  expect(formatted).is.below(0.5).and.above(0.4)
              })

              it("computes correctly if small but enough proportion", async () => {
                  const USDC = ethers.utils.parseUnits("500", 6)
                  const WETH = ethers.utils.parseEther("1")
                  const sqrtPriceX96 = "1816788138137685064910702169304998"
                  const [amountIn, reverse] = await manager.computeAmountIn(
                      USDC,
                      WETH,
                      sqrtPriceX96
                  )
                  console.log(`Amount in: ${amountIn}; Reverse: ${reverse}`)
                  expect(reverse).true
                  const formatted = Number(ethers.utils.formatEther(amountIn))
                  expect(formatted).is.below(0.4).and.above(0.3)
              })

              it("returns zero if too close proportion", async () => {
                  const USDC = ethers.utils.parseUnits("1000", 6)
                  const WETH = ethers.utils.parseEther("1")
                  const sqrtPriceX96 = "1816788138137685064910702169304998"
                  const [amountIn, reverse] = await manager.computeAmountIn(
                      USDC,
                      WETH,
                      sqrtPriceX96
                  )
                  console.log(`Amount in: ${amountIn}; Reverse: ${reverse}`)
                  const formatted = parseInt(ethers.utils.formatEther(amountIn))
                  expect(formatted).is.equal(0)
              })

              it("computes correctly if USDC is zero", async () => {
                  const USDC = ethers.utils.parseUnits("0", 6)
                  const WETH = ethers.utils.parseEther("1")
                  const sqrtPriceX96 = "1816788138137685064910702169304998"
                  const [amountIn, reverse] = await manager.computeAmountIn(
                      USDC,
                      WETH,
                      sqrtPriceX96
                  )
                  console.log(`Amount in: ${amountIn}; Reverse: ${reverse}`)
                  expect(reverse).true
                  const formatted = Number(ethers.utils.formatEther(amountIn))
                  expect(formatted).is.below(0.51).and.above(0.49)
              })

              it("computes correctly if WETH is zero", async () => {
                  const USDC = ethers.utils.parseUnits("600", 6)
                  const WETH = ethers.utils.parseEther("0")
                  const sqrtPriceX96 = "1816788138137685064910702169304998"
                  const [amountIn, reverse] = await manager.computeAmountIn(
                      USDC,
                      WETH,
                      sqrtPriceX96
                  )
                  console.log(`Amount in: ${amountIn}; Reverse: ${reverse}`)
                  expect(reverse).false
                  const formatted = Number(ethers.utils.formatUnits(amountIn, 6))
                  expect(formatted).is.below(310).and.above(290)
              })

              it("computes correctly if more USDC", async () => {
                  const USDC = ethers.utils.parseUnits("10000", 6)
                  const WETH = ethers.utils.parseEther("1")
                  const sqrtPriceX96 = "1816788138137685064910702169304998"
                  const [amountIn, reverse] = await manager.computeAmountIn(
                      USDC,
                      WETH,
                      sqrtPriceX96
                  )
                  console.log(`Amount in: ${amountIn}; Reverse: ${reverse}`)
                  expect(reverse).false
                  const formatted = Number(ethers.utils.formatUnits(amountIn, 6))
                  expect(formatted).is.below(4100).and.above(3900)
              })
          })

          describe("updating position checks", function () {
              beforeEach(async () => {
                  const tx = await manager.invest(NetAddrs[network.name].USDC, 500, 1, {
                      value: ethers.utils.parseEther("1"),
                  })
                  const receipt = await tx.wait()
                  console.log(`invested tx: ${receipt.transactionHash}`)
              })

              it("position count is valid", async () => {
                  const count = await manager.getPositionsCount()
                  expect(count).is.equal(1)
              })

              it("finds out of range positions", async () => {
                  // initialy shouldn't be any
                  const outPos = await manager.getTickOutOfRangePositions()
                  expect(outPos.length).is.equal(0)

                  // someone makes a HUGE swap to move tick aside.
                  const tx = await manager.connect(user).deposit({
                      value: ethers.utils.parseEther("9000"),
                  })
                  await tx.wait()

                  const swapTx = await manager
                      .connect(user)
                      .wrapAndSwap(NetAddrs[network.name].USDC, 500)
                  const receipt = await swapTx.wait()
                  console.log(`swap tx: ${receipt.transactionHash}`)

                  // now our position should be out of range
                  const outOfRange = await manager.getTickOutOfRangePositions()
                  expect(outOfRange.length).is.equal(1)
              })

              it("updates out of range position", async () => {
                  const [, , whale] = await ethers.getSigners()
                  // someone makes a HUGE swap to move tick aside.
                  const tx = await manager.connect(whale).deposit({
                      value: ethers.utils.parseEther("9000"),
                  })
                  await tx.wait()

                  const wrapTx = await manager
                      .connect(whale)
                      .wrapAndSwap(NetAddrs[network.name].USDC, 500)
                  const receipt = await wrapTx.wait()
                  console.log(`swap tx: ${receipt.transactionHash}`)

                  const [tokenId] = await manager.getTickOutOfRangePositions()
                  const updateTx = await manager.updatePosition(tokenId)
                  console.log(`update tx: ${updateTx.transactionHash}`)

                  const empty = await manager.getTickOutOfRangePositions()
                  expect(empty).to.be.empty

                  const count = await manager.getPositionsCount()
                  expect(count).equal(1)

                  const [posToken] = await manager.getPositions()
                  expect(posToken).is.not.equal(tokenId)
              })
          })
      })
    : describe.skip

async function deployContracts(): Promise<[Contract, Signer, Signer]> {
    const [deployer, user] = await ethers.getSigners()

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
    return [contract, deployer, user]
}

async function wrapEther(user: Signer, amount: string) {
    const WETH_ADDRESS = NetAddrs[network.name].WETH

    const WETH = new ethers.Contract(WETH_ADDRESS, WETHABI, user)
    const tx = await WETH.deposit({
        value: ethers.utils.parseEther(amount),
    })
    const receipt = await tx.wait()
    console.log(`wrapper tx: ${receipt.transactionHash}`)
}

async function approveTransfers(contract: string, deployer: Signer) {
    const WETH_ADDRESS = NetAddrs[network.name].WETH
    const WETH = new ethers.Contract(WETH_ADDRESS, ERC20ABI, deployer)
    const appr = await WETH.approve(contract, ethers.utils.parseEther("1"))
    const res = await appr.wait()
    console.log(`Approved to spend WETH. ${JSON.stringify(res)}`)
}
