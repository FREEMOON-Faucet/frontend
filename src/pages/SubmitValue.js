import { useState, useEffect, useRef } from "react"
import reactDOM from "react-dom"
import styled from "styled-components";

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
  margin: 40vh 35vw;
  width: 30vw;
  height: 20vh;
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
  text-align: left;
  line-height: 20px;
  font-size: 0.8rem;
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


export default function SubmitValue({ onClose, submission }) {

  const overlay = useRef()
  const modal = useRef()

  const [ val, setVal ] = useState("")

  useEffect(() => {
    const exitModal = e => {
      if(overlay.current.contains(e.target)
      && !modal.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", exitModal)
    return () => {
      document.removeEventListener("mousedown", exitModal)
    }
  }, [ onClose ])

  return reactDOM.createPortal(
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

          { submission.msg ? <Message>{ submission.msg }</Message> : "" }

          <ButtonRow>
            <Button onClick={ onClose }>
              Cancel
            </Button>
            <Button onClick={ () => val > 0 ? submission.confirm(String(val), submission.extra) && onClose() : "" }>
              { submission.action }
            </Button>
          </ButtonRow>
        </Popup>
      </Overlay>
    </SubmitValueContainer>,
    document.getElementById("submitValue")
  )
}