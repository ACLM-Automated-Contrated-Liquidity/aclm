import PanelComponent from '../PanelComponent';
import {Box, Flex, Text} from '@chakra-ui/react';
import {LiquidityChart} from '../price-simulation/LiquidityChart';

export default function DashboardComponent() {
    return (
        <Box width='100%' marginTop='24px'>
            <h1>Earning report</h1>

            <Box width='600px' marginTop='24px'>
                <PanelComponent>
                    <div>
                        <Text>Earning report</Text>
                    </div>

                    <Flex>
                        <Box marginRight='24px'>
                            <h1>$586</h1>
                        </Box>
                        <LiquidityChart p1={1400} p2={2100} pc={1800} nHedge={0} investedSum={1000}></LiquidityChart>
                    </Flex>
                </PanelComponent>
            </Box>
        </Box>
    );
}
