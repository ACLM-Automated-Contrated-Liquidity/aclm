import "../styles/globals.scss";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, useAccount, WagmiConfig } from "wagmi";
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
import { ChakraProvider } from '@chakra-ui/react'
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { SessionProvider } from "next-auth/react";
import MainLayout from "../layout/mainLayout";
import { useRouter } from "next/router";
import CenteredLayout from "../layout/centeredLayout";

const { chains, provider } = configureChains(
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

const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
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
		<WagmiConfig client={wagmiClient}>
			<SessionProvider session={pageProps.session} refetchInterval={0}>
				<RainbowKitProvider
					modalSize="compact"
					initialChain={process.env.NEXT_PUBLIC_DEFAULT_CHAIN}
					chains={chains}
				>
					<ChakraProvider>
						<CenteredLayout>
							<Component {...pageProps} />
						</CenteredLayout>
					</ChakraProvider>
				</RainbowKitProvider>
			</SessionProvider>
		</WagmiConfig>
	);
}

export default MyApp;
