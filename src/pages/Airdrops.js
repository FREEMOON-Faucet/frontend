import { useState, useEffect, useMemo } from "react"
import styled from "styled-components"
import Web3 from "web3"
import { FaParachuteBox } from "react-icons/fa"

import { AirdropContract, FaucetContract } from "../utils/contracts"

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
  margin-bottom: 40px;
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
  margin-bottom: 20px; 
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

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

  const airdropTokens = useMemo(() => [
    { address: "0xed0294dbd2a0e52a09c3f38a09f6e03de2c44fcf", symbol: "CHNG" },
    { address: "0x0c74199d22f732039e843366a236ff4f61986b32", symbol: "ANY" },
    { address: "0xe96ac326ecea1a09ae6e47487c5d8717f73d5a7e", symbol: "FSN/FUSE" },
    { address: "0xB80A6C4F2a279ec91921ca30da726c534462125C", symbol: "FMN" },
    { address: "0x35c2637312f69f425bba3bd01e63231091db818e", symbol: "FMN/FSN" },
    { address: "0xeaee692277d8efd28326204751a0b689efc2720d", symbol: "FMN/FREE" },
    { address: "0x223949f336a067629bc2e9aa6d8fc84d712c8174", symbol: "FMN/CHNG" },
    { address: "0x60add91ae0e79416e930972594ff48ae2f34a65f", symbol: "FREE/BTC" },
    { address: "0x6933eb3d600db893c19fece96acecb3b0ccf340a", symbol: "FREE/FSN" },
    { address: "0x4d37f8c6d1aad7b8d1dfd128da20059cb9dae2df", symbol: "FREE/CHNG" },
    { address: "0xd713b42a1695d5afe40eb8d203c285e0444b12e4", symbol: "FSN/BTC" },
    { address: "0x6a69b46e072a0c9fb8c7c08bd70aaedcc0211782", symbol: "FSN/ETH" },
    { address: "0x7ba62ccb1d4eb01096a55c097d770e71d6470ad4", symbol: "FSN/BNB" },
    { address: "0x3039737104055f2b3a9c1d0ecfac82e4c15f54ac", symbol: "FSN/TRX" },
    { address: "0x2331ce79654d01e3c64282d38c965924ee804b82", symbol: "FSN/HT" },
    { address: "0xb443d4fd37a5f58385d75ed942880fde7f23de2f", symbol: "FSN/MATIC" },
    { address: "0x656df9ad297c80e8233c39625a09a307e0835f1e", symbol: "FSN/FIL" },
    { address: "0x34ea7affd817743535bc828fff709e4702a15328", symbol: "FSN/OKT" },
    { address: "0x468d2a99bcc779fdb1f4b3b714a2757c35d6d744", symbol: "FSN/FREE"},
    { address: "0xe3d9cc62cd460c2dc54b4d009faf1d6c1006bc78", symbol: "ZNC/CHNG" },
    { address: "0x246611e844341c5d76e6c98713ce726cb8297164", symbol: "BAKE/CHNG" },
    { address: "0x97ec8323c09a2e810a68628904039bd7dfbe739e", symbol: "BAT/CHNG" },
    { address: "0x049DdC3CD20aC7a2F6C867680F7E21De70ACA9C3", symbol: "FSN/ANY" },
    { address: "0x31c2f8ffce91918e2256faa36f3dc5e609aee1e0", symbol: "FSN/FMN" },
    { address: "0x412a3fe4db6b5a73f7f460d10a009bec0c44b24c", symbol: "FSN/LTC" },
    
    // { address: "0xe4ae0ce599aec07026aa9d252ecc0e176bc753ba", symbol: "1INCH/CHNG" },
    // { address: "0x768a4ffb1a3e06c886765012c5fb2c803c47b78d", symbol: "BabyDoge/CHNG" },
    // { address: "0x5313c775820a8a64c8b4e6e68e27d3b58c7d679b", symbol: "CAKE/CHNG" },
    // { address: "0x4683e77330101ce269d9a2ebec9390ecfd9dc073", symbol: "UNI/CHNG" },
    // { address: "0x88566fca4f6419065cf97464bd541f6970e10446", symbol: "SUSHI/CHNG" },
    // { address: "0x5a82988fe9dac7df1a008146786fe4a5e0285c71", symbol: "SHIB/CHNG" },
    // { address: "0x3761ba5117bde1176718f395c857e04ee7273650", symbol: "PQC/CHNG" },
    // { address: "0x200e61db4784e38e854cc3dda4545a3d08903d80", symbol: "CHE/CHNG" },
    // { address: "0xc760893d167074244a9261d17d083f8f7435d456", symbol: "LINK/CHNG" },
  ], [])

  const AIRDROP_DEFAULT = "You can only claim once per day."
  const SUCCESS = "Success!"
  const UPDATE_ASSET_DEFAULT = "Enter the address of the token to add/update along with the balance required to receive FREE airdrops."
  const REMOVE_ASSET_DEFAULT = "Enter the address of the token to remove from FREE airdrop"

  const [ eligibleTokens, setEligibleTokens ] = useState([])
  const [ claimable, setClaimable ] = useState("0")

  const [ airdropMessage, setAirdropMessage ] = useState(AIRDROP_DEFAULT)
  const [ updateAssetMessage, setUpdateAssetMessage ] = useState(UPDATE_ASSET_DEFAULT)
  const [ removeAssetMessage, setRemoveAssetMessage ] = useState(REMOVE_ASSET_DEFAULT)

  const [ isAdmin, setIsAdmin ] = useState(false)
  const [ isGov, setIsGov ] = useState(false)

  const [ pauseStatus, setPauseStatus ] = useState({
    claimAirdrop: false
  })
  const [ paramStatus, setParamStatus ] = useState({
    admin: "",
    airdropAmount: 0,
    airdropCooldown: 0
  })
  const [ updateAsset, setUpdateAsset ] = useState({
    address: "",
    balanceRequired: 0
  })
  const [ removeAsset, setRemoveAsset ] = useState("")

  useEffect(() => {
    const getAirdropAssets = async () => {
      const web3 = new Web3(connection.provider)
      const airdropAbs = await AirdropContract(web3)
      const count = Number(await airdropAbs.methods.airdropAssetCount().call())
      let airdropAssets = []
      let balancesRequired = []

      for(let i = 0; i < count+20; i++) {
        let currentAddr = await airdropAbs.methods.airdropAssets(i).call()
        console.log(i)
        console.log(currentAddr)
      }

      const results = await Promise.allSettled(balancesRequired)

      for(let i = 0; i < airdropAssets.length; i++) {
        airdropAssets[i].bal = web3.utils.fromWei(results[i].value)
      }

      setEligibleTokens(airdropAssets)
    }

    const claimableFree = async (airdropAbs, web3) => {
      const count = Number(await airdropAbs.methods.airdropAssetCount().call())
      let total = 0
      for(let i = 0; i < count; i++) {
        let asset = await airdropAbs.methods.airdropAssets(i).call()
        let unclaimed = Number(web3.utils.fromWei(await airdropAbs.methods.getClaimable(connection.accounts[0], asset).call()))
        total += unclaimed
      }
      return String(total)
    }

    const refreshClaimable = async () => {
      const web3 = new Web3(connection.provider)
      const airdropAbs = await AirdropContract(web3)
      const unclaimed = await claimableFree(airdropAbs, web3)
      setClaimable(unclaimed)
    }
    if(connection.connected) {
      getAirdropAssets()
      refreshClaimable()
    }
  }, [ connection, airdropMessage, updateAsset, airdropTokens ])
  
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

  const connectUser = async () => {
    try {
      await connection.connect()
    } catch(err) {
      throw new Error(`Failed to connect: ${err.message}`)
    }
  }

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

  const claimableFree = async (airdropAbs, web3) => {
    const count = Number(await airdropAbs.methods.airdropAssetCount().call())
    let total = 0
    for(let i = 0; i < count; i++) {
      let asset = await airdropAbs.methods.airdropAssets(i).call()
      let unclaimed = Number(web3.utils.fromWei(await airdropAbs.methods.getClaimable(connection.accounts[0], asset).call()))
      total += unclaimed
    }
    return String(total)
  }

  const claimAirdrop = async () => {
    if(!connection.connected) {
      await connectUser()
      return
    }
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

    const notClaimed = await claimableFree(airdropAbs, web3)
    if(notClaimed === "0") {
      setAirdropMessage("No FREE airdrop to be claimed.")
      return
    }

    try {
      await airdropAbs.methods.claimAirdrop().send({from: connection.accounts[0], gas: 200000})
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
    if(!connection.connected) {
      await connectUser()
      return
    }
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
    newParamStatus.airdropAmount = web3.utils.fromWei(await airdropAbs.methods.airdropAmount().call())
    newParamStatus.airdropCooldown = (await airdropAbs.methods.airdropCooldown().call()).toString()

    setParamStatus(newParamStatus)
  }

  const setParams = async () => {
    if(!connection.connected) {
      await connectUser()
      return
    }
    const web3 = new Web3(connection.provider)
    const airdropAbs = await AirdropContract(web3)

    const {
      admin,
      airdropAmount,
      airdropCooldown
    } = paramStatus

    try {
      await airdropAbs.methods.updateParams(
        admin,
        web3.utils.toWei(String(airdropAmount), "ether"),
        String(airdropCooldown)
      ).send({from: connection.accounts[0]})
    } catch(err) {
      console.log(err.message)
    }

    await refreshParams(web3, airdropAbs)
  }

  const setAssets = async () => {
    if(!connection.connected) {
      await connectUser()
      return
    }
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

  const removeAssets = async () => {
    if(!connection.connected) {
      await connectUser()
      return
    }
    
    const web3 = new Web3(connection.provider)
    const airdropAbs = await AirdropContract(web3)

    if(!web3.utils.isAddress(removeAsset)) {
      setRemoveAssetMessage(`Enter a valid address.`)
      return
    }
    
    try {
      await airdropAbs.methods.removeAsset(removeAsset).send({from: connection.accounts[0]})
      setRemoveAssetMessage(SUCCESS)
    } catch(err) {
      setRemoveAssetMessage(`Failed to remove ${ removeAsset }.`)
      console.log(err.message)
    }
  }

  return (
    <AirdropsContainer>
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
        <Title>
          Remove Assets
        </Title>
        <Detail>
          Remove tokens from FREE airdrop list.
        </Detail>
        <Bar>
          <Input value={removeAsset.address} placeholder="Token Address ..." spellCheck={false} onChange={e => setRemoveAsset(e.target.value)}/>
        </Bar>
        <SubMessage>
          {removeAssetMessage}
        </SubMessage>
        <Extras spaceAbove={true} onClick={() => removeAssets()}>
          Done
        </Extras>
      </AdminGov>
    </AirdropsContainer>
  )
}