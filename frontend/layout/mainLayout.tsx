import Navbar from "../components/navigation/navbar";
import styles from "../styles/MainLayout.module.scss";
import lendingStyles from "../pages/landing/landing.module.scss";
import {Flex} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmarkCircle } from '@fortawesome/free-regular-svg-icons';
import {PoolEndpoints} from '../endpoints/pool.endpoints';

const PAGES = {
	'Dashboard': '/app',
	'Pools': '/pools',
}

export default function MainLayout({ children }) {
	let sidePanelItems = Object.keys(PAGES).map(page => {
		return <a key={page} className={styles.link} href={PAGES[page]}>{page}</a>;
	});

	let getData = () => {
		PoolEndpoints.getEstimatedFee().subscribe(x => {
			let q = 0;
		});
	}

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
						<FontAwesomeIcon className={styles.closeIcon} icon={faXmarkCircle} />
						<Flex direction='column' justifyContent='center'>
							<h1>Dashboard</h1>
							<div>Unleash the power of concentrated liquidity</div>
							<button className={styles.button} onClick={getData}>Get started</button>
						</Flex>
						<div className={styles.image}></div>
					</div>
					{children}
				</div>
			</div>
		</div>
	);
}
