import styles from './landing2.module.scss';
import {Button, Flex, HStack} from '@chakra-ui/react';
import {GiFizzingFlask} from 'react-icons/gi';
import {useRouter} from 'next/router';

export default function Landing2() {
    const router = useRouter();

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Flex alignItems={'center'}>
                    <GiFizzingFlask size={'50px'} color={'#aa0578'}></GiFizzingFlask>
                    <div className={styles.logoName}>xConcentrat</div>
                </Flex>
                <HStack alignItems={'center'} spacing={5}>
                    <b>Documentation</b>
                    <Button className={styles.launchBtn} onClick={() => router.push('/app')}>Launch App</Button>
                </HStack>
            </div>
            <Flex className={styles.part1}>
                <Flex className={styles.title} flex={1}>
                    <h1>Unleash ultimate possibilities of <span className={styles.highlight}>Concentrated Liquidity</span></h1>
                    <Button
                        alignSelf='start'
                        className={styles.launchBtn}
                        onClick={() => router.push('/app')}
                    >
                        Launch App
                    </Button>
                </Flex>
                <Flex flex={1} alignItems='center' justifyContent='center'>
                    <div className={styles.image}></div>
                </Flex>
            </Flex>

            <Flex className={styles.part2}>
                <Flex className={styles.title} flex={1}>
                    <h1 >Unleash ultimate possibilities of <span className={styles.highlight}>Concentrated Liquidity</span></h1>
                </Flex>
                <Flex flex={1}>
                </Flex>
            </Flex>
        </div>
    );
}
