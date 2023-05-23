import {BsArrowLeft} from 'react-icons/bs';
import {Box, Button, Flex, Text} from '@chakra-ui/react';
import styles from './create-position.module.scss';
import PanelComponent from '../../components/PanelComponent';
import {
    AreaSeries,
    HorizontalGridLines,
    VerticalGridLines,
    XYPlot,
} from 'react-vis';
import React from 'react';

export default function CreatePosition2Page() {
    let data = [];
    for (let i = 0; i < 1000; i++) {
        let phi = i/100;
        data.push({x: phi, y: Math.sin(phi)});
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
                <XYPlot width={400} height={300} className={styles.chart}>
                    <VerticalGridLines />
                    <HorizontalGridLines />
                    <AreaSeries
                        curve="curveNatural"
                        data={data}
                    />
                </XYPlot>

                <Flex>
                    <Box flex={1} marginTop='32px'>
                        <h1>Create new position</h1>
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
                    <Button>Next step</Button>
                </Flex>
            </PanelComponent>
        </div>
    );
}
