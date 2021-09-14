import { useState, useEffect } from "react"
import styled from "styled-components"
import BigNumber from "bignumber.js"
import Web3 from "web3"
import { AirdropContract, FaucetContract } from "../utils/contracts"
import { MdAdd, MdRemove } from "react-icons/md"
import SubmitValue from "./SubmitValue"

const FarmContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 10px;
`

const Connected = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
  font-size: 1.2rem;
  font-style: italic;
`

const FarmList = styled.ul`
  list-style-type: none;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  margin: 0;
  padding: 0;
`

const Banner = styled.div`
  display: flex;
  width: 100%;
  height: 30px;
  margin-bottom: 5px;
`

const BannerTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20%;
  font-size: 0.8rem;
  font-style: italic;
`

const Farmable = styled.li`
  display: flex;
  width: 100%;
  height: 100px;
  border-radius: 5px;
  background: #fff;
`

const Symbol = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20%;
  height: 100%;
  font-size: 1.4rem;
`

const Info = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 20%;
  height: 100%;
  font-size: 1.2rem;
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 98%;
  height: 48%;
`

const AddSub = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 49.5%;
  height: 98%;
  background: ${ props => props.active ? "#92b4e3" : "#ddd" };
  border-radius: 2px;
  cursor: ${ props => props.active ? "pointer" : "default" };
`

const Harvest = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 98%;
  background: ${ props => props.active ? "#92b4e3" : "#ddd" };
  border-radius: 2px;
  font-size: 1rem;
  font-weight: bold;
  cursor: ${ props => props.active ? "pointer" : "default" };
`


export default function Farm({ connection, list, setList }) {

  const ONE_DAY = new BigNumber("86400")
  const ZERO = new BigNumber("0")

  const [ buttons, setButtons ] = useState({
    harvest: false,
    sub: false
  })
  const [ displaySubmit, setDisplaySubmit ] = useState(false)
  const [ submission, setSubmission ] = useState({
    add: true,
    max: ZERO
  })

  useEffect(() => {
    const loadFarms = async () => {
      const web3 = new Web3(connection.provider)
      const airdrop = await AirdropContract(web3)
      const account = connection.accounts[0]
      const farmAssetCount = await airdrop.methods.farmingAssetCount().call()
      let pending = []
      for(let i = 0; i < farmAssetCount; i++) {
        pending.push(airdrop.methods.farmingAssets(i).call())
      }
      const farmAddresses = await Promise.all(pending)
      let symbolsPending = [], balancesPending = [], earningsPending = [], ratesPending = []
      for(let i = 0; i < farmAssetCount; i++) {
        symbolsPending.push(airdrop.methods.assetSymbol(farmAddresses[i]).call())
        balancesPending.push(airdrop.methods.farmBalance(account, farmAddresses[i]).call())
        earningsPending.push(airdrop.methods.getFarmRewards(account, farmAddresses[i]).call())
        ratesPending.push(airdrop.methods.farmRewardPerSec(farmAddresses[i]).call())
      }
      let symbols = await Promise.all(symbolsPending)
      let balances = await Promise.all(balancesPending)
      let earnings = await Promise.all(earningsPending)
      let rates = await Promise.all(ratesPending)
      let farms = farmAddresses.map((addr, index) => {
        return {
          addr,
          symbol: symbols[index],
          bal: web3.utils.fromWei(balances[index]),
          earned: web3.utils.fromWei(earnings[index]),
          rate: web3.utils.fromWei(rates[index])
        }
      })
      let buttonsActive = []
      for(let i = 0; i < farms.length; i++) {
        buttonsActive.push({
          harvest: Number(farms[i].earned) > 0,
          sub: Number(farms[i].bal) > 0
        })
      }
      setButtons(buttonsActive)
      setList(farms)
    }

    if(connection.connected) loadFarms()
  }, [ connection, setList ])

  useEffect(() => {
  }, [ list ])
  
  if(connection.connected) {
    return (
      <FarmContainer>
        <FarmList>
          <Banner>
            <BannerTitle>
              Farm
            </BannerTitle>
            <BannerTitle>
              Daily Rewards
            </BannerTitle>
            <BannerTitle>
              Your Position
            </BannerTitle>
            <BannerTitle>
              Earned
            </BannerTitle>
          </Banner>
          { list.map((farm, index) => (
            <Farmable key={ farm.addr }>
              <Symbol>
                { farm.symbol }
              </Symbol>
              <Info>
                { (ONE_DAY.multipliedBy(farm.rate)).toString() } FREE
              </Info>
              <Info>
                { farm.bal }
              </Info>
              <Info>
                { farm.earned }
              </Info>
              <Info>
                <InfoRow>
                  <Harvest active={ buttons[index].harvest }>
                    Harvest
                  </Harvest>
                </InfoRow>
                <InfoRow>
                  <AddSub active={ true } onClick={() => {
                    setSubmission({
                      add: true,
                      max: 10
                    })
                    setDisplaySubmit(true)
                  }}>
                    <MdAdd size={ 25 }/>
                  </AddSub>
                  <AddSub active={ buttons[index].sub }>
                    <MdRemove size={ 25 }/>
                  </AddSub>
                </InfoRow>
              </Info>
            </Farmable>
          )) }
        </FarmList>

        {
          displaySubmit
            ? <SubmitValue onClose={ () => setDisplaySubmit(false) } info={ submission }/>
            : ""
        }

      </FarmContainer>
    )
  } else {
    return (
      <Connected>
        Connect Wallet
      </Connected>
    )
  }
}