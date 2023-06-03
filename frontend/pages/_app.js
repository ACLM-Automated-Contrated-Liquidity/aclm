import "../styles/globals.scss";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, useAccount, WagmiConfig } from "wagmi";
import {
	mainnet,
	polygon,
	optimism,
	arbitrum,
	goerli,
	polygonMumbai,
	optimismGoerli,
	arbitrumGoerli,
	polygonZkEvm,
	polygonZkEvmTestnet,
} from "wagmi/chains";
import {ChakraProvider, extendTheme} from '@chakra-ui/react'
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { useLocation } from 'react-router-dom'
import CenteredLayout from "../layout/centeredLayout";

const { chains, publicClient, webSocketPublicClient } = configureChains(
	[
		mainnet,
		goerli,
		polygon,
		polygonMumbai,
		optimism,
		optimismGoerli,
		arbitrum,
		arbitrumGoerli,
		polygonZkEvm,
		polygonZkEvmTestnet
	],
	[alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }), publicProvider()]
);

const { connectors } = getDefaultWallets({
	appName: "My Alchemy DApp",
	chains,
});

const wagmiConfig = createConfig({
	autoConnect: true,
	connectors,
	publicClient,
	webSocketPublicClient,
});

export { WagmiConfig, RainbowKitProvider };

function MyApp({ Component, pageProps }) {
	const router = useRouter();
	const account = useAccount({
		onConnect({ address, connector, isReconnected }) {
			if (!isReconnected) router.reload();
		},
	});
	return (
		<WagmiConfig config={wagmiConfig}>
			<SessionProvider session={pageProps.session} refetchInterval={0}>
				<RainbowKitProvider
					modalSize="compact"
					chains={chains}
				>
					<ChakraProvider>
						<Component {...pageProps} />
					</ChakraProvider>
				</RainbowKitProvider>
			</SessionProvider>
		</WagmiConfig>
	);
}

export default MyApp;
