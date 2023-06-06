import styles from "./App.module.scss";
import PanelComponent from '../PanelComponent';
import usdc from "node_modules/cryptocurrency-icons/svg/color/usdc.svg";
import eth from "node_modules/cryptocurrency-icons/svg/color/eth.svg";
import {Box, Flex, useBoolean, useDisclosure} from '@chakra-ui/react';
import {useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmarkCircle} from '@fortawesome/free-regular-svg-icons';
import CreatePositionWindow from '../dashboard/CreatePositionWindow/CreatePositionWindow';
import {useRouter} from 'next/router';
import PairTokensIcon, {TokenIcon} from '../pair-tokens-icon/PairTokensIcon';
import {BrowserProvider, formatEther} from 'ethers';
import CenteredLayout from '../../layout/centeredLayout';

export default function AppComponent() {
    const [showBanner, setShowBanner] = useBoolean(true);
    const [showWindow, setShowWindow] = useState(false);
    const {isOpen, onOpen} = useDisclosure();
    const [balance, setBalance] = useState('');
    const router = useRouter();

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
                {!showBanner &&
                    <Box className={styles.banner} marginBottom='24px'>
                        <FontAwesomeIcon
                            className={styles.closeIcon}
                            icon={faXmarkCircle}
                            onClick={setShowBanner?.toggle}
                        />

                        <Flex direction='column' justifyContent='center'>
                            <h1>Dashboard</h1>
                            <div>Unleash the power of concentrated liquidity</div>
                            <button className={styles.button}>Get started</button>
                        </Flex>
                        <div className={styles.image}></div>
                    </Box>
                }

                <PanelComponent className={styles.container}>
                    <b style={{display: 'block', padding: '16px'}}>Available pools</b>
                    <Flex className={styles.row}>
                        <div>Pool</div>
                        <div>Liquidity</div>
                        <div>Volume</div>
                        <div>Fee 24H</div>
                        <div>APR 24H</div>
                    </Flex>

                    {[...Array(5)].map((x, i) =>
                        <Flex key={i} className={styles.row} onClick={() => router.push('/create-position')}>
                            <Flex>
                                <PairTokensIcon token1={TokenIcon.ETH} token2={TokenIcon.USDC}></PairTokensIcon>
                                <Flex direction='column' justifyContent='center' marginLeft='16px'>
                                    <b>ETH-USDC-LP</b>
                                    <div>Fee 0.05%</div>
                                </Flex>
                            </Flex>

                            <div>1.257.628$</div>
                            <div>4.257.628$</div>
                            <div>16.5$</div>
                            <Flex flex={1} justifyContent='flex-end'>54%</Flex>
                        </Flex>
                    )}
                </PanelComponent>

                <CreatePositionWindow isOpen={showWindow}></CreatePositionWindow>
            </Box>
        </CenteredLayout>
    );
}
