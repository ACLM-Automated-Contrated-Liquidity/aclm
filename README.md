# ACLM - Automated Concentrated Liquidity Management

This is technical name for **Spellbound Pools** project
www.spellboundpool.com

![Logo](spellboundPoolsLogo.jpg)

## Getting started

Documentation available
https://aclm.gitbook.io/spellboundpools/

### Run frontend

```
cd frontend
yarn i
yarn dev
```

### Run backend

```
cd backend
npm i
npm run start
```

watch for
`Server running at http://localhost:3000` message

Use `nmp run start port=<your-port>` to start server on arbitrary port.

#### Run with different network

By default network is Ethereum.
List of supported networks is [here](/backend/src/common/networks.ts)

To run with other network just pass the name as parameter. Example

```
npm run start network=bnb
```

### Estimate fee for a position

First need to prepare contract addresses for both tokens and eval price of token1 / token0

Then send post like an example:

```
curl -XPOST -H "Content-Type: application/json" -H "api-key: 2c18a9d36526c4cf1f271f05b7671741" "localhost:3000/pools/estimatePositionFee" -d '{"token0": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "token1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "priceLower": 0.0002675857, "priceUpper": 0.0003129959, "deposit": 1000}'
```

### Run smart contract tests

We use [Hardhat](https://hardhat.org/) for blockchain development.
All configuration and code inside `/backend` folder

Fill .env

```
ALCHEMY_API_KEY=
ALCHEMY_SEPOLIA_API_KEY=
ALCHEMY_GOERLI_API_KEY=
ALCHEMY_MUMBAI_API_KEY=<key from Alchemy Dashboard>
PRIVATE_KEY=<your private key from test wallet with some MATIC>
POLYGONSCAN_API_KEY=<key from polygonscan.com>
```

Update dependencies

```
npm install
```

Run specific test

```
npx hardhat test --network hardhat --grep 'can deposit'
```

#### Coverage

```
npx hardhat coverage --network hardhat
```

You can find last report inside `./backend/coverage` folder
