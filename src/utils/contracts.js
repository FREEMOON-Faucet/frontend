import config from "./config"

const networkObj = async web3 => {
  const id = await web3.eth.net.getId()

  if(id === 31337) {
    // hardhat local node
    return config.networks.hardhat.contracts
  }

  else if(id === 46688) {
    // fusion testnetwork
    return config.networks.fsnTestnet.contracts
  }

  else if(id === 32659) {
    // fusion mainnetwork
    return config.networks.fsnMainnet.contracts
  }

  else {
    return ""
  }
}


const FaucetContract = async web3 => {
  let faucetContract
  const network = await networkObj(web3)

  if(network) {
    faucetContract = new web3.eth.Contract(
      config.abi.faucet,
      network.faucet
    )
  }

  return faucetContract
}

const FreeContract = async web3 => {
  let freeContract
  const network = await networkObj(web3)

  if(network) {
    freeContract = new web3.eth.Contract(
      config.abi.free,
      network.free
    )
  }

  return freeContract
}

const FreemoonContract = async web3 => {
  let freemoonContract
  const network = await networkObj(web3)

  if(network) {
    freemoonContract = new web3.eth.Contract(
      config.abi.freemoon,
      network.freemoon
    )
  }

  return freemoonContract
}

// const AirdropContract = async web3 => {
//   let airdropContract
//   const network = await networkObj(web3)

//   if(network) {
//     airdropContract = new web3.eth.Contract(
//       config.abi.airdrop,
//       network.airdrop
//     )
//   }

//   return airdropContract
// }


export {
  FaucetContract,
  FreeContract,
  FreemoonContract,
  // AirdropContract
}