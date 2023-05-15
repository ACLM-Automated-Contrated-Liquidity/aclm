import React, {Component} from 'react';
import {PriceEndpoints} from '../../endpoints/price.endpoints';
import {
    Hint,
    HorizontalGridLines,
    LineSeries,
    VerticalBarSeries,
    VerticalGridLines,
    XAxis,
    XYPlot,
    YAxis
} from 'react-vis';
import {Box} from '@chakra-ui/react';

export interface LiquidityChartProps {
    p1: number;
    p2: number;
    pc: number;
    nHedge: number;
    investedSum: number;
}
export interface LiquidityChartState {
    token1?: {x: number, y: number}[];
    token2?: {x: number, y: number}[];
    tooltipValue?: any;
    price: number;
}

export class LiquidityChart extends Component<LiquidityChartProps, LiquidityChartState> {
    private price: number;
    private balance: number;

    constructor(props) {
        super(props);
        this.state = {token1: [], token2: [], tooltipValue: null, price: 1800};
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({price: 1800 + 400 * (Math.random() - 0.5)});
            this.calculatePosition();
        }, 2000);
    }

    componentWillReceiveProps() {
        let data = this.calculateData();
        this.setState({
            token1: data.token1,
            token2: data.token2
        });
    }

    private calculatePosition() {
        let [token1, token2] = this.getTokensCount(this.price);
        this.balance = token1 + this.price * token2;
        let [tokenNew1, tokenNew2] = this.getTokensCount(this.price, 0.9 * this.price, 1.1 * this.price);
        this.balance = tokenNew1 + this.price * tokenNew2;

        return 0;
    }

    private getTokensCount(p: number, pa?: number, pb?: number): [number, number] {
        let {p1, p2, investedSum} = this.props;
        p1 = pa || p1;
        p2 = pb || p2;

        if (p < p1) return [0, this.getTokensCount(p1)[1]];
        if (p > p2) return [this.getTokensCount(p2)[0], 0];

        let L = investedSum / (2 * Math.sqrt(p) - Math.sqrt(p1) - p/Math.sqrt(p2));
        let tokenCount1 = L * (Math.sqrt(p) - Math.sqrt(p1));
        let tokenCount2 = L * (1/Math.sqrt(p) - 1/Math.sqrt(p2)) * p;
        return [tokenCount1, tokenCount2];
    }

    private calculateData(): LiquidityChartState {
        let data = {token1: [], token2: []};

        for(let p = 1000; p < 4000; p = p + 100) {
            let counts = this.getTokensCount(p);
            data.token1.push({x: p, y: counts[0]});
            data.token2.push({x: p, y: counts[1]});
        }
        return data;
    }

    private setTooltipValue() {
        return (datapoint: any) => {
            return this.setState({tooltipValue: datapoint});
        }
    }

    render() {
        return (
            <Box style={{position: 'relative'}}>
                <XYPlot width={400} height={300} stackBy="y">
                    <VerticalGridLines />
                    <HorizontalGridLines />
                    <XAxis tickLabelAngle={-90}/>
                    <YAxis />
                    <VerticalBarSeries data={this.state.token1} onValueMouseOver={this.setTooltipValue()}/>
                    <VerticalBarSeries data={this.state.token2} onValueMouseOver={this.setTooltipValue()}/>
                    {this.state.tooltipValue ? <Hint value={this.state.tooltipValue} /> : null}
                </XYPlot>
            </Box>
        );
    }
}
