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

### Estimate fee for a position

First need to prepare contract addresses for both tokens and eval price of token1 / token0

Then send post like an example:

```
curl -XPOST -H "Content-Type: application/json" "localhost:3000/pools/estimatePositionFee" -d '{"token0": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "token1": "0x514910771af9ca656af840dff83e8264ecf986ca", "priceLower": 0.0002675857, "priceUpper": 0.0003129959, "deposit": 1000}'
```
