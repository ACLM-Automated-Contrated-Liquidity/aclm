import {from, Observable, of, timestamp} from 'rxjs';
import {map} from 'rxjs/operators';
import tokenAddressMapping from "../../backend/src/common/tokenAddressMapping.json"
import {Network} from '../interfaces/contract';

const ETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const ETHEREUM = 'ethereum';
const POLIGON = 'polygon';

export interface Price {
    timestamp: number;
    value: number;
}

enum QueryPeriodEnum {
    ONE_DAY = "1",
    ONE_WEEK = "7",
    ONE_MONTH = "30",
    THREE_MONTH = "90",
    ONE_YEAR = "90",
    MAX = "max",
}

export const TokenAddressMap = {
    'MATIC': 'matic-network',
    'ETH': 'weth',
    'VERSE': 'verse-bitcoin',
}

export class PriceEndpoints {
    static getPrice(
        tokenName: string,
        queryPeriod: QueryPeriodEnum = QueryPeriodEnum.THREE_MONTH
    ): any {
        if (!tokenName) {
            return of([]);
        }

        return from(PriceEndpoints.getPriceChart(tokenName, queryPeriod))
            .pipe(map(data => data.prices.map(item => {
                return {x: item[0], y: item[1]};
            })));
    }

    static async getPriceChart(
        tokenName?: string,
        queryPeriod: QueryPeriodEnum = QueryPeriodEnum.THREE_MONTH,
    ): Promise<any | null> {
        let tokenId = TokenAddressMap[tokenName];

        let response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=${queryPeriod}`,
            {
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.json();
    }
}
