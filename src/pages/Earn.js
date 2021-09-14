import { useState, useEffect, useMemo } from "react"
import styled from "styled-components"
import Web3 from "web3"
import { AirdropContract, FaucetContract } from "../utils/contracts"
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


export default function Earn({ connection }) {

  const [ farmMint, setFarmMint ] = useState("farm")
  const [ farmingAssets, setFarmingAssets ] = useState([])
  const [ mintingAssets, setMintingAssets ] = useState([])

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
        {
          farmMint === "farm"
            ? <Farm connection={ connection } list={ farmingAssets } setList={ setFarmingAssets }/>
            : <Mint connection={ connection } list={ mintingAssets } setList={ setMintingAssets }/>
        }
      </Background>
    </EarnContainer>
  )
}
