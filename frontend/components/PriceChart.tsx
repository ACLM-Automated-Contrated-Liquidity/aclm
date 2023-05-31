import React, {Component, useEffect, useState} from 'react';
import styles from '../pages/create-position/create-position.module.scss';
import {LineSeries, VerticalBarSeries, XAxis, XYPlot, YAxis} from 'react-vis';
import {PriceEndpoints} from '../endpoints/price.endpoints';
import {Series} from '../interfaces';
import * as moment from 'moment';

interface PriceChartProps {
    lowerBound: number;
    upperBound: number;
}
interface PriceChartState {
    data?: Series;
    line1?: Series;
    line2?: Series;
}

export class PriceChart extends Component<PriceChartProps, PriceChartState> {

    constructor(props) {
        super(props);
        this.state = {data: [], line1: [], line2: []};
    }

    componentDidMount() {
        PriceEndpoints.getPrice().subscribe(price => {
            this.setState({data: price.map((v, i) => ({x: i, y: v.y}))});
        });
    }

    componentWillReceiveProps() {
        this.setState({
           line1: [{x: 0, y: this.props.lowerBound}, {x: 10000, y: this.props.lowerBound}],
           line2: [{x: 0, y: this.props.upperBound}, {x: 10000, y: this.props.upperBound}],
        });
    }

    render () {
        return (
            <XYPlot
                width={840}
                height={250}
                xTime='time'
                xDomain={[0, 2000]}
                className={styles.chart}
            >
                <XAxis
                    tickTotal={5}
                    tickFormat={v => moment(v).format('DD/MM/YYYY')}
                />
                <YAxis/>
                <LineSeries data={this.state.data}/>
                <LineSeries data={this.state.line1} color="#453899"></LineSeries>
                <LineSeries data={this.state.line2} color="#453899"></LineSeries>
            </XYPlot>
        );
    }
}
