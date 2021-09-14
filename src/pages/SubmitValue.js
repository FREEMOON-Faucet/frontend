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
  margin: 35vh 35vw;
  width: 30vw;
  height: 30vh;
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

const Input = styled.input`
  `


export default function SubmitValue({ onClose, info }) {

  const overlay = useRef()
  const modal = useRef()

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
            { info.add ? "Add" : "Sub" }
          </Title>
          <Input/>
        </Popup>
      </Overlay>
    </SubmitValueContainer>,
    document.getElementById("submitValue")
  )
}