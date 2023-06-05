import {BsArrowLeft} from 'react-icons/bs';
import {
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel, Input, RangeSlider, RangeSliderFilledTrack, RangeSliderThumb, RangeSliderTrack, Stack,
    Table,
    TableContainer, Tbody, Td,
    Text, Th, Thead, Tr
} from '@chakra-ui/react';
import styles from './create-position.module.scss';
import PanelComponent from '../../components/PanelComponent';
import React, {useState} from 'react';
import {LineSeries, HorizontalGridLines, VerticalGridLines, XYPlot, VerticalBarSeries, XAxis} from 'react-vis';

const rawData = [
    {label: 'Mon', aValue: 40, bValue: 62},
    {label: 'Tue', aValue: 14, bValue: 68},
    {label: 'Wed', aValue: 22, bValue: 76},
    {label: 'Thu', aValue: 43, bValue: 54},
    {label: 'Fri', aValue: 33, bValue: 58},
];

export default function CreatePositionPage() {
    const [step, setStep] = useState(1);
    const [ shouldRedraw ] = useState(false);
    const [ isLoaded, setIsLoaded ] =  useState(false);

    let data = [];
    for (let i = 0; i < 100; i++) {
        let phi = i/10;
        data.push({x: phi, y: Math.sin(phi) + 0.5 * Math.random()});
    }

    let openPosition = () => {
        return 1;
    }

    let data2 = [
        {x: 1600, y: 1},
        {x: 1620, y: 2},
        {x: 1640, y: 1},
        {x: 1660, y: 1},
        {x: 1680, y: 1},
        {x: 1700, y: 1},
        {x: 1720, y: 2},
        {x: 1740, y: 4},
        {x: 1760, y: 3},
        {x: 1780, y: 4},
        {x: 1800, y: 7},
        {x: 1820, y: 9},
        {x: 1840, y: 25},
        {x: 1860, y: 27},
        {x: 1880, y: 26},
        {x: 1900, y: 30},
        {x: 1920, y: 27},
        {x: 1940, y: 8},
        {x: 1960, y: 9},
        {x: 1980, y: 6},
        {x: 2000, y: 2},
        {x: 2020, y: 1},
        {x: 2040, y: 1},
        {x: 2060, y: 2},
        {x: 2080, y: 1},
        {x: 2100, y: 2},
        {x: 2120, y: 1},
        {x: 2140, y: 1},
    ];

    return (
        <div>
            <a href='/'>
                <Flex className={styles.backButton} align='center'>
                    <BsArrowLeft />
                    <Text>Back to Pools</Text>
                </Flex>
            </a>

            <PanelComponent className={styles.panel}>
                {
                    step === 1 &&
                    <div>
                        <Flex>
                            <Box flex={1} marginTop='32px'>
                                <h1>Create new position. We will guide you through the process. It is easy</h1>
                                <Box marginTop='32px'>
                                    Hey there! We're thrilled to let you know that we're here to assist you in opening a brand new stock position.
                                    Whether you're a seasoned investor or just starting out,
                                    our team is dedicated to providing you with the support and guidance you need
                                </Box>
                            </Box>
                            <Box className={styles.image1}>
                                {/*<DraggableChart data={rawData}></DraggableChart>*/}
                            </Box>
                        </Flex>

                        <Flex className={styles.footer}>
                            <Button onClick={() => setStep(2)}>Next step</Button>
                        </Flex>
                    </div>
                } {
                    step === 2 &&
                    <div>
                        <Flex>
                            <Box flex={1}>
                                <h1>Step 2. Backtest</h1>
                                <Box marginTop='32px'>
                                    Hey there! We're thrilled to let you know that we're here to assist you in opening a brand new stock position.
                                    Whether you're a seasoned investor or just starting out,
                                    our team is dedicated to providing you with the support and guidance you need
                                </Box>
                                <Box marginTop='32px' marginBottom='32px' position='relative'>
                                    <XYPlot width={1140} height={250} className={styles.chart}>
                                        <rect id="testMask" x={0} y={0} width={100} height={100}></rect>
                                        <VerticalGridLines />
                                        <HorizontalGridLines />
                                        <LineSeries
                                            curve="curveNatural"
                                            data={data}
                                        />
                                    </XYPlot>

                                    <b>Backtest results based on the last month</b>

                                    <Flex>
                                        <Box flex={1}>
                                            <FormControl>
                                                <FormLabel>APY: 59%</FormLabel>
                                                <FormLabel>APR: 102%</FormLabel>
                                            </FormControl>

                                            <Divider margin='16px'/>

                                            <Box>
                                                <div>
                                                    <b>Average position duration: </b>
                                                    <span>5.1 days</span>
                                                </div>
                                                <div>
                                                    <b>Min position duration: </b>
                                                    <span>1.4 days</span>
                                                </div>
                                                <div>
                                                    <b>Max position duration: </b>
                                                    <span>7.9 days</span>
                                                </div>
                                            </Box>
                                        </Box>

                                        <TableContainer>
                                            <Table variant='simple'>
                                                <Thead>
                                                    <Tr>
                                                        <Th>To convert</Th>
                                                        <Th>into</Th>
                                                        <Th isNumeric>multiply by</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    <Tr>
                                                        <Td>inches</Td>
                                                        <Td>millimetres (mm)</Td>
                                                        <Td isNumeric>25.4</Td>
                                                    </Tr>
                                                    <Tr>
                                                        <Td>feet</Td>
                                                        <Td>centimetres (cm)</Td>
                                                        <Td isNumeric>30.48</Td>
                                                    </Tr>
                                                    <Tr>
                                                        <Td>yards</Td>
                                                        <Td>metres (m)</Td>
                                                        <Td isNumeric>0.91444</Td>
                                                    </Tr>
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
                                    </Flex>


                                </Box>
                            </Box>
                        </Flex>

                        <Flex className={styles.footer}>
                            <Button onClick={() => setStep(1)} marginRight='16px'>Back</Button>
                            <Button onClick={() => setStep(3)}>Next step</Button>
                        </Flex>
                    </div>
                } {
                    step === 3 &&
                    <div>
                        <h1>Step 3. Select parameters</h1>
                        <Flex>
                            <Box flex={1} marginTop='16px'>
                                <Stack spacing={3}>
                                    <FormControl>
                                        <FormLabel>Deposit amount:</FormLabel>
                                        <Input defaultValue='1000$'/>
                                    </FormControl>

                                    <Flex>
                                        <FormControl marginRight='32px'>
                                            <FormLabel>USD:</FormLabel>
                                            <Input defaultValue='1000$'/>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Eth:</FormLabel>
                                            <Input defaultValue='1000$'/>
                                        </FormControl>
                                    </Flex>

                                    <Flex>
                                        <FormControl marginRight='32px'>
                                            <FormLabel>Upper price:</FormLabel>
                                            <Input defaultValue='1800'/>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Lower price:</FormLabel>
                                            <Input defaultValue='1950'/>
                                        </FormControl>
                                    </Flex>
                                </Stack>
                            </Box>

                            <Flex alignItems='center' flex={1} justifyContent='center' flexDirection='column'>
                                <XYPlot width={300} height={250} className={styles.chart}>
                                    <XAxis />
                                    <VerticalBarSeries barWidth={1} data={data2}/>
                                </XYPlot>
                                <Box width='200px'>
                                    <RangeSlider
                                        min={1700}
                                        max={2200}
                                        defaultValue={[1850, 1900]}
                                    >
                                        <RangeSliderTrack>
                                            <RangeSliderFilledTrack />
                                        </RangeSliderTrack>
                                        <RangeSliderThumb index={0} />
                                        <RangeSliderThumb index={1} />
                                    </RangeSlider>
                                </Box>
                            </Flex>
                        </Flex>

                        <Flex className={styles.footer} marginTop='32px'>
                            <Button onClick={() => setStep(2)} marginRight='16px'>Back</Button>
                            <Button onClick={() => openPosition()}>Open position</Button>
                        </Flex>
                    </div>
                }
            </PanelComponent>
        </div>
    );
}
