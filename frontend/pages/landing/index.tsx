import styles from './landing.module.scss';
import {Button, Flex, HStack} from '@chakra-ui/react';
import {useRouter} from 'next/router';
import Head from 'next/head';

export default function Landing() {
    const router = useRouter();

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Flex alignItems={'center'}>
                    <div className={styles.logo}></div>
                    <div className={styles.logoName}><span className={styles.highlight} style={{fontSize: '24px'}}>Spellbound</span> pools</div>
                </Flex>
                <HStack alignItems={'center'} spacing={5}>
                    <a href='https://aclm.gitbook.io/spellboundpools/'><b>Documentation</b></a>
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
