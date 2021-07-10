import { useState, useEffect } from "react"
import styled from "styled-components"
import Web3 from "web3"
import BigNumber from "bignumber.js"

import { FreeContract, FreemoonContract, FaucetContract, networkObj } from "../utils/contracts"

const DashboardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  @media screen and (orientation: portrait) {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }
`

const Title = styled.p`
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

const DashColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 40%;

  @media screen and (orientation: portrait) {
    width: 90%;
  }
`

const Box = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 95%;
  max-width: 1000px;
  height: 300px;
  margin-bottom: 20px;
  padding-bottom: 5px;
  border: 2px solid #000;
  text-align: center;
  overflow-wrap: break-word;

  @media screen and (orientation: portrait) {
    max-width: 700px;
  }
`

const Row = styled.div`
  display: flex;
  width: 98%;
  height: 12%;
  margin: 10px 1%;
`

const Label = styled.div`
  width: 50%;
  height: 100%;
  font-size: 1rem;
  font-weight: bold;
  text-align: left;
`

const Number = styled.div`
  width: 50%;
  height: 100%;
  font-size: 1rem;
  text-align: left;
`

const Detail = styled.p`
  display: flex;
  justify-content: center;
  width: 90%;
  height: 27px;
  margin: 10px 0;
  max-width: 800px;
  border-bottom: 1px solid #000;
  font-size: 1.4rem;
  text-align: center;
`


