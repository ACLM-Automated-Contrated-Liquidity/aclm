import styles from "./App.module.scss";
import PanelComponent from '../PanelComponent';
import usdc from "node_modules/cryptocurrency-icons/svg/color/usdc.svg";
import eth from "node_modules/cryptocurrency-icons/svg/color/eth.svg";
import {Button, Flex, FormControl, FormLabel, Input, useDisclosure} from '@chakra-ui/react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import {useState} from 'react';
import {LiquidityChart} from '../price-simulation/LiquidityChart';
import {BalanceChart} from '../price-simulation/BalanceChart';

export default function AppComponent() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {deposit, setDeposit} = useState(0);

    return (
        <PanelComponent className={styles.container}>
            <b style={{display: 'block', padding: '16px'}}>Available pools</b>

            {[...Array(5)].map((x, i) =>
                <Flex key={i} className={styles.row} onClick={onOpen}>
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

            <Modal isOpen={isOpen}
                   onClose={onClose}
                   motionPreset='scale'
                   size='xl'
                   isCentered
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create LP position</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Deposit amount</FormLabel>
                            <Input
                                defaultValue={1000}
                                value={deposit}
                                onChange={(val) => setDeposit(val)}></Input>
                        </FormControl>

                        <Flex style={{marginTop: '16px'}}>
                            <FormControl>
                                <FormLabel>Min bound</FormLabel>
                                <Input defaultValue={1800} value={deposit}></Input>
                            </FormControl>

                            <FormControl style={{marginLeft: '16px'}}>
                                <FormLabel>Max amount</FormLabel>
                                <Input defaultValue={2000} value={deposit}></Input>
                            </FormControl>
                        </Flex>

                        {/*<LiquidityChart p1={1800} p2={2000} nHedge={0} investedSum={1000}></LiquidityChart>*/}
                        <BalanceChart p1={deposit} p2={2000} pc={1850} nHedge={0}></BalanceChart>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant='ghost'>Secondary Action</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </PanelComponent>
    );
}
