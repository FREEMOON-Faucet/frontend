import config from "./config"

const networkObj = async web3 => {
  const id = await web3.eth.net.getId()

  if(id === 31337) {
    // hardhat local node
    return config.networks.hardhat
  }

  else if(id === 46688) {
    // fusion testnetwork
    return config.networks.fsnTestnet
  }

  else if(id === 32659) {
    // fusion mainnetwork
    return config.networks.fsnMainnet
  }

  else if(id === 4002) {
    // fantom testnetwork
    return config.networks.ftmTestnet
  }

  else {
    return ""
  }
}


const FaucetContract = async web3 => {
  let faucetContract
  const network = (await networkObj(web3)).contracts

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
  const network = (await networkObj(web3)).contracts

  if(network) {
    freeContract = new web3.eth.Contract(
      config.abi.free,
      network.free
    )
  }

  return freeContract
}

const FmnContract = async web3 => {
  let fmnContract
  const network = (await networkObj(web3)).contracts

  if(network) {
    fmnContract = new web3.eth.Contract(
      config.abi.fmn,
      network.fmn
    )
  }

  return fmnContract
}

const AirdropContract = async web3 => {
  let airdropContract
  const network = (await networkObj(web3)).contracts

  if(network) {
    airdropContract = new web3.eth.Contract(
      config.abi.airdrop,
      network.airdrop
    )
  }

  return airdropContract
}

const FmnAddress = async web3 => {
  let fmnAddress
  const network = (await networkObj(web3)).contracts

  if(network) {
    fmnAddress = network.fmn
  }

  return fmnAddress
}

export {
  FaucetContract,
  FreeContract,
  FmnContract,
  AirdropContract,
  FmnAddress,
  networkObj
}