export default function Dashboard({ connection }) {

  const ZERO = new BigNumber("0")

  const [ balanceSupply, setBalanceSupply ] = useState({
    freeBal: ZERO,
    fmnBal: ZERO,
    freeSupply: ZERO,
    fmnSupply: ZERO
  })
  const [ freemoonFaucet, setFreemoonFaucet ] = useState({
    subscribers: ZERO,
    gasFund: ZERO,
    fsnReserve: ZERO,
    totalClaims: ZERO
  })
  const [ fusionMainnet, setFusionMainnet ] = useState({
    dailyTx: ZERO,
    dailyFmn: ZERO,
    totalTx: ZERO,
    totalFmn: ZERO
  })
  const [ latestWin, setLatestWin ] = useState({
    by: "",
    blockHeight: ZERO,
    date: "",
    winningHash: "",
    claimsSincePrevious: ZERO,
    freeHodl: ZERO
  })

  useEffect(() => {
    const getStats = async () => {
      const web3 = new Web3(connection.provider)
      const network = await networkObj(web3)

      const free = await FreeContract(web3)
      const freemoon = await FreemoonContract(web3)
      const faucet = await FaucetContract(web3)

      getBalanceSupply(web3, connection.accounts[0], free, freemoon)
      getFreemoonFaucet(web3, network, free, freemoon, faucet)
      getFusionMainnet()
      getLatestWin(web3, free, faucet)
    }

    if(connection.connected) getStats()
  }, [ connection ])

  const getBalanceSupply = async (web3, account, free, freemoon) => {
    const freeBal = web3.utils.fromWei(await free.methods.balanceOf(account).call())
    const fmnBal = web3.utils.fromWei(await freemoon.methods.balanceOf(account).call())
    const freeSupply = web3.utils.fromWei(await free.methods.circulationSupply().call())
    const fmnSupply = web3.utils.fromWei(await freemoon.methods.circulationSupply().call())
    setBalanceSupply({
      freeBal,
      fmnBal,
      freeSupply,
      fmnSupply
    })
  }
  
  const getFreemoonFaucet = async (web3, network, free, freemoon, faucet) => {
    const subscribers = await faucet.methods.subscribers().call()
    const gasFund = web3.utils.fromWei(await web3.eth.getBalance(await faucet.methods.coordinator().call()))
    const fsnReserve = web3.utils.fromWei(await web3.eth.getBalance(network.contracts.faucet))
    const totalClaims = await faucet.methods.claims().call()
    setFreemoonFaucet({
      subscribers,
      gasFund,
      fsnReserve,
      totalClaims
    })
  }

  const getFusionMainnet = async () => {}

  const getLatestWin = async (web3, free, faucet) => {
    let latestBlock = (await web3.eth.getBlock()).number
    let currentBlock = latestBlock
    let latestWinEvents
    const historicWins = await faucet.methods.winners().call()
    if(historicWins !== "0") {
      for(let i = 0; i < latestBlock; i++) {
        console.log("Loop number: ", i)
        latestWinEvents = await faucet.getPastEvents("Win", {fromBlock: currentBlock, toBlock: currentBlock})
        if(latestWinEvents.length) {
          break
        } else {
          currentBlock--
        }
      }
      console.log(currentBlock)
      console.log("Should only be here with events: ", latestWinEvents)
      let latest = latestWinEvents[0]
      const timestamp = (await web3.eth.getBlock(currentBlock)).timestamp
      const winningHash = web3.utils.soliditySha3(
        latest.returnValues.lottery,
        latest.returnValues.txHash,
        latest.returnValues.blockHash
      )
      const freeHodl = web3.utils.fromWei(await free.methods.balanceOf(latest.returnValues.entrant).call())
      setLatestWin({
        by: latest.returnValues.entrant,
        blockHeight: currentBlock,
        date: new Date(timestamp*1000).toUTCString(),
        winningHash: winningHash,
        claimsSincePrevious: latest.returnValues.claimsTaken,
        freeHodl: freeHodl
      })
    } else {
      setLatestWin({
        by: "No Winners Yet",
        blockHeight: "-",
        date: "-",
        winningHash: "-",
        claimsSincePrevious: "-",
        freeHodl: "-"
      })
    }
  }


  if(connection.connected) {
    return (
      <DashboardContainer>
        <DashColumn>
          <Box>
            <Detail>Your Balance</Detail>
            <Row>
              <Label>FREE balance</Label>
              <Number>{balanceSupply.freeBal.toString()}</Number>
            </Row>
            <Row>
              <Label>FMN balance</Label>
              <Number>{balanceSupply.fmnBal.toString()}</Number>
            </Row>
            <Detail>Active Supply</Detail>
            <Row>
              <Label>FREE Supply</Label>
              <Number>{balanceSupply.freeSupply.toString()}</Number>
            </Row>
            <Row>
              <Label>FMN Supply</Label>
              <Number>{balanceSupply.fmnSupply.toString()}</Number>
            </Row>
          </Box>
          <Box>
            <Detail>FREEMOON Faucet</Detail>
            <Row>
              <Label>Subscribers</Label>
              <Number>{freemoonFaucet.subscribers.toString()}</Number>
            </Row>
            <Row>
              <Label>Gas Fund</Label>
              <Number>{freemoonFaucet.gasFund.toString()}</Number>
            </Row>
            <Row>
              <Label>FSN Reserve</Label>
              <Number>{freemoonFaucet.fsnReserve.toString()}</Number>
            </Row>
            <Row>
              <Label>Total Claims</Label>
              <Number>{freemoonFaucet.totalClaims.toString()}</Number>
            </Row>
          </Box>
        </DashColumn>
        <DashColumn>
          <Box>
            <Detail>Fusion Mainnet</Detail>
            <Row>
              <Label>Daily Tx's</Label>
              <Number>{fusionMainnet.dailyTx.toString()}</Number>
            </Row>
            <Row>
              <Label>FREEMOON</Label>
              <Number>{fusionMainnet.dailyFmn.toString()}%</Number>
            </Row>
            <Row>
              <Label>Total Tx's</Label>
              <Number>{fusionMainnet.totalTx.toString()}</Number>
            </Row>
            <Row>
              <Label>FREEMOON</Label>
              <Number>{fusionMainnet.totalFmn.toString()}%</Number>
            </Row>
          </Box>
          <Box>
            <Detail>Latest FMN Won</Detail>
            <Row>
              <Label>By</Label>
              <Number>{latestWin.by}</Number>
            </Row>
            <Row>
              <Label>Block Height</Label>
              <Number>{latestWin.blockHeight.toString()}</Number>
            </Row>
            <Row>
              <Label>Date</Label>
              <Number>{latestWin.date}</Number>
            </Row>
            <Row>
              <Label>Winning Hash</Label>
              <Number>{latestWin.winningHash}</Number>
            </Row>
            <Row>
              <Label>Claims to Win</Label>
              <Number>{latestWin.claimsSincePrevious.toString()}</Number>
            </Row>
            <Row>
              <Label>FREE in HODL</Label>
              <Number>{latestWin.freeHodl.toString()}</Number>
            </Row>
          </Box>
        </DashColumn>
      </DashboardContainer>
    )
    } else {
      return (
        <DashboardContainer>
          <Title>
            You must connect your MetaMask wallet to use this app.
          </Title>
        </DashboardContainer>
      )
    }
}