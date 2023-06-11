import "@nomicfoundation/hardhat-toolbox"
import { HardhatUserConfig } from "hardhat/config"
require("dotenv").config()
// import "solidity-coverage"

export const developmentChains = ["hardhat", "localhost"]

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.18",
                settings: {
                    optimizer: {
                        enabled: true,
                    },
                },
            },
            {
                version: "0.7.6",
                settings: {
                    optimizer: {
                        runs: 200,
                        enabled: true,
                    },
                },
            },
        ],
    },
    // allowUnlimitedContractSize: true,
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            },
        },
        // mainnet_fork: {
        //     accounts: [`${process.env.PRIVATE_KEY}`],
        //     url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        // },
        sepolia: {
            chainId: 11155111,
            accounts: [`${process.env.PRIVATE_KEY}`],
            url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_SEPOLIA_API_KEY}`,
        },
        goerli: {
            chainId: 5,
            accounts: [`${process.env.PRIVATE_KEY}`],
            url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_GOERLI_API_KEY}`,
        },
        mumbai: {
            chainId: 80001,
            accounts: [`${process.env.PRIVATE_KEY}`],
            url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_MUMBAI_API_KEY}`,
            // gas: 2100000,
            gasPrice: 30000000000, // 20 gwei
        },
    },
    etherscan: {
        apiKey: `${process.env.ETHERSCAN_API_KEY}`, //`${process.env.POLYGONSCAN_API_KEY}`,
    },
}

export default config
