import styles from '../app/App.module.scss';
import {Flex} from '@chakra-ui/react';
import usdc from 'node_modules/cryptocurrency-icons/svg/color/usdc.svg';
import btc from 'node_modules/cryptocurrency-icons/svg/color/btc.svg';
import usdt from 'node_modules/cryptocurrency-icons/svg/color/usdt.svg';
import eth from 'node_modules/cryptocurrency-icons/svg/color/eth.svg';
import matic from 'node_modules/cryptocurrency-icons/svg/color/matic.svg';
import verse from '../../public/verse.png';
import flow from '../../public/flow.png';


export interface PairTokensIconProps {
    token1: TokenIcon;
    token2: TokenIcon;
    showLabel?: boolean;
}

export enum TokenIcon {
    USDC,
    USDT,
    ETH,
    WETH,
    MATIC,
    BTC,
    FLOW,
    VERSE,
}

export const TokenIconsMap = {
    [TokenIcon.USDC]: usdc.src,
    [TokenIcon.USDT]: usdt.src,
    [TokenIcon.ETH]: eth.src,
    [TokenIcon.WETH]: eth.src,
    [TokenIcon.BTC]: btc.src,
    [TokenIcon.MATIC]: matic.src,
    [TokenIcon.FLOW]: flow.src,
    [TokenIcon.VERSE]: verse.src,
}

export default function PairTokensIcon(props: PairTokensIconProps) {
    return (
        <Flex className={styles.logo}>
            <div className={styles.icon} style={{backgroundImage: `url(${TokenIconsMap[props.token1]})`}}></div>
            <div className={styles.icon} style={{backgroundImage: `url(${TokenIconsMap[props.token2]})`}}></div>
            {/*<div>ETH - USDC</div>*/}
        </Flex>
    );
}
