import { useState, useEffect } from "react"
import styled from "styled-components"
import BigNumber from "bignumber.js"
import Web3 from "web3"
import { AirdropContract, FaucetContract } from "../utils/contracts"
import { MdAdd, MdRemove } from "react-icons/md"
import SubmitValue from "./SubmitValue"
import ERC20 from "../utils/ABI/ERC20"

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
  width: 16.67%;
  font-size: 0.8rem;
  font-style: italic;
`

const Farmable = styled.li`
  display: flex;
  width: 100%;
  height: 100px;
  margin-top: 10px;
  border-radius: 5px;
  background: #fff;
`

const Symbol = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 13.67%;
  height: 100%;
  padding: 0 1.5%;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
`

const Info = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 16.67%;
  height: 100%;
  font-size: 1.2rem;
  word-break: break-all;
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
  const TWO = new BigNumber("2")
  const MAX = TWO.exponentiatedBy("256").minus("1")

  const [ buttons, setButtons ] = useState([])
  const [ displaySubmit, setDisplaySubmit ] = useState(false)
  const [ submission, setSubmission ] = useState({
    action: "Stake",
    max: "0",
    info: null,
    confirm: null
  })

  useEffect(() => {
    let refreshing

    const connect = async () => {
      const web3 = new Web3(connection.provider)
      const airdrop = await AirdropContract(web3)
      const account = connection.accounts[0]
      return { web3, airdrop, account }
    }

    const loadFarms = async ({ web3, airdrop, account }) => {
      console.log(`Refresh farming ...`)
      const farmAssetCount = await airdrop.methods.farmingAssetCount().call()
      let pending = []
      for(let i = 0; i < farmAssetCount; i++) {
        pending.push(airdrop.methods.farmingAssets(i).call())
      }
      const farmAddresses = await Promise.all(pending)
      let symbolsPending = [], ratesPending = [], balancesPending = [], farmBalancesPending = [], earningsPending = []
      for(let i = 0; i < farmAssetCount; i++) {
        let currentToken = new web3.eth.Contract(ERC20, farmAddresses[i])
        symbolsPending.push(airdrop.methods.assetSymbol(farmAddresses[i]).call())
        ratesPending.push(airdrop.methods.farmRewardPerSec(farmAddresses[i]).call())
        balancesPending.push(currentToken.methods.balanceOf(account).call())
        farmBalancesPending.push(airdrop.methods.farmBalance(account, farmAddresses[i]).call())
        earningsPending.push(airdrop.methods.getFarmRewards(account, farmAddresses[i]).call())
      }
      let symbols = await Promise.all(symbolsPending)
      let rates = await Promise.all(ratesPending)
      let balances = await Promise.all(balancesPending)
      let farmBalances = await Promise.all(farmBalancesPending)
      let earnings = await Promise.all(earningsPending)
      let farms = farmAddresses.map((addr, index) => {
        return {
          addr,
          symbol: symbols[index],
          rate: web3.utils.fromWei(rates[index]),
          bal: web3.utils.fromWei(balances[index]),
          farmBal: web3.utils.fromWei(farmBalances[index]),
          earned: web3.utils.fromWei(earnings[index])
        }
      })
      let buttonsActive = []
      for(let i = 0; i < farms.length; i++) {
        buttonsActive.push({
          harvest: Number(farms[i].earned) > 0,
          add: Number(farms[i].bal) > 0,
          sub: Number(farms[i].farmBal) > 0
        })
      }
      setButtons(buttonsActive)
      setList(farms)
    }

    const startLoading = async () => {
      const { web3, airdrop, account } = await connect()
      loadFarms({ web3, airdrop, account })
      refreshing = setInterval(() => loadFarms({ web3, airdrop, account }), 10000)
    }

    if(connection.connected && (connection.chainId ===  "0xb660" || connection.chainId === "0x7f93")) startLoading()

    return () => clearInterval(refreshing)
  }, [ connection, setList ])

  const stake = async (val, extra, index) => {
    let buttonsList = buttons
    buttonsList[index] = { add: false, sub: false, harvest: false }
    setButtons(prevState => [ ...prevState, buttonsList ])
    const web3 = new Web3(connection.provider)
    const airdrop = await AirdropContract(web3)
    const account = connection.accounts[0]
    const token = new web3.eth.Contract(ERC20, extra.addr)

    const allowance = new BigNumber(web3.utils.fromWei(await token.methods.allowance(account, airdrop._address).call()))

    if(allowance.isLessThan(val)) {
      try {
        await token.methods.approve(airdrop._address, MAX).send({ from: account })
      } catch(err) {
        console.log(`Error approving: ${ err.message }`)
        return
      }
    }

    try {
      await airdrop.methods.stake(extra.addr, web3.utils.toWei(val, "ether")).send({ from: account })
    } catch(err) {
      console.log(`Error staking: ${ err.message }`)
    }
  }

  const unstake = async (val, extra, index) => {
    let buttonsList = buttons
    buttonsList[index] = { add: false, sub: false, harvest: false }
    setButtons(prevState => [ ...prevState, buttonsList ])
    const web3 = new Web3(connection.provider)
    const airdrop = await AirdropContract(web3)
    const account = connection.accounts[0]
    let buttonsReset = buttons
    buttonsReset[index] = { harvest: false, add: false, sub: false }
    setButtons(buttonsReset)

    try {
      await airdrop.methods.unstake(extra.addr, web3.utils.toWei(val, "ether")).send({ from: account })
    } catch(err) {
      console.log(`Error unstaking: ${ err.message }`)
    }
  }

  const harvest = async (farm, index) => {
    let buttonsList = buttons
    buttonsList[index] = { add: false, sub: false, harvest: false }
    setButtons(prevState => [ ...prevState, buttonsList ])
    const web3 = new Web3(connection.provider)
    const airdrop = await AirdropContract(web3)
    const account = connection.accounts[0]
    
    try {
      await airdrop.methods.harvest(farm.addr).send({ from: account })
    } catch(err) {
      console.log(`Error harvesting: ${ err.message }`)
    }
  }
  
  if(connection.connected && (connection.chainId ===  "0xb660" || connection.chainId === "0x7f93")) {
    return (
      <FarmContainer>
        <FarmList>
          <Banner>
            <BannerTitle>
              Farm
            </BannerTitle>
            <BannerTitle>
              Daily FREE / Token
            </BannerTitle>
            <BannerTitle>
              Your Balance
            </BannerTitle>
            <BannerTitle>
              Your Farm
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
                { (ONE_DAY.multipliedBy(farm.rate)).toFixed() }
              </Info>
              <Info>
                {/* { Number(farm.bal).toFixed(4) } */}
                10923847102938741928374.091328741983470
              </Info>
              <Info>
                { farm.farmBal }
              </Info>
              <Info>
                { farm.earned }
              </Info>
              <Info>
                <InfoRow>
                  <Harvest active={ buttons[index] && buttons[index].harvest } onClick={ () => buttons[index] && buttons[index].harvest ? harvest(farm, index) : "" }>
                    Harvest
                  </Harvest>
                </InfoRow>
                <InfoRow>
                  <AddSub active={ buttons[index] && buttons[index].add } onClick={() => {
                    if(buttons[index] && buttons[index].add) {
                      setSubmission({
                        action: "Stake",
                        max: farm.bal,
                        extra: farm,
                        index,
                        confirm: stake
                      })
                      setDisplaySubmit(true)
                    }
                  }}>
                    <MdAdd size={ 25 }/>
                  </AddSub>
                  <AddSub active={ buttons[index] && buttons[index].sub } onClick={() => {
                    if(buttons[index] && buttons[index].sub) {
                      setSubmission({
                        action: "Unstake",
                        max: farm.farmBal,
                        extra: farm,
                        index,
                        confirm: unstake
                      })
                      setDisplaySubmit(true)
                    }
                  }}>
                    <MdRemove size={ 25 }/>
                  </AddSub>
                </InfoRow>
              </Info>
            </Farmable>
          )) }
        </FarmList>

        {
          displaySubmit
            ? <SubmitValue onClose={ () => setDisplaySubmit(false) } submission={ submission } provider={ connection.provider }/>
            : ""
        }

      </FarmContainer>
    )
  } else {
    return (
      <Connected>
        Connect Wallet on Fusion
      </Connected>
    )
  }
}