import { useState, useEffect } from "react"
import styled from "styled-components"
import BigNumber from "bignumber.js"
import Web3 from "web3"
import { AirdropContract, FaucetContract, FmnAddress } from "../utils/contracts"
import { ImLock, ImUnlocked } from "react-icons/im"
import ERC20 from "../utils/ABI/ERC20"
import SubmitValue from "./SubmitValue"

const MintContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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

const Timeframe = styled.div`
  display: flex;
  justify-content: center;
  width: 95%;
  margin-bottom: 20px;
`

const Tab = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  max-width: 490px;
  height: 40px;
  border-top-left-radius: ${ props => props.name === "short" ? "4px" : "0" };
  border-bottom-left-radius: ${ props => props.name === "short" ? "4px" : "0" };
  border-top-right-radius: ${ props => props.name === "long" ? "4px" : "0" };
  border-bottom-right-radius: ${ props => props.name === "long" ? "4px" : "0" };
  font-size: 1rem;
  font-weight: ${ props => props.active ? "600" : "300" };
  background: ${ props => props.active ? "#92b4e3" : "#fff" };
  cursor: pointer;
`

const MintList = styled.ul`
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

const Mintable = styled.li`
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
  width: 16.67%;
  height: 100%;
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
  text-align: center;
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 98%;
  height: 48%;
`

