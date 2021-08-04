import freeABI from "./ABI/FREE"
import fmnABI from "./ABI/FMN"
import faucetABI from "./ABI/FAUCET"
import airdropABI from "./ABI/AIRDROP"

const config = {
  networks: {
    hardhat: {
      name: "Hardhat Local Node",
      id: 31337,
      provider: "http://127.0.0.1:8545",
      contracts: {
        free: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
        fmn: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
        faucet: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
        airdrop: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
        chng: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        any: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        fsnFuse: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
      }
    },
    fsnTestnet: {
      name: "Fusion Testnet",
      id: 46688,
      provider: "https://testway.freemoon.xyz/gate",
      contracts: {
        free: "0x60364ad97beb8EC63d19B021677d02D9152b5E51",
        fmn: "0x3EF3feC91F85926a25732A2bD8bE5f9A8BFC40e1",
        faucet: "0x7aBf00a759f5F377f0cF885D168803E9D326f387",
        airdrop: "0xeE59ee5f266855426E3a519c555dc9cB00aC67b0",
        chng: "0xf7eD89b804CC22Cb188986Eeb6D5F01d522d5138",
        any: "0x8B0Cb6c96522a5e27466808D6992838044ae7192",
        fsnFuse: "0x2ac2055cea2FDc44850F7fE52EAFD18e64a77984"
      }
    },
    fsnMainnet: {
      name: "Fusion Mainnet",
      id: 32659,
      provider: "https://mainway.freemoon.xyz/gate",
      contracts: {
        free: "0x6403eDe3b7604ea4883670c670BeA288618BD5F2",
        fmn: "0xB80A6C4F2a279ec91921ca30da726c534462125C",
        faucet: "0x65D484355D7b770Dd73E81a22a3199b8BA4e3c2C",
        airdrop: "",
        chng: "0xed0294dbd2a0e52a09c3f38a09f6e03de2c44fcf",
        any: "0x0c74199d22f732039e843366a236ff4f61986b32",
        fsnFuse: "0xe96ac326ecea1a09ae6e47487c5d8717f73d5a7e"
      }
    }
  },
  abi: {
    free: freeABI,
    fmn: fmnABI,
    faucet: faucetABI,
    airdrop: airdropABI,
  },
  tokens: {
    free: {
      symbol: "FREE",
      decimals: 18,
      image: "https://freemoonfaucet.xyz/icons/free.png"
    },
    fmn: {
      symbol: "FMN",
      decimals: 18,
      image: "https://freemoonfaucet.xyz/icons/fmn.png"
    },
    chng: {
      symbol: "CHNG",
      decimals: 18,
      image: "https://freemoonfaucet.xyz/icons/chng.png"
    },
    any: {
      symbol: "ANY",
      decimals: 18,
      image: "https://freemoonfaucet.xyz/icons/any.png"
    },
    fsnFuse: {
      symbol: "FSN/FUSE",
      decimals: 18,
      image: "https://freemoonfaucet.xyz/icons/fsnFuse.png"
    }
  }
}

export default config
