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
        free: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        fmn: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
        faucet: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
        airdrop: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
        chng: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        any: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        pool: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
      }
    },
    fsnTestnet: {
      name: "Fusion Testnet",
      id: 46688,
      provider: "https://testway.freemoon.xyz/gate",
      contracts: {
        free: "0xfFEcFd1E82b925A2cFa8bC7e87e6293044E1b124",
        fmn: "0x028F4458F0bD1CE77f2dCC667c84dDc9AD5E3fD0",
        faucet: "0x582689070Ba607e9787832DE3F8A786a06e9E802",
        airdrop: "0xcCF47AdAE7279200A4f82ACA8D9A0334dCe07fAD",
        chng: "0x2879825978D731457064344BcbF537D222c46cae",
        any: "0x54458b6a07EbEB3a0EDDA647ecfdD5944fCFf877"
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
    },
    ftmTestnet: {
      name: "Fantom Testnet",
      id: 4002,
      provider: "https://rpc.testnet.fantom.network/",
      contracts: {
        free: "0xA8f6e1c7CdF8b457fB05C8Ef72BFE0ea408be931",
        fmn: "0x58042c5060A99E0823a1bAA78a0e6155dd9D0297",
        faucet: "0xfFEcFd1E82b925A2cFa8bC7e87e6293044E1b124",
        airdrop: "0xAa51eA74438af3A60BF2914D66fA3252514fc56f",
        chng: "0xecc9651ed70eB4c021Fc45Ee24C5811180E69569",
        any: "0xA5Dcf2149a99a994d7865e24508b61BB7DFbAce4"
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