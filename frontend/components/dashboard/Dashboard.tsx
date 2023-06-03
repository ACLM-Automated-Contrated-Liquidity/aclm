import PanelComponent from '../PanelComponent';
import {Badge, Box, Button, Flex} from '@chakra-ui/react';
import styles from '../app/App.module.scss';
import {useRouter} from 'next/router';
import PairTokensIcon, {Token} from '../pair-tokens-icon/PairTokensIcon';
import CreatePositionWindow from './CreatePositionWindow/CreatePositionWindow';
import {useEffect, useState} from 'react';
import {BrowserProvider, Contract} from 'ethers';

const CONTRACT_ADDRESS = '0x796304266bc2C7884384Af20f894A5Ab434BaE6b';

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
                    "name": "getPositions",
                    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
                    "stateMutability": "view",
                    "type": "function",
                }
            ];
            const contract = new Contract(CONTRACT_ADDRESS, abi, provider);
            let pos = await contract.getPositions();

            setPositions(pos);
        }

        initBalance()
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
