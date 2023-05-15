import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from './Navbar.module.scss';
import {Flex, Text} from '@chakra-ui/react';

export default function Navbar() {
	return (
		<nav className={styles.navbar}>
			<Flex alignItems='center'>
				<Flex className={styles.navItems} flex={1} alignItems='center'>
					<Text><a href='/'>Pools</a></Text>
					<Text><a href='/dashboard'>Dashboard</a></Text>
				</Flex>

				<ConnectButton className={styles.connectButton}></ConnectButton>
			</Flex>
		</nav>
	);
}
