import freeABI from "./ABI/FREE"
import freemoonABI from "./ABI/FREEMOON"
import faucetABI from "./ABI/FAUCET"
import airdropABI from "./ABI/AIRDROP"

const config = {
  networks: {
    hardhat: {
      name: "Hardhat Local Node",
      id: 31337,
      contracts: {
        free: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        freemoon: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
        faucet: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        airdrop: ""
      }
    },
    fsnTestnet: {
      name: "Fusion Testnet",
      id: 46688,
      contracts: {
        free: "0xeFb4859410D57fF9a0f01E696A0E7e06Ebde020E",
        freemoon: "0x8916fdDd7181D36a8A0deC81b2BDc32164A47DE3",
        faucet: "0x77aE9d69A428AcdB88dbcDA41f35fD910F1D40d7",
        airdrop: ""
      }
    },
    fsnMainnet: {
      name: "Fusion Mainnet",
      id: 32659,
      contracts: {
        free: "",
        freemoon: "",
        faucet: "",
        airdrop: ""
      }
    }
  },
  abi: {
    free: freeABI,
    freemoon: freemoonABI,
    faucet: faucetABI,
    airdrop: airdropABI,
  },
  tokens: {
    free: {
      symbol: "FREE",
      decimals: 18,
      icon: ""
    },
    freemoon: {
      symbol: "FMN",
      decimals: 18,
      icon: ""
    }
  }
}

export default config