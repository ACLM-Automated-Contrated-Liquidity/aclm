import {HorizontalGridLines, LineSeries, VerticalGridLines, XAxis, XYPlot, YAxis} from 'react-vis';
import React, {Component} from 'react';
import 'react-vis/dist/style.css';
import {Flex, Box, FormControl, FormLabel, Input} from '@chakra-ui/react';
import {PriceEndpoints} from '../../endpoints/price.endpoints';
import moment from 'moment';
import CenteredLayout from '../../layout/centeredLayout';

declare type Series = Point[];

interface Point {
    x: number;
    y: number;
}

interface StrategyState {
    balance?: number;
    lowerPrice?: number;
    upperPrice?: number;
    data?: Series;
    token1?: number;
    token2?: number;
    data1?: Series;
    data2?: Series;
}

export default class TestStrategyPage extends Component<any, StrategyState> {
    balance = 1000;
    price = 1850;
    counter = 0;
    delayCounter = 0;

    state = {
        data: [],
        balance: 1000,
        lowerPrice: 5000,
        upperPrice: 0,
        token1: 0,
        token2: 0,
        data1: this.getLine(1825),
        data2: this.getLine(1875),
    }

    storage = [];
    minY = 5000;
    maxY = 0;

    componentDidMount() {
        let [token1, token2] = this.getTokensCount(this.price, this.state.lowerPrice, this.state.upperPrice);
        this.setState({token1, token2});
        setInterval(() => this.tick(), 100);

        PriceEndpoints.getPrice('ETH').subscribe(price => {
            this.storage = price;
        });
    }

    private getTokensCount(p: number, pa: number, pb: number): [number, number] {
        if (pa > pb) return [0, 0];
        if (p < pa) return [0, this.getTokensCount(pa, pa, pb)[1]];
        if (p > pb) return [this.getTokensCount(pb, pa, pb)[0], 0];

        let L = this.state.balance / (2 * Math.sqrt(p) - Math.sqrt(pa) - p/Math.sqrt(pb));
        let tokenCount1 = L * (Math.sqrt(p) - Math.sqrt(pa));
        let tokenCount2 = L * (1/Math.sqrt(p) - 1/Math.sqrt(pb)) * p;
        return [tokenCount1, tokenCount2];
    }

    private updateData() {
        let data2 = [];
        for (let i = 0; i < 50; i++) {
            data2.push({x: i, y: Math.random()});
        }
    };

    private updateBounds(): number[] {
        let value = this.state.data[this.counter - 1]?.y;
        this.minY = value < this.minY ? value : this.minY;
        this.maxY = value > this.maxY ? value : this.maxY;
        return [this.minY, this.maxY];
    }

    private tick() {
        if (!this.storage.length) return;

        let newPrice = this.storage[this.counter++];
        if (!newPrice) return;

        this.state.data.push(newPrice);
        this.balance = this.state.token1 + this.state.token2;

        this.setState({
            token1: this.state.token1,
            token2: this.state.token2,
            balance: this.balance,
            data: Object.assign([], this.state.data,
        )});

        if (this.state.lowerPrice > newPrice.y || newPrice.y > this.state.upperPrice) {
            this.delayCounter++;

            if (this.delayCounter > 20) {
                let newLowerPrice = newPrice.y - 20;
                let newUpperPrice = newPrice.y + 20;
                let [token1, token2] = this.getTokensCount(newPrice.y, newLowerPrice, newUpperPrice);
                this.setState({
                    token1, token2,
                    lowerPrice: newLowerPrice,
                    upperPrice: newUpperPrice,
                    balance: this.balance,
                    data1: this.getLine(newLowerPrice),
                    data2: this.getLine(newUpperPrice),
                    data: Object.assign([], this.state.data),
                });
            }
        } else {
            this.delayCounter = 0;
        }
    };

    private getLine(price: number): Series {
        return [
            {x: this.state?.data[0]?.x || 0, y: price},
            {x: 2 * this.state?.data[this.state.data.length - 1]?.x || 0, y: price},
        ];
    }

    render() {
        return (
            <CenteredLayout>
                <Flex>
                    <XYPlot
                        width={800}
                        height={400}
                        xTime='time'
                        xDomain={[this.state.data[0]?.x, this.state.data[this.state.data.length - 1]?.x]}
                        yDomain={this.updateBounds()}
                    >
                        <VerticalGridLines />
                        <HorizontalGridLines />
                        <XAxis
                            tickTotal={5}
                            tickFormat={v => moment(v).format('DD/MM/YYYY mm:hh:ss')}
                        />
                        <YAxis />
                        <LineSeries data={this.state.data} />
                        <LineSeries className='lowerPrice' data={this.state.data1} />
                        <LineSeries className='upperPrice' data={this.state.data2} />
                    </XYPlot>

                    <Box marginLeft='64px'>
                        <FormControl>
                            <FormLabel>Balance</FormLabel>
                            <Input readOnly value={this.state.balance}></Input>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Usdt tokens</FormLabel>
                            <Input readOnly value={this.state.token1}></Input>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Eth tokens</FormLabel>
                            <Input readOnly value={this.state.token2}></Input>
                        </FormControl>
                    </Box>
                </Flex>
            </CenteredLayout>
        );
    }
}
