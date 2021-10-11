import { useState, useEffect, useRef } from "react"
import reactDOM from "react-dom"
import styled from "styled-components"
import Web3 from "web3"
import BigNumber from "bignumber.js"
import { AirdropContract } from "../utils/contracts"

const SubmitValueContainer = styled.div`

`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`

const Popup = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin: ${ props => props.inputtable ? "20vh 35vw" : "37.5vh 35vw" };
  width: 30vw;
  height: ${ props => props.inputtable ? "60vh" : "25vh" };
  border-radius: 0.5rem;
  background: #fff;
  z-index: 1000;
`

const Title = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
  font-size: 1.4rem;
  font-weight: bold;
`

const InputRow = styled.div`
  display: flex;
  width: 90%;
  justify-content: space-between;
  align-items: center;
`

const Input = styled.input`
  width: 70%;
  height: 50px;
  margin: 0;
  padding: 0;
  text-align: center;
  font-size: 1.8rem;
  font-family: monospace;
  border: 1px solid #000;
  border-radius: 5px;
  outline: 0;
`

const Max = styled.div`
  width: 20%;
  height: 50px;
  text-align: center;
  line-height: 50px;
  font-size: 1rem;
  border-radius: 5px;
  background: #ddd;
  cursor: pointer;
`

const Message = styled.div`
  width: 90%;
  height: 20px;
  text-align: ${ props => props.inputtable ? "left" : "center" };
  line-height: 20px;
  font-size: ${ props => props.inputtable ? "0.8rem" : "1rem" };
  font-weight: bold;
`

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  height: 80px;
`

const Button = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48%;
  height: 60px;
  font-size: 1.2rem;
  border-radius: 5px;
  background: #92b4e3;
  cursor: pointer;
`


export default function SubmitValue({ onClose, submission, provider }) {
<<<<<<< HEAD

  const TEN = new BigNumber("10")
  const WEI = TEN.exponentiatedBy("18")
=======
>>>>>>> cb420ba93dbc0a9b43282824f4991696f9d0f7e7

  const overlay = useRef()
  const modal = useRef()

  const [ val, setVal ] = useState("0")
  const [ cost, setCost ] = useState("0")

  useEffect(() => {
    const exitModal = e => {
      if(overlay.current.contains(e.target) && !modal.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", exitModal)
    return () => {
      document.removeEventListener("mousedown", exitModal)
    }
  }, [ onClose ])

  useEffect(() => {
<<<<<<< HEAD
    const calc = async () => {
      const web3 = new Web3(provider)
      const airdrop = await AirdropContract(web3)
=======
    const connect = async () => {
      const web3 = new Web3(provider)
      const airdrop = await AirdropContract(web3)
      return { web3, airdrop }
    }
    const calcDynamic = async () => {
      const { web3, airdrop } = await connect()
>>>>>>> cb420ba93dbc0a9b43282824f4991696f9d0f7e7
      const valWei = web3.utils.toWei(String(val), "ether")
      const fmnCost = new BigNumber(web3.utils.fromWei(await airdrop.methods.freeToFmn(valWei).call()))
      const converted = fmnCost.multipliedBy(submission.extra.rate).toFixed()
      setCost(converted)
    }
<<<<<<< HEAD
    if(val > 0) calc()
    else setCost("0")
  }, [ val, provider, submission.extra.rate ])

  return reactDOM.createPortal(
=======
    const calcFixed = async () => {
      const { web3, airdrop } = await connect()
      const maxWei = web3.utils.toWei(submission.max, "ether")
      const fmnCost = new BigNumber(web3.utils.fromWei(await airdrop.methods.freeToFmn(maxWei).call()))
      const converted = fmnCost.multipliedBy(submission.extra.rate).toFixed()
      setCost(converted)
    }
    if(val > 0 && submission.action.slice(0, 4) === "Lock") calcDynamic()
    else if(submission.action.slice(0, 6) === "Unlock") calcFixed()
    else setCost("0")
  }, [ val, provider, submission.extra.rate, submission.action, submission.max ])

  if(submission.action.slice(0, 6) !== "Unlock") return reactDOM.createPortal(
>>>>>>> cb420ba93dbc0a9b43282824f4991696f9d0f7e7
    <SubmitValueContainer>
      <Overlay ref={ overlay }>
        <Popup ref={ modal }>
          <Title>
            Enter Amount
          </Title>
          <InputRow>
            <Input type="number" min="0" max={ submission.max } value={ val } onChange={ e => setVal(e.target.value) }/>
            <Max onClick={ () => setVal(submission.max) }>
              Max
            </Max>
          </InputRow>

<<<<<<< HEAD
          { Number(cost) > 0 ? <Message>Unlock Fee: { cost } FMN</Message> : "" }
=======
          { Number(cost) > 0 ? <Message inputtable={ true }>Unlock Fee: { cost } FMN</Message> : "" }
>>>>>>> cb420ba93dbc0a9b43282824f4991696f9d0f7e7

          <ButtonRow>
            <Button onClick={ onClose }>
              Cancel
            </Button>
            <Button onClick={ () => val > 0 ? submission.confirm(String(val), submission.extra, submission.index) && onClose() : "" }>
              { submission.action }
            </Button>
          </ButtonRow>
        </Popup>
      </Overlay>
    </SubmitValueContainer>,
    document.getElementById("submitValue")
  )
  else return reactDOM.createPortal(
    <SubmitValueContainer>
      <Overlay ref={ overlay }>
        <Popup ref={ modal } inputtable={ submission.action.slice(0, 6) !== "Unlock" }>
          <Title>
            Unlock All
          </Title>
          { Number(cost) > 0 ? <Message>Unlock Fee: { cost } FMN</Message> : "" }
          <ButtonRow>
            <Button onClick={ onClose }>
              Cancel
            </Button>
            <Button onClick={ () => submission.confirm(String(val), submission.extra, submission.index) && onClose() }>
              { submission.action }
            </Button>
          </ButtonRow>
        </Popup>
      </Overlay>
    </SubmitValueContainer>,
    document.getElementById("submitValue")
  )
}