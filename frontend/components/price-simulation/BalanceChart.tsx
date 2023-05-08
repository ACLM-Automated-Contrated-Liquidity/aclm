import React, {Component} from 'react';
import {XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines, XAxis, YAxis} from 'react-vis';
import 'react-vis/dist/style.css';
import {PriceEndpoints} from '../../endpoints/price.endpoints';

export interface BalanceChartProps {
    p1: number;
    p2: number;
    pc: number;
    nHedge: number;
}
export interface BalanceChartState {
    data: {x: number, y: number}[];
}
// enum QueryPeriodEnum {
//     ONE_DAY = "1",
//     ONE_WEEK = "7",
//     ONE_MONTH = "30",
//     THREE_MONTH = "90",
//     ONE_YEAR = "90",
//     MAX = "max",
// }
// interface Token {
//     id: string;
//     name: string;
// }
// interface Price {
//     timestamp: number;
//     value: number;
// }

export class BalanceChart extends Component<BalanceChartProps, BalanceChartState> {

    constructor(props) {
        super(props);
        this.state = {data: []};
    }

    componentDidMount() {
        // PriceEndpoints.getPrice()
        //     .subscribe(() => {
        //
        // ``  });
    }

    componentWillReceiveProps() {
        this.setState({data: this.calculateData()});
    }

    private getTokensCount(sum: number): number {
        let {p1, p2, pc} = this.props;

        return sum/(2* Math.sqrt(pc) - Math.sqrt(p1) - pc/Math.sqrt(p2));
    }

    private getBalance(p: number): number {
        let {p1, p2, pc} = this.props;

        if (p < p1) return this.getBalance(p1) * p / p1;
        if (p > p2) return this.getBalance(p2);

        let nominator = 2* Math.sqrt(p * p2) - Math.sqrt(p1 * p2) - p;
        let denominator = 2* Math.sqrt(pc * p2) - Math.sqrt(p1 * p2) - pc;
        return 100 * nominator / denominator;
    }

    private calculateData(): {x: number, y: number}[] {
        let data = [];
        let {pc, nHedge} = this.props;

        for(let p = 1000; p < 4000; p = p + 5) {
            let hedge = (pc - p) * nHedge;
            data.push({x: p, y: this.getBalance(p) + hedge});
        }
        return data;
    }

    render() {
        return (
            <XYPlot width={400} height={300} yDomain={[0, 120]}>
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis tickLabelAngle={90}/>
                <YAxis />
                <LineSeries data={this.state.data} />
            </XYPlot>
        );
    }
}
