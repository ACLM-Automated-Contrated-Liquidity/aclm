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
import {ChakraProvider} from '@chakra-ui/react'
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";

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
						<Head>
							<link rel="shortcut icon" href="../public/favicon.ico"/>
						</Head>
						<Component {...pageProps} />
					</ChakraProvider>
				</RainbowKitProvider>
			</SessionProvider>
		</WagmiConfig>
	);
}

export default MyApp;
