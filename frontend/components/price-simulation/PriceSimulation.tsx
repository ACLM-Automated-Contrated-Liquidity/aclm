import Router, { useRouter } from "next/router";
import {useAccount, useConnect, useDisconnect, useSignMessage} from 'wagmi';
import {MetaMaskConnector} from '@wagmi/connectors/metaMask';
import {useAuthRequestChallengeEvm} from '@moralisweb3/next';
import {
    Flex,
    FormControl, FormLabel, Input,
    RangeSlider,
    RangeSliderFilledTrack, RangeSliderThumb,
    RangeSliderTrack,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack
} from '@chakra-ui/react';
import {useState} from 'react';
import {BalanceChart} from './BalanceChart';
import {LiquidityChart} from './LiquidityChart';

export default function PriceSimulation() {
    let router = useRouter();
    let value: number = 0;
    const { connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect();
    const { isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { requestChallengeAsync } = useAuthRequestChallengeEvm();
    const [pc, setSliderValue] = useState(1810);
    const [nHedge, setHedgeAmount] = useState(0);
    const [[p1, p2], setRangeSliderValue] = useState([1800, 2000]);
    let [nEth, setEth] = useState(0);
    let [nUsdt, setUsdt] = useState(0);
    let [il, setIL] = useState(0);

    const handleAuth = async () => {
        if (isConnected) {
            await disconnectAsync();
        }

        const { account, chain } = await connectAsync({
            connector: new MetaMaskConnector(),
        });

        const { message } = await requestChallengeAsync({
            address: account,
            chainId: chain.id,
        });

        const signature = await signMessageAsync({ message });

        console.log(signature);
    };

    const calculateImpermanentLoss = (priceLower: number, priceUpper: number, futurePrice: number) => {
        const averagePrice = Math.sqrt(priceLower * priceUpper);
        const priceRatio = futurePrice / averagePrice;
        const x = Math.log(priceRatio);
        const y = Math.log(priceUpper / priceLower);
        const impermanentLoss = 0.5 * x * x - 0.5 * y * y;
        return impermanentLoss;
    }

    const onStateChange = (price1, price2, currentPrice, hedgeTokens) => {
        setSliderValue(currentPrice);
        setRangeSliderValue([price1, price2]);
        setHedgeAmount(hedgeTokens);

        setEth(1000 * (pc - p1) / (p2 - p1));
        setUsdt(1000 * (p2 - pc) / (p2 - p1));
        setIL(calculateImpermanentLoss(p1, p2, pc));
    };

    return (
        <div>
            <h1 style={{color: "white"}}>Price simulation works</h1>
            {/*<button onClick={handleAuth}>Authenticate via Metamask</button>*/}

            <div>
                <div className='label'>Price range:</div>
                <RangeSlider
                    min={1000}
                    max={4000}
                    value={[p1, p2]}
                    onChange={(val) => onStateChange(val[0], val[1], pc, nHedge)}
                >
                    <RangeSliderTrack>
                        <RangeSliderFilledTrack />
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0} />
                    <RangeSliderThumb index={1} />
                </RangeSlider>

                <Flex>
                    <Input placehoder='Value from' value={p1} readOnly={true}/>
                    <Input placehoder='Value from' value={p2} readOnly={true}/>
                </Flex>
            </div>

            {/*<div>*/}
            {/*    <div className='label'>Current price:</div>*/}
            {/*    <Slider*/}
            {/*        min={1000}*/}
            {/*        max={4000}*/}
            {/*        value={pc}*/}
            {/*        onChange={(val) => onStateChange(p1, p2, val, nHedge)}*/}
            {/*    >*/}
            {/*        <SliderTrack>*/}
            {/*            <SliderFilledTrack />*/}
            {/*        </SliderTrack>*/}
            {/*        <SliderThumb />*/}
            {/*    </Slider>*/}

            {/*    <Input placehoder='Value from' value={pc} readOnly={true}/>*/}
            {/*</div>*/}

            {/*<div>*/}
            {/*    <div className='label'>Tokens to hedge:</div>*/}
            {/*    <Slider*/}
            {/*        min={0}*/}
            {/*        max={0.1}*/}
            {/*        step={0.01}*/}
            {/*        value={nHedge}*/}
            {/*        onChange={(val) => onStateChange(p1, p2, pc, val)}*/}
            {/*    >*/}
            {/*        <SliderTrack>*/}
            {/*            <SliderFilledTrack />*/}
            {/*        </SliderTrack>*/}
            {/*        <SliderThumb />*/}
            {/*    </Slider>*/}

            {/*    <Input placehoder='Value from' value={nHedge} readOnly={true}/>*/}
            {/*</div>*/}

            {/*<FormControl>*/}
            {/*    <FormLabel>ETH:</FormLabel>*/}
            {/*    <Input value={nEth}></Input>*/}
            {/*</FormControl>*/}

            {/*<FormControl>*/}
            {/*    <FormLabel>USDT:</FormLabel>*/}
            {/*    <Input value={nUsdt}></Input>*/}
            {/*</FormControl>*/}

            {/*<FormControl>*/}
            {/*    <FormLabel>Impermanent loss:</FormLabel>*/}
            {/*    <Input value={il}></Input>*/}
            {/*</FormControl>*/}

            {/*<BalanceChart p1={p1} p2={p2} pc={pc} nHedge={nHedge}></BalanceChart>*/}
            <LiquidityChart p1={p1} p2={p2} nHedge={nHedge} investedSum={1000}></LiquidityChart>
        </div>
    );
}
