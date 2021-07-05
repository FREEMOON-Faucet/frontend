import { useState, useEffect } from "react"
import styled from "styled-components"
import { RiWallet3Fill } from "react-icons/ri"

const FreemoonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const Title = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 40px;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
`

const Detail = styled.p`
  display: flex;
  justify-content: center;
  width: 70%;
  margin: 20px 0;
  font-size: 1.2rem;
  text-align: center;
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
    width: 80%;
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


export default function Freemoon({ provider }) {

  return (
    <FreemoonContainer>
      <Title>FREEMOON Faucet</Title>
      <Detail>
        Here you can subscribe addresses to the FREEMOON Faucet. Subscribing an address allows it to enter the FREEMOON lottery once every hour.
        Doing so will send the subscribed address 1 FREE.
      </Detail>
      <Bar>
        <Input placeholder="Address to subscribe ..."></Input>
        <Fill>
          <RiWallet3Fill size="40"/>
        </Fill>
      </Bar>
      <Detail>
        
      </Detail>
    </FreemoonContainer>
  )
}