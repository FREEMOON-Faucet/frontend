import { useState, useEffect } from "react"
import styled from "styled-components"
import { IoWallet, IoDice, IoTime } from "react-icons/io5"
import Web3 from "web3"

import { FaucetContract, networkObj } from "../utils/contracts"
import metamask from "../icons/metamaskcoins.svg"

const FreemoonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const MetaMask = styled.img`
  width: 100%;
  max-width: 180px;
`

const Options = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 40%;
  height: 230px;
  margin: 10px 0;
`

const ExtrasRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
`

const Extras = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  max-width: 250px;
  height: 40px;
  margin-right: 10px;
  margin-left: 10px;
  margin-top: ${props => props.spaceAbove ? "10px" : "0"};
  margin-bottom: ${props => props.spaceAbove ? "25px" : "0"};
  border: 1px solid #000;
  border-radius: 4px;
  font-size: 1.2rem;
  font-style: italic;
  cursor: ${props => props.checkbox ? "default" : "pointer"};
`

const Selection = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 80%;
  max-width: 400px;
  height: 40px;
  font-size: 1.2rem;
  cursor: default;
`

const Title = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 25px;
  margin-top: 20px;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
`

const Detail = styled.p`
  display: flex;
  justify-content: center;
  width: 70%;
  max-width: 800px;
  margin: 10px 0;
  padding-top: 20px;
  border-top: 1px solid #000;
  font-size: 1.2rem;
  text-align: center;
`

const Bar = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 60%;
  max-width: 650px;
  height: 40px;
  margin-top: 20px;

  @media screen and (orientation: portrait) {
    flex-direction: column;
    width: 70%;
    height: 100px;
  }
`

const Input = styled.input`
  text-align: center;
  width: 100%;
  max-width: 550px;
  height: 40px;
  margin: 0;
  padding: 0;
  border: 2px solid black;
  border-radius: 4px;
  font-family: Courier New;
  font-size: 1.2rem;
  letter-spacing: 1px;

  @media screen and (orientation: portrait) {
    max-width: 650px;
  }
`

const Fill = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 40px;
  margin: 0;
  border: 2px solid black;
  border-radius: 4px;
  cursor: pointer;

  @media screen and (orientation: portrait) {
    width: 100%;
    max-width: 650px;
    margin-top: 2px;
  }
`

const Message = styled.div`
  width: 80%;
  font-size: 1rem;
  font-style: italic;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 40px; 
`

const SubMessage = styled.div`
  width: 80%;
  font-size: 1rem;
  font-style: italic;
  text-align: center;
  margin-top: 5px;
`

const AdminGov = styled.div`
  display: ${props => props.show ? "flex" : "none"};
  flex-direction: column;
  align-items: center;
  width: 100%;
  border: 2px solid #92b4e3;
`

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-right: 20px;
`


