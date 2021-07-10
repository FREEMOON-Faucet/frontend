import { useState, useEffect } from "react"
import styled from "styled-components"
import { IoWallet, IoDice, IoTime } from "react-icons/io5"
import Web3 from "web3"

import { FaucetContract } from "../utils/contracts"

const FreemoonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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


export default function Freemoon({ connection }) {

  const SUB_DEFAULT = "Connect wallet or input address to subscribe."
  const CLAIM_DEFAULT = "Input address to claim for."
  const BUY_DEFAULT = "Enter amount of FSN to timelock."
  const LOADING = "Please wait ..."
  const SUCCESS = "Success!"

  const [ accounts, setAccounts ] = useState("")

  const [ subAccount, setSubAccount ] = useState("")
  const [ claimAccount, setClaimAccount ] = useState("")
  const [ buyAmount, setBuyAmount ] = useState("")

  const [ subMessage, setSubMessage ] = useState(SUB_DEFAULT)
  const [ claimMessage, setClaimMessage ] = useState(CLAIM_DEFAULT)
  const [ buyMessage, setBuyMessage ] = useState(BUY_DEFAULT)

  useEffect(() => {
    if(connection.connected) {
      setAccounts(connection.accounts)
      setSubAccount(connection.accounts[0])
    }
  }, [ connection ])

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
    const isSubscribed = await checkForSubscribe(subAccount, faucetAbs)
    if(isSubscribed) {
      setSubMessage("This address is already subscribed.")
      return
    }

    try {
      setSubMessage(LOADING)
      await faucetAbs.methods.subscribe(subAccount).send({value: web3.utils.toWei("1", "ether"), from: accounts[0]})
      setSubMessage(SUCCESS)
    } catch(err) {
      console.log(err.message)
      setSubMessage(SUB_DEFAULT)
    }
  }

  const claim = async () => {
    const web3 = new Web3(connection.provider)
    const faucetAbs = await FaucetContract(web3)
    const isSubscribed = await checkForSubscribe(subAccount, faucetAbs)
    if(!isSubscribed) {
      setClaimMessage("This address is not subscribed.")
      return
    }
    const nextEntry = await checkCooldownTime(subAccount, faucetAbs)
    if(nextEntry > Date.now()/1000) {
      setClaimMessage(`This address has claimed in the last hour. Next claim available at: ${new Date(nextEntry*1000).toUTCString()}`)
      return
    }

    try {
      setClaimMessage(LOADING)
      await faucetAbs.methods.claim(claimAccount).send({from: accounts[0]})
      setClaimMessage(SUCCESS)
    } catch(err) {
      console.log(err)
      setClaimMessage(CLAIM_DEFAULT)
    }
  }

  const buyFree = async () => {
    const web3 = new Web3(connection.provider)
    const faucetAbs = await FaucetContract(web3)
    const isSubscribed = await checkForSubscribe(subAccount, faucetAbs)
    if(!isSubscribed) {
      setBuyMessage("This address is not subscribed.")
      return
    }

    try {
      setBuyMessage(LOADING)
      await faucetAbs.methods.timelockToFree().send({value: web3.utils.toWei(String(buyAmount), "ether"), from: accounts[0]})
      setBuyMessage(SUCCESS)
    } catch(err) {
      console.log(err)
      setBuyMessage(BUY_DEFAULT)
    }
  }

  if(connection.connected) {
    return (
      <FreemoonContainer>
        <Title>
          Subscribe
        </Title>
        <Detail>
          Here you can subscribe addresses to the FREEMOON Faucet. Subscribing an address allows it to enter the FREEMOON lottery once every hour.
        </Detail>
        <Bar>
          <Input placeholder="Address to subscribe ..." defaultValue={accounts[0]} spellCheck={false} onChange={e => setSubAccount(e.target.value)}/>
          <Fill onClick={() => subscribe()}>
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
          The lottery category entered is determined by the address' FREE balance.
        </Detail>
        <Bar>
          <Input placeholder="Address to claim for ..." spellCheck={false} onChange={e => setClaimAccount(e.target.value)}/>
          <Fill onClick={() => claim()}>
            <IoDice size="40"/>
          </Fill>
        </Bar>
        <Message>
          {claimMessage}
        </Message>
        <Title>
          Buy FREE
        </Title>
        <Detail>
          You can buy FREE with timelock FSN. The current rate is:<br/>
          1 4-month TL FSN == 50 FREE.
        </Detail>
        <Bar>
          <Input placeholder="Amount of FSN to timelock ..." spellCheck={false} onChange={e => setBuyAmount(e.target.value)}/>
          <Fill onClick={() => buyFree()}>
            <IoTime size="40"/>
          </Fill>
        </Bar>
        <Message>
          {buyMessage}
        </Message>
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