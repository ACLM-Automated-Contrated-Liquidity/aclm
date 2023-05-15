import {
    Button,
    Flex,
    FormControl,
    FormLabel, Input, Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay, useDisclosure
} from '@chakra-ui/react';
import {BalanceChart} from '../../price-simulation/BalanceChart';
import {useEffect, useState} from 'react';

interface CreatePositionProps {
    isOpen: boolean;
}

export default function CreatePositionWindow(props: CreatePositionProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {deposit, setDeposit} = useState(0);

    useEffect(() => {
        props.isOpen ? onOpen() : onClose();
    }, [props.isOpen]);

    return (
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
    );
}