const Action = styled.div`
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


export default function Mint({ connection, list, setList, term, setTerm }) {

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

    const loadMints = async ({ web3, airdrop, account }) => {
      console.log(`Refresh minting with term ${ term } ...`)
      const mintAssetCount = await airdrop.methods.mintingAssetCount().call()
      const termEnd = new BigNumber(await airdrop.methods.termEnd(term).call())
      const now = new BigNumber(Date.now()).dividedBy("1000").toFixed(0)
      const relative = termEnd.minus(now)
      let pending = []
      for(let i = 0; i < mintAssetCount; i++) {
        pending.push(airdrop.methods.mintingAssets(i).call())
      }
      const mintAddresses = await Promise.all(pending)
      let symbolsPending = [], ratesPending = [], balancesPending = [], idsPending = [], positionsPending = []
      for(let i = 0; i < mintAssetCount; i++) {
        let currentToken = new web3.eth.Contract(ERC20, mintAddresses[i])
        let currentId = await airdrop.methods.getPositionId(account, mintAddresses[i], termEnd.toString()).call()
        let rate = await airdrop.methods.mintRewardPerSec(mintAddresses[i]).call()
        symbolsPending.push(airdrop.methods.assetSymbol(mintAddresses[i]).call())
        ratesPending.push(rate)
        balancesPending.push(currentToken.methods.balanceOf(account).call())
        idsPending.push(currentId)
        positionsPending.push(airdrop.methods.positionBalance(currentId).call())
      }
      let symbols = await Promise.all(symbolsPending)
      let rates = await Promise.all(ratesPending)
      let balances = await Promise.all(balancesPending)
      let ids = await Promise.all(idsPending)
      let positionBalances = await Promise.all(positionsPending)
      let mints = mintAddresses.map((addr, index) => {
        return {
          addr,
          termEnd,
          symbol: symbols[index],
          rate: relative.multipliedBy(web3.utils.fromWei(rates[index])),
          bal: web3.utils.fromWei(balances[index]),
          id: ids[index],
          posBal: web3.utils.fromWei(positionBalances[index])
        }
      })
      let buttonsActive = []
      for(let i = 0; i < mints.length; i++) {
        buttonsActive.push({
          add: Number(mints[i].bal) > 0,
          sub: Number(mints[i].posBal) > 0
        })
      }
      setButtons(buttonsActive)
      setList(mints)
    }

    const startLoading = async () => {
      const { web3, airdrop, account } = await connect()
      loadMints({ web3, airdrop, account })
      refreshing = setInterval(() => loadMints({ web3, airdrop, account }), 10000)
    }

    if(connection.connected && (connection.chainId ===  "0xb660" || connection.chainId === "0x7f93")) startLoading()

    return () => clearInterval(refreshing)
  }, [ connection, setList, term ])

  const formatDate = ts => {
    let timestamp = ts.multipliedBy("1000").toNumber()
    let date = new Date(timestamp)
    let month = String(date.getMonth() + 1)
    let day = String(date.getDate())
    let year = String(date.getFullYear())

    if(month.length < 2) month = "0" + month
    if(day.length < 2) day = "0" + day

    return [ year, month, day ].join('-')
  }

  const lock = async (val, extra, index) => {
    let buttonsList = buttons
    buttonsList[index] = { add: false, sub: false }
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
      await airdrop.methods.lock(extra.addr, web3.utils.toWei(val, "ether"), term).send({ from: account })
    } catch(err) {
      console.log(`Error locking: ${ err.message }`)
    }
  }

  const unlock = async (val, extra, index) => {
    let buttonsList = buttons
    buttonsList[index] = { add: false, sub: false }
    setButtons(prevState => [ ...prevState, buttonsList ])
    const web3 = new Web3(connection.provider)
    const airdrop = await AirdropContract(web3)
    const account = connection.accounts[0]
    const FMN_ADDR = await FmnAddress(web3)
    const fmn = new web3.eth.Contract(ERC20, FMN_ADDR)

    const allowance = new BigNumber(web3.utils.fromWei(await fmn.methods.allowance(account, airdrop._address).call()))

    if(allowance.isLessThan(val)) {
      try {
        await fmn.methods.approve(airdrop._address, MAX).send({ from: account })
      } catch(err) {
        console.log(`Error approving: ${ err.message }`)
        return
      }
    }

    try {
      await airdrop.methods.unlock(extra.addr, term).send({ from: account })
    } catch(err) {
      console.log(`Error unlocking: ${ err.message }`)
    }}
  
  if(connection.connected && (connection.chainId ===  "0xb660" || connection.chainId === "0x7f93")) {
    return (
      <MintContainer>
        <Timeframe>
          <Tab name="short" active={ term === 0 } onClick={ () => term !== 0 ? setTerm(0) : "" }>
            Short Term
          </Tab>
          <Tab name="medium" active={ term === 1 } onClick={ () => term !== 1 ? setTerm(1) : "" }>
            Medium Term
          </Tab>
          <Tab name="long" active={ term === 2 } onClick={ () => term !== 2 ? setTerm(2) : "" }>
            Long Term
          </Tab>
        </Timeframe>
        <MintList>
          <Banner>
            <BannerTitle>
              Minter
            </BannerTitle>
            <BannerTitle>
              FREE / Token
            </BannerTitle>
            <BannerTitle>
              Your Balance
            </BannerTitle>
            <BannerTitle>
              Your Position
            </BannerTitle>
            <BannerTitle>
              Term End
            </BannerTitle>
          </Banner>
          { list.map((mint, index) => (
            <Mintable key={ mint.addr }>
              <Symbol>
                { mint.symbol }
              </Symbol>
              <Info>
                { mint.rate.toFixed() }
              </Info>
              <Info>
                { mint.bal }
              </Info>
              <Info>
                { mint.posBal }
              </Info>
              <Info>
                { formatDate(mint.termEnd) }
                {/* (new Date(mint.termEnd.multipliedBy("1000").toNumber())).toLocaleTimeString().replace("T", " ").replace("Z", "").slice(0, 19) */}
              </Info>
              <Info>
                <InfoRow>
                  <Action active={ buttons[index] && buttons[index].add } onClick={() => {
                    if(buttons[index] && buttons[index].add) {
                      setSubmission({
                        action: `Lock ${ mint.symbol }`,
                        max: mint.bal,
                        extra: mint,
                        index,
                        confirm: lock
                      })
                      setDisplaySubmit(true)
                    }
                  }}>
                    <ImLock size={ 25 }/>
                  </Action>
                </InfoRow>
                <InfoRow>
                  <Action style={{ display: "none" }} active={ buttons[index] && buttons[index].sub } onClick={() => {
                    if(buttons[index] && buttons[index].sub) {
                      setSubmission({
                        action: `Unlock ${ mint.symbol }`,
                        max: mint.posBal,
                        extra: mint,
                        confirm: unlock
                      })
                      setDisplaySubmit(true)
                    }
                  }}>
                    <ImUnlocked size={ 25 }/>
                  </Action>
                </InfoRow>
              </Info>
            </Mintable>
          )) }
        </MintList>

          {
            displaySubmit
              ? <SubmitValue onClose={ () => setDisplaySubmit(false) } submission={ submission } provider={ connection.provider }/>
              : ""
          }

      </MintContainer>
    )
  } else {
    return (
      <Connected>
        Connect Wallet on Fusion
      </Connected>
    )
  }
}