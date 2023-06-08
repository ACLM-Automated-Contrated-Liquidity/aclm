import styles from './landing.module.scss';
import {Box, Button, Flex, HStack} from '@chakra-ui/react';
import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';

export default function Landing() {
    const router = useRouter();
    const [bubbles, setBubbles] = useState([]);
    let time = 0;

    useEffect(() => {
        let b = [...Array(100)].map(x => {
            return {
                x: 0,
                y: 0,
                size: 20,
                opacity: 1,
                phi: 10* Math.random(),
            }
        })
        setBubbles(b);
        // setInterval(() => {
        //     b = b.map(bubble => {
        //         return {
        //             x: Math.sin(time + bubble.phi),
        //             y: -time * 0.01,
        //             size: 20,
        //             opacity: 1,
        //             phi: Math.random(),
        //         };
        //     });
        //     setBubbles(b);
        //     time++;
        // }, 100);
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Flex alignItems={'center'}>
                    <div className={styles.logo}></div>
                    <div className={styles.logoName}><span className={styles.highlight} style={{fontSize: '24px'}}>Spellbound</span> pools</div>
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

                {/*<Box width='100%' height='300px' position='relative'>*/}
                {/*    {bubbles.map((bubble, i) => {*/}
                {/*        return (*/}
                {/*            <div className={styles.bubble} style={{top: bubble.y, left: bubble.x}}></div>*/}
                {/*        );*/}
                {/*    })}*/}
                {/*</Box>*/}

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
