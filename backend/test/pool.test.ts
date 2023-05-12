import { expect } from "chai"
import { estimateFee } from "../src/pools/poolService"

describe("estimate daily fee", function () {
    this.timeout(15000)
    const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
    const LINK = "0x514910771af9ca656af840dff83e8264ecf986ca"
    const pl = 0.0002675857
    const pu = 0.0003129959

    it("should return more than 0", async function () {
        const fee = await estimateFee(WBTC, LINK, pl, pu, 1000)
        expect(fee).above(0)
    })
})
