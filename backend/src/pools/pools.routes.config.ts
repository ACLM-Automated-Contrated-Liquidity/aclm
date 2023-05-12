import { CommonRoutesConfig } from "../common/common.routes.config"
import express from "express"
import fs from "fs"
import { Pool } from "../interfaces/uniswap.interface"
import debug from "debug"
import { estimateFee } from "./poolService"

const debugLog: debug.IDebugger = debug("pools")

type Position = {
    // contract address
    token0: string
    token1: string
    // Price of token1 in terms of token0
    priceLower: number
    priceUpper: number
    // deposit amount in USD
    deposit: number
}

export class PoolsRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, "PoolsRoutes")
    }

    configureRoutes() {
        this.app.route("/pools").get((req: express.Request, res: express.Response) => {
            res.status(200).json(getPools())
        })

        this.app
            .route("/pools/estimatePositionFee")
            .post((req: express.Request<{}, {}, Position>, res: express.Response) => {
                const body = req.body
                debugLog(`Estimating fee for a position: ${JSON.stringify(body)}`)
                estimateFee(
                    body.token0,
                    body.token1,
                    body.priceLower,
                    body.priceUpper,
                    body.deposit
                )
                    .then((result) => res.status(200).json({ feeUSD: result }))
                    .catch((err) => {
                        debugLog(err)
                        res.status(500).send(err)
                    })
            })

        return this.app
    }
}

function getPools(): Pool {
    const content = fs.readFileSync("test/pool_usdc-eth.json", "utf-8")
    const pool: Pool = JSON.parse(content)
    debugLog(`Got pool: ${pool}`)
    return pool
}
