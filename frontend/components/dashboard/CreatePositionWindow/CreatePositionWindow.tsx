import {
    Box,
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
import 'react-vis/dist/style.css';
import React, {useEffect, useState} from 'react';
import {HorizontalGridLines, LineSeries, VerticalGridLines, XAxis, XYPlot, YAxis} from 'react-vis';

interface CreatePositionProps {
    isOpen: boolean;
}

export default function CreatePositionWindow(props: CreatePositionProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {deposit, setDeposit} = useState(0);
    const [showChart, setShowChart] = useState(false);

    useEffect(() => {
        props.isOpen ? onOpen() : onClose();
    }, [props.isOpen]);

    let data = [];
    for (let i = 0; i< 100; i++) {
        data.push({x: i, y: 10 * Math.log(i)});
    }

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
                    <Flex>
                        <Box>
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
                        </Box>

                        {
                            showChart &&
                            <XYPlot width={400} height={300}>
                                <VerticalGridLines />
                                <HorizontalGridLines />
                                <XAxis tickLabelAngle={90}/>
                                <YAxis />
                                <LineSeries data={data} />
                            </XYPlot>
                        }
                    </Flex>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme='blue' mr={3} onClick={() => setShowChart(true)}>
                        Simulate
                    </Button>
                    <Button variant='ghost'>Open position</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
