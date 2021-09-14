import { useState, useEffect } from "react"
import styled from "styled-components"
import BigNumber from "bignumber.js"
import Web3 from "web3"
import { AirdropContract, FaucetContract } from "../utils/contracts"

const MintContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 10px;
`

const MintList = styled.ul`
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
  width: 20%;
  font-size: 0.8rem;
  font-style: italic;
`

const Mintable = styled.li`
  display: flex;
  width: 100%;
  height: 100px;
  background: #fff;
`

const Symbol = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20%;
  height: 100%;
  font-size: 1.4rem;
`

const Rate = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20%;
  height: 100%;
  font-size: 1.2rem;
`

const Balance = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20%;
  height: 100%;
  font-size: 1.2rem;
`


export default function Mint({ connection, list, setList }) {

  const ONE_DAY = new BigNumber("86400")

  useEffect(() => {
    const loadMints = async () => {
      const web3 = new Web3(connection.provider)
      const airdrop = await AirdropContract(web3)
      const mintAssetCount = await airdrop.methods.mintingAssetCount().call()
      let pending = []
      for(let i = 0; i < mintAssetCount; i++) {
        pending.push(airdrop.methods.mintingAssets(i).call())
      }
      const mintAddresses = await Promise.all(pending)
      let symbolsPending = [], ratesPending = []
      for(let i = 0; i < mintAssetCount; i++) {
        symbolsPending.push(airdrop.methods.assetSymbol(mintAddresses[i]).call())
        ratesPending.push(airdrop.methods.mintRewardPerSec(mintAddresses[i]).call())
      }
      let symbols = await Promise.all(symbolsPending)
      let rates = await Promise.all(ratesPending)
      let mints = mintAddresses.map((addr, index) => {
        return {
          addr,
          symbol: symbols[index],
          rate: web3.utils.fromWei(rates[index])
        }
      })
      setList(mints)
    }

    if(connection.connected) loadMints()
  }, [ connection, setList ])
  
  return (
    <MintContainer>
      <MintList>
        <Banner>
          <BannerTitle>
            Mint
          </BannerTitle>
          <BannerTitle>
            Daily Rewards
          </BannerTitle>
          <BannerTitle>
            Total Locked
          </BannerTitle>
          <BannerTitle>
            Go to Mint
          </BannerTitle>
        </Banner>
        { list.map(mint => (
          <Mintable key={ mint.addr }>
            <Symbol>
              { mint.symbol }
            </Symbol>
            <Rate>
              { (ONE_DAY.multipliedBy(mint.rate)).toString() } FREE
            </Rate>
          </Mintable>
        )) }
      </MintList>
    </MintContainer>
  )
}