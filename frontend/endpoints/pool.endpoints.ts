import {Observable} from 'rxjs';
import {RestAction, RestController} from './annotations';
import {BaseEndpoints} from './base.endpoints';

@RestController('pools')
export class PoolEndpoints {

    @RestAction('estimatePositionFee')
    static getEstimatedFee(): Observable<number> {
        let uri = BaseEndpoints.getUri(this, (<any>this).currentAction);

        return BaseEndpoints.post(this, JSON.stringify({
            'token0': '0x55d398326f99059ff775485246999027b3197955',
            'token1': '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
            'priceLower': 302.087,
            'priceUpper': 311.909,
            'deposit': 320,
        }));
    }
}
