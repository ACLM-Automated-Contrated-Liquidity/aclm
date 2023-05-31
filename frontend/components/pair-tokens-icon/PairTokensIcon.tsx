import styles from '../app/App.module.scss';
import {Flex} from '@chakra-ui/react';
import usdc from 'node_modules/cryptocurrency-icons/svg/color/usdc.svg';
import usdt from 'node_modules/cryptocurrency-icons/svg/color/usdt.svg';
import eth from 'node_modules/cryptocurrency-icons/svg/color/eth.svg';
import matic from 'node_modules/cryptocurrency-icons/svg/color/matic.svg';

export interface PairTokensIconProps {
    token1: Token;
    token2: Token;
    showLabel?: boolean;
}

export enum Token {
    USDC,
    USDT,
    ETH,
    MATIC,
}

export const TokenIconsMap = {
    [Token.USDC]: usdc.src,
    [Token.USDT]: usdt.src,
    [Token.ETH]: eth.src,
    [Token.MATIC]: matic.src,
}

export default function PairTokensIcon(props: PairTokensIconProps) {
    return (
        <Flex className={styles.logo}>
            <div className={styles.icon} style={{backgroundImage: `url(${TokenIconsMap[props.token1]})`}}></div>
            <div className={styles.icon} style={{backgroundImage: `url(${TokenIconsMap[props.token2]}})`}}></div>
            {/*<div>ETH - USDC</div>*/}
        </Flex>
    );
}
