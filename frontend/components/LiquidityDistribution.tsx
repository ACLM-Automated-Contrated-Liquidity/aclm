import React, {Component} from 'react';
import styles from '../pages/create-position/create-position.module.scss';
import {LineSeries, VerticalBarSeries, XAxis, XYPlot} from 'react-vis';
import {Series} from '../interfaces';

interface LiquidityDistributionProps {
    lowerBound: number;
    upperBound: number;
}
interface LiquidityDistributionState {
    line1?: Series;
    line2?: Series;
}

const liquidity = [
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

export class LiquidityDistribution extends Component<LiquidityDistributionProps, LiquidityDistributionState> {

    constructor(props: LiquidityDistributionProps) {
        super(props);
        this.state = {line1: [], line2: []};
    }

    componentWillReceiveProps() {
        this.setState({
            line1: [{x: this.props.lowerBound, y: 0}, {x: this.props.lowerBound + 1, y: 30}],
            line2: [{x: this.props.upperBound, y: 0}, {x: this.props.upperBound + 1, y: 30}],
        });
    }

    render() {
        return (
            <XYPlot width={280} height={160} className={styles.chart}>
                <XAxis />
                <VerticalBarSeries data={liquidity}/>
                <LineSeries data={this.state.line1}></LineSeries>
                <LineSeries data={this.state.line2}></LineSeries>
            </XYPlot>
        );
    }
}
