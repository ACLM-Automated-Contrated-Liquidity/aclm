import React, {Component} from 'react';
import styles from '../pages/create-position/create-position.module.scss';
import {LineSeries, XAxis, XYPlot, YAxis} from 'react-vis';
import {PriceEndpoints} from '../endpoints/price.endpoints';
import {Series} from '../interfaces';
import moment from "moment";
import {minBy, maxBy} from 'lodash-es';

interface PriceChartProps {
    lowerBound: number;
    upperBound: number;
    token?: string;
}
interface PriceChartState {
    token?: string;
    data?: Series;
    line1?: Series;
    line2?: Series;
    xDomain?: [number, number];
    curPriceLine?: Series;
}

export class PriceChart extends Component<PriceChartProps, PriceChartState> {

    constructor(props) {
        super(props);
        this.state = {data: [], line1: [], line2: [], curPriceLine: []};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.token !== this.state.token) {
            this.setState({token: nextProps.token});

            PriceEndpoints.getPrice(nextProps.token).subscribe(price => {
                let curPrice = price[price.length - 1]?.y;
                this.setState({
                    xDomain: [minBy(price, 'x').x, maxBy(price, 'x').x],
                    data: price.map((v, i) => ({x: v.x, y: v.y})),
                    curPriceLine: [{x: 0, y: curPrice}, {x: Date.now(), y: curPrice}],
                });
            });
        }

        this.setState({
           line1: [{x: 0, y: this.props.lowerBound}, {x: Date.now(), y: this.props.lowerBound}],
           line2: [{x: 0, y: this.props.upperBound}, {x: Date.now(), y: this.props.upperBound}],
        });
    }

    render () {
        return (
            <XYPlot
                width={840}
                height={480}
                margin={{left: 100}}
                xTime='time'
                xDomain={this.state.xDomain}
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
                <LineSeries data={this.state.curPriceLine} color="red" strokeStyle="dashed"></LineSeries>
            </XYPlot>
        );
    }
}
