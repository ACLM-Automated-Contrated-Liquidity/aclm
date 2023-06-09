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
							<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
							<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
							<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
							<link rel="manifest" href="/site.webmanifest"/>
							<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
							<meta name="msapplication-TileColor" content="#da532c"/>
							<meta name="theme-color" content="#ffffff"/>
						</Head>
						<Component {...pageProps} />
					</ChakraProvider>
				</RainbowKitProvider>
			</SessionProvider>
		</WagmiConfig>
	);
}

export default MyApp;
