import axios from "axios"
import { getCurrentNetwork } from "../../common/networks"
import { getTokenLogoURL } from "../../lib/helper"
import { Token } from "../../interfaces/uniswap.interface"

const _processTokenInfo = (token: Token) => {
    token.logoURI = getTokenLogoURL(getCurrentNetwork().id, token.id)

    // TODO: check the network id before replace the token name
    if (token.name === "Wrapped Ether" || token.name === "Wrapped Ethereum") {
        token.name = "Ethereum"
        token.symbol = "ETH"
        token.logoURI = "https://cdn.iconscout.com/icon/free/png-128/ethereum-2752194-2285011.png"
    }
    if (token.name === "Wrapped Matic") {
        token.name = "Polygon Native Token"
        token.symbol = "MATIC"
    }
    if (token.name === "Wrapped BNB") {
        token.name = "BSC Native Token"
        token.symbol = "BNB"
    }

    return token
}

export const getToken = async (tokenAddress: string): Promise<Token> => {
    const res = await _queryUniswap(`{
      token(id: "${tokenAddress.toLowerCase()}") {
        id
        name
        symbol
        volumeUSD
        decimals
      }
    }`)

    if (res.token !== null) {
        res.token = _processTokenInfo(res.token)
    }

    return res.token
}

const _queryUniswap = async (query: string): Promise<any> => {
    const { data } = await axios({
        url: getCurrentNetwork().subgraphEndpoint,
        method: "post",
        data: {
            query,
        },
    })

    const errors = data.errors
    if (errors && errors.length > 0) {
        console.error("Uniswap Subgraph Errors", { errors, query })
        throw new Error(`Uniswap Subgraph Errors: ${JSON.stringify(errors)}`)
    }

    return data.data
}
