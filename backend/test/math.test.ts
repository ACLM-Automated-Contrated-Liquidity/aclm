import { getTokensAmountFromDepositAmountUSD } from "../src/lib/math"
import { assert } from "chai"

// write test cases for estimateFee function here
describe("estimateFee", () => {
    const P = 1850 //getPriceFromTick(curTick, "6", "18");
    // const tickFromPrice = getTickFromPrice(P, "6", "18");
    // console.log(`tickFromPrice: ${tickFromPrice}`);
    const Pl = 1750
    const Pu = 1950
    // console.log(`price: ${P}; price lower: ${Pl}; price upper: ${Pu}`)
    const deposit = 1000

    it("should split in almost halves", () => {
        const { amount0, amount1 } = getTokensAmountFromDepositAmountUSD(P, Pl, Pu, P, 1, deposit)
        assert(Math.abs(amount0 - amount1) < 50)
    })

    it("sum of token split should equal deposit", () => {
        const { amount0, amount1 } = getTokensAmountFromDepositAmountUSD(P, Pl, Pu, P, 1, deposit)
        assert(amount0 + amount1 == deposit)
    })
})
