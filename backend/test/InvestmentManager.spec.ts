import { assert, expect } from "chai"
import { Contract, Signer } from "ethers"
const { network, deployments, ethers } = require("hardhat")
import { developmentChains } from "../hardhat.config"
import { NetAddrs } from "../scripts/config"
import WETHABI from "../scripts/abi/weth.abi.json"
import ERC20ABI from "../scripts/abi/erc20.abi.json"
import { text } from "stream/consumers"
import { nearestUsableTick, TickMath } from "@uniswap/v3-sdk"

/**
 * Full test suite for InvestmentManager smart contract!
 */
developmentChains.includes(network.name)
    ? describe("Investment Manager contract test", function () {
          this.timeout(90000)
          let manager: Contract
          let deployer: Signer
          let user: Signer

          beforeEach(async () => {
              ;[manager, deployer, user] = await deployContracts()
          })

          it("can receive some money", async () => {
              const tx = await user.sendTransaction({
                  to: manager.address,
                  value: ethers.utils.parseEther("1"),
              })
              const receipt = await tx.wait()
              console.log(`sent tx: ${JSON.stringify(receipt)}`)
              const balance = await manager.connect(user).getNativeBalance()
              console.log(`balance: ${ethers.utils.formatEther(balance)}`)
          })

          it("can deposit some money", async () => {
              const tx = await manager.deposit({
                  value: ethers.utils.parseEther("1"),
              })
              const receipt = await tx.wait()
              console.log(`deposit tx: ${receipt.transactionHash}`)
              const balance = await manager.getNativeBalance()
              expect(ethers.utils.formatEther(balance)).equal("1.0")
          })

          it("can wrap all", async () => {
              const tx = await manager.deposit({
                  value: ethers.utils.parseEther("1"),
              })
              await tx.wait()

              const wrapTx = await manager.wrapAll()
              const receipt = await wrapTx.wait()
              console.log(`wrap tx: ${receipt.transactionHash}`)

              const balance = await manager.getNativeBalance()
              expect(parseInt(ethers.utils.formatEther(balance))).is.equal(0)

              const amount = await manager.getTokenBalance(NetAddrs[network.name].WETH)
              expect(ethers.utils.formatEther(amount)).is.equal("1.0")
          })

          describe("swap", function () {
              beforeEach(async () => {
                  const tx = await manager.deposit({
                      value: ethers.utils.parseEther("1"),
                  })
                  await tx.wait()

                  const wrapTx = await manager.wrapAll()
                  await wrapTx.wait()
              })

              it("known input weth to usdc and back", async () => {
                  const swapTx = await manager.swapKnownInput(
                      NetAddrs[network.name].WETH,
                      NetAddrs[network.name].USDC,
                      ethers.utils.parseEther("0.5"),
                      500
                  )
                  const receipt = await swapTx.wait()
                  console.log(`swap tx: ${receipt.transactionHash}`)

                  const amount0 = await manager.getTokenBalance(NetAddrs[network.name].WETH)
                  expect(ethers.utils.formatEther(amount0)).is.equal("0.5")

                  const amount1 = await manager.getTokenBalance(NetAddrs[network.name].USDC)
                  console.log(`Deposit usdc: ${ethers.utils.formatUnits(amount1, 6)}`)
                  expect(Number(ethers.utils.formatUnits(amount1, 6)))
                      .is.above(500)
                      .and.below(2000)

                  const swapBack = await manager.swapKnownInput(
                      NetAddrs[network.name].USDC,
                      NetAddrs[network.name].WETH,
                      ethers.utils.parseUnits("500", 6),
                      500
                  )
                  const rec = await swapBack.wait()
                  console.log(`swap tx: ${rec.transactionHash}`)

                  const tokAmount0 = await manager.getTokenBalance(NetAddrs[network.name].WETH)
                  console.log(
                      `Deposit weth after swap back: ${ethers.utils.formatEther(tokAmount0)}`
                  )
                  expect(Number(ethers.utils.formatEther(tokAmount0))).is.above(0.6)

                  const tokAmount1 = await manager.getTokenBalance(NetAddrs[network.name].USDC)
                  console.log(
                      `Deposit usdc after swap back: ${ethers.utils.formatUnits(tokAmount1, 6)}`
                  )
                  expect(Number(ethers.utils.formatUnits(tokAmount1, 6))).is.below(
                      Number(ethers.utils.formatUnits(amount1, 6))
                  )
              })

              it("known output weth to usdc and back", async () => {
                  const swapTx = await manager.swapKnownOutput(
                      NetAddrs[network.name].WETH,
                      NetAddrs[network.name].USDC,
                      ethers.utils.parseUnits("1000", 6),
                      500
                  )
                  const receipt = await swapTx.wait()
                  console.log(`swap tx: ${receipt.transactionHash}`)

                  const amount0 = await manager.getTokenBalance(NetAddrs[network.name].WETH)
                  console.log(`Deposit weth: ${ethers.utils.formatEther(amount0)}`)
                  expect(Number(ethers.utils.formatEther(amount0)))
                      .is.below(1.0)
                      .and.above(0.3)

                  const amount1 = await manager.getTokenBalance(NetAddrs[network.name].USDC)
                  expect(ethers.utils.formatUnits(amount1, 6)).is.equal("1000.0")

                  const swapBack = await manager.swapKnownOutput(
                      NetAddrs[network.name].USDC,
                      NetAddrs[network.name].WETH,
                      ethers.utils.parseEther("0.3"),
                      500
                  )
                  const rec = await swapBack.wait()
                  console.log(`swap back tx: ${rec.transactionHash}`)

                  const tokAmount0 = await manager.getTokenBalance(NetAddrs[network.name].WETH)
                  expect(ethers.utils.formatEther(tokAmount0.sub(amount0))).is.equal("0.3")

                  const tokAmount1 = await manager.getTokenBalance(NetAddrs[network.name].USDC)
                  console.log(
                      `Deposit usdc after swap back: ${ethers.utils.formatUnits(tokAmount1, 6)}`
                  )
                  expect(Number(ethers.utils.formatUnits(tokAmount1, 6))).is.below(
                      Number(ethers.utils.formatUnits(amount1, 6))
                  )
              })
          })

          async function computeTicks(poolAddr: string): Promise<[number, number]> {
              const pool = await ethers.getContractAt("IUniswapV3Pool", poolAddr, deployer)
              const slot = await pool.slot0()
              const spacing = await pool.tickSpacing()
              const tickLower = nearestUsableTick(slot.tick, spacing) - spacing * 5
              const tickUpper = nearestUsableTick(slot.tick, spacing) + spacing * 5
              return [tickLower, tickUpper]
          }

          it("mints new position", async () => {
              const tx = await manager.deposit({
                  value: ethers.utils.parseEther("1"),
              })
              await tx.wait()

              const wrapTx = await manager.wrapAll()
              await wrapTx.wait()

              const swapTx = await manager.swapKnownOutput(
                  NetAddrs[network.name].WETH,
                  NetAddrs[network.name].USDC,
                  ethers.utils.parseUnits("900", 6),
                  500
              )
              await swapTx.wait()

              const amountNative = await manager.getTokenBalance(NetAddrs[network.name].WETH)
              const amountOther = await manager.getTokenBalance(NetAddrs[network.name].USDC)

              const [tickLower, tickUpper] = await computeTicks(
                  "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"
              )
              const mintTx = await manager.mint([
                  NetAddrs[network.name].USDC,
                  NetAddrs[network.name].WETH,
                  500,
                  tickLower,
                  tickUpper,
                  amountOther,
                  amountNative,
                  await deployer.getAddress(),
              ])

              const mintRec = await mintTx.wait()
              console.log(`mint tx: ${mintRec.transactionHash}`)

              const amount0 = await manager.getTokenBalance(NetAddrs[network.name].WETH)
              const amountWrapped = ethers.utils.formatEther(amount0)
              console.log(`Balance wrapped: ${amountWrapped}`)
              expect(Number(amountWrapped)).is.below(0.2)

              const amount1 = await manager.getTokenBalance(NetAddrs[network.name].USDC)
              const amountUSDC = ethers.utils.formatUnits(amount1, 6)
              console.log(`Balance usdc: ${amountUSDC}`)
              expect(Number(amountUSDC)).is.below(300)

              const positions = await manager.getMyPositions()
              console.log(`Positions: ${positions}`)
              expect(positions.length).to.equal(1)
              const info = await manager.getPositionInfo(positions[0])
              console.log(`Position info: ${JSON.stringify(info)}`)
          })

          describe("invest", function () {
              it("middle position weth + usdc", async () => {
                  const [tickLower, tickUpper] = await computeTicks(
                      "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"
                  )
                  const tx = await manager.invest(
                      [
                          NetAddrs[network.name].WETH,
                          NetAddrs[network.name].USDC,
                          500,
                          ethers.utils.parseEther("0.5"),
                          ethers.utils.parseUnits("900", 6),
                          tickLower,
                          tickUpper,
                      ],
                      {
                          value: ethers.utils.parseEther("1"),
                      }
                  )
                  const receipt = await tx.wait()
                  console.log(`invested tx: ${receipt.transactionHash}`)
                  const amountUSDC = await manager.getTokenBalance(NetAddrs[network.name].USDC)
                  console.log(`amountUSDC: ${amountUSDC}`)
                  expect(Number(ethers.utils.formatUnits(amountUSDC, 6))).is.below(450)
                  const amountWETH = await manager.getTokenBalance(NetAddrs[network.name].WETH)
                  console.log(`amountWETH: ${amountWETH}`)
                  expect(Number(ethers.utils.formatEther(amountWETH))).is.below(0.25)
                  const positions = await manager.getMyPositions()
                  console.log(`Positions: ${positions}`)
                  expect(positions.length).to.equal(1)
                  const info = await manager.getPositionInfo(positions[0])
                  console.log(`Position info: ${JSON.stringify(info)}`)
              })

              it("side position weth + usdc", async () => {
                  const [tickLower, tickUpper] = await computeTicks(
                      "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"
                  )
                  const tx = await manager.invest(
                      [
                          NetAddrs[network.name].WETH,
                          NetAddrs[network.name].USDC,
                          500,
                          ethers.utils.parseEther("0.9"),
                          ethers.utils.parseUnits("200", 6),
                          tickLower - 100 * 10,
                          tickUpper,
                      ],
                      {
                          value: ethers.utils.parseEther("1"),
                      }
                  )
                  const receipt = await tx.wait()
                  console.log(`invested tx: ${receipt.transactionHash}`)
                  const amountUSDC = await manager.getTokenBalance(NetAddrs[network.name].USDC)
                  console.log(`amountUSDC: ${amountUSDC}`)
                  expect(Number(ethers.utils.formatUnits(amountUSDC, 6))).is.below(150)
                  const amountWETH = await manager.getTokenBalance(NetAddrs[network.name].WETH)
                  console.log(`amountWETH: ${amountWETH}`)
                  expect(Number(ethers.utils.formatEther(amountWETH))).is.below(0.4)
                  const positions = await manager.getMyPositions()
                  console.log(`Positions: ${positions}`)
                  expect(positions.length).to.equal(1)
                  const info = await manager.getPositionInfo(positions[0])
                  console.log(`Position info: ${JSON.stringify(info)}`)
              })

              it("middle position dai + usdc", async () => {
                  const [tickLower, tickUpper] = await computeTicks(
                      "0x6c6Bc977E13Df9b0de53b251522280BB72383700"
                  )
                  const tx = await manager.invest(
                      [
                          NetAddrs[network.name].DAI,
                          NetAddrs[network.name].USDC,
                          500,
                          ethers.utils.parseUnits("900", 18),
                          ethers.utils.parseUnits("900", 6),
                          tickLower,
                          tickUpper,
                      ],
                      {
                          value: ethers.utils.parseEther("1"),
                      }
                  )
                  const receipt = await tx.wait()
                  console.log(`invested tx: ${receipt.transactionHash}`)
                  const amountUSDC = await manager.getTokenBalance(NetAddrs[network.name].USDC)
                  console.log(`amountUSDC: ${amountUSDC}`)
                  expect(Number(ethers.utils.formatUnits(amountUSDC, 6))).is.below(100)
                  const amountDAI = await manager.getTokenBalance(NetAddrs[network.name].DAI)
                  console.log(`amountDAI: ${amountDAI}`)
                  expect(Number(ethers.utils.formatUnits(amountDAI, 18))).is.below(100)
                  const positions = await manager.getMyPositions()
                  console.log(`Positions: ${positions}`)
                  expect(positions.length).to.equal(1)
                  const info = await manager.getPositionInfo(positions[0])
                  console.log(`Position info: ${JSON.stringify(info)}`)
              })

              it("middle position verse + weth", async () => {
                  const [tickLower, tickUpper] = await computeTicks(
                      "0x87699cbF270F2E72132F2d060CCf7DC97Bb1fceb"
                  )
                  const tx = await manager.invest(
                      [
                          NetAddrs[network.name].WETH,
                          "0x249cA82617eC3DfB2589c4c17ab7EC9765350a18",
                          10000,
                          ethers.utils.parseEther("0.5"),
                          ethers.utils.parseUnits("1210510", 18),
                          tickLower,
                          tickUpper,
                      ],
                      {
                          value: ethers.utils.parseEther("1"),
                      }
                  )
                  const receipt = await tx.wait()
                  console.log(`invested tx: ${receipt.transactionHash}`)
                  const amountWETH = await manager.getTokenBalance(NetAddrs[network.name].WETH)
                  console.log(`amountWETH: ${ethers.utils.formatEther(amountWETH)}`)
                  expect(Number(ethers.utils.formatEther(amountWETH))).is.below(0.1)
                  const amountVERSE = await manager.getTokenBalance(
                      "0x249cA82617eC3DfB2589c4c17ab7EC9765350a18"
                  )
                  console.log(`amountVERSE: ${ethers.utils.formatUnits(amountVERSE, 18)}`)
                  expect(Number(ethers.utils.formatUnits(amountVERSE, 18))).is.below(400000)
                  const positions = await manager.getMyPositions()
                  console.log(`Positions: ${positions}`)
                  expect(positions.length).to.equal(1)
                  const info = await manager.getPositionInfo(positions[0])
                  console.log(`Position info: ${JSON.stringify(info)}`)
              })
          })

          describe("withdraw checks", function () {
              it("can withdraw money", async () => {
                  const tx = await deployer.sendTransaction({
                      to: manager.address,
                      value: ethers.utils.parseEther("1"),
                  })
                  await tx.wait()

                  const withdr = await manager.withdrawBalance(ethers.utils.parseEther("0.5"))
                  const rec = await withdr.wait()
                  console.log(`withdrawn tx: ${rec.transactionHash}`)

                  const balance = await manager.getNativeBalance()
                  console.log(`balance: ${ethers.utils.formatEther(balance)}`)
                  expect(ethers.utils.formatEther(balance)).is.equal("0.5")
              })

              it("can withdraw all available", async () => {
                  const tx = await deployer.sendTransaction({
                      to: manager.address,
                      value: ethers.utils.parseEther("1"),
                  })
                  await tx.wait()

                  const withdr = await manager.withdrawAvailableBalance()
                  const rec = await withdr.wait()
                  console.log(`withdrawn tx: ${rec.transactionHash}`)

                  const balance = await manager.getNativeBalance()
                  console.log(`balance: ${ethers.utils.formatEther(balance)}`)
                  expect(ethers.utils.formatEther(balance)).is.equal("0.0")
              })

              it("cannot withdraw if no deposit", async () => {
                  expect(manager.withdrawBalance(ethers.utils.parseEther("1"))).to.be.reverted
              })

              it("cannot withdraw more than deposit", async () => {
                  const tx = await deployer.sendTransaction({
                      to: manager.address,
                      value: ethers.utils.parseEther("1"),
                  })
                  await tx.wait()

                  expect(manager.withdrawBalance(ethers.utils.parseEther("2"))).to.be.reverted
              })

              it("withdraws token to user", async () => {
                  const tx = await deployer.sendTransaction({
                      to: manager.address,
                      value: ethers.utils.parseEther("1"),
                  })
                  await tx.wait()

                  const wrapTx = await manager.wrapAll()
                  await wrapTx.wait()

                  const withdrTx = await manager.withdrawToken(NetAddrs[network.name].WETH)
                  const rec = await withdrTx.wait()
                  console.log(`Withdraw token tx: ${rec.transactionHash}`)

                  const amountWETH = await manager.getTokenBalance(NetAddrs[network.name].WETH)
                  console.log(`amountWETH: ${ethers.utils.formatEther(amountWETH)}`)
                  expect(ethers.utils.formatEther(amountWETH)).is.equal("0.0")
              })
          })

          it("removes position", async () => {
              const [tickLower, tickUpper] = await computeTicks(
                  "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"
              )
              const tx = await manager.invest(
                  [
                      NetAddrs[network.name].WETH,
                      NetAddrs[network.name].USDC,
                      500,
                      ethers.utils.parseEther("0.5"),
                      ethers.utils.parseUnits("900", 6),
                      tickLower,
                      tickUpper,
                  ],
                  {
                      value: ethers.utils.parseEther("1"),
                  }
              )
              await tx.wait()

              const [tokenId] = await manager.getMyPositions()
              const removeTx = await manager.removePosition(tokenId)
              const rec = await removeTx.wait()
              console.log(`Remove position tx: ${rec.transactionHash}`)

              const empty = await manager.getMyPositions()
              expect(empty).is.empty

              const amountUSDCReturned = await manager.getTokenBalance(NetAddrs[network.name].USDC)
              console.log(`amountUSDCReturned: ${ethers.utils.formatUnits(amountUSDCReturned, 6)}`)
              expect(Number(ethers.utils.formatUnits(amountUSDCReturned, 6)))
                  .is.above(899)
                  .and.below(901)

              const amountWETH = await manager.getTokenBalance(NetAddrs[network.name].WETH)
              console.log(`amountWETH: ${ethers.utils.formatEther(amountWETH)}`)
              expect(Number(ethers.utils.formatEther(amountWETH)))
                  .is.below(0.7)
                  .and.above(0.3)
          })

          describe.skip("unwrap checks", function () {
              it("unwraps part", async () => {
                  const tx = await manager.deposit({
                      value: ethers.utils.parseEther("1"),
                  })
                  await tx.wait()

                  const wrapTx = await manager.wrapAll()
                  await wrapTx.wait()

                  const unwrapTx = await manager.unwrap(ethers.utils.parseEther("0.3"))
                  const rec = await unwrapTx.wait()
                  console.log(`Unwrap tx: ${rec.transactionHash}`)

                  const amountWETH = await manager.getTokenBalance(NetAddrs[network.name].WETH)
                  console.log(`amountWETH: ${ethers.utils.formatEther(amountWETH)}`)
                  expect(ethers.utils.formatEther(amountWETH)).is.equal("0.7")

                  const balance = await manager.getNativeBalance()
                  console.log(`balance: ${ethers.utils.formatEther(balance)}`)
                  expect(ethers.utils.formatEther(balance)).is.equal("0.3")
              })

              it("unwraps all", async () => {
                  const tx = await manager.deposit({
                      value: ethers.utils.parseEther("1"),
                  })
                  await tx.wait()

                  const wrapTx = await manager.wrapAll()
                  await wrapTx.wait()

                  const unwrapTx = await manager.unwrapAll()
                  const rec = await unwrapTx.wait()
                  console.log(`Unwrap tx: ${rec.transactionHash}`)

                  const amountWETH = await manager.getTokenBalance(NetAddrs[network.name].WETH)
                  console.log(`amountWETH: ${ethers.utils.formatEther(amountWETH)}`)
                  expect(ethers.utils.formatEther(amountWETH)).is.equal("0.0")

                  const balance = await manager.getNativeBalance()
                  console.log(`balance: ${ethers.utils.formatEther(balance)}`)
                  expect(ethers.utils.formatEther(balance)).is.equal("1.0")
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
                  const [tickLower, tickUpper] = await computeTicks(
                      "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"
                  )
                  const tx = await manager.invest(
                      [
                          NetAddrs[network.name].WETH,
                          NetAddrs[network.name].USDC,
                          500,
                          ethers.utils.parseEther("0.5"),
                          ethers.utils.parseUnits("900", 6),
                          tickLower,
                          tickUpper,
                      ],
                      {
                          value: ethers.utils.parseEther("1"),
                      }
                  )
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

                  const wrapTx = await manager.connect(user).wrapAll()
                  await wrapTx.wait()

                  const swapTx = await manager
                      .connect(user)
                      .swapKnownInput(
                          NetAddrs[network.name].WETH,
                          NetAddrs[network.name].USDC,
                          ethers.utils.parseEther("9000"),
                          500
                      )
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

                  const wrapTx = await manager.connect(whale).wrapAll()
                  await wrapTx.wait()

                  const swapTx = await manager
                      .connect(whale)
                      .swapKnownInput(
                          NetAddrs[network.name].WETH,
                          NetAddrs[network.name].USDC,
                          ethers.utils.parseEther("9000"),
                          500
                      )
                  const receipt = await swapTx.wait()
                  console.log(`swap tx: ${receipt.transactionHash}`)

                  const [tokenId] = await manager.getTickOutOfRangePositions()
                  const updateTx = await manager.updatePosition(tokenId)
                  console.log(`update tx: ${updateTx.transactionHash}`)

                  const empty = await manager.getTickOutOfRangePositions()
                  expect(empty).to.be.empty

                  const count = await manager.getPositionsCount()
                  expect(count).equal(1)

                  const [posToken] = await manager.getMyPositions()
                  expect(posToken).is.not.equal(tokenId)
              })
          })
      })
    : describe.skip

async function deployContracts(): Promise<[Contract, Signer, Signer]> {
    const [deployer, user] = await ethers.getSigners()

    const factory = await ethers.getContractFactory("InvestmentManagerImpl")
    const contract = await factory.deploy(NetAddrs[network.name].WETH, 30)
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
