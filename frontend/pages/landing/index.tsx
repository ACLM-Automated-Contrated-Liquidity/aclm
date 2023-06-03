import styles from "./landing.module.scss";
import {Flex} from '@chakra-ui/react';
import MainLayout from '../../layout/mainLayout';

export default function Landing() {
    return (
        <MainLayout>
            <Flex className={styles.background} direction='column'>
                <div className={styles.header}>
                    <div className={styles.logo}>LiquidiFy</div>
                    <Flex className={styles.headerItems} alignItems="center">
                        <div>Docs</div>
                        <div>Whitepaper</div>
                        <a href={'/app'} className={styles.launch}>Launch App</a>
                    </Flex>
                </div>

                <Flex className={styles.content} direction='column' flex='1'>
                    <div className={styles.textBlock}>
                        <h1>New era</h1>
                        <h2>of concentrated liquidity</h2>
                        <section>
                            Introducing revolutionary Concentrated Liquidity Management Tool
                            Whether you're looking to improve your working capital management,
                            reduce your borrowing costs, or simply gain more visibility into your financial position,
                            our Concentrated Liquidity Management Tool is the solution you've been searching for.
                            Try it out today and start experiencing the benefits for yourself!
                        </section>


                        <a href={'/app'} className={`${styles.launch} ${styles.white} padding-top`}>Launch App</a>
                    </div>
                </Flex>
            </Flex>
        </MainLayout>
    );
}
