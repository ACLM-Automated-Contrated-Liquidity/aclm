import {from, Observable, timestamp} from 'rxjs';
import {map} from 'rxjs/operators';
import {getPriceChart} from '../../backend/scripts/uniswap/coingecko';

const ETH_ADDRESS = '0x2170ed0880ac9a755fd29b2688956bd959f933f8';

export interface Price {
    timestamp: number;
    value: number;
}

export class PriceEndpoints {
    static getPrice(): Observable<Price[]> {
        return from(getPriceChart(ETH_ADDRESS))
            .pipe(map(data => data.prices));
    }
}
