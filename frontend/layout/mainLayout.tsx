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
				<Navbar />

				<div className={styles.pageContent}>
					{children}
				</div>
			</div>
		</div>
	);
}
