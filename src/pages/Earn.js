import { useState, useEffect } from "react"
import styled from "styled-components"
import Web3 from "web3"
import { AirdropContract } from "../utils/contracts"
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
  margin-bottom: 20px;
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


export default function Earn({ connection }) {

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

  useEffect(() => {
    const connect = async () => {
      const web3 = new Web3(connection.provider)
      const airdrop = await AirdropContract(web3)
      const account = connection.accounts[0]
      return { web3, airdrop, account }
    }

    const checkForAdminGov = async () => {
      const { airdrop, account } = await connect()
      const currentAdmin = (await airdrop.methods.admin().call()).toLowerCase()
      const currentGov = (await airdrop.methods.governance().call()).toLowerCase()

      if(account.toLowerCase() === currentAdmin) setIsAdmin(true)
      else if(account.toLowerCase() === currentGov) setIsGov(true)

      await refreshPaused(airdrop)
    }

    if(connection.connected) checkForAdminGov()
  }, [ connection ])

  const selection = () => {
    if(farmMint === "farm") return <Farm connection={ connection } list={ farmingAssets } setList={ setFarmingAssets }/>
    else if(farmMint === "mint") return <Mint connection={ connection } list={ mintingAssets } setList={ setMintingAssets } term={ term } setTerm={ setTerm }/>
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

    </EarnContainer>
  )
}
