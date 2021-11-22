import { useState, useEffect } from "react"
import styled from "styled-components"
import BigNumber from "bignumber.js"
import Web3 from "web3"
import { AirdropContract } from "../utils/contracts"
// import { FaucetContract } from "../utils/contracts"  // for checking if user is subscribed
import { MdAdd, MdRemove } from "react-icons/md"
import SubmitValue from "./SubmitValue"
import ERC20 from "../utils/ABI/ERC20"
import { poolAddrs, poolABI, uniswapV1 } from "../utils/pricePools"

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

  const [ prices, setPrices ] = useState({
    free: "",
    fmn: "",
    fsn: "",
    // any: ""
  })

  const [ APRList, setAPRList ] = useState([])

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

    const getPrices = async () => {
      const { web3 } = await connect()
      const freeUsdt = new web3.eth.Contract(poolABI, poolAddrs.freeUsdt)
      const fmnUsdt = new web3.eth.Contract(poolABI, poolAddrs.fmnUsdt)
      const fsnUsdt = new web3.eth.Contract(poolABI, poolAddrs.fsnUsdt)
      // const anyFsn = new web3.eth.Contract(poolABI, poolAddrs.anyFsn)

      const formatReserves = (tokenReserve, usdtReserve) => {
        const tokenAmount = new BigNumber(web3.utils.fromWei(tokenReserve))
        const usdtAmount = (new BigNumber(usdtReserve)).dividedBy("1000000")
        return [ tokenAmount, usdtAmount ]
      }

      const freeReserves = await freeUsdt.methods.getReserves().call()
      const fmnReserves = await fmnUsdt.methods.getReserves().call()
      const fsnReserves = await fsnUsdt.methods.getReserves().call()

      // console.log(`fsn: ${ (await fsnUsdt.methods.token0().call())._address }`)
      // console.log(`fsn: ${ (await fsnUsdt.methods.token1().call())._address }`)
      // console.log(`free: ${ (await freeUsdt.methods.token0().call())._address }`)
      // console.log(`free: ${ (await freeUsdt.methods.token1().call())._address }`)
      // console.log(`fmn: ${ (await fmnUsdt.methods.token0().call())._address }`)
      // console.log(`fmn: ${ (await fmnUsdt.methods.token1().call())._address }`)

      const [ freeReserve, freeUsdtReserve ] = formatReserves(freeReserves._reserve0, freeReserves._reserve1)
      const [ fmnReserve, fmnUsdtReserve ] = formatReserves(fmnReserves._reserve1, fmnReserves._reserve0)
      const [ fsnReserve, fsnUsdtReserve ] = formatReserves(fsnReserves._reserve0, fsnReserves._reserve1)

      // console.log(freeReserve.toFixed(), freeUsdtReserve.toFixed())
      // console.log(`FREE price: ${ freeUsdtReserve.dividedBy(freeReserve).toFixed() }`)
      // console.log(fmnReserve.toFixed(), fmnUsdtReserve.toFixed())
      // console.log(`FMN price: ${ fmnUsdtReserve.dividedBy(fmnReserve).toFixed() }`)
      // console.log(fsnReserve.toFixed(), fsnUsdtReserve.toFixed())
      // console.log(`FSN price: ${ fsnUsdtReserve.dividedBy(fsnReserve).toFixed() }`)

      const freePrice = freeUsdtReserve.dividedBy(freeReserve)
      const fmnPrice = fmnUsdtReserve.dividedBy(fmnReserve)
      const fsnPrice = fsnUsdtReserve.dividedBy(fsnReserve)

      // for(let i = 0; i < contracts.length; i++) {
      //   const { _reserve0, _reserve1 } = await contracts[i].methods.getReserves().call()
      //   console.log(`${ names[i] }, ${ _reserve0 }, ${ _reserve1 }`)
      //   const reserve0 = new BigNumber(web3.utils.fromWei(_reserve0))
      //   const reserve1 = new BigNumber(web3.utils.fromWei(_reserve1))
      //   const price = reserve1.dividedBy(reserve0)
      //   // console.log(`${ names[i] }, $${ price.toFixed() }`)
      // }

      setPrices({
        free: freePrice,
        fmn: fmnPrice,
        fsn: fsnPrice,
        // any: ""
      })
    }

    const startLoading = async () => {
      const { web3, airdrop, account } = await connect()
      loadFarms({ web3, airdrop, account })
      refreshing = setInterval(() => {
        getPrices()
        loadFarms({ web3, airdrop, account })
      }, 10000)
    }

    if(connection.connected && (connection.chainId ===  "0xb660" || connection.chainId === "0x7f93")) startLoading()

    return () => clearInterval(refreshing)
  }, [ connection, setList ])

  useEffect(() => {
    const calcApr = async (pair, tokenPrice, freeRate) => {
      // seconds in year * free reward rate * free price / token price * 100
      const APR = ONE_YEAR
      .multipliedBy(freeRate)
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
    const defaultInterface = async (pair, priceRefAddr, price) => {
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
        const apr = calcApr(pair, lpTokenPrice, pair.rate)
        return apr
      } else {
        console.log(`Pair: ${ pair.symbol } does not include a price ref`)
      }
    }
    
    // Handles all pairs with "anyswap" in their title.
    const alternateInterface = async () => {
      return "-"
    }

    // Handles all tokens that are not a pair, but a single token.
    const singleTokenInterface = async (pair, price) => {
      const apr = calcApr(pair, price, pair.rate)
      return apr
    }

    // Choose which price reference to use
    const getPriceReference = pair => {
      if(pair.symbol.includes("FSN")) return { priceRefAddr: poolAddrs.fsn, priceRef: prices.fsn }
      else if(pair.symbol.includes("FMN")) return { priceRefAddr: poolAddrs.fmn, priceRef: prices.fmn }
      else if(pair.symbol.includes("FREE")) return { priceRefAddr: poolAddrs.free, priceRef: prices.free }
      else if(pair.symbol.includes("ANY")) return { priceRefAddr: null, priceRef: null }
    }

    const getAprs = async () => {
      let apr = "-"
      let aprList = []
      list.map(async (pair, i) => {
        let { priceRefAddr, priceRef } = getPriceReference(pair)
        if(!priceRefAddr || !priceRef) return
        if(pair.symbol.toLowerCase().includes("anyswap")) {
          apr = await alternateInterface() // call alternate interface to handle it
          return
        } else if(pair.symbol.length <= 4) {
          // apr = await singleTokenInterface(pair, priceRefAddr, priceRef) // call single token APR calculation
          apr = await calcApr(pair, priceRef, pair.rate)
        } else {
          apr = await defaultInterface(pair, priceRefAddr, priceRef)
        }
        // aprList[i] = apr
        let prevState = APRList
        prevState[i] = apr
        setAPRList(prevState)
      })
      // setAPRList(aprList)
    }

    getAprs()
  }, [ prices ])

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
              APR
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
                {/* { (ONE_DAY.multipliedBy(farm.rate)).toFixed(5) } */}
                { APRList[index] || "-" }%
              </Info>
              <Info>
                { Number(farm.bal).toFixed(4) }
              </Info>
              <Info>
                { Number(farm.farmBal).toFixed(4) }
              </Info>
              <Info>
                { Number(farm.earned).toFixed(4) }
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