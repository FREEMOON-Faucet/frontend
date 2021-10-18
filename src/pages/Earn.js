import { useState, useEffect } from "react"
import styled from "styled-components"
import Web3 from "web3"
import BigNumber from "bignumber.js"
import { AirdropContract, FreeContract } from "../utils/contracts"
import Farm from "./Farm"
import Mint from "./Mint"

const EarnContainer = styled.div`
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

const Background = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  max-width: 1000px;
  padding: 10px;
  border-radius: 2px;
  background: #ddd;
`

const FarmMint = styled.div`
  display: flex;
  justify-content: center;
  width: 95%;
`

const Tab = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  max-width: 490px;
  height: 40px;
  font-size: 1.2rem;
  font-weight: ${ props => props.active ? "600" : "300" };
  cursor: pointer;
`

const AdminGov = styled.div`
  display: ${props => props.show ? "flex" : "none"};
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 20px;
  border: 2px solid #92b4e3;
`

const Options = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 40%;
  height: 230px;
  margin: 10px 0;
`

const Selection = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 80%;
  max-width: 400px;
  height: 40px;
  font-size: 1.2rem;
  cursor: default;
`

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-right: 20px;
`

const Extras = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  max-width: 400px;
  height: 50px;
  margin-right: 10px;
  margin-left: 10px;
  margin-top: ${props => props.spaceAbove ? "10px" : "0"};
  margin-bottom: ${props => props.spaceAbove ? "25px" : "0"};
  border: 1px solid #000;
  border-radius: 4px;
  font-size: 1.2rem;
  font-style: italic;
  text-align: center;
  cursor: ${props => props.checkbox ? "default" : "pointer"};

  @media screen and (orientation: portrait) {
    width: 100%;
    max-width: 650px;
    margin-top: 4px;
  }
`

const Bar = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 60%;
  max-width: 650px;
  height: 60px;

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

const SubMessage = styled.div`
  width: 80%;
  font-size: 1rem;
  font-style: italic;
  text-align: center;
