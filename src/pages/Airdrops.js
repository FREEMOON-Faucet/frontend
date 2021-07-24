import { useState, useEffect } from "react"
import styled from "styled-components"
import Web3 from "web3"
import { FaParachuteBox } from "react-icons/fa"

import { AirdropContract, FaucetContract } from "../utils/contracts"
import ERC20 from "../utils/ABI/ERC20"

const AirdropsContainer = styled.div`
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

const Table = styled.table`
  border-collapse: collapse;
  width: 60%;
  max-width: 650px;
`

const Tr = styled.tr`
  width: 100%;
  height: 40px;
  font-weight: ${props => props.title ? "900" : "300"};
`

const Td = styled.td`
  width: 50%;
  border: 1px solid black;
  font-size: 1.2rem;
  text-align: center;
`

const Display = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 550px;
  height: 40px;
  border: 2px solid #000;
  border-radius: 4px;
  font-size: 1.4rem;
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

export default function Airdrops({ connection }) {

  const FSN = "0xffffffffffffffffffffffffffffffffffffffff"
  const AIRDROP_DEFAULT = "You can only claim once per day."

  const [ eligibleTokens, setEligibleTokens ] = useState([])
  const [ claimable, setClaimable ] = useState("0")

  const [ airdropMessage, setAirdropMessage ] = useState(AIRDROP_DEFAULT)

  useEffect(() => {
    const getEligibleTokens = async () => {
      const web3 = new Web3(connection.provider)
      const airdropAbs = await AirdropContract(web3)
      const assetCount = await airdropAbs.methods.assetCount().call()
      let eligibleTokens = []
      for(let i = 0; i < assetCount; i++) {
        let addr = await airdropAbs.methods.eligibleAssets(i).call()
        let symbol
        if(addr.toLowerCase() === FSN) {
          symbol = "FSN"
        } else {
          let tokenAbs = new web3.eth.Contract(ERC20, addr)
          symbol = await tokenAbs.methods.symbol().call()
        }
        let balanceRequired = web3.utils.fromWei(await airdropAbs.methods.balRequiredFor(addr).call())
        eligibleTokens.push({
          address: addr,
          symbol: symbol,
          bal: balanceRequired
        })
      }
      setEligibleTokens(eligibleTokens)
    }
    if(connection.connected) getEligibleTokens()
  }, [ connection ])

  useEffect(() => {
    if(connection.connected) refreshClaimable()
  }, [ connection ])

  const refreshClaimable = async () => {
    const web3 = new Web3(connection.provider)
    const airdropAbs = await AirdropContract(web3)
    const claimable = web3.utils.fromWei(await airdropAbs.methods.getClaimable(connection.accounts[0]).call())
    setClaimable(claimable)
  }

  const displayTokens = () => {
    return eligibleTokens.map(token => {
      return (
        <Tr key={token.symbol}>
          <Td>
            {token.symbol}
          </Td>
          <Td>
            {token.bal}
          </Td>
        </Tr>
      )
    })
  }

  const claimAirdrop = async () => {
    const web3 = new Web3(connection.provider)
    const airdropAbs = await AirdropContract(web3)
    const faucetAbs = await FaucetContract(web3)

    const isSubscribed = await faucetAbs.methods.isSubscribed(connection.accounts[0])
    if(!isSubscribed) {
      setAirdropMessage("This address is not subscribed")
      return
    }

    const notClaimed = web3.utils.fromWei(await airdropAbs.methods.getClaimable(connection.accounts[0]).call())
    if(notClaimed === "0") {
      setAirdropMessage("No FREE airdrop to be claimed.")
      return
    }

    try {
      await airdropAbs.methods.claimAirdrop().send({from: connection.accounts[0]})
    } catch(err) {
      console.log(err.message)
    }
  }

  if(connection.connected) {
    return (
      <AirdropsContainer>
        <Title>
          Airdrop Receivers
        </Title>
        <Detail>
          Holders of these tokens will be able to claim a FREE airdrop once every day. The balances required to receive the airdrop are as follows:
        </Detail>
        <Table>
          <thead>
            <Tr title={true}>
              <Td>Token</Td>
              <Td>Balance/FREE</Td>
            </Tr>
          </thead>
          <tbody>
            {displayTokens()}
          </tbody>
        </Table>
        <Title>
          Claim Airdrop
        </Title>
        <Detail>
          Here you can claim FREE which was airdropped to you based on your token balances.
        </Detail>
        <Bar>
          <Display>
            {claimable} FREE
          </Display>
          <Fill onClick={() => claimAirdrop()}>
            <FaParachuteBox size="30"/>
          </Fill>
        </Bar>
        <Message>
          {airdropMessage}
        </Message>
      </AirdropsContainer>
    )
  } else {
    return (
      <AirdropsContainer>
        <Detail>
          You must connect your MetaMask wallet to use this app.
        </Detail>
      </AirdropsContainer>
    )
  }
}