import {CommonRoutesConfig} from '../common/common.routes.config';
import express from 'express';
import fs from "fs";
import { Pool } from '../scripts/uniswap/uniswap.interface';
import debug from 'debug';

const debugLog: debug.IDebugger = debug('pools');

export class PoolsRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'PoolsRoutes');
    }

    configureRoutes() {

        this.app.route(`/pools`)
            .get((req: express.Request, res: express.Response) => {
                res.status(200).json(getPools());
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