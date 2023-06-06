import {ChainId} from '@uniswap/sdk';
import {TokenIcon} from '../components/pair-tokens-icon/PairTokensIcon';

export const MUMBAI_CHAIN_ID: ChainId = <any> 80001;

export enum PositionInfo {
    OWNER,
    LOWER_TICK,
    UPPER_TICK,
    LIQUIDITY,
    TOKEN_1,
    TOKEN_2,
    FEE,
    AMOUNT_1,
    AMOUNT_2,
}

export const USDC = {
    chainId: MUMBAI_CHAIN_ID,
    address: "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23",
}

export const MATIC = {
    chainId: MUMBAI_CHAIN_ID,
    address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
}

export const ETH = {
    chainId: MUMBAI_CHAIN_ID,
    address: "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
}

export const TokenMap = {
    [USDC.address]: {
        name: 'USDC',
        icon: TokenIcon.USDC,
    },
    [MATIC.address]: {
        name: 'MATIC',
        icon: TokenIcon.MATIC,
    },
    [ETH.address]: {
        name: 'ETH',
        icon: TokenIcon.ETH,
    },
}

export const Network = {
    MUMBAI_CHAIN_ID: {
        USDC: "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23",
        MATIC: "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23",
        ETH: "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
    }
}

export const CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "getAllPosition",
        "outputs": [{"internalType": "uint[]", "name": "memory", "type": "uint[]"}],
        "stateMutability": "view",
        "type": "function",
    }, {
        "inputs": [{"internalType":"uint256","name":"tokenId","type":"uint256"}],
        "stateMutability": "view",
        "type": "function",
        "name": "getPositionInfo",
        "outputs": [
            {
                "internalType": "struct InvestmentManager.MintedPosition",
                "name": "",
                "type": "tuple",
                "components": [
                    {"internalType":"address","name":"owner","type":"address"},
                    {"internalType":"int24","name":"tickLower","type":"int24"},
                    {"internalType":"int24","name":"tickUpper","type":"int24"},
                    {"internalType":"uint128","name":"liquidity","type":"uint128"},
                    {"internalType":"address","name":"token0","type":"address"},
                    {"internalType":"address","name":"token1","type":"address"},
                    {"internalType":"uint24","name":"fee","type":"uint24"},
                    {"internalType":"uint256","name":"amount0","type":"uint256"},
                    {"internalType":"uint256","name":"amount1","type":"uint256"}
                ]
            }],
    }, {
        "inputs": [
            {"internalType":"address","name":"token0","type":"address"},
            {"internalType":"address","name":"token1","type":"address"},
            {"internalType":"uint24","name":"fee","type":"uint24"},
            {"internalType":"uint","name":"amount0","type":"uint"},
            {"internalType":"uint","name":"amount1","type":"uint"},
            {"internalType":"int24","name":"tickLower","type":"int24"},
            {"internalType":"int24","name":"tickUpper","type":"int24"},
        ],
        "name": "invest",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function",
    }
];
