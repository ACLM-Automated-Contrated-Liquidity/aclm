import {CONTRACT_ABI, MATIC, USDC} from '../interfaces/contract';
import {BrowserProvider, Contract as EthersContract, parseEther, parseUnits} from 'ethers';
import {Utils} from './utils.service';

const CONTRACT_ADDRESS = '0x796304266bc2C7884384Af20f894A5Ab434BaE6b';

export class Contract {
    static invest() {
        let investFn = async () => {
            let provider = new BrowserProvider((window as any).ethereum);
            if (!provider) return;

            let signer = await provider.getSigner();
            let contract = new EthersContract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            let [tick1, tick2] = await Utils.computeTicks(null, null, 3000);

            // Create the transaction
            const receipt = await contract.invest(
                MATIC.address, USDC.address, 500,
                parseEther("0.1"),
                parseUnits("1", 6),
                tick1, tick2,
                {
                    value: parseEther("0.01"),
                    gasLimit: 20000000,
                });

            const tx = await receipt.wait();
        }

        investFn()
            .catch(console.error);
    }
}
