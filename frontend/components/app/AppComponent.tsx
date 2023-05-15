import styles from "./App.module.scss";
import PanelComponent from '../PanelComponent';
import usdc from "node_modules/cryptocurrency-icons/svg/color/usdc.svg";
import eth from "node_modules/cryptocurrency-icons/svg/color/eth.svg";
import {Box, Flex, useBoolean, useDisclosure} from '@chakra-ui/react';
import {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmarkCircle} from '@fortawesome/free-regular-svg-icons';
import CreatePositionWindow from './CreatePositionWindow/CreatePositionWindow';

export default function AppComponent() {
    const {showBanner, setShowBanner} = useBoolean(true);
    const [val, setVal] = useState(false);
    const {isOpen, onOpen} = useDisclosure();

    return (
        <Box width="100%">
            <Flex className={styles.header} alignItems='center' marginBottom='24px'>
                <Flex direction='column'>
                    <b>Hi Kirill</b>
                    <h1>Welcome back &#128075;</h1>
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

                {[...Array(5)].map((x, i) =>
                    <Flex key={i} className={styles.row} onClick={() => setVal(true)}>
                        <div>
                            <Flex className={styles.logo}>
                                <div className={styles.icon} style={{backgroundImage: `url(${usdc.src})`}}></div>
                                <div className={styles.icon} style={{backgroundImage: `url(${eth.src})`}}></div>
                            </Flex>
                        </div>

                        <div>
                            <b>ETH-USDC-LP</b>
                            <div>Stablecoin pair</div>
                        </div>

                        <Flex flex={1} justifyContent='flex-end'>54%</Flex>
                    </Flex>
                )}
            </PanelComponent>

            <CreatePositionWindow isOpen={val}></CreatePositionWindow>
        </Box>
    );
}
