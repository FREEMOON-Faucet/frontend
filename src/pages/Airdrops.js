import { useState, useEffect } from "react"
import styled from "styled-components"
import Web3 from "web3"
import { FaParachuteBox } from "react-icons/fa"

import { AirdropContract, FaucetContract } from "../utils/contracts"
import ERC20 from "../utils/ABI/ERC20"

const AirdropsContainer = styled.div`
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

const Table = styled.table`
  border-collapse: collapse;
  width: 60%;
  max-width: 650px;
`

const Tr = styled.tr`
  width: 100%;
  height: 40px;
  font-weight: ${props => props.title ? "900" : "300"};
`

const Td = styled.td`
  width: 50%;
  border: 1px solid black;
  font-size: 1.2rem;
  text-align: center;
`

const Display = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 550px;
  height: 40px;
  border: 2px solid #000;
  border-radius: 4px;
  font-size: 1.4rem;
`

const Bar = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 60%;
  max-width: 650px;
  height: 40px;
  margin-top: 20px;

  @media screen and (orientation: portrait) {
    flex-direction: column;
    width: 70%;
    height: 100px;
  }
`

const Fill = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 40px;
  margin: 0;
  border: 2px solid black;
  border-radius: 4px;
  cursor: pointer;

  @media screen and (orientation: portrait) {
    width: 100%;
    max-width: 650px;
    margin-top: 2px;
  }
`

const Message = styled.div`
  width: 80%;
  font-size: 1rem;
  font-style: italic;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 40px; 
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
  height: 100px;
  margin: 10px 0;
`

const Extras = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  max-width: 250px;
  height: 40px;
  margin-right: 10px;
  margin-left: 10px;
  margin-top: ${props => props.spaceAbove ? "10px" : "0"};
  margin-bottom: ${props => props.spaceAbove ? "25px" : "0"};
  border: 1px solid #000;
  border-radius: 4px;
  font-size: 1.2rem;
  font-style: italic;
  cursor: ${props => props.checkbox ? "default" : "pointer"};
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
  margin-top: 5px;