export default function Freemoon({ connection }) {

  const SUB_DEFAULT = "Connect wallet or input address to subscribe."
  const CLAIM_DEFAULT = "Input address to claim for."
  const MINT_DEFAULT = "Enter amount of FSN to timelock."
  const WITHDRAW_DEFAULT = "Enter amount of FSN to withdraw from available funds."
  const LOADING = "Please wait ..."
  const SUCCESS = "Success!"

  const FREE = {
    symbol: "FREE",
    decimals: 18,
    image: "https://freemoon.xyz/icons/free.png"
  }
  const FMN = {
    symbol: "FMN",
    decimals: 18,
    image: "https://freemoon.xyz/icons/fmn.png"
  }
  const CHNG = {
    symbol: "CHNG",
    decimals: 18,
    image: "https://freemoon.xyz/icons/chng.png"
  }
  const ANY = {
    symbol: "ANY",
    decimals: 18,
    image: "https://freemoon.xyz/icons/any.png"
  }
  const FSNFUSE = {
    symbol: "FSN/FUSE",
    decimals: 18,
    image: "https://freemoon.xyz/icons/fsnFuse.png"
  }

  const [ accounts, setAccounts ] = useState("")
  const [ withdrawal, setWithdrawal ] = useState({
    recipient: "",
    amount: 0
  })

  const [ subAccount, setSubAccount ] = useState("")
  const [ claimAccount, setClaimAccount ] = useState("")
  const [ buyAmount, setBuyAmount ] = useState("")

  const [ subMessage, setSubMessage ] = useState(SUB_DEFAULT)
  const [ claimMessage, setClaimMessage ] = useState(CLAIM_DEFAULT)
  const [ mintMessage, setMintMessage ] = useState(MINT_DEFAULT)
  const [ withdrawMessage, setWithdrawMessage ] = useState(WITHDRAW_DEFAULT)

  const [ isAdmin, setIsAdmin ] = useState(false)
  const [ isGov, setIsGov ] = useState(false)

  const [ pauseStatus, setPauseStatus ] = useState({
    subscribe: false,
    claim: false,
    timelockToFree: false
  })
  const [ paramStatus, setParamStatus ] = useState({
    admin: "",
    coordinator: "",
    subscriptionCost: 0,
    cooldownTime: 0,
    payoutThreshold: 0,
    payoutAmount: 0,
    hotWalletLimit: 0
  })

  useEffect(() => {
    const checkForAdminOrGov = async () => {
      const web3 = new Web3(connection.provider)
      const faucetAbs = await FaucetContract(web3)

      const bal = await checkFaucetBal(web3)

      const currentAdmin = (await faucetAbs.methods.admin().call()).toLowerCase()
      const currentGov = (await faucetAbs.methods.governance().call()).toLowerCase()
      const adminPresent = connection.accounts[0] === currentAdmin
      const govPresent = connection.accounts[0] === currentGov

      if(adminPresent) await refreshPaused(faucetAbs)
      if(govPresent) await refreshParams(web3, faucetAbs, bal)

      setIsAdmin(adminPresent)
      setIsGov(govPresent)
    }
    if(connection.connected) {
      setAccounts(connection.accounts)
      setSubAccount(connection.accounts[0])
      checkForAdminOrGov()
    }
  }, [ connection ])

  const refreshPaused = async faucetAbs => {
    let newPauseStatus = {}
    newPauseStatus.subscribe = await faucetAbs.methods.isPaused("subscribe").call()
    newPauseStatus.claim = await faucetAbs.methods.isPaused("claim").call()
    newPauseStatus.timelockToFree = await faucetAbs.methods.isPaused("timelockToFree").call()

    setPauseStatus(newPauseStatus)
  }

  const setPause = async () => {
    const web3 = new Web3(connection.provider)
    const faucetAbs = await FaucetContract(web3)
    let toPause = []
    let toUnpause = []

    for(let key in pauseStatus) {
      if(pauseStatus[key] && key === "subscribe") toPause.push("subscribe")
      else if(pauseStatus[key] && key === "claim") toPause.push("claim")
      else if(pauseStatus[key] && key === "timelockToFree") toPause.push("timelockToFree")
    }

    for(let key in pauseStatus) {
      if(!pauseStatus[key] && key === "subscribe") toUnpause.push("subscribe")
      else if(!pauseStatus[key] && key === "claim") toUnpause.push("claim")
      else if(!pauseStatus[key] && key === "timelockToFree") toUnpause.push("timelockToFree")
    }

    try {
      await faucetAbs.methods.setPause(true, toPause).send({from: accounts[0]})
    } catch(err) {
      console.log(err.message)
    }

    try {
      await faucetAbs.methods.setPause(false, toUnpause).send({from: accounts[0]})
    } catch(err) {
      console.log(err.message)
    }

    await refreshPaused(faucetAbs)
  }

  const refreshParams = async (web3, faucetAbs, bal) => {
    let newParamStatus = {}
    newParamStatus.admin = (await faucetAbs.methods.admin().call()).toLowerCase()
    newParamStatus.coordinator = (await faucetAbs.methods.coordinator().call()).toLowerCase()
    newParamStatus.subscriptionCost = Number(web3.utils.fromWei(await faucetAbs.methods.subscriptionCost().call()))
    newParamStatus.cooldownTime = Number(await faucetAbs.methods.cooldownTime().call())
    newParamStatus.payoutThreshold = Number(await faucetAbs.methods.payoutThreshold().call())
    newParamStatus.payoutAmount = Number(web3.utils.fromWei(await faucetAbs.methods.payoutAmount().call()))
    newParamStatus.hotWalletLimit = Number(web3.utils.fromWei(await faucetAbs.methods.hotWalletLimit().call()))

    setWithdrawal(prevState => ({...prevState, amount: bal}))
    setParamStatus(newParamStatus)
  }

  const setParams = async () => {
    const web3 = new Web3(connection.provider)
    const faucetAbs = await FaucetContract(web3)

    const {
      admin,
      coordinator,
      subscriptionCost,
      cooldownTime,
      payoutThreshold,
      payoutAmount,
      hotWalletLimit
    } = paramStatus

    try {
      await faucetAbs.methods.updateParams(
        admin,
        coordinator,
        web3.utils.toWei(String(subscriptionCost), "ether"),
        String(cooldownTime),
        String(payoutThreshold),
        web3.utils.toWei(String(payoutAmount), "ether"),
        web3.utils.toWei(String(hotWalletLimit), "ether")
      ).send({from: connection.accounts[0]})
    } catch(err) {
      console.log(err.message)
    }

    await refreshParams(web3, faucetAbs)
  }

  const withdraw = async () => {
    const web3 = new Web3(connection.provider)
    const faucetAbs = await FaucetContract(web3)
    const bal = await checkFaucetBal(web3)

    if(withdrawal.amount > bal) {
      setWithdrawMessage(`Amount exceeds balance. ${bal} FSN available.`)
      return
    }

    if(withdrawal.amount === "0") {
      setWithdrawMessage("Cannot withdraw zero.")
      return
    }

    try {
      await faucetAbs.methods.withdrawFunds(withdrawal.recipient, web3.utils.toWei(String(withdrawal.amount), "ether")).send({from: connection.accounts[0]})
      await refreshParams(web3, faucetAbs)
      setWithdrawMessage(SUCCESS)
    } catch(err) {
      console.log(err.message)
    }
  }

  const checkFaucetBal = async web3 => {
    const network = await networkObj(web3)
    const faucetContractBalance = web3.utils.fromWei(await web3.eth.getBalance(network.contracts.faucet))
    return faucetContractBalance
  }

  const checkForSubscribe = async (acc, faucetAbs) => {
    const isSubscribed = await faucetAbs.methods.isSubscribed(acc).call()
    return Boolean(isSubscribed)
  }

  const checkCooldownTime = async (acc, faucetAbs) => {
    const cooldownTime = Number(await faucetAbs.methods.cooldownTime().call())
    const lastEntry = Number(await faucetAbs.methods.previousEntry(acc).call())
    return Number(lastEntry + cooldownTime)
  }

  const subscribe = async () => {
    const web3 = new Web3(connection.provider)
    const faucetAbs = await FaucetContract(web3)
    const isPaused = await faucetAbs.methods.isPaused("subscribe").call()
    if(isPaused) {
      setSubMessage("Subscribing is currently paused.")
      return
    }
    const isSubscribed = await checkForSubscribe(subAccount, faucetAbs)
    if(isSubscribed) {
      setSubMessage("This address is already subscribed.")
      return
    }
    const cost = await faucetAbs.methods.subscriptionCost().call()

    try {
      setSubMessage(LOADING)
      await faucetAbs.methods.subscribe(subAccount).send({value: cost, from: accounts[0]})
      setSubMessage(SUCCESS)
    } catch(err) {
      console.log(err.message)
      setSubMessage(SUB_DEFAULT)
    }
  }

  const claim = async () => {
    const web3 = new Web3(connection.provider)
    const faucetAbs = await FaucetContract(web3)
    const claimPaused = await faucetAbs.methods.isPaused("claim").call()
    if(claimPaused) {
      setClaimMessage("Claiming is currently paused.")
      return
    }
    const isSubscribed = await checkForSubscribe(claimAccount, faucetAbs)
    if(!isSubscribed) {
      setClaimMessage("This address is not subscribed.")
      return
    }
    const nextEntry = await checkCooldownTime(claimAccount, faucetAbs)
    if(nextEntry > Date.now()/1000) {
      setClaimMessage(`This address has claimed in the last hour. Next claim available at: ${new Date(nextEntry*1000).toUTCString()}`)
      return
    }

    try {
      setClaimMessage(LOADING)
      await faucetAbs.methods.claim(claimAccount).send({from: accounts[0]})
      setClaimMessage(SUCCESS)
    } catch(err) {
      console.log(err.message)
      setClaimMessage(CLAIM_DEFAULT)
    }
  }

  const mintFree = async () => {
    const web3 = new Web3(connection.provider)
    const faucetAbs = await FaucetContract(web3)
    const isPaused = await faucetAbs.methods.isPaused("timelockToFree").call()
    if(isPaused) {
      setMintMessage("Minting FREE is currently paused.")
      return
    }
    const isSubscribed = await checkForSubscribe(accounts[0], faucetAbs)
    if(!isSubscribed) {
      setMintMessage("This address is not subscribed.")
      return
    }

    try {
      setMintMessage(LOADING)
      await faucetAbs.methods.timelockToFree().send({value: web3.utils.toWei(String(buyAmount), "ether"), from: accounts[0]})
      setMintMessage(SUCCESS)
    } catch(err) {
      console.log(err.message)
      setMintMessage(MINT_DEFAULT)
    }
  }

  const addTokens = async () => {
    const web3 = new Web3(connection.provider)
    const network = await networkObj(web3)

    try {
      await connection.provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: network.contracts.free,
            symbol: FREE.symbol,
            decimals: FREE.decimals,
            image: FREE.image,
          },
        },
      })
    } catch(err) {
      console.log(err.message)
    }
    
    try {
      await connection.provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: network.contracts.freemoon,
            symbol: FMN.symbol,
            decimals: FMN.decimals,
            image: FMN.image,
          },
        },
      })
    } catch(err) {
      console.log(err.message)
    }
    
    try {
      await connection.provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: network.contracts.chng,
            symbol: CHNG.symbol,
            decimals: CHNG.decimals,
            image: CHNG.image,
          },
        },
      })
    } catch(err) {
      console.log(err.message)
    }
    
    try {
      await connection.provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: network.contracts.any,
            symbol: ANY.symbol,
            decimals: ANY.decimals,
            image: ANY.image,
          },
        },
      })
    } catch(err) {
      console.log(err.message)
    }
    
    try {
      await connection.provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: network.contracts.fsnFuse,
            symbol: FSNFUSE.symbol,
            decimals: FSNFUSE.decimals,
            image: FSNFUSE.image,
          },
        },
      })
    } catch(err) {
      console.log(err.message)
    }
  }

  const addNetworks = async () => {
    try {
      await connection.provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0xb660",
          chainName: "Fusion Testnet",
          nativeCurrency: {
            name: "Fusion",
            symbol: "FSN",
            decimals: 18
          },
          rpcUrls: [ "https://testway.freemoon.xyz/gate" ]
        }]
      })
    } catch(err) {
      console.log(err.message)
    }
  }

  if(connection.connected) {
    return (
      <FreemoonContainer>
        <ExtrasRow>
          <Extras onClick={() => addTokens()}>
            <MetaMask src={metamask}/>
          </Extras>
          <Extras onClick={() => addNetworks()}>
            Connect to Fusion
          </Extras>
        </ExtrasRow>
        <Title>
          Subscribe
        </Title>
        <Detail>
          Here you can subscribe addresses to the FREEMOON Faucet. Subscribing an address allows it to enter the FREEMOON lottery once every hour.
        </Detail>
        <Bar>
          <Input placeholder="Address to subscribe ..." defaultValue={accounts[0]} spellCheck={false} onChange={e => setSubAccount(e.target.value)}/>
          <Fill onClick={() => subAccount ? subscribe() : ""}>
            <IoWallet size="40"/>
          </Fill>
        </Bar>
        <Message>
          {subMessage}
        </Message>
        <Title>
          Claim FREE
        </Title>
        <Detail>
          Here you can claim FREE for a subscribed address.  Claiming is allowed once per hour. Doing so will enter it into the FREEMOON lottery.
          The lottery category entered is determined by the address" FREE balance.
        </Detail>
        <Bar>
          <Input placeholder="Address to claim for ..." spellCheck={false} onChange={e => setClaimAccount(e.target.value)}/>
          <Fill onClick={() => claimAccount ? claim() : ""}>
            <IoDice size="40"/>
          </Fill>
        </Bar>
        <Message>
          {claimMessage}
        </Message>
        <Title>
          Mint FREE
        </Title>
        <Detail>
          You can mint FREE with timelock FSN. The current rate is:<br/>
          1 4-month TL FSN == 50 FREE.
        </Detail>
        <Bar>
          <Input placeholder="Amount of FSN to timelock ..." spellCheck={false} onChange={e => setBuyAmount(e.target.value)}/>
          <Fill onClick={() => buyAmount ? mintFree() : ""}>
            <IoTime size="40"/>
          </Fill>
        </Bar>
        <Message>
          {mintMessage}
        </Message>
        <AdminGov show={isAdmin}>
          <Title>
            Pause / Unpause
          </Title>
          <Detail>
            Pause or unpause specific contract functionality. Only accessible to admin address.
          </Detail>
          <Options>
            <Selection>
              <Checkbox type="checkbox" checked={pauseStatus.subscribe} onChange={e => setPauseStatus(prevState => ({...prevState, subscribe: e.target.checked}))}/>
              Subscribe
            </Selection>
            <Selection>
              <Checkbox type="checkbox" checked={pauseStatus.claim} onChange={e => setPauseStatus(prevState => ({...prevState, claim: e.target.checked}))}/>
              Claim
            </Selection>
            <Selection>
              <Checkbox type="checkbox" checked={pauseStatus.timelockToFree} onChange={e => setPauseStatus(prevState => ({...prevState, timelockToFree: e.target.checked}))}/>
              Mint
            </Selection>
            <Extras onClick={() => setPause()}>
              Update
            </Extras>
          </Options>
        </AdminGov>
        <AdminGov show={isGov}>
          <Title>
            Update Faucet Settings
          </Title>
          <Detail>
            Update settings which determine how the faucet operates. Only accessible to governance address.
          </Detail>
          <Bar>
            <Input value={paramStatus.admin} placeholder="New Admin Address ..." spellCheck={false} onChange={e => setParamStatus(prevState => ({...prevState, admin: e.target.value}))}/>
          </Bar>
          <SubMessage>Admin</SubMessage>
          <Bar>
            <Input value={paramStatus.coordinator} placeholder="New Coordinator Address ..." spellCheck={false} onChange={e => setParamStatus(prevState => ({...prevState, coordinator: e.target.value}))}/>
          </Bar>
          <SubMessage>Coordinator</SubMessage>
          <Bar>
            <Input value={paramStatus.subscriptionCost} placeholder="New Subscription Cost ..." spellCheck={false} onChange={e => setParamStatus(prevState => ({...prevState, subscriptionCost: e.target.value}))}/>
          </Bar>
          <SubMessage>Subscription Cost (FSN)</SubMessage>
          <Bar>
            <Input value={paramStatus.cooldownTime} placeholder="New Cooldown Time ..." spellCheck={false} onChange={e => setParamStatus(prevState => ({...prevState, cooldownTime: e.target.value}))}/>
          </Bar>
          <SubMessage>Cooldown Time (sec)</SubMessage>
          <Bar>
            <Input value={paramStatus.payoutThreshold} placeholder="New Payout Threshold ..." spellCheck={false} onChange={e => setParamStatus(prevState => ({...prevState, payoutThreshold: e.target.value}))}/>
          </Bar>
          <SubMessage>Payout Threshold</SubMessage>
          <Bar>
            <Input value={paramStatus.payoutAmount} placeholder="New Payout Amount ..." spellCheck={false} onChange={e => setParamStatus(prevState => ({...prevState, payoutAmount: e.target.value}))}/>
          </Bar>
          <SubMessage>Payout Amount (FREE)</SubMessage>
          <Bar>
            <Input value={paramStatus.hotWalletLimit} placeholder="New Hot Wallet Limit ..." spellCheck={false} onChange={e => setParamStatus(prevState => ({...prevState, hotWalletLimit: e.target.value}))}/>
          </Bar>
          <SubMessage>Hot Wallet Limit (FSN)</SubMessage>
          <Extras spaceAbove={true} onClick={() => setParams()}>
            Update
          </Extras>
          <Title>
            Withdraw Funds
          </Title>
          <Detail>
            Withdraw Subscription Fees to an external wallet.
          </Detail>
          <Bar>
            <Input placeholder="Recipient ..." spellCheck={false} onChange={e => setWithdrawal(prevState => ({...prevState, recipient: e.target.value}))}/>
          </Bar>
          <Bar>
            <Input value={withdrawal.amount} placeholder="Amount ..." spellCheck={false} onChange={e => setWithdrawal(prevState => ({...prevState, amount: e.target.value}))}/>
          </Bar>
          <SubMessage>
            {withdrawMessage}
          </SubMessage>
          <Extras spaceAbove={true} onClick={() => withdraw()}>
            Withdraw
          </Extras>
        </AdminGov>
      </FreemoonContainer>
    )
  } else {
    return (
      <FreemoonContainer>
        <Detail>
          You must connect your MetaMask wallet to use this app.
        </Detail>
      </FreemoonContainer>
    )
  }
}
