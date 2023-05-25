# aclm

## Let's get started!

### Run backend

```
cd backend
npm i
npm run start
```

watch for
`Server running at http://localhost:3000` message

Use `nmp run start port=<your-port>` to start server on arbitrary port.

### Run with different network

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
curl -XPOST -H "Content-Type: application/json" "localhost:3000/pools/estimatePositionFee" -d '{"token0": "0x55d398326f99059ff775485246999027b3197955", "token1": "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", "priceLower": 302.087, "priceUpper": 311.909, "deposit": 320}'
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
