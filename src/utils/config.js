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
        free: "0x984e4B2bE971747a1A545CFe58f564F224148dC5",
        fmn: "0x96be0fd6c2f434bdb0E1a61148Fe4bbA5cc19987",
        faucet: "0x8F72b524431B359cA491981cB9fa8edA2d8483bf",
        airdrop: "0xC8ad811eC9576F072d57d158c2E1a8661e9cB110",
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
        faucet: "0x1B1459D4B9eD19050ECb1E9959e0d94c0FBE0603",
        airdrop: "0x72EACa2D38C234344DcE423575B9f681FF28107f"
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
