import Navbar from "../components/navigation/navbar";
import styles from "../styles/MainLayout.module.scss";
import lendingStyles from "../pages/landing/landing.module.scss";
import {Flex} from '@chakra-ui/react';

const PAGES = {
	'Dashboard': '/app',
	'Pools': '/pools',
}

export default function MainLayout({ children }) {
	let sidePanelItems = Object.keys(PAGES).map(page => {
		return <a className={styles.link} href={PAGES[page]}>{page}</a>;
	});

	return (
		<div className={styles.page}>
			<div className={styles.sidepanel}>
				<div className={lendingStyles.logo}></div>
				{sidePanelItems}
			</div>
			<div className={styles.body}>
				<Flex className={styles.header} alignItems='center'>
					<Flex direction='column'>
						<b>Hi Kirill</b>
						<h1>Welcome back &#128075;</h1>
					</Flex>

					<Flex>
						<input placeholder='Search'></input>
						<div className={styles.icon}></div>
					</Flex>
				</Flex>

				<div className={styles.pageContent}>
					<div className={styles.banner}>
						<Flex direction='column' justifyContent='center'>
							<h1>Dashboard</h1>
							<div>Unleash the power of concentrated liquidity</div>
							<button className={styles.button}>Get started</button>
						</Flex>
						<div className={styles.image}></div>
					</div>
					{children}
				</div>
			</div>
		</div>
	);
}
