import { useState, useEffect } from "react"
import styled from "styled-components"
import Web3 from "web3"
import config from "../utils/config"

import { FreeContract, FmnContract, FaucetContract } from "../utils/contracts"

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

  const [ balanceSupply, setBalanceSupply ] = useState({
    freeBal: "0",
    fmnBal: "0",
    freeSupply: "0",
    fmnSupply: "0"
  })
  const [ freemoonFaucet, setFreemoonFaucet ] = useState({
    subscribers: "0",
    gasFund: "0",
    fsnReserve: "0",
    totalClaims: "0"
  })
  // const [ fusionMainnet, setFusionMainnet ] = useState({
  //   dailyTx: ZERO,
  //   dailyFmn: ZERO,
  //   totalTx: ZERO,
  //   totalFmn: ZERO
  // })
  const [ latestWin, setLatestWin ] = useState({
    by: "No Winners Yet",
    blockHeight: "-",
    date: "-",
    winningHash: "-",
    claimsSincePrevious: "-",
    freeHodl: "-"
  })

  useEffect(() => {
    const getStats = async () => {
      const network = config.networks.fsnTestnet
      const web3 = new Web3(network.provider)

      const free = await FreeContract(web3)
      const fmn = await FmnContract(web3)
      const faucet = await FaucetContract(web3)

      if(connection.connected) getBalanceSupply(web3, free, fmn, connection.accounts[0])
      else getBalanceSupply(web3, free, fmn)

      getFreemoonFaucet(web3, network, faucet)
      getFusionMainnet()
      getLatestWin(web3, free, faucet)
    }

    getStats()
  }, [ connection ])

  const getBalanceSupply = async (web3, free, fmn, account) => {
    let freeBal, fmnBal
    if(account) {
      freeBal = await free.methods.balanceOf(account).call()
      fmnBal = await fmn.methods.balanceOf(account).call()
    } else {
      freeBal = "0"
      fmnBal = "0"
    }
    const freeSupply = await free.methods.circulationSupply().call()
    const fmnSupply = await fmn.methods.circulationSupply().call()
    setBalanceSupply({
      freeBal: web3.utils.fromWei(freeBal),
      fmnBal: web3.utils.fromWei(fmnBal),
      freeSupply: web3.utils.fromWei(freeSupply),
      fmnSupply: web3.utils.fromWei(fmnSupply)
    })
  }
  
  const getFreemoonFaucet = async (web3, network, faucet) => {
    const coordinator = await faucet.methods.coordinator().call()
    const faucetAddr = network.contracts.faucet
    
    const subscribers = await faucet.methods.subscribers().call()
    const gasFund = await web3.eth.getBalance(coordinator)
    const fsnReserve = await web3.eth.getBalance(faucetAddr)
    const totalClaims = await faucet.methods.claims().call()

    setFreemoonFaucet({
      subscribers: subscribers.toString(),
      gasFund: web3.utils.fromWei(gasFund),
      fsnReserve: web3.utils.fromWei(fsnReserve),
      totalClaims: totalClaims.toString()
    })
  }

  const getFusionMainnet = async () => {}

  const getLatestWin = async (web3, free, faucet) => {
    let latestBlock = await web3.eth.getBlock("latest")
    let latestBlockNumber = latestBlock.number
    let currentBlockNumber = latestBlockNumber
    let latestWinEvents
    const historicWins = await faucet.methods.winners().call()

    if(historicWins.toString() !== "0") {
      for(let i = 0; i < latestBlock; i++) {
        console.log("Loop number: ", i)
        latestWinEvents = await faucet.getPastEvents("Win", {fromBlock: currentBlockNumber, toBlock: currentBlockNumber})
        if(latestWinEvents.length) {
          break
        } else {
          currentBlockNumber--
        }
      }
      console.log(currentBlockNumber)
      console.log("Should only be here with events: ", latestWinEvents)
      let latest = latestWinEvents[0]
      const timestamp = (await web3.eth.getBlock(currentBlockNumber)).timestamp
      const winningHash = web3.utils.soliditySha3(
        latest.returnValues.lottery,
        latest.returnValues.txHash,
        latest.returnValues.blockHash
      )
      
      const freeHodl = await free.methods.balanceOf(latest.returnValues.entrant).call()
      setLatestWin({
        by: latest.returnValues.entrant,
        blockHeight: currentBlockNumber,
        date: new Date(timestamp*1000).toUTCString(),
        winningHash: winningHash,
        claimsSincePrevious: latest.returnValues.claimsTaken,
        freeHodl: web3.utils.fromWei(freeHodl)
      })
    }
  }


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
            <Number>{freemoonFaucet.subscribers}</Number>
          </Row>
          <Row>
            <Label>Gas Fund</Label>
            <Number>{freemoonFaucet.gasFund}</Number>
          </Row>
          <Row>
            <Label>FSN Reserve</Label>
            <Number>{freemoonFaucet.fsnReserve}</Number>
          </Row>
          <Row>
            <Label>Total Claims</Label>
            <Number>{freemoonFaucet.totalClaims}</Number>
          </Row>
        </Box>
      </DashColumn>
      <DashColumn>
        <Box>
          <Detail>Fusion Mainnet</Detail>
          <Row>
            <Label>Daily Tx's</Label>
            <Number>
              {/* {fusionMainnet.dailyTx.toString()} */}
              0
            </Number>
          </Row>
          <Row>
            <Label>FREEMOON</Label>
            <Number>
              {/* {fusionMainnet.dailyFmn.toString()}% */}
              0
            </Number>
          </Row>
          <Row>
            <Label>Total Tx's</Label>
            <Number>
              {/* {fusionMainnet.totalTx.toString()} */}
              0
            </Number>
          </Row>
          <Row>
            <Label>FREEMOON</Label>
            <Number>
              {/* {fusionMainnet.totalFmn.toString()}% */}
              0
            </Number>
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
}