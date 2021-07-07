import { useState, useEffect } from "react"
import styled from "styled-components"
import Web3 from "web3"

import { FreeContract, FreemoonContract, FaucetContract } from "../utils/contracts"

const DashboardContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;

  @media screen and (orientation: portrait) {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }
`

const Box = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 20%;
  max-width: 400px;
  height: 300px;
  margin-top: 20px;
  border: 2px solid #000;
  text-align: center;
  overflow-wrap: break-word;

  @media screen and (orientation: portrait) {
    width: 80%;
    max-width: 700px;
  }
`

const Number = styled.div`
  width: 100%;
  height: 50%;
  margin-top: 10%;
  text-align: center;
  font-size: 4rem;
`

const Detail = styled.p`
  display: flex;
  justify-content: center;
  width: 70%;
  height: 50px;
  max-width: 800px;
  padding-top: 20px;
  border-top: 1px solid #000;
  font-size: 1.2rem;
  text-align: center;
`


export default function Dashboard({ connection }) {

  const [ stats, setStats ] = useState({
    freeTs: 0,
    faucetSubs: 0,
    fmnTs: 0,
    fmnWinners: 0
  })

  useEffect(() => {
    const getStats = async () => {
      let loadStats = {}
      const web3 = new Web3(connection.provider)
      const free = await FreeContract(web3)
      const freemoon = await FreemoonContract(web3)
      const faucet = await FaucetContract(web3)

      loadStats.freeTs = web3.utils.fromWei(await free.methods.circulationSupply().call())
      loadStats.faucetSubs = await faucet.methods.subscribers().call()
      loadStats.fmnTs = web3.utils.fromWei(await freemoon.methods.circulationSupply().call())
      loadStats.fmnWinners = await faucet.methods.winners().call()

      setStats(loadStats)
    }
    if(connection.connected) getStats()
  }, [ connection ])

  return (
    <DashboardContainer>
      <Box>
        <Number>{stats.freeTs}</Number>
        <Detail>FREE Total Supply</Detail>
      </Box>
      <Box>
        <Number>{stats.faucetSubs}</Number>
        <Detail>FREEMOON Faucet Subscribers</Detail>          
      </Box>
      <Box>
        <Number>{stats.fmnTs}</Number>
        <Detail>FMN Total Supply</Detail>          
      </Box>
      <Box>
        <Number>{stats.fmnWinners}</Number>
        <Detail>FMN Winners</Detail>          
      </Box>
    </DashboardContainer>
  )
}