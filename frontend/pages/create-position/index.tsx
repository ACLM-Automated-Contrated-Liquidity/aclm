import {BsArrowLeft} from 'react-icons/bs';
import {
    Box,
    Button, Card, CardBody, CardFooter, CardHeader, Divider,
    Flex,
    FormControl,
    FormLabel, Heading, HStack,
    Input,
    RangeSlider,
    RangeSliderFilledTrack,
    RangeSliderMark,
    RangeSliderThumb,
    RangeSliderTrack,
    Stack, Stat, StatArrow, StatGroup, StatHelpText, StatLabel, StatNumber, Switch,
    Text,
    useToast
} from '@chakra-ui/react';
import styles from './create-position.module.scss';
import React, {useState} from 'react';
import {PriceChart} from '../../components/PriceChart';
import {LiquidityDistribution} from '../../components/LiquidityDistribution';
import {BrowserProvider, Contract, parseEther, parseUnits} from 'ethers';

const rawData = [
    {label: 'Mon', aValue: 40, bValue: 62},
    {label: 'Tue', aValue: 14, bValue: 68},
    {label: 'Wed', aValue: 22, bValue: 76},
    {label: 'Thu', aValue: 43, bValue: 54},
    {label: 'Fri', aValue: 33, bValue: 58},
];
const USDC = "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23";

export default function CreatePositionPage() {
    const [step, setStep] = useState(1);
    const [lowerBound, setLowerBound] = useState(1850);
    const [upperBound, setUpperBound] = useState(1950);
    const toast = useToast();

    let data = [];
    for (let i = 0; i < 100; i++) {
        let phi = i/10;
        data.push({x: phi, y: Math.sin(phi) + 0.5 * Math.random()});
    }

    let onRangeChanged = ([lBound, uBound]: [number, number]) => {
        setLowerBound(lBound);
        setUpperBound(uBound);
    };

    let deposit = () => {
        const initBalance = async () => {
            let provider = new BrowserProvider(window.ethereum);
            let signer = await provider.getSigner();

            const contractABI = [{
                stateMutability: 'payable',
                type: 'function',
                name: 'deposit',
                inputs: [],
                outputs: [],
            }];
            let contract = new Contract("0x10d967dDFEdF2Dc548229071705D1a39720f1B2d", contractABI, signer)
            let amount = parseEther("0.01");

            // Create the transaction
            const receipt = await contract.deposit({ value: amount });

            const subscribtion = receipt.wait();

            subscribtion.then(() => {
                toast({
                    title: 'Success',
                    description: "You succesfuly deposited money.",
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                })
            });
        }

        initBalance()
            .catch(console.error);
    }

    let invest = () => {
        const initBalance = async () => {
            let provider = new BrowserProvider(window.ethereum);
            let signer = await provider.getSigner();

            const contractABI = [{
                stateMutability: 'payable',
                type: 'function',
                name: 'invest',
                outputs: [],
                inputs: [
                    {"internalType":"address","name":"otherToken","type":"address"},
                    {"internalType":"uint24","name":"fee","type":"uint24"},
                ],
            }];
            let contract = new Contract("0x10d967dDFEdF2Dc548229071705D1a39720f1B2d", contractABI, signer)
            let amount = parseEther("0.1");

            // Create the transaction
            const receipt = await contract.invest(
                USDC, 3000,
                {
                    value: parseEther("0.01"),
                    gasLimit: 20000000,
                });
        }

        initBalance()
            .catch(console.error);
    }

    return (
        <div>
            <a href='/'>
                <Flex className={styles.backButton} align='center'>
                    <BsArrowLeft />
                    <Text>Back to Pools</Text>
                </Flex>
            </a>

            <Card>
                <CardHeader>
                    <Flex justifyContent='space-between'>
                        <Heading>Create position</Heading>
                        <FormControl display='flex' width='auto'>
                            <FormLabel htmlFor='email-alerts' mb='0'>
                                Enable advanced mode
                            </FormLabel>
                            <Switch/>
                        </FormControl>
                    </Flex>
                </CardHeader>

                <CardBody>
                    <Box marginLeft='32px'>
                        <PriceChart lowerBound={lowerBound} upperBound={upperBound}></PriceChart>
                    </Box>

                    <Box className={styles.sliderWrap}>
                        <FormControl>
                            <FormLabel>Select range</FormLabel>
                            <HStack spacing={3}>
                                <Input defaultValue={lowerBound} readOnly width='80px'></Input>
                                <RangeSlider
                                    min={1700}
                                    max={2200}
                                    defaultValue={[1850, 1900]}
                                    onChange={range => onRangeChanged(range)}
                                >
                                    <RangeSliderMark
                                        value={lowerBound}
                                        textAlign='center'
                                        bg='blue.500'
                                        color='white'
                                        mt='-10'
                                        ml='-5'
                                        w='12'
                                    ></RangeSliderMark>
                                    <RangeSliderTrack>
                                        <RangeSliderFilledTrack />
                                    </RangeSliderTrack>
                                    <RangeSliderThumb index={0} />
                                    <RangeSliderThumb index={1} />
                                </RangeSlider>
                                <Input defaultValue={upperBound} readOnly width='80px'></Input>
                            </HStack>
                        </FormControl>
                    </Box>
                </CardBody>

                <CardFooter justifyContent='end'>
                    <HStack className={styles.footer} marginTop='32px' spacing={3}>
                        <Button onClick={() => setStep(2)}>Back</Button>
                        <Button onClick={() => invest()} colorScheme='purple'>Run backtest</Button>
                    </HStack>
                </CardFooter>
            </Card>

            <Card className={styles.rightPanel}>
                <CardHeader>
                    <Heading>Parameters</Heading>
                </CardHeader>
                <CardBody>
                    <Stack spacing={3}>
                        <LiquidityDistribution lowerBound={lowerBound} upperBound={upperBound}></LiquidityDistribution>

                        <HStack spacing={3}>
                            <FormControl>
                                <FormLabel>Min</FormLabel>
                                <Input value={lowerBound} readOnly></Input>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Max</FormLabel>
                                <Input value={upperBound} readOnly></Input>
                            </FormControl>
                        </HStack>

                        <HStack spacing={3}>
                            <FormControl>
                                <FormLabel>Eth</FormLabel>
                                <Input value="0.001" readOnly></Input>
                            </FormControl>
                            <FormControl>
                                <FormLabel>USDC</FormLabel>
                                <Input value="1000" readOnly></Input>
                            </FormControl>
                        </HStack>

                        <Divider paddingTop='8px' paddingBottom='8px'></Divider>

                        <StatGroup paddingTop='8px'>
                            <Stat display='flex' justifyContent='end'>
                                <StatLabel>Daily yeilds</StatLabel>
                                <StatNumber>1,670</StatNumber>
                                <StatHelpText>
                                    <StatArrow type='increase' />
                                    1.26%
                                </StatHelpText>
                            </Stat>

                            <Stat display='flex' justifyContent='end'>
                                <StatLabel>APY</StatLabel>
                                <StatNumber>45</StatNumber>
                                <StatHelpText>
                                    <StatArrow type='increase' />
                                    9.05%
                                </StatHelpText>
                            </Stat>
                        </StatGroup>
                    </Stack>
                </CardBody>

                <CardFooter justifyContent='end'>
                    <Button colorScheme='purple'>Invest</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
