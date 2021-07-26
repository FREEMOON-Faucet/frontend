import freeABI from "./ABI/FREE"
import freemoonABI from "./ABI/FMN"
import faucetABI from "./ABI/FAUCET"
import airdropABI from "./ABI/AIRDROP"

const config = {
  networks: {
    hardhat: {
      name: "Hardhat Local Node",
      id: 31337,
      contracts: {
        free: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
        freemoon: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
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
      contracts: {
        free: "0x2DB153F1DE733d6e5D8875d243924f277Fa4313a",
        freemoon: "0xC0C3b04afAde71b9074aCE13Ee5403F61c52e66F",
        faucet: "0xA648b9090fc146D96f80eE43879C349FE66e57b7",
        airdrop: "0x610Eaf465a12c427a6ed930d8E2ccD00A9a1981c",
        chng: "0xf7eD89b804CC22Cb188986Eeb6D5F01d522d5138",
        any: "0x8B0Cb6c96522a5e27466808D6992838044ae7192",
        fsnFuse: "0x2ac2055cea2FDc44850F7fE52EAFD18e64a77984"
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
    },
    fsnTestnetOld: {
      name: "Fusion Testnet Old",
      id: 46688,
      contracts: {
        free: "0xeFb4859410D57fF9a0f01E696A0E7e06Ebde020E",
        freemoon: "0x8916fdDd7181D36a8A0deC81b2BDc32164A47DE3",
        faucet: "0x77aE9d69A428AcdB88dbcDA41f35fD910F1D40d7",
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
    fmn: {
      symbol: "FMN",
      decimals: 18,
      icon: ""
    },
    chng: {
      symbol: "CHNG",
      decimals: 18,
      icon: ""
    },
    any: {
      symbol: "ANY",
      decimals: 18,
      icon: ""
    },
    fsnFuse: {
      symbol: "FSN/FUSE",
      decimals: 18,
      icon: ""
    }
  }
}

export default config