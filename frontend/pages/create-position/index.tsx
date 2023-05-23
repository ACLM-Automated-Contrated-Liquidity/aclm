import {BsArrowLeft} from 'react-icons/bs';
import {Box, Button, Flex, Text} from '@chakra-ui/react';
import styles from './create-position.module.scss';
import PanelComponent from '../../components/PanelComponent';
import React, {useState} from 'react';
import {LineSeries, HorizontalGridLines, VerticalGridLines, XYPlot} from 'react-vis';

export default function CreatePositionPage() {
    const [step, setStep] = useState(1);

    let data = [];
    for (let i = 0; i < 100; i++) {
        let phi = i/10;
        data.push({x: phi, y: Math.sin(phi) + 0.5 * Math.random()});
    }

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
                                    <XYPlot width={1400} height={250} className={styles.chart}>
                                        <rect id="testMask" x={0} y={0} width={100} height={100}></rect>
                                        <VerticalGridLines />
                                        <HorizontalGridLines />
                                        <LineSeries
                                            mask='url(#test)'
                                            curve="curveNatural"
                                            data={data}
                                        />
                                    </XYPlot>
                                    {/*<div className={styles.fill1}></div>*/}
                                    {/*<div className={styles.fill2}></div>*/}
                                    {/*<div className={styles.gradient1}></div>*/}
                                    {/*<div className={styles.gradient2}></div>*/}
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
                        <Flex>
                            <Box flex={1} marginTop='32px'>
                                <h1>Step 3. Select parameters</h1>
                                <Box marginTop='32px'>
                                    Here we show a back test
                                </Box>
                            </Box>
                            <Box className={styles.image1}>

                            </Box>
                        </Flex>

                        <Flex className={styles.footer}>
                            <Button onClick={() => setStep(2)} marginRight='16px'>Back</Button>
                            <Button onClick={() => setStep(3)}>Next step</Button>
                        </Flex>
                    </div>
                }
            </PanelComponent>
        </div>
    );
}
