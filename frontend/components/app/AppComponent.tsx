import styles from './App.module.scss';
import {
    Box,
    Card,
    CardHeader,
    Flex, Stat, StatArrow,
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
import {BrowserProvider, formatEther} from 'ethers';
import CenteredLayout from '../../layout/centeredLayout';
import WelcomeWindowComponent from './welcome-window/WelcomeWindowComponent';

export default function AppComponent() {
    const [showBanner, setShowBanner] = useBoolean(true);
    const [showWindow, setShowWindow] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [balance, setBalance] = useState('');
    const router = useRouter();

    const pools = [
        {token1: 'ETH', token2: 'USDC'},
        {token1: 'MATIC', token2: 'USDC'},
        {token1: 'ETH', token2: 'BTC'},
        {token1: 'FLOW', token2: 'USDC'},
        {token1: 'FLOW', token2: 'BTC'}
    ];

    useEffect(function onFirstMount() {
        const initBalance = async () => {
            let provider = new BrowserProvider((window as any).ethereum);
            let balance = await provider.getBalance("0x56AcC95b7Cbd8fe267EF6ec9DA565D2A8708E809")

            setBalance(formatEther(balance));
        }

        initBalance()
            .catch(console.error);
    }, []);

    return (
        <CenteredLayout>
            <Box width="100%">
                <Flex className={styles.header} alignItems='center' marginBottom='24px'>
                    <Flex direction='column'>
                        <b>Hi Kirill</b>
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
                    {pools.map((pool, i) => {
                            return (
                                <Card
                                    key={i}
                                    className={styles.pool}
                                    onClick={() => router.push({pathname: '/create-position', query: {t1: pool.token1}})}
                                >
                                    <CardHeader>
                                        <Flex alignItems='center' justifyContent='space-between'>
                                            <Flex alignItems='center'>
                                                <PairTokensIcon token1={TokenIcon[pool.token1]} token2={TokenIcon[pool.token2]}></PairTokensIcon>
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
