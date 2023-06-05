import PanelComponent from '../PanelComponent';
import {Badge, Box, Button, Flex} from '@chakra-ui/react';
import styles from '../app/App.module.scss';
import {useRouter} from 'next/router';
import PairTokensIcon, {Token} from '../pair-tokens-icon/PairTokensIcon';
import CreatePositionWindow from './CreatePositionWindow/CreatePositionWindow';
import {useEffect, useState} from 'react';
import {BrowserProvider, Contract, parseEther} from 'ethers';

// const CONTRACT_ADDRESS = '0x796304266bc2C7884384Af20f894A5Ab434BaE6b';
const CONTRACT_ADDRESS = '0xDa7AE6a19AE82d43bC00AB9c5DC470D5f5cAFb4b';
const USDC = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const MATIC = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0';

export default function Dashboard() {
    const router = useRouter();
    const [showWindow, setShowWindow] = useState(false);
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        const initBalance = async () => {
            let provider = new BrowserProvider((window as any).ethereum);

            const abi = [
                {
                    "inputs": [],
                    "name": "getAllPosition",
                    "outputs": [{"internalType": "uint[]", "name": "memory", "type": "uint[]"}],
                    "stateMutability": "view",
                    "type": "function",
                }
            ];
            const contract = new Contract(CONTRACT_ADDRESS, abi, provider);
            let pos = await contract.getAllPosition();

            setPositions(pos);
        }

        initBalance()
            .catch(console.error);
    }, []);

    const invest = () => {
        const investFn = async () => {
            let provider = new BrowserProvider((window as any).ethereum);
            let signer = await provider.getSigner();

            const contractABI = [{
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
            }];

            let contract = new Contract(CONTRACT_ADDRESS, contractABI, signer)
            let amount = parseEther("0.1");

            // Create the transaction
            const receipt = await contract.invest(
                MATIC, USDC, 3000, 0.1, 0.1,
                {
                    value: parseEther("0.01"),
                    gasLimit: 20000000,
                });
        }

        investFn()
            .catch(console.error);
    }

    return (
        <Box width='100%' marginTop='24px'>
            <button onClick={() => invest()}>Button</button>

            <PanelComponent className={styles.container}>
                <b style={{display: 'block', padding: '16px'}}>Available pools</b>
                <Flex className={styles.header}>
                    <Flex>Pool</Flex>
                    <Flex>My Position</Flex>
                    <Flex>Pending Yield</Flex>
                    <Flex>Effective APR</Flex>
                </Flex>

                {[...Array(2)].map((x, i) =>
                    <Flex
                        key={i}
                        className={styles.row}
                        alignItems='center'
                        onClick={() => setShowWindow(true)}
                    >
                        <Flex>
                            <PairTokensIcon token1={Token.ETH} token2={Token.USDC}></PairTokensIcon>
                            <Flex direction='column' justifyContent='center' marginLeft='16px'>
                                <b>ETH-USDC-LP</b>
                                <div>Fee 0.05%</div>
                            </Flex>
                        </Flex>

                        <Badge colorScheme='purple'>In Range</Badge>

                        <div>435.6$</div>

                        <div>16$</div>

                        <Flex flex={1} justifyContent='flex-end'>54%</Flex>

                        <Button>Manage</Button>
                    </Flex>
                )}
            </PanelComponent>

            <CreatePositionWindow isOpen={showWindow}></CreatePositionWindow>
        </Box>
    );
}
