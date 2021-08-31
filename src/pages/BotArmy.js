import styled from "styled-components"

import ConnectGuide from "../guide/1_connect.png"
import SeedPhraseGuide from "../guide/2_seed_phrase.png"
import NumberGuide from "../guide/3_number.png"
import SubscribeGuide from "../guide/4_subscribe.png"
import ClaimGuide from "../guide/5_claim.png"

const BotArmyContainer = styled.div`
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

const Download = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  max-width: 500px;
  height: 100px;
  border: 2px solid #000;
  border-radius: 4px;
  font-size: 1.4rem;
  cursor: pointer;
`

const SubText = styled.div`
  width: 100%;
  font-size: 1rem;
  font-style: italic;
  text-align: center;
`

const StepHeading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  max-width: 500px;
  margin: 25px 0 10px;
  font-size: 1.2rem;
  font-weight: bold;
`

const StepDescription = styled.div`
  display: flex;
  justify-content: center;
  width: 80%;
  max-width: 700px;
  font-size: 1.2rem;
`

const A = styled.a`
  text-decoration: none;
  display: flex;
  justify-content: center;
  width: 80%;
  max-width: 500px;
  height: 100px;
  margin: 10px 0;
  color: #000;
`

const Img = styled.img`
  width: 80%;
  max-width: 500px;
  margin: 5px 0;
`

export default function BotArmy() {
  return (
    <BotArmyContainer>
      <Title>
        Bot Army App
      </Title>
      <Detail>
        Download the FREEMOON Faucet bot army Electron app to employ as many bots as you'd like to automatically claim FREE every hour.
      </Detail>
      <A href="../downloads/FREEMOON_Win.exe" download="FREEMOON_Win.exe">
        <Download>
          Windows
          <SubText>
            .exe
          </SubText>
        </Download>
      </A>
      <A href="../downloads/FREEMOON_Max.dmg" download="FREEMOON_Mac.dmg">
        <Download>
          Mac OS
          <SubText>
            .dmg
          </SubText>
        </Download>
      </A>
      <A href="../downloads/FREEMOON_Lin.AppImage" download="FREEMOON_Lin.AppImage">
        <Download>
          Linux
          <SubText>
            .AppImage
          </SubText>
        </Download>
      </A>
      <Title>
        Bot Set Up
      </Title>
      <Detail>
        Once you have downloaded and opened the app, the set up process is as follows:
      </Detail>
      <StepHeading>
        1. Connect to Fusion
      </StepHeading>
      <StepDescription>
        Enter the gateway URL to connect to Fusion. The default is FREEMOON Faucet's Fusion mainnet gateway,
        but if you wish to use another please keep in mind it will only work for Fusion mainnet or Fusion testnet.
      </StepDescription>
      <Img src={ ConnectGuide }/>
      <StepHeading>
        2. Enter a Seed Phrase
      </StepHeading>
      <StepDescription>
        Enter a 12-word seed phrase. It is best practice to create a new seed phrase for your bot army. Hit "Generate New Wallet"
        to create a new seed phrase. It is crucial to write this down, as it is impossible to recover. If you are generating a new
        seed phrase, a public/private key pair will appear. Use this private key to import your account to MetaMask.
      </StepDescription>
      <Img src={ SeedPhraseGuide }/>
      <StepHeading>
        3. Choose Number of Bots
      </StepHeading>
      <StepDescription>
        Choose a number of bots to use.
      </StepDescription>
      <Img src={ NumberGuide }/>
      <StepHeading>
        4. Send FSN to Base Address
      </StepHeading>
      <StepDescription>
        In order to fund the subscriptions and gas, send FSN to the base address. This is the address which pays for all gas,
        will receive all FREE
        claimed, and FMN won.
      </StepDescription>
      <StepHeading>
        5. Subscribe Bots
      </StepHeading>
      <StepDescription>
        Subscribe all the bots chosen in step 3. Only the unsubscribed bots will be subscribed here, so if you return later
        you don't need to re-subscribe.
      </StepDescription>
      <Img src={ SubscribeGuide }/>
      <StepHeading>
        6. Start Claiming FREE
      </StepHeading>
      <StepDescription>
        Once you have the number of bots you chose all subscribed, you can press play to start claiming FREE every hour. 
        Pressing stop will stop the claiming process.
      </StepDescription>
      <Img src={ ClaimGuide }/>
    </BotArmyContainer>
  )
}
