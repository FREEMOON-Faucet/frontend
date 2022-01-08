import { useState, useEffect } from "react"
import styled from "styled-components"
import BigNumber from "bignumber.js"
import Web3 from "web3"
import { AirdropContract, FaucetContract, FmnAddress } from "../utils/contracts"
import { ImLock, ImUnlocked } from "react-icons/im"
import ERC20 from "../utils/ABI/ERC20"
import SubmitValue from "./SubmitValue"
import { poolAddrs, poolABI } from "../utils/pricePools"
import UniswapV2Router02 from "../utils/ABI/UniswapV2Router02"
import UniswapV2Factory from "../utils/ABI/UniswapV2Factory"
import UniswapV2Pair from "../utils/ABI/UniswapV2Pair"
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md"

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

const NavRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 70px;
  margin: 5px 0;
  font-size: 1rem;
  font-style: italic;
  user-select: none;
`

const NavArrow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 10%;
  height: 60px;
  border-radius: 5px;
  background: #fff;
  cursor: ${ props => props.active ? "pointer" : "default" };
  opacity: ${ props => props.active ? "1" : "0.5" };
`


export default function Mint({ connection, list, setList, term, setTerm }) {

  const ONE_DAY = new BigNumber("86400")
  const ONE_YEAR = ONE_DAY.multipliedBy("365")
  const MAX = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"

  const [ buttons, setButtons ] = useState([])
  const [ displaySubmit, setDisplaySubmit ] = useState(false)
  const [ submission, setSubmission ] = useState({
    action: "Stake",
    max: "0",
    info: null,
    confirm: null    
  })

  const [ APRList, setAPRList ] = useState([])

  const [ maxPage, setMaxPage ] = useState(0)
  const [ currentPage, setCurrentPage ] = useState(0)

  useEffect(() => {
    const getLoadSet = (count, current, max) => {
      let lower = current * 10
      let upper = (lower + 9) >= max * 10 ? count - 1 : lower + 9
      return { lower, upper }
    }

    const connect = async () => {
      const web3 = new Web3(connection.provider)
      const airdrop = await AirdropContract(web3)
      const account = connection.accounts[0]
      return { web3, airdrop, account }
    }

    const loadMints = async ({ web3, airdrop, account }) => {
      console.log(`Refresh minting with term ${ term } ...`)
      const mintAssetCount = await airdrop.methods.mintingAssetCount().call()
      let maxPageValue = Math.ceil(mintAssetCount / 10) - 1
      const { lower, upper } = getLoadSet(Number(mintAssetCount), currentPage, maxPageValue)
      console.log(lower, upper)
      const termEnd = new BigNumber(await airdrop.methods.termEnd(term).call())
      if(termEnd.toNumber() < (Date.now()/1000)) return
      const now = new BigNumber(Date.now()).dividedBy("1000").toFixed(0)
      const relative = termEnd.minus(now)
      let pending = []
      for(let i = lower; i <= upper; i++) {
        pending.push(airdrop.methods.mintingAssets(i).call())
      }
      const mintAddresses = await Promise.all(pending)
      let symbolsPending = [], ratesPending = [], balancesPending = [], idsPending = [], positionsPending = []
      for(let i = 0; i < mintAddresses.length; i++) {
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
      setMaxPage(maxPageValue)
      setButtons(buttonsActive)

      return mints
    }

    const getPrices = async () => {
      const { web3 } = await connect()
      const freeUsdt = new web3.eth.Contract(poolABI, poolAddrs.freeUsdt)
      const fmnUsdt = new web3.eth.Contract(poolABI, poolAddrs.fmnUsdt)
      const fsnUsdt = new web3.eth.Contract(poolABI, poolAddrs.fsnUsdt)
      const chngUsdt = new web3.eth.Contract(poolABI, poolAddrs.chngUsdt)
      // const anyFsn = new web3.eth.Contract(poolABI, poolAddrs.anyFsn)

      const formatReserves = (tokenReserve, usdtReserve) => {
        const tokenAmount = new BigNumber(web3.utils.fromWei(tokenReserve))
        const usdtAmount = (new BigNumber(usdtReserve)).dividedBy("1000000")
        return [ tokenAmount, usdtAmount ]
      }

      const freeReserves = await freeUsdt.methods.getReserves().call()
      const fmnReserves = await fmnUsdt.methods.getReserves().call()
      const fsnReserves = await fsnUsdt.methods.getReserves().call()
      const chngReserves = await chngUsdt.methods.getReserves().call()

      // console.log(`fsn: ${ (await fsnUsdt.methods.token0().call())._address }`)
      // console.log(`fsn: ${ (await fsnUsdt.methods.token1().call())._address }`)
      // console.log(`free: ${ (await freeUsdt.methods.token0().call())._address }`)
      // console.log(`free: ${ (await freeUsdt.methods.token1().call())._address }`)
      // console.log(`fmn: ${ (await fmnUsdt.methods.token0().call())._address }`)
      // console.log(`fmn: ${ (await fmnUsdt.methods.token1().call())._address }`)
      // console.log(`chng : ${ (await chngUsdt.methods.token0().call())._address }`)
      // console.log(`chng : ${ (await chngUsdt.methods.token1().call())._address }`)

      const [ freeReserve, freeUsdtReserve ] = formatReserves(freeReserves._reserve0, freeReserves._reserve1)
      const [ fmnReserve, fmnUsdtReserve ] = formatReserves(fmnReserves._reserve1, fmnReserves._reserve0)
      const [ fsnReserve, fsnUsdtReserve ] = formatReserves(fsnReserves._reserve0, fsnReserves._reserve1)
      const [ chngReserve, chngUsdtReserve ] = formatReserves(chngReserves._reserve1, chngReserves._reserve0)

      // console.log(freeReserve.toFixed(), freeUsdtReserve.toFixed())
      // console.log(`FREE price: ${ freeUsdtReserve.dividedBy(freeReserve).toFixed() }`)
      // console.log(fmnReserve.toFixed(), fmnUsdtReserve.toFixed())
      // console.log(`FMN price: ${ fmnUsdtReserve.dividedBy(fmnReserve).toFixed() }`)
      // console.log(fsnReserve.toFixed(), fsnUsdtReserve.toFixed())
      // console.log(`FSN price: ${ fsnUsdtReserve.dividedBy(fsnReserve).toFixed() }`)
      // console.log(chngReserve.toFixed(), chngUsdtReserve.toFixed())
      // console.log(`CHNG price: ${ chngUsdtReserve.dividedBy(chngReserve).toFixed() }`)

      const freePrice = freeUsdtReserve.dividedBy(freeReserve)
      const fmnPrice = fmnUsdtReserve.dividedBy(fmnReserve)
      const fsnPrice = fsnUsdtReserve.dividedBy(fsnReserve)
      const chngPrice = chngUsdtReserve.dividedBy(chngReserve)

      // for(let i = 0; i < contracts.length; i++) {
      //   const { _reserve0, _reserve1 } = await contracts[i].methods.getReserves().call()
      //   console.log(`${ names[i] }, ${ _reserve0 }, ${ _reserve1 }`)
      //   const reserve0 = new BigNumber(web3.utils.fromWei(_reserve0))
      //   const reserve1 = new BigNumber(web3.utils.fromWei(_reserve1))
      //   const price = reserve1.dividedBy(reserve0)
      //   // console.log(`${ names[i] }, $${ price.toFixed() }`)
      // }

      return {
        free: freePrice,
        fmn: fmnPrice,
        fsn: fsnPrice,
        chng: chngPrice
      }
    }

    const calcApr = async (pair, tokenPrice, freeRate, prices) => {
      // free reward rate * free price / token price * 100
      const APR = freeRate
      .multipliedBy(prices.free)
      .dividedBy(tokenPrice)
      .multipliedBy("100").toFixed(2)

      // console.log(`${ pair.symbol }: ${ APR }`)

      return APR
    }
    
    const getTokenPrice = async (web3, reserve, supply, price) => {
      // supply / (2 * reserve * price)
      const totalPoolValue = reserve.multipliedBy(price).multipliedBy("2")
      return totalPoolValue.dividedBy(supply)
    }
    
    const getLPTokenSupply = async (web3, farmable) => {
      return new BigNumber(web3.utils.fromWei(await farmable.methods.totalSupply().call()))
    }

    const getRefTokenReserve = async (web3, isToken0, farmable) => {
      const { _reserve0, _reserve1 } = await farmable.methods.getReserves().call()
      if(isToken0 === 0) return new BigNumber(web3.utils.fromWei(_reserve0))
      else if(isToken0 === 1) return new BigNumber(web3.utils.fromWei(_reserve1))
    }

    const getComponentTokens = async farmable => {
      const token0 = (await farmable.methods.token0().call())._address.toLowerCase()
      const token1 = (await farmable.methods.token1().call())._address.toLowerCase()
      return { token0, token1 }
    }
    
    // Handles all pairs that do not contain "anyswap" in title, or are single tokens.
    const defaultInterface = async (pair, priceRefAddr, price, prices) => {
      const web3 = new Web3(connection.provider)
      const farmable = new web3.eth.Contract(poolABI, pair.addr)
      const { token0, token1 } = await getComponentTokens(farmable)
      let isToken0 = 2
      if(token0 === priceRefAddr.toLowerCase()) isToken0 = 0
      else if(token1 === priceRefAddr.toLowerCase()) isToken0 = 1
      else console.log(`No price ref found, ref: ${ priceRefAddr.toLowerCase() }, found: ${ token0 } & ${ token1 }`)
      
      if(isToken0 !== 2) {
        const refReserve = await getRefTokenReserve(web3, isToken0, farmable)
        const supply = await getLPTokenSupply(web3, farmable)
        const lpTokenPrice = await getTokenPrice(web3, refReserve, supply, price)
        // console.log(`Pair: ${ pair.symbol } ${ lpTokenPrice.toFixed() }`)
        const apr = calcApr(pair, lpTokenPrice, pair.rate, prices)
        return apr
      } else {
        console.log(`Pair: ${ pair.symbol } does not include a price ref`)
      }
    }
    
    // Handles all pairs with "anyswap" in their title.
    const alternateInterface = async () => {
      return "-"
    }

    // Choose which price reference to use
    const getPriceReference = (pair, prices) => {
      if(pair.symbol.includes("FSN")) return { priceRefAddr: poolAddrs.fsn, priceRef: prices.fsn }
      else if(pair.symbol.includes("FMN")) return { priceRefAddr: poolAddrs.fmn, priceRef: prices.fmn }
      else if(pair.symbol.includes("FREE")) return { priceRefAddr: poolAddrs.free, priceRef: prices.free }
      else if(pair.symbol.includes("CHNG")) return { priceRefAddr: poolAddrs.chng, priceRef: prices.chng }
      else if(pair.symbol.includes("ANY")) return { priceRefAddr: null, priceRef: null }
      else return { priceRefAddr: null, priceRef: null }
    }

    const getAprs = async (newList, newPrices) => {
      let apr = "-"
      let aprList = []

      for(let i = 0; i < newList.length; i++) {
        let pair = newList[ i ]
        let { priceRefAddr, priceRef } = getPriceReference(pair, newPrices)
        if(!priceRefAddr || !priceRef) continue
        if(pair.symbol.toLowerCase().includes("anyswap")) {
          // apr = await alternateInterface() // call alternate interface to handle it
          continue
        } else if(pair.symbol.length <= 4) {
          apr = await calcApr(pair, priceRef, pair.rate, newPrices)
        } else {
          apr = await defaultInterface(pair, priceRefAddr, priceRef, newPrices)
        }
        console.log(`${ pair.symbol }: ${ apr }`)
        aprList[ i ] = apr
      }
      
      console.log(`APRs loaded. (${ aprList.length })`)

      setList(newList)
      setAPRList(aprList)
    }

    const startLoading = async () => {
      setList([])
      const { web3, airdrop, account } = await connect()
      let newList = await loadMints({ web3, airdrop, account })
      let newPrices = await getPrices()
      await getAprs(newList, newPrices)
    }

    if(connection.connected && (connection.chainId ===  "0xb660" || connection.chainId === "0x7f93")) startLoading()
  }, [ connection, setList, term, currentPage ])

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
              APR
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
          { list.map((mint, index) => {
            if(mint.termEnd.toNumber() >= (Date.now()/1000)) {
              return (
                <Mintable key={ mint.addr }>
                  <Symbol>
                    { mint.symbol }
                  </Symbol>
                  <Info>
                    {/* { mint.rate.toFixed(5) } */}
                    { APRList[ index ] || "-" }%
                  </Info>
                  <Info>
                    { Number(mint.bal).toFixed(4) }
                  </Info>
                  <Info>
                    { Number(mint.posBal).toFixed(4) }
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
              )
            } else return null
          }) }
        </MintList>
        <NavRow>
          <NavArrow onClick={ () => setCurrentPage(prev => prev > 0 ? prev - 1 : 0) } active={ currentPage > 0 }>
            <MdKeyboardArrowLeft size={ 35 }/>
          </NavArrow>
          Page { currentPage + 1 }/{ maxPage + 1 }
          <NavArrow onClick={ () => setCurrentPage(prev => prev < maxPage ? prev + 1 : maxPage) } active={ currentPage < maxPage }>
            <MdKeyboardArrowRight size={ 35 }/>
            </NavArrow>
        </NavRow>

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