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
        free: "0x82c95Ff9B7800400F24410E15AB4c946866b4c55",
        fmn: "0x065A0553cCcF8Fbe16e8FC7dE37a28cAC91e55A5",
        faucet: "0xE3A7Be0fF70F467Aca4474fE010F0d7B3dA78958",
        airdrop: "0x0AfE93e4EAcEeAF6E8F6d5A25Ca978Ca06289715",
        chng: "0x14a36F0Fd547c6859FE1E5252C15A60ba5E6dC63",
        any: "0x77CdE21573C1c2c88B5485091cf6C69A7F227F8E"
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
    },
    bscTestnet: {
      name: "BSC Testnet",
      id: 97,
      provider: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      contracts: {
        free: "0x6aCf2F855A7D9E718acC220d3C33A8bDE8aB246b",
        fmn: "0x760cdA149FfB7B3358b2e1E7ce9E77dd8a2D3466",
        faucet: "0x404CCAA0b36023ac56642e0Df63007756c415aFC",
        airdrop: "0xA1531AF726BF5768ed503220a55895C01Dad1563",
        chng: "0x947a798F07C94ee0011000a8A39742B2B13FfD70",
        any: "0x136e85D232B722a0408802abaB6c45c7aAFb7501"
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