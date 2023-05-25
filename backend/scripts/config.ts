export interface NetworkAddresses {
    WETH: string
    DAI: string
    USDC: string
    poolFactory: string
    swapRouter: string
}

export const NetAddrs: { [k: string]: NetworkAddresses } = {
    hardhat: {
        WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        poolFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    },
    localhost: {
        WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        poolFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    },
    sepolia: {
        WETH: "0xb16F35c0Ae2912430DAc15764477E179D9B9EbEa",
        DAI: "0x82fb927676b53b6ee07904780c7be9b4b50db80b",
        USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        poolFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    },
    goerli: {
        WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        DAI: "0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844",
        USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        poolFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    },
    mumbai: {
        WETH: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
        DAI: "0xb973d2876c4f161439ad05f1dae184dbd594e04e",
        USDC: "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747",
        poolFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    },
}