`


export default function Earn({ connection }) {

  const DAILY = new BigNumber("86400")

  const [ farmMint, setFarmMint ] = useState("farm")
  const [ farmingAssets, setFarmingAssets ] = useState([])
  const [ mintingAssets, setMintingAssets ] = useState([])
  const [ term, setTerm ] = useState(2)

  const [ isAdmin, setIsAdmin ] = useState(false)
  const [ isGov, setIsGov ] = useState(false)

  const [ pauseStatus, setPauseStatus ] = useState({
    stake: false,
    unstake: false,
    harvest: false,
    lock: false,
    unlock: false
  })

  const [ updateMinters, setUpdateMinters ] = useState({
    faucet: "",
    airdrop: ""
  })
  const [ addFarm, setAddFarm ] = useState({
    address: "",
    rate: "0"
  })
  const [ addMint, setAddMint ] = useState({
    address: "",
    rate: "0"
  })
  const [ addSymbol, setAddSymbol ] = useState({
    address: "",
    symbol: ""
  })
  const [ removeFarm, setRemoveFarm ] = useState("")
  const [ removeMint, setRemoveMint ] = useState("")
  const [ newAdmin, setNewAdmin ] = useState("")
  const [ addTerm, setAddTerm ] = useState("")

  const [ updateMintersMessage, setUpdateMintersMessage ] = useState("")
  const [ addFarmMessage, setAddFarmMessage ] = useState("")
  const [ addMintMessage, setAddMintMessage ] = useState("")
  const [ addSymbolMessage, setAddSymbolMessage ] = useState("")
  const [ removeFarmMessage, setRemoveFarmMessage ] = useState("")
  const [ removeMintMessage, setRemoveMintMessage ] = useState("")
  const [ newAdminMessage, setNewAdminMessage ] = useState("")
  const [ addTermMessage, setAddTermMessage ] = useState("")

  useEffect(() => {
    const connect = async () => {
      const web3 = new Web3(connection.provider)
      const airdrop = await AirdropContract(web3)
      const account = connection.accounts[0]
      return { web3, airdrop, account }
    }

    const checkForAdminGov = async () => {
      const { web3, airdrop, account } = await connect()
      const free = await FreeContract(web3)
      const currentFaucet = (await free.methods.faucet().call()).toLowerCase()
      const currentAirdrop = (await free.methods.airdrop().call()).toLowerCase()
      const currentAdmin = (await airdrop.methods.admin().call()).toLowerCase()
      const currentGov = (await airdrop.methods.governance().call()).toLowerCase()

      if(account.toLowerCase() === currentAdmin) setIsAdmin(true)
      else if(account.toLowerCase() === currentGov) setIsGov(true)

      setUpdateMinters({ faucet: currentFaucet, airdrop: currentAirdrop })

      await refreshPaused(airdrop)
    }

    if(connection.connected) checkForAdminGov()
  }, [ connection ])

  const selection = () => {
    if(farmMint === "farm") return <Farm connection={ connection } list={ farmingAssets } setList={ setFarmingAssets }/>
    else if(farmMint === "mint") return <Mint connection={ connection } list={ mintingAssets } setList={ setMintingAssets } term={ term } setTerm={ setTerm }/>
  }

  const connect = async () => {
    const web3 = new Web3(connection.provider)
    const airdrop = await AirdropContract(web3)
    const account = connection.accounts[0]
    return { web3, airdrop, account }
  }

  const refreshPaused = async airdrop => {
    let newPauseStatus = {}
    newPauseStatus.stake = await airdrop.methods.isPaused("stake").call()
    newPauseStatus.unstake = await airdrop.methods.isPaused("unstake").call()
    newPauseStatus.harvest = await airdrop.methods.isPaused("harvest").call()
    newPauseStatus.lock = await airdrop.methods.isPaused("lock").call()
    newPauseStatus.unlock = await airdrop.methods.isPaused("unlock").call()

    setPauseStatus(newPauseStatus)
  }

  const setPause = async () => {
    if(!connection.connected) {
      await connection.connect()
      return
    }
    const web3 = new Web3(connection.provider)
    const airdrop = await AirdropContract(web3)
    const account = connection.accounts[0]
    let toPause = []
    let toUnpause = []

    for(let key in pauseStatus) {
      if(pauseStatus[key] && key === "stake") toPause.push("stake")
      else if(pauseStatus[key] && key === "unstake") toPause.push("unstake")
      else if(pauseStatus[key] && key === "harvest") toPause.push("harvest")
      else if(pauseStatus[key] && key === "lock") toPause.push("lock")
      else if(pauseStatus[key] && key === "unlock") toPause.push("unlock")
    }

    for(let key in pauseStatus) {
      if(!pauseStatus[key] && key === "stake") toUnpause.push("stake")
      else if(!pauseStatus[key] && key === "unstake") toUnpause.push("unstake")
      else if(!pauseStatus[key] && key === "harvest") toUnpause.push("harvest")
      else if(!pauseStatus[key] && key === "lock") toUnpause.push("lock")
      else if(!pauseStatus[key] && key === "unlock") toUnpause.push("unlock")
    }

    try {
      await airdrop.methods.setPause(true, toPause).send({from: account})
    } catch(err) {
      console.log(err.message)
    }

    try {
      await airdrop.methods.setPause(false, toUnpause).send({from: account})
    } catch(err) {
      console.log(err.message)
    }

    await refreshPaused(airdrop)
  }

  const updateMintInvokers = async () => {
    if(!connection.connected) {
      await connection.connect()
      return
    }

    const { web3, account } = await connect()
    const free = await FreeContract(web3)

    if(!web3.utils.isAddress(updateMinters.faucet)) {
      setUpdateMintersMessage(`Invalid faucet address.`)
      return
    }
    if(!web3.utils.isAddress(updateMinters.airdrop)) {
      setUpdateMintersMessage(`Invalid airdrop address.`)
      return
    }


    try {
      setUpdateMintersMessage(`Please wait ...`)
      await free.methods.setMintInvokers(updateMinters.faucet, updateMinters.airdrop).send({ from: account })
      setUpdateMintersMessage(`Success!`)
    } catch(err) {
      setUpdateMintersMessage(`Could not set FREE minter contracts.`)
      console.log(err.message)
    }
  }

  const updateFarmAsset = async () => {
    if(!connection.connected) {
      await connection.connect()
      return
    }

    const { web3, airdrop, account } = await connect()

    if(!web3.utils.isAddress(addFarm.address)) {
      setAddFarmMessage(`Invalid address.`)
      return
    }
    if(Number(addFarm.rate) === 0) {
      setAddFarmMessage(`Rate cannot be set to zero.`)
      return
    }

    let bigNumRate = new BigNumber(addFarm.rate)
    let formattedRate = web3.utils.toWei(bigNumRate.dividedBy(DAILY).toFixed(10), "ether")

    try {
      setAddFarmMessage(`Please Wait ...`)
      await airdrop.methods.setFarmingAssets([ addFarm.address ], [ formattedRate ]).send({ from: account })
      setAddFarmMessage(`Success!`)
    } catch(err) {
      setAddFarmMessage(`Could not set farm asset.`)
      console.log(err.message)
      return
    }
  }

  const updateMintAsset = async () => {
    if(!connection.connected) {
      await connection.connect()
      return
    }

    const { web3, airdrop, account } = await connect()

    if(!web3.utils.isAddress(addMint.address)) {
      setAddMintMessage(`Invalid address.`)
      return
    }
    if(Number(addMint.rate) === 0) {
      setAddMintMessage(`Rate cannot be set to zero.`)
      return
    }

    let bigNumRate = new BigNumber(addMint.rate)
    let formattedRate = web3.utils.toWei(bigNumRate.dividedBy(DAILY).toFixed(10), "ether")

    try {
      setAddMintMessage(`Please Wait ...`)
      await airdrop.methods.setMintingAssets([ addMint.address ], [ formattedRate ]).send({ from: account })
      setAddMintMessage(`Success!`)
    } catch(err) {
      setAddMintMessage(`Could not set mint asset.`)
      console.log(err.message)
      return
    }
  }

  const updateSymbol = async () => {
    if(!connection.connected) {
      await connection.connect()
      return
    }

    const { web3, airdrop, account } = await connect()

    if(!web3.utils.isAddress(addSymbol.address)) {
      setAddSymbolMessage(`Invalid address.`)
      return
    }
    if(!addSymbol.symbol) {
      setAddSymbolMessage(`Blank symbol value.`)
      return
    }

    try {
      setAddSymbolMessage(`Please wait ...`)
      await airdrop.methods.setSymbols([ addSymbol.address ], [ addSymbol.symbol ]).send({ from: account })
      setAddSymbolMessage(`Success!`)
    } catch(err) {
      setAddSymbolMessage(`Could not set symbol.`)
      console.log(err.message)
    }
  }

  const removeFarmAsset = async () => {
    if(!connection.connected) {
      await connection.connect()
      return
    }

    const { web3, airdrop, account } = await connect()

    if(!web3.utils.isAddress(removeFarm)) {
      setRemoveFarmMessage(`Invalid address.`)
      return
    }
    
    try {
      setRemoveFarmMessage(`Please wait ...`)
      await airdrop.methods.removeFarmAsset(removeFarm).send({ from: account })
      setRemoveFarmMessage(`Success!`)
    } catch(err) {
      setRemoveFarmMessage(`Could not remove farm asset.`)
      console.log(err.message)
    }
  }

  const removeMintAsset = async () => {
    if(!connection.connected) {
      await connection.connect()
      return
    }

    const { web3, airdrop, account } = await connect()

    if(!web3.utils.isAddress(removeMint)) {
      setRemoveMintMessage(`Invalid address.`)
      return
    }
    
    try {
      setRemoveMintMessage(`Please wait ...`)
      await airdrop.methods.removeMintAsset(removeMint).send({ from: account })
      setRemoveMintMessage(`Success!`)
    } catch(err) {
      setRemoveMintMessage(`Could not remove mint asset.`)
      console.log(err.message)
    }
  }

  const changeAdmin = async () => {
    if(!connection.connected) {
      await connection.connect()
      return
    }

    const { web3, airdrop, account } = await connect()

    if(!web3.utils.isAddress(newAdmin)) {
      setNewAdminMessage(`Invalid address.`)
      return
    }

    try {
      setNewAdminMessage(`Please wait ...`)
      await airdrop.methods.setNewAdmin(newAdmin).send({ from: account })
      setNewAdminMessage(`Success!`)
    } catch(err) {
      setNewAdminMessage(`Could not set new admin.`)
      console.log(err.message)
    }
  }

  const updateTerm = async () => {
    if(!connection.connected) {
      await connection.connect()
      return
    }

    const { airdrop, account } = await connect()

    if(!addTerm) {
      setAddTermMessage(`Invalid date value.`)
      return
    }

    let date = new Date(addTerm)
    let timestampMs = new BigNumber(date.getTime())
    let timestampS = timestampMs.dividedBy("1000").toFixed(0)

    try {
      setAddTermMessage(`Please wait ...`)
      await airdrop.methods.newTerm(timestampS).send({ from: account })
      setAddTermMessage(`Success!`)
    } catch(err) {
      setAddTermMessage(`Could not set a new term.`)
      console.log(err.message)
    }
  }

  return (
    <EarnContainer>
      <Title>
        Earn
      </Title>
      <Detail>
        Stake your LP tokens on farms to earn FREE overtime.
        <br/>
        Time Frame your LP tokens to mint FREE upfront.
      </Detail>
      <Background>
        <FarmMint>
          <Tab active={ farmMint === "farm" } onClick={ () => setFarmMint("farm") }>
            Farming
          </Tab>
          <Tab active={ farmMint === "mint" } onClick={ () => setFarmMint("mint") }>
            Minting
          </Tab>
        </FarmMint>
        { selection() }
      </Background>


      <AdminGov show={isAdmin}>
          <Title>
            Pause / Unpause
          </Title>
          <Detail>
            Pause or unpause specific contract functionality. Only accessible to admin address.
          </Detail>
          <Options>
            <Selection>
              <Checkbox type="checkbox" checked={pauseStatus.stake} onChange={e => setPauseStatus(prevState => ({...prevState, stake: e.target.checked}))}/>
              Stake
            </Selection>
            <Selection>
              <Checkbox type="checkbox" checked={pauseStatus.unstake} onChange={e => setPauseStatus(prevState => ({...prevState, unstake: e.target.checked}))}/>
              Unstake
            </Selection>
            <Selection>
              <Checkbox type="checkbox" checked={pauseStatus.harvest} onChange={e => setPauseStatus(prevState => ({...prevState, harvest: e.target.checked}))}/>
              Harvest
            </Selection>
            <Selection>
              <Checkbox type="checkbox" checked={pauseStatus.lock} onChange={e => setPauseStatus(prevState => ({...prevState, lock: e.target.checked}))}/>
              Lock
            </Selection>
            <Selection>
              <Checkbox type="checkbox" checked={pauseStatus.unlock} onChange={e => setPauseStatus(prevState => ({...prevState, unlock: e.target.checked}))}/>
              Unlock
            </Selection>
            <Extras onClick={() => setPause()} spaceAbove={ true }>
              Update
            </Extras>
          </Options>
        </AdminGov>

        <AdminGov show={ isGov }>
          <Title>
            Update FREE Minter Contracts
          </Title>
          <Detail>
            Update the addresses of the two contracts that can mint FREE (Faucet and Aidrop).
          </Detail>
          <Bar>
            <Input value={ updateMinters.faucet } onChange={ e => setUpdateMinters(prevState => ({ ...prevState, faucet: e.target.value.toLowerCase() })) }/>
          </Bar>
          <SubMessage>
            Faucet
          </SubMessage>
          <Bar>
            <Input value={ updateMinters.airdrop } onChange={ e => setUpdateMinters(prevState => ({ ...prevState, airdrop: e.target.value.toLowerCase() })) }/>
          </Bar>
          <SubMessage>
            Airdrop
          </SubMessage>
          <Extras spaceAbove={ true } onClick={ updateMintInvokers }>
            Update
          </Extras>
          <SubMessage>
            { updateMintersMessage }
          </SubMessage>
          
          <Title>
            Farm Assets
          </Title>
          <Detail>
            Add new tokens and their rate to the farm. Update existing token's rates.
          </Detail>
          <Bar>
            <Input value={ addFarm.address } onChange={ e => setAddFarm(prevState => ({ ...prevState, address: e.target.value })) }/>
          </Bar>
          <SubMessage>
            Address
          </SubMessage>
          <Bar>
            <Input value={ addFarm.rate } onChange={ e => setAddFarm(prevState => ({ ...prevState, rate: e.target.value })) }/>
          </Bar>
          <SubMessage>
            Daily Rate / Token staked
          </SubMessage>
          <Extras spaceAbove={ true } onClick={ updateFarmAsset }>
            Update
          </Extras>
          <SubMessage>
            { addFarmMessage }
          </SubMessage>

          <Title>
            Mint Assets
          </Title>
          <Detail>
            Add new tokens and their rate to the FREE mintable tokens. Update existing token's rates.
          </Detail>
          <Bar>
            <Input value={ addMint.address } onChange={ e => setAddMint(prevState => ({ ...prevState, address: e.target.value })) }/>
          </Bar>
          <SubMessage>
            Address
          </SubMessage>
          <Bar>
            <Input value={ addMint.rate } onChange={ e => setAddMint(prevState => ({ ...prevState, rate: e.target.value })) }/>
          </Bar>
          <SubMessage>
            Daily Rate / Token locked
          </SubMessage>
          <Extras spaceAbove={ true } onClick={ updateMintAsset }>
            Update
          </Extras>
          <SubMessage>
            { addMintMessage }
          </SubMessage>

          <Title>
            Symbols
          </Title>
          <Detail>
            Add or update the symbols.
          </Detail>
          <Bar>
            <Input value={ addSymbol.address } onChange={ e => setAddSymbol(prevState => ({ ...prevState, address: e.target.value })) }/>
          </Bar>
          <SubMessage>
            Address
          </SubMessage>
          <Bar>
            <Input value={ addSymbol.symbol } onChange={ e => setAddSymbol(prevState => ({ ...prevState, symbol: e.target.value })) }/>
          </Bar>
          <SubMessage>
            Symbol
          </SubMessage>
          <Extras spaceAbove={ true } onClick={ updateSymbol }>
            Update
          </Extras>
          <SubMessage>
            { addSymbolMessage }
          </SubMessage>

          <Title>
            Remove Farm Asset
          </Title>
          <Detail>
            Remove an asset from the farm, preventing staking, unstaking, and harvesting.
          </Detail>
          <Bar>
            <Input value={ removeFarm } onChange={ e => setRemoveFarm(e.target.value) }/>
          </Bar>
          <SubMessage>
            Address
          </SubMessage>
          <Extras spaceAbove={ true } onClick={ removeFarmAsset }>
            Remove
          </Extras>
          <SubMessage>
            { removeFarmMessage }
          </SubMessage>

          <Title>
            Remove Mint Asset
          </Title>
          <Detail>
            Remove an asset from the FREE mintable tokens, preventing locking and unlocking.
          </Detail>
          <Bar>
            <Input value={ removeMint } onChange={ e => setRemoveMint(e.target.value) }/>
          </Bar>
          <SubMessage>
            Address
          </SubMessage>
          <Extras spaceAbove={ true } onClick={ removeMintAsset }>
            Remove
          </Extras>
          <SubMessage>
            { removeMintMessage }
          </SubMessage>

          <Title>
            Set New Admin
          </Title>
          <Detail>
            Update the admin address: The address that can pause, unpause, and upgrade functionality.
          </Detail>
          <Bar>
            <Input value={ newAdmin } onChange={ e => setNewAdmin(e.target.value) }/>
          </Bar>
          <SubMessage>
            New Admin Address
          </SubMessage>
          <Extras spaceAbove={ true } onClick={ changeAdmin }>
            Update
          </Extras>
          <SubMessage>
            { newAdminMessage }
          </SubMessage>

          <Title>
            Set New Term
          </Title>
          <Detail>
            Set a new term. This action will move the current long term end date to medium term, and the current medium term end date to short term.
          </Detail>
          <Bar>
            <Input type="date" value={ addTerm } onChange={ e => setAddTerm(e.target.value) }/>
          </Bar>
          <SubMessage>
            Date
          </SubMessage>
          <Extras spaceAbove={ true } onClick={ updateTerm }>
            Confirm
          </Extras>
          <SubMessage>
            { addTermMessage }
          </SubMessage>
        </AdminGov>

    </EarnContainer>
  )
}
