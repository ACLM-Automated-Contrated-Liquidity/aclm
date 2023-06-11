import {BsArrowLeft} from 'react-icons/bs';
import {
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Input, Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay, Progress,
    RangeSlider,
    RangeSliderFilledTrack,
    RangeSliderMark,
    RangeSliderThumb,
    RangeSliderTrack,
    Stack,
    Stat,
    StatArrow,
    StatGroup,
    StatHelpText,
    StatLabel,
    StatNumber,
    Switch,
    Text,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import styles from './create-position.module.scss';
import React, {useEffect, useState} from 'react';
import {PriceChart} from '../../components/PriceChart';
import {LiquidityDistribution} from '../../components/LiquidityDistribution';
import {BrowserProvider, Contract, parseEther, parseUnits} from 'ethers';
import RightSidePanelLayout from '../../layout/rightSidePanelLayout';
import {MATIC, NETWORK, USDC} from '../../interfaces/contract';
import {MUMBAI_CONTRACT as CONTRACT_ABI} from '../../interfaces/mumbai-abi';
import {computePoolAddress, FeeAmount, nearestUsableTick} from '@uniswap/v3-sdk';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import {Token} from '@uniswap/sdk-core';
import {Utils} from '../../services/utils.service';
import {PriceEndpoints} from '../../endpoints/price.endpoints';
import {useRouter} from 'next/router';
import queryString from "query-string";

const CONTRACT_ADDRESS = '0x061a9CB14Dc6cd0293C516A6B58b880d4F7c4EDD';
const UNISWAP_FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

const POOLS_MAP = {
    [NETWORK.MUMBAI]: [
        {id: 'eth-usdc', token1: 'ETH', token2: 'USDC'},
        {id: 'matic-usdc', token1: 'MATIC', token2: 'USDC'},
        {id: 'eth-btc', token1: 'ETH', token2: 'BTC'},
        {id: 'flow-usdc', token1: 'FLOW', token2: 'USDC'},
        {id: 'flow-btc', token1: 'FLOW', token2: 'BTC'}
    ],
    [NETWORK.GOERLI]: [
        {id: 'weth-usdc', token1: 'WETH', token2: 'USDC'},
        {id: 'verse-weth', token1: 'VERSE', token2: 'WETH'}
    ],
}

// async function computeTicks(addr1: string, addr2: string, fee: number) {
//     const provider = new BrowserProvider((window as any).ethereum);
//     const poolAddr = computePoolAddress({
//         factoryAddress: UNISWAP_FACTORY,
//         tokenA: new Token(USDC.chainId, USDC.address, 6),
//         tokenB: new Token(MATIC.chainId, MATIC.address, 18),
//         fee: FeeAmount.MEDIUM,
//     });
//
//     const pool = new Contract(poolAddr, IUniswapV3PoolABI, provider);
//     const slot = await pool.slot0();
//     const spacing = await pool.tickSpacing();
//     const tickLower = nearestUsableTick(Number(slot.tick), Number(spacing)) - Number(spacing) * 20;
//     const tickUpper = nearestUsableTick(Number(slot.tick), Number(spacing)) + Number(spacing) * 20;
//     return [tickLower, tickUpper];
// }

export default function CreatePositionPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [lowerBound, setLowerBound] = useState(1850);
    const [upperBound, setUpperBound] = useState(1950);
    const [token1, setToken1] = useState(0.5);
    const [token2, setToken2] = useState(0.5);
    const [minDisplayedPrice, setMinDisplayedPrice] = useState(0);
    const [maxDisplayedPrice, setMaxDisplayedPrice] = useState(0);
    const [poolId, setPoolId] = useState(-1);
    const [investedSum, setInvestedSum] = useState(100);
    const [currentPrice, setCurrentPrice] = useState(1000);
    const [network, setNetwork] = useState(5);
    const [hash, setHash] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    let onRangeChanged = ([lBound, uBound]: [number, number]) => {
        setLowerBound(lBound);
        setUpperBound(uBound);
        updateTokensCount(investedSum);
    };

    let updateTokensCount = (newSum: number) => {
        const [t1, t2] = Utils.getTokensCount(newSum, currentPrice, lowerBound, upperBound);
        setToken1(t1 / currentPrice);
        setToken2(t2);
    }

    useEffect(() => {
        const init = async () => {
            let provider = new BrowserProvider((window as any).ethereum);
            let {chainId} = await provider.getNetwork();
            setNetwork(Number(chainId));

            router.query = queryString.parse(router.asPath.split(/\?/)[1]);
            let polId = (router.query as any).id;
            setPoolId(polId);

            PriceEndpoints.getPrice(getPool(polId, Number(chainId)).token1)
                .subscribe(pricePoints => {
                    if (!pricePoints.length) return;

                    let curPrice = (pricePoints[pricePoints.length - 1])?.y;
                    setCurrentPrice(curPrice);
                    setMinDisplayedPrice(curPrice * 0.5);
                    setMaxDisplayedPrice(curPrice * 2);
                    setLowerBound(curPrice * 0.6);
                    setUpperBound(curPrice * 1.2);
                });
        }

        init();
    }, []);

    const getHash = (hash: string) => {
        return `${hash.slice(0, 6)}...${hash.slice(hash.length - 5, hash.length)}`;
    }

    const getPool = (id: number = poolId, chainId: number = network) => {
        return POOLS_MAP[chainId].find(pool => pool.id === id);
    }

    const invest = () => {
        const investFn = async () => {
            let provider = new BrowserProvider((window as any).ethereum);
            let signer = await provider.getSigner();

            let contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            // let [tick1, tick2] = await computeTicks(null, null, 3000);
            let [tick1, tick2] = [0, 0];

            // Create the transaction
            const receipt = await contract.invest([
                    MATIC.address, USDC.address, 3000,
                    parseEther("0.05"),
                    parseUnits("1000", 6),
                    tick1, tick2,
                ],
                {
                    value: parseEther("0.01"),
                    gasLimit: 2_000_000,
                });

            setHash(receipt.hash);
            onOpen();

            const tx = await receipt.wait();
            toast({
                position: 'bottom-left',
                render: () => (
                    <Box color='white' p={3} bg='purple.500'>
                        <a href={`https://mumbai.polygonscan.com/address/${tx.hash}`}>Transaction completed successfully</a>
                    </Box>
                ),
            });
        }

        investFn()
            .catch(console.error);
    }

    const onInvestedSumChanged = (investedSum: number) => {
        setInvestedSum(investedSum);
        updateTokensCount(investedSum);
    };

    return (
        <RightSidePanelLayout>
            <div>
                <a href='/app'>
                    <Flex className={styles.backButton} align='center'>
                        <BsArrowLeft />
                        <Text>Back to Pools</Text>
                    </Flex>
                </a>

                <Card>
                    <CardHeader>
                        <Flex justifyContent='space-between'>
                            <Heading>Create position: {getPool()?.token1}-{getPool()?.token2}</Heading>
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
                            <PriceChart token={getPool()?.token1} lowerBound={lowerBound} upperBound={upperBound}></PriceChart>
                        </Box>

                        <Box className={styles.sliderWrap}>
                            <FormControl>
                                <FormLabel>Select range</FormLabel>
                                <HStack spacing={3}>
                                    <Input value={lowerBound} readOnly width='80px'></Input>
                                    <RangeSlider
                                        min={minDisplayedPrice}
                                        max={maxDisplayedPrice}
                                        step={(maxDisplayedPrice - minDisplayedPrice) / 1000}
                                        value={[lowerBound, upperBound]}
                                        onChange={range => onRangeChanged(range as [number, number])}
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
                                    <Input value={upperBound} readOnly width='80px'></Input>
                                </HStack>
                            </FormControl>
                        </Box>

                        <FormControl marginTop='16px'>
                            <FormLabel>Invest (USDC)</FormLabel>
                            <Input
                                value={investedSum}
                                onChange={(event) => onInvestedSumChanged(Number(event.target.value))}
                            ></Input>
                        </FormControl>
                    </CardBody>

                    <CardFooter justifyContent='end'>
                        <HStack className={styles.footer} marginTop='32px' spacing={3}>
                            <Button onClick={() => setStep(2)}>Back</Button>
                            <Button colorScheme='purple'>Run backtest</Button>
                        </HStack>
                    </CardFooter>
                </Card>

                <Card className={styles.rightPanel}>
                    <CardHeader>
                        <Heading>Parameters</Heading>
                    </CardHeader>
                    <CardBody>
                        <Stack spacing={3}>
                            <LiquidityDistribution
                                lowerBound={lowerBound}
                                upperBound={upperBound}
                                minPrice={minDisplayedPrice}
                                maxPrice={maxDisplayedPrice}
                                currentPrice={currentPrice}
                            ></LiquidityDistribution>

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
                                    <FormLabel>{poolId}</FormLabel>
                                    <Input value={token1} readOnly></Input>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>USDC</FormLabel>
                                    <Input value={token2} readOnly></Input>
                                </FormControl>
                            </HStack>

                            <Divider paddingTop='8px' paddingBottom='8px'></Divider>

                            <StatGroup paddingTop='8px'>
                                <Stat display='flex' justifyContent='center'>
                                    <StatLabel>Daily yeilds</StatLabel>
                                    <StatNumber>1,670</StatNumber>
                                    <StatHelpText>
                                        <StatArrow type='increase' />
                                        1.26%
                                    </StatHelpText>
                                </Stat>

                                <Stat display='flex' justifyContent='center'>
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
                        <Button colorScheme='purple' onClick={() => invest()}>Invest</Button>
                    </CardFooter>
                </Card>
            </div>

            <Modal isOpen={isOpen}
                   onClose={onClose}
                   motionPreset='scale'
                   isCentered
            >
                <ModalOverlay />
                <ModalContent maxW='280px'>
                    <ModalHeader>Transaction submited</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex' alignItems='center' flexDirection='column'>
                        <Box className={styles.nftImage} marginBottom='16px'></Box>
                        <b>Link to blockchain scan:</b>
                        <a className={styles.link} href={`https://mumbai.polygonscan.com/address/${hash}`} target="_blank">{getHash(hash)}</a>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </RightSidePanelLayout>
    );
}
