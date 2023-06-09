import PanelComponent from '../PanelComponent';
import {Badge, Box, Button, Flex} from '@chakra-ui/react';
import styles from '../app/App.module.scss';
import {useRouter} from 'next/router';
import PairTokensIcon, {TokenIcon} from '../pair-tokens-icon/PairTokensIcon';
import CreatePositionWindow from './CreatePositionWindow/CreatePositionWindow';
import {useEffect, useState} from 'react';
import {abi as CONTRACT_ABI} from '../../interfaces/mumbai-abi.json';
import {BrowserProvider, Contract, parseEther, parseUnits} from 'ethers';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import {computePoolAddress, FeeAmount, nearestUsableTick} from '@uniswap/v3-sdk';
import {MUMBAI_CHAIN_ID, USDC, MATIC, PositionInfo, TokenMap} from '../../interfaces/contract';
import {Token} from '@uniswap/sdk-core';

const CONTRACT_ADDRESS = '0x061a9CB14Dc6cd0293C516A6B58b880d4F7c4EDD';


export default function Dashboard() {
    const router = useRouter();
    const [showWindow, setShowWindow] = useState(false);
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        const init = async () => {
            const provider = new BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
            let rawPositions: number[] = await contract.getAllPosition();
            let fullInfo = [];
            if (rawPositions && rawPositions.length) {
                fullInfo = await Promise.all(rawPositions.map(async posId => {
                    return await contract.getPositionInfo(posId);
                }));
                fullInfo = fullInfo.filter(x => x[0] === signer.address);
            }

            setPositions(fullInfo);
        }

        init()
            .catch(console.error);
    }, []);

    return (
        <Box width='100%' marginTop='24px'>

            <PanelComponent className={styles.container}>
                <b style={{display: 'block', padding: '16px'}}>Available pools</b>
                <Flex className={styles.header}>
                    <Flex>Pool</Flex>
                    <Flex>My Position</Flex>
                    <Flex>Pending Yield</Flex>
                    <Flex>Effective APR</Flex>
                </Flex>

                {positions.map((pos, i) => {
                    let token1 = TokenMap[pos[PositionInfo.TOKEN_1]];
                    let token2 = TokenMap[pos[PositionInfo.TOKEN_2]];

                    return (
                        <Flex
                            key={i}
                            className={styles.row}
                            alignItems='center'
                            onClick={() => setShowWindow(true)}
                        >
                            <Flex>
                                <PairTokensIcon token1={token1.icon} token2={token2.icon}></PairTokensIcon>
                                <Flex direction='column' justifyContent='center' marginLeft='16px'>
                                    <b>{token1.name}-{token2.name}</b>
                                    <div>Fee {Number(pos[PositionInfo.FEE]) / 10000}%</div>
                                </Flex>
                            </Flex>

                            <Badge colorScheme='purple'>In Range</Badge>

                            <div>435.6$</div>

                            <div>16$</div>

                            <Flex flex={1} justifyContent='flex-end'>54%</Flex>

                            <Button>Manage</Button>
                        </Flex>
                    );
                })}
            </PanelComponent>

            <CreatePositionWindow isOpen={showWindow}></CreatePositionWindow>
        </Box>
    );
}
