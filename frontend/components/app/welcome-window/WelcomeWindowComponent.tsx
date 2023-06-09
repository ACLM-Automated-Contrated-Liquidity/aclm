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
import React, {useEffect} from 'react';
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

    const max = steps.length - 1
    const progressPercent = (activeStep / max) * 100;

    const nextClick = () => {
        setActiveStep(activeStep + 1);
        if (activeStep === 3) {
            props.onClose();
        }
    }

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
                    {activeStep === 1 &&
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
                    }
                    {activeStep === 2 &&
                        <Flex marginTop="40px">
                            <Flex flex={1} alignItems='center' flexDirection='column' margin='20px'>
                                <Heading as='h1' fontSize='32px'>Adjust Position</Heading>
                                <p>Gone are the days of frantically adjusting your positions to maintain liquidity. The Concentrated Liquidity Manager continuously scans the market, assessing the liquidity conditions and comparing them against your defined range parameters.
                                    If your position drifts beyond these boundaries, this innovative tool promptly triggers an automatic adjustment mechanism..
                                </p>
                            </Flex>
                            <Flex flex={1} alignItems={'center'} justifyContent={'center'}>
                                <Box className={styles.image2}></Box>
                            </Flex>
                        </Flex>
                    }
                    {activeStep === 3 &&
                        <Flex marginTop="40px">
                            <Flex flex={1} alignItems='center' flexDirection='column' margin='20px'>
                                <Heading as='h1' fontSize='32px'>Secure and efficient stacking</Heading>
                                <p>By eliminating the need for constant position tracking, "Spellbound pools" allows you to invest your funds with a greater sense of ease and convenience.
                                    This approach can be particularly beneficial for individuals who prefer a hands-off investment strategy or lack the time or expertise to closely monitor their investment portfolio.
                                </p>
                            </Flex>
                            <Flex flex={1} alignItems={'center'} justifyContent={'center'}>
                                <Box className={styles.image}></Box>
                            </Flex>
                        </Flex>
                    }
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
                    <Button onClick={nextClick}>{activeStep < 3 ? 'Next' : 'Close'}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