`

export default function Airdrops({ connection }) {

  const FSN = "0xffffffffffffffffffffffffffffffffffffffff"
  const AIRDROP_DEFAULT = "You can only claim once per day."
  const SUCCESS = "Success!"
  const UPDATE_ASSET_DEFAULT = "Enter the address of the token to add/update along with the balance required to receive FREE airdrops."

  const [ eligibleTokens, setEligibleTokens ] = useState([])
  const [ claimable, setClaimable ] = useState("0")

  const [ airdropMessage, setAirdropMessage ] = useState(AIRDROP_DEFAULT)
  const [ updateAssetMessage, setUpdateAssetMessage ] = useState(UPDATE_ASSET_DEFAULT)

  const [ isAdmin, setIsAdmin ] = useState(false)
  const [ isGov, setIsGov ] = useState(false)

  const [ pauseStatus, setPauseStatus ] = useState({
    claimAirdrop: false
  })
  const [ paramStatus, setParamStatus ] = useState({
    admin: "",
    coordinator: "",
    airdropAmount: 0,
    airdropCooldown: 0
  })
  const [ updateAsset, setUpdateAsset ] = useState({
    address: "",
    balanceRequired: 0
  })

  useEffect(() => {
    const getEligibleTokens = async () => {
      const web3 = new Web3(connection.provider)
      const airdropAbs = await AirdropContract(web3)
      const assetCount = await airdropAbs.methods.assetCount().call()
      let eligibleTokens = []
      for(let i = 0; i < assetCount; i++) {
        let addr = await airdropAbs.methods.eligibleAssets(i).call()
        let symbol
        if(addr.toLowerCase() === FSN) {
          symbol = "FSN"
        } else {
          let tokenAbs = new web3.eth.Contract(ERC20, addr)
          symbol = await tokenAbs.methods.symbol().call()
        }
        let balanceRequired = web3.utils.fromWei(await airdropAbs.methods.balRequiredFor(addr).call())
        eligibleTokens.push({
          address: addr,
          symbol: symbol,
          bal: balanceRequired
        })
      }
      setEligibleTokens(eligibleTokens)
    }

    const refreshClaimable = async () => {
      const web3 = new Web3(connection.provider)
      const airdropAbs = await AirdropContract(web3)
      const claimable = web3.utils.fromWei(await airdropAbs.methods.getClaimable(connection.accounts[0]).call())
      setClaimable(claimable)
    }
    if(connection.connected) {
      getEligibleTokens()
      refreshClaimable()
    }
  }, [ connection, airdropMessage, updateAsset ])
  
  useEffect(() => {
    const checkForAdminOrGov = async () => {
      const web3 = new Web3(connection.provider)
      const airdropAbs = await AirdropContract(web3)

      const currentAdmin = (await airdropAbs.methods.admin().call()).toLowerCase()
      const currentGov = (await airdropAbs.methods.governance().call()).toLowerCase()
      const adminPresent = connection.accounts[0] === currentAdmin
      const govPresent = connection.accounts[0] === currentGov

      if(adminPresent) await refreshPaused(airdropAbs)
      if(govPresent) await refreshParams(web3, airdropAbs)

      setIsAdmin(adminPresent)
      setIsGov(govPresent)
    }
    if(connection.connected) {
      checkForAdminOrGov()
    }
  }, [ connection ])

  const displayTokens = () => {
    return eligibleTokens.map(token => {
      return (
        <Tr key={token.symbol}>
          <Td>
            {token.symbol}
          </Td>
          <Td>
            {token.bal}
          </Td>
        </Tr>
      )
    })
  }

  const claimAirdrop = async () => {
    const web3 = new Web3(connection.provider)
    const airdropAbs = await AirdropContract(web3)
    const faucetAbs = await FaucetContract(web3)

    const isPaused = await airdropAbs.methods.isPaused("claimAirdrop").call()
    if(isPaused) {
      setAirdropMessage("Airdrop feature is currently paused.")
      return
    }

    const isSubscribed = await faucetAbs.methods.isSubscribed(connection.accounts[0]).call()
    if(!isSubscribed) {
      setAirdropMessage("This address is not subscribed")
      return
    }

    const notClaimed = web3.utils.fromWei(await airdropAbs.methods.getClaimable(connection.accounts[0]).call())
    if(notClaimed === "0") {
      setAirdropMessage("No FREE airdrop to be claimed.")
      return
    }

    try {
      await airdropAbs.methods.claimAirdrop().send({from: connection.accounts[0]})
      setAirdropMessage(SUCCESS)
    } catch(err) {
      console.log(err.message)
    }
  }

  const refreshPaused = async airdropAbs => {
    let newPauseStatus = {}
    newPauseStatus.claimAirdrop = await airdropAbs.methods.isPaused("claimAirdrop").call()

    setPauseStatus(newPauseStatus)
  }

  const setPause = async () => {
    const web3 = new Web3(connection.provider)
    const airdropAbs = await AirdropContract(web3)
    let toPause = []
    let toUnpause = []

    for(let key in pauseStatus) {
      if(pauseStatus[key] && key === "claimAirdrop") toPause.push("claimAirdrop")
    }

    for(let key in pauseStatus) {
      if(!pauseStatus[key] && key === "claimAirdrop") toUnpause.push("claimAirdrop")
    }

    try {
      await airdropAbs.methods.setPause(true, toPause).send({from: connection.accounts[0]})
    } catch(err) {
      console.log(err.message)
    }

    try {
      await airdropAbs.methods.setPause(false, toUnpause).send({from: connection.accounts[0]})
    } catch(err) {
      console.log(err.message)
    }

    await refreshPaused(airdropAbs)
  }

  const refreshParams = async (web3, airdropAbs) => {
    let newParamStatus = {}
    newParamStatus.admin = (await airdropAbs.methods.admin().call()).toLowerCase()
    newParamStatus.coordinator = (await airdropAbs.methods.coordinator().call()).toLowerCase()
    newParamStatus.airdropAmount = web3.utils.fromWei(await airdropAbs.methods.airdropAmount().call())
    newParamStatus.airdropCooldown = (await airdropAbs.methods.airdropCooldown().call()).toString()

    setParamStatus(newParamStatus)
  }

  const setParams = async () => {
    const web3 = new Web3(connection.provider)
    const airdropAbs = await AirdropContract(web3)

    const {
      admin,
      coordinator,
      airdropAmount,
      airdropCooldown
    } = paramStatus

    try {
      await airdropAbs.methods.updateParams(
        admin,
        coordinator,
        web3.utils.toWei(String(airdropAmount), "ether"),
        String(airdropCooldown)
      ).send({from: connection.accounts[0]})
    } catch(err) {
      console.log(err.message)
    }

    await refreshParams(web3, airdropAbs)
  }

  const setAssets = async () => {
    const web3 = new Web3(connection.provider)
    const airdropAbs = await AirdropContract(web3)

    if(updateAsset.balanceRequired === "0") {
      setUpdateAssetMessage("Balance Required cannot be zero.")
      return
    }

    const {
      address,
      balanceRequired
    } = updateAsset

    try {
      await airdropAbs.methods.setAssets([address.toLowerCase()], [web3.utils.toWei(String(balanceRequired), "ether")]).send({from: connection.accounts[0]})
      setUpdateAssetMessage(SUCCESS)
    } catch(err) {
      console.log(err.message)
    }

    setUpdateAsset({address: "", balanceRequired: 0})
  }

  if(connection.connected) {
    return (
      <AirdropsContainer>
        <Title>
          Airdrop Receivers
        </Title>
        <Detail>
          Holders of these tokens will be able to claim a FREE airdrop once every day. The balances required to receive the airdrop are as follows:
        </Detail>
        <Table>
          <thead>
            <Tr title={true}>
              <Td>Token</Td>
              <Td>Balance/FREE</Td>
            </Tr>
          </thead>
          <tbody>
            {displayTokens()}
          </tbody>
        </Table>
        <Title>
          Claim Airdrop
        </Title>
        <Detail>
          Here you can claim FREE which was airdropped to you based on your token balances.
        </Detail>
        <Bar>
          <Display>
            {claimable}
          </Display>
          <Fill onClick={() => claimAirdrop()}>
            <FaParachuteBox size="30"/>
          </Fill>
        </Bar>
        <Message>
          {airdropMessage}
        </Message>
        <AdminGov show={isAdmin}>
          <Title>
            Pause / Unpause
          </Title>
          <Detail>
            Pause or unpause specific contract functionality. Only accessible to admin address.
          </Detail>
          <Options>
            <Selection>
              <Checkbox type="checkbox" checked={pauseStatus.claimAirdrop} onChange={e => setPauseStatus(prevState => ({...prevState, claimAirdrop: e.target.checked}))}/>
              Claim Airdrop
            </Selection>
            <Extras onClick={() => setPause()}>
              Update
            </Extras>
          </Options>
        </AdminGov>
        <AdminGov show={isGov}>
          <Title>
            Update Faucet Settings
          </Title>
          <Detail>
            Update settings which determine how the airdrops operate. Only accessible to governance address.
          </Detail>
          <Bar>
            <Input value={paramStatus.admin} placeholder="New Admin Address ..." spellCheck={false} onChange={e => setParamStatus(prevState => ({...prevState, admin: e.target.value}))}/>
          </Bar>
          <SubMessage>Admin</SubMessage>
          <Bar>
            <Input value={paramStatus.coordinator} placeholder="New Coordinator Address ..." spellCheck={false} onChange={e => setParamStatus(prevState => ({...prevState, coordinator: e.target.value}))}/>
          </Bar>
          <SubMessage>Coordinator</SubMessage>
          <Bar>
            <Input value={paramStatus.airdropAmount} placeholder="New Airdrop Amoun ..." spellCheck={false} onChange={e => setParamStatus(prevState => ({...prevState, airdropAmount: e.target.value}))}/>
          </Bar>
          <SubMessage>Airdrop Amount</SubMessage>
          <Bar>
            <Input value={paramStatus.airdropCooldown} placeholder="New Airdrop Cooldown ..." spellCheck={false} onChange={e => setParamStatus(prevState => ({...prevState, airdropCooldown: e.target.value}))}/>
          </Bar>
          <SubMessage>Airdrop Cooldown (sec)</SubMessage> 
          <Extras spaceAbove={true} onClick={() => setParams()}>
            Update
          </Extras>
          <Title>
            Add/Update Assets
          </Title>
          <Detail>
            Add new tokens which will award holders FREE airdrops, or update existing ones.
          </Detail>
          <Bar>
            <Input value={updateAsset.address} placeholder="Token Address ..." spellCheck={false} onChange={e => setUpdateAsset(prevState => ({...prevState, address: e.target.value}))}/>
          </Bar>
          <Bar>
            <Input value={updateAsset.balanceRequired} placeholder="Balance Required ..." spellCheck={false} onChange={e => setUpdateAsset(prevState => ({...prevState, balanceRequired: e.target.value}))}/>
          </Bar>
          <SubMessage>
            {updateAssetMessage}
          </SubMessage>
          <Extras spaceAbove={true} onClick={() => setAssets()}>
            Done
          </Extras>
        </AdminGov>
      </AirdropsContainer>
    )
  } else {
    return (
      <AirdropsContainer>
        <Detail>
          You must connect your MetaMask wallet to use this app.
        </Detail>
      </AirdropsContainer>
    )
  }
}