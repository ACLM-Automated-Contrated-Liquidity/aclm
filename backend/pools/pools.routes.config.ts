import {CommonRoutesConfig} from '../common/common.routes.config';
import express from 'express';
import fs from "fs";
import { Pool } from '../scripts/uniswap/uniswap.interface';
import debug from 'debug';
import { estimateFeeForUSDCETHPosition } from "../scripts/backtest";

const debugLog: debug.IDebugger = debug('pools');

export class PoolsRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'PoolsRoutes');
    }

    configureRoutes() {

        this.app.route("/pools")
            .get((req: express.Request, res: express.Response) => {
                res.status(200).json(getPools());
            });

            // query parameters example ?pl=1800&pu=2000
        this.app.route("/pools/:token0/:token1/estimate")
            .get((req: express.Request, res: express.Response) => {
                const token0 = req.params.token0.toUpperCase();
                const token1 = req.params.token1.toUpperCase();
                debugLog(`Token params: ${token0}, ${token1}`);
                if ((token0 == "ETH" && token1 == "USDC") || (token0 == "USDC" && token1 == "ETH")) {
                    const lower = req.query.pl?.toString() || "1800";
                    const upper = req.query.pu?.toString() || "2000";
                    debugLog(`Estimating fee for a position: ${lower} : ${upper}`);
                    estimateFeeForUSDCETHPosition(parseInt(lower), parseInt(upper))
                        .then(result => res.status(200).json({ "feeUSD": result}))
                        .catch(err => res.status(500).send(err));
                } else {
                    res.status(400).send(`${token0}-${token1} is not supported yet`);
                }
            })
    
        return this.app;
    }
}

function getPools(): Pool {
    const content = fs.readFileSync("test/pool_usdc-eth.json", "utf-8");
    const pool: Pool = JSON.parse(content);
    debugLog(`Got pool: ${pool}`);
    return pool;
}