import {
    Box, Button,
    Flex, Heading,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay, Progress, Step, StepIcon, StepIndicator, Stepper, StepStatus,
    useDisclosure, useSteps
} from '@chakra-ui/react';
import React from 'react';
import styles from './WelcomeWindowComponent.module.scss';

const steps = [
    { title: 'First', description: 'Contact Info' },
    { title: 'Second', description: 'Date & Time' },
    { title: 'Third', description: 'Select Rooms' },
]

export default function WelcomeWindowComponent(props) {
    const { activeStep, setActiveStep } = useSteps({
        index: 1,
        count: steps.length,
    })
    const activeStepText = steps[activeStep].description

    const max = steps.length - 1
    const progressPercent = (activeStep / max) * 100

    return (
        <Modal isOpen={props.isOpen}
               onClose={props.onClose}
               motionPreset='scale'
               isCentered
        >
            <ModalOverlay />
            <ModalContent maxH="500px" maxW="900px">
                <ModalHeader></ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex marginTop="40px">
                        <Flex flex={1} alignItems='center' flexDirection='column' margin='20px'>
                            <Heading as='h1' fontSize='32px'>Welcome to Spellbound pools</Heading>
                            <p>Sit back, relax, and let the Concentrated Liquidity Manager take care of the heavy lifting. We will continuously scan the market, assess liquidity conditions, and promptly trigger adjustments if your positions drift beyond your predefined boundaries.
                                This means more time for you to focus on your trading or investment strategies without worrying about staying within range.
                            </p>
                        </Flex>
                        <Flex flex={1} alignItems={'center'} justifyContent={'center'}>
                            <Box className={styles.image}></Box>
                        </Flex>
                    </Flex>
                </ModalBody>
                <ModalFooter marginTop='16px'>
                    <Box position='relative' marginRight='18%' width='50%'>
                        <Stepper size='sm' index={activeStep} gap='0'>
                            {steps.map((step, index) => (
                                <Step key={index}>
                                    <StepIndicator bg='white'>
                                        <StepStatus complete={<StepIcon />} />
                                    </StepIndicator>
                                </Step>
                            ))}
                        </Stepper>
                        <Progress
                            value={progressPercent}
                            position='absolute'
                            height='3px'
                            width='full'
                            top='10px'
                            zIndex={-1}
                        />
                    </Box>
                    <Button onClick={props.onClose}>Next</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
