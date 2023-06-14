import styles from './App.module.scss';
import {
    Box,
    Card,
    CardHeader,
    Flex,
    Stat,
    StatArrow,
    StatHelpText,
    StatLabel,
    StatNumber,
    useBoolean,
    useDisclosure,
    Wrap
} from '@chakra-ui/react';
import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import PairTokensIcon, {TokenIcon} from '../pair-tokens-icon/PairTokensIcon';
import {BrowserProvider, Contract as EthersContract, formatEther, parseEther, parseUnits} from 'ethers';
import CenteredLayout from '../../layout/centeredLayout';
import WelcomeWindowComponent from './welcome-window/WelcomeWindowComponent';
import {MATIC, NETWORK, USDC} from '../../interfaces/contract';
import {Utils} from '../../services/utils.service';
import {Token} from '@uniswap/sdk-core';
import {FeeAmount} from '@uniswap/v3-sdk';
import {GOERLI_ABI} from '../../interfaces/georli-abi';

const GOERLI_CONTRACT = '0x7b5351e66A978ecb72669d2aDF932F53ce664EF0';
export const POOLS_MAP = {
    [NETWORK.MUMBAI]: [
        {id: 'eth-usdc', token1: 'ETH', token2: 'USDC'},
        {id: 'matic-usdc', token1: 'MATIC', token2: 'USDC'},
        {id: 'eth-btc', token1: 'ETH', token2: 'BTC'},
        {id: 'flow-usdc', token1: 'FLOW', token2: 'USDC'},
        {id: 'flow-btc', token1: 'FLOW', token2: 'BTC'}
    ],
    [NETWORK.GOERLI]: [
        {id: 'weth-usdc', token1: 'WETH', token2: 'USDC'},
        {id: 'verse-weth', token1: 'VERSE', token2: 'WETH'}
    ],
}

export default function AppComponent() {
    const [showBanner, setShowBanner] = useBoolean(true);
    const [showWindow, setShowWindow] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [balance, setBalance] = useState('');
    const [pools, setPools] = useState([]);
    const [user, setUser] = useState('');
    const router = useRouter();

    useEffect(function onFirstMount() {
        let wallet = (window as any).ethereum;
        wallet?.on('chainChanged', (chainId: string) => {
            setPools(POOLS_MAP[parseInt(chainId, 16)]);
        });

        const init = async () => {
            let provider = new BrowserProvider((window as any).ethereum);
            if (!provider) return;

            let signer = await provider.getSigner();
            const {chainId} = await provider.getNetwork();
            let addr = signer.address;
            let id = `${addr.slice(0, 6)}...${addr.slice(addr.length - 5, addr.length)}`;
            setUser(id);
            setPools(POOLS_MAP[Number(chainId)]);
        }


        const initBalance = async () => {
            let provider = new BrowserProvider(wallet);
            if (!provider) return;

            let balance = await provider.getBalance("0x56AcC95b7Cbd8fe267EF6ec9DA565D2A8708E809")
            setBalance(formatEther(balance));
        }

        init()
            .catch(console.error);
        initBalance()
            .catch(console.error);
    }, []);

    const sendToGoerli = () => {
        let investFn = async () => {
            let provider = new BrowserProvider((window as any).ethereum);
            if (!provider) return;
            let signer = await provider.getSigner();

            let contract = new EthersContract(GOERLI_CONTRACT, GOERLI_ABI, signer);

            const GOERLI_CHAIN_ID = 5;
            const GOERLI_WETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
            let GOERLI_USDC = '0xd35CCeEAD182dcee0F148EbaC9447DA2c4D449c4';
            let GOERLI_POOL = '0x820288D846848A6128480386513dDf4cA0AfE44c';

            let tokenA = new Token(GOERLI_CHAIN_ID, GOERLI_USDC, 6);
            let tokenB = new Token(GOERLI_CHAIN_ID, GOERLI_WETH, 18);
            let [tick1, tick2] = await Utils.computeTicksByTokens(tokenA, tokenB, FeeAmount.LOW);

            // Create the transaction
            const receipt = await contract.invest([
                GOERLI_WETH, GOERLI_USDC, FeeAmount.LOW,
                parseEther("0.0025"),
                parseUnits("29000", 6),
                tick1, tick2,
            ],
                {
                    value: parseEther("0.005"),
                    gasLimit: 10_000_000,
                });

            // const receipt = await contract.swapKnownInput(GOERLI_WETH, GOERLI_USDC, parseEther("0.0025"), FeeAmount.LOW);
            // const receipt = await contract.mint(GOERLI_WETH, GOERLI_USDC, parseEther("0.0025"), FeeAmount.LOW);

            const tx = await receipt.wait();
            let q = 0;
        }

        investFn()
            .catch(console.error);
    }

    return (
        <CenteredLayout>
            <Box width="100%">
                <Flex className={styles.header} alignItems='center' marginBottom='24px'>
                    <Flex direction='column'>
                        <b>Hi {user}</b>
                        <h1>Welcome back &#128075;</h1>
                        <h1>Your balance is: {balance?.toString()}</h1>
                    </Flex>
                </Flex>
                {showBanner &&
                    <Box className={styles.banner} marginBottom='24px'>
                        <Flex direction='column' justifyContent='center'>
                            <h1>Pools Laboratory</h1>
                            <div>Create you spellbound pool</div>
                            <button className={styles.button} onClick={onOpen}>Get started</button>
                        </Flex>
                        <div className={styles.image}></div>
                    </Box>
                }

                <b>Available pools:</b>
                <Wrap spacing='32px' marginTop='8px' overflow='visible'>
                    {!pools.length &&
                        <Box display='flex' justifyContent='center'>Connect your wallet to see available pools</Box>
                    }
                    {pools?.map((pool, i) => {
                            return (
                                <Card
                                    key={i}
                                    className={styles.pool}
                                    onClick={() => router.push({pathname: '/create-position', query: {id: pool.id}})}
                                >
                                    <CardHeader>
                                        <Flex alignItems='center' justifyContent='space-between'>
                                            <Flex alignItems='center'>
                                                <PairTokensIcon token1={TokenIcon[pool.token1] as any} token2={TokenIcon[pool.token2] as any}></PairTokensIcon>
                                                <b style={{marginLeft: '16px'}}>{pool.token1}-{pool.token2}</b>
                                            </Flex>

                                            <Stat display='flex' justifyContent='center' marginLeft='58px'>
                                                <StatLabel>APY</StatLabel>
                                                <StatNumber>45</StatNumber>
                                                <StatHelpText>
                                                    <StatArrow type='increase' />
                                                    9.05%
                                                </StatHelpText>
                                            </Stat>
                                        </Flex>

                                        <Flex marginTop='16px' justifyContent='space-between' flexDirection='column'>
                                            <Flex justifyContent='space-between'>
                                                <b>Volume:</b>
                                                <div>$4.257.628</div>
                                            </Flex>
                                            <Flex justifyContent='space-between'>
                                                <b>Liquidity:</b>
                                                <div>$1.257.628</div>
                                            </Flex>
                                        </Flex>
                                    </CardHeader>
                                </Card>
                            )
                    })}
                </Wrap>
            </Box>
            <WelcomeWindowComponent isOpen={isOpen} onOpen={onOpen} onClose={onClose}></WelcomeWindowComponent>
        </CenteredLayout>
    );
}
