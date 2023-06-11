import PanelComponent from '../PanelComponent';
import {Badge, Box, Button, Flex} from '@chakra-ui/react';
import styles from '../app/App.module.scss';
import {useRouter} from 'next/router';
import PairTokensIcon, {TokenIcon} from '../pair-tokens-icon/PairTokensIcon';
import CreatePositionWindow from './CreatePositionWindow/CreatePositionWindow';
import {useEffect, useState} from 'react';
import {MUMBAI_CONTRACT as CONTRACT_ABI} from '../../interfaces/mumbai-abi';
import {BrowserProvider, Contract, formatEther, formatUnits} from 'ethers';
import {Network, PositionInfo, TokenMap} from '../../interfaces/contract';

const LIMIT = BigInt('10000000000');
const CONTRACT_ADDRESS = '0x061a9CB14Dc6cd0293C516A6B58b880d4F7c4EDD';

export default function Dashboard() {
    const router = useRouter();
    const [showWindow, setShowWindow] = useState(false);
    const [positions, setPositions] = useState([]);

    const parseAmount = (amount: bigint) => {
        return amount < LIMIT ? formatUnits(amount, 6) : formatEther(amount);
    }
    const round = (value: number) => {
        return Math.round(value * 100) / 100;
    }

    useEffect(() => {
        const init = async () => {
            const provider = new BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const {chainId} = await provider.getNetwork();
            const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
            let rawPositions: number[] = await contract.getAllPosition();
            let rawData = [];
            let fullInfo = [];
            if (rawPositions && rawPositions.length) {
                rawData = await Promise.all(rawPositions.map(async posId => {
                    return await contract.getPositionInfo(posId);
                }));
                rawData = rawData.filter(x => x[0] === signer.address);
                fullInfo = rawData.map(position => ({
                    fee: Number(position[PositionInfo.FEE]) / 10000,
                    token1: TokenMap[position[PositionInfo.TOKEN_1]],
                    token2: TokenMap[position[PositionInfo.TOKEN_2]],
                    amount1: parseAmount(position[PositionInfo.AMOUNT_1]),
                    amount2: parseAmount(position[PositionInfo.AMOUNT_2]),
                }))
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
                    <Flex>Amount 1</Flex>
                    <Flex>Amount 2</Flex>
                    <Flex>Effective APR</Flex>
                </Flex>

                {positions.map((pos, i) => {
                    let token1 = pos.token1;
                    let token2 = pos.token2;

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
                                    <div>Fee {pos.fee}%</div>
                                </Flex>
                            </Flex>

                            <Badge colorScheme='purple'>In Range</Badge>

                            <Flex flex={2}>{round(pos.amount1)} {pos.token1.name}</Flex>
                            <Flex flex={2}>{round(pos.amount2)} {pos.token2.name}</Flex>

                            <Flex justifyContent='flex-end'>54%</Flex>

                            <Button>Manage</Button>
                        </Flex>
                    );
                })}
            </PanelComponent>

            <CreatePositionWindow isOpen={showWindow}></CreatePositionWindow>
        </Box>
    );
}
