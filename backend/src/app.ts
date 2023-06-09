import express from "express"
import * as http from "http"
import serverless from "serverless-http"

import * as winston from "winston"
import * as expressWinston from "express-winston"
import cors from "cors"
import { CommonRoutesConfig } from "./common/common.routes.config"
import { PoolsRoutes } from "./pools/pools.routes.config"
import debug from "debug"
import { NETWORKS, setCurrentNetwork } from "./common/networks"

const args: Record<string, string> = {}
process.argv.forEach((val) => {
    if (val.includes("=")) {
        let [key, value] = val.split("=")
        key = key.startsWith("--") ? key.slice(2) : key
        args[key] = value
    }
})

console.log(`Script starting with arguments: ${JSON.stringify(args)}`)

const app: express.Application = express()
const server: http.Server = http.createServer(app)
const port = args.port || 3000
const routes: Array<CommonRoutesConfig> = []
const debugLog: debug.IDebugger = debug("app")

// here we are adding middleware to parse all incoming requests as JSON
app.use(express.json())

// here we are adding middleware to allow cross-origin requests
app.use(cors())

// here we are preparing the expressWinston logging middleware configuration,
// which will automatically log all HTTP requests handled by Express.js
const loggerOptions: expressWinston.LoggerOptions = {
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.colorize({ all: true })
    ),
}

if (!process.env.DEBUG) {
    loggerOptions.meta = false // when not debugging, log requests as one-liners
}

const network = args.network || NETWORKS.ethereum.id
setCurrentNetwork(network)
debugLog(`Set network to: ${network}`)

// initialize the logger with the above configuration
app.use(expressWinston.logger(loggerOptions))

// here we are adding the UserRoutes to our array,
// after sending the Express.js application object to have the routes added to our app!
routes.push(new PoolsRoutes(app))

// this is a simple route to make sure everything is working properly
const runningMessage = `Server running at http://localhost:${port}`
app.get("/", (req: express.Request, res: express.Response) => {
    res.status(200).send(runningMessage)
})

export const handler = serverless(app)

// server.listen(port, () => {
//     routes.forEach((route: CommonRoutesConfig) => {
//         debugLog(`Routes configured for ${route.getName()}`)
//     })
//     // our only exception to avoiding console.log(), because we
//     // always want to know when the server is done starting up
//     console.log(runningMessage)
// })